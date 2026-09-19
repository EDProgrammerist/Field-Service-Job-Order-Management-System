import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  RefreshCw,
  Send,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import { JobOrderStatusBadge } from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getMessagingUnavailableMessage } from "@/lib/conversation-errors";
import {
  getConversation,
  getConversationMessages,
  getJobOrderConversation,
  markConversationRead,
  sendConversationMessage,
} from "@/services/conversations";
import type {
  Conversation,
  ConversationMessage,
  ConversationMessagingState,
} from "@/types/conversation";

interface ConversationThreadProps {
  jobOrderId: number;
}

const PAGE_SIZE = 50;
const REFRESH_INTERVAL_MS = 20_000;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function mergeMessages(
  current: ConversationMessage[],
  incoming: ConversationMessage[],
) {
  const messagesById = new Map(
    current.map((message) => [message.id, message]),
  );

  for (const message of incoming) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()].sort(
    (first, second) => first.id - second.id,
  );
}

function getMessagingStatus(
  state: ConversationMessagingState,
) {
  switch (state) {
    case "paused":
      return {
        title: "Messaging paused",
        description:
          "The technician rejected the schedule. You can read past messages; messaging resumes in this same conversation after the dispatcher reschedules.",
      };
    case "finished":
      return {
        title: "Messaging finished",
        description:
          "This request is finished. You can read past messages, but new messages cannot be sent.",
      };
    case "read_only":
      return {
        title: "Read-only conversation",
        description:
          "This legacy conversation is available for viewing, but new messages cannot be sent.",
      };
    case "active":
      return {
        title: "Messaging unavailable",
        description:
          "Messaging is currently unavailable for this request.",
      };
  }
}

export function ConversationThread({
  jobOrderId,
}: ConversationThreadProps) {
  const { user } = useAuth();
  const { search } = useLocation();
  const backToHistory =
    new URLSearchParams(search).get("scope") === "all";

  const [conversation, setConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<
    ConversationMessage[]
  >([]);
  const [nextPage, setNextPage] = useState<number | null>(
    null,
  );
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [conflictMessage, setConflictMessage] =
    useState("");
  const [isConflictLocked, setIsConflictLocked] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] =
    useState(false);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [isSending, setIsSending] = useState(false);

  const refreshInFlight = useRef(false);
  const availabilityRevision = useRef(0);

  const loadThread = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setActionError("");

    try {
      const conversationResponse =
        await getJobOrderConversation(jobOrderId);
      const currentConversation =
        conversationResponse.data;

      const messagesResponse =
        await getConversationMessages(
          currentConversation.id,
          {
            page: 1,
            per_page: PAGE_SIZE,
          },
        );

      setConversation(currentConversation);
      setMessages(
        [...messagesResponse.data.data].reverse(),
      );
      setNextPage(
        messagesResponse.data.current_page <
          messagesResponse.data.last_page
          ? 2
          : null,
      );
      setConflictMessage("");
      setIsConflictLocked(false);

      try {
        await markConversationRead(
          currentConversation.id,
        );

        setConversation((current) =>
          current
            ? {
                ...current,
                unread_messages_count: 0,
              }
            : current,
        );
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Messages loaded, but they could not be marked as read.",
        );

        setActionError(details.message);
      }
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load this conversation.",
      );

      setLoadError(details.message);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadThread();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadThread]);

  const refreshThread = useCallback(
    async (conversationId: number, silent = false) => {
      if (refreshInFlight.current) {
        return;
      }

      refreshInFlight.current = true;

      if (!silent) {
        setIsRefreshing(true);
        setActionError("");
      }

      const revisionAtStart =
        availabilityRevision.current;

      try {
        const conversationResponse =
          await getConversation(conversationId);

        if (
          revisionAtStart ===
          availabilityRevision.current
        ) {
          setConversation(conversationResponse.data);
          setConflictMessage("");
          setIsConflictLocked(false);
        }

        const messagesResponse =
          await getConversationMessages(
            conversationId,
            {
              page: 1,
              per_page: PAGE_SIZE,
            },
          );

        setMessages((current) =>
          mergeMessages(
            current,
            messagesResponse.data.data,
          ),
        );

        try {
          await markConversationRead(conversationId);

          setConversation((current) =>
            current?.id === conversationId
              ? {
                  ...current,
                  unread_messages_count: 0,
                }
              : current,
          );
        } catch (error) {
          if (!silent) {
            const details = getApiErrorDetails(
              error,
              "Messages refreshed, but they could not be marked as read.",
            );

            setActionError(details.message);
          }
        }
      } catch (error) {
        if (!silent) {
          const details = getApiErrorDetails(
            error,
            "Unable to refresh this conversation.",
          );

          setActionError(details.message);
        }
      } finally {
        refreshInFlight.current = false;

        if (!silent) {
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!conversation?.id || isLoading) {
      return;
    }

    const conversationId = conversation.id;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshThread(conversationId, true);
      }
    };

    const intervalId = window.setInterval(
      refreshWhenVisible,
      REFRESH_INTERVAL_MS,
    );

    window.addEventListener(
      "focus",
      refreshWhenVisible,
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        refreshWhenVisible,
      );
    };
  }, [conversation?.id, isLoading, refreshThread]);

  async function handleLoadOlder() {
    if (!conversation || nextPage === null) {
      return;
    }

    setIsLoadingOlder(true);
    setActionError("");

    try {
      const response = await getConversationMessages(
        conversation.id,
        {
          page: nextPage,
          per_page: PAGE_SIZE,
        },
      );

      setMessages((current) =>
        mergeMessages(
          current,
          response.data.data,
        ),
      );

      setNextPage(
        response.data.current_page <
          response.data.last_page
          ? response.data.current_page + 1
          : null,
      );
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load older messages.",
      );

      setActionError(details.message);
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function handleSend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !conversation ||
      !conversation.can_send_messages ||
      isConflictLocked
    ) {
      return;
    }

    const messageBody = body.trim();

    if (!messageBody) {
      setActionError("Please enter a message.");
      return;
    }

    if (messageBody.length > 5000) {
      setActionError(
        "Messages cannot exceed 5,000 characters.",
      );
      return;
    }

    setIsSending(true);
    setActionError("");

    try {
      const response = await sendConversationMessage(
        conversation.id,
        messageBody,
      );

      setMessages((current) =>
        mergeMessages(current, [response.data]),
      );
      setBody("");
    } catch (error) {
      const unavailableMessage =
        getMessagingUnavailableMessage(error);

      if (unavailableMessage) {
        availabilityRevision.current += 1;
        const conflictRevision =
          availabilityRevision.current;

        setConflictMessage(unavailableMessage);
        setIsConflictLocked(true);
        setConversation((current) =>
          current
            ? {
                ...current,
                can_send_messages: false,
              }
            : current,
        );

        try {
          const updatedConversation =
            await getConversation(conversation.id);

          if (
            conflictRevision ===
            availabilityRevision.current
          ) {
            setConversation(
              updatedConversation.data,
            );
            setConflictMessage("");
            setIsConflictLocked(false);
          }
        } catch {
          // Keep sending disabled and preserve the draft until
          // a later refresh can confirm the current state.
        }
      } else {
        const details = getApiErrorDetails(
          error,
          "Unable to send your message.",
        );

        setActionError(
          details.fieldErrors.body ??
            details.message,
        );
      }
    } finally {
      setIsSending(false);
    }
  }

    if (isLoading) {
    return (
      <section
        aria-label="Loading conversation"
        className="mx-auto max-w-5xl space-y-4"
        role="status"
      >
        <Skeleton className="h-9 w-44 rounded-none" />
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-96 w-full rounded-none" />
      </section>
    );
  }

  if (loadError || !conversation) {
    return (
      <div className="mx-auto flex min-h-72 max-w-xl flex-col items-center justify-center gap-4 border p-5 text-center">
        <p
          className="max-w-md text-sm text-destructive"
          role="alert"
        >
          {loadError || "Conversation not found."}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => void loadThread()}
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>

          <Button
            render={<Link to="/conversations" />}
            variant="outline"
          >
            <ArrowLeft aria-hidden={true} />
            Back to conversations
          </Button>
        </div>
      </div>
    );
  }

  const otherParticipant =
    user?.role === "customer"
      ? conversation.job_order.selected_technician.name
      : conversation.job_order.customer.name;

  const requestHref =
    user?.role === "customer"
      ? `/customer/service-requests/${jobOrderId}`
      : `/technician/my-jobs/${jobOrderId}`;

  const canSendMessages =
    conversation.can_send_messages && !isConflictLocked;
  const messagingStatus = getMessagingStatus(
    conversation.messaging_state,
  );

  return (
    <section className="mx-auto max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <Button
        render={
          <Link
            to={
              backToHistory
                ? "/conversations?scope=all"
                : "/conversations"
            }
          />
        }
        size="sm"
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to conversations
      </Button>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs text-muted-foreground">
              {conversation.job_order.job_order_number}
            </p>

            <JobOrderStatusBadge
              status={conversation.job_order.status}
            />
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {conversation.job_order.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Private conversation with {otherParticipant}
          </p>
        </div>

        <Button
          render={<Link to={requestHref} />}
          size="sm"
          variant="outline"
        >
          View request
        </Button>
      </header>

      {!canSendMessages ? (
        <div
          className="border bg-muted/30 px-4 py-3 text-sm"
          id="conversation-availability"
          role="status"
        >
          <p className="font-medium">
            {messagingStatus.title}
          </p>
          <p className="mt-1 text-muted-foreground">
            {conflictMessage || messagingStatus.description}
          </p>
        </div>
      ) : null}

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="flex flex-col gap-3 rounded-none border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Messages</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages and availability update while this page is open.
              Refresh to check now.
            </p>
          </div>

          <Button
            disabled={isRefreshing}
            onClick={() =>
              void refreshThread(conversation.id)
            }
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          {actionError ? (
            <p
              className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}

          {nextPage !== null ? (
            <div className="text-center">
              <Button
                disabled={isLoadingOlder}
                onClick={() => void handleLoadOlder()}
                type="button"
                variant="outline"
              >
                {isLoadingOlder
                  ? "Loading..."
                  : "Load older messages"}
              </Button>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="border border-dashed p-8 text-center">
              <p className="font-medium">No messages yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {canSendMessages
                  ? "Start the conversation below."
                  : "There are no past messages to display."}
              </p>
            </div>
          ) : (
            <ol className="space-y-4">
              {messages.map((message) => (
                <li
                  className={
                    message.is_mine
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                  key={message.id}
                >
                  <div
                    className={
                      message.is_mine
                        ? "max-w-[90%] rounded-lg bg-primary p-3 text-primary-foreground sm:max-w-[75%]"
                        : "max-w-[90%] rounded-lg border bg-muted/30 p-3 sm:max-w-[75%]"
                    }
                  >
                    <p className="text-xs font-medium">
                      {message.sender.name}
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                      {message.body}
                    </p>

                    <p className="mt-2 text-xs opacity-75">
                      {formatDate(message.created_at)}
                      {message.is_mine
                        ? message.is_read
                          ? " · Read"
                          : " · Sent"
                        : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>

        <div className="border-t p-5">
          <form className="space-y-4" onSubmit={handleSend}>
            <div className="space-y-2">
              <Label htmlFor="conversation-message">
                Message
              </Label>

              <Textarea
                id="conversation-message"
                value={body}
                maxLength={5000}
                rows={4}
                readOnly={!canSendMessages}
                disabled={isSending}
                aria-describedby={
                  !canSendMessages
                    ? "conversation-availability"
                    : undefined
                }
                placeholder={
                  canSendMessages
                    ? "Write your message..."
                    : "Messaging is unavailable."
                }
                onChange={(event) =>
                  setBody(event.target.value)
                }
              />

              <p className="text-right text-xs text-muted-foreground">
                {body.length}/5000
              </p>
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={isSending || !canSendMessages}
              type="submit"
            >
              <Send aria-hidden={true} />
              {isSending ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}