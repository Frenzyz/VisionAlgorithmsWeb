# Netlify Deployment Guide

This guide explains how the live statistics system works on Netlify.

## Architecture

The website uses **Netlify Functions** (serverless functions) to proxy API requests and bypass CORS restrictions. This allows the frontend to fetch data from Reddit and Steam APIs.

### How It Works

```
Frontend (Browser)
  ↓
/api/reddit/subreddit/osengine
  ↓
Netlify Redirect (netlify.toml)
  ↓
/.netlify/functions/reddit-subreddit
  ↓
Netlify Function (functions/reddit-subreddit.js)
  ↓
External API (reddit.com)
  ↓
Response (JSON data)
```

## File Structure

```
VisionAlgorithmsWeb/
├── functions/                    # Netlify Functions (serverless)
│   ├── reddit-subreddit.js      # Fetches Reddit subreddit stats
│   ├── reddit-posts.js          # Fetches Reddit top posts
│   ├── steam-appdetails.js      # Fetches Steam game details
│   └── steamspy-appdetails.js   # Fetches SteamSpy statistics
├── netlify.toml                  # Netlify configuration
├── js/
│   └── stats-api.js             # Frontend API client (uses /api/* paths)
└── index.html                    # Main page
```

## API Endpoints

All endpoints work both locally (Express) and on Netlify (Functions):

### Reddit API
- **Path**: `/api/reddit/subreddit/osengine`
- **Function**: `reddit-subreddit`
- **Returns**: Subreddit subscriber count, active users, etc.

### Reddit Posts
- **Path**: `/api/reddit/posts/osengine?timeframe=all&limit=100`
- **Function**: `reddit-posts`
- **Returns**: Top posts with upvotes, comments for engagement metrics

### Steam App Details
- **Path**: `/api/steam/appdetails/3984710`
- **Function**: `steam-appdetails`
- **Returns**: Game name, type, pricing, platforms

### SteamSpy Statistics
- **Path**: `/api/steamspy/appdetails/3984710`
- **Function**: `steamspy-appdetails`
- **Returns**: Owner estimates, player counts

## Local Development

When running locally (`npm run dev`), the Express server in `server.js` handles these API routes. The frontend code doesn't need to change.

## Netlify Deployment

1. **Functions Directory**: Netlify automatically detects the `functions/` directory
2. **Redirects**: `netlify.toml` redirects `/api/*` paths to `/.netlify/functions/*`
3. **CORS**: Functions include CORS headers automatically
4. **Error Handling**: Functions return fallback data if APIs fail

## Testing Locally with Netlify CLI

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Build the site
npm run build

# Run Netlify locally
netlify dev

# This will:
# - Start local server on port 8888
# - Run Netlify Functions locally
# - Test the full deployment setup
```

## Deployment Checklist

- [x] Functions directory created (`functions/`)
- [x] All 4 Netlify Functions created
- [x] `netlify.toml` configured with redirects
- [x] Frontend uses `/api/*` paths (works for both local and Netlify)
- [x] CORS headers included in all functions
- [x] Error handling with fallback data
- [x] Query parameter extraction in functions

## Troubleshooting

### Functions Not Found (404)
- **Check**: Functions directory is named `functions/` (lowercase)
- **Check**: Function files export `exports.handler`
- **Check**: Netlify Functions build logs

### CORS Errors
- **Check**: Functions return CORS headers
- **Check**: `Access-Control-Allow-Origin: *` is set
- **Check**: OPTIONS requests are handled

### Path Parameters Not Working
- Functions try multiple methods:
  1. `event.pathParameters` (if available)
  2. `event.queryStringParameters` (query params)
  3. Regex extraction from `event.path`

### API Errors
- Functions return fallback data instead of failing
- Check browser console for error messages
- Check Netlify Function logs in dashboard

## Function Execution Time

Netlify Functions have:
- **Free tier**: 10 second timeout
- **Pro tier**: 26 second timeout

All functions should complete well within these limits.

## Environment Variables (Optional)

If you need to customize the default values or API endpoints, you can add environment variables in Netlify:

1. Go to Site Settings → Environment Variables
2. Add variables like:
   - `STEAM_APP_ID` = `3984710`
   - `REDDIT_SUBREDDIT` = `osengine`
3. Update functions to use `process.env.VARIABLE_NAME`

## Monitoring

- **Netlify Dashboard**: View function invocations and logs
- **Function Logs**: Available in Netlify Dashboard → Functions
- **Error Tracking**: Errors are logged and can be monitored

## Performance

- **Cold Start**: ~1-2 seconds for first invocation
- **Warm Start**: <100ms for subsequent requests
- **Caching**: Frontend caches results for 5 minutes
- **Auto-Update**: Stats refresh every 5 minutes

## Cost Considerations

Netlify Functions usage:
- **Free tier**: 125,000 requests/month
- **Pro tier**: 500,000 requests/month

With auto-update every 5 minutes:
- ~8,640 requests/day per user
- ~259,200 requests/month per active user
- Well within free tier for typical usage

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0

