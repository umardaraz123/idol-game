// API Client for Idol Be Admin Panel

class APIClient {
    constructor() {
        this.baseURL = '/api';
        this.token = this.getStoredToken();
    }

    // Get stored token
    getStoredToken() {
        return localStorage.getItem('adminToken') || null;
    }

    // Set token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.removeItem('adminToken');
        }
    }

    // Get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
            ...options
        };

        try {
            console.log(`API Request: ${config.method} ${url}`, config);
            
            const response = await fetch(url, config);
            const data = await response.json();

            console.log(`API Response: ${response.status}`, data);

            if (!response.ok) {
                throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle token expiration
            if (error.message.includes('Token') || error.message.includes('401')) {
                this.handleTokenExpiration();
            }
            
            throw error;
        }
    }

    // Handle token expiration
    handleTokenExpiration() {
        this.setToken(null);
        window.location.reload(); // This will show login screen
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint);
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Upload file
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            credentials: 'include',
            body: formData
        };

        try {
            console.log(`File Upload: ${url}`, formData);
            
            const response = await fetch(url, config);
            const data = await response.json();

            console.log(`Upload Response: ${response.status}`, data);

            if (!response.ok) {
                throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            
            if (error.message.includes('Token') || error.message.includes('401')) {
                this.handleTokenExpiration();
            }
            
            throw error;
        }
    }

    // Auth methods
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setToken(null);
        }
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    async updateProfile(data) {
        return this.put('/auth/profile', data);
    }

    async changePassword(data) {
        return this.put('/auth/change-password', data);
    }

    async verifyToken() {
        return this.get('/auth/verify');
    }

    // Content methods
    async getContents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/content${queryString ? `?${queryString}` : ''}`);
    }

    async getContent(id) {
        return this.get(`/content/${id}`);
    }

    async createContent(data) {
        return this.post('/content', data);
    }

    async updateContent(id, data) {
        return this.put(`/content/${id}`, data);
    }

    async deleteContent(id) {
        return this.delete(`/content/${id}`);
    }

    async reorderContent(updates) {
        return this.put('/content/bulk/reorder', { updates });
    }

    async getContentMeta() {
        return this.get('/content/meta/info');
    }

    // Media methods
    async getMediaFiles(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/upload/files${queryString ? `?${queryString}` : ''}`);
    }

    async getMediaFile(id) {
        return this.get(`/upload/files/${id}`);
    }

    async uploadSingleFile(formData) {
        return this.uploadFile('/upload/single', formData);
    }

    async uploadMultipleFiles(formData) {
        return this.uploadFile('/upload/multiple', formData);
    }

    async updateMediaFile(id, data) {
        return this.put(`/upload/files/${id}`, data);
    }

    async deleteMediaFile(id) {
        return this.delete(`/upload/files/${id}`);
    }

    // Public API methods (for testing)
    async getPublicContent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/public/content${queryString ? `?${queryString}` : ''}`);
    }

    async getPublicStats() {
        return this.get('/public/stats');
    }

    async searchPublicContent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/public/search${queryString ? `?${queryString}` : ''}`);
    }

    async getPublicMeta() {
        return this.get('/public/meta');
    }
}

// Create global API instance
window.API = new APIClient();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}