// Media Management Module for Idol Be Admin Panel

class MediaManager {
    constructor() {
        this.mediaFiles = [];
        this.filters = {
            category: '',
            resourceType: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 24
        };
    }

    // Initialize media manager
    async init() {
        console.log('Initializing Media Manager...');
        
        try {
            this.initializeMediaPage();
            await this.loadMediaFiles();
        } catch (error) {
            console.error('Media Manager initialization error:', error);
            Utils.showToast('Failed to initialize media manager', 'error');
        }
    }

    // Initialize media page
    initializeMediaPage() {
        const mediaPage = document.getElementById('media-page');
        if (!mediaPage) return;

        mediaPage.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Media Library</h2>
                    <p>Manage your images and videos</p>
                </div>
                <div class="header-actions">
                    <button class="btn-neon" onclick="showPage('upload')">
                        <i class="fas fa-upload"></i> Upload Files
                    </button>
                </div>
            </div>
            
            <div class="media-filters" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                <div class="filter-row" style="display: grid; grid-template-columns: 1fr 200px 150px 100px; gap: 1rem; align-items: end;">
                    <div class="form-group">
                        <label>Search Files</label>
                        <input type="text" id="media-search" placeholder="Search by filename or description..." style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="media-category-filter" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            <option value="">All Categories</option>
                            <option value="hero_background">Hero Background</option>
                            <option value="hero_video">Hero Video</option>
                            <option value="about_image">About Image</option>
                            <option value="game_screenshot">Game Screenshot</option>
                            <option value="character_image">Character Image</option>
                            <option value="feature_icon">Feature Icon</option>
                            <option value="team_photo">Team Photo</option>
                            <option value="logo">Logo</option>
                            <option value="thumbnail">Thumbnail</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="media-type-filter" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            <option value="">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                        </select>
                    </div>
                    <button class="btn-neon purple" onclick="window.MediaManager.applyFilters()" style="height: 40px;">
                        Filter
                    </button>
                </div>
            </div>
            
            <div class="media-list-container">
                <div id="media-loading" class="loading-placeholder" style="display: none; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                    <p>Loading media files...</p>
                </div>
                
                <div id="media-grid" class="media-grid">
                    <!-- Media items will be loaded here -->
                </div>
                
                <div id="media-pagination" class="pagination-container" style="margin-top: 2rem;">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('media-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.filters.search = searchInput.value;
                this.pagination.page = 1;
                this.loadMediaFiles();
            }, 500));
        }
    }

    // Load media files
    async loadMediaFiles() {
        const loadingEl = document.getElementById('media-loading');
        const gridEl = document.getElementById('media-grid');
        
        if (loadingEl) loadingEl.style.display = 'block';
        if (gridEl) gridEl.innerHTML = '';

        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await API.getMediaFiles(params);
            
            if (response.success) {
                this.mediaFiles = response.data.files || [];
                this.pagination = response.data.pagination || this.pagination;
                this.renderMediaGrid();
                this.renderPagination();
            } else {
                throw new Error(response.message || 'Failed to load media files');
            }

        } catch (error) {
            console.error('Error loading media files:', error);
            Utils.showToast('Failed to load media files', 'error');
            
            if (gridEl) {
                gridEl.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--neon-red); margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Failed to Load Media</h3>
                        <p>${error.message}</p>
                        <button class="btn-neon" onclick="window.MediaManager.loadMediaFiles()" style="margin-top: 1rem;">
                            Try Again
                        </button>
                    </div>
                `;
            }
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    // Render media grid
    renderMediaGrid() {
        const gridEl = document.getElementById('media-grid');
        if (!gridEl) return;

        if (this.mediaFiles.length === 0) {
            gridEl.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;">
                    <i class="fas fa-images" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">No Media Files Found</h3>
                    <p>Upload your first media file to get started.</p>
                    <button class="btn-neon" onclick="showPage('upload')" style="margin-top: 1rem;">
                        Upload Files
                    </button>
                </div>
            `;
            return;
        }

        gridEl.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        `;

        const mediaHTML = this.mediaFiles.map(file => {
            const icon = Utils.getFileIcon(file.mimeType, file.resourceType);
            const isImage = file.resourceType === 'image';
            const isVideo = file.resourceType === 'video';
            
            return `
                <div class="media-card" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='var(--glow-blue)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                   
                    <div class="media-preview" style="height: 200px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                        ${isImage ? `
                            <img src="${file.secureUrl}" alt="${file.originalName}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div style="display: none; flex-direction: column; align-items: center; color: var(--text-muted);">
                                <i class="${icon}" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <span>Image Preview Unavailable</span>
                            </div>
                        ` : isVideo ? `
                            <video style="width: 100%; height: 100%; object-fit: cover;" preload="metadata">
                                <source src="${file.secureUrl}" type="${file.mimeType}">
                            </video>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); border-radius: 50%; padding: 15px;">
                                <i class="fas fa-play" style="color: white; font-size: 1.5rem;"></i>
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; align-items: center; color: var(--text-muted);">
                                <i class="${icon}" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <span>${file.format?.toUpperCase() || 'File'}</span>
                            </div>
                        `}
                        
                        <div class="media-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; gap: 1rem;">
                            <button class="btn-neon" onclick="window.MediaManager.viewFile('${file._id}')" style="padding: 8px 12px; font-size: 0.9rem;">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-neon purple" onclick="window.MediaManager.editFile('${file._id}')" style="padding: 8px 12px; font-size: 0.9rem;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                    
                    <div class="media-info" style="padding: 1rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.95rem; word-break: break-word;">
                            ${Utils.sanitizeHTML(file.originalName)}
                        </h4>
                        
                        <div class="media-meta" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--text-secondary);">
                                ${file.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--text-secondary);">
                                ${Utils.formatFileSize(file.size)}
                            </span>
                            ${file.dimensions ? `
                                <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--text-secondary);">
                                    ${file.dimensions.width}×${file.dimensions.height}
                                </span>
                            ` : ''}
                        </div>
                        
                        <div class="media-actions" style="display: flex; gap: 0.5rem;">
                            <button class="btn-neon" onclick="window.MediaManager.copyUrl('${file.secureUrl}')" style="flex: 1; padding: 6px 10px; font-size: 0.8rem;">
                                <i class="fas fa-copy"></i> Copy URL
                            </button>
                            <button class="btn-neon" style="background: var(--neon-red); padding: 6px 10px; font-size: 0.8rem;" onclick="window.MediaManager.deleteFile('${file._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        gridEl.innerHTML = mediaHTML;

        // Add hover effects
        gridEl.querySelectorAll('.media-card').forEach(card => {
            const overlay = card.querySelector('.media-overlay');
            if (overlay) {
                card.addEventListener('mouseenter', () => {
                    overlay.style.display = 'flex';
                });
                card.addEventListener('mouseleave', () => {
                    overlay.style.display = 'none';
                });
            }
        });

        // Animate media cards
        gridEl.querySelectorAll('.media-card').forEach((card, index) => {
            setTimeout(() => {
                Utils.animateElement(card, 'scale-in');
            }, index * 30);
        });
    }

    // Render pagination
    renderPagination() {
        const paginationEl = document.getElementById('media-pagination');
        if (!paginationEl || !this.pagination.totalPages || this.pagination.totalPages <= 1) {
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        const { currentPage, totalPages } = this.pagination;
        
        paginationEl.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem;">
                <button class="btn-neon ${currentPage === 1 ? 'disabled' : ''}" 
                        onclick="window.MediaManager.goToPage(${currentPage - 1})"
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                
                <span style="color: var(--text-secondary);">
                    Page ${currentPage} of ${totalPages}
                </span>
                
                <button class="btn-neon ${currentPage === totalPages ? 'disabled' : ''}"
                        onclick="window.MediaManager.goToPage(${currentPage + 1})"
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    // Apply filters
    applyFilters() {
        const categoryFilter = document.getElementById('media-category-filter');
        const typeFilter = document.getElementById('media-type-filter');
        
        this.filters.category = categoryFilter?.value || '';
        this.filters.resourceType = typeFilter?.value || '';
        this.pagination.page = 1;
        
        this.loadMediaFiles();
    }

    // Go to page
    goToPage(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        this.pagination.page = page;
        this.loadMediaFiles();
    }

    // View file
    viewFile(fileId) {
        Utils.showToast('File viewer - Coming soon!', 'info');
    }

    // Edit file
    editFile(fileId) {
        Utils.showToast('File editor - Coming soon!', 'info');
    }

    // Copy URL
    copyUrl(url) {
        Utils.copyToClipboard(url);
    }

    // Delete file
    deleteFile(fileId) {
        Utils.confirmDialog(
            'Are you sure you want to delete this file? This action cannot be undone.',
            async () => {
                try {
                    const response = await API.deleteMediaFile(fileId);
                    if (response.success) {
                        Utils.showToast('File deleted successfully', 'success');
                        this.loadMediaFiles();
                    }
                } catch (error) {
                    Utils.showToast('Failed to delete file: ' + error.message, 'error');
                }
            }
        );
    }
}

// Create global MediaManager instance
window.MediaManager = new MediaManager();