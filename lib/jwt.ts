import { NextApiRequest, NextApiResponse } from "next";
import { User } from "./types";
const jwt = require("jsonwebtoken");

export type AuthenticatedRequest = NextApiRequest & { user: User };

export const authenticate =
  (
    handler: (
      req: AuthenticatedRequest,
      res: NextApiResponse
    ) => Promise<void | NextApiResponse>
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // Get token from cookie instead of header
    const token = req.cookies.token;

    if (!token) {
      return res.status(403).json({ message: "NO ACCESS" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;

      // Attach user to request

      return handler(
        { ...req, user: decoded } as unknown as AuthenticatedRequest,
        res
      );
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

export const generateJWT = (user: User) =>
  jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: "365d",
  });
