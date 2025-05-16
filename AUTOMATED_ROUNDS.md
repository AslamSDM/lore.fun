# Automated Round Endings for LoreFunDapp

This documentation explains how the automated round endings system works in LoreFunDapp.

## Overview

The automated round endings system automatically progresses story development by:

1. Detecting when a voting round has ended based on time constraints
2. Selecting the winning submission with the most votes
3. Adding the winning submission as the next sentence in the story
4. Starting a new submission period for the next sentence

## How It Works

### Round Status Component

The `RoundStatus` component displays the current status of a voting round, including:

- Time remaining before the round ends
- The number of submissions in the current round
- A button to end the round when it's ready to be concluded

### Automated Round Ending

Rounds can be automatically ended in three ways:

1. **Client-side Automation:**

   - The application periodically checks all stories (every 15 minutes) for rounds that can be ended
   - This happens automatically while users browse the application

2. **Server-side Cron Job:**

   - An API endpoint (`/api/cron/process-rounds`) can be triggered by an external cron job service
   - This ensures rounds are processed even when no users are actively using the application

3. **Post-Voting Check:**
   - After a user casts a vote, the system checks if the round can be ended
   - If the voting period has elapsed and there are submissions, the round is automatically ended

### Round Ending Criteria

A round can be ended when:

1. The voting period has elapsed (default: 3 days from the last sentence being added)
2. There is at least one submission to choose as the winner

#### Handling Special Cases

The system intelligently handles several special scenarios:

1. **No Submissions:**

   - If a voting period ends but there are no submissions, the round will not end
   - The system will continue to wait for submissions before ending the round
   - The UI will display that submissions are needed to end the round

2. **Tied Votes:**
   - When multiple submissions have the same number of votes, the system enters a "tie-breaking" mode
   - Users are shown the tied submissions and can cast additional votes to break the tie
   - After 24 hours, if the tie remains unresolved, the earliest submitted entry wins
   - Users can also manually force the round to end, which will select the earliest submission as the winner

### Configuration

Round timing can be configured per story:

- `voting_period_days`: How many days a voting round lasts (default: 3)
- `submission_period_hours`: How many hours the submission period lasts (default: 24)

## Setting Up the Cron Job

To ensure server-side automated round processing, set up a cron job to call the API endpoint:

```
/api/cron/process-rounds
```

Secure this endpoint by setting the `CRON_API_KEY` environment variable and passing it as a header:

```
X-API-KEY: your_secure_key_here
```

Or as a query parameter:

```
/api/cron/process-rounds?api_key=your_secure_key_here
```

## Troubleshooting

If rounds are not ending automatically:

1. Check that the server time is correctly set
2. Verify that submissions exist for the current round
3. Ensure the cron job is properly configured
4. Check the browser console or server logs for any errors
