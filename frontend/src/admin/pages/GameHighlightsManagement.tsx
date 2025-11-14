import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './ContentManagement.css';

interface MultilingualField {
  en: string;
  hi: string;
  ru: string;
  ko: string;
  zh: string;
  ja: string;
  es: string;
}

interface GameHighlight {
  _id?: string;
  key?: string;
  type: string;
  title: MultilingualField;
  description: MultilingualField;
  imageUrl?: string;
  videoUrl?: string;
  metadata: {
    order: number;
    isActive: boolean;
    isFeatured: boolean;
  };
}

const emptyMultilingualField: MultilingualField = {
  en: '',
  hi: '',
  ru: '',
  ko: '',
  zh: '',
  ja: '',
  es: ''
};

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' }
];

const GameHighlightsManagement = () => {
  const [highlights, setHighlights] = useState<GameHighlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [formData, setFormData] = useState<GameHighlight>({
    type: 'game_highlights',
    title: { ...emptyMultilingualField },
    description: { ...emptyMultilingualField },
    imageUrl: '',
    videoUrl: '',
    metadata: {
      order: 0,
      isActive: true,
      isFeatured: false
    }
  });

  // Generate unique key from title
  const generateKey = (title: string, order: number) => {
    const baseKey = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30);
    return `game_highlight_${order}_${baseKey || Date.now()}`;
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContent({ type: 'game_highlights' });
      const fetchedHighlights = response.data.data.contents || response.data.data || [];
      setHighlights(Array.isArray(fetchedHighlights) ? fetchedHighlights : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch game highlights');
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [activeLanguage]: value
      }
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [activeLanguage]: value
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear video if image is selected
      setVideoFile(null);
      setVideoPreview('');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear image if video is selected
      setImageFile(null);
      setImagePreview('');
    }
  };

  const uploadMedia = async () => {
    const mediaFormData = new FormData();
    
    if (imageFile) {
      mediaFormData.append('image', imageFile);
      console.log('Appending image:', imageFile.name, imageFile.size);
    }
    if (videoFile) {
      mediaFormData.append('video', videoFile);
      console.log('Appending video:', videoFile.name, videoFile.size);
    }

    if (!imageFile && !videoFile) {
      return { imageUrl: formData.imageUrl, videoUrl: formData.videoUrl };
    }

    console.log('Uploading media...', { hasImage: !!imageFile, hasVideo: !!videoFile });

    try {
      const response = await adminAPI.uploadMedia(mediaFormData);
      console.log('Upload response:', response.data);
      
      return {
        imageUrl: response.data.data.imageUrl || response.data.data.file?.secureUrl || formData.imageUrl,
        videoUrl: response.data.data.videoUrl || response.data.data.file?.secureUrl || formData.videoUrl
      };
    } catch (err: any) {
      console.error('Upload error:', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to upload media');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.en.trim()) {
      setError('English title is required! Please switch to the English tab and enter a title.');
      setActiveLanguage('en');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload media first if files are selected
      const mediaUrls = await uploadMedia();

      // Generate unique key if creating new content
      const uniqueKey = editingId 
        ? undefined // Don't change key when editing
        : generateKey(formData.title.en, formData.metadata.order);

      const dataToSubmit = {
        ...formData,
        ...(uniqueKey && { key: uniqueKey }), // Only add key for new content
        imageUrl: mediaUrls.imageUrl,
        videoUrl: mediaUrls.videoUrl
      };

      console.log('Submitting data:', dataToSubmit);

      if (editingId) {
        await adminAPI.updateContent(editingId, dataToSubmit);
        setSuccess('Game highlight updated successfully!');
      } else {
        await adminAPI.createContent(dataToSubmit);
        setSuccess('Game highlight created successfully!');
      }

      await fetchHighlights();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save game highlight');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (highlight: GameHighlight) => {
    setFormData(highlight);
    setEditingId(highlight._id || null);
    setImagePreview(highlight.imageUrl || '');
    setVideoPreview(highlight.videoUrl || '');
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this game highlight?')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteContent(id);
      setSuccess('Game highlight deleted successfully!');
      await fetchHighlights();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete game highlight');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'game_highlights',
      title: { ...emptyMultilingualField },
      description: { ...emptyMultilingualField },
      imageUrl: '',
      videoUrl: '',
      metadata: {
        order: 0,
        isActive: true,
        isFeatured: false
      }
    });
    setEditingId(null);
    setShowForm(false);
    setActiveLanguage('en');
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="content-management">
      <div className="content-header">
        <h1>Game Highlights Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Highlight'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="content-form-card">
          <h2>{editingId ? 'Edit Game Highlight' : 'Create New Game Highlight'}</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Language Tabs */}
            <div className="language-tabs">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-tab ${activeLanguage === lang.code ? 'active' : ''} ${lang.code === 'en' ? 'required-tab' : ''}`}
                  onClick={() => setActiveLanguage(lang.code)}
                >
                  <span className="flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {lang.code === 'en' && <span className="required-indicator">*</span>}
                  {lang.code === 'en' && <span className="required-dot"></span>}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Title ({languages.find(l => l.code === activeLanguage)?.name})</label>
              <input
                type="text"
                className="form-control"
                value={formData.title[activeLanguage as keyof MultilingualField]}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={`Enter title in ${languages.find(l => l.code === activeLanguage)?.name}`}
                required={activeLanguage === 'en'}
              />
              {activeLanguage === 'en' && (
                <small className="form-helper">English title is required</small>
              )}
            </div>

            <div className="form-group">
              <label>Description ({languages.find(l => l.code === activeLanguage)?.name})</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.description[activeLanguage as keyof MultilingualField]}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder={`Enter description in ${languages.find(l => l.code === activeLanguage)?.name}`}
              />
            </div>

            {/* Media Upload Section */}
            <div className="media-upload-section">
              <h3>Media (Image or Video)</h3>
              <p className="form-helper">Upload either an image or a video for this highlight</p>
              
              <div className="media-upload-grid">
                <div className="form-group">
                  <label>Image Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                    disabled={!!videoFile}
                  />
                  {imagePreview && (
                    <div className="media-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Video Upload</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="form-control"
                    disabled={!!imageFile}
                  />
                  {videoPreview && (
                    <div className="media-preview">
                      <video src={videoPreview} controls />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview('');
                          setFormData(prev => ({ ...prev, videoUrl: '' }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="metadata-section">
              <h3>Metadata</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.metadata.order}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, order: parseInt(e.target.value) }
                    }))}
                  />
                  <small className="form-helper">Order of appearance in slider</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.metadata.isActive}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, isActive: e.target.checked }
                      }))}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.metadata.isFeatured}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, isFeatured: e.target.checked }
                      }))}
                    />
                    <span>Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Highlight' : 'Create Highlight'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights List */}
      <div className="content-list">
        <h2>Game Highlights ({highlights.length})</h2>
        
        {loading && <div className="loading">Loading...</div>}
        
        {highlights.length === 0 && !loading && (
          <p className="no-content">No game highlights found. Create your first highlight!</p>
        )}

        <div className="highlights-grid">
          {highlights.map((highlight) => (
            <div key={highlight._id} className="highlight-card">
              <div className="highlight-media">
                {highlight.videoUrl ? (
                  <video src={highlight.videoUrl} />
                ) : highlight.imageUrl ? (
                  <img src={highlight.imageUrl} alt={highlight.title.en} />
                ) : (
                  <div className="no-media">No Media</div>
                )}
              </div>
              
              <div className="highlight-content">
                <h3>{highlight.title.en}</h3>
                <p className="highlight-desc">{highlight.description.en.substring(0, 100)}...</p>
                
                <div className="highlight-meta">
                  <span className="badge">Order: {highlight.metadata.order}</span>
                  <span className={`badge ${highlight.metadata.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {highlight.metadata.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {highlight.metadata.isFeatured && (
                    <span className="badge badge-featured">Featured</span>
                  )}
                </div>

                <div className="highlight-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(highlight)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(highlight._id!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHighlightsManagement;
