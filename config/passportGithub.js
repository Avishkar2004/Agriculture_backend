import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { db } from "./db.js";
import "dotenv/config";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/github/callback",
      passReqToCallback: true, // Enables access to 'req' in the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      let email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;

      // Check if email is null and handle accordingly
      if (!email) {
        console.log("Email not provided by GitHub.");
        email = `user_${profile.id}@example.com`;
      }
      try {
        // Capture the User-Agent from the request headers
        const userAgent = req.headers["user-agent"];

        // Query to check if the user exists
        const [existingUser] = await db
          .promise()
          .execute("SELECT * FROM users WHERE github_id = ?", [profile.id]);

        if (existingUser && existingUser.length > 0) {
          // Update the last_login_browser column for existing users
          await db
            .promise()
            .execute("UPDATE users SET last_login_browser = ? WHERE id = ?", [
              userAgent,
              existingUser[0].id,
            ]);
          // If user exists, pass the user object to done
          return done(null, existingUser[0]);
        } else {
          // If no user found, log and proceed to create a new user
          console.log("No user found, creating a new one...");

          const [result] = await db
            .promise()
            .execute(
              "INSERT INTO users (username, email, github_id, avatar, last_login_browser) VALUES (?, ?, ?, ?, ?)",
              [
                profile.username, // Username is usually always provided
                email, // Already validated
                profile.id, // GitHub ID is always provided
                profile.photos && profile.photos.length > 0
                  ? profile.photos[0].value
                  : null, // Check for photos,
                userAgent,
              ]
            );

          const newUser = {
            id: result.insertId,
            username: profile.username,
            email: email,
          };

          // Proceed after user creation
          return done(null, newUser);
        }
      } catch (error) {
        console.error("GitHub OAuth Error:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
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
