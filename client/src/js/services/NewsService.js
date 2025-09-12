/**
 * News Service
 * Centralized service for all news-related functionality
 * Extracted from app-refactored.js for better maintainability
 */

class NewsService {
  constructor() {
    // Initialize with default values
    this.newsArticles = [];
    this.filteredNewsArticles = [];
    this.paginatedNewsArticles = [];
    this.headlines = [];
    
    // Pagination state
    this.newsCurrentPage = 1;
    this.newsPageSize = 10;
    this.newsTotalPages = 1;
    this.newsHasMorePages = false;
    
    // Loading and error states
    this.newsLoading = false;
    this.newsError = null;
    this.headlinesLoading = false;
    this.headlinesError = null;
    
    // Summary states
    this.showSummary = {};
    this.summaryLoading = {};
    this.summaryError = {};
    
    // High-impact keywords (excluding "graphene" since every article should have it)
    this.highImpactKeywords = [];
    this.allHighImpactKeywords = [
      'battery', 'energy storage', 'conductivity', 'supercapacitor',
      'breakthrough', 'commercial', 'production', 'scalable', 'patent'
    ];
    
    // News filters
    this.newsFilters = {
      search: '',
      category: '',
      source: '',
      dateRange: '',
      sortBy: 'publishDate',
      sortOrder: 'desc'
    };
  }

  async fetchNewsArticles(appContext) {
    this.newsLoading = true;
    this.newsError = null;
    
    // Update app context if provided
    if (appContext) {
      appContext.newsLoading = true;
      appContext.newsError = null;
    }

    try {
      const queryParams = new URLSearchParams();
      
      if (this.newsFilters.search) queryParams.append('search', this.newsFilters.search);
      if (this.newsFilters.category) queryParams.append('category', this.newsFilters.category);
      if (this.newsFilters.source) queryParams.append('source', this.newsFilters.source);
      if (this.newsFilters.sortBy) queryParams.append('sortBy', this.newsFilters.sortBy);
      if (this.newsFilters.sortOrder) queryParams.append('sortOrder', this.newsFilters.sortOrder);
      
      const dateRange = this.getDateRange();
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

      queryParams.append('page', '1');
      queryParams.append('limit', '50');

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
        
        // Update app context
        if (appContext) {
          appContext.newsArticles = this.newsArticles;
          appContext.filteredNewsArticles = this.filteredNewsArticles;
          appContext.paginatedNewsArticles = this.paginatedNewsArticles;
        }
      } else {
        throw new Error(data.error || 'Failed to fetch news articles');
      }

    } catch (error) {
      console.error('Error fetching news articles:', error);
      this.newsError = error.message;
      
      if (appContext) {
        appContext.newsError = error.message;
        if (appContext.showNotification) {
          appContext.showNotification('Error loading news articles: ' + error.message, 'error');
        }
      }
    } finally {
      this.newsLoading = false;
      if (appContext) {
        appContext.newsLoading = false;
      }
    }
  }

  async refreshNewsFeed(appContext) {
    await this.fetchNewsArticles(appContext);
    if (appContext && appContext.showNotification) {
      appContext.showNotification('News feed refreshed successfully', 'success');
    }
  }

  filterNews(appContext) {
    this.applyClientSideFilters();
    this.newsCurrentPage = 1;
    this.updatePagination();
    
    // Update app context
    if (appContext) {
      appContext.filteredNewsArticles = this.filteredNewsArticles;
      appContext.paginatedNewsArticles = this.paginatedNewsArticles;
      appContext.newsCurrentPage = this.newsCurrentPage;
    }
  }

  applyClientSideFilters() {
    let filtered = [...this.newsArticles];

    // Filter by high-impact keywords first
    if (this.highImpactKeywords.length > 0) {
      filtered = filtered.filter(article => {
        const articleText = (
          article.title + ' ' + 
          (article.summary || '') + ' ' + 
          (article.keywordTags ? article.keywordTags.join(' ') : '')
        ).toLowerCase();
        
        return this.highImpactKeywords.some(keyword => 
          articleText.includes(keyword.toLowerCase())
        );
      });
    }

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

    if (this.newsFilters.category) {
      filtered = filtered.filter(article => article.category === this.newsFilters.category);
    }

    filtered.sort((a, b) => {
      const field = this.newsFilters.sortBy;
      const order = this.newsFilters.sortOrder;
      
      let aValue = a[field];
      let bValue = b[field];

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
  }

  updatePagination() {
    this.newsTotalPages = Math.ceil(this.filteredNewsArticles.length / this.newsPageSize);
    this.newsHasMorePages = this.newsCurrentPage < this.newsTotalPages;
    
    const start = (this.newsCurrentPage - 1) * this.newsPageSize;
    const end = start + this.newsPageSize;
    this.paginatedNewsArticles = this.filteredNewsArticles.slice(start, end);
  }

  nextNewsPage() {
    if (this.newsCurrentPage < this.newsTotalPages) {
      this.newsCurrentPage++;
      this.updatePagination();
    }
  }

  previousNewsPage() {
    if (this.newsCurrentPage > 1) {
      this.newsCurrentPage--;
      this.updatePagination();
    }
  }

  goToNewsPage(page) {
    if (page >= 1 && page <= this.newsTotalPages) {
      this.newsCurrentPage = page;
      this.updatePagination();
    }
  }

  loadMoreNews() {
    if (this.newsHasMorePages && !this.newsLoading) {
      this.nextNewsPage();
    }
  }

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
  }

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
  }

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
  }

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
  }

  hasActiveFilters() {
    return !!(this.newsFilters.search || 
              this.newsFilters.category || 
              this.newsFilters.dateRange ||
              this.newsFilters.source);
  }

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
  }

  removeFilter(filterKey) {
    this.newsFilters[filterKey] = '';
    this.filterNews();
  }

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
  }

  async toggleBookmark(articleId, appContext) {
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
        const article = this.newsArticles.find(a => a.id === articleId);
        if (article) {
          article.isBookmarked = data.isBookmarked;
        }
        
        const filteredArticle = this.filteredNewsArticles.find(a => a.id === articleId);
        if (filteredArticle) {
          filteredArticle.isBookmarked = data.isBookmarked;
        }
        
        const paginatedArticle = this.paginatedNewsArticles.find(a => a.id === articleId);
        if (paginatedArticle) {
          paginatedArticle.isBookmarked = data.isBookmarked;
        }

        if (appContext && appContext.showNotification) {
          appContext.showNotification(
            data.isBookmarked ? 'Article bookmarked' : 'Bookmark removed',
            'success'
          );
        }
      }

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (appContext && appContext.showNotification) {
        appContext.showNotification('Error updating bookmark', 'error');
      }
    }
  }

  async trackArticleView(articleId) {
    try {
      await fetch(`/api/news/articles/${articleId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  }

  shareArticle(article, appContext) {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url).then(() => {
        if (appContext && appContext.showNotification) {
          appContext.showNotification('Article URL copied to clipboard', 'success');
        }
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
        if (appContext && appContext.showNotification) {
          appContext.showNotification('Could not copy URL', 'error');
        }
      });
    }
  }

  // High-impact keyword methods
  toggleHighImpactKeyword(keyword) {
    const index = this.highImpactKeywords.indexOf(keyword);
    if (index > -1) {
      this.highImpactKeywords.splice(index, 1);
    } else {
      this.highImpactKeywords.push(keyword);
    }
    this.filterNews();
  }

  clearHighImpactKeywords() {
    this.highImpactKeywords = [];
    this.filterNews();
  }

  hasHighImpactKeyword(article) {
    if (!article.keywordTags || article.keywordTags.length === 0) return false;
    
    const articleKeywords = article.keywordTags.map(tag => tag.toLowerCase());
    return this.allHighImpactKeywords.some(keyword => 
      articleKeywords.includes(keyword.toLowerCase()) ||
      articleKeywords.some(tag => tag.includes(keyword.toLowerCase()))
    );
  }

  isHighImpactKeyword(tag) {
    const tagLower = tag.toLowerCase();
    return this.allHighImpactKeywords.some(keyword => 
      tagLower === keyword.toLowerCase() || 
      tagLower.includes(keyword.toLowerCase())
    );
  }

  // Summary system methods
  async generateSummary(articleId, appContext) {
    this.summaryLoading[articleId] = true;
    this.summaryError[articleId] = null;
    
    if (appContext) {
      appContext.summaryLoading[articleId] = true;
      appContext.summaryError[articleId] = null;
    }

    try {
      const response = await fetch(`/api/news/articles/${articleId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update the article in our local state
        const article = this.newsArticles.find(a => a.id === articleId);
        if (article) {
          article.laymanSummary = result.data.summary;
          article.summaryGenerated = true;
          article.summaryError = null;
        }

        // Show the summary
        this.showSummary[articleId] = true;
        
        if (appContext) {
          appContext.showSummary[articleId] = true;
          
          if (appContext.showNotification) {
            appContext.showNotification(
              `Summary generated! ${result.data.cached ? '(Cached)' : `Cost: $${result.data.cost?.toFixed(4) || '0.001'}`}`,
              'success'
            );
          }
        }

        // Re-filter to update display
        this.applyClientSideFilters();
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }

    } catch (error) {
      console.error('Error generating summary:', error);
      this.summaryError[articleId] = error.message;
      
      if (appContext) {
        appContext.summaryError[articleId] = error.message;
        if (appContext.showNotification) {
          appContext.showNotification('Failed to generate summary: ' + error.message, 'error');
        }
      }
    } finally {
      this.summaryLoading[articleId] = false;
      if (appContext) {
        appContext.summaryLoading[articleId] = false;
      }
    }
  }

  async regenerateSummary(articleId, appContext) {
    // Find and update the article to force regeneration
    const article = this.newsArticles.find(a => a.id === articleId);
    if (article) {
      article.summaryGenerated = false;
      article.laymanSummary = null;
      article.summaryError = null;
    }
    
    await this.generateSummary(articleId, appContext);
  }

  async retryGenerateSummary(articleId, appContext) {
    // Clear error and retry
    this.summaryError[articleId] = null;
    if (appContext) {
      appContext.summaryError[articleId] = null;
    }
    await this.generateSummary(articleId, appContext);
  }

  async initializeNewsTab(appContext) {
    if (this.newsArticles.length === 0) {
      await this.fetchNewsArticles(appContext);
    }
  }

  async fetchHeadlines(appContext) {
    this.headlinesLoading = true;
    this.headlinesError = null;
    
    if (appContext) {
      appContext.headlinesLoading = true;
      appContext.headlinesError = null;
    }

    try {
      const response = await fetch('/api/news/headlines?limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to fetch headlines');
      }

      const data = await response.json();
      
      if (data.success) {
        this.headlines = data.data;
        if (appContext) {
          appContext.headlines = this.headlines;
        }
      } else {
        throw new Error(data.error || 'Failed to fetch headlines');
      }

    } catch (error) {
      console.error('Error fetching headlines:', error);
      this.headlinesError = error.message;
      this.headlines = [];
      
      if (appContext) {
        appContext.headlinesError = error.message;
        appContext.headlines = [];
      }
    } finally {
      this.headlinesLoading = false;
      if (appContext) {
        appContext.headlinesLoading = false;
      }
    }
  }

  async refreshHeadlines(appContext) {
    await this.fetchHeadlines(appContext);
  }

  openNewsArticle(article) {
    this.trackArticleView(article.id);
    window.open(article.url, '_blank', 'noopener,noreferrer');
  }

  // Expose state for external access
  getNewsState() {
    return {
      newsArticles: this.newsArticles,
      filteredNewsArticles: this.filteredNewsArticles,
      paginatedNewsArticles: this.paginatedNewsArticles,
      headlines: this.headlines,
      newsCurrentPage: this.newsCurrentPage,
      newsPageSize: this.newsPageSize,
      newsTotalPages: this.newsTotalPages,
      newsHasMorePages: this.newsHasMorePages,
      newsFilters: this.newsFilters,
      highImpactKeywords: this.highImpactKeywords,
      showSummary: this.showSummary,
      summaryLoading: this.summaryLoading,
      summaryError: this.summaryError
    };
  }

  // Update filters from app context
  updateFilters(filters) {
    Object.assign(this.newsFilters, filters);
  }
}

// Create singleton instance
const newsService = new NewsService();

// Export for use in other modules
window.NewsService = newsService;

export default newsService;