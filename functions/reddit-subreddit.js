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
    let subredditName = 'osengine';
    
    // Try path parameters first (Netlify function context)
    if (event.pathParameters?.subreddit) {
      subredditName = event.pathParameters.subreddit;
    }
    // Try query parameters
    else if (event.queryStringParameters?.subreddit) {
      subredditName = event.queryStringParameters.subreddit;
    }
    // Try extracting from path: /api/reddit/subreddit/osengine
    else if (event.path) {
      const match = event.path.match(/\/subreddit\/([^\/\?]+)/);
      if (match) {
        subredditName = match[1];
      }
    }
    // Try extracting from rawPath (Netlify Functions)
    else if (event.rawPath) {
      const match = event.rawPath.match(/\/subreddit\/([^\/\?]+)/);
      if (match) {
        subredditName = match[1];
      }
    }
    // Try extracting from headers (X-Forwarded-URI or similar)
    else if (event.headers && event.headers['x-forwarded-uri']) {
      const match = event.headers['x-forwarded-uri'].match(/\/subreddit\/([^\/\?]+)/);
      if (match) {
        subredditName = match[1];
      }
    }

    const response = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`, {
      headers: {
        'User-Agent': 'VisionAlgorithms:v1.0.0 (by /u/osengine)'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Reddit API error:', error);
    
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

