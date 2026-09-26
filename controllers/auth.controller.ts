import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import validator from "validator";

// Sinup COntroller
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Check required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    // Validator
    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Email is not valid!",
      });
      return;
    }
    if (!validator.isStrongPassword(password)) {
      res.status(400).json({
        success: false,
        message:
          "A strong password must be at least 8 characters long and combine random uppercase and lowercase letters, numbers, and symbols!",
      });
      return;
    }
    // 2. Check existing user
    const exisitngUser = await User.findOne({ email });

    if (exisitngUser) {
      res.status(409).json({
        success: false,
        message: "User already exists",
      });
      return;
    }
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await User.create({ name, email, password: hashedPassword });

    // JWT
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login Controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Checked require fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    //Find User
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found!",
      });
      return;
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        message: "Password is incorrect!",
      });
      return;
    }

    // JWT
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// GetME controller
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LogOut
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
