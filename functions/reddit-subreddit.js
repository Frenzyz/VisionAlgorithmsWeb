// Netlify Function: Reddit Subreddit Stats
exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract subreddit from path or query params
    // Netlify Functions v1 (exports.handler) receives different event structure
    let subredditName = 'osengine';
    
    // Check multiple sources for the subreddit parameter
    const checkPath = (pathString) => {
      if (!pathString) return null;
      const match = pathString.match(/\/subreddit\/([^\/\?&#]+)/i);
      return match ? match[1] : null;
    };
    
    // Try various event properties (Netlify Functions)
    // With rewrites (status 200), event.path contains the original request path
    if (event.path && checkPath(event.path)) {
      subredditName = checkPath(event.path);
    } else if (event.rawPath && checkPath(event.rawPath)) {
      subredditName = checkPath(event.rawPath);
    } else if (event.pathParameters?.subreddit) {
      subredditName = event.pathParameters.subreddit;
    } else if (event.queryStringParameters?.subreddit) {
      subredditName = event.queryStringParameters.subreddit;
    } else if (event.rawQueryString) {
      // Sometimes params are in rawQueryString like "subreddit=osengine"
      const params = new URLSearchParams(event.rawQueryString);
      if (params.get('subreddit')) {
        subredditName = params.get('subreddit');
      }
    } else if (event.headers) {
      // Check various headers
      const headers = event.headers;
      if (headers['x-forwarded-uri'] && checkPath(headers['x-forwarded-uri'])) {
        subredditName = checkPath(headers['x-forwarded-uri']);
      } else if (headers['x-forwarded-path'] && checkPath(headers['x-forwarded-path'])) {
        subredditName = checkPath(headers['x-forwarded-path']);
      } else if (headers['referer'] && checkPath(headers['referer'])) {
        subredditName = checkPath(headers['referer']);
      }
    }
    
    // Clean up the subreddit name
    subredditName = subredditName.toLowerCase().trim();

    // Log for debugging (will appear in Netlify Function logs)
    console.log('Fetching Reddit data for subreddit:', subredditName);
    console.log('Event path:', event.path);
    console.log('Event rawPath:', event.rawPath);
    console.log('Event queryStringParameters:', event.queryStringParameters);
    
    const response = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`, {
      headers: {
        'User-Agent': 'VisionAlgorithms:v1.0.0 (by /u/osengine)'
      }
    });

    if (!response.ok) {
      console.error(`Reddit API returned status: ${response.status}`);
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Reddit data, subscribers:', data?.data?.subscribers);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Reddit API error:', error.message);
    console.error('Stack:', error.stack);
    
    // Return fallback data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch Reddit data',
        fallback: {
          data: {
            subscribers: 50,
            active_user_count: 0
          }
        }
      })
    };
  }
};

