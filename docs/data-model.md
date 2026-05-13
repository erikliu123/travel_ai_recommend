# 旅游打卡功能 - 数据模型设计

## 数据库表结构 (SQLite)

### 1. users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,  -- 头像 URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. user_trips 表（用户旅游记录）
```sql
CREATE TABLE user_trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  city_id TEXT NOT NULL,  -- 对应 cities.ts 中的城市 ID
  trip_date TEXT NOT NULL,  -- 旅游日期 YYYY-MM-DD
  ai_guide_url TEXT,  -- AI 攻略链接
  feedback TEXT,  -- 旅游反馈/心得
  top_recommendation TEXT,  -- 最推荐的内容
  is_visited INTEGER DEFAULT 1,  -- 1=已旅游
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, city_id)  -- 每个城市只记录一次
);
```

### 3. trip_photos 表（旅游照片）
```sql
CREATE TABLE trip_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  photo_type TEXT NOT NULL CHECK(photo_type IN ('scenery', 'group')),  -- scenery=经典风景, group=合照
  photo_url TEXT NOT NULL,  -- Supabase Storage URL
  caption TEXT,  -- 照片描述
  visibility TEXT DEFAULT 'private' CHECK(visibility IN ('public', 'private')),  -- public=所有人可见, private=仅本人
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES user_trips(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API 接口设计

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 退出登录

### 旅游记录
- `GET /api/trips` - 获取当前用户的所有旅游记录
- `POST /api/trips` - 添加/更新旅游记录（打卡）
- `GET /api/trips/:cityId` - 获取某个城市的旅游记录
- `PUT /api/trips/:cityId` - 更新旅游记录（添加反馈、攻略链接）
- `DELETE /api/trips/:cityId` - 删除旅游记录

### 照片
- `POST /api/photos/upload-url` - 获取 Supabase 直传 URL
- `POST /api/photos` - 保存照片记录
- `GET /api/trips/:tripId/photos` - 获取照片列表（根据权限过滤）
- `DELETE /api/photos/:photoId` - 删除照片

### 公开接口
- `GET /api/cities/:cityId/visitors` - 获取某个城市的访问统计（匿名用户数）
- `GET /api/users/:userId/trips` - 获取某用户的公开旅游记录

## 前端组件设计

### 新增组件
1. **AuthModal** - 登录/注册弹窗
2. **TripCheckIn** - 打卡组件（标记已旅游 + 填写信息）
3. **TripFeedback** - 反馈表单（反馈 + 最推荐 + 照片上传）
4. **PhotoUploader** - 照片上传组件
5. **PhotoGallery** - 照片展示（权限控制）
6. **UserBadge** - 用户徽章（已旅游标记）
7. **TripTimeline** - 旅游时间线

### 修改组件
1. **CityCard** - 添加已旅游标记 badge
2. **CityModal** - 添加打卡入口、反馈展示、照片展示
3. **App.tsx** - 添加用户状态管理

## 权限控制逻辑

### 照片可见性
- **经典风景图 (scenery)**: 默认 public，所有人可见
- **合照 (group)**: 默认 private，仅本人可见
  - 用户登录后可查看自己的合照
  - 用户可选择将合照设为 public

### API 权限中间件
```javascript
// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  // 验证 token...
};

// 权限检查
const checkPhotoPermission = (req, res, next) => {
  // 合照只有所有者或管理员可查看
};
```

## Supabase Storage 配置

### Bucket 结构
```
travel-photos/
├── scenery/
│   ├── {user_id}/
│   │   └── {trip_id}/
│   │       └── photo1.jpg
├── group/
│   ├── {user_id}/
│   │   └── {trip_id}/
│   │       └── photo1.jpg
```

### 上传流程
1. 前端调用 `POST /api/photos/upload-url` 获取预签名 URL
2. 前端直接 PUT 上传到 Supabase Storage
3. 前端调用 `POST /api/photos` 保存照片元数据
