import type { NextApiRequest, NextApiResponse } from "next";
import { checkAndProcessRounds } from "../../../lib/round-automation";

/**
 * This API endpoint handles scheduled automatic round endings
 * It can be triggered by an external cron job service like Vercel Cron Jobs or similar
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify API key if provided
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  const configuredApiKey = process.env.CRON_API_KEY;

  if (configuredApiKey && apiKey !== configuredApiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Process all stories that have rounds ready to be ended
    const result = await checkAndProcessRounds();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in automated round processing:", error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
