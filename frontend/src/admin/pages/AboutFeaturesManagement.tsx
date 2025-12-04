import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './ContentManagement.css';

interface AboutFeature {
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
  imageUrl?: string;
  metadata: {
    order: number;
    isActive: boolean;
    category: string;
  };
}

const AboutFeaturesManagement = () => {
  const [features, setFeatures] = useState<AboutFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<AboutFeature>({
    key: '',
    type: 'about_section',
    title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
    description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
    imageUrl: '',
    metadata: {
      order: 0,
      isActive: true,
      category: 'feature'
    }
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContent({ type: 'about_section' });
      const allContent = response.data.data.contents;
      
      // Filter only features (category: 'feature')
      const featureItems = allContent.filter((item: AboutFeature) => 
        item.metadata?.category === 'feature'
      );
      
      setFeatures(featureItems.sort((a: AboutFeature, b: AboutFeature) => a.metadata.order - b.metadata.order));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch about features');
    } finally {
      setLoading(false);
    }
  };

  const generateKey = (title: string, order: number) => {
    const baseKey = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20);
    const timestamp = Date.now();
    return `about_feature_${order}_${baseKey}_${timestamp}`;
  };

  const handleInputChange = (field: 'title' | 'description', lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setSuccess(`Image selected: ${file.name}`);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      return formData.imageUrl;
    }

    const mediaFormData = new FormData();
    mediaFormData.append('image', imageFile);

    try {
      const response = await adminAPI.uploadMedia(mediaFormData);
      return response.data.data.imageUrl || response.data.data.file?.secureUrl || formData.imageUrl;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.en.trim()) {
      setError('English title is required');
      return;
    }

    if (!imageFile && !formData.imageUrl) {
      setError('Please upload an image');
      return;
    }

    try {
      setLoading(true);

      // Upload image if selected
      const imageUrl = await uploadImage();

      const dataToSubmit = {
        ...formData,
        imageUrl,
        key: editingId ? formData.key : generateKey(formData.title.en, formData.metadata.order)
      };

      if (editingId) {
        await adminAPI.updateContent(editingId, dataToSubmit);
        setSuccess('About feature updated successfully!');
      } else {
        await adminAPI.createContent(dataToSubmit);
        setSuccess('About feature created successfully!');
      }

      // Reset form - clear all fields
      setFormData({
        key: '',
        type: 'about_section',
        title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
        description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
        imageUrl: '',
        metadata: {
          order: features.length,
          isActive: true,
          category: 'feature'
        }
      });
      setImageFile(null);
      setEditingId(null);
      
      // Clear file input element
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save about feature');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature: AboutFeature) => {
    setFormData(feature);
    setEditingId(feature._id || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this about feature?')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteContent(id);
      setSuccess('About feature deleted successfully!');
      fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete about feature');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      key: '',
      type: 'about_section',
      title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      imageUrl: '',
      metadata: {
        order: features.length,
        isActive: true,
        category: 'feature'
      }
    });
    setImageFile(null);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>About Section Features</h1>
        <p>Manage feature items displayed in the About section</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="info-box" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196F3', borderRadius: '4px' }}>
        <p style={{ margin: 0, color: '#1976d2' }}>
          <strong>Note:</strong> Enter translations for all 7 languages in one form. Each feature will display with an icon image, title, and description.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="content-form">
        <div className="form-section">
          <h2>{editingId ? 'Edit' : 'Add New'} About Feature</h2>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">Feature Icon/Image <span className="required">*</span></label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={loading}
            />
            {imageFile && <p className="file-info">Selected: {imageFile.name}</p>}
            {formData.imageUrl && !imageFile && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Current" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />
              </div>
            )}
          </div>

          {/* Order */}
          <div className="form-group">
            <label htmlFor="order">Display Order</label>
            <input
              type="number"
              id="order"
              value={formData.metadata.order}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                metadata: { ...prev.metadata, order: parseInt(e.target.value) || 0 }
              }))}
              min="0"
              disabled={loading}
            />
          </div>

          {/* Title in all languages */}
          <h3>Title (All Languages)</h3>
          {['en', 'hi', 'ru', 'ko', 'zh', 'ja', 'es'].map(lang => (
            <div key={lang} className="form-group">
              <label htmlFor={`title-${lang}`}>
                {lang.toUpperCase()} {lang === 'en' && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id={`title-${lang}`}
                value={formData.title[lang as keyof typeof formData.title]}
                onChange={(e) => handleInputChange('title', lang, e.target.value)}
                placeholder={`Feature title in ${lang.toUpperCase()}`}
                required={lang === 'en'}
                disabled={loading}
              />
            </div>
          ))}

          {/* Description in all languages */}
          <h3>Description (All Languages)</h3>
          {['en', 'hi', 'ru', 'ko', 'zh', 'ja', 'es'].map(lang => (
            <div key={lang} className="form-group">
              <label htmlFor={`desc-${lang}`}>{lang.toUpperCase()}</label>
              <textarea
                id={`desc-${lang}`}
                value={formData.description[lang as keyof typeof formData.description]}
                onChange={(e) => handleInputChange('description', lang, e.target.value)}
                placeholder={`Feature description in ${lang.toUpperCase()}`}
                rows={2}
                disabled={loading}
              />
            </div>
          ))}

          {/* Active Status */}
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

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Feature' : 'Add Feature'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Features List */}
      <div className="content-section">
        <h2>About Features ({features.length})</h2>
        
        {loading && <p className="loading">Loading...</p>}
        
        {!loading && features.length === 0 && (
          <p className="no-content">No about features found. Create your first feature!</p>
        )}

        <div className="content-grid">
          {features.map((feature) => (
            <div key={feature._id} className="content-card">
              {feature.imageUrl && (
                <div className="card-image">
                  <img src={feature.imageUrl} alt={feature.title.en} />
                </div>
              )}
              <div className="card-content">
                <div className="card-header">
                  <h3>{feature.title.en}</h3>
                  <span className={`status-badge ${feature.metadata.isActive ? 'active' : 'inactive'}`}>
                    {feature.metadata.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="card-description">{feature.description.en}</p>
                <div className="card-meta">
                  <span className="meta-item">Order: {feature.metadata.order}</span>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleEdit(feature)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(feature._id!)} className="btn-delete">
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

export default AboutFeaturesManagement;
