// Main Application Logic for Idol Be Admin Panel

class IdolBeAdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarCollapsed = false;
        this.isMobile = window.innerWidth < 768;
        this.init();
    }

    // Initialize the application
    init() {
        console.log('Initializing Idol Be Admin App...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    // Setup the application
    setup() {
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize responsive behavior
        this.initializeResponsive();
        
        // Load dashboard by default
        this.showPage('dashboard');
        
        // Load initial data
        this.loadInitialData();
        
        console.log('Admin App initialized successfully');
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Sidebar toggle
        document.querySelectorAll('.sidebar-toggle, .mobile-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleSidebar());
        });

        // User menu toggle
        const userMenuBtn = document.querySelector('.user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(e.target) && !e.target.closest('.user-menu-btn')) {
                userMenu.classList.remove('show');
            }
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('href').substring(1);
                this.showPage(page);
            });
        });

        // Close modal overlay
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideModal();
                }
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });

        // Window resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    // Initialize responsive behavior
    initializeResponsive() {
        this.handleResize();
    }

    // Handle window resize
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (wasMobile !== this.isMobile) {
            // Mobile state changed
            if (this.isMobile) {
                // Entering mobile mode
                document.querySelector('.sidebar').classList.remove('collapsed');
                this.sidebarCollapsed = false;
            } else {
                // Leaving mobile mode
                document.querySelector('.sidebar').classList.remove('show');
            }
        }
    }

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        
        if (this.isMobile) {
            // Mobile: slide in/out
            sidebar.classList.toggle('show');
        } else {
            // Desktop: collapse/expand
            sidebar.classList.toggle('collapsed');
            this.sidebarCollapsed = !this.sidebarCollapsed;
        }
    }

    // Toggle user menu
    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.classList.toggle('show');
        }
    }

    // Show page
    showPage(pageName) {
        console.log(`Navigating to page: ${pageName}`);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            Utils.animateElement(targetPage, 'fade-in');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[href="#${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update page title
        const pageTitles = {
            dashboard: 'Dashboard',
            content: 'Content Management',
            media: 'Media Library',
            upload: 'Upload Files',
            settings: 'Settings',
            profile: 'Profile'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = pageTitles[pageName] || 'Admin Panel';
        }

        // Close mobile sidebar
        if (this.isMobile) {
            document.querySelector('.sidebar').classList.remove('show');
        }

        // Store current page
        this.currentPage = pageName;

        // Initialize page-specific functionality
        this.initializePage(pageName);
    }

    // Initialize page-specific functionality
    initializePage(pageName) {
        switch (pageName) {
            case 'dashboard':
                if (window.Dashboard && window.Dashboard.init) {
                    window.Dashboard.init();
                }
                break;
            case 'content':
                if (window.ContentManager && window.ContentManager.init) {
                    window.ContentManager.init();
                }
                break;
            case 'media':
                if (window.MediaManager && window.MediaManager.init) {
                    window.MediaManager.init();
                }
                break;
            case 'upload':
                if (window.UploadManager && window.UploadManager.init) {
                    window.UploadManager.init();
                }
                break;
            case 'settings':
                this.initializeSettingsPage();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
        }
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load stats for header
            const statsResponse = await API.getPublicStats();
            if (statsResponse.success) {
                this.updateHeaderStats(statsResponse.data);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Update header stats
    updateHeaderStats(stats) {
        const totalContentEl = document.getElementById('total-content');
        const totalMediaEl = document.getElementById('total-media');

        if (totalContentEl && stats.content) {
            totalContentEl.textContent = Utils.formatNumber(stats.content.active || 0);
        }

        if (totalMediaEl && stats.media) {
            totalMediaEl.textContent = Utils.formatNumber(stats.media.total || 0);
        }
    }

    // Show modal
    showModal(content) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = modalOverlay.querySelector('.modal-content');
        
        if (modalContent) {
            modalContent.innerHTML = content;
        }
        
        modalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    hideModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.remove('show');
        document.body.style.overflow = '';
        
        // Clear content after transition
        setTimeout(() => {
            const modalContent = modalOverlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = '';
            }
        }, 300);
    }

    // Initialize settings page
    initializeSettingsPage() {
        const settingsPage = document.getElementById('settings-page');
        if (!settingsPage) return;

        settingsPage.innerHTML = `
            <div class="page-header">
                <h2>Settings</h2>
                <p>Configure your admin panel preferences</p>
            </div>
            
            <div class="settings-grid" style="display: grid; gap: 2rem; max-width: 800px;">
                <div class="setting-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">System Information</h3>
                    <div class="info-grid" style="display: grid; gap: 1rem;">
                        <div class="info-item" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                            <span style="color: var(--text-secondary);">Version:</span>
                            <span style="color: var(--text-primary);">1.0.0</span>
                        </div>
                        <div class="info-item" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                            <span style="color: var(--text-secondary);">Environment:</span>
                            <span style="color: var(--neon-blue);">Development</span>
                        </div>
                        <div class="info-item" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span style="color: var(--text-secondary);">API Status:</span>
                            <span style="color: var(--neon-green);">✅ Connected</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Supported Languages</h3>
                    <div class="language-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${['en', 'hi', 'ru', 'ko', 'zh', 'ja', 'es'].map(lang => `
                            <div class="language-item" style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--border-radius); text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌐</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${Utils.getLanguageLabel(lang)}</div>
                                <div style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">${lang}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize profile page
    initializeProfilePage() {
        const profilePage = document.getElementById('profile-page');
        if (!profilePage) return;

        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;

        profilePage.innerHTML = `
            <div class="page-header">
                <h2>Profile Settings</h2>
                <p>Manage your account information</p>
            </div>
            
            <div class="profile-content" style="max-width: 600px;">
                <form id="profile-form" class="form-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 2rem; color: var(--text-primary);">Personal Information</h3>
                    
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="profile-name" style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Full Name</label>
                        <input type="text" id="profile-name" value="${Utils.sanitizeHTML(currentUser.name)}" required
                               style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="profile-email" style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Email Address</label>
                        <input type="email" id="profile-email" value="${Utils.sanitizeHTML(currentUser.email)}" required
                               style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Role</label>
                        <div style="padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-secondary);">
                            ${currentUser.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-neon" style="width: 100%; padding: 12px;">
                        Update Profile
                    </button>
                </form>
                
                <form id="password-form" class="form-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 2rem;">
                    <h3 style="margin-bottom: 2rem; color: var(--text-primary);">Change Password</h3>
                    
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="current-password" style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Current Password</label>
                        <input type="password" id="current-password" required
                               style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="new-password" style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">New Password</label>
                        <input type="password" id="new-password" required minlength="6"
                               style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label for="confirm-password" style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Confirm New Password</label>
                        <input type="password" id="confirm-password" required minlength="6"
                               style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    
                    <button type="submit" class="btn-neon purple" style="width: 100%; padding: 12px;">
                        Change Password
                    </button>
                </form>
            </div>
        `;

        // Add form handlers
        this.setupProfileForm();
        this.setupPasswordForm();
    }

    // Setup profile form
    setupProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('profile-name');
            const emailInput = document.getElementById('profile-email');
            const submitBtn = form.querySelector('button[type="submit"]');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            if (!name || !email) {
                Utils.showToast('Please fill in all fields', 'error');
                return;
            }

            if (!Utils.validateEmail(email)) {
                Utils.showToast('Please enter a valid email address', 'error');
                return;
            }

            Utils.setLoadingState(submitBtn, true, 'Updating...');

            try {
                await window.Auth.updateProfile({ name, email });
            } catch (error) {
                // Error handled in auth manager
            } finally {
                Utils.setLoadingState(submitBtn, false);
            }
        });
    }

    // Setup password form
    setupPasswordForm() {
        const form = document.getElementById('password-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPasswordInput = document.getElementById('current-password');
            const newPasswordInput = document.getElementById('new-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const submitBtn = form.querySelector('button[type="submit"]');

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                Utils.showToast('Please fill in all fields', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                Utils.showToast('New passwords do not match', 'error');
                return;
            }

            if (!Utils.validatePassword(newPassword)) {
                Utils.showToast('New password must be at least 6 characters', 'error');
                return;
            }

            Utils.setLoadingState(submitBtn, true, 'Changing...');

            try {
                await window.Auth.changePassword({
                    currentPassword,
                    newPassword,
                    confirmPassword
                });

                // Clear form on success
                form.reset();
            } catch (error) {
                // Error handled in auth manager
            } finally {
                Utils.setLoadingState(submitBtn, false);
            }
        });
    }
}

// Global functions referenced in HTML
function showPage(pageName) {
    if (window.App) {
        window.App.showPage(pageName);
    }
}

function toggleSidebar() {
    if (window.App) {
        window.App.toggleSidebar();
    }
}

function toggleUserMenu() {
    if (window.App) {
        window.App.toggleUserMenu();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App = new IdolBeAdminApp();
});