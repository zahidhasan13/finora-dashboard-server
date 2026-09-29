import { Response } from "express";
import AccountModel from "../models/account.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Types } from "mongoose";

export const createAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, type, balance, currency } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const account = await AccountModel.create({
      userId: new Types.ObjectId(userId),
      name,
      type,
      balance,
      currency,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
};
