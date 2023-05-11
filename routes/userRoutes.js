import express from "express";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../mongodb/models/user.js";

dotenv.config();

const app = express.Router();

app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, nationalId, gender, password } = req.body;

    if (!name || !email || !phone || !nationalId || !gender || !password) {
      return res
        .status(200)
        .json({ status: "error", message: "Invalid user data", user: null });
    }

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

    const newUser = new User({
      name,
      email,
      phone,
      nationalId,
      gender,
      password: hashedPassword,
      token,
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: { name, email, phone, nationalId, gender, token},
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, user: null });
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

    res.status(200).json({
      status: "success",
      message: null,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        gender: user.gender,
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
  const { token } = req.body;    
  const { name, email, phone, gender, password } = req.body;

  try {
    const user = await User.findOne({token});

    if (!user) {
      return res
        .status(404)
        .json({ status: "failure", message: "User not found" });
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
    res.status(500).json({ status: "failure", message: "Server error" });
  }
});

// app.put("/update", async (req, res) => {
//   try {
//     const { token } = req.body;
//     var existingUser = await User.findOne({ token });
//     if (!existingUser)
//       return res.status(200).json({ message: "Not valid user.", user: null });

//     var { name, email, phone, nationalId, gender, password } = existingUser;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const updateUser = {
//       name: req.body.name,
//       email: req.body.email,
//       password: hashedPassword,
//       phone: req.body.phone,
//       gender: req.body.gender,
//     };

//     const afterUpdate = await User.updateOne(
//       { token: token },
//       { $set: updateUser }
//     );
//     if (!afterUpdate)
//       return res.status(200).json({ message: "Not valid user." });

//     existingUser = await User.findOne({ token });
//     res.status(201).json({
//       status: "success",
//       message: "User data updated successfully",
//       user: {
//         name: existingUser.name,
//         email: existingUser.email,
//         phone: existingUser.phone,
//         password: hashedPassword,
//         nationalId: existingUser.nationalId,
//         gender: existingUser.gender,
//         token: existingUser.token,
//       },
//     });
//   } catch (error) {
//     res
//       .status(200)
//       .json({ status: "error", message: error.message, user: null });
//   }
// });

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

export default app;
