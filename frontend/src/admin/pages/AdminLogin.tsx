import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Mail, Lock, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <h1 className="neon-text">IDOL BE</h1>
            <p className="subtitle">Admin Portal</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@idolbe.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinning" /> Logging in...
              </>
            ) : (
              <>
                <LogIn size={18} /> Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Main Site
          </p>
        </div>
      </div>

      <div className="login-bg">
        <div className="gradient-overlay"></div>
      </div>
    </div>
  );
};

export default AdminLogin;
