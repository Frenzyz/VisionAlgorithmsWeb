# Live Statistics System for Vision Algorithms Website

## Overview

This document explains the live statistics system integrated into the Vision Algorithms website. The system fetches real-time data from various platforms to showcase the growth and engagement of OS Engine and Vision Algorithms.

## What is OS Engine?

**OS Engine** is a desktop customization software developed by Vision Algorithms that:
- Transforms your desktop into a dynamic, interactive workspace
- Provides real-time customization and advanced features
- Available on Steam (App ID: 3984710)
- Scheduled for release on September 25, 2025
- Platforms: Windows, Mac, and Linux

## Data Sources

The live statistics system fetches data from the following sources:

### 1. Reddit Statistics (r/osengine)
- **Source**: Reddit's public JSON API
- **Endpoint**: `https://www.reddit.com/r/osengine/about.json`
- **Data Retrieved**:
  - Community members (subscribers)
  - Active users
  - Creation date
  - Description
- **Update Frequency**: Every 5 minutes
- **Authentication**: None required (public API)

### 2. Reddit Engagement (Views Estimate)
- **Source**: Reddit's public JSON API for top posts
- **Endpoint**: `https://www.reddit.com/r/osengine/top.json?t=all&limit=100`
- **Data Retrieved**:
  - Total upvotes across posts
  - Total comments
  - Post count
  - Estimated views (calculated from engagement metrics)
- **Calculation**: `(upvotes × 15 + comments × 5) / 1000` = Views in thousands
- **Update Frequency**: Every 5 minutes

### 3. Steam Statistics
- **Source**: Multiple sources (with fallbacks)
  - Steam Store API: `https://store.steampowered.com/api/appdetails?appids=3984710`
  - SteamSpy API: `https://steamspy.com/api.php?request=appdetails&appid=3984710`
- **Data Retrieved**:
  - Game name and type
  - Pricing information
  - Platform availability
  - Estimated wishlists/owners
- **Update Frequency**: Every 5 minutes
- **Note**: Steam doesn't provide direct wishlist counts through public APIs, so we use estimates and fallback values

## Technical Implementation

### Architecture

```
┌─────────────────────┐
│   User's Browser    │
└──────────┬──────────┘
           │
           ├─ Load stats-api.js
           │  (StatsAPI class)
           │
           ├─ Load script.js
           │  (VisionAlgorithmsApp)
           │
           ├─ Fetch data from APIs
           │  ├─ Reddit API
           │  ├─ Steam API
           │  └─ SteamSpy API
           │
           └─ Update DOM with
              animated counters
```

### Files Structure

```
VisionAlgorithmsWeb/
├── js/
│   ├── stats-api.js          # API service for fetching live stats
│   └── script.js              # Main app logic with live stats integration
├── css/
│   └── style.css              # Styles for live indicators and animations
└── index.html                 # Updated HTML with data attributes
```

### Key Components

#### 1. StatsAPI Class (`stats-api.js`)
- **Purpose**: Handles all API interactions and data fetching
- **Methods**:
  - `fetchRedditStats()`: Fetches Reddit community data
  - `fetchRedditViews()`: Calculates estimated views from engagement
  - `fetchSteamStats()`: Fetches Steam game data
  - `fetchAllStats()`: Fetches all statistics in parallel
  - `startAutoUpdate(callback)`: Starts periodic updates every 5 minutes
  - `refresh()`: Manual refresh trigger
  - `getCachedStats()`: Returns cached data
- **Features**:
  - Automatic caching
  - Fallback to default values on API failures
  - Error handling with graceful degradation
  - CORS-friendly public APIs

#### 2. Live Stats Integration (`script.js`)
- **New Methods**:
  - `initializeLiveStats()`: Initializes the live stats system
  - `updateStatsDisplay(stats, animate)`: Updates all stat displays
  - `animateCounter(element, start, end, duration)`: Smooth number animations
  - `updateStaticStatReferences(stats)`: Updates text mentions throughout the page
  - `setupStatsRefresh(statsAPI)`: Sets up manual refresh button
  - `updateLastRefreshTime(timestamp)`: Updates the "last updated" timestamp
  - `showRefreshFeedback(message, type)`: Shows success/error notifications
  - `setStatsLoadingState(isLoading)`: Manages loading states

#### 3. Visual Indicators
- **Live Badges**: Green pulsing indicators showing real-time data
- **Loading States**: Animated opacity during data fetch
- **Refresh Button**: Manual refresh with spinning icon animation
- **Last Updated Time**: Timestamp of last successful data fetch
- **Feedback Notifications**: Success/error messages on refresh

## Statistics Displayed

### Hero Section
1. **Steam Wishlists**: Number of users who wishlisted OS Engine
2. **Reddit Members**: Number of r/osengine subreddit subscribers
3. **Reddit Views (K)**: Estimated thousands of views based on engagement

### Stats Section (#stats)
Same three metrics displayed in larger format with live indicators

### About Section
Dynamic text updates showing current metrics in narrative form

### Contact Section
Updated Reddit member count in the contact card

## Features

### 1. Auto-Update
- **Frequency**: Every 5 minutes
- **Behavior**: Smoothly animates from current to new values
- **Efficiency**: Uses `Promise.allSettled` for parallel API calls

### 2. Manual Refresh
- **Button**: "Refresh Stats" button in hero section
- **Feedback**: Shows success/error notification
- **Loading State**: Button shows spinning icon during fetch
- **Disabled State**: Prevents multiple simultaneous refreshes

### 3. Caching
- **Purpose**: Reduces API calls and provides fallback data
- **Scope**: In-memory cache per session
- **Fallback**: Uses cached data if APIs are unavailable

### 4. Error Handling
- **Graceful Degradation**: Falls back to default values on API errors
- **User Feedback**: Console warnings for debugging
- **No Breaking**: Site remains functional even if all APIs fail

### 5. Responsive Design
- **Mobile**: Smaller badges and compact refresh button
- **Tablet**: Medium-sized elements
- **Desktop**: Full-sized elements with optimal spacing

## Styling

### Live Badge
```css
.live-badge {
  - Green background with transparency
  - Border with green accent
  - Pulsing animation (2s cycle)
  - Rounded pill shape
}
```

### Loading State
```css
.stat-card.loading {
  - Reduced opacity (60%)
  - Pulsing animation
  - Smooth transitions
}
```

### Refresh Button
```css
.refresh-button {
  - Hover effects
  - Focus ring for accessibility
  - Spinning icon when loading
  - Disabled state styling
}
```

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Required APIs
- ✅ Fetch API
- ✅ Promises
- ✅ Async/Await
- ✅ IntersectionObserver
- ✅ CSS animations

## Performance Considerations

### Optimization Strategies
1. **Parallel API Calls**: Uses `Promise.allSettled` for concurrent fetching
2. **Throttled Updates**: 5-minute intervals prevent excessive API calls
3. **Smooth Animations**: Uses `requestAnimationFrame` for counter animations
4. **Cached Data**: Reduces network requests and provides offline fallback
5. **Conditional Loading**: Only fetches when StatsAPI is available

### Network Impact
- **Initial Load**: ~3 API calls (Reddit, Steam, SteamSpy)
- **Periodic Updates**: ~3 API calls every 5 minutes
- **Data Size**: ~5-10 KB per update cycle
- **User Impact**: Minimal (runs in background)

## API Rate Limits

### Reddit API
- **Limit**: 60 requests per minute (per IP)
- **Our Usage**: ~3 requests per 5 minutes
- **Status**: Well within limits

### Steam Store API
- **Limit**: Not officially documented, generally permissive
- **Our Usage**: 1 request per 5 minutes
- **Status**: Safe usage level

### SteamSpy API
- **Limit**: 4 requests per second
- **Our Usage**: 1 request per 5 minutes
- **Status**: Well within limits

## Future Enhancements

### Potential Improvements
1. **Backend Caching**: Implement server-side caching for better reliability
2. **Historical Data**: Track and display growth trends over time
3. **Additional Metrics**:
   - Discord server members
   - Twitter/X followers
   - YouTube subscribers
   - Active installations
4. **Real-time Updates**: WebSocket connections for instant updates
5. **Analytics Dashboard**: Detailed insights and charts
6. **Export Functionality**: Download statistics as CSV/JSON
7. **Comparison View**: Compare growth across different time periods

### Backend Integration Options
If you want more accurate Steam wishlist data, consider:
1. **Steam Partner API**: Requires Steamworks partner access
2. **Custom Backend**: Scrape and cache data server-side
3. **SteamDB Integration**: Partner with SteamDB for accurate metrics
4. **Manual Updates**: Periodic manual updates from Steam Partner dashboard

## Troubleshooting

### Common Issues

#### Stats Not Updating
- **Check**: Browser console for errors
- **Verify**: Network tab shows API calls
- **Solution**: Check if APIs are accessible (CORS, network issues)

#### Incorrect Values
- **Cause**: API data may be cached or unavailable
- **Solution**: Manual refresh or wait for next auto-update
- **Fallback**: System uses default values if APIs fail

#### Loading Forever
- **Cause**: API timeout or network issue
- **Solution**: System will timeout after 30 seconds and use cached data
- **Manual Fix**: Click refresh button

#### Animation Issues
- **Cause**: CSS not loaded or browser incompatibility
- **Solution**: Verify CSS build (`npm run build`)
- **Fallback**: Stats still display without animations

## Security Considerations

### Data Privacy
- ✅ No user data collected
- ✅ No authentication required
- ✅ Only public APIs used
- ✅ No cookies or tracking
- ✅ Client-side only processing

### API Security
- ✅ CORS-friendly public endpoints
- ✅ No API keys exposed
- ✅ Rate limit aware
- ✅ Error handling prevents information leakage

## Testing

### Manual Testing Checklist
- [ ] Initial page load shows stats animation
- [ ] Live badges pulse smoothly
- [ ] Refresh button works and shows feedback
- [ ] Last updated time displays correctly
- [ ] Stats update after 5 minutes
- [ ] Mobile responsive design works
- [ ] Loading states appear during fetch
- [ ] Error states handled gracefully
- [ ] Works with slow/failing networks

### Browser Console Commands
```javascript
// Check current stats
window.statsAPI = new StatsAPI();
await window.statsAPI.fetchAllStats();

// Force refresh
document.querySelector('#refresh-stats').click();

// Check cached data
console.log(window.statsAPI.getCachedStats());
```

## Maintenance

### Regular Checks
1. **Monthly**: Verify APIs still work and haven't changed
2. **Quarterly**: Review rate limits and usage
3. **Annually**: Evaluate if new data sources are available

### Updating Default Values
If you want to update fallback values, edit `stats-api.js`:
```javascript
return {
  reddit: { members: 50 },    // Update this
  steam: { wishlists: 180 },  // Update this
  views: { estimatedViewsK: 178 } // Update this
};
```

## Support

For issues or questions:
- **Email**: support@osengine.org
- **Discord**: https://discord.gg/osengine
- **Reddit**: https://reddit.com/r/osengine

## License

© 2025 Vision Algorithms. All rights reserved.

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0

