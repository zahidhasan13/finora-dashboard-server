import { Response } from "express";
import { Types } from "mongoose";
import TransactionModel from "../models/transaction.model";
import AccountModel from "../models/account.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createTransactionSchema } from "../validators/transaction.validator";

// Create Transaction
export const createTransaction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = createTransactionSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const { accountId, type, amount, category, description, date } =
      result.data;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    // Check account
    const account = await AccountModel.findOne({
      _id: accountId,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!account) {
      res.status(404).json({
        success: false,
        message: "Account not found",
      });

      return;
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      accountId: new Types.ObjectId(accountId),
      type,
      amount,
      category,
      description,
      date,
    });

    // Update account balance
    if (type === "income") {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }

    await account.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
};

// Get Transaction
export const getTransactions = async (
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

    const { type, category, page = "1", limit = "10" } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter: {
      userId: Types.ObjectId;
      type?: "income" | "expense";
      category?: string;
    } = {
      userId: new Types.ObjectId(userId),
    };

    if (type === "income" || type === "expense") {
      filter.type = type;
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = category;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(filter)
        .populate("accountId", "name type currency")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNumber),

      TransactionModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",

      data: transactions,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

// Delete Transaction
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const transaction = await TransactionModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });

      return;
    }

    const account = await AccountModel.findOne({
      _id: transaction.accountId,
      userId: new Types.ObjectId(userId),
    });

    if (!account) {
      res.status(404).json({
        success: false,
        message: "Account not found",
      });

      return;
    }

    // Reverse the transaction effect
    if (transaction.type === "income") {
      account.balance -= transaction.amount;
    } else {
      account.balance += transaction.amount;
    }

    await account.save();

    await TransactionModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
};

// Update Transaction
export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const { accountId, type, amount, category, description, date } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const transaction = await TransactionModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });

      return;
    }

    // Find old account
    const oldAccount = await AccountModel.findOne({
      _id: transaction.accountId,
      userId: new Types.ObjectId(userId),
    });

    if (!oldAccount) {
      res.status(404).json({
        success: false,
        message: "Old account not found",
      });

      return;
    }

    // Reverse old transaction
    if (transaction.type === "income") {
      oldAccount.balance -= transaction.amount;
    } else {
      oldAccount.balance += transaction.amount;
    }

    await oldAccount.save();

    // Find new account
    const newAccount = await AccountModel.findOne({
      _id: accountId,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!newAccount) {
      res.status(404).json({
        success: false,
        message: "New account not found",
      });

      return;
    }

    // Apply new transaction
    if (type === "income") {
      newAccount.balance += amount;
    } else {
      newAccount.balance -= amount;
    }

    await newAccount.save();

    // Update transaction
    transaction.accountId = new Types.ObjectId(accountId);
    transaction.type = type;
    transaction.amount = amount;
    transaction.category = category;
    transaction.description = description;
    transaction.date = date;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
};
