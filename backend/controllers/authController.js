const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

async function registerUser(req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      department,
      phone,
      experience,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Name must contain at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    if (role === "doctor") {
      if (!specialization) {
        return res.status(400).json({
          message: "Specialization is required",
        });
      }

      if (!department) {
        return res.status(400).json({
          message: "Department is required",
        });
      }

      if (!phone) {
        return res.status(400).json({
          message: "Phone number is required",
        });
      }

      const phonePattern = /^\d{10}$/;

      if (!phonePattern.test(phone.trim())) {
        return res.status(400).json({
          message: "Phone number must contain exactly 10 digits",
        });
      }

      if (experience === "" || Number(experience) < 0) {
        return res.status(400).json({
          message: "Invalid experience",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "patient",
    });

    if (user.role === "doctor") {
      await Doctor.create({
        _id: user._id,
        name,
        email,
        specialization,
        department,
        phone,
        experience,
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("registerUser error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("loginUser error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getUserProfile(req, res) {
  res.status(200).json(req.user);
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
