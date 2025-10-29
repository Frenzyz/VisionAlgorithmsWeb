const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3002;

// Serve static files
app.use(express.static("."));

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

// Start server
app.listen(PORT, () => {
  console.log("🚀 Vision Algorithms Website Server");
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${getLocalIP()}:${PORT}`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

function getLocalIP() {
  const interfaces = require("os").networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === "IPv4" && !interface.internal) {
        return interface.address;
      }
    }
  }
  return "localhost";
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
