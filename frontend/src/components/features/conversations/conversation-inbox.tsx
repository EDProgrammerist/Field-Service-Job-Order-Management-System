import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { JobOrderStatusBadge } from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getConversations } from "@/services/conversations";
import type {
  Conversation,
  ConversationMessagingState,
  ConversationScope,
} from "@/types/conversation";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

const messagingStateLabels: Record<
  ConversationMessagingState,
  string
> = {
  active: "Active",
  paused: "Paused",
  finished: "Finished",
  read_only: "Read-only",
};

const messagingStateDescriptions: Record<
  ConversationMessagingState,
  string
> = {
  active: "Messaging is available.",
  paused: "Messaging resumes after the dispatcher reschedules.",
  finished: "Past messages remain available to read.",
  read_only: "This legacy conversation is available to read.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ConversationInbox() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const scope: ConversationScope =
    searchParams.get("scope") === "all" ? "all" : "active";

  const [page, setPage] = useState(1);
  const [collection, setCollection] =
    useState<PaginatedCollection<Conversation> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const latestRequestId = useRef(0);

  const loadConversations = useCallback(
    async (pageToLoad: number, scopeToLoad: ConversationScope) => {
      const requestId = ++latestRequestId.current;

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getConversations({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          scope: scopeToLoad,
        });

        if (requestId === latestRequestId.current) {
          setCollection(response.data);
        }
      } catch (error) {
        if (requestId === latestRequestId.current) {
          const details = getApiErrorDetails(
            error,
            "Unable to load your conversations.",
          );

          setErrorMessage(details.message);
          setCollection(null);
        }
      } finally {
        if (requestId === latestRequestId.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations(page, scope);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      latestRequestId.current += 1;
    };
  }, [loadConversations, page, scope]);

  function changeScope(nextScope: ConversationScope) {
    if (nextScope === scope) {
      return;
    }

    setPage(1);
    setSearchParams(
      nextScope === "all" ? { scope: "all" } : {},
    );
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Conversations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Private messages between a customer and the technician
            selected for each request.
          </p>
        </div>

        <Button
          disabled={isLoading}
          onClick={() => void loadConversations(page, scope)}
          type="button"
          variant="outline"
        >
          <RefreshCw aria-hidden={true} />
          Refresh
        </Button>
      </header>

      <div
        aria-label="Conversation view"
        className="flex flex-wrap gap-2"
      >
        <Button
          aria-pressed={scope === "active"}
          onClick={() => changeScope("active")}
          type="button"
          variant={scope === "active" ? "default" : "outline"}
        >
          Active inbox
        </Button>

        <Button
          aria-pressed={scope === "all"}
          onClick={() => changeScope("all")}
          type="button"
          variant={scope === "all" ? "default" : "outline"}
        >
          All &amp; history
        </Button>
      </div>

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="gap-1 rounded-none border-b p-5">
          <CardTitle>
            {scope === "active"
              ? "Active inbox"
              : "All conversations"}
          </CardTitle>
          <CardDescription>
            {scope === "active"
              ? "Conversations where messaging is currently available."
              : "Active, paused, finished, and read-only conversations you can access."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-5 text-center">
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>

              <Button
                onClick={() =>
                  void loadConversations(page, scope)
                }
                type="button"
                variant="outline"
              >
                <RefreshCw aria-hidden={true} />
                Try again
              </Button>
            </div>
          ) : null}

          {!errorMessage && isLoading ? (
            <div
              aria-label="Loading conversations"
              role="status"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  className="space-y-3 border-b p-5 last:border-b-0"
                  key={index}
                >
                  <Skeleton className="h-4 w-32 rounded-none" />
                  <Skeleton className="h-5 w-2/3 rounded-none" />
                  <Skeleton className="h-4 w-full max-w-lg rounded-none" />
                </div>
              ))}
            </div>
          ) : null}

          {!errorMessage &&
          !isLoading &&
          collection?.data.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-5 text-center">
              <MessageCircle
                aria-hidden={true}
                className="size-8 text-muted-foreground"
              />
              <h2 className="mt-3 font-medium">
                {scope === "active"
                  ? "No active conversations"
                  : "No conversations yet"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {scope === "active"
                  ? "Check All & history for paused or finished conversations."
                  : "Conversations for your service requests will appear here."}
              </p>
            </div>
          ) : null}

          {!errorMessage && !isLoading
            ? collection?.data.map((conversation) => {
                const otherParticipant =
                  user?.role === "customer"
                    ? conversation.job_order
                        .selected_technician.name
                    : conversation.job_order.customer.name;

                const threadHref =
                  `/conversations/job-orders/${conversation.job_order_id}` +
                  (scope === "all" ? "?scope=all" : "");

                return (
                  <article
                    className="flex flex-col gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    key={conversation.id}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs text-muted-foreground">
                          {conversation.job_order.job_order_number}
                        </p>

                        <JobOrderStatusBadge
                          status={conversation.job_order.status}
                        />

                        <span className="border px-2 py-0.5 text-xs font-medium">
                          {
                            messagingStateLabels[
                              conversation.messaging_state
                            ]
                          }
                        </span>

                        {conversation.unread_messages_count > 0 ? (
                          <span className="bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {conversation.unread_messages_count} unread
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-2 font-medium">
                        {conversation.job_order.title}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        With {otherParticipant}
                      </p>

                      {conversation.messaging_state !== "active" ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            messagingStateDescriptions[
                              conversation.messaging_state
                            ]
                          }
                        </p>
                      ) : null}

                      {conversation.latest_message ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {conversation.latest_message.sender.name}:{" "}
                          {conversation.latest_message.body}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No messages yet.
                        </p>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated{" "}
                        {formatDate(conversation.updated_at)}
                      </p>
                    </div>

                    <Button
                      render={<Link to={threadHref} />}
                      size="sm"
                      variant="outline"
                    >
                      Open
                      <ArrowRight aria-hidden={true} />
                    </Button>
                  </article>
                );
              })
            : null}
        </CardContent>

        {collection && !isLoading && !errorMessage ? (
          <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {collection.total} conversation
              {collection.total === 1 ? "" : "s"} · Page{" "}
              {collection.current_page} of{" "}
              {collection.last_page}
            </p>

            {collection.last_page > 1 ? (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={
                        collection.current_page === 1
                      }
                      className={
                        collection.current_page === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (collection.current_page > 1) {
                          setPage(collection.current_page - 1);
                        }
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={
                        collection.current_page ===
                        collection.last_page
                      }
                      className={
                        collection.current_page ===
                        collection.last_page
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (
                          collection.current_page <
                          collection.last_page
                        ) {
                          setPage(collection.current_page + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        ) : null}
      </Card>
    </section>
  );
}