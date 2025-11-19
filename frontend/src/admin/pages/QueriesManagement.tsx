import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { RefreshCw, AlertTriangle, Inbox, Mail, MailOpen, CheckCircle, Loader2, User, Clock, Eye, Trash2, X, Calendar, Info, MessageSquare, Reply } from 'lucide-react';
import './QueriesManagement.css';

interface Query {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: string;
  updatedAt: string;
}

const QueriesManagement = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getQueries();
      setQueries(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'new' | 'read' | 'responded') => {
    try {
      await adminAPI.updateQueryStatus(id, newStatus);
      setQueries(prev =>
        prev.map(q => (q._id === id ? { ...q, status: newStatus } : q))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this query?')) {
      return;
    }

    try {
      await adminAPI.deleteQuery(id);
      setQueries(prev => prev.filter(q => q._id !== id));
      if (selectedQuery?._id === id) {
        setSelectedQuery(null);
        setShowDetails(false);
      }
      toast.success('Query deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete query');
    }
  };

  const handleViewDetails = (query: Query) => {
    setSelectedQuery(query);
    setShowDetails(true);
    if (query.status === 'new') {
      handleStatusChange(query._id, 'read');
    }
  };

  const filteredQueries = (queries || []).filter(q => 
    filterStatus === 'all' || q.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { label: 'New', class: 'status-new' },
      read: { label: 'Read', class: 'status-read' },
      responded: { label: 'Responded', class: 'status-responded' }
    };
    return badges[status as keyof typeof badges] || badges.new;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const stats = {
    total: (queries || []).length,
    new: (queries || []).filter(q => q.status === 'new').length,
    read: (queries || []).filter(q => q.status === 'read').length,
    responded: (queries || []).filter(q => q.status === 'responded').length
  };

  return (
    <div className="queries-page">
      <div className="page-header">
        <div>
          <h1>User Queries</h1>
          <p>Manage messages and inquiries from users</p>
        </div>
        <button onClick={fetchQueries} className="btn-refresh" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Inbox size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Queries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon new">
            <Mail size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.new}</h3>
            <p>New Messages</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon read">
            <MailOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.read}</h3>
            <p>Read</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon responded">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.responded}</h3>
            <p>Responded</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="queries-filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({queries.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
          onClick={() => setFilterStatus('new')}
        >
          New ({stats.new})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
          onClick={() => setFilterStatus('read')}
        >
          Read ({stats.read})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'responded' ? 'active' : ''}`}
          onClick={() => setFilterStatus('responded')}
        >
          Responded ({stats.responded})
        </button>
      </div>

      {/* Queries Table */}
      {loading && queries.length === 0 ? (
        <div className="loading-state">
          <Loader2 size={32} className="spinning" />
          <p>Loading queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} />
          <h3>No Queries Found</h3>
          <p>{filterStatus === 'all' ? 'No queries yet' : `No ${filterStatus} queries`}</p>
        </div>
      ) : (
        <div className="queries-table-container">
          <table className="queries-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message Preview</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => {
                const badge = getStatusBadge(query.status);
                return (
                  <tr 
                    key={query._id} 
                    className={`query-row ${query.status === 'new' ? 'unread' : ''}`}
                  >
                    <td>
                      <span className={`status-badge ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="name-cell">
                      <User size={16} />
                      {query.name}
                    </td>
                    <td className="email-cell">
                      <Mail size={16} />
                      {query.email}
                    </td>
                    <td className="message-preview">
                      {query.message.length > 60
                        ? `${query.message.substring(0, 60)}...`
                        : query.message}
                    </td>
                    <td className="date-cell">
                      <Clock size={16} />
                      {formatDate(query.createdAt)}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(query)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <select
                        className="status-select"
                        value={query.status}
                        onChange={(e) => handleStatusChange(query._id, e.target.value as any)}
                        title="Change Status"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="responded">Responded</option>
                      </select>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(query._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedQuery && (
        <div className="query-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="query-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-query">
              <h2>Query Details</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-query">
              <div className="query-detail-section">
                <label><User size={16} /> Name</label>
                <p>{selectedQuery.name}</p>
              </div>

              <div className="query-detail-section">
                <label><Mail size={16} /> Email</label>
                <p>
                  <a href={`mailto:${selectedQuery.email}`}>{selectedQuery.email}</a>
                </p>
              </div>

              <div className="query-detail-section">
                <label><Calendar size={16} /> Received</label>
                <p>{new Date(selectedQuery.createdAt).toLocaleString()}</p>
              </div>

              <div className="query-detail-section">
                <label><Info size={16} /> Status</label>
                <select
                  className="status-select-modal"
                  value={selectedQuery.status}
                  onChange={(e) => {
                    handleStatusChange(selectedQuery._id, e.target.value as any);
                    setSelectedQuery({ ...selectedQuery, status: e.target.value as any });
                  }}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                </select>
              </div>

              <div className="query-detail-section message-section">
                <label><MessageSquare size={16} /> Message</label>
                <div className="message-content">
                  {selectedQuery.message}
                </div>
              </div>

              <div className="modal-actions">
                <a 
                  href={`mailto:${selectedQuery.email}?subject=Re: Your inquiry&body=Hi ${selectedQuery.name},%0D%0A%0D%0A`}
                  className="btn-reply"
                >
                  <Reply size={16} />
                  Reply via Email
                </a>
                <button
                  className="btn-delete-modal"
                  onClick={() => {
                    handleDelete(selectedQuery._id);
                    setShowDetails(false);
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesManagement;
