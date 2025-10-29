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
    
    // Check query parameters first (Netlify redirects pass params via query string)
    if (event.queryStringParameters?.appid) {
      appId = event.queryStringParameters.appid;
    } else if (event.pathParameters?.appid) {
      appId = event.pathParameters.appid;
    } else if (event.path) {
      const match = event.path.match(/\/appdetails\/([^\/\?&#]+)/i);
      if (match) {
        appId = match[1];
      }
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

