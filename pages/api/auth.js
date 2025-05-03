import { createClient } from "@supabase/supabase-js"
import { ethers } from "ethers"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { address, signature, message } = req.body

    if (!address || !signature || !message) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    // Verify signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" })
    }

    // Check if user exists in database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("address", address.toLowerCase())
      .single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error checking user:", userError)
      return res.status(500).json({ error: "Database error" })
    }

    // Create user if not exists
    if (!user) {
      const { error: createError } = await supabase.from("users").insert([
        {
          address: address.toLowerCase(),
          last_login: new Date().toISOString(),
        },
      ])

      if (createError) {
        console.error("Error creating user:", createError)
        return res.status(500).json({ error: "Failed to create user" })
      }
    } else {
      // Update last login
      const { error: updateError } = await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("address", address.toLowerCase())

      if (updateError) {
        console.error("Error updating user:", updateError)
      }
    }

    // Generate JWT token
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.createUser({
      email: `${address.toLowerCase()}@lore.fun`,
      password: ethers.utils.id(address + Date.now()),
      user_metadata: { address: address.toLowerCase() },
    })

    if (tokenError) {
      console.error("Error generating token:", tokenError)
      return res.status(500).json({ error: "Failed to generate token" })
    }

    return res.status(200).json({
      token: tokenData.session.access_token,
      user: {
        address: address.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Auth error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
