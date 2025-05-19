import type React from "react";
import { useState } from "react";
import { useWallet } from "../hooks/use-wallet";
import { useNotifications } from "@/hooks/use-notifications";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUsername: saveUsername } = useWallet();
  const { notifyWarning, notifyError, notifySuccess } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      notifyWarning("Username is required", "Missing Username");
      setError("Username is required"); // Keep for UI display
      return;
    }

    if (username.length < 3) {
      notifyWarning(
        "Username must be at least 3 characters",
        "Username Too Short"
      );
      setError("Username must be at least 3 characters"); // Keep for UI display
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      notifyWarning(
        "Username can only contain letters, numbers, and underscores",
        "Invalid Characters"
      );
      setError("Username can only contain letters, numbers, and underscores"); // Keep for UI display
      return;
    }

    setIsSubmitting(true);
    setError("");

    const { success, error } = await saveUsername(username);

    if (!success && error) {
      notifyError(error, "Username Update Failed");
      setError(error); // Keep for UI display
      setIsSubmitting(false);
      return;
    }

    notifySuccess("Username has been set successfully!", "Username Updated");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to Lore.Fun!</h2>
        <p className="text-gray-300 mb-6">
          Choose a username to participate in collaborative storytelling.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                placeholder="Choose a unique username"
                disabled={isSubmitting}
                autoFocus
                maxLength={20}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded mt-4 text-sm">
                {error}
              </div>
            )}
            <p className="text-gray-400 text-xs mt-2">
              Username must be 3-20 characters and can only contain letters,
              numbers, and underscores.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setUsername(`User${Math.floor(Math.random() * 10000)}`)
              }
              className="text-gray-300 underline text-sm hover:text-white"
            >
              Generate Random
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary px-6 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></span>
                  Saving...
                </>
              ) : (
                "Save Username"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
