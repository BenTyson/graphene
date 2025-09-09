// News Tab Functionality - Supporting functions for the news feed
function initializeNewsFunctionality() {
  return {
    // News state
    newsArticles: [],
    filteredNewsArticles: [],
    paginatedNewsArticles: [],
    newsLoading: false,
    newsError: null,
    showNewsFilters: false,
    
    // Pagination
    newsCurrentPage: 1,
    newsPageSize: 10,
    newsTotalPages: 0,
    newsHasMorePages: false,

    // Filters
    newsFilters: {
      search: '',
      category: '',
      source: '',
      dateRange: '',
      sortBy: 'publishDate',
      sortOrder: 'desc'
    },

    // News API functions
    async fetchNewsArticles() {
      this.newsLoading = true;
      this.newsError = null;

      try {
        const queryParams = new URLSearchParams();
        
        // Add filters to query
        if (this.newsFilters.search) queryParams.append('search', this.newsFilters.search);
        if (this.newsFilters.category) queryParams.append('category', this.newsFilters.category);
        if (this.newsFilters.source) queryParams.append('source', this.newsFilters.source);
        if (this.newsFilters.sortBy) queryParams.append('sortBy', this.newsFilters.sortBy);
        if (this.newsFilters.sortOrder) queryParams.append('sortOrder', this.newsFilters.sortOrder);
        
        // Add date range
        const dateRange = this.getDateRange();
        if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
        if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

        queryParams.append('page', '1');
        queryParams.append('limit', '50'); // Load more for client-side pagination

        const response = await fetch(`/api/news/articles?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news articles');
        }

        const data = await response.json();
        
        if (data.success) {
          this.newsArticles = data.data.articles;
          this.filteredNewsArticles = [...this.newsArticles];
          this.applyClientSideFilters();
          this.updatePagination();
        } else {
          throw new Error(data.error || 'Failed to fetch news articles');
        }

      } catch (error) {
        console.error('Error fetching news articles:', error);
        this.newsError = error.message;
        this.showNotification('Error loading news articles: ' + error.message, 'error');
      } finally {
        this.newsLoading = false;
      }
    },

    // Refresh news feed
    async refreshNewsFeed() {
      await this.fetchNewsArticles();
      this.showNotification('News feed refreshed successfully', 'success');
    },

    // Filter news articles
    filterNews() {
      this.applyClientSideFilters();
      this.newsCurrentPage = 1; // Reset to first page
      this.updatePagination();
    },

    // Apply client-side filtering
    applyClientSideFilters() {
      let filtered = [...this.newsArticles];

      // Search filter
      if (this.newsFilters.search) {
        const searchTerm = this.newsFilters.search.toLowerCase();
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          (article.summary && article.summary.toLowerCase().includes(searchTerm)) ||
          (article.keywordTags && article.keywordTags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          ))
        );
      }

      // Category filter
      if (this.newsFilters.category) {
        filtered = filtered.filter(article => article.category === this.newsFilters.category);
      }

      // Sort articles
      filtered.sort((a, b) => {
        const field = this.newsFilters.sortBy;
        const order = this.newsFilters.sortOrder;
        
        let aValue = a[field];
        let bValue = b[field];

        // Handle date sorting
        if (field === 'publishDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (order === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      this.filteredNewsArticles = filtered;
    },

    // Update pagination
    updatePagination() {
      this.newsTotalPages = Math.ceil(this.filteredNewsArticles.length / this.newsPageSize);
      this.newsHasMorePages = this.newsCurrentPage < this.newsTotalPages;
      
      const start = (this.newsCurrentPage - 1) * this.newsPageSize;
      const end = start + this.newsPageSize;
      this.paginatedNewsArticles = this.filteredNewsArticles.slice(start, end);
    },

    // Pagination functions
    nextNewsPage() {
      if (this.newsCurrentPage < this.newsTotalPages) {
        this.newsCurrentPage++;
        this.updatePagination();
      }
    },

    previousNewsPage() {
      if (this.newsCurrentPage > 1) {
        this.newsCurrentPage--;
        this.updatePagination();
      }
    },

    goToNewsPage(page) {
      if (page >= 1 && page <= this.newsTotalPages) {
        this.newsCurrentPage = page;
        this.updatePagination();
      }
    },

    loadMoreNews() {
      if (this.newsHasMorePages && !this.newsLoading) {
        this.nextNewsPage();
      }
    },

    getNewsPageNumbers() {
      const pages = [];
      const total = this.newsTotalPages;
      const current = this.newsCurrentPage;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p));
    },

    // Date range helper
    getDateRange() {
      const now = new Date();
      const range = { startDate: null, endDate: null };

      switch (this.newsFilters.dateRange) {
        case 'today':
          range.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          range.startDate = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          range.startDate = monthAgo.toISOString();
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          range.startDate = quarterAgo.toISOString();
          break;
      }

      return range;
    },

    updateDateFilters() {
      // This is called when date range filter changes
      // The actual filtering happens in filterNews()
    },

    // Utility functions
    formatCategory(category) {
      const categoryMap = {
        'RESEARCH_BREAKTHROUGH': 'Research',
        'INDUSTRY_NEWS': 'Industry',
        'MARKET_ANALYSIS': 'Market',
        'APPLICATIONS': 'Applications',
        'PRODUCTION_METHODS': 'Production',
        'PATENTS': 'Patents',
        'COMPANY_NEWS': 'Company',
        'FUNDING_INVESTMENT': 'Funding'
      };
      return categoryMap[category] || category;
    },

    getCategoryColor(category) {
      const colorMap = {
        'RESEARCH_BREAKTHROUGH': 'bg-blue-100 text-blue-800',
        'INDUSTRY_NEWS': 'bg-gray-100 text-gray-800',
        'MARKET_ANALYSIS': 'bg-green-100 text-green-800',
        'APPLICATIONS': 'bg-purple-100 text-purple-800',
        'PRODUCTION_METHODS': 'bg-orange-100 text-orange-800',
        'PATENTS': 'bg-red-100 text-red-800',
        'COMPANY_NEWS': 'bg-indigo-100 text-indigo-800',
        'FUNDING_INVESTMENT': 'bg-yellow-100 text-yellow-800'
      };
      return colorMap[category] || 'bg-gray-100 text-gray-800';
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    // Filter management
    hasActiveFilters() {
      return !!(this.newsFilters.search || 
                this.newsFilters.category || 
                this.newsFilters.dateRange ||
                this.newsFilters.source);
    },

    getActiveFilters() {
      const filters = [];
      
      if (this.newsFilters.search) {
        filters.push({ key: 'search', label: `Search: "${this.newsFilters.search}"` });
      }
      if (this.newsFilters.category) {
        filters.push({ key: 'category', label: `Category: ${this.formatCategory(this.newsFilters.category)}` });
      }
      if (this.newsFilters.dateRange) {
        filters.push({ key: 'dateRange', label: `Date: ${this.newsFilters.dateRange}` });
      }
      if (this.newsFilters.source) {
        filters.push({ key: 'source', label: `Source: ${this.newsFilters.source}` });
      }
      
      return filters;
    },

    removeFilter(filterKey) {
      this.newsFilters[filterKey] = '';
      this.filterNews();
    },

    clearAllFilters() {
      this.newsFilters = {
        search: '',
        category: '',
        source: '',
        dateRange: '',
        sortBy: 'publishDate',
        sortOrder: 'desc'
      };
      this.filterNews();
    },

    // Article interactions
    async toggleBookmark(articleId) {
      try {
        const response = await fetch(`/api/news/articles/${articleId}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to toggle bookmark');
        }

        const data = await response.json();
        
        if (data.success) {
          // Update the article in our local state
          const article = this.newsArticles.find(a => a.id === articleId);
          if (article) {
            article.isBookmarked = data.isBookmarked;
          }
          
          // Update filtered and paginated arrays
          const filteredArticle = this.filteredNewsArticles.find(a => a.id === articleId);
          if (filteredArticle) {
            filteredArticle.isBookmarked = data.isBookmarked;
          }
          
          const paginatedArticle = this.paginatedNewsArticles.find(a => a.id === articleId);
          if (paginatedArticle) {
            paginatedArticle.isBookmarked = data.isBookmarked;
          }

          this.showNotification(
            data.isBookmarked ? 'Article bookmarked' : 'Bookmark removed',
            'success'
          );
        }

      } catch (error) {
        console.error('Error toggling bookmark:', error);
        this.showNotification('Error updating bookmark', 'error');
      }
    },

    async trackArticleView(articleId) {
      try {
        // This will increment the view count on the backend
        await fetch(`/api/news/articles/${articleId}`, {
          method: 'GET'
        });
      } catch (error) {
        console.error('Error tracking article view:', error);
      }
    },

    shareArticle(article) {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } else {
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(article.url).then(() => {
          this.showNotification('Article URL copied to clipboard', 'success');
        }).catch(err => {
          console.error('Error copying to clipboard:', err);
          this.showNotification('Could not copy URL', 'error');
        });
      }
    },

    // Debounce utility
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Initialize news tab
    async initializeNewsTab() {
      if (this.activeTab === 'news' && this.newsArticles.length === 0) {
        await this.fetchNewsArticles();
      }
    }
  };
}

// Add to global app functions
window.newsTabFunctions = initializeNewsFunctionality();