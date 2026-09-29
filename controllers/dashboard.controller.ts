import { Response } from "express";
import { Types } from "mongoose";
import AccountModel from "../models/account.model";
import TransactionModel from "../models/transaction.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const userObjectId = new Types.ObjectId(userId);

    // Get active accounts
    const accounts = await AccountModel.find({
      userId: userObjectId,
      isActive: true,
    }).select("name type balance currency");

    // Total income
    const incomeResult = await TransactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "income",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // Total expense
    const expenseResult = await TransactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // Total balance
    const totalBalance = accounts.reduce(
      (total, account) => total + account.balance,
      0,
    );

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;

    // Recent transactions
    const recentTransactions = await TransactionModel.find({
      userId: userObjectId,
    })
      .populate("accountId", "name type currency")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
        totalBalance,
        totalIncome,
        totalExpense,
        accounts,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};
