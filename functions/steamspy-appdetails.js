// Netlify Function: SteamSpy App Details
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
    // Extract app ID from query params (Netlify redirect passes as query param)
    let appId = '3984710';
    
    // With rewrites (status 200), event.path contains the original request path
    const checkPath = (pathString) => {
      if (!pathString) return null;
      const match = pathString.match(/\/appdetails\/([^\/\?&#]+)/i);
      return match ? match[1] : null;
    };
    
    if (event.path && checkPath(event.path)) {
      appId = checkPath(event.path);
    } else if (event.rawPath && checkPath(event.rawPath)) {
      appId = checkPath(event.rawPath);
    } else if (event.queryStringParameters?.appid) {
      appId = event.queryStringParameters.appid;
    } else if (event.pathParameters?.appid) {
      appId = event.pathParameters.appid;
    }

    const response = await fetch(
      `https://steamspy.com/api.php?request=appdetails&appid=${appId}`
    );

    if (!response.ok) {
      throw new Error(`SteamSpy API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('SteamSpy API error:', error);
    
    // Return fallback data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch SteamSpy data',
        fallback: {}
      })
    };
  }
};

