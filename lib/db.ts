"use server";

// Create a server-side client (for API routes)
import { createServerClient } from "@supabase/ssr";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export const createServerSupabaseClient = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies[name],
        set: (name, value, options) => {
          res.setHeader(
            "Set-Cookie",
            serialize(name, value, {
              path: "/",
              ...options,
            })
          );
        },
        /* getAll() {
          return req.cookies
            ? Object.entries(req.cookies).map(([name, value]) => ({
                name,
                value,
              }))
            : [];
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            res.setHeader(
              "Set-Cookie",
              serialize(name, value, {
                path: "/",
                ...options,
              })
            );
          });
        }, */
      },
    }
  );
};
