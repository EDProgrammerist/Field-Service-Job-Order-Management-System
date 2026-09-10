import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
}

function formatRole(role: string) {
  return `${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

export function UserMenu() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
      setIsOpen(true);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        render={
          <Button
            className="h-auto gap-2 px-2 py-1.5"
            variant="ghost"
          />
        }
      >
        <Avatar>
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <span className="hidden text-left sm:grid">
          <span className="max-w-36 truncate text-sm font-medium">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRole(user.role)}
          </span>
        </span>

        <ChevronDown aria-hidden="true" className="hidden size-4 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate font-medium">{user.name}</p>
            <p className="mt-1 truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {logoutError ? (
          <>
            <p className="px-2 py-1.5 text-xs text-destructive" role="alert">
              {logoutError}
            </p>
            <DropdownMenuSeparator />
          </>
        ) : null}

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={handleLogout}
          variant="destructive"
        >
          <LogOut aria-hidden="true" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}