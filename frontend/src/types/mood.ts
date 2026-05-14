export type Mood = "amazing" | "good" | "neutral" | "bad" | "terrible";

export type MoodLog = {
  id: string;
  user_id: string;
  logged_at: string;
  mood: Mood;
  score: number;
  note: string | null;
};

export type MoodStats = {
  average_score_7d: number;
  average_score_30d: number;
  mood_distribution: Record<Mood, number>;
};
