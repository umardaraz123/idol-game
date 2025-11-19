import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { contentAPI } from '../../services/api';
import { Loader2, Plus, FileText, Edit, Trash2, X, Info } from 'lucide-react';
import './ContentManagement.css';

interface MultilingualText {
  en: string;
  hi: string;
  ru: string;
  ko: string;
  zh: string;
  ja: string;
  es: string;
}

interface ContentItem {
  _id: string;
  key: string;
  type: string;
  title: MultilingualText;
  description?: MultilingualText;
  subtitle?: MultilingualText;
  media?: {
    images?: any[];
    videos?: any[];
  };
  metadata: {
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    category?: string;
  };
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
];

const CONTENT_TYPES = [
  { value: 'hero_section', label: 'Hero Section' },
  { value: 'about_section', label: 'About Section' },
  { value: 'game_highlights', label: 'Game Highlights' },
  { value: 'who_is_ana', label: 'Who is Ana' },
  { value: 'artist_team', label: 'Artist Team' },
  { value: 'general', label: 'General' },
];

const ContentManagement = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    type: 'hero_section',
    title: {
      en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
    },
    description: {
      en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
    },
    subtitle: {
      en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
    },
    metadata: {
      order: 0,
      isActive: true,
      isFeatured: false,
      tags: [] as string[],
      category: ''
    }
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await contentAPI.getAll();
      setContents(response.data.data.contents || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContent(null);
    setFormData({
      key: '',
      type: 'hero_section',
      title: {
        en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
      },
      description: {
        en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
      },
      subtitle: {
        en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: ''
      },
      metadata: {
        order: 0,
        isActive: true,
        isFeatured: false,
        tags: [],
        category: ''
      }
    });
    setShowModal(true);
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setFormData({
      key: content.key,
      type: content.type,
      title: content.title,
      description: content.description || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      subtitle: content.subtitle || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      metadata: {
        ...content.metadata,
        category: content.metadata.category || ''
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentAPI.delete(id);
      fetchContents();
      toast.success('Content deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate English title
    if (!formData.title.en.trim()) {
      toast.error('English title is required! Please switch to the English tab and enter a title.');
      // Switch to English tab to help user
      setSelectedLanguage('en');
      return;
    }

    try {
      if (editingContent) {
        await contentAPI.update(editingContent._id, formData);
        toast.success('Content updated successfully!');
      } else {
        await contentAPI.create(formData);
        toast.success('Content created successfully!');
      }
      setShowModal(false);
      fetchContents();
    } catch (error: any) {
      toast.error('Failed to save content: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTitleChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value
      }
    }));
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [lang]: value
      }
    }));
  };

  const handleSubtitleChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subtitle: {
        ...prev.subtitle,
        [lang]: value
      }
    }));
  };

  const filteredContents = selectedType === 'all'
    ? contents
    : contents.filter(c => c.type === selectedType);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 size={32} className="spinning" />
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="page-header">
        <div>
          <h1>Content Management</h1>
          <p>Manage all website content in multiple languages</p>
        </div>
        <button className="btn-neon" onClick={handleCreate}>
          <Plus size={18} /> Create Content
        </button>
      </div>

      <div className="content-filters">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {CONTENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="content-grid">
        {filteredContents.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Content Found</h3>
            <p>Create your first content item to get started</p>
            <button className="btn-neon" onClick={handleCreate}>
              <Plus size={18} /> Create Content
            </button>
          </div>
        ) : (
          filteredContents.map(content => (
            <div key={content._id} className="content-card">
              <div className="content-header">
                <div>
                  <h3>{content.title.en || content.key}</h3>
                  <div className="content-meta">
                    <span className="badge">{CONTENT_TYPES.find(t => t.value === content.type)?.label || content.type}</span>
                    {content.metadata.category && <span className="badge">{content.metadata.category}</span>}
                    <span className={`status-badge ${content.metadata.isActive ? 'active' : 'inactive'}`}>
                      {content.metadata.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="content-preview">
                <p><strong>Title:</strong> {content.title.en || 'No title'}</p>
                {content.description?.en && <p><strong>Description:</strong> {content.description.en.substring(0, 100)}...</p>}
                {content.subtitle?.en && <p><strong>Subtitle:</strong> {content.subtitle.en}</p>}
              </div>

              <div className="content-actions">
                <button className="btn-edit" onClick={() => handleEdit(content)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="btn-danger-small" onClick={() => handleDelete(content._id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingContent ? 'Edit Content' : 'Create Content'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="content-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Content Key *</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="unique_content_key"
                    required
                  />
                  <small>Unique identifier (lowercase, underscores only)</small>
                </div>

                <div className="form-group">
                  <label>Content Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    {CONTENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.metadata.category}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, category: e.target.value }
                    })}
                    placeholder="e.g., main, secondary, featured"
                  />
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={formData.metadata.order}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, order: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.metadata.isActive}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        metadata: { ...formData.metadata, isActive: e.target.checked }
                      })}
                    />
                    Active
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.metadata.isFeatured}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        metadata: { ...formData.metadata, isFeatured: e.target.checked }
                      })}
                    />
                    Featured
                  </label>
                </div>
              </div>

              <div className="language-tabs">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`lang-tab ${selectedLanguage === lang.code ? 'active' : ''} ${lang.code === 'en' ? 'required-tab' : ''}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    {lang.name} {lang.code === 'en' && <span style={{ color: '#ff4444' }}>*</span>}
                  </button>
                ))}
              </div>

              {formData.type === 'game_highlights' && (
                <div style={{ 
                  background: 'rgba(0, 212, 255, 0.1)', 
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <Info size={32} style={{ color: '#00d4ff', marginBottom: '1rem', display: 'block' }} />
                  <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Game Highlights with Media</h3>
                  <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                    To add game highlights with images or videos, please use the dedicated <strong>Game Highlights</strong> page.
                  </p>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Click on <strong>"Game Highlights"</strong> in the left sidebar menu.
                  </p>
                </div>
              )}

              <div className="language-content">
                <div className="form-group">
                  <label>
                    Title {selectedLanguage === 'en' ? '* (Required)' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title[selectedLanguage as keyof typeof formData.title]}
                    onChange={(e) => handleTitleChange(selectedLanguage, e.target.value)}
                    placeholder={selectedLanguage === 'en' ? 'Enter title (required)' : 'Enter title (optional)'}
                  />
                  {selectedLanguage === 'en' && (
                    <small style={{ color: '#00d4ff', marginTop: '0.25rem', display: 'block' }}>
                      English title is required to create content
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle[selectedLanguage as keyof typeof formData.subtitle]}
                    onChange={(e) => handleSubtitleChange(selectedLanguage, e.target.value)}
                    placeholder="Enter subtitle"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description[selectedLanguage as keyof typeof formData.description]}
                    onChange={(e) => handleDescriptionChange(selectedLanguage, e.target.value)}
                    placeholder="Enter description"
                    rows={5}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingContent ? 'Update Content' : 'Create Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
