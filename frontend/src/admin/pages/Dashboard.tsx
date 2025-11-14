import { useState, useEffect } from 'react';
import { contentAPI, mediaAPI } from '../../services/api';
import './Dashboard.css';

interface Stats {
  totalContent: number;
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    totalMedia: 0,
    totalImages: 0,
    totalVideos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [contentRes, mediaRes] = await Promise.all([
        contentAPI.getAll(),
        mediaAPI.getAll(),
      ]);

      const mediaFiles = mediaRes.data.data.files || [];
      const images = mediaFiles.filter((f: any) => f.resourceType === 'image');
      const videos = mediaFiles.filter((f: any) => f.resourceType === 'video');

      setStats({
        totalContent: contentRes.data.data.content?.length || 0,
        totalMedia: mediaFiles.length,
        totalImages: images.length,
        totalVideos: videos.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: 'fas fa-file-alt',
      color: '#00d4ff',
      bg: 'rgba(0, 212, 255, 0.1)',
    },
    {
      title: 'Total Media',
      value: stats.totalMedia,
      icon: 'fas fa-images',
      color: '#b537f2',
      bg: 'rgba(181, 55, 242, 0.1)',
    },
    {
      title: 'Images',
      value: stats.totalImages,
      icon: 'fas fa-image',
      color: '#00ff88',
      bg: 'rgba(0, 255, 136, 0.1)',
    },
    {
      title: 'Videos',
      value: stats.totalVideos,
      icon: 'fas fa-video',
      color: '#ff3b3b',
      bg: 'rgba(255, 59, 59, 0.1)',
    },
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to Idol Be Admin Panel</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ background: card.bg, borderColor: card.color }}
          >
            <div className="stat-icon" style={{ color: card.color }}>
              <i className={card.icon}></i>
            </div>
            <div className="stat-info">
              <h3 style={{ color: card.color }}>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => window.location.href = '/admin/content'}>
              <i className="fas fa-plus"></i>
              Create Content
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/admin/upload'}>
              <i className="fas fa-cloud-upload-alt"></i>
              Upload Media
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/admin/media'}>
              <i className="fas fa-images"></i>
              Browse Media
            </button>
          </div>
        </div>

        <div className="section-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <p className="no-activity">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
