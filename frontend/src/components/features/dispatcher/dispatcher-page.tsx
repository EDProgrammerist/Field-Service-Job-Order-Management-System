import type { ReactNode } from "react";
import {
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

interface DispatcherSurfaceProps {
  children: ReactNode;
  hideFeatureHeader?: boolean;
}

interface DispatcherPageProps extends DispatcherSurfaceProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref?: string;
  action?: ReactNode;
}

export function DispatcherSurface({
  children,
  hideFeatureHeader = false,
}: DispatcherSurfaceProps) {
  return (
    <div
      className={cn(
        "dispatcher-page animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none",
        hideFeatureHeader &&
          "dispatcher-page--hide-feature-header",
      )}
    >
      {children}
    </div>
  );
}

export function DispatcherPage({
  title,
  description,
  icon: Icon,
  backHref,
  action,
  children,
  hideFeatureHeader = false,
}: DispatcherPageProps) {
  return (
    <DispatcherSurface hideFeatureHeader={hideFeatureHeader}>
      <section className="mb-4 flex flex-col gap-4 border bg-background p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <Icon
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {backHref || action ? (
          <div className="flex flex-wrap items-center gap-2">
            {backHref ? (
              <Button
                render={<Link to={backHref} />}
                variant="outline"
              >
                <ArrowLeft aria-hidden={true} />
                Back to job orders
              </Button>
            ) : null}

            {action}
          </div>
        ) : null}
      </section>

      <div className="dispatcher-page-body">
        {children}
      </div>
    </DispatcherSurface>
  );
}