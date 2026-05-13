import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file manually (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const eqIndex = line.indexOf('=');
        if (eqIndex > 0) {
          const key = line.substring(0, eqIndex).trim();
          const value = line.substring(eqIndex + 1).trim();
          process.env[key] = value;
        }
      }
    });
  }
} catch (err) {
  console.warn('Failed to load .env file:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'travel-guide-secret-key-change-in-production';

// QQ OAuth 配置
const QQ_CONFIG = {
  appId: process.env.QQ_APP_ID || '',
  appKey: process.env.QQ_APP_KEY || '',
  callbackURL: process.env.QQ_CALLBACK_URL || 'http://study.roamhong.site/api/auth/qq/callback',
};

console.log('QQ Config loaded:', { appId: QQ_CONFIG.appId ? '***' + QQ_CONFIG.appId.slice(-4) : 'not set', callbackURL: QQ_CONFIG.callbackURL });

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database('./travel.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    avatar TEXT,
    qq_openid TEXT UNIQUE,
    qq_nickname TEXT,
    qq_avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    city_id TEXT NOT NULL,
    trip_date TEXT NOT NULL,
    ai_guide_url TEXT,
    feedback TEXT,
    top_recommendation TEXT,
    is_visited INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, city_id)
  );

  CREATE TABLE IF NOT EXISTS trip_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    photo_type TEXT NOT NULL CHECK(photo_type IN ('scenery', 'group')),
    photo_url TEXT NOT NULL,
    caption TEXT,
    visibility TEXT DEFAULT 'private' CHECK(visibility IN ('public', 'private')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES user_trips(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON user_trips(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_trips_city_id ON user_trips(city_id);
  CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos(trip_id);
  CREATE INDEX IF NOT EXISTS idx_trip_photos_user_id ON trip_photos(user_id);
`);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: '登录已过期' });
  }
};

// ==================== Auth Routes ====================

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度为2-20个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, passwordHash);

    const user = db.prepare('SELECT id, username, created_at FROM users WHERE username = ?').get(username);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: '用户名已存在' });
    }
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    user: { id: user.id, username: user.username, avatar: user.avatar, created_at: user.created_at },
    token
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, avatar, created_at, qq_openid, qq_nickname, qq_avatar FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ user });
});

// ==================== QQ OAuth Routes ====================

// Step 1: Redirect to QQ authorization page
app.get('/api/auth/qq', (req, res) => {
  if (!QQ_CONFIG.appId || !QQ_CONFIG.appKey) {
    return res.status(500).json({ error: 'QQ 登录未配置，请联系管理员' });
  }

  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_CONFIG.appId}&redirect_uri=${encodeURIComponent(QQ_CONFIG.callbackURL)}&state=${state}&scope=get_user_info`;

  res.json({ authUrl, state });
});

// Step 2: Handle QQ callback
app.get('/api/auth/qq/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/?error=qq_auth_failed');
  }

  try {
    // Exchange code for access_token
    const tokenResponse = await axios.get('https://graph.qq.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: QQ_CONFIG.appId,
        client_secret: QQ_CONFIG.appKey,
        code,
        redirect_uri: QQ_CONFIG.callbackURL,
        fmt: 'json',
      },
    });

    const { access_token, openid } = tokenResponse.data;

    if (!access_token || !openid) {
      return res.redirect('/?error=qq_auth_failed');
    }

    // Get user info from QQ
    const userInfoResponse = await axios.get('https://graph.qq.com/user/get_user_info', {
      params: {
        access_token,
        openid,
        oauth_consumer_key: QQ_CONFIG.appId,
      },
    });

    const userInfo = userInfoResponse.data;

    if (userInfo.ret !== 0) {
      return res.redirect('/?error=qq_auth_failed');
    }

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE qq_openid = ?').get(openid);

    if (!user) {
      // Create new user
      const username = `qq_${userInfo.nickname.substring(0, 20)}`;
      const avatar = userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '';

      try {
        const stmt = db.prepare(
          'INSERT INTO users (username, qq_openid, qq_nickname, qq_avatar, avatar) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(username, openid, userInfo.nickname, avatar, avatar);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          // Username already exists, try with a unique suffix
          const uniqueUsername = `qq_${openid.substring(0, 10)}`;
          const avatar = userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '';
          const stmt = db.prepare(
            'INSERT INTO users (username, qq_openid, qq_nickname, qq_avatar, avatar) VALUES (?, ?, ?, ?, ?)'
          );
          const result = stmt.run(uniqueUsername, openid, userInfo.nickname, avatar, avatar);
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        } else {
          throw err;
        }
      }
    } else {
      // Update user info
      db.prepare(
        'UPDATE users SET qq_nickname = ?, qq_avatar = ?, avatar = ? WHERE id = ?'
      ).run(userInfo.nickname, userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '', userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '', user.id);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    // Redirect to frontend with token
    res.redirect(`/?qq_token=${token}&qq_nickname=${encodeURIComponent(userInfo.nickname)}`);
  } catch (err) {
    console.error('QQ auth error:', err);
    res.redirect('/?error=qq_auth_failed');
  }
});

// Bind QQ to existing account
app.post('/api/auth/qq/bind', authenticateToken, async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResponse = await axios.get('https://graph.qq.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: QQ_CONFIG.appId,
        client_secret: QQ_CONFIG.appKey,
        code,
        redirect_uri: QQ_CONFIG.callbackURL,
        fmt: 'json',
      },
    });

    const { access_token, openid } = tokenResponse.data;

    if (!access_token || !openid) {
      return res.status(400).json({ error: '获取 QQ 授权失败' });
    }

    const userInfoResponse = await axios.get('https://graph.qq.com/user/get_user_info', {
      params: {
        access_token,
        openid,
        oauth_consumer_key: QQ_CONFIG.appId,
      },
    });

    const userInfo = userInfoResponse.data;

    if (userInfo.ret !== 0) {
      return res.status(400).json({ error: '获取 QQ 用户信息失败' });
    }

    // Check if this QQ account is already bound
    const existingUser = db.prepare('SELECT id FROM users WHERE qq_openid = ? AND id != ?').get(openid, req.user.id);
    if (existingUser) {
      return res.status(400).json({ error: '该 QQ 账号已绑定其他账号' });
    }

    // Bind QQ to current account
    db.prepare(
      'UPDATE users SET qq_openid = ?, qq_nickname = ?, qq_avatar = ?, avatar = COALESCE(?, avatar) WHERE id = ?'
    ).run(openid, userInfo.nickname, userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '', userInfo.figureurl_qq_2 || userInfo.figureurl_2 || '', req.user.id);

    res.json({ success: true, message: '绑定成功' });
  } catch (err) {
    console.error('QQ bind error:', err);
    res.status(500).json({ error: '绑定失败' });
  }
});

// ==================== Trip Routes ====================

app.get('/api/trips', authenticateToken, (req, res) => {
  const trips = db.prepare(`
    SELECT t.*, COUNT(p.id) as photo_count
    FROM user_trips t
    LEFT JOIN trip_photos p ON t.id = p.trip_id
    WHERE t.user_id = ?
    ORDER BY t.trip_date DESC
  `).all(req.user.id);

  res.json({ trips });
});

app.post('/api/trips', authenticateToken, (req, res) => {
  const { city_id, trip_date, ai_guide_url } = req.body;

  if (!city_id || !trip_date) {
    return res.status(400).json({ error: '城市ID和旅游日期不能为空' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO user_trips (user_id, city_id, trip_date, ai_guide_url, is_visited)
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(user_id, city_id) DO UPDATE SET
        trip_date = excluded.trip_date,
        ai_guide_url = excluded.ai_guide_url,
        is_visited = 1,
        updated_at = CURRENT_TIMESTAMP
    `);

    const result = stmt.run(req.user.id, city_id, trip_date, ai_guide_url || null);

    // Get the updated trip
    const trip = db.prepare('SELECT * FROM user_trips WHERE id = ?').get(result.lastInsertRowid || result.changes > 0 ? db.prepare('SELECT id FROM user_trips WHERE user_id = ? AND city_id = ?').get(req.user.id, city_id).id : 0);

    res.json({ trip });
  } catch (err) {
    console.error('Trip create error:', err);
    res.status(500).json({ error: '打卡失败' });
  }
});

app.get('/api/trips/:cityId', authenticateToken, (req, res) => {
  const trip = db.prepare('SELECT * FROM user_trips WHERE user_id = ? AND city_id = ?').get(req.user.id, req.params.cityId);

  if (!trip) {
    return res.json({ trip: null });
  }

  // Get photos for this trip - owner sees all photos
  const photos = db.prepare(`
    SELECT * FROM trip_photos WHERE trip_id = ?
    ORDER BY created_at DESC
  `).all(trip.id);

  res.json({ trip, photos });
});

app.put('/api/trips/:cityId', authenticateToken, (req, res) => {
  const { feedback, top_recommendation, ai_guide_url } = req.body;

  const trip = db.prepare('SELECT * FROM user_trips WHERE user_id = ? AND city_id = ?').get(req.user.id, req.params.cityId);
  if (!trip) {
    return res.status(404).json({ error: '旅游记录不存在' });
  }

  db.prepare(`
    UPDATE user_trips
    SET feedback = COALESCE(?, feedback),
        top_recommendation = COALESCE(?, top_recommendation),
        ai_guide_url = COALESCE(?, ai_guide_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(feedback, top_recommendation, ai_guide_url, trip.id);

  const updatedTrip = db.prepare('SELECT * FROM user_trips WHERE id = ?').get(trip.id);
  res.json({ trip: updatedTrip });
});

app.delete('/api/trips/:cityId', authenticateToken, (req, res) => {
  const trip = db.prepare('SELECT * FROM user_trips WHERE user_id = ? AND city_id = ?').get(req.user.id, req.params.cityId);
  if (!trip) {
    return res.status(404).json({ error: '旅游记录不存在' });
  }

  // Delete photos first
  db.prepare('DELETE FROM trip_photos WHERE trip_id = ?').run(trip.id);
  db.prepare('DELETE FROM user_trips WHERE id = ?').run(trip.id);

  res.json({ success: true });
});

// ==================== Photo Routes ====================

app.post('/api/photos', authenticateToken, (req, res) => {
  const { trip_id, photo_type, photo_url, caption, visibility } = req.body;

  if (!trip_id || !photo_type || !photo_url) {
    return res.status(400).json({ error: '必要参数不能为空' });
  }

  // Verify trip ownership
  const trip = db.prepare('SELECT * FROM user_trips WHERE id = ? AND user_id = ?').get(trip_id, req.user.id);
  if (!trip) {
    return res.status(403).json({ error: '无权操作' });
  }

  // Group photos default to private
  const finalVisibility = photo_type === 'group' ? (visibility || 'private') : (visibility || 'public');

  const stmt = db.prepare(`
    INSERT INTO trip_photos (trip_id, user_id, photo_type, photo_url, caption, visibility)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(trip_id, req.user.id, photo_type, photo_url, caption || null, finalVisibility);
  const photo = db.prepare('SELECT * FROM trip_photos WHERE id = ?').get(result.lastInsertRowid);

  res.json({ photo });
});

app.get('/api/trips/:tripId/photos', authenticateToken, (req, res) => {
  const trip = db.prepare('SELECT * FROM user_trips WHERE id = ?').get(parseInt(req.params.tripId));
  if (!trip) {
    return res.status(404).json({ error: '旅游记录不存在' });
  }

  // Only owner can see group photos, others can see scenery photos
  const isOwner = trip.user_id === req.user.id;

  const photos = db.prepare(`
    SELECT * FROM trip_photos
    WHERE trip_id = ? AND (photo_type = 'scenery' OR (photo_type = 'group' AND user_id = ?))
    ORDER BY created_at DESC
  `).all(trip.id, req.user.id);

  res.json({ photos });
});

app.delete('/api/photos/:photoId', authenticateToken, (req, res) => {
  const photo = db.prepare('SELECT * FROM trip_photos WHERE id = ? AND user_id = ?').get(req.params.photoId, req.user.id);
  if (!photo) {
    return res.status(404).json({ error: '照片不存在或无权删除' });
  }

  db.prepare('DELETE FROM trip_photos WHERE id = ?').run(photo.id);
  res.json({ success: true });
});

// ==================== Public Routes ====================

// Get public trip records for a city (text only, no private photos)
app.get('/api/cities/:cityId/trips', (req, res) => {
  // Get all trips for this city (across all users)
  const trips = db.prepare(`
    SELECT t.*, u.username, u.avatar
    FROM user_trips t
    JOIN users u ON t.user_id = u.id
    WHERE t.city_id = ? AND t.is_visited = 1
    ORDER BY t.trip_date DESC
  `).all(req.params.cityId);

  // Get public photos for each trip (only scenery photos, no group photos for non-owners)
  const tripsWithPhotos = trips.map(trip => {
    const photos = db.prepare(`
      SELECT id, trip_id, photo_type, photo_url, caption, visibility, created_at
      FROM trip_photos
      WHERE trip_id = ? AND photo_type = 'scenery'
      ORDER BY created_at DESC
    `).all(trip.id);

    return {
      ...trip,
      photos,
      // Remove sensitive data
      ai_guide_url: trip.ai_guide_url,
      feedback: trip.feedback,
      top_recommendation: trip.top_recommendation
    };
  });

  res.json({ trips: tripsWithPhotos });
});

// Get visit count for a city (across all users)
app.get('/api/cities/:cityId/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT COUNT(*) as visit_count, COUNT(DISTINCT user_id) as unique_visitors
    FROM user_trips WHERE city_id = ? AND is_visited = 1
  `).get(req.params.cityId);

  res.json({ stats: stats || { visit_count: 0, unique_visitors: 0 } });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Travel Guide API running on http://localhost:${PORT}`);
  console.log(`Database: ./travel.db`);
});
