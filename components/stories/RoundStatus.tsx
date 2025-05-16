import { useEffect, useState } from "react";
import { StoriesAPI } from "../../lib/api-client";

interface RoundStatusProps {
  storyId: string;
  onRoundEnded: () => void;
}

export default function RoundStatus({
  storyId,
  onRoundEnded,
}: RoundStatusProps) {
  const [status, setStatus] = useState<{
    canEndRound: boolean;
    votingEndDate: string;
    remainingTime: number;
    submissionsCount: number;
    currentRound: number;
    hasTie?: boolean;
    waitingForTieBreak?: boolean;
    tiedSubmissions?: { id: string; content: string; votes: number }[];
    waitingForSubmissions?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endingRound, setEndingRound] = useState(false);
  const [endRoundSuccess, setEndRoundSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Function to format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return "Voting period has ended";

    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Check round status
  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await StoriesAPI.checkRoundStatus(storyId);
      setStatus(data);

      // Format time remaining
      if (data.remainingTime > 0) {
        setTimeRemaining(formatTimeRemaining(data.remainingTime));
      } else {
        setTimeRemaining("Voting period has ended");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to check round status");
      console.error("Error checking round status:", err);
    } finally {
      setLoading(false);
    }
  };

  // End the current round
  const handleEndRound = async (forceTieBreak = false) => {
    try {
      setEndingRound(true);
      setError(null);

      const result = await StoriesAPI.endRound(storyId, forceTieBreak);

      if (result.success) {
        setEndRoundSuccess(true);
        // Notify parent component that round has ended
        onRoundEnded();
      } else if (result.hasTie && result.waitingForTieBreak) {
        // Update status to show tie information
        setStatus((prevStatus) => {
          if (!prevStatus) return null;
          return {
            ...prevStatus,
            hasTie: true,
            waitingForTieBreak: true,
            tiedSubmissions: result.tiedSubmissions,
          };
        });
      } else if (result.waitingForSubmissions) {
        setStatus((prevStatus) => {
          if (!prevStatus) return null;
          return {
            ...prevStatus,
            waitingForSubmissions: true,
          };
        });
      }
    } catch (err) {
      setError((err as Error).message || "Failed to end round");
      console.error("Error ending round:", err);
    } finally {
      setEndingRound(false);
    }
  };

  // Check status on mount and set up interval to update time remaining
  useEffect(() => {
    checkStatus();

    // Set up timer to update remaining time
    const timer = setInterval(() => {
      if (status && status.remainingTime > 0) {
        const newRemainingTime = status.remainingTime - 1000;

        if (newRemainingTime <= 0) {
          // Time has expired, trigger a re-check
          checkStatus();
        } else {
          // Update status with new remaining time
          setStatus({
            ...status,
            remainingTime: newRemainingTime,
          });
          setTimeRemaining(formatTimeRemaining(newRemainingTime));
        }
      }
    }, 1000);

    // Clean up timer
    return () => clearInterval(timer);
  }, [storyId]);

  // Re-check status when the timer gets to zero
  useEffect(() => {
    if (status && status.remainingTime <= 0) {
      checkStatus();
    }
  }, [status?.remainingTime]);

  // Handle successful round ending
  useEffect(() => {
    if (endRoundSuccess) {
      // Reset state after success message display
      const timer = setTimeout(() => {
        setEndRoundSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [endRoundSuccess]);

  // If no round status yet
  if (loading && !status) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
          <p className="text-gray-400">Checking round status...</p>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error && !status) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg shadow mb-6">
        <p className="text-red-300">Error: {error}</p>
        <button
          onClick={checkStatus}
          className="text-sm text-primary hover:underline mt-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If round status loaded successfully
  if (status) {
    const { canEndRound, submissionsCount, currentRound } = status;

    // Handle case where there aren't any submissions yet
    if (submissionsCount === 0) {
      return (
        <div className="p-4 bg-gray-800 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Round {currentRound} Status
          </h3>
          <p className="text-gray-300 mb-1">
            No submissions yet for this round.
          </p>
          <p className="text-sm text-gray-400">
            Submissions will be accepted until there are enough to vote on.
          </p>
        </div>
      );
    }

    // Show round status with proper action
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow mb-6">
        {endRoundSuccess ? (
          <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded">
            <p className="font-medium">Round ended successfully!</p>
            <p className="text-sm">
              The winning submission has been added to the story.
            </p>
          </div>
        ) : status.hasTie &&
          status.waitingForTieBreak &&
          status.tiedSubmissions ? (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Round {currentRound} Tie Detected
            </h3>
            <div className="mb-4">
              <p className="text-yellow-300 mb-2">
                There is a tie between {status.tiedSubmissions.length}{" "}
                submissions:
              </p>
              <div className="space-y-3 my-3">
                {status.tiedSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-700 rounded p-3"
                  >
                    <p className="text-gray-300 mb-1 italic">
                      "{submission.content}"
                    </p>
                    <p className="text-sm text-gray-400">
                      {submission.votes} votes
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-3">
                You can wait for more votes to break the tie, or force end the
                round now.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => checkStatus()}
                  className="btn-secondary btn-sm"
                >
                  Check for New Votes
                </button>
                <button
                  onClick={() => handleEndRound(true)}
                  disabled={endingRound}
                  className="btn-primary btn-sm"
                >
                  {endingRound ? "Processing..." : "Force End Round"}
                </button>
              </div>
            </div>
          </>
        ) : status.waitingForSubmissions ? (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Round {currentRound} Status
            </h3>
            <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-300 p-3 rounded mb-3">
              <p className="mb-1">Waiting for submissions</p>
              <p className="text-sm">
                The round cannot be ended until there is at least one
                submission.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => checkStatus()}
                className="btn-secondary btn-sm"
              >
                Check Again
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Round {currentRound} Status
            </h3>
            <p className="text-gray-300 mb-1">
              {submissionsCount} submission{submissionsCount !== 1 ? "s" : ""}{" "}
              in this round
            </p>
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm">
                <span className="text-gray-400">
                  {canEndRound
                    ? "Voting period has ended"
                    : `Time remaining: ${timeRemaining}`}
                </span>
              </div>

              {canEndRound && (
                <button
                  onClick={() => handleEndRound()}
                  disabled={endingRound}
                  className={`btn-primary btn-sm ${
                    endingRound ? "opacity-50" : ""
                  }`}
                >
                  {endingRound ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "End Round & Select Winner"
                  )}
                </button>
              )}
            </div>

            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </>
        )}
      </div>
    );
  }

  return null;
}
