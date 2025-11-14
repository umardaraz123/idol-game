// Content Management Module for Idol Be Admin Panel

class ContentManager {
    constructor() {
        this.contents = [];
        this.currentContent = null;
        this.filters = {
            type: '',
            isActive: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20
        };
    }

    // Initialize content manager
    async init() {
        console.log('Initializing Content Manager...');
        
        try {
            // Initialize content page
            this.initializeContentPage();
            
            // Load content list
            await this.loadContents();
            
        } catch (error) {
            console.error('Content Manager initialization error:', error);
            Utils.showToast('Failed to initialize content manager', 'error');
        }
    }

    // Initialize content page
    initializeContentPage() {
        const contentPage = document.getElementById('content-page');
        if (!contentPage) return;

        contentPage.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Content Management</h2>
                    <p>Manage your multi-language content</p>
                </div>
                <div class="header-actions">
                    <button class="btn-neon" onclick="window.ContentManager.showCreateForm()">
                        <i class="fas fa-plus"></i> Add Content
                    </button>
                </div>
            </div>
            
            <div class="content-filters" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                <div class="filter-row" style="display: grid; grid-template-columns: 1fr 200px 150px 100px; gap: 1rem; align-items: end;">
                    <div class="form-group">
                        <label>Search Content</label>
                        <input type="text" id="content-search" placeholder="Search by title, key, or tags..." style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                    <div class="form-group">
                        <label>Content Type</label>
                        <select id="content-type-filter" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            <option value="">All Types</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="content-status-filter" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            <option value="">All</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <button class="btn-neon purple" onclick="window.ContentManager.applyFilters()" style="height: 40px;">
                        Filter
                    </button>
                </div>
            </div>
            
            <div class="content-list-container">
                <div id="content-loading" class="loading-placeholder" style="display: none; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                    <p>Loading content...</p>
                </div>
                
                <div id="content-list" class="content-grid">
                    <!-- Content items will be loaded here -->
                </div>
                
                <div id="content-pagination" class="pagination-container" style="margin-top: 2rem;">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
        
        // Load content types for filter
        this.loadContentTypes();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('content-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.filters.search = searchInput.value;
                this.pagination.page = 1;
                this.loadContents();
            }, 500));
        }
    }

    // Load content types for filter
    async loadContentTypes() {
        try {
            const response = await API.getContentMeta();
            if (response.success) {
                const typeSelect = document.getElementById('content-type-filter');
                if (typeSelect && response.data.contentTypes) {
                    response.data.contentTypes.forEach(type => {
                        const option = document.createElement('option');
                        option.value = type;
                        option.textContent = Utils.getContentTypeLabel(type);
                        typeSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading content types:', error);
        }
    }

    // Load contents
    async loadContents() {
        const loadingEl = document.getElementById('content-loading');
        const listEl = document.getElementById('content-list');
        
        if (loadingEl) loadingEl.style.display = 'block';
        if (listEl) listEl.innerHTML = '';

        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await API.getContents(params);
            
            if (response.success) {
                this.contents = response.data.contents || [];
                this.pagination = response.data.pagination || this.pagination;
                this.renderContentList();
                this.renderPagination();
            } else {
                throw new Error(response.message || 'Failed to load contents');
            }

        } catch (error) {
            console.error('Error loading contents:', error);
            Utils.showToast('Failed to load content', 'error');
            
            if (listEl) {
                listEl.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--neon-red); margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Failed to Load Content</h3>
                        <p>${error.message}</p>
                        <button class="btn-neon" onclick="window.ContentManager.loadContents()" style="margin-top: 1rem;">
                            Try Again
                        </button>
                    </div>
                `;
            }
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    // Render content list
    renderContentList() {
        const listEl = document.getElementById('content-list');
        if (!listEl) return;

        if (this.contents.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">No Content Found</h3>
                    <p>Create your first piece of content to get started.</p>
                    <button class="btn-neon" onclick="window.ContentManager.showCreateForm()" style="margin-top: 1rem;">
                        Create Content
                    </button>
                </div>
            `;
            return;
        }

        listEl.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
        `;

        const contentHTML = this.contents.map(content => {
            const icon = Utils.getContentTypeIcon(content.type);
            const typeLabel = Utils.getContentTypeLabel(content.type);
            const isActive = content.metadata?.isActive !== false;
            const isFeatured = content.metadata?.isFeatured === true;
            
            return `
                <div class="content-card" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: 1.5rem;
                    transition: all var(--transition-normal);
                    position: relative;
                    ${!isActive ? 'opacity: 0.6;' : ''}
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='var(--glow-blue)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                   
                    <div class="content-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <div class="content-type" style="display: flex; align-items: center; gap: 8px;">
                            <i class="${icon}" style="color: var(--neon-blue);"></i>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">${typeLabel}</span>
                        </div>
                        <div class="content-badges">
                            ${isFeatured ? '<span style="background: var(--neon-yellow); color: var(--bg-primary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">Featured</span>' : ''}
                            <span style="background: ${isActive ? 'var(--neon-green)' : 'var(--neon-red)'}; color: var(--bg-primary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                                ${isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.1rem;">
                        ${Utils.sanitizeHTML(content.title?.en || content.key)}
                    </h4>
                    
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Key: <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${content.key}</code>
                    </p>
                    
                    ${content.description?.en ? `
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.4;">
                            ${Utils.sanitizeHTML(content.description.en.substring(0, 120))}${content.description.en.length > 120 ? '...' : ''}
                        </p>
                    ` : ''}
                    
                    <div class="content-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <span style="color: var(--text-muted); font-size: 0.8rem;">
                            Updated ${Utils.formatDate(content.updatedAt)}
                        </span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">
                            Order: ${content.metadata?.order || 0}
                        </span>
                    </div>
                    
                    <div class="content-actions" style="display: flex; gap: 0.5rem;">
                        <button class="btn-neon" onclick="window.ContentManager.editContent('${content._id}')" style="flex: 1; padding: 8px 12px; font-size: 0.9rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-neon purple" onclick="window.ContentManager.duplicateContent('${content._id}')" style="padding: 8px 12px; font-size: 0.9rem;">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-neon" style="background: var(--neon-red); padding: 8px 12px; font-size: 0.9rem;" onclick="window.ContentManager.deleteContent('${content._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        listEl.innerHTML = contentHTML;

        // Animate content cards
        listEl.querySelectorAll('.content-card').forEach((card, index) => {
            setTimeout(() => {
                Utils.animateElement(card, 'scale-in');
            }, index * 50);
        });
    }

    // Render pagination (simplified version)
    renderPagination() {
        const paginationEl = document.getElementById('content-pagination');
        if (!paginationEl || !this.pagination.totalPages || this.pagination.totalPages <= 1) {
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        const { currentPage, totalPages } = this.pagination;
        
        paginationEl.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem;">
                <button class="btn-neon ${currentPage === 1 ? 'disabled' : ''}" 
                        onclick="window.ContentManager.goToPage(${currentPage - 1})"
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                
                <span style="color: var(--text-secondary);">
                    Page ${currentPage} of ${totalPages}
                </span>
                
                <button class="btn-neon ${currentPage === totalPages ? 'disabled' : ''}"
                        onclick="window.ContentManager.goToPage(${currentPage + 1})"
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    // Apply filters
    applyFilters() {
        const typeFilter = document.getElementById('content-type-filter');
        const statusFilter = document.getElementById('content-status-filter');
        
        this.filters.type = typeFilter?.value || '';
        this.filters.isActive = statusFilter?.value || '';
        this.pagination.page = 1;
        
        this.loadContents();
    }

    // Go to page
    goToPage(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        this.pagination.page = page;
        this.loadContents();
    }

    // Show create form
    showCreateForm() {
        Utils.showToast('Content creation form - Coming soon!', 'info');
    }

    // Edit content
    editContent(contentId) {
        Utils.showToast('Content editing - Coming soon!', 'info');
    }

    // Duplicate content
    duplicateContent(contentId) {
        Utils.confirmDialog(
            'Are you sure you want to duplicate this content?',
            () => {
                Utils.showToast('Content duplication - Coming soon!', 'info');
            }
        );
    }

    // Delete content
    deleteContent(contentId) {
        Utils.confirmDialog(
            'Are you sure you want to delete this content? This action cannot be undone.',
            async () => {
                try {
                    const response = await API.deleteContent(contentId);
                    if (response.success) {
                        Utils.showToast('Content deleted successfully', 'success');
                        this.loadContents();
                    }
                } catch (error) {
                    Utils.showToast('Failed to delete content: ' + error.message, 'error');
                }
            }
        );
    }
}

// Create global ContentManager instance
window.ContentManager = new ContentManager();