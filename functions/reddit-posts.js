// Netlify Function: Reddit Top Posts
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
    // Extract subreddit from query params (Netlify redirect passes as query param)
    let subredditName = 'osengine';
    
    // With rewrites (status 200), event.path contains the original request path
    const checkPath = (pathString) => {
      if (!pathString) return null;
      const match = pathString.match(/\/posts\/([^\/\?&#]+)/i);
      return match ? match[1] : null;
    };
    
    if (event.path && checkPath(event.path)) {
      subredditName = checkPath(event.path);
    } else if (event.rawPath && checkPath(event.rawPath)) {
      subredditName = checkPath(event.rawPath);
    } else if (event.queryStringParameters?.subreddit) {
      subredditName = event.queryStringParameters.subreddit;
    } else if (event.pathParameters?.subreddit) {
      subredditName = event.pathParameters.subreddit;
    }
    
    subredditName = subredditName.toLowerCase().trim();
    
    const timeframe = event.queryStringParameters?.timeframe || 'all';
    const limit = event.queryStringParameters?.limit || '100';

    const response = await fetch(
      `https://www.reddit.com/r/${subredditName}/top.json?t=${timeframe}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'VisionAlgorithms:v1.0.0 (by /u/osengine)'
        }
      }
    );

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
    console.error('Reddit posts API error:', error);
    
    // Return fallback data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch Reddit posts',
        fallback: {
          data: {
            children: []
          }
        }
      })
    };
  }
};

