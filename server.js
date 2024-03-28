import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db/index.js";
import Alumni from "./models/alumni.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import { upload } from "./middleware/multer.js";
import { uploadOnCloudinary } from "./utils/cloudinary.js";
import Admin from "./models/admin.js";
import Gallery from "./models/gallery.js";
import { extractPublicId } from "cloudinary-build-url";
import { v2 as cloudinary } from "cloudinary";

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 3000;
connectDB();
dotenv.config({
    path: "./env"
});

// Alumni Login/Register

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        console.log("Token not available");
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Error:", err);
        }
        req.user = user;
        next();
    });
}

app.post("/alumni/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Alumni.findOne({ username: username });
        if (!existingUser) {
            return res.status(409).json({ error: "User is not Registered!" });
        }
        const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ error: "Incorrect Password" });
        }
        const token = existingUser.generateAccessToken();
        return res.json({ token });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.post("/alumni/register", upload.single("image"),  async (req, res) => {
    try {
        const { username, password, name, fatherName, profession, gender, email, roll, phone, dob, course, branch, year, linkedin, instagram, github, company } = req.body;
        const image = await uploadOnCloudinary(req.file.path);
        const existingUser = await Alumni.findOne({ username: username });
        if (existingUser) {
            return res.status(409).json({ error: "User Already Exists" });
        }
        const newUser = new Alumni({ username, password, name, fatherName, profession, gender, email, roll, phone, dob, course, branch, year, linkedin, instagram, github, company, image: image.url });
        await newUser.save();
        const token = newUser.generateAccessToken();
        return res.json({ token });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/alumni/user", authenticateUser, async (req, res) => {
    try {
        const userId = req.user;
        const response = await Alumni.findById(userId);
        res.status(200).json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.put("/alumni/profile/edit", authenticateUser, async (req, res) => {
    try {
        const userId = req.user;
        const {formData} = req.body;
        const response = await Alumni.findById(userId);
        // res.status(200).json({ response });
        console.log(formData);
    }
    catch (err) {
        console.log("Error:", err);
    }
});

// Admin Login

app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Admin.findOne({ username: username });
        if (!existingUser) {
            return res.status(409).json({ error: "User is not Registered!" });
        }
        const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ error: "Incorrect Password" });
        }
        const token = existingUser.generateAccessToken();
        return res.json({ token });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.post("/admin/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Admin.findOne({ username: username });
        if (existingUser) {
            return res.status(409).json({ error: "User Already Exists" });
        }
        const newUser = new Admin({ username, password });
        await newUser.save();
        const token = newUser.generateAccessToken();
        return res.json({ token });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

// Admin CRUD

app.post("/admin/add-user", upload.single("image"), async (req, res) => {
    try {
        const { name, father, profession, gender, email, roll, phone, dob, course, branch, year, linkedin, instagram, github, company } = req.body;
        const image = await uploadOnCloudinary(req.file.path);
        const username = roll;
        const password = branch + year;
        const verified = true;
        const newUser = new Alumni({ username, password, name, father, profession, gender, email, roll, phone, dob, course, branch, year, linkedin, instagram, github, company, image:image.url, verified });
        await newUser.save();
        return res.status(200).json({ success: "User added successfully" });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/admin/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const response = await Alumni.findById(userId);
        return res.status(200).json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.delete("/admin/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Alumni.findById(userId);
        const publicId = extractPublicId(user.image);
        await cloudinary.uploader.destroy(publicId);
        await Alumni.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted!" });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/admin/gallery", async (req, res) => {
    try {
        const response = await Gallery.find();
        return res.status(200).json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.post("/admin/gallery", upload.array("image"), async (req, res) => {
    try {
        const files = req.files;
        for (const file of files) {
            const image = await uploadOnCloudinary(file.path);
            const newImage = new Gallery({ image:image.url });
            await newImage.save();
        }
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.delete("/admin/gallery/:id", async (req, res) => {
    try {
        const imageId = req.params.id;
        const image = await Gallery.findById(imageId);
        const publicId = extractPublicId(image.image);
        await cloudinary.uploader.destroy(publicId);
        await Gallery.findByIdAndDelete(imageId);
        return res.status(200).json({ message: "Image deleted" });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/admin/users", async (req, res) => {
    try {
        const response = await Alumni.find();
        return res.json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/admin/images", async (req, res) => {
    try {
        const response = await Gallery.find();
        return res.json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

// Alumni Profile

app.get("/profile", authenticateUser, async (req, res) => {
    try {
        const user = await Alumni.findById(req.user);
        return res.json({ user });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

// Alumni Directory
app.get("/directory", async (req, res) => {
    try {
        const response = await Alumni.find();
        return res.json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

app.get("/directory/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const response = await Alumni.findById(id);
        return res.json({ response });
    }
    catch (err) {
        console.log("Error:", err);
    }
});

// Gallery
app.get("/gallery", async (req, res) => {
    try {
        const response = await Gallery.find();
        return res.json({ response });
    }
    catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});