import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transaction.controller";
import protect from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, deleteTransaction);
router.put("/:id", protect, updateTransaction);

export default router;
