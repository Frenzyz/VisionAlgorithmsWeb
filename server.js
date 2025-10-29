import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

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
