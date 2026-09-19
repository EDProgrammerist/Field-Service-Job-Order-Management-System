import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ArrowRight,
  MessageCircle,
  RefreshCw,
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
import type { Conversation } from "@/types/conversation";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ConversationInbox() {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [collection, setCollection] =
    useState<PaginatedCollection<Conversation> | null>(
      null,
    );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(
    async (pageToLoad: number) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getConversations({
          page: pageToLoad,
          per_page: PAGE_SIZE,
        });

        setCollection(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load your conversations.",
        );

        setErrorMessage(details.message);
        setCollection(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadConversations, page]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Private messages
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Conversations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Messages between a customer and the technician
            selected for each service request.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => void loadConversations(page)}
        >
          <RefreshCw aria-hidden={true} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Inbox</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadConversations(page)
                }
              >
                <RefreshCw aria-hidden={true} />
                Try again
              </Button>
            </div>
          ) : null}

          {!errorMessage && isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton
                  className="h-32 w-full"
                  key={index}
                />
              ))}
            </div>
          ) : null}

          {!errorMessage &&
          !isLoading &&
          collection?.data.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="size-10 text-muted-foreground" />
              <h2 className="mt-4 font-semibold">
                No conversations yet
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Conversations for your service requests will
                appear here.
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

                return (
                  <article
                    className="flex flex-col justify-between gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-center"
                    key={conversation.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {
                            conversation.job_order
                              .job_order_number
                          }
                        </p>

                        <JobOrderStatusBadge
                          status={
                            conversation.job_order.status
                          }
                        />

                        {conversation.unread_messages_count >
                        0 ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {
                              conversation.unread_messages_count
                            }{" "}
                            unread
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-2 truncate font-semibold">
                        {conversation.job_order.title}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        With {otherParticipant}
                      </p>

                      {conversation.latest_message ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {
                            conversation.latest_message.sender
                              .name
                          }
                          : {conversation.latest_message.body}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No messages yet.
                        </p>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated{" "}
                        {formatDate(
                          conversation.updated_at,
                        )}
                      </p>
                    </div>

                    <Button
                      render={
                        <Link
                          to={`/conversations/job-orders/${conversation.job_order_id}`}
                        />
                      }
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
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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

                        if (
                          collection.current_page > 1
                        ) {
                          setPage(
                            collection.current_page - 1,
                          );
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
                          setPage(
                            collection.current_page + 1,
                          );
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