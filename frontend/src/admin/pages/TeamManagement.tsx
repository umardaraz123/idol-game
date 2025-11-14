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

interface TeamMember {
  _id?: string;
  key?: string;
  type: string;
  title: MultilingualField; // Name
  description: MultilingualField; // Role/Description
  subtitle?: MultilingualField; // Category (Game Design, Programming, etc.)
  imageUrl?: string; // Optional photo
  metadata: {
    order: number;
    isActive: boolean;
    category?: string; // game_design, programming, music, singers
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

const categories = [
  { value: 'game_design', label: 'Game Design' },
  { value: 'programming', label: 'Programming' },
  { value: 'music', label: 'Music' },
  { value: 'singers', label: 'Singers' },
  { value: 'other', label: 'Other' }
];

const TeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState<TeamMember>({
    type: 'artist_team',
    title: { ...emptyMultilingualField },
    description: { ...emptyMultilingualField },
    subtitle: { ...emptyMultilingualField },
    imageUrl: '',
    metadata: {
      order: 0,
      isActive: true,
      category: 'other'
    }
  });

  const generateKey = (name: string, category: string, order: number) => {
    const baseKey = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `team_${category}_${order}_${baseKey || 'member'}_${timestamp}`;
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContent({ type: 'artist_team' });
      const fetchedMembers = response.data.data.contents || response.data.data || [];
      setMembers(Array.isArray(fetchedMembers) ? fetchedMembers : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch team members');
      setMembers([]);
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

  const handleSubtitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subtitle: {
        ...prev.subtitle!,
        [activeLanguage]: value
      }
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      return formData.imageUrl;
    }

    const mediaFormData = new FormData();
    mediaFormData.append('image', photoFile);

    try {
      const response = await adminAPI.uploadMedia(mediaFormData);
      return response.data.data.imageUrl || response.data.data.file?.secureUrl || formData.imageUrl;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to upload photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.en.trim()) {
      setError('English name is required! Please switch to the English tab and enter a name.');
      setActiveLanguage('en');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const photoUrl = await uploadPhoto();
      const uniqueKey = editingId ? undefined : generateKey(
        formData.title.en || 'member', 
        formData.metadata.category || 'other',
        formData.metadata.order
      );

      const dataToSubmit = {
        ...formData,
        ...(uniqueKey && { key: uniqueKey }),
        imageUrl: photoUrl
      };

      if (editingId) {
        await adminAPI.updateContent(editingId, dataToSubmit);
        setSuccess('Team member updated successfully!');
      } else {
        await adminAPI.createContent(dataToSubmit);
        setSuccess('Team member created successfully!');
      }

      await fetchMembers();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData(member);
    setEditingId(member._id || null);
    setPhotoPreview(member.imageUrl || '');
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteContent(id);
      setSuccess('Team member deleted successfully!');
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete team member');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'artist_team',
      title: { ...emptyMultilingualField },
      description: { ...emptyMultilingualField },
      subtitle: { ...emptyMultilingualField },
      imageUrl: '',
      metadata: {
        order: 0,
        isActive: true,
        category: 'other'
      }
    });
    setEditingId(null);
    setShowForm(false);
    setActiveLanguage('en');
    setPhotoFile(null);
    setPhotoPreview('');
    setError('');
    setSuccess('');
  };

  const filteredMembers = filterCategory === 'all' 
    ? members 
    : members.filter(m => m.metadata.category === filterCategory);

  return (
    <div className="content-management">
      <div className="content-header">
        <h1>Artist Team Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Team Member'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="content-form-card">
          <h2>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
          
          <div className="alert" style={{ backgroundColor: '#1a4d6d', border: '1px solid #00d4ff', marginBottom: '1.5rem' }}>
            <strong>💡 Multi-Language Support:</strong> Use the language tabs below to fill in the member's name and role in ALL languages. Don't create separate entries for each language - one entry supports all 7 languages!
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-control"
                value={formData.metadata.category}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, category: e.target.value }
                }))}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

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
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Name ({languages.find(l => l.code === activeLanguage)?.name})</label>
              <input
                type="text"
                className="form-control"
                value={formData.title[activeLanguage as keyof MultilingualField]}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={`Enter name in ${languages.find(l => l.code === activeLanguage)?.name}`}
                required={activeLanguage === 'en'}
              />
              {activeLanguage === 'en' && (
                <small className="form-helper">English name is required</small>
              )}
            </div>

            <div className="form-group">
              <label>Role/Position ({languages.find(l => l.code === activeLanguage)?.name})</label>
              <input
                type="text"
                className="form-control"
                value={formData.subtitle?.[activeLanguage as keyof MultilingualField] || ''}
                onChange={(e) => handleSubtitleChange(e.target.value)}
                placeholder={`e.g., Game Designer, Composer, Singer`}
              />
            </div>

            <div className="form-group">
              <label>Description ({languages.find(l => l.code === activeLanguage)?.name})</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.description[activeLanguage as keyof MultilingualField]}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder={`Enter description/credits in ${languages.find(l => l.code === activeLanguage)?.name}`}
              />
            </div>

            <div className="media-upload-section">
              <h3>Photo (Optional)</h3>
              
              <div className="form-group">
                <label>Photo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="form-control"
                />
                {photoPreview && (
                  <div className="media-preview">
                    <img src={photoPreview} alt="Photo Preview" style={{ maxWidth: '200px' }} />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview('');
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
                  <small className="form-helper">Display order within category</small>
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
                {loading ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="content-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Team Members ({filteredMembers.length})</h2>
          <select
            className="form-control"
            style={{ maxWidth: '200px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        {loading && <div className="loading">Loading...</div>}
        
        {filteredMembers.length === 0 && !loading && (
          <p className="no-content">No team members found. Add your first member!</p>
        )}

        <div className="highlights-grid">
          {filteredMembers.map((member) => (
            <div key={member._id} className="highlight-card">
              {member.imageUrl && (
                <div className="highlight-media">
                  <img src={member.imageUrl} alt={member.title.en} style={{ maxWidth: '150px' }} />
                </div>
              )}
              
              <div className="highlight-content">
                <h3>{member.title.en}</h3>
                {member.subtitle?.en && <p style={{ color: '#00d4ff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{member.subtitle.en}</p>}
                <p className="highlight-desc">{member.description.en.substring(0, 100)}...</p>
                
                <div className="highlight-meta">
                  <span className="badge">{categories.find(c => c.value === member.metadata.category)?.label}</span>
                  <span className="badge">Order: {member.metadata.order}</span>
                  <span className={`badge ${member.metadata.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {member.metadata.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="highlight-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(member._id!)}
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

export default TeamManagement;
