import axios from "axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function getMessagingUnavailableMessage(
  error: unknown,
): string | null {
  if (
    !axios.isAxiosError(error) ||
    error.response?.status !== 409
  ) {
    return null;
  }

  const data: unknown = error.response.data;

  if (
    !isRecord(data) ||
    data.code !== "MESSAGING_UNAVAILABLE"
  ) {
    return null;
  }

  return typeof data.message === "string" &&
    data.message.trim().length > 0
    ? data.message
    : "Messaging is unavailable for this request.";
}