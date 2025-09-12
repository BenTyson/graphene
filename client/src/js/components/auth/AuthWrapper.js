// Authentication Wrapper Component
// Handles login/logout flow and app initialization
function getAuthWrapperHtml() {
  return `
    <div x-data="authWrapper()" x-init="init()">
      <!-- Login Screen -->
      <div x-show="!isAuthenticated && !isLoading" x-cloak>
        <div x-html="getLoginPageHtml()"></div>
      </div>

      <!-- Loading Screen -->
      <div x-show="isLoading" x-cloak class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p class="text-gray-600">Initializing application...</p>
        </div>
      </div>

      <!-- Main Application -->
      <div x-show="isAuthenticated && !isLoading" x-cloak x-data="grapheneApp()">
        <!-- Header with logout -->
        <header class="border-b border-gray-200 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center">
                <img class="h-8 w-8 mr-3" src="/src/assets/images/HGraphene_Logo_Iso.jpg" alt="HGraphene">
                <h1 class="text-2xl font-bold tracking-tight">HGRAPHENE</h1>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500" x-text="new Date().toLocaleDateString()"></span>
                <div class="flex items-center space-x-2 text-sm text-gray-600" x-data="authWrapper()">
                  <span x-text="currentUser?.firstName + ' ' + currentUser?.lastName"></span>
                  <span class="px-2 py-1 bg-gray-100 rounded text-xs" x-text="currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Team Member'"></span>
                  <button @click="logout()" 
                          class="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded hover:bg-gray-100 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Include the original app content here -->
        <div id="original-app-content"></div>
      </div>
    </div>
  `;
}

// Alpine.js Auth Wrapper Component
function authWrapper() {
  return {
    isAuthenticated: false,
    isLoading: true,
    currentUser: null,
    loginForm: {
      username: '',
      password: '',
      rememberMe: false
    },
    loginError: '',
    loginLoading: false,
    showPassword: false,

    async init() {
      try {
        // Check if user is already authenticated
        if (window.authService.isLoggedIn()) {
          this.currentUser = window.authService.getCurrentUser();
          this.isAuthenticated = true;
        } else if (window.authService.getStoredToken()) {
          // Try to validate existing token
          await window.authService.validateToken();
          this.currentUser = window.authService.getCurrentUser();
          this.isAuthenticated = true;
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        window.authService.clearAuth();
      } finally {
        this.isLoading = false;
      }
    },

    async handleLogin() {
      this.loginLoading = true;
      this.loginError = '';

      try {
        const response = await window.authService.login(this.loginForm);
        this.currentUser = response.user;
        this.isAuthenticated = true;
        
        // Clear form
        this.loginForm = {
          username: '',
          password: '',
          rememberMe: false
        };
      } catch (error) {
        console.error('Login failed:', error);
        this.loginError = error.message || 'Login failed. Please try again.';
      } finally {
        this.loginLoading = false;
      }
    },

    async logout() {
      try {
        await window.authService.logout();
      } catch (error) {
        console.warn('Logout error:', error);
      } finally {
        this.isAuthenticated = false;
        this.currentUser = null;
        // Reload to ensure clean state
        window.location.reload();
      }
    }
  };
}

// Export for use in other components
window.getAuthWrapperHtml = getAuthWrapperHtml;
window.authWrapper = authWrapper;