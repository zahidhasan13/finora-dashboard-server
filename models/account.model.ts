import { Schema, Types, model } from "mongoose";

interface Account {
  userId: Types.ObjectId;
  name: string;
  type: "bank" | "cash" | "credit_card" | "mobile_wallet";
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<Account>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["bank", "cash", "credit_card", "mobile_wallet"],
      required: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const AccountModel = model<Account>("Account", accountSchema);

export default AccountModel;
