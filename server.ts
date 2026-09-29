import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const PORT = process.env.PORT || 8400;

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
