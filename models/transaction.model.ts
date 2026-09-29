import { Schema, model, Types } from "mongoose";

interface Transaction {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;

  type: "income" | "expense";
  amount: number;

  category: string;
  description?: string;

  date: Date;

  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<Transaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const TransactionModel = model<Transaction>("Transaction", transactionSchema);

export default TransactionModel;
