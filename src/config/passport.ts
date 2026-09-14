import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos?.[0]?.value;

        let user = await prisma.user.findUnique({
          where: {
            googleId: googleId,
          },
        });

        if (!user) {
          // Upsert
          user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });

          if (user) {
            // User Ada maka Update
            user = await prisma.user.update({
              where: {
                email: email,
              },
              data: {
                googleId: googleId,
                avatar: avatar,
              },
            });
          } else {
            // User Tidak ada maka Create
            user = await prisma.user.create({
              data: {
                email: email,
                name: name,
                googleId: googleId,
                avatar: avatar,
                role: "USER",
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);
