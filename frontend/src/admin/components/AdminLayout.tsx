import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, Rocket, Info, Gamepad2, Star, Users, Music, Mail, Columns, Image, Shield, LogOut, ArrowLeft } from 'lucide-react';
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
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/content" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={20} />
            <span>Content</span>
          </NavLink>

          <NavLink to="/admin/hero" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Rocket size={20} />
            <span>Hero Section</span>
          </NavLink>

          <NavLink to="/admin/about-features" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Info size={20} />
            <span>About Features</span>
          </NavLink>

          <NavLink to="/admin/game-highlights" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Gamepad2 size={20} />
            <span>Game Highlights</span>
          </NavLink>

          <NavLink to="/admin/features" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Star size={20} />
            <span>Features</span>
          </NavLink>

          <NavLink to="/admin/team" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} />
            <span>Artist Team</span>
          </NavLink>

          <NavLink to="/admin/songs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Music size={20} />
            <span>Songs</span>
          </NavLink>

          <NavLink to="/admin/queries" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Mail size={20} />
            <span>Queries</span>
          </NavLink>

          <NavLink to="/admin/footer" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Columns size={20} />
            <span>Footer</span>
          </NavLink>

          <NavLink to="/admin/logo" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Image size={20} />
            <span>Logo</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-icon">
              <Shield size={24} />
            </div>
            <div className="profile-info">
              <p className="profile-name">{admin?.name || admin?.email}</p>
              <p className="profile-role">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
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
