// News Widget Component for Dashboard
function getNewsWidgetHtml() {
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <!-- Widget Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m4 4l-4 4m0 0l-4-4m4 4V7a2 2 0 00-2-2h-3"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900">Latest Graphene News</h3>
            <p class="text-sm text-gray-500">Industry insights and research updates</p>
          </div>
        </div>
        <button 
          @click="activeTab = 'news'; initializeNewsTab()"
          class="text-sm text-black hover:text-gray-700 font-medium">
          View All →
        </button>
      </div>

      <!-- Loading State -->
      <div x-show="headlinesLoading" x-cloak class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
        <span class="ml-2 text-sm text-gray-600">Loading headlines...</span>
      </div>

      <!-- No Headlines State -->
      <div x-show="!headlinesLoading && headlines.length === 0" x-cloak class="text-center py-8">
        <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m4 4l-4 4m0 0l-4-4m4 4V7a2 2 0 00-2-2h-3"></path>
        </svg>
        <p class="text-sm text-gray-500">No recent headlines available</p>
        <button 
          @click="refreshHeadlines()"
          class="mt-2 text-xs text-black hover:text-gray-700 font-medium">
          Refresh
        </button>
      </div>

      <!-- Headlines List -->
      <div x-show="headlines.length > 0" x-cloak class="space-y-4">
        <template x-for="headline in headlines" :key="headline.id">
          <article class="group cursor-pointer" @click="openNewsArticle(headline)">
            <div class="flex space-x-3">
              <!-- Article Image -->
              <div x-show="headline.imageUrls && headline.imageUrls.length > 0" class="flex-shrink-0">
                <img 
                  :src="headline.imageUrls[0]" 
                  :alt="headline.title"
                  @error="$event.target.parentElement.style.display='none'"
                  class="w-16 h-16 rounded-lg object-cover">
              </div>

              <!-- Article Content -->
              <div class="flex-1 min-w-0">
                <!-- Category & Date -->
                <div class="flex items-center space-x-2 mb-1">
                  <span 
                    :class="getCategoryColor(headline.category)"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                    <span x-text="formatCategory(headline.category)"></span>
                  </span>
                  <span class="text-xs text-gray-500" x-text="formatDate(headline.publishDate)"></span>
                </div>

                <!-- Title -->
                <h4 class="text-sm font-medium text-gray-900 group-hover:text-black transition-colors leading-tight line-clamp-2 mb-1" 
                    x-text="headline.title">
                </h4>

                <!-- Source & Relevance -->
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500" x-text="headline.source.name"></span>
                  <div class="flex items-center space-x-1">
                    <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-xs text-gray-500" x-text="headline.relevanceScore.toFixed(1)"></span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </template>

        <!-- View All Button -->
        <div class="pt-4 border-t border-gray-100">
          <button 
            @click="activeTab = 'news'; initializeNewsTab()"
            class="w-full text-center text-sm text-black hover:text-gray-700 font-medium py-2 hover:bg-gray-50 rounded transition-colors">
            View All News Articles
          </button>
        </div>
      </div>
    </div>
  `;
}

// News Widget Functionality
function initializeNewsWidgetFunctionality() {
  return {
    headlines: [],
    headlinesLoading: false,
    headlinesError: null,

    // Fetch latest headlines for dashboard widget
    async fetchHeadlines() {
      this.headlinesLoading = true;
      this.headlinesError = null;

      try {
        const response = await fetch('/api/news/headlines?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch headlines');
        }

        const data = await response.json();
        
        if (data.success) {
          this.headlines = data.data;
        } else {
          throw new Error(data.error || 'Failed to fetch headlines');
        }

      } catch (error) {
        console.error('Error fetching headlines:', error);
        this.headlinesError = error.message;
        this.headlines = [];
      } finally {
        this.headlinesLoading = false;
      }
    },

    // Refresh headlines
    async refreshHeadlines() {
      await this.fetchHeadlines();
    },

    // Open news article in new tab and track view
    openNewsArticle(article) {
      // Track view
      this.trackArticleView(article.id);
      
      // Open article in new tab
      window.open(article.url, '_blank', 'noopener,noreferrer');
    },

    // Track article view
    async trackArticleView(articleId) {
      try {
        await fetch(\`/api/news/articles/\${articleId}\`, {
          method: 'GET'
        });
      } catch (error) {
        console.error('Error tracking article view:', error);
      }
    },

    // Initialize headlines on dashboard load
    async initializeHeadlines() {
      if (this.activeTab === 'dashboard' && this.headlines.length === 0) {
        await this.fetchHeadlines();
      }
    },

    // Auto-refresh headlines every 30 minutes
    startHeadlinesAutoRefresh() {
      setInterval(() => {
        if (this.activeTab === 'dashboard') {
          this.fetchHeadlines();
        }
      }, 30 * 60 * 1000); // 30 minutes
    }
  };
}

// Add to global app functions
window.newsWidgetFunctions = initializeNewsWidgetFunctionality();