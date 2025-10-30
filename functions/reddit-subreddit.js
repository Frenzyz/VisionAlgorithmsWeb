// Netlify Function: Reddit Subreddit Stats
exports.handler = async (event, context) => {
  console.log("=== REDDIT FUNCTION START ===");
  console.log(
    "Event received:",
    JSON.stringify(
      {
        httpMethod: event.httpMethod,
        path: event.path,
        pathParameters: event.pathParameters,
        queryStringParameters: event.queryStringParameters,
        rawQueryString: event.rawQueryString,
        headers: Object.keys(event.headers || {}),
      },
      null,
      2,
    ),
  );

  // Handle CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Extract subreddit from path parameters
    // Netlify Functions with redirects pass parameters in pathParameters
    let subredditName = "osengine";

    console.log("=== PATH PARAMETER EXTRACTION ===");

    // First try pathParameters (most reliable with Netlify redirects)
    if (event.pathParameters?.subreddit) {
      subredditName = event.pathParameters.subreddit;
      console.log("✅ Using pathParameters.subreddit:", subredditName);
    }
    // Fallback to extracting from path
    else if (event.path) {
      const match = event.path.match(/\/subreddit\/([^\/\?&#]+)/i);
      if (match) {
        subredditName = match[1];
        console.log("✅ Using path regex match:", subredditName);
      } else {
        console.log("❌ No match in path:", event.path);
      }
    }
    // Final fallback to query parameters
    else if (event.queryStringParameters?.subreddit) {
      subredditName = event.queryStringParameters.subreddit;
      console.log("✅ Using queryStringParameters.subreddit:", subredditName);
    } else {
      console.log("⚠️ Using default subreddit name:", subredditName);
    }

    // Clean up the subreddit name
    subredditName = subredditName.toLowerCase().trim();
    console.log("Final subreddit name:", subredditName);

    const redditUrl = `https://www.reddit.com/r/${subredditName}/about.json`;
    console.log("=== MAKING REDDIT API REQUEST ===");
    console.log("Reddit URL:", redditUrl);

    try {
      console.log("Starting fetch request...");
      const response = await fetch(redditUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; VisionAlgorithms/1.0; +https://vision-algorithms.netlify.app)",
        },
        timeout: 10000, // 10 second timeout
      });
      console.log("Fetch request completed, status:", response.status);

      if (!response.ok) {
        console.error("❌ Reddit API returned error status:", response.status);
        console.error(
          "Reddit API response headers:",
          Object.fromEntries(response.headers.entries()),
        );

        // Try to get error response body for more context
        let errorBody = "";
        try {
          errorBody = await response.text();
          console.error(
            "Reddit API error response body:",
            errorBody.substring(0, 500),
          );
        } catch (e) {
          console.error("Could not read error response body:", e.message);
        }

        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Successfully parsed Reddit JSON response");
      console.log("Reddit subscribers count:", data?.data?.subscribers);

      // Additional validation of the response data
      if (!data || !data.data) {
        console.error(
          "❌ Invalid Reddit API response structure:",
          JSON.stringify(data, null, 2),
        );
        throw new Error("Invalid Reddit API response structure");
      }

      if (typeof data.data.subscribers !== "number") {
        console.error("❌ Invalid subscribers data:", data.data.subscribers);
        throw new Error("Invalid subscribers data in Reddit response");
      }

      console.log("✅ Reddit API call successful!");
      console.log("Subscribers:", data.data.subscribers);
      console.log("Active users:", data.data.active_user_count);
      console.log("=== RETURNING SUCCESS RESPONSE ===");

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    } catch (fetchError) {
      console.error("❌ Fetch request failed:", fetchError.message);
      throw fetchError;
    }
  } catch (error) {
    console.error("=== FUNCTION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);

    // Return fallback data with more detailed error information
    console.log("⚠️ Returning fallback data due to error");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch Reddit data",
        errorDetails: error.message,
        fallback: {
          data: {
            subscribers: 50,
            active_user_count: 0,
          },
        },
      }),
    };
  }
};
