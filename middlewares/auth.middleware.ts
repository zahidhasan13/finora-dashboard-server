import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  userId: string;
  role: "user" | "admin";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthPayload;

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default protect;
