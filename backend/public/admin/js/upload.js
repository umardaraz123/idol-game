// Upload Management Module for Idol Be Admin Panel

class UploadManager {
    constructor() {
        this.currentFiles = [];
        this.uploadProgress = {};
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            video: ['video/mp4', 'video/webm', 'video/ogg', 'video/mov']
        };
    }

    // Initialize upload manager
    async init() {
        console.log('Initializing Upload Manager...');
        
        try {
            this.initializeUploadPage();
        } catch (error) {
            console.error('Upload Manager initialization error:', error);
            Utils.showToast('Failed to initialize upload manager', 'error');
        }
    }

    // Initialize upload page
    initializeUploadPage() {
        const uploadPage = document.getElementById('upload-page');
        if (!uploadPage) return;

        uploadPage.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Upload Media</h2>
                    <p>Upload images and videos to your media library</p>
                </div>
                <div class="header-actions">
                    <button class="btn-neon purple" onclick="showPage('media')">
                        <i class="fas fa-images"></i> View Library
                    </button>
                </div>
            </div>
            
            <div class="upload-container" style="max-width: 800px; margin: 0 auto;">
                <div class="upload-zone" id="upload-zone" style="
                    border: 2px dashed var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: 3rem;
                    text-align: center;
                    background: var(--bg-secondary);
                    transition: all var(--transition-normal);
                    cursor: pointer;
                    margin-bottom: 2rem;
                " onclick="document.getElementById('file-input').click()"
                   ondrop="window.UploadManager.handleDrop(event)"
                   ondragover="window.UploadManager.handleDragOver(event)"
                   ondragenter="window.UploadManager.handleDragEnter(event)"
                   ondragleave="window.UploadManager.handleDragLeave(event)">
                   
                    <div class="upload-icon" style="margin-bottom: 1.5rem;">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; color: var(--neon-blue);"></i>
                    </div>
                    
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                        Drag & Drop Your Files Here
                    </h3>
                    
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                        Or click to select files from your computer
                    </p>
                    
                    <div class="upload-info" style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; color: var(--text-muted); font-size: 0.9rem;">
                        <span><i class="fas fa-image"></i> Images: JPG, PNG, GIF, WebP, SVG</span>
                        <span><i class="fas fa-video"></i> Videos: MP4, WebM, OGG, MOV</span>
                        <span><i class="fas fa-weight-hanging"></i> Max size: 100MB</span>
                    </div>
                    
                    <input type="file" id="file-input" multiple accept="image/*,video/*" style="display: none;" onchange="window.UploadManager.handleFileSelect(this.files)">
                </div>
                
                <div class="upload-settings" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem; display: none;" id="upload-settings">
                    <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Upload Settings</h3>
                    
                    <div class="settings-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div class="form-group">
                            <label>Default Category</label>
                            <select id="default-category" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                                <option value="general">General</option>
                                <option value="hero_background">Hero Background</option>
                                <option value="hero_video">Hero Video</option>
                                <option value="about_image">About Image</option>
                                <option value="game_screenshot">Game Screenshot</option>
                                <option value="character_image">Character Image</option>
                                <option value="feature_icon">Feature Icon</option>
                                <option value="team_photo">Team Photo</option>
                                <option value="logo">Logo</option>
                                <option value="thumbnail">Thumbnail</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Image Quality</label>
                            <select id="image-quality" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                                <option value="auto">Auto (Recommended)</option>
                                <option value="100">Best (100%)</option>
                                <option value="90">High (90%)</option>
                                <option value="80">Good (80%)</option>
                                <option value="70">Medium (70%)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 1.5rem;">
                        <label>Default Description</label>
                        <input type="text" id="default-description" placeholder="Optional description for all files..." style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                    </div>
                </div>
                
                <div class="upload-queue" id="upload-queue" style="display: none;">
                    <div class="queue-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--text-primary);">Upload Queue (<span id="queue-count">0</span> files)</h3>
                        <div class="queue-actions">
                            <button class="btn-neon purple" onclick="window.UploadManager.clearQueue()">
                                <i class="fas fa-trash"></i> Clear Queue
                            </button>
                            <button class="btn-neon" onclick="window.UploadManager.startUpload()" id="start-upload-btn">
                                <i class="fas fa-upload"></i> Start Upload
                            </button>
                        </div>
                    </div>
                    
                    <div id="file-queue" class="file-queue">
                        <!-- Upload queue items will be rendered here -->
                    </div>
                    
                    <div class="upload-progress" id="upload-progress" style="margin-top: 1.5rem; display: none;">
                        <div class="progress-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <span style="color: var(--text-primary); font-weight: 600;">Overall Progress</span>
                            <span id="overall-progress-text" style="color: var(--text-secondary);">0%</span>
                        </div>
                        <div class="progress-bar" style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                            <div id="overall-progress-fill" style="height: 100%; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple)); width: 0%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Prevent default drag behaviors
        document.addEventListener('dragenter', this.preventDefault);
        document.addEventListener('dragover', this.preventDefault);
        document.addEventListener('dragleave', this.preventDefault);
        document.addEventListener('drop', this.preventDefault);
    }

    // Prevent default drag behavior
    preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Handle drag enter
    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.style.borderColor = 'var(--neon-blue)';
        e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
    }

    // Handle drag over
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Handle drag leave
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.backgroundColor = 'var(--bg-secondary)';
    }

    // Handle drop
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.backgroundColor = 'var(--bg-secondary)';

        const files = e.dataTransfer.files;
        this.handleFileSelect(files);
    }

    // Handle file selection
    handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        });

        if (errors.length > 0) {
            Utils.showToast(`Some files were rejected:\n${errors.join('\n')}`, 'warning');
        }

        if (validFiles.length > 0) {
            this.addFilesToQueue(validFiles);
        }
    }

    // Validate file
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File size (${Utils.formatFileSize(file.size)}) exceeds maximum allowed size (${Utils.formatFileSize(this.maxFileSize)})`
            };
        }

        // Check file type
        const isValidImage = this.allowedTypes.image.includes(file.type);
        const isValidVideo = this.allowedTypes.video.includes(file.type);

        if (!isValidImage && !isValidVideo) {
            return {
                valid: false,
                error: `File type '${file.type}' is not supported`
            };
        }

        return { valid: true };
    }

    // Add files to queue
    addFilesToQueue(files) {
        files.forEach(file => {
            const fileId = Utils.generateId();
            this.currentFiles.push({
                id: fileId,
                file: file,
                status: 'pending',
                progress: 0,
                category: document.getElementById('default-category')?.value || 'general',
                description: document.getElementById('default-description')?.value || '',
                error: null
            });
        });

        this.renderUploadQueue();
        this.showUploadSettings();
    }

    // Show upload settings
    showUploadSettings() {
        const settingsEl = document.getElementById('upload-settings');
        const queueEl = document.getElementById('upload-queue');
        
        if (settingsEl) settingsEl.style.display = 'block';
        if (queueEl) queueEl.style.display = 'block';
    }

    // Render upload queue
    renderUploadQueue() {
        const queueCountEl = document.getElementById('queue-count');
        const fileQueueEl = document.getElementById('file-queue');
        
        if (queueCountEl) queueCountEl.textContent = this.currentFiles.length;
        
        if (!fileQueueEl) return;

        if (this.currentFiles.length === 0) {
            fileQueueEl.innerHTML = `
                <div class="empty-queue" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <p>No files in queue</p>
                </div>
            `;
            return;
        }

        const queueHTML = this.currentFiles.map(fileItem => {
            const { id, file, status, progress, category, description, error } = fileItem;
            const icon = Utils.getFileIcon(file.type);
            const statusColor = this.getStatusColor(status);
            
            return `
                <div class="queue-item" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    padding: 1rem;
                    margin-bottom: 1rem;
                " data-file-id="${id}">
                    
                    <div class="item-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div class="file-icon" style="color: var(--neon-blue); font-size: 1.5rem;">
                            <i class="${icon}"></i>
                        </div>
                        
                        <div class="file-info" style="flex: 1; min-width: 0;">
                            <h4 style="color: var(--text-primary); margin-bottom: 0.25rem; word-break: break-word;">
                                ${Utils.sanitizeHTML(file.name)}
                            </h4>
                            <div style="display: flex; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <span>${Utils.formatFileSize(file.size)}</span>
                                <span>${file.type}</span>
                            </div>
                        </div>
                        
                        <div class="file-status" style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: ${statusColor}; font-size: 0.9rem; text-transform: capitalize;">
                                ${status}
                            </span>
                            <button class="btn-neon" style="background: var(--neon-red); padding: 4px 8px; font-size: 0.8rem;" onclick="window.UploadManager.removeFromQueue('${id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="item-settings" style="display: grid; grid-template-columns: 200px 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="form-group">
                            <label style="font-size: 0.9rem;">Category</label>
                            <select onchange="window.UploadManager.updateFileCategory('${id}', this.value)" style="width: 100%; padding: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary); font-size: 0.9rem;">
                                <option value="general" ${category === 'general' ? 'selected' : ''}>General</option>
                                <option value="hero_background" ${category === 'hero_background' ? 'selected' : ''}>Hero Background</option>
                                <option value="hero_video" ${category === 'hero_video' ? 'selected' : ''}>Hero Video</option>
                                <option value="about_image" ${category === 'about_image' ? 'selected' : ''}>About Image</option>
                                <option value="game_screenshot" ${category === 'game_screenshot' ? 'selected' : ''}>Game Screenshot</option>
                                <option value="character_image" ${category === 'character_image' ? 'selected' : ''}>Character Image</option>
                                <option value="feature_icon" ${category === 'feature_icon' ? 'selected' : ''}>Feature Icon</option>
                                <option value="team_photo" ${category === 'team_photo' ? 'selected' : ''}>Team Photo</option>
                                <option value="logo" ${category === 'logo' ? 'selected' : ''}>Logo</option>
                                <option value="thumbnail" ${category === 'thumbnail' ? 'selected' : ''}>Thumbnail</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-size: 0.9rem;">Description (Optional)</label>
                            <input type="text" value="${Utils.sanitizeHTML(description)}" 
                                   onchange="window.UploadManager.updateFileDescription('${id}', this.value)"
                                   placeholder="Enter description..."
                                   style="width: 100%; padding: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary); font-size: 0.9rem;">
                        </div>
                    </div>
                    
                    ${status === 'uploading' ? `
                        <div class="upload-progress" style="margin-bottom: 1rem;">
                            <div class="progress-header" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--text-primary); font-size: 0.9rem;">Uploading...</span>
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">${progress}%</span>
                            </div>
                            <div class="progress-bar" style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple)); width: ${progress}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${error ? `
                        <div class="error-message" style="background: rgba(255, 59, 59, 0.1); border: 1px solid var(--neon-red); border-radius: var(--border-radius); padding: 0.75rem; color: var(--neon-red); font-size: 0.9rem;">
                            <i class="fas fa-exclamation-triangle"></i> ${Utils.sanitizeHTML(error)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        fileQueueEl.innerHTML = queueHTML;
    }

    // Get status color
    getStatusColor(status) {
        switch (status) {
            case 'pending': return 'var(--text-secondary)';
            case 'uploading': return 'var(--neon-blue)';
            case 'completed': return 'var(--neon-green)';
            case 'error': return 'var(--neon-red)';
            default: return 'var(--text-secondary)';
        }
    }

    // Update file category
    updateFileCategory(fileId, category) {
        const fileItem = this.currentFiles.find(f => f.id === fileId);
        if (fileItem) {
            fileItem.category = category;
        }
    }

    // Update file description
    updateFileDescription(fileId, description) {
        const fileItem = this.currentFiles.find(f => f.id === fileId);
        if (fileItem) {
            fileItem.description = description;
        }
    }

    // Remove from queue
    removeFromQueue(fileId) {
        this.currentFiles = this.currentFiles.filter(f => f.id !== fileId);
        this.renderUploadQueue();
        
        if (this.currentFiles.length === 0) {
            document.getElementById('upload-settings').style.display = 'none';
            document.getElementById('upload-queue').style.display = 'none';
        }
    }

    // Clear queue
    clearQueue() {
        Utils.confirmDialog('Are you sure you want to clear the upload queue?', () => {
            this.currentFiles = [];
            this.uploadProgress = {};
            document.getElementById('upload-settings').style.display = 'none';
            document.getElementById('upload-queue').style.display = 'none';
        });
    }

    // Start upload
    async startUpload() {
        if (this.currentFiles.length === 0) {
            Utils.showToast('No files to upload', 'warning');
            return;
        }

        const startBtn = document.getElementById('start-upload-btn');
        const progressEl = document.getElementById('upload-progress');
        
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }
        
        if (progressEl) progressEl.style.display = 'block';

        try {
            let completed = 0;
            const total = this.currentFiles.length;

            for (const fileItem of this.currentFiles) {
                await this.uploadSingleFile(fileItem);
                completed++;
                this.updateOverallProgress((completed / total) * 100);
            }

            Utils.showToast(`Successfully uploaded ${completed} files!`, 'success');
            
            // Clear successful uploads
            setTimeout(() => {
                this.currentFiles = this.currentFiles.filter(f => f.status === 'error');
                this.renderUploadQueue();
                
                if (this.currentFiles.length === 0) {
                    document.getElementById('upload-settings').style.display = 'none';
                    document.getElementById('upload-queue').style.display = 'none';
                }
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            Utils.showToast('Upload failed: ' + error.message, 'error');
        } finally {
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-upload"></i> Start Upload';
            }
        }
    }

    // Upload single file
    async uploadSingleFile(fileItem) {
        const { id, file, category, description } = fileItem;
        
        try {
            // Update status
            fileItem.status = 'uploading';
            fileItem.progress = 0;
            this.renderUploadQueue();

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('description', description);

            // Get quality setting
            const quality = document.getElementById('image-quality')?.value || 'auto';
            if (quality !== 'auto') {
                formData.append('quality', quality);
            }

            // Upload file with progress tracking
            const response = await API.uploadFile(formData, (progress) => {
                fileItem.progress = progress;
                this.renderUploadQueue();
            });

            if (response.success) {
                fileItem.status = 'completed';
                fileItem.progress = 100;
            } else {
                throw new Error(response.message || 'Upload failed');
            }

        } catch (error) {
            fileItem.status = 'error';
            fileItem.error = error.message;
            throw error;
        }
    }

    // Update overall progress
    updateOverallProgress(percentage) {
        const progressText = document.getElementById('overall-progress-text');
        const progressFill = document.getElementById('overall-progress-fill');
        
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
        if (progressFill) progressFill.style.width = `${percentage}%`;
    }
}

// Create global UploadManager instance
window.UploadManager = new UploadManager();