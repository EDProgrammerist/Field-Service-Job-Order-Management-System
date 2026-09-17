import {
  ClipboardList,
  Plus,
} from "lucide-react";
import { Link } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { JobOrderList } from "@/components/features/job-orders/job-order-list";
import { Button } from "@/components/ui/button";

export default function DispatcherJobOrdersPage() {
  return (
    <DashboardShell>
      <DispatcherPage
        action={
          <Button
            render={<Link to="/dispatcher/job-orders/create" />}
          >
            <Plus aria-hidden={true} />
            Create job order
          </Button>
        }
        description="Review requests, assign technicians, and monitor service progress."
        hideFeatureHeader
        icon={ClipboardList}
        title="Job orders"
      >
        <JobOrderList />
      </DispatcherPage>
    </DashboardShell>
  );
}