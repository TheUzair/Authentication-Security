import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import session from "express-session";
import passport from "passport";
import PassportLocalMongoose from "passport-local-mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Session setup
app.use(
    session({
        secret: "A little secret.",
        resave: false,
        saveUninitialized: false,
    })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const uri = "mongodb://127.0.0.1/userDB";
mongoose.connect(uri);

// User schema and model setup
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
});

userSchema.plugin(PassportLocalMongoose);
userSchema.plugin(findOrCreate);

const userModel = mongoose.model("User", userSchema);

// Passport strategies and serialization/deserialization setup
passport.use(userModel.createStrategy());

// Serialization function to store user information in the session
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture,
        });
    });
});

// Deserialization function to retrieve user information from the session
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// Google OAuth2.0 strategy setup
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/secrets",
            scope: "profile",
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log("printing profile:", profile);
            userModel.findOrCreate(
                { googleId: profile.id },
                function (err, user) {
                    return cb(err, user);
                }
            );
        }
    )
);

// Routes

// Home route
app.get("/", async (req, res) => {
    res.render("home");
});

// Google OAuth2.0 authentication route
app.get("/auth/google", async (req, res) => {
    passport.authenticate("google", { scope: ["profile"] })(req, res);
});

// Callback route after successful Google authentication
app.get(
    "/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect to the secrets page
        res.redirect("/secrets");
    }
);

// Login route
app.get("/login", async (req, res) => {
    res.render("login");
});

// Register route
app.get("/register", async (req, res) => {
    res.render("register");
});

// Secrets route
app.get("/secrets", async (req, res) => {
    try {
        const foundUsers = await userModel.find({ secret: { $ne: null } });

        if (foundUsers) {
            res.render("secrets", { userWithSecrets: foundUsers });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Submit route
app.get("/submit", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});

// Submit a new secret
app.post("/submit", async (req, res) => {
    const submittedSecret = req.body.secret;
    console.log(req.user.id);

    try {
        const foundUser = await userModel.findOne({ _id: req.user.id });

        if (foundUser) {
            foundUser.secret = submittedSecret;
            await foundUser.save();
            res.redirect("/secrets");
        } else {
            console.log("User not found");
            // Handle the case where the user is not found
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Logout route
app.get("/logout", async (req, res) => {
    // Logout route, with callback handling errors
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        res.redirect("/");
    });
});

// Register route using Passport's register method
app.post("/register", async (req, res) => {
    userModel.register(
        { username: req.body.username },
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                // Authenticate user after successful registration
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

// Login route using custom login logic
app.post("/login", async (req, res) => {
    const newUser = new userModel({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(newUser, function (err) {
        if (err) {
            console.log(err);
        } else {
            // Authenticate user after successful login
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
