import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

type NotificationType = "success" | "error" | "warning" | "info";

interface ToastConfig {
  title?: string;
  description: string;
  type: NotificationType;
  duration?: number; // in milliseconds
}

export function useNotifications() {
  const { toast } = useToast();
  const [pendingToasts, setPendingToasts] = useState<ToastConfig[]>([]);

  // Process and display toast notifications
  useEffect(() => {
    if (pendingToasts.length > 0) {
      const [currentToast, ...remaining] = pendingToasts;

      toast({
        title: currentToast.title,
        description: currentToast.description,
        variant: currentToast.type === "error" ? "destructive" : "default",
        duration: currentToast.duration || 5000,
      });

      setPendingToasts(remaining);
    }
  }, [pendingToasts, toast]);

  const showNotification = (config: ToastConfig) => {
    setPendingToasts((prev) => [...prev, config]);
  };

  const notifySuccess = (
    message: string,
    title?: string,
    duration?: number
  ) => {
    showNotification({
      title: title || "Success",
      description: message,
      type: "success",
      duration,
    });
  };

  const notifyError = (message: string, title?: string, duration?: number) => {
    showNotification({
      title: title || "Error",
      description: message,
      type: "error",
      duration,
    });
  };

  const notifyWarning = (
    message: string,
    title?: string,
    duration?: number
  ) => {
    showNotification({
      title: title || "Warning",
      description: message,
      type: "warning",
      duration,
    });
  };

  const notifyInfo = (message: string, title?: string, duration?: number) => {
    showNotification({
      title: title || "Information",
      description: message,
      type: "info",
      duration,
    });
  };

  const notifyInsufficientTokens = (
    action: "vote" | "submit" | "create",
    required: number
  ) => {
    const actionText = {
      vote: "vote on submissions",
      submit: "submit a new sentence",
      create: "create a new story",
    };

    notifyWarning(
      `You need at least ${required} LORE tokens to ${actionText[action]}.`,
      "Insufficient Tokens"
    );
  };

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyInsufficientTokens,
  };
}
