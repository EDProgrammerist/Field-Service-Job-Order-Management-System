import { Component, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  handleReturnToApp = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:px-6">
          <section className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert aria-hidden="true" className="size-6" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              An unexpected error prevented this page from loading. Return to
              the application and try again.
            </p>

            <Button
              className="mt-6 w-full"
              type="button"
              onClick={this.handleReturnToApp}
            >
              Return to application
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}