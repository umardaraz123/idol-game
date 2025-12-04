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

interface Feature {
  _id?: string;
  key?: string;
  type: string;
  title: MultilingualField;
  description: MultilingualField;
  imageUrl?: string; // Icon image
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

const FeaturesManagement = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  // Section Header state
  const [sectionHeader, setSectionHeader] = useState<{
    _id?: string;
    title: MultilingualField;
    subtitle: MultilingualField;
  }>({
    title: { ...emptyMultilingualField },
    subtitle: { ...emptyMultilingualField }
  });

  const [formData, setFormData] = useState<Feature>({
    type: 'features',
    title: { ...emptyMultilingualField },
    description: { ...emptyMultilingualField },
    imageUrl: '',
    metadata: {
      order: 0,
      isActive: true,
      isFeatured: false
    }
  });

  const generateKey = (title: string, order: number) => {
    const baseKey = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `feature_${order}_${baseKey || 'item'}_${timestamp}`;
  };

  useEffect(() => {
    fetchFeatures();
    fetchSectionHeader();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContent({ type: 'features' });
      const fetchedFeatures = response.data.data.contents || response.data.data || [];
      setFeatures(Array.isArray(fetchedFeatures) ? fetchedFeatures : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionHeader = async () => {
    try {
      const response = await adminAPI.getContent({ type: 'features', key: 'features_section_header' });
      const contents = response.data.data.contents || [];
      if (contents.length > 0) {
        const header = contents[0];
        setSectionHeader({
          _id: header._id,
          title: header.title,
          subtitle: header.subtitle || { ...emptyMultilingualField }
        });
      }
    } catch (err: any) {
      console.log('No section header found, will create on save');
    }
  };

  const saveSectionHeader = async () => {
    try {
      const headerData = {
        key: 'features_section_header',
        type: 'features',
        title: sectionHeader.title,
        subtitle: sectionHeader.subtitle,
        description: { ...emptyMultilingualField },
        metadata: {
          order: 0,
          isActive: true,
          isFeatured: false
        }
      };

      if (sectionHeader._id) {
        await adminAPI.updateContent(sectionHeader._id, headerData);
      } else {
        const response = await adminAPI.createContent(headerData);
        setSectionHeader(prev => ({ ...prev, _id: response.data.data._id }));
      }
      setSuccess('Section header updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save section header');
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

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadIcon = async () => {
    if (!iconFile) {
      return formData.imageUrl;
    }

    const mediaFormData = new FormData();
    mediaFormData.append('image', iconFile);

    try {
      const response = await adminAPI.uploadMedia(mediaFormData);
      return response.data.data.imageUrl || response.data.data.file?.secureUrl || formData.imageUrl;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to upload icon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.en.trim()) {
      setError('English title is required! Please switch to the English tab and enter a title.');
      setActiveLanguage('en');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const iconUrl = await uploadIcon();
      const uniqueKey = editingId ? undefined : generateKey(formData.title.en, formData.metadata.order);

      const dataToSubmit = {
        ...formData,
        ...(uniqueKey && { key: uniqueKey }),
        imageUrl: iconUrl
      };

      console.log('Submitting feature data:', dataToSubmit);
      console.log('Icon URL:', iconUrl);

      if (editingId) {
        await adminAPI.updateContent(editingId, dataToSubmit);
        setSuccess('Feature updated successfully!');
      } else {
        await adminAPI.createContent(dataToSubmit);
        setSuccess('Feature created successfully!');
      }

      await fetchFeatures();
      
      // Clear all form fields after successful add/update
      setFormData({
        type: 'features',
        title: { ...emptyMultilingualField },
        description: { ...emptyMultilingualField },
        imageUrl: '',
        metadata: {
          order: 0,
          isActive: true,
          isFeatured: false
        }
      });
      setEditingId(null);
      setShowForm(false);
      setActiveLanguage('en');
      setIconFile(null);
      setIconPreview('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save feature');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature: Feature) => {
    setFormData(feature);
    setEditingId(feature._id || null);
    setIconPreview(feature.imageUrl || '');
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteContent(id);
      setSuccess('Feature deleted successfully!');
      await fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete feature');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'features',
      title: { ...emptyMultilingualField },
      description: { ...emptyMultilingualField },
      imageUrl: '',
      metadata: {
        order: 0,
        isActive: true,
        isFeatured: false
      }
    });
    setEditingId(null);
    setShowForm(false);
    setActiveLanguage('en');
    setIconFile(null);
    setIconPreview('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="content-management">
      <div className="content-header">
        <h1>Features Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Feature'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Section Header Editor */}
      <div className="content-form-card" style={{ marginBottom: '2rem' }}>
        <h2>Section Header (Title & Subtitle)</h2>
        <p style={{ color: '#999', marginBottom: '1.5rem' }}>
          Edit the main title and subtitle that appear at the top of the Features section
        </p>

        <div className="language-tabs">
          {languages.map(lang => (
            <button
              key={lang.code}
              type="button"
              className={`lang-tab ${activeLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setActiveLanguage(lang.code)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Section Title ({languages.find(l => l.code === activeLanguage)?.name})</label>
          <input
            type="text"
            className="form-control"
            value={sectionHeader.title[activeLanguage as keyof MultilingualField]}
            onChange={(e) => setSectionHeader(prev => ({
              ...prev,
              title: { ...prev.title, [activeLanguage]: e.target.value }
            }))}
            placeholder={`e.g., Why Choose Idol be? (in ${languages.find(l => l.code === activeLanguage)?.name})`}
          />
        </div>

        <div className="form-group">
          <label>Section Subtitle ({languages.find(l => l.code === activeLanguage)?.name})</label>
          <textarea
            className="form-control"
            rows={2}
            value={sectionHeader.subtitle[activeLanguage as keyof MultilingualField]}
            onChange={(e) => setSectionHeader(prev => ({
              ...prev,
              subtitle: { ...prev.subtitle, [activeLanguage]: e.target.value }
            }))}
            placeholder={`e.g., Experience gaming the way it should be (in ${languages.find(l => l.code === activeLanguage)?.name})`}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={saveSectionHeader}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Section Header'}
        </button>
      </div>

      {showForm && (
        <div className="content-form-card">
          <h2>{editingId ? 'Edit Feature' : 'Create New Feature'}</h2>
          
          <div className="alert" style={{ backgroundColor: '#1a4d6d', border: '1px solid #00d4ff', marginBottom: '1.5rem' }}>
            <strong>💡 Multi-Language Support:</strong> Use the language tabs below to fill in the feature's title and description in ALL languages. Don't create separate entries for each language!
          </div>
          
          <form onSubmit={handleSubmit}>
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

            <div className="media-upload-section">
              <h3>Icon Image</h3>
              <p className="form-helper">Upload an icon image for this feature</p>
              
              <div className="form-group">
                <label>Icon Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="form-control"
                />
                {iconPreview && (
                  <div className="media-preview">
                    <img src={iconPreview} alt="Icon Preview" style={{ maxWidth: '200px' }} />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => {
                        setIconFile(null);
                        setIconPreview('');
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

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
                  <small className="form-helper">Display order on the page</small>
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
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Feature' : 'Create Feature'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="content-list">
        <h2>Features ({features.length})</h2>
        
        {loading && <div className="loading">Loading...</div>}
        
        {features.length === 0 && !loading && (
          <p className="no-content">No features found. Create your first feature!</p>
        )}

        <div className="highlights-grid">
          {features.map((feature) => (
            <div key={feature._id} className="highlight-card">
              <div className="highlight-media">
                {feature.imageUrl ? (
                  <img src={feature.imageUrl} alt={feature.title.en} style={{ maxWidth: '100px', padding: '1rem' }} />
                ) : (
                  <div className="no-media">No Icon</div>
                )}
              </div>
              
              <div className="highlight-content">
                <h3>{feature.title.en}</h3>
                <p className="highlight-desc">{feature.description.en.substring(0, 100)}...</p>
                
                <div className="highlight-meta">
                  <span className="badge">Order: {feature.metadata.order}</span>
                  <span className={`badge ${feature.metadata.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {feature.metadata.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="highlight-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(feature)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(feature._id!)}
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

export default FeaturesManagement;
