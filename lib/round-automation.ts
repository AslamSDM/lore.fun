// Utility functions for automated round endings

import { StoriesAPI } from "./api-client";

/**
 * Check and process stories that have rounds ready to be ended
 * This can be called periodically to automate round endings
 */
export async function checkAndProcessRounds(): Promise<{
  processed: number;
  errors: any[];
}> {
  try {
    // Get all stories
    const stories = await StoriesAPI.getAll();
    const processed = [];
    const errors = [];

    // Check each story for rounds that can be ended
    for (const story of stories) {
      try {
        const status = await StoriesAPI.checkRoundStatus(story.id);

        // If voting period has ended and there are submissions, try to end the round
        if (status.canEndRound && status.submissionsCount > 0) {
          try {
            // First attempt without forcing, which might wait on tie resolution
            const result = await StoriesAPI.endRound(story.id, false);

            // If the result has a tie, log it but don't count as processed
            if (result.hasTie && result.waitingForTieBreak) {
              console.log(
                `Tie detected in story "${story.title}" (${story.id}). Waiting for tie-breaking votes.`
              );
            }
            // If waiting for submissions, also log and don't count as processed
            else if (result.waitingForSubmissions) {
              console.log(
                `No submissions yet for story "${story.title}" (${story.id}). Waiting for submissions.`
              );
            }
            // Otherwise, count as successfully processed
            else if (result.success) {
              processed.push({
                storyId: story.id,
                title: story.title,
                result,
              });
            }
          } catch (endError) {
            console.error(
              `Error ending round for story "${story.title}" (${story.id}):`,
              endError
            );
            errors.push({
              storyId: story.id,
              title: story.title,
              error: (endError as Error).message,
            });
          }
        }
      } catch (error) {
        errors.push({
          storyId: story.id,
          title: story.title,
          error: (error as Error).message,
        });
      }
    }

    return {
      processed: processed.length,
      errors,
    };
  } catch (error) {
    console.error("Failed to check and process rounds:", error);
    return {
      processed: 0,
      errors: [error],
    };
  }
}

/**
 * Schedule automated round ending checks at specified intervals
 * @param intervalMinutes How often to check for rounds that can be ended (in minutes)
 * @returns A function that can be called to stop the scheduled checks
 */
export function scheduleAutomatedRoundChecks(intervalMinutes = 15): () => void {
  // Convert minutes to milliseconds
  const interval = intervalMinutes * 60 * 1000;

  // Set up interval to check rounds
  const timerId = setInterval(async () => {
    try {
      const result = await checkAndProcessRounds();
      console.log(`Automated round check completed:`, result);
    } catch (error) {
      console.error("Error in automated round check:", error);
    }
  }, interval);

  // Return function to clear the interval
  return () => clearInterval(timerId);
}
