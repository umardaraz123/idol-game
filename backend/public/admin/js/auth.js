// Authentication Module for Idol Be Admin Panel

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    // Initialize authentication
    async init() {
        console.log('Initializing Auth Manager...');
        
        // Check if we have a stored token
        const token = API.getStoredToken();
        if (token) {
            try {
                // Verify the token
                const response = await API.verifyToken();
                if (response.success) {
                    this.currentUser = response.data.admin;
                    this.isAuthenticated = true;
                    console.log('User authenticated:', this.currentUser);
                    this.showAdminPanel();
                    return;
                }
            } catch (error) {
                console.log('Token verification failed:', error.message);
                API.setToken(null);
            }
        }
        
        // Show login screen
        this.showLoginScreen();
    }

    // Show login screen
    showLoginScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        
        // Add login form handler
        this.setupLoginForm();
    }

    // Show admin panel
    showAdminPanel() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        
        // Update user info in sidebar
        this.updateUserInfo();
        
        // Initialize admin panel
        if (window.App && window.App.init) {
            window.App.init();
        }
    }

    // Setup login form
    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberCheck = document.getElementById('remember');
        const errorDiv = document.getElementById('login-error');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Clear any previous error
        errorDiv.style.display = 'none';
        
        // Pre-fill email for demo
        emailInput.value = 'idolbeadmin@idolbe.com';

        // Form submission handler
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberCheck.checked;

            // Validate inputs
            if (!email || !password) {
                this.showLoginError('Please enter both email and password');
                return;
            }

            if (!Utils.validateEmail(email)) {
                this.showLoginError('Please enter a valid email address');
                return;
            }

            if (!Utils.validatePassword(password)) {
                this.showLoginError('Password must be at least 6 characters');
                return;
            }

            // Show loading state
            Utils.setLoadingState(submitButton, true, 'Signing In...');
            errorDiv.style.display = 'none';

            try {
                // Attempt login
                const response = await API.login({
                    email,
                    password,
                    rememberMe: remember
                });

                if (response.success) {
                    this.currentUser = response.data.admin;
                    this.isAuthenticated = true;
                    
                    Utils.showToast('Login successful! Welcome back.', 'success');
                    
                    // Small delay for better UX
                    setTimeout(() => {
                        this.showAdminPanel();
                    }, 500);
                } else {
                    this.showLoginError(response.message || 'Login failed');
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.showLoginError(error.message || 'Login failed. Please try again.');
            } finally {
                Utils.setLoadingState(submitButton, false);
            }
        });

        // Enter key handler
        [emailInput, passwordInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        });
    }

    // Show login error
    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        Utils.animateElement(errorDiv, 'fade-in');
    }

    // Update user info in sidebar
    updateUserInfo() {
        if (!this.currentUser) return;

        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');

        if (userNameEl) userNameEl.textContent = this.currentUser.name;
        if (userEmailEl) userEmailEl.textContent = this.currentUser.email;
    }

    // Logout
    async logout() {
        try {
            // Show confirmation
            Utils.confirmDialog(
                'Are you sure you want to logout?',
                async () => {
                    try {
                        // Call logout API
                        await API.logout();
                        
                        // Reset state
                        this.currentUser = null;
                        this.isAuthenticated = false;
                        
                        Utils.showToast('Logged out successfully', 'info');
                        
                        // Show login screen
                        setTimeout(() => {
                            this.showLoginScreen();
                        }, 500);
                        
                    } catch (error) {
                        console.error('Logout error:', error);
                        Utils.showToast('Logout failed', 'error');
                    }
                }
            );
        } catch (error) {
            console.error('Logout error:', error);
            Utils.showToast('Logout failed', 'error');
        }
    }

    // Check if user has permission
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Super admin has all permissions
        if (this.currentUser.role === 'super_admin') return true;
        
        // Check specific permission
        return this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if authenticated
    getIsAuthenticated() {
        return this.isAuthenticated;
    }

    // Update profile
    async updateProfile(data) {
        try {
            const response = await API.updateProfile(data);
            
            if (response.success) {
                this.currentUser = response.data.admin;
                this.updateUserInfo();
                Utils.showToast('Profile updated successfully', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Utils.showToast(error.message || 'Failed to update profile', 'error');
            throw error;
        }
    }

    // Change password
    async changePassword(data) {
        try {
            const response = await API.changePassword(data);
            
            if (response.success) {
                Utils.showToast('Password changed successfully', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            Utils.showToast(error.message || 'Failed to change password', 'error');
            throw error;
        }
    }
}

// Password toggle function (referenced in HTML)
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Create global Auth instance
window.Auth = new AuthManager();

// Global logout function (referenced in HTML)
function logout() {
    window.Auth.logout();
}