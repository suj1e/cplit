import express from "express";
import { loadConfig } from "./config.js";
import { registerApprovalRoutes } from "./routes/approval.js";
import { registerWebhookRoutes } from "./routes/webhook.js";

const config = loadConfig();

const app = express();

// Middleware
app.use(express.json());

// Routes
registerApprovalRoutes(app, config);
registerWebhookRoutes(app, config);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(config.server.port, () => {
  console.log(`Cplit server running on port ${config.server.port}`);
});
