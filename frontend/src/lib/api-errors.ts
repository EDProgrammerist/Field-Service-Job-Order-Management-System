import axios from "axios";

export interface ApiErrorDetails {
  message: string;
  fieldErrors: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiErrorDetails(
  error: unknown,
  fallbackMessage: string,
): ApiErrorDetails {
  if (!axios.isAxiosError(error) || !isRecord(error.response?.data)) {
    return {
      message: fallbackMessage,
      fieldErrors: {},
    };
  }

  const data = error.response.data;
  const fieldErrors: Record<string, string> = {};

  if (isRecord(data.errors)) {
    for (const [field, messages] of Object.entries(data.errors)) {
      if (Array.isArray(messages)) {
        const text = messages.filter(
          (message): message is string => typeof message === "string",
        );

        if (text.length > 0) {
          fieldErrors[field] = text.join(" ");
        }
      }
    }
  }

  const message =
    typeof data.message === "string" ? data.message : fallbackMessage;

  return {
    message,
    fieldErrors,
  };
}