import { useState } from 'react';
import { publicAPI } from '../services/api';
import { X, Send, AlertCircle, User, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const ContactModal = ({ isOpen, onClose, title = "Join Our Community", subtitle = "We'd love to hear from you!" }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await publicAPI.submitQuery(formData);
      
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Message sent successfully!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach((error: any) => {
          toast.error(error.msg || error.message || 'Validation error');
        });
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to submit. Please try again.';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', email: '', message: '' });
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={handleClose}>
      <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={handleClose} disabled={loading}>
          <X size={24} />
        </button>

        <div className="contact-modal-content">
          {/* Header */}
          <div className="contact-modal-header">
            <div className="modal-icon-wrapper">
              <div className="modal-icon-circle">
                <Send size={32} />
              </div>
              <div className="modal-icon-glow"></div>
            </div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-subtitle">{subtitle}</p>
          </div>

          {/* Success State */}
          {success && (
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
              <h3 className="success-title">Message Sent!</h3>
              <p className="success-text">Thank you for reaching out. We'll get back to you soon!</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="contact-form">
              {error && (
                <div className="form-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="form-group-modal">
                <label htmlFor="name">
                  <User size={16} />
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="message">
                  <MessageSquare size={16} />
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="modal-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="modal-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
