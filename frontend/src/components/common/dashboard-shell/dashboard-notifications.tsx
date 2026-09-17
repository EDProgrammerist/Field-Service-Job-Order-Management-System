import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import type { DashboardNotification } from "@/components/common/dashboard-shell/dashboard-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardNotificationsProps {
  label: string;
  notifications: DashboardNotification[];
}

export function DashboardNotifications({
  label,
  notifications: initialNotifications,
}: DashboardNotificationsProps) {
  const [notifications, setNotifications] = useState(() =>
    initialNotifications.map((notification) => ({
      ...notification,
    })),
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  function markNotificationAsRead(notificationId: number) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  function markAllNotificationsAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Open notifications. ${unreadCount} unread.`}
        render={
          <Button
            className="relative rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
            size="icon-lg"
            variant="ghost"
          />
        }
      >
        <Bell
          aria-hidden="true"
          className="transition-transform duration-200 group-hover/button:-rotate-12 motion-reduce:transform-none motion-reduce:transition-none"
        />

        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background motion-safe:animate-pulse"
          />
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))]"
      >
        <div className="flex items-center justify-between gap-3 px-2 py-1.5">
          <div>
            <DropdownMenuLabel className="p-0 text-sm text-foreground">
              {label}
            </DropdownMenuLabel>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {unreadCount === 0
                ? "You are all caught up."
                : `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }.`}
            </p>
          </div>

          {unreadCount > 0 ? (
            <Button
              onClick={markAllNotificationsAsRead}
              size="xs"
              type="button"
              variant="ghost"
            >
              <CheckCheck aria-hidden="true" />
              Mark all read
            </Button>
          ) : null}
        </div>

        <DropdownMenuSeparator />

        {notifications.map((notification) => (
          <DropdownMenuItem
            className="items-start gap-3 px-2 py-2.5"
            key={notification.id}
            onClick={() =>
              markNotificationAsRead(notification.id)
            }
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
              <notification.icon
                aria-hidden={true}
                className="size-4"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {notification.title}
                </p>

                {!notification.read ? (
                  <span
                    aria-label="Unread"
                    className="size-1.5 shrink-0 rounded-full bg-red-500"
                  />
                ) : null}
              </div>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {notification.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}