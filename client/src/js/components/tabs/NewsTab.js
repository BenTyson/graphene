// News Tab Component - Graphene Industry News Feed
function getNewsTabHtml() {
  return `
    <div x-show="activeTab === 'news'" x-cloak>
      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        
        <!-- Left Sidebar - Filters -->
        <aside class="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-6">
            
            <!-- Search Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                SEARCH
              </h3>
              <input 
                type="text" 
                x-model="newsFilters.search" 
                @input="debounce(filterNews, 500)()"
                placeholder="Search articles..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm">
            </div>

            <!-- Categories Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                CATEGORIES
              </h3>
              <div class="space-y-2">
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">All Categories</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="RESEARCH_BREAKTHROUGH" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Research</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="INDUSTRY_NEWS" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Industry News</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="MARKET_ANALYSIS" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Market Analysis</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="APPLICATIONS" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Applications</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="COMPANY_NEWS" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Company News</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.category" value="PATENTS" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Patents</span>
                </label>
              </div>
            </div>

            <!-- High-Impact Tags Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                HIGH-IMPACT TAGS
              </h3>
              <div class="space-y-2">
                <button 
                  @click="toggleHighImpactKeyword('hemp')"
                  :class="highImpactKeywords.includes('hemp') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Hemp
                </button>
                <button 
                  @click="toggleHighImpactKeyword('supercapacitor')"
                  :class="highImpactKeywords.includes('supercapacitor') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Supercapacitors
                </button>
                <button 
                  @click="toggleHighImpactKeyword('energy storage')"
                  :class="highImpactKeywords.includes('energy storage') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Energy Storage
                </button>
                <button 
                  @click="toggleHighImpactKeyword('cathode')"
                  :class="highImpactKeywords.includes('cathode') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Cathode
                </button>
                <button 
                  @click="toggleHighImpactKeyword('anode')"
                  :class="highImpactKeywords.includes('anode') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Anode
                </button>
                <button 
                  @click="toggleHighImpactKeyword('electrode')"
                  :class="highImpactKeywords.includes('electrode') ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors">
                  Electrode
                </button>
                <template x-if="highImpactKeywords.length > 0">
                  <button 
                    @click="clearHighImpactKeywords()"
                    class="w-full text-left px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors">
                    <svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Clear All Tags
                  </button>
                </template>
              </div>
            </div>

            <!-- Date Range Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                DATE RANGE
              </h3>
              <div class="space-y-2">
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.dateRange" value="" @change="updateDateFilters(); filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">All Time</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.dateRange" value="today" @change="updateDateFilters(); filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Today</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.dateRange" value="week" @change="updateDateFilters(); filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">This Week</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.dateRange" value="month" @change="updateDateFilters(); filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">This Month</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.dateRange" value="quarter" @change="updateDateFilters(); filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">This Quarter</span>
                </label>
              </div>
            </div>

            <!-- Sort Options Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                </svg>
                SORT BY
              </h3>
              <div class="space-y-2">
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.sortBy" value="publishDate" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Latest</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.sortBy" value="relevanceScore" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Most Relevant</span>
                </label>
                <label class="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                  <input type="radio" x-model="newsFilters.sortBy" value="viewCount" @change="filterNews()" class="mr-2 text-black focus:ring-black">
                  <span class="text-sm text-gray-700">Most Viewed</span>
                </label>
              </div>
            </div>

            <!-- Active Filters Display -->
            <div x-show="hasActiveFilters()" class="border-t border-gray-300 pt-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">ACTIVE FILTERS</h3>
              <div class="space-y-2">
                <template x-for="filter in getActiveFilters()" :key="filter.key">
                  <div class="flex items-center justify-between bg-black text-white px-3 py-2 rounded-md text-sm">
                    <span x-text="filter.label"></span>
                    <button @click="removeFilter(filter.key)" class="ml-2 hover:bg-gray-700 rounded p-0.5">
                      <svg class="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="m1 1 6 6m0-6-6 6"></path>
                      </svg>
                    </button>
                  </div>
                </template>
                <button @click="clearAllFilters()" class="w-full text-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                  Clear All Filters
                </button>
              </div>
            </div>

          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="space-y-6">
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Graphene News</h1>
              <p class="text-gray-600 mt-1">Latest industry insights, research breakthroughs, and market analysis</p>
            </div>
            <div class="mt-4 sm:mt-0">
              <button 
                @click="refreshNewsFeed()" 
                :disabled="newsLoading"
                :class="{'opacity-50 cursor-not-allowed': newsLoading}"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                <svg x-show="!newsLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <svg x-show="newsLoading" x-cloak class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span x-text="newsLoading ? 'Refreshing...' : 'Refresh'"></span>
              </button>
            </div>
          </div>

          <!-- News Feed Content -->
          <div class="space-y-8">
            <!-- Loading State -->
            <div x-show="newsLoading && newsArticles.length === 0" x-cloak class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p class="text-gray-600 mt-4">Loading news articles...</p>
              </div>
            </div>

            <!-- No Articles State -->
            <div x-show="!newsLoading && filteredNewsArticles.length === 0 && newsArticles.length === 0" x-cloak class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m4 4l-4 4m0 0l-4-4m4 4V7a2 2 0 00-2-2h-3"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">No news articles found</h3>
              <p class="mt-2 text-gray-600">Try refreshing or adjusting your filters to see more content.</p>
            </div>

            <!-- No Filtered Results -->
            <div x-show="!newsLoading && filteredNewsArticles.length === 0 && newsArticles.length > 0" x-cloak class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">No articles match your filters</h3>
              <p class="mt-2 text-gray-600">Try adjusting your search criteria or clearing some filters.</p>
            </div>

            <!-- Article Cards -->
            <div x-show="filteredNewsArticles.length > 0" x-cloak class="space-y-6">
              <template x-for="article in paginatedNewsArticles" :key="article.id">
                <article class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <!-- Article Header -->
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex items-center space-x-3">
                        <!-- High-Impact Indicator -->
                        <template x-if="hasHighImpactKeyword(article)">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            HIGH IMPACT
                          </span>
                        </template>

                        <!-- Category Badge -->
                        <span 
                          :class="getCategoryColor(article.category)"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <span x-text="formatCategory(article.category)"></span>
                        </span>
                        
                        <!-- Relevance Score -->
                        <div class="flex items-center space-x-1">
                          <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span class="text-xs text-gray-600" x-text="article.relevanceScore.toFixed(1)"></span>
                        </div>

                        <!-- Source -->
                        <span class="text-xs text-gray-500" x-text="article.source.name"></span>
                      </div>

                      <!-- Bookmark Button -->
                      <button 
                        @click="toggleBookmark(article.id)"
                        :class="article.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'"
                        class="transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                        </svg>
                      </button>
                    </div>

                    <!-- Article Title -->
                    <h3 class="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      <a 
                        :href="article.url" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        @click="trackArticleView(article.id)"
                        class="hover:text-black transition-colors"
                        x-text="article.title">
                      </a>
                    </h3>

                    <!-- Article Image -->
                    <div x-show="article.imageUrls && article.imageUrls.length > 0" class="mb-4">
                      <img 
                        :src="'http://localhost:3000' + article.imageUrls[0]" 
                        :alt="article.title"
                        @error="$event.target.style.display='none'"
                        class="w-full h-48 object-cover rounded-md"
                        loading="lazy">
                    </div>

                    <!-- Keywords -->
                    <div x-show="article.keywordTags && article.keywordTags.length > 0" class="mb-4">
                      <div class="flex flex-wrap gap-1">
                        <template x-for="tag in article.keywordTags.slice(0, 8)" :key="tag">
                          <span 
                            :class="isHighImpactKeyword(tag) ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold' : 'bg-gray-100 text-gray-700'"
                            class="inline-flex items-center px-2 py-1 rounded text-xs">
                            <template x-if="isHighImpactKeyword(tag)">
                              <svg class="w-3 h-3 mr-0.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            </template>
                            #<span x-text="tag"></span>
                          </span>
                        </template>
                      </div>
                    </div>

                    <!-- AI Summary Section -->
                    <template x-if="article.laymanSummary && article.summaryStatus === 'COMPLETED'">
                      <div class="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div x-html="formatSummaryWithSections(article.laymanSummary)"></div>
                      </div>
                    </template>
                    
                    <!-- Summary Status for Non-Completed -->
                    <template x-if="!article.laymanSummary || article.summaryStatus !== 'COMPLETED'">
                      <div class="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <template x-if="article.summaryStatus === 'GENERATING'">
                          <div class="flex items-center justify-center space-x-2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span class="text-sm text-gray-600">Generating summary...</span>
                          </div>
                        </template>
                        <template x-if="article.summaryStatus === 'PENDING'">
                          <span class="text-sm text-gray-600">Summary queued for generation</span>
                        </template>
                        <template x-if="article.summaryStatus === 'FAILED'">
                          <span class="text-sm text-red-600">Summary generation failed</span>
                        </template>
                      </div>
                    </template>

                    <!-- Article Footer -->
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <!-- Publish Date -->
                        <div class="flex items-center space-x-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span x-text="formatDate(article.publishDate)"></span>
                        </div>

                        <!-- View Count -->
                        <div x-show="article.viewCount > 0" class="flex items-center space-x-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          <span x-text="article.viewCount + ' views'"></span>
                        </div>
                      </div>

                      <!-- Article Actions -->
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="shareArticle(article)"
                          class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                          </svg>
                        </button>

                        <a 
                          :href="article.url" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          @click="trackArticleView(article.id)"
                          class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          Read More
                          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </template>
            </div>

            <!-- Pagination -->
            <div x-show="filteredNewsArticles.length > newsPageSize" x-cloak class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div class="flex flex-1 justify-between sm:hidden">
                <button 
                  @click="previousNewsPage()"
                  :disabled="newsCurrentPage === 1"
                  :class="{'opacity-50 cursor-not-allowed': newsCurrentPage === 1}"
                  class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button 
                  @click="nextNewsPage()"
                  :disabled="newsCurrentPage >= Math.ceil(filteredNewsArticles.length / newsPageSize)"
                  :class="{'opacity-50 cursor-not-allowed': newsCurrentPage >= Math.ceil(filteredNewsArticles.length / newsPageSize)}"
                  class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing <span class="font-medium" x-text="((newsCurrentPage - 1) * newsPageSize) + 1"></span> to 
                    <span class="font-medium" x-text="Math.min(newsCurrentPage * newsPageSize, filteredNewsArticles.length)"></span> of 
                    <span class="font-medium" x-text="filteredNewsArticles.length"></span> results
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button 
                      @click="previousNewsPage()"
                      :disabled="newsCurrentPage === 1"
                      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    
                    <template x-for="page in getNewsPageNumbers()" :key="page">
                      <button 
                        @click="goToNewsPage(page)"
                        :class="page === newsCurrentPage ? 
                          'relative z-10 inline-flex items-center bg-black px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black' : 
                          'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'"
                        x-text="page">
                      </button>
                    </template>
                    
                    <button 
                      @click="nextNewsPage()"
                      :disabled="newsCurrentPage >= Math.ceil(filteredNewsArticles.length / newsPageSize)"
                      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            <!-- Infinite Scroll Trigger -->
            <div x-intersect.full="loadMoreNews()" class="py-4 text-center">
              <div x-show="newsHasMorePages && !newsLoading" x-cloak>
                <button @click="loadMoreNews()" class="text-black hover:text-gray-700">
                  Load more articles...
                </button>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  `;
}