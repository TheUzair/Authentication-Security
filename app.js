import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

console.log(process.env.API_KEY);

import mongoose from "mongoose";
import mongooseEncryption from "mongoose-encryption";
const encrypt = mongooseEncryption;
const uri = "mongodb://127.0.0.1/userDB";
mongoose.connect(uri);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// prettier-ignore
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const userModel = mongoose.model("User", userSchema);

app.get("/", async (req, res) => {
    res.render("home");
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/register", async (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const newUser = new userModel({
            email: req.body.username,
            password: req.body.password,
        });

        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await userModel.findOne({ email: username });

        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        } else {
            res.send("Invalid username or password");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
