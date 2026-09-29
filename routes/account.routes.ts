import { Router } from "express";
import { createAccount } from "../controllers/account.controller";
import protect from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createAccount);

export default router;
