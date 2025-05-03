import { ethers } from "ethers"

// LORE token contract details
export const LORE_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual address
export const LORE_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
]

/**
 * Get a provider instance
 * @returns {ethers.providers.JsonRpcProvider}
 */
export function getProvider() {
  return new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
}

/**
 * Get a contract instance
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 * @param {ethers.providers.Provider|ethers.Signer} signerOrProvider - Signer or provider
 * @returns {ethers.Contract}
 */
export function getContract(address, abi, signerOrProvider) {
  return new ethers.Contract(address, abi, signerOrProvider)
}

/**
 * Format an address for display
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Check if an address is valid
 * @param {string} address - Ethereum address
 * @returns {boolean}
 */
export function isValidAddress(address) {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Format token amount based on decimals
 * @param {string|number} amount - Token amount in wei
 * @param {number} decimals - Token decimals
 * @returns {string} Formatted amount
 */
export function formatTokenAmount(amount, decimals = 18) {
  return ethers.utils.formatUnits(amount, decimals)
}
