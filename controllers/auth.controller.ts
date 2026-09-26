import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";

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

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
