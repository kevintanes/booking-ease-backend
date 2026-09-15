import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import prisma from "./prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(
            new Error("Google account has no accessible email"),
            false,
          );
        }

        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos?.[0]?.value ?? null;

        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // User ada (daftar manual sebelumnya) -> link akun Google
            user = await prisma.user.update({
              where: { email },
              data: { googleId, avatar },
            });
          } else {
            // User baru
            user = await prisma.user.create({
              data: { email, name, googleId, avatar, role: "USER" },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);
