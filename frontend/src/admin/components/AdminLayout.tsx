import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="logo-text">IDOL BE</h2>
          <p className="admin-badge">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/content" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-file-alt"></i>
            <span>Content</span>
          </NavLink>

          <NavLink to="/admin/game-highlights" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-gamepad"></i>
            <span>Game Highlights</span>
          </NavLink>

          <NavLink to="/admin/features" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-star"></i>
            <span>Features</span>
          </NavLink>

          <NavLink to="/admin/team" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-users"></i>
            <span>Artist Team</span>
          </NavLink>

          <NavLink to="/admin/media" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-images"></i>
            <span>Media Library</span>
          </NavLink>

          <NavLink to="/admin/upload" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <i className="fas fa-cloud-upload-alt"></i>
            <span>Upload</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="profile-info">
              <p className="profile-name">{admin?.name || admin?.email}</p>
              <p className="profile-role">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
            Back to Main Site
          </button>
        </header>

        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
