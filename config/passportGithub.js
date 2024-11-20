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
    },
    async (accessToken, refreshToken, profile, done) => {
      let email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;

      // Check if email is null and handle accordingly
      if (!email) {
        console.log("Email not provided by GitHub.");
        // Option 1: Throw an error or redirect the user
        // return done(new Error("Email is required but not provided by GitHub."), null);

        // Option 2: Use a placeholder email (not recommended for production)
        email = `user_${profile.id}@example.com`;
      }
      try {
        // console.log("GitHub Profile:", profile);
        // Query to check if the user exists
        const [existingUser] = await db
          .promise()
          .execute("SELECT * FROM users WHERE github_id = ?", [profile.id]);

        // console.log("Existing User:", existingUser); // Debugging output

        if (existingUser && existingUser.length > 0) {
          // If user exists, pass the user object to done
          return done(null, existingUser[0]);
        } else {
          // If no user found, log and proceed to create a new user
          console.log("No user found, creating a new one...");

          const [result] = await db
            .promise()
            .execute(
              "INSERT INTO users (username, email, github_id, avatar) VALUES (?, ?, ?, ?)",
              [
                profile.username, // Username is usually always provided
                email, // Already validated
                profile.id, // GitHub ID is always provided
                profile.photos && profile.photos.length > 0
                  ? profile.photos[0].value
                  : null, // Check for photos
              ]
            );

          const newUser = {
            id: result.insertId,
            username: profile.username,
            email: profile.email[0]?.value || null,
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
