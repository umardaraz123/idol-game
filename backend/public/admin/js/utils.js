// Utility Functions for Idol Be Admin Panel

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const colors = {
        success: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        error: 'linear-gradient(135deg, #ff3366, #cc1144)',
        warning: 'linear-gradient(135deg, #ffdd00, #ccaa00)',
        info: 'linear-gradient(135deg, #00d4ff, #0099cc)'
    };

    Toastify({
        text: message,
        duration: duration,
        gravity: "top",
        position: "right",
        style: {
            background: colors[type] || colors.info,
            borderRadius: "8px",
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
        },
        stopOnFocus: true
    }).showToast();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Format date
function formatDate(dateString, includeTime = true) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    return date.toLocaleDateString('en-US', options);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function validatePassword(password) {
    return password && password.length >= 6;
}

// Generate random string
function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success', 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'success', 2000);
        } catch (fallbackErr) {
            showToast('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Create loading spinner
function createLoadingSpinner(size = 'medium') {
    const sizes = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-inline';
    spinner.style.cssText = `
        width: ${sizes[size]};
        height: ${sizes[size]};
        border: 2px solid var(--bg-tertiary);
        border-top: 2px solid var(--neon-blue);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    `;
    return spinner;
}

// Show loading state
function setLoadingState(element, loading, loadingText = 'Loading...') {
    if (loading) {
        element.disabled = true;
        element.classList.add('loading');
        
        if (element.dataset.originalText === undefined) {
            element.dataset.originalText = element.textContent;
        }
        
        element.innerHTML = `
            <span style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                ${createLoadingSpinner('small').outerHTML}
                <span>${loadingText}</span>
            </span>
        `;
    } else {
        element.disabled = false;
        element.classList.remove('loading');
        element.innerHTML = element.dataset.originalText || 'Submit';
    }
}

// Sanitize HTML
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Convert text to slug
function textToSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

// Get file icon based on type
function getFileIcon(mimeType, resourceType = 'image') {
    if (resourceType === 'video') {
        return 'fas fa-video';
    }
    
    if (mimeType.startsWith('image/')) {
        return 'fas fa-image';
    }
    
    switch (mimeType) {
        case 'application/pdf':
            return 'fas fa-file-pdf';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'fas fa-file-word';
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'fas fa-file-excel';
        default:
            return 'fas fa-file';
    }
}

// Get content type icon
function getContentTypeIcon(type) {
    const icons = {
        hero_section: 'fas fa-home',
        about_section: 'fas fa-info-circle',
        game_highlights: 'fas fa-gamepad',
        who_is_ana: 'fas fa-user',
        features: 'fas fa-list',
        artist_team: 'fas fa-users',
        footer: 'fas fa-footer',
        navbar: 'fas fa-bars',
        general: 'fas fa-file-alt'
    };
    return icons[type] || 'fas fa-file-alt';
}

// Animate element
function animateElement(element, animation = 'fade-in', duration = 500) {
    element.style.animationDuration = `${duration}ms`;
    element.classList.add(animation);
    
    setTimeout(() => {
        element.classList.remove(animation);
        element.style.animationDuration = '';
    }, duration);
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get language label
function getLanguageLabel(code) {
    const labels = {
        en: 'English',
        hi: 'हिन्दी (Hindi)',
        ru: 'Русский (Russian)',
        ko: '한국어 (Korean)',
        zh: '中文 (Chinese)',
        ja: '日本語 (Japanese)',
        es: 'Español (Spanish)'
    };
    return labels[code] || code.toUpperCase();
}

// Get content type label
function getContentTypeLabel(type) {
    const labels = {
        hero_section: 'Hero Section',
        about_section: 'About Section',
        game_highlights: 'Game Highlights',
        who_is_ana: 'Who is Ana',
        features: 'Features',
        artist_team: 'Artist Team',
        footer: 'Footer',
        navbar: 'Navigation Bar',
        general: 'General Content'
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Create confirmation dialog
function confirmDialog(message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    
    const dialog = document.createElement('div');
    dialog.className = 'modal-content';
    dialog.style.cssText = `
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    dialog.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <i class="fas fa-question-circle" style="font-size: 3rem; color: var(--neon-yellow); margin-bottom: 1rem;"></i>
            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Confirm Action</h3>
            <p style="color: var(--text-secondary); margin: 0;">${message}</p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="confirm-yes" class="btn-neon" style="padding: 10px 20px;">Yes</button>
            <button id="confirm-no" class="btn-neon purple" style="padding: 10px 20px;">Cancel</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const yesBtn = dialog.querySelector('#confirm-yes');
    const noBtn = dialog.querySelector('#confirm-no');
    
    const cleanup = () => {
        document.body.removeChild(overlay);
    };
    
    yesBtn.addEventListener('click', () => {
        cleanup();
        if (onConfirm) onConfirm();
    });
    
    noBtn.addEventListener('click', () => {
        cleanup();
        if (onCancel) onCancel();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            cleanup();
            if (onCancel) onCancel();
        }
    });
}

// Export for use in other modules
window.Utils = {
    showToast,
    formatFileSize,
    formatDate,
    debounce,
    validateEmail,
    validatePassword,
    generateRandomString,
    copyToClipboard,
    createLoadingSpinner,
    setLoadingState,
    sanitizeHTML,
    textToSlug,
    getFileIcon,
    getContentTypeIcon,
    animateElement,
    isInViewport,
    scrollToElement,
    formatNumber,
    getLanguageLabel,
    getContentTypeLabel,
    confirmDialog
};