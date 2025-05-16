import { NextApiRequest, NextApiResponse } from "next";
const jwt = require("jsonwebtoken");

export const authenticate =
  (
    handler: (
      req: NextApiRequest,
      res: NextApiResponse
    ) => Promise<void | NextApiResponse>
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // Get token from cookie instead of header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "NO ACCESS" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        walletAddress: string;
      };

      // Attach user to request
      (req as any).user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

export const generateJWT = (userId: any, walletAddress: string) =>
  jwt.sign({ userId, walletAddress }, process.env.JWT_SECRET!, {
    expiresIn: "365d",
  });
