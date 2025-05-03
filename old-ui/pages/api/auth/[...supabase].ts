import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createMiddlewareSupabaseClient({ req, res })

  // Forward to Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  res.status(200).json({ user })
}
