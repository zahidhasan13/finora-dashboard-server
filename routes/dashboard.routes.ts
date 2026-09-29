import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import protect from "../middlewares/auth.middleware";

const router = Router();

router.get("/summary", protect, getDashboardSummary);

export default router;
