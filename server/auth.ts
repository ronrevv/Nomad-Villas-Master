import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import session from "express-session";

export function setupAuth(app: Express) {
  // Session setup
  app.use(
    session({
      secret: "super-secret-key", // In production use env var
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // For MVP, simple auth: if user exists, check password.
        // Actually, let's just create the user if they don't exist for simplicity?
        // No, let's stick to standard behavior. Or better: "Login as..."
        // For this MVP, we will allow login if the username exists.
        // If not, we can auto-register or fail.
        // Let's AUTO-REGISTER for simplicity of demo.

        let user = await storage.getUserByUsername(username);
        if (!user) {
            // Auto-create user
            user = await storage.upsertUser({
                username,
                role: "guest", // Default role
                firstName: username, // Fallback
                id: `user_${Date.now()}`
            });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "Login failed" });

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
