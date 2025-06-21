import User from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendMail } from '../utils/MailSender.js';
dotenv.config();

export const createUser = async (req,res) => {
    try {
        const { username,email,password } = req.body;
        const usernameExists = await User.findOne({ username });
        const emailExists = await User.findOne({ email })
        if(usernameExists){
            console.log("Username already exists");
            return res.status(402).json({message : "Username already taken"});
        }
        if(emailExists){
            console.log("Email already exists");
            return res.status(402).json({message : "email already taken"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        console.log("user will be created");
        await User.create({username,email,password: hashedPassword});
        console.log("User created successfully");
        const subject = "Welcome to Our E-Commerce Service";
        const text = `Hello ${username},\n\nThank you for signing up! We're excited to have you as our customer.\n\nBest regards,\nYour Team`;
        const response = await sendMail(email,subject,text);
        console.log("Welcome email sent successfully");
        return res.status(200).json({message: "User created successfully"});
    } catch (error) {
        console.log("error", error);
      res.status(500).json({message: "Error creating user"});
    }
}
export const getUsers = async (req,res) => {
    try {
        const users = await User.find();
        if(!users){
            return res.status(404).json({message : "No user data is available"});
        }
        return res.status(200).json({message: "Users data fetched successfully",users});
    } catch (error) {
        res.status(500).json({message: "Error getting users data"});
    }
}

export const loginUser = async (req,res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid credentials"});
        }
        const payload = {
            user:{
                id: user._id,
                email: user.email,
                role: user.role,
                userName: user.username
            }
        }
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        const redirectPath = user.role === "admin" ? "admin" : "user";
        console.log("Login successfull")
        return res.status(200).json({message: "Login successful",  token:token,
            userId:user._id,redirectedPath: redirectPath});
    } catch (error) {
        console.log("error",error);
        res.status(500).json({message: "Error logging in"});
    }
}




export const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User fetched successfully", user);
        return res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
        console.log("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user" });
    }
}