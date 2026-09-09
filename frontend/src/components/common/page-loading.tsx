interface PageLoadingProps {
  label?: string;
}

export function PageLoading({
  label = "Loading your account...",
}: PageLoadingProps) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-muted/40 px-4"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
        />
        <span>{label}</span>
      </div>
    </main>
  );
}