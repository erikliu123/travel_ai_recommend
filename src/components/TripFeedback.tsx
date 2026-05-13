import { useState } from 'react';
import { MessageSquare, Star, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Trip, TripPhoto } from '@/types';

interface TripFeedbackProps {
  trip: Trip;
  cityName: string;
  onUpdate: (trip: Trip) => void;
  onClose: () => void;
}

export default function TripFeedback({ trip, cityName, onUpdate, onClose }: TripFeedbackProps) {
  const [feedback, setFeedback] = useState(trip.feedback || '');
  const [topRecommendation, setTopRecommendation] = useState(trip.top_recommendation || '');
  const [photoType, setPhotoType] = useState<'scenery' | 'group'>('scenery');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [error, setError] = useState('');

  const handleSaveFeedback = async () => {
    setSaving(true);
    setError('');
    try {
      const { trip: updated } = await api.updateTrip(trip.city_id, {
        feedback: feedback || undefined,
        top_recommendation: topRecommendation || undefined,
      });
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // For now, convert to base64 and store directly (simplified approach)
      // In production, use Supabase Storage presigned URLs
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Store photo metadata (in production, upload to Supabase first)
        const { photo } = await api.addPhoto(
          trip.id,
          photoType,
          base64, // base64 for now
          caption || undefined,
          photoType === 'scenery' ? 'public' : 'private'
        );
        setPhotos((prev) => [photo, ...prev]);
        setCaption('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-background w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] overflow-y-auto modal-shadow" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted smooth-transition">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <h2 className="text-xl font-bold font-serif">{cityName} - 旅游反馈</h2>
          <p className="text-sm text-muted-foreground mt-1">分享你的旅行体验</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {/* Top recommendation */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              最推荐什么？
            </label>
            <input
              type="text"
              value={topRecommendation}
              onChange={(e) => setTopRecommendation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
              placeholder="例如：瘦西湖、东关街、扬州炒饭..."
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MessageSquare className="w-4 h-4" />
              旅游心得/反馈
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition resize-none"
              rows={4}
              placeholder="分享你的旅行体验、建议和小贴士..."
            />
          </div>

          <button
            onClick={handleSaveFeedback}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 smooth-transition disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存反馈'}
          </button>

          {/* Photo upload */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold font-serif mb-4">上传照片</h3>

            {/* Photo type selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPhotoType('scenery')}
                className={`px-4 py-2 rounded-full text-sm font-medium smooth-transition ${
                  photoType === 'scenery'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                经典风景
              </button>
              <button
                onClick={() => setPhotoType('group')}
                className={`px-4 py-2 rounded-full text-sm font-medium smooth-transition ${
                  photoType === 'group'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                合照（仅自己可见）
              </button>
            </div>

            {/* Upload button */}
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted smooth-transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">选择照片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && <span className="text-sm text-muted-foreground">上传中...</span>}
            </div>

            {/* Caption input */}
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring smooth-transition mb-4"
              placeholder="照片描述（可选）"
            />

            {/* Photo grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={photo.photo_url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 smooth-transition">
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 smooth-transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {photo.photo_type === 'group' && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-xs">私</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
