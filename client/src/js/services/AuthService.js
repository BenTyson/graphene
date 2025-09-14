// Authentication Service - Handles token storage, API calls, and auth state
class AuthService {
  constructor() {
    // Don't initialize auth service in iframe context (like PDF viewers)
    if (window.self !== window.top) {
      console.log('AuthService: Skipping initialization in iframe context');
      return;
    }
    
    this.baseURL = window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin;
    this.token = this.getStoredToken();
    this.user = null;
    this.isAuthenticated = false;
    
    // Initialize auth state on service creation
    this.initializeAuth();
  }

  // Initialize authentication state
  async initializeAuth() {
    if (this.token) {
      try {
        await this.validateToken();
      } catch (error) {
        console.warn('Token validation failed during initialization:', error);
        this.clearAuth();
      }
    }
  }

  // Get stored token from localStorage
  getStoredToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // Store token in localStorage or sessionStorage
  storeToken(token, rememberMe = false) {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken');
    }
    this.token = token;
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
  }

  // Login user with credentials
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      this.storeToken(data.data.token, credentials.rememberMe);
      this.user = data.data.user;
      this.isAuthenticated = true;

      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Validate current token and get user info
  async validateToken() {
    if (!this.token) {
      throw new Error('No token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      this.user = data.data.user;
      this.isAuthenticated = true;

      return data;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  // Get current user info
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isLoggedIn() {
    return this.isAuthenticated && this.token && this.user;
  }

  // Get authorization header
  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  // Make authenticated API request
  async authenticatedFetch(url, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle unauthorized responses
      if (response.status === 401) {
        this.clearAuth();
        window.location.reload(); // Redirect to login
        throw new Error('Session expired');
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  // Check if user is super admin
  isSuperAdmin() {
    return this.hasRole('SUPER_ADMIN');
  }

  // Check if user is team member or higher
  isTeamMember() {
    return this.hasRole('TEAM_MEMBER') || this.isSuperAdmin();
  }
}

// Create singleton instance
const authService = new AuthService();

// Export for use in other components
window.authService = authService;