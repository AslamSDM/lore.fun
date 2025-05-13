import { PublicKey } from "@solana/web3.js"
import { supabase } from "./supabase"
import type { User } from "./types"

export async function getOrCreateUser(
  walletAddress: string,
): Promise<{ user: User | null; isNew: boolean; error: string | null }> {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      return { user: null, isNew: false, error: fetchError.message }
    }

    if (existingUser) {
      return { user: existingUser as User, isNew: false, error: null }
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([{ wallet_address: walletAddress }])
      .select()
      .single()

    if (createError) {
      return { user: null, isNew: false, error: createError.message }
    }

    return { user: newUser as User, isNew: true, error: null }
  } catch (error) {
    return { user: null, isNew: false, error: (error as Error).message }
  }
}

export async function updateUsername(
  userId: string,
  username: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase.from("users").select("id").eq("username", username)

    if (checkError) {
      return { success: false, error: checkError.message }
    }

    if (existingUser && existingUser.length > 0) {
      return { success: false, error: "Username is already taken" }
    }

    // Update username
    const { error: updateError } = await supabase.from("users").update({ username }).eq("id", userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}
