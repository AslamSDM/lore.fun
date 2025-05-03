import { ethers } from "ethers"

// LORE token contract address (replace with actual contract in production)
const LORE_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890"
const LORE_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
]

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { address } = req.query

  if (!address) {
    return res.status(400).json({ error: "Address is required" })
  }

  try {
    // Connect to the blockchain using the provided RPC URL
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    // For development/testing purposes, we'll still use a mock balance
    // In production, uncomment the token contract code and remove the mock

    /* 
    // Real implementation:
    const tokenContract = new ethers.Contract(LORE_TOKEN_ADDRESS, LORE_TOKEN_ABI, provider);
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(address);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    const hasTokens = parseFloat(formattedBalance) > 0;
    */

    // Mock implementation (for development)
    const mockBalance = Math.floor(Math.random() * 1000)
    const hasTokens = mockBalance > 0

    // Check if the address is valid on the network
    try {
      const ethBalance = await provider.getBalance(address)
      console.log(`ETH Balance for ${address}: ${ethers.utils.formatEther(ethBalance)}`)
    } catch (error) {
      console.warn(`Error checking ETH balance: ${error.message}`)
    }

    return res.status(200).json({
      address,
      balance: mockBalance.toString(), // Replace with formattedBalance in production
      hasTokens,
    })
  } catch (error) {
    console.error("Error checking token balance:", error)
    return res.status(500).json({ error: "Failed to check token balance" })
  }
}
