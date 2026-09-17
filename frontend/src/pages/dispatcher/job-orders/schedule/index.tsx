import { CalendarClock } from "lucide-react";
import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { DispatcherScheduleForm } from "@/components/features/dispatcher/dispatcher-schedule-form";

export default function DispatcherScheduleJobOrderPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (
    !Number.isInteger(parsedJobOrderId) ||
    parsedJobOrderId < 1
  ) {
    return null;
  }

  return (
    <DashboardShell>
      <DispatcherPage
        backHref={`/dispatcher/job-orders/${parsedJobOrderId}`}
        backLabel="Back to request"
        description="Check the selected technician's availability, then assign the official service start and end time."
        icon={CalendarClock}
        title="Official schedule"
      >
        <DispatcherScheduleForm
          jobOrderId={parsedJobOrderId}
        />
      </DispatcherPage>
    </DashboardShell>
  );
}