// Dashboard Module for Idol Be Admin Panel

class DashboardManager {
    constructor() {
        this.stats = null;
        this.recentContent = [];
        this.charts = {};
    }

    // Initialize dashboard
    async init() {
        console.log('Initializing Dashboard...');
        
        try {
            // Load dashboard data
            await this.loadDashboardData();
            
            // Update dashboard UI
            this.updateDashboard();
            
            // Setup refresh timer
            this.setupAutoRefresh();
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            Utils.showToast('Failed to load dashboard data', 'error');
        }
    }

    // Load dashboard data
    async loadDashboardData() {
        try {
            // Load statistics
            const [statsResponse, contentResponse] = await Promise.all([
                API.getPublicStats(),
                API.getContents({ limit: 5, sort: 'createdAt', order: 'desc' })
            ]);

            if (statsResponse.success) {
                this.stats = statsResponse.data;
            }

            if (contentResponse.success) {
                this.recentContent = contentResponse.data.contents || [];
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    // Update dashboard UI
    updateDashboard() {
        this.updateStatCards();
        this.updateRecentContent();
    }

    // Update stat cards
    updateStatCards() {
        if (!this.stats) return;

        // Update main stat cards
        const dashContentCount = document.getElementById('dash-content-count');
        const dashMediaCount = document.getElementById('dash-media-count');
        const dashFeaturedCount = document.getElementById('dash-featured-count');

        if (dashContentCount && this.stats.content) {
            dashContentCount.textContent = Utils.formatNumber(this.stats.content.active || 0);
            this.animateCounter(dashContentCount, 0, this.stats.content.active || 0);
        }

        if (dashMediaCount && this.stats.media) {
            dashMediaCount.textContent = Utils.formatNumber(this.stats.media.total || 0);
            this.animateCounter(dashMediaCount, 0, this.stats.media.total || 0);
        }

        if (dashFeaturedCount && this.stats.content) {
            dashFeaturedCount.textContent = Utils.formatNumber(this.stats.content.featured || 0);
            this.animateCounter(dashFeaturedCount, 0, this.stats.content.featured || 0);
        }

        // Update header stats too
        if (window.App) {
            window.App.updateHeaderStats(this.stats);
        }
    }

    // Animate counter
    animateCounter(element, start, end, duration = 2000) {
        if (start === end) return;

        const range = end - start;
        const minTimer = 50;
        const stepTime = Math.abs(Math.floor(duration / range));
        const timer = Math.max(stepTime, minTimer);

        let current = start;
        const increment = range > 0 ? 1 : -1;

        const obj = setInterval(() => {
            current += increment;
            element.textContent = Utils.formatNumber(current);

            if (current === end) {
                clearInterval(obj);
            }
        }, timer);
    }

    // Update recent content
    updateRecentContent() {
        const recentContentList = document.getElementById('recent-content-list');
        if (!recentContentList) return;

        if (this.recentContent.length === 0) {
            recentContentList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
                    <p>No content created yet</p>
                    <button class="btn-neon" onclick="showPage('content'); showContentForm();" style="padding: 8px 16px; font-size: 0.9rem;">
                        Create First Content
                    </button>
                </div>
            `;
            return;
        }

        const recentContentHTML = this.recentContent.map(content => {
            const icon = Utils.getContentTypeIcon(content.type);
            const typeLabel = Utils.getContentTypeLabel(content.type);
            
            return `
                <div class="content-item">
                    <div class="content-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="content-info">
                        <h4>${Utils.sanitizeHTML(content.title?.en || content.key)}</h4>
                        <p>${typeLabel} • ${Utils.formatDate(content.createdAt)}</p>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn-small" onclick="editContent('${content._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        recentContentList.innerHTML = recentContentHTML;

        // Add animation
        recentContentList.querySelectorAll('.content-item').forEach((item, index) => {
            setTimeout(() => {
                Utils.animateElement(item, 'slide-in-left');
            }, index * 100);
        });
    }

    // Setup auto refresh
    setupAutoRefresh() {
        // Refresh dashboard every 5 minutes
        setInterval(async () => {
            try {
                await this.loadDashboardData();
                this.updateDashboard();
                console.log('Dashboard auto-refreshed');
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        }, 5 * 60 * 1000);
    }

    // Get content type distribution
    getContentTypeDistribution() {
        if (!this.stats || !this.stats.contentByType) return {};
        return this.stats.contentByType;
    }

    // Refresh dashboard manually
    async refresh() {
        const refreshButton = document.querySelector('.refresh-btn');
        if (refreshButton) {
            Utils.setLoadingState(refreshButton, true, 'Refreshing...');
        }

        try {
            await this.loadDashboardData();
            this.updateDashboard();
            Utils.showToast('Dashboard refreshed', 'success', 2000);
        } catch (error) {
            Utils.showToast('Failed to refresh dashboard', 'error');
        } finally {
            if (refreshButton) {
                Utils.setLoadingState(refreshButton, false);
            }
        }
    }
}

// Global functions for HTML
function editContent(contentId) {
    if (window.ContentManager) {
        window.App.showPage('content');
        setTimeout(() => {
            window.ContentManager.editContent(contentId);
        }, 100);
    }
}

function showContentForm() {
    if (window.ContentManager) {
        window.ContentManager.showCreateForm();
    }
}

// Create global Dashboard instance
window.Dashboard = new DashboardManager();