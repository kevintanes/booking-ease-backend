import dotenv from "dotenv";

dotenv.config({ quiet: true });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: process.env.PORT || 3000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: requireEnv("GOOGLE_CALLBACK_URL"),
};
