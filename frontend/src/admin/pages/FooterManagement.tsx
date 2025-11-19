import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { footerAPI, adminAPI } from '../../services/api';
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

interface SocialIcon {
  platform: string;
  url: string;
  iconUrl: string;
  order: number;
  isActive: boolean;
}

interface Footer {
  _id?: string;
  leftColumn: {
    title: MultilingualText;
    subtitle: MultilingualText;
    description: MultilingualText;
  };
  centerColumn: {
    title: MultilingualText;
    subtitle: MultilingualText;
    description: MultilingualText;
  };
  rightColumn: {
    title: MultilingualText;
    subtitle: MultilingualText;
    description: MultilingualText;
  };
  socialIcons: SocialIcon[];
  copyrightText: MultilingualText;
  metadata: {
    isActive: boolean;
  };
}

const LANGUAGES = ['en', 'hi', 'ru', 'ko', 'zh', 'ja', 'es'];
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ru: 'Russian',
  ko: 'Korean',
  zh: 'Chinese',
  ja: 'Japanese',
  es: 'Spanish'
};

const FooterManagement = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'left' | 'center' | 'right' | 'social' | 'copyright'>('left');
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Footer>({
    leftColumn: {
      title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      subtitle: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
    },
    centerColumn: {
      title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      subtitle: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
    },
    rightColumn: {
      title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      subtitle: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
    },
    socialIcons: [],
    copyrightText: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
    metadata: {
      isActive: true
    }
  });

  const [newSocialIcon, setNewSocialIcon] = useState<SocialIcon>({
    platform: '',
    url: '',
    iconUrl: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const response = await footerAPI.getAdmin();
      if (response.data.data.footer) {
        setFormData(response.data.data.footer);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch footer data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleColumnChange = (
    column: 'leftColumn' | 'centerColumn' | 'rightColumn',
    field: 'title' | 'subtitle' | 'description',
    lang: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        [field]: {
          ...prev[column][field],
          [lang]: value
        }
      }
    }));
  };

  const handleCopyrightChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      copyrightText: {
        ...prev.copyrightText,
        [lang]: value
      }
    }));
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Icon file size must be less than 2MB');
        return;
      }
      setIconFile(file);
      toast.info(`Icon selected: ${file.name}`);
    }
  };

  const uploadIcon = async (): Promise<string> => {
    if (!iconFile) return '';

    const mediaFormData = new FormData();
    mediaFormData.append('image', iconFile);

    try {
      setIsUploadingIcon(true);
      const response = await adminAPI.uploadMedia(mediaFormData);
      const iconUrl = response.data.data.imageUrl || response.data.data.file?.secureUrl || '';
      toast.success('Icon uploaded successfully');
      return iconUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload icon');
      throw error;
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleAddSocialIcon = async () => {
    if (!newSocialIcon.platform.trim()) {
      toast.error('Platform name is required');
      return;
    }
    if (!newSocialIcon.url.trim()) {
      toast.error('URL is required');
      return;
    }
    if (!iconFile && !newSocialIcon.iconUrl) {
      toast.error('Please upload an icon image');
      return;
    }

    try {
      setLoading(true);

      // Upload icon if file selected
      let iconUrl = newSocialIcon.iconUrl;
      if (iconFile) {
        iconUrl = await uploadIcon();
      }

      const iconData = {
        ...newSocialIcon,
        iconUrl,
        order: formData.socialIcons.length
      };

      // Add to local state
      setFormData(prev => ({
        ...prev,
        socialIcons: [...prev.socialIcons, iconData]
      }));

      // Reset form
      setNewSocialIcon({
        platform: '',
        url: '',
        iconUrl: '',
        order: 0,
        isActive: true
      });
      setIconFile(null);

      toast.success('Social icon added. Click Save to apply changes.');
    } catch (error: any) {
      toast.error('Failed to add social icon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSocialIcon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialIcons: prev.socialIcons.filter((_, i) => i !== index)
    }));
    toast.info('Social icon removed. Click Save to apply changes.');
  };

  const handleToggleSocialIcon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialIcons: prev.socialIcons.map((icon, i) =>
        i === index ? { ...icon, isActive: !icon.isActive } : icon
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.copyrightText.en.trim()) {
      toast.error('English copyright text is required');
      return;
    }

    try {
      setLoading(true);
      await footerAPI.save(formData);
      toast.success('Footer updated successfully!');
      fetchFooter();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save footer');
    } finally {
      setLoading(false);
    }
  };

  const renderColumnForm = (
    column: 'leftColumn' | 'centerColumn' | 'rightColumn',
    title: string
  ) => {
    return (
      <div className="form-section">
        <h2>{title}</h2>
        
        <div className="language-tabs">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              className={`language-tab ${activeLanguage === lang ? 'active' : ''}`}
              onClick={() => setActiveLanguage(lang)}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Title ({LANGUAGE_NAMES[activeLanguage]})</label>
          <input
            type="text"
            value={formData[column].title[activeLanguage as keyof MultilingualText]}
            onChange={(e) => handleColumnChange(column, 'title', activeLanguage, e.target.value)}
            placeholder={`Title in ${LANGUAGE_NAMES[activeLanguage]}`}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Subtitle ({LANGUAGE_NAMES[activeLanguage]})</label>
          <input
            type="text"
            value={formData[column].subtitle[activeLanguage as keyof MultilingualText]}
            onChange={(e) => handleColumnChange(column, 'subtitle', activeLanguage, e.target.value)}
            placeholder={`Subtitle in ${LANGUAGE_NAMES[activeLanguage]}`}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description ({LANGUAGE_NAMES[activeLanguage]})</label>
          <textarea
            value={formData[column].description[activeLanguage as keyof MultilingualText]}
            onChange={(e) => handleColumnChange(column, 'description', activeLanguage, e.target.value)}
            placeholder={`Description in ${LANGUAGE_NAMES[activeLanguage]}`}
            rows={4}
            disabled={loading}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Footer Management</h1>
        <p>Manage footer content with 3 columns, social icons, and copyright text</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab Navigation */}
        <div className="tab-navigation" style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'left' ? 'active' : ''}`}
            onClick={() => setActiveTab('left')}
          >
            Left Column
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'center' ? 'active' : ''}`}
            onClick={() => setActiveTab('center')}
          >
            Center Column
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'right' ? 'active' : ''}`}
            onClick={() => setActiveTab('right')}
          >
            Right Column
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social Icons
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'copyright' ? 'active' : ''}`}
            onClick={() => setActiveTab('copyright')}
          >
            Copyright
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'left' && renderColumnForm('leftColumn', 'Left Column')}
        {activeTab === 'center' && renderColumnForm('centerColumn', 'Center Column')}
        {activeTab === 'right' && renderColumnForm('rightColumn', 'Right Column')}

        {activeTab === 'social' && (
          <div className="form-section">
            <h2>Social Icons</h2>

            {/* Add New Social Icon */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3>Add Social Icon</h3>
              
              <div className="form-group">
                <label>Platform Name *</label>
                <input
                  type="text"
                  value={newSocialIcon.platform}
                  onChange={(e) => setNewSocialIcon(prev => ({ ...prev, platform: e.target.value }))}
                  placeholder="e.g., Facebook, Twitter, Instagram"
                  disabled={loading || isUploadingIcon}
                />
              </div>

              <div className="form-group">
                <label>URL *</label>
                <input
                  type="url"
                  value={newSocialIcon.url}
                  onChange={(e) => setNewSocialIcon(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  disabled={loading || isUploadingIcon}
                />
              </div>

              <div className="form-group">
                <label>Icon Image *</label>
                <input
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                  onChange={handleIconFileChange}
                  disabled={loading || isUploadingIcon}
                />
                {iconFile && <p className="file-info">Selected: {iconFile.name}</p>}
              </div>

              <button
                type="button"
                onClick={handleAddSocialIcon}
                className="btn-primary"
                disabled={loading || isUploadingIcon}
              >
                {isUploadingIcon ? 'Uploading...' : 'Add Icon'}
              </button>
            </div>

            {/* Social Icons List */}
            <div className="content-grid">
              {formData.socialIcons.map((icon, index) => (
                <div key={index} className="content-card">
                  <div className="card-image">
                    <img src={icon.iconUrl} alt={icon.platform} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  </div>
                  <div className="card-content">
                    <h3>{icon.platform}</h3>
                    <p className="card-description" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{icon.url}</p>
                    <div className="card-meta">
                      <span className={`status-badge ${icon.isActive ? 'active' : 'inactive'}`}>
                        {icon.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="meta-item">Order: {icon.order}</span>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => handleToggleSocialIcon(index)}
                        className="btn-edit"
                      >
                        {icon.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialIcon(index)}
                        className="btn-delete"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'copyright' && (
          <div className="form-section">
            <h2>Copyright Text</h2>
            
            <div className="language-tabs">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={`language-tab ${activeLanguage === lang ? 'active' : ''}`}
                  onClick={() => setActiveLanguage(lang)}
                >
                  {LANGUAGE_NAMES[lang]}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Copyright Text ({LANGUAGE_NAMES[activeLanguage]}) {activeLanguage === 'en' && <span className="required">*</span>}</label>
              <input
                type="text"
                value={formData.copyrightText[activeLanguage as keyof MultilingualText]}
                onChange={(e) => handleCopyrightChange(activeLanguage, e.target.value)}
                placeholder={`e.g., © 2024 IDOL BE. All rights reserved.`}
                required={activeLanguage === 'en'}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn-primary" disabled={loading || isUploadingIcon}>
            {loading ? 'Saving...' : 'Save Footer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FooterManagement;
