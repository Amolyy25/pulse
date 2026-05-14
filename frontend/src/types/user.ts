export type User = {
  id: string;
  username: string;
  email: string;
  xp: number;
  gems: number;
  level: number;
  created_at: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};
