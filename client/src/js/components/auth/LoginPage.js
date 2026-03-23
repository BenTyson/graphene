// Login Page Component - Clean, minimal design with company branding
function getLoginPageHtml() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Company Logo -->
        <div class="text-center">
          <img class="mx-auto h-24 w-auto" src="/images/HGraphene_Logo_Iso.png" alt="HGraphene">
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                x-model="loginForm.username"
                :disabled="loginLoading"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your username or email">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  x-model="loginForm.password"
                  :disabled="loginLoading"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password">
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :disabled="loginLoading"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed">
                  <svg x-show="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg x-show="showPassword" x-cloak class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.121 9.88M9.878 9.878a3 3 0 10-.007 4.243m4.242-4.242a3.001 3.001 0 00-.007-4.243M15.121 9.88a3 3 0 11-4.242 4.242"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  x-model="loginForm.rememberMe"
                  :disabled="loginLoading"
                  class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded disabled:cursor-not-allowed">
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  Keep me signed in
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div x-show="loginError" x-cloak class="rounded-md bg-red-50 border border-red-200 p-3">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-800" x-text="loginError"></p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="loginLoading || !loginForm.username || !loginForm.password"
                :class="loginLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:cursor-not-allowed">
                
                <!-- Loading Spinner -->
                <svg x-show="loginLoading" x-cloak class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                
                <span x-text="loginLoading ? 'Signing in...' : 'Sign in'"></span>
              </button>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-gray-500">
          <p>&copy; HGraphene 2026</p>
        </div>
      </div>
    </div>
  `;
}

// Export for use in other components
window.getLoginPageHtml = getLoginPageHtml;