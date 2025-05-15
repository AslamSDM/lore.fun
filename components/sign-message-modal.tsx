import React from "react";
import { useAuthStore } from "../lib/auth-store";

interface SignMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function SignMessageModal({
  isOpen,
  onClose,
  walletAddress,
}: SignMessageModalProps) {
  const { isAuthenticating, authError } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Verify Wallet Ownership</h2>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Please sign the message with your wallet to verify your ownership.
            This is a secure way to authenticate without sharing private keys.
          </p>

          <div className="bg-gray-800 p-3 rounded border border-gray-700 mb-4">
            <p className="text-sm text-gray-400 mb-1">Message to sign:</p>
            <p className="text-white break-all">
              Sign this message to verify your wallet ownership for LoreFun:{" "}
              {walletAddress.substring(0, 8)}...
              {walletAddress.substring(walletAddress.length - 8)}
            </p>
          </div>

          <div className="flex items-center text-yellow-400 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Check your wallet for a signature request</span>
          </div>

          {authError && (
            <div className="text-red-400 bg-red-400 bg-opacity-10 p-3 rounded border border-red-400 mt-4">
              <p className="text-sm font-medium">Error: {authError}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
            disabled={isAuthenticating}
          >
            Cancel
          </button>
          <div className="flex items-center text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-2"></div>
            Waiting for signature...
          </div>
        </div>
      </div>
    </div>
  );
}
