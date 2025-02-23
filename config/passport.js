import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db.js";
import { sendEmailWhenSignUp } from "../utils/email.js";
import "dotenv/config";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
      passReqToCallback: true, // Enable req access in the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Capture User-Agent from the request headers
        const userAgent = req.headers["user-agent"];

        // Check if user exists
        const [existingUser] = await db
          .promise()
          .execute("SELECT * FROM users WHERE google_id = ? OR email = ?", [
            profile.id,
            profile.emails[0].value,
          ]);

        if (existingUser.length > 0) {
          // Update last_login_browser for existing user
          await db
            .promise()
            .execute("UPDATE users SET last_login_browser = ? WHERE id = ?", [
              userAgent,
              existingUser[0].id,
            ]);
          return done(null, existingUser[0]);
        }

        // Create new user
        const [result] = await db
          .promise()
          .execute(
            "INSERT INTO users (username, email, google_id, avatar, last_login_browser) VALUES (?, ?, ?, ?, ?)",
            [
              profile.displayName,
              profile.emails[0].value,
              profile.id,
              profile.photos[0]?.value || null,
              userAgent,
            ]
          );

        const newUser = {
          id: result.insertId,
          username: profile.displayName,
          email: profile.emails[0].value,
          last_login_browser: userAgent,
        };

        await sendEmailWhenSignUp(newUser.email, newUser.username, "signup");
        done(null, newUser);
      } catch (error) {
        console.error("Error during Google OAuth:", error);
        done(error, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await db
      .promise()
      .execute("SELECT * FROM users WHERE id = ?", [id]);
    done(null, user[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
