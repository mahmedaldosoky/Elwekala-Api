import express from "express";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../mongodb/models/user.js";

//image imports
import cloudinary from "cloudinary";
import fs from "fs";
import { promisify } from "util";

dotenv.config();

const app = express.Router();

// configure cloudinary
cloudinary.config({
  cloud_name: "dzh2hde2n",
  api_key: "692425944689747",
  api_secret: "WPWBWEFlS8DZ3ND9oohrQQ7A9DM",
});

// helper function to promisify fs.writeFile
const writeFile = promisify(fs.writeFile);

//add user

app.post("/register", async (req, res) => {
  let profileImagePath = "";

  try {
    const { name, email, phone, nationalId, gender, password, profileImage } =
      req.body;

    if (!name || !email || !phone || !nationalId || !gender || !password) {
      return res
        .status(200)
        .json({ status: "error", message: "Invalid user data", user: null });
    }

    if (password.length < 8) {
      return res.status(200).json({
        status: "error",
        message: "Password should be at least 8 characters long.",
        user: null,
      });
    }

    const isValidPhone = /^01\d{9}$/.test(phone);
    const isValidNationalId = /^\d{14}$/.test(nationalId);
    const isValidName = name.length >= 2;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidPhone)
      return res.status(400).send({
        status: "error",
        message:
          "Invalid phone number. Please enter a valid phone number starting with '01' and consisting of 11 digits.",
        user: null,
      });

    if (!isValidNationalId)
      return res.status(400).send({
        status: "error",
        message:
          "Invalid national ID. Please enter a valid national ID consisting of exactly 14 digits.",
        user: null,
      });

    if (!isValidName)
      return res.status(400).send({
        status: "error",
        message:
          "Invalid name. Please enter a name with at least 2 characters.",
        user: null,
      });

    if (!isValidEmail)
      return res.status(400).send({
        status: "error",
        message: "Invalid email address. Please enter a valid email address.",
        user: null,
      });

    // Validate name to not be more than 2 words
    const nameWords = name.split(" ");
    if (nameWords.length > 2) {
      return res.status(200).json({
        status: "error",
        message: "Name can't have more than 2 words",
        user: null,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        status: "error",
        message: "Email already registered",
        user: null,
      });
    }

    const token = generateToken();

    const hashedPassword = await bcrypt.hash(password, 10);

    // decode base64 image data and write to file
    const profileImageBuffer = Buffer.from(
      profileImage.split(";base64,").pop(),
      "base64"
    );
    const profileImageFileName = `${Date.now()}-profile.png`;
    profileImagePath = `public/uploads/${profileImageFileName}`;
    await writeFile(profileImagePath, profileImageBuffer);

    // upload profile image to cloudinary
    const uploadedProfileImage = await cloudinary.uploader.upload(
      profileImagePath,
      {
        folder: "user-profile-images",
        allowedFormats: ["jpg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      }
    );

    const newUser = new User({
      name,
      email,
      phone,
      nationalId,
      profileImage: uploadedProfileImage.secure_url,
      gender,
      password: hashedPassword,
      token,
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        nationalId: newUser.nationalId,
        gender: newUser.gender,
        profileImage: newUser.profileImage,
        token: newUser.token,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, user: null });
  } finally {
    // delete the uploaded file from the server
    if (profileImagePath) {
      fs.unlink(profileImagePath, (err) => {
        if (err) console.error(err);
      });
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({
        status: "error",
        message: "Email and password are required",
        user: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "Invalid Email", user: null });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(200)
        .json({ status: "error", message: "Invalid password", user: null });
    }

    const token = generateToken();

    user.token = token;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        gender: user.gender,
        profileImage: user.profileImage,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, user: null });
  }
});

app.post("/logout", async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "User not found" });
    }

    user.token = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "User logged out successfully" });
  } catch (err) {
    res.status(200).json({ status: "error", message: err.message });
  }
});

app.post("/profile", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(200)
        .json({ status: "error", message: "empty token error", user: null });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "User not found", user: null });
    }

    // const hasPassword = user.password ? true : false;

    res.status(200).json({
      status: "success",
      message: null,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        gender: user.gender,
        profileImage: user.profileImage,
        token: token,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", user: null });
  }
});

app.put("/update", async (req, res) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01\d{9}$/;
  const { token } = req.body;
  const { name, email, phone, gender, password } = req.body;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(200)
        .json({ status: "failure", message: "User not found",user:null, });
    }

    // Validate email
    if (email && !emailRegex.test(email)) {
      return res
        .status(200)
        .json({ status: "failure", message: "Invalid email format",user:null, });
    }

    // Validate phone number
    if (phone && (!phoneRegex.test(phone) || phone.length !== 11)) {
      return res
        .status(200)
        .json({ status: "failure", message: "Invalid phone number format" ,user:null,});
    }

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.password = hashedPassword || user.password;

    await user.save();

    // Return the updated user object with the password as a string
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      password: password || "",
    };

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failure", message: "Server error" });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(200)
        .json({ status: "error", message: "Email is required", user: null });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "User not found", user: null });
    }

    await User.deleteOne({ email });

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      user: null,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", user: null });
  }
});

app.post("/display", async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const admin = await User.findOne({ isAdmin });
    if (admin === false)
      return res
        .status(200)
        .json({ message: "You are not authorized to view this page" });

    const user = await User.find();

    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "User not found", user: null });
    }
    res.status(200).json({
      status: "success",
      message: "Users data retrieved successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", user: null });
  }
});

function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

//forget password
app.post("/forget-password", async (req, res) => {
  const { nationalId, newPassword } = req.body;

  try {
    // Find the user by national ID
    const user = await User.findOne({ nationalId });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    await user.save();

    // Return a success response
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
