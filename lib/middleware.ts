import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./prisma";

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  context: { prisma: typeof prisma }
) => Promise<void | NextApiResponse> | void | NextApiResponse;

export function withPrisma(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Pass prisma client to the handler
      return await handler(req, res, { prisma });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
