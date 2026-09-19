/**
 * Mock backend server — implements the API_CONTRACT.md endpoints with static
 * mock data so the frontend can be built fully before the real AWS pipeline
 * (Kamal's side) is ready. Swap the frontend's API base URL when the real
 * backend is live — no frontend code changes should be needed if both sides
 * follow the contract.
 */
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const carePlanMock = require("./mocks/carePlan.mock.json");

const app = express();
app.use(cors());
app.use(express.json());

// Simulates POST /api/session — matches Kamal's real backend contract
app.post("/api/session", (req, res) => {
  res.json({ sessionId: uuidv4() });
});

// Simulates POST /api/upload
app.post("/api/upload", (req, res) => {
  res.json({ id: "demo-123", status: "processing" });
});

// Simulates GET /api/status/:id
app.get("/api/status/:id", (req, res) => {
  res.json({ status: "ready" });
});

// Simulates GET /api/care-plan/:id
app.get("/api/care-plan/:id", (req, res) => {
  res.json(carePlanMock);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
});