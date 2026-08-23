/**
 * Pulse AI — Root Router
 *
 * Mounts versioned API routes and provides the API index.
 */

const { Router } = require("express");
const v1Routes = require("./v1");
const { success } = require("../lib/response");

const router = Router();

// ─── API Index ───────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json(
    success("Pulse AI API", {
      name: "Pulse AI",
      description: "Healthcare guidance, powered by intelligence.",
      versions: {
        v1: { status: "current", base: "/api/v1" },
      },
      docs: "/api/v1/health",
    })
  );
});

// ─── Versioned Routes ────────────────────────────────────────
router.use("/v1", v1Routes);

module.exports = router;
