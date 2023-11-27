import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import session from "express-session";
import passport from "passport";
import PassportLocalMongoose from "passport-local-mongoose";

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

console.log(process.env.API_KEY); // Log environment variable (if present)

// User schema and model setup
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(PassportLocalMongoose);

const userModel = mongoose.model("User", userSchema);

// Passport strategies and serialization/deserialization setup
passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Routes
app.get("/", async (req, res) => {
    res.render("home");
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/register", async (req, res) => {
    res.render("register");
});

app.get("/secrets", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

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

app.post("/register", async (req, res) => {
    // Registration route using Passport's register method
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

app.post("/login", async (req, res) => {
    // Login route using custom login logic
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
