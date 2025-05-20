import { create } from "zustand";
import {
  MIN_TOKENS_TO_VOTE,
  MIN_TOKENS_TO_SUBMIT,
  MIN_TOKENS_TO_CREATE,
} from "@/hooks/use-token-balance";
import { toast } from "@/hooks/use-toast";

interface TokenRequirementsState {
  // Token requirements
  minTokensToVote: number;
  minTokensToSubmit: number;
  minTokensToCreate: number;

  // Action check methods
  checkCanVote: (balance: number, onError?: () => void) => boolean;
  checkCanSubmit: (balance: number, onError?: () => void) => boolean;
  checkCanCreate: (balance: number, onError?: () => void) => boolean;
  checkAction: (
    action: "vote" | "submit" | "create",
    balance: number,
    onError?: () => void
  ) => boolean;

  // Show insufficient token messages
  showInsufficientTokenMessage: (
    action: "vote" | "submit" | "create",
    balance: number
  ) => void;
}

export const useTokenRequirements = create<TokenRequirementsState>(
  (set, get) => ({
    minTokensToVote: MIN_TOKENS_TO_VOTE,
    minTokensToSubmit: MIN_TOKENS_TO_SUBMIT,
    minTokensToCreate: MIN_TOKENS_TO_CREATE,

    showInsufficientTokenMessage: (
      action: "vote" | "submit" | "create",
      balance: number
    ) => {
      const requiredTokens =
        action === "vote"
          ? get().minTokensToVote
          : action === "submit"
          ? get().minTokensToSubmit
          : get().minTokensToCreate;

      const actionText = {
        vote: "vote on submissions",
        submit: "submit a new sentence",
        create: "create a new story",
      }[action];

      // Add debugging information
      console.log(`Token requirement check failed for ${action}:`, {
        currentBalance: balance,
        requiredTokens,
        difference: requiredTokens - balance,
      });

      toast({
        title: "Insufficient Tokens",
        description: `You need at least ${requiredTokens} LORE tokens to ${actionText}. You currently have ${balance} LORE.`,
        variant: "destructive",
        duration: 5000,
      });
    },

    checkCanVote: (balance: number, onError?: () => void) => {
      const canVote = balance >= get().minTokensToVote;
      if (!canVote) {
        if (onError) onError();
        else get().showInsufficientTokenMessage("vote", balance);
      }
      return canVote;
    },

    checkCanSubmit: (balance: number, onError?: () => void) => {
      const canSubmit = balance >= get().minTokensToSubmit;
      if (!canSubmit) {
        if (onError) onError();
        else get().showInsufficientTokenMessage("submit", balance);
      }
      return canSubmit;
    },

    checkCanCreate: (balance: number, onError?: () => void) => {
      const canCreate = balance >= get().minTokensToCreate;
      if (!canCreate) {
        if (onError) onError();
        else get().showInsufficientTokenMessage("create", balance);
      }
      return canCreate;
    },

    checkAction: (
      action: "vote" | "submit" | "create",
      balance: number,
      onError?: () => void
    ) => {
      const requiredTokens =
        action === "vote"
          ? get().minTokensToVote
          : action === "submit"
          ? get().minTokensToSubmit
          : get().minTokensToCreate;

      const hasEnoughTokens = balance >= requiredTokens;

      // Log the token check result
      console.log(`Token requirement check for ${action}:`, {
        action,
        currentBalance: balance,
        requiredTokens,
        hasEnoughTokens,
      });

      switch (action) {
        case "vote":
          return get().checkCanVote(balance, onError);
        case "submit":
          return get().checkCanSubmit(balance, onError);
        case "create":
          return get().checkCanCreate(balance, onError);
        default:
          return false;
      }
    },
  })
);
