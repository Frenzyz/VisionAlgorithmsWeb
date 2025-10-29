// Vision Algorithms - Live Statistics API Service
// Fetches real-time statistics from various platforms

class StatsAPI {
  constructor() {
    this.cache = {
      reddit: null,
      steam: null,
      lastUpdated: null
    };
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
    this.retryDelay = 30 * 1000; // 30 seconds
  }

  /**
   * Fetch Reddit statistics for r/osengine
   */
  async fetchRedditStats() {
    try {
      // Use local proxy endpoint to bypass CORS
      const response = await fetch('/api/reddit/subreddit/osengine');

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle fallback data from server
      if (data.fallback) {
        return {
          members: data.fallback.data.subscribers || 50,
          activeUsers: data.fallback.data.active_user_count || 0
        };
      }
      
      return {
        members: data.data.subscribers || data.data.active_user_count || 50,
        activeUsers: data.data.active_user_count || 0,
        created: data.data.created_utc,
        description: data.data.public_description
      };
    } catch (error) {
      console.warn('Failed to fetch Reddit stats:', error);
      // Return cached or default values
      return this.cache.reddit || {
        members: 50,
        activeUsers: 0
      };
    }
  }

  /**
   * Fetch Steam statistics
   * Note: Steam doesn't provide a direct public API for wishlists/followers
   * This uses alternative methods or falls back to estimated values
   */
  async fetchSteamStats() {
    try {
      const appId = '3984710'; // OS Engine Steam App ID
      
      // Use local proxy endpoint to bypass CORS
      const response = await fetch(`/api/steam/appdetails/${appId}`);

      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle fallback data from server
      if (data.fallback || !data[appId] || !data[appId].success) {
        return this.cache.steam || {
          wishlists: 200,
          followers: 0
        };
      }
      
      if (data[appId] && data[appId].success) {
        const appData = data[appId].data;
        
        // Steam API doesn't provide wishlist count directly
        // We'll need to maintain a server-side service or use estimates
        return {
          name: appData.name,
          type: appData.type,
          price: appData.price_overview,
          platforms: appData.platforms,
          // These would come from a backend service that scrapes or estimates
          wishlists: await this.estimateSteamWishlists(appId),
          followers: 0 // Not available through public API
        };
      }
      
      throw new Error('Steam data not available');
    } catch (error) {
      console.warn('Failed to fetch Steam stats:', error);
      // Return cached or default values
      return this.cache.steam || {
        wishlists: 200,
        followers: 0
      };
    }
  }

  /**
   * Estimate Steam wishlists using alternative methods
   * This could query a backend service, SteamDB, or SteamSpy
   */
  async estimateSteamWishlists(appId) {
    try {
      // Use local proxy endpoint for SteamSpy
      const response = await fetch(`/api/steamspy/appdetails/${appId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle fallback data
        if (data.fallback) {
          return 200;
        }
        
        // SteamSpy doesn't provide wishlist count, but provides owners estimate
        return data.owners ? this.parseOwnersToNumber(data.owners) : 200;
      }
    } catch (error) {
      console.warn('SteamSpy estimation failed:', error);
    }
    
    // If all else fails, return a baseline estimate
    // You could implement a backend service to track this more accurately
    return 200;
  }

  /**
   * Parse Steam owners string (e.g., "0 .. 20,000") to a number
   */
  parseOwnersToNumber(ownersString) {
    if (!ownersString) return 0;
    
    const matches = ownersString.match(/[\d,]+/g);
    if (matches && matches.length > 0) {
      const numbers = matches.map(n => parseInt(n.replace(/,/g, ''), 10));
      // Return average of range
      return Math.floor(numbers.reduce((a, b) => a + b, 0) / numbers.length);
    }
    
    return 0;
  }

  /**
   * Fetch Reddit post views from popular posts
   * This estimates total community engagement
   */
  async fetchRedditViews() {
    try {
      // Use local proxy endpoint to bypass CORS
      const response = await fetch('/api/reddit/posts/osengine?timeframe=all&limit=100');

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle fallback data from server
      if (data.fallback) {
        return {
          estimatedViewsK: 178,
          totalUpvotes: 0,
          totalComments: 0
        };
      }
      
      // Calculate total views estimate from upvotes (rough estimate: 1 upvote = ~10-20 views)
      let totalUpvotes = 0;
      let totalComments = 0;
      
      if (data.data && data.data.children) {
        data.data.children.forEach(post => {
          totalUpvotes += post.data.ups || 0;
          totalComments += post.data.num_comments || 0;
        });
      }

      // Estimate views: upvotes * 15 + comments * 5 (rough engagement metrics)
      const estimatedViews = Math.floor((totalUpvotes * 15 + totalComments * 5) / 1000);
      
      return {
        estimatedViewsK: estimatedViews || 178,
        totalUpvotes,
        totalComments,
        totalPosts: data.data.children.length
      };
    } catch (error) {
      console.warn('Failed to fetch Reddit views:', error);
      return {
        estimatedViewsK: 178,
        totalUpvotes: 0,
        totalComments: 0
      };
    }
  }

  /**
   * Fetch all statistics at once
   */
  async fetchAllStats() {
    try {
      const [reddit, steam, views] = await Promise.allSettled([
        this.fetchRedditStats(),
        this.fetchSteamStats(),
        this.fetchRedditViews()
      ]);

      const stats = {
        reddit: reddit.status === 'fulfilled' ? reddit.value : { members: 50 },
        steam: steam.status === 'fulfilled' ? steam.value : { wishlists: 200 },
        views: views.status === 'fulfilled' ? views.value : { estimatedViewsK: 178 },
        lastUpdated: new Date().toISOString()
      };

      // Cache the results
      this.cache = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      
      // Return cached data or defaults
      return this.cache.lastUpdated ? this.cache : {
        reddit: { members: 50 },
        steam: { wishlists: 200 },
        views: { estimatedViewsK: 178 },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Start auto-updating statistics
   */
  startAutoUpdate(callback) {
    // Initial fetch
    this.fetchAllStats().then(callback);

    // Set up periodic updates
    const intervalId = setInterval(async () => {
      const stats = await this.fetchAllStats();
      callback(stats);
    }, this.updateInterval);

    return () => clearInterval(intervalId);
  }

  /**
   * Get cached statistics
   */
  getCachedStats() {
    return this.cache;
  }

  /**
   * Manual refresh
   */
  async refresh() {
    return await this.fetchAllStats();
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.StatsAPI = StatsAPI;
}

// For module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatsAPI;
}

