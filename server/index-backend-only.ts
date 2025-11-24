import "dotenv/config";
import { createServer } from "http";
import { serveStatic } from "./vite";
import { log } from "./logger";
import { createApp } from "./app";

(async () => {
  const app = await createApp();
  const server = createServer(app);

  // In production mode, serve static files
  if (app.get("env") === "production") {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Backend server running on port ${port}`);
    log(`API endpoints available at http://localhost:${port}/api`);
  });
})();

