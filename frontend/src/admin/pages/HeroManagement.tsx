import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './ContentManagement.css';

interface HeroData {
  _id?: string;
  key: string;
  type: string;
  title: {
    en: string;
    hi: string;
    ru: string;
    ko: string;
    zh: string;
    ja: string;
    es: string;
  };
  description: {
    en: string;
    hi: string;
    ru: string;
    ko: string;
    zh: string;
    ja: string;
    es: string;
  };
  videoUrl?: string;
  imageUrl?: string;
  metadata: {
    order: number;
    isActive: boolean;
    category: string;
  };
}

const HeroManagement = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<HeroData>({
    key: 'hero_media',
    type: 'hero_section',
    title: {
      en: 'Hero Background Media',
      hi: 'हीरो पृष्ठभूमि मीडिया',
      ru: 'Медиа фона героя',
      ko: '히어로 배경 미디어',
      zh: '英雄背景媒体',
      ja: 'ヒーローの背景メディア',
      es: 'Medios de fondo del héroe'
    },
    description: {
      en: 'Background video or image for hero section',
      hi: 'हीरो अनुभाग के लिए पृष्ठभूमि वीडियो या छवि',
      ru: 'Фоновое видео или изображение для раздела героя',
      ko: '히어로 섹션의 배경 동영상 또는 이미지',
      zh: '英雄部分的背景视频或图像',
      ja: 'ヒーローセクションの背景動画または画像',
      es: 'Video o imagen de fondo para la sección de héroe'
    },
    videoUrl: '',
    imageUrl: '',
    metadata: {
      order: 0,
      isActive: true,
      category: 'media'
    }
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContent({ type: 'hero_section' });
      const contents = response.data.data.contents;
      
      // Find the hero media content
      const mainHero = contents.find((item: HeroData) => 
        item.key === 'hero_media' || item.metadata?.category === 'media'
      );

      if (mainHero) {
        setHeroData(mainHero);
        setFormData(mainHero);
      }
    } catch (error: any) {
      console.error('Failed to fetch hero data:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch hero data' });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setMessage({ type: 'error', text: 'Video file size must be less than 100MB' });
        return;
      }
      setVideoFile(file);
      setImageFile(null); // Clear image when video is selected
      setMessage({ type: 'info', text: `Video selected: ${file.name}` });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage({ type: 'error', text: 'Image file size must be less than 10MB' });
        return;
      }
      setImageFile(file);
      setVideoFile(null); // Clear video when image is selected
      setMessage({ type: 'info', text: `Image selected: ${file.name}` });
    }
  };

  const uploadMedia = async () => {
    const mediaFormData = new FormData();
    
    if (imageFile) {
      mediaFormData.append('image', imageFile);
    }
    if (videoFile) {
      mediaFormData.append('video', videoFile);
    }

    if (!imageFile && !videoFile) {
      return { imageUrl: formData.imageUrl, videoUrl: formData.videoUrl };
    }

    try {
      setUploadProgress(10);
      const response = await adminAPI.uploadMedia(mediaFormData);
      setUploadProgress(100);
      
      // If uploading image, clear video URL and vice versa
      if (imageFile) {
        return {
          imageUrl: response.data.data.imageUrl || response.data.data.file?.secureUrl || formData.imageUrl,
          videoUrl: '' // Clear video when uploading image
        };
      } else if (videoFile) {
        return {
          imageUrl: '', // Clear image when uploading video
          videoUrl: response.data.data.videoUrl || response.data.data.file?.secureUrl || formData.videoUrl
        };
      }
      
      return {
        imageUrl: response.data.data.imageUrl || formData.imageUrl,
        videoUrl: response.data.data.videoUrl || formData.videoUrl
      };
    } catch (err: any) {
      console.error('Upload error:', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to upload media');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!videoFile && !imageFile && !formData.videoUrl && !formData.imageUrl) {
      setMessage({ type: 'error', text: 'Please upload a video or image' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Processing...' });

      // Upload media if files are selected
      const mediaUrls = await uploadMedia();
      setUploadProgress(0);

      const dataToSubmit = {
        ...formData,
        videoUrl: mediaUrls.videoUrl,
        imageUrl: mediaUrls.imageUrl
      };

      let response;
      if (heroData?._id) {
        // Update existing hero
        response = await adminAPI.updateContent(heroData._id, dataToSubmit);
        setMessage({ type: 'success', text: 'Hero updated successfully!' });
      } else {
        // Create new hero
        response = await adminAPI.createContent(dataToSubmit);
        setMessage({ type: 'success', text: 'Hero created successfully!' });
      }

      setHeroData(response.data.data.content);
      setFormData(response.data.data.content);
      setVideoFile(null);
      setImageFile(null);

      // Refresh data
      setTimeout(() => {
        fetchHeroData();
      }, 1000);

    } catch (error: any) {
      console.error('Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to save hero data' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = () => {
    setVideoFile(null);
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      videoUrl: '',
      imageUrl: ''
    }));
    setMessage({ type: 'info', text: 'Media removed. Save to apply changes.' });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Hero Section Management</h1>
        <p>Manage the hero background video or image</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="info-box" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196F3', borderRadius: '4px' }}>
        <p style={{ margin: 0, color: '#1976d2' }}>
          <strong>Note:</strong> Upload either a video OR an image for the hero background. 
          The hero title and description are managed separately in the Content Management page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="content-form">
        {/* Media Upload Section */}
        <div className="form-section">
          <h2>Hero Media (Video or Image)</h2>
          
          <div className="media-preview">
            {formData.videoUrl && !videoFile && !imageFile && (
              <div className="preview-item">
                <video src={formData.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
                <p>Current Video</p>
              </div>
            )}
            {formData.imageUrl && !videoFile && !imageFile && (
              <div className="preview-item">
                <img src={formData.imageUrl} alt="Hero" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                <p>Current Image</p>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="video">Upload Hero Video</label>
              <input
                type="file"
                id="video"
                accept="video/mp4,video/mov,video/avi,video/webm"
                onChange={handleVideoChange}
                disabled={loading}
              />
              {videoFile && <p className="file-info">Selected: {videoFile.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="image">Upload Hero Image</label>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading}
              />
              {imageFile && <p className="file-info">Selected: {imageFile.name}</p>}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          {(formData.videoUrl || formData.imageUrl) && (
            <button 
              type="button" 
              onClick={handleRemoveMedia}
              className="btn-secondary"
              disabled={loading}
            >
              Remove Media
            </button>
          )}
        </div>

        {/* Metadata Section */}
        <div className="form-section">
          <h2>Settings</h2>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.metadata.isActive}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, isActive: e.target.checked }
                }))}
                disabled={loading}
              />
              Active
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : heroData?._id ? 'Update Hero' : 'Create Hero'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroManagement;
