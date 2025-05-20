import { runPrismaInApi } from "@/lib/api-helpers";
import { authenticate, AuthenticatedRequest } from "@/lib/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default authenticate(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const user = req?.user;

  // GET endpoint to retrieve a user
  if (req.method === "GET") {
    return res.send({ user });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
