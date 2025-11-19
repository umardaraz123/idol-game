import React, { useState, useEffect } from 'react';
import { logoAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './ContentManagement.css';

interface Logo {
  _id?: string;
  logoUrl: string;
  altText: string;
  width: number;
  height: number;
  isActive: boolean;
}

const LogoManagement: React.FC = () => {
  const [logo, setLogo] = useState<Logo>({
    logoUrl: '',
    altText: 'IDOL BE Logo',
    width: 120,
    height: 40,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await logoAPI.getAdmin();
      if (response.data.data?.logo) {
        setLogo(response.data.data.logo);
        setImagePreview(response.data.data.logo.logoUrl);
      }
    } catch (error: any) {
      console.error('Error fetching logo:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch logo');
      }
    }
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !logo.logoUrl) {
      toast.error('Please upload a logo image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      if (imageFile) {
        formData.append('logo', imageFile);
      }
      
      formData.append('altText', logo.altText);
      formData.append('width', logo.width.toString());
      formData.append('height', logo.height.toString());
      formData.append('isActive', logo.isActive.toString());

      console.log('Submitting FormData with:', {
        hasFile: !!imageFile,
        altText: logo.altText,
        width: logo.width,
        height: logo.height,
        isActive: logo.isActive
      });

      const response = await logoAPI.save(formData);
      
      setLogo(response.data.data.logo);
      setImagePreview(response.data.data.logo.logoUrl);
      setImageFile(null);
      
      toast.success('Logo saved successfully!');
    } catch (error: any) {
      console.error('Error saving logo:', error);
      toast.error(error.response?.data?.message || 'Failed to save logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-management">
      <div className="page-header">
        <h1>Logo Management</h1>
        <p>Manage your website's navbar logo</p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Navbar Logo</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="card-content">
          <div className="form-section">
            <h3>Logo Image</h3>
            
            {imagePreview && (
              <div className="image-preview" style={{ marginBottom: '1rem' }}>
                <img 
                  src={imagePreview} 
                  alt={logo.altText}
                  style={{ 
                    maxWidth: '300px', 
                    height: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            )}

            <div className="form-group">
              <label>Upload New Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
              <small className="form-text">Recommended: PNG or SVG with transparent background</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Logo Settings</h3>
            
            <div className="form-group">
              <label>Alt Text</label>
              <input
                type="text"
                value={logo.altText}
                onChange={(e) => setLogo({ ...logo, altText: e.target.value })}
                className="form-control"
                required
              />
              <small className="form-text">Descriptive text for screen readers and SEO</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Width (px)</label>
                <input
                  type="number"
                  value={logo.width}
                  onChange={(e) => setLogo({ ...logo, width: parseInt(e.target.value) })}
                  className="form-control"
                  min="20"
                  max="500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Height (px)</label>
                <input
                  type="number"
                  value={logo.height}
                  onChange={(e) => setLogo({ ...logo, height: parseInt(e.target.value) })}
                  className="form-control"
                  min="20"
                  max="200"
                  required
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={logo.isActive}
                  onChange={(e) => setLogo({ ...logo, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>
              <small className="form-text">Toggle logo visibility on the website</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Logo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogoManagement;
