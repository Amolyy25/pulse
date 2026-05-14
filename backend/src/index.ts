import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import habitsRouter from "./routes/habits";
import journalRouter from "./routes/journal";
import moodRouter from "./routes/mood";
import routinesRouter from "./routes/routines";
import statsRouter from "./routes/stats";
import badgesRouter from "./routes/badges";
import leaderboardRouter from "./routes/leaderboard";
import notificationsRouter from "./routes/notifications";
import { configureWebPush } from "./lib/webpush";
import { startReminderJob } from "./jobs/reminderJob";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/journal", journalRouter);
app.use("/api/mood", moodRouter);
app.use("/api/routines", routinesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/notifications", notificationsRouter);

configureWebPush();
if (process.env.NODE_ENV !== "test") {
  startReminderJob();
}

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Pulse backend listening on http://localhost:${PORT}`);
});
