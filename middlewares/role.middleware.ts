import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";

type Role = "user" | "admin";

const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    // Authorizeation checked
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });

      return;
    }
    next();
  };
};

export default authorize;
