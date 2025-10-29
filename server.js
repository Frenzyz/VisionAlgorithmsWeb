import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for API endpoints
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Parse JSON bodies
app.use(express.json());

// API Proxy Endpoints for Statistics
// These endpoints fetch data from external APIs to bypass CORS restrictions

// Reddit subreddit stats
app.get('/api/reddit/subreddit/:subreddit', async (req, res) => {
  try {
    const { subreddit } = req.params;
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/about.json`, {
      headers: {
        'User-Agent': 'VisionAlgorithms:v1.0.0 (by /u/osengine)'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reddit API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Reddit data',
      fallback: {
        data: {
          subscribers: 50,
          active_user_count: 0
        }
      }
    });
  }
});

// Reddit top posts for engagement metrics
app.get('/api/reddit/posts/:subreddit', async (req, res) => {
  try {
    const { subreddit } = req.params;
    const { timeframe = 'all', limit = 100 } = req.query;
    
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`,
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
    res.json(data);
  } catch (error) {
    console.error('Reddit posts API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Reddit posts',
      fallback: {
        data: {
          children: []
        }
      }
    });
  }
});

// Steam game details
app.get('/api/steam/appdetails/:appid', async (req, res) => {
  try {
    const { appid } = req.params;
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Steam API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Steam data',
      fallback: {
        success: false
      }
    });
  }
});

// SteamSpy API proxy
app.get('/api/steamspy/appdetails/:appid', async (req, res) => {
  try {
    const { appid } = req.params;
    const response = await fetch(
      `https://steamspy.com/api.php?request=appdetails&appid=${appid}`
    );

    if (!response.ok) {
      throw new Error(`SteamSpy API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('SteamSpy API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch SteamSpy data',
      fallback: {}
    });
  }
});

// Combined stats endpoint for efficiency
app.get('/api/stats/all', async (req, res) => {
  try {
    const [redditData, redditPosts, steamData] = await Promise.allSettled([
      fetch('https://www.reddit.com/r/osengine/about.json', {
        headers: { 'User-Agent': 'VisionAlgorithms:v1.0.0' }
      }).then(r => r.json()),
      fetch('https://www.reddit.com/r/osengine/top.json?t=all&limit=100', {
        headers: { 'User-Agent': 'VisionAlgorithms:v1.0.0' }
      }).then(r => r.json()),
      fetch('https://store.steampowered.com/api/appdetails?appids=3984710')
        .then(r => r.json())
    ]);

    const stats = {
      reddit: redditData.status === 'fulfilled' ? redditData.value : null,
      redditPosts: redditPosts.status === 'fulfilled' ? redditPosts.value : null,
      steam: steamData.status === 'fulfilled' ? steamData.value : null,
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Combined stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch combined stats',
      fallback: {
        reddit: { data: { subscribers: 50 } },
        steam: { '3984710': { success: false } }
      }
    });
  }
});

// Serve static files
app.use(express.static('.'));

// Set MIME types for video files
app.use("/videos", (req, res, next) => {
  res.setHeader("Content-Type", "video/mp4");
  next();
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle all other routes
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, req.path);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Serve index.html for SPA routing
    res.sendFile(path.join(__dirname, "index.html"));
  }
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const netInterface of interfaces[name]) {
      if (netInterface.family === "IPv4" && !netInterface.internal) {
        return netInterface.address;
      }
    }
  }
  return "localhost";
}

// Start server
app.listen(PORT, () => {
  console.log("🚀 Vision Algorithms Website Server");
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${getLocalIP()}:${PORT}`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
