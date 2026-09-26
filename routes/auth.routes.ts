import { Router } from "express";
import { getMe, login, logout, signup } from "../controllers/auth.controller";
import protect from "../middlewares/auth.middleware";
import authorize from "../middlewares/role.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.get("/admin", protect, authorize("admin"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

export default router;
