import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  RefreshCw,
  Send,
} from "lucide-react";
import { Link } from "react-router";

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
import {
  getConversationMessages,
  getJobOrderConversation,
  markConversationRead,
  sendConversationMessage,
} from "@/services/conversations";
import type {
  Conversation,
  ConversationMessage,
} from "@/types/conversation";

interface ConversationThreadProps {
  jobOrderId: number;
}

const PAGE_SIZE = 50;

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
    current.map((message) => [
      message.id,
      message,
    ]),
  );

  for (const message of incoming) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()].sort(
    (first, second) => first.id - second.id,
  );
}

export function ConversationThread({
  jobOrderId,
}: ConversationThreadProps) {
  const { user } = useAuth();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<
    ConversationMessage[]
  >([]);
  const [nextPage, setNextPage] = useState<
    number | null
  >(null);
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] =
    useState(false);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [isSending, setIsSending] = useState(false);

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

      try {
        await markConversationRead(
          currentConversation.id,
        );

        setConversation({
          ...currentConversation,
          unread_messages_count: 0,
        });
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

  async function handleRefresh() {
    if (!conversation) {
      return;
    }

    setIsRefreshing(true);
    setActionError("");

    try {
      const response = await getConversationMessages(
        conversation.id,
        {
          page: 1,
          per_page: PAGE_SIZE,
        },
      );

      setMessages((current) =>
        mergeMessages(
          current,
          response.data.data,
        ),
      );

      await markConversationRead(conversation.id);

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
        "Unable to refresh this conversation.",
      );

      setActionError(details.message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!conversation) {
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
      const details = getApiErrorDetails(
        error,
        "Unable to send your message.",
      );

      setActionError(
        details.fieldErrors.body ??
          details.message,
      );
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (loadError || !conversation) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
        <p
          className="max-w-md text-sm text-destructive"
          role="alert"
        >
          {loadError || "Conversation not found."}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadThread()}
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
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

  return (
    <section className="space-y-6">
      <Button
        render={<Link to="/conversations" />}
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to conversations
      </Button>

      <div className="flex flex-col justify-between gap-4 border bg-background p-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {
                conversation.job_order
                  .job_order_number
              }
            </p>

            <JobOrderStatusBadge
              status={conversation.job_order.status}
            />
          </div>

          <h1 className="mt-2 text-2xl font-semibold">
            {conversation.job_order.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Private conversation with {otherParticipant}
          </p>
        </div>

        <Button
          render={<Link to={requestHref} />}
          variant="outline"
        >
          View request
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Messages</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Press Refresh to check for new replies.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isRefreshing}
            onClick={() => void handleRefresh()}
          >
            <RefreshCw aria-hidden={true} />
            {isRefreshing
              ? "Refreshing..."
              : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-5 py-5">
          {actionError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}

          {nextPage !== null ? (
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                disabled={isLoadingOlder}
                onClick={() => void handleLoadOlder()}
              >
                {isLoadingOlder
                  ? "Loading..."
                  : "Load older messages"}
              </Button>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">
                No messages yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the conversation below.
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send a message</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSend}
          >
            <div className="space-y-2">
              <Label htmlFor="conversation-message">
                Message
              </Label>

              <Textarea
                id="conversation-message"
                value={body}
                maxLength={5000}
                rows={4}
                disabled={isSending}
                placeholder="Write your message..."
                onChange={(event) =>
                  setBody(event.target.value)
                }
              />

              <p className="text-right text-xs text-muted-foreground">
                {body.length}/5000
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSending}
            >
              <Send aria-hidden={true} />
              {isSending
                ? "Sending..."
                : "Send message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}