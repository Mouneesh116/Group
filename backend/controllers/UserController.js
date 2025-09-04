import User from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendMail } from '../utils/MailSender.js';

dotenv.config();

// Helper function to generate token
const generateToken = (user) => {
  const payload = {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      userName: user.username
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }); // token valid 7 days
};

// ================== SIGNUP ==================
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if username/email already exists
    const usernameExists = await User.findOne({ username });
    const emailExists = await User.findOne({ email });

    if (usernameExists) {
      return res.status(402).json({ message: "Username already taken" });
    }
    if (emailExists) {
      return res.status(402).json({ message: "Email already taken" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    // send welcome email
    const subject = "Welcome to Our E-Commerce Service";
    const text = `Hello ${username},\n\nThank you for signing up! We're excited to have you as our customer.\n\nBest regards,\nYour Team`;
    await sendMail(email, subject, text);

    // generate token
    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User created successfully",
      token,
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// ================== GET ALL USERS ==================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "No user data is available" });
    }
    return res
      .status(200)
      .json({ message: "Users data fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Error getting users data" });
  }
};

// ================== LOGIN ==================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    const redirectPath = user.role === "admin" ? "admin" : "user";

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      redirectedPath: redirectPath,
      role: user.role,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// ================== GET SINGLE USER ==================
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User fetched successfully", user });
  } catch (error) {
    console.log("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ================== UPDATE PROFILE ==================
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;

    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required" });
    }

    // check if email already exists for another user
    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // check if username already exists for another user
    const usernameExists = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
