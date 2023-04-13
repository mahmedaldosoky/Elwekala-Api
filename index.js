const express = require("express");
const bcrypt = require("bcrypt");
const User = require("./db");

const app = express();
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, nationalId, gender, password } = req.body;

    if (!name || !email || !phone || !nationalId || !gender || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user data",user:null});
    }

    // Validate name to not be more than 2 words
    const nameWords = name.split(" ");
    if (nameWords.length > 2) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Name can't have more than 2 words",user:null
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already registered" ,user:null});
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
      user: { name, email, phone, nationalId, gender, token },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message,user:null });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid password" });
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
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/logout", async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    user.token = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
