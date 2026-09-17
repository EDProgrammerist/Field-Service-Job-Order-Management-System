import { Badge } from "@/components/ui/badge";
import type {
  JobOrderPriority,
  JobOrderStatus,
} from "@/types/job-order";

interface JobOrderStatusBadgeProps {
  status: JobOrderStatus;
}

interface JobOrderPriorityBadgeProps {
  priority: JobOrderPriority;
}

const statusLabels: Record<JobOrderStatus, string> = {
  pending_schedule: "Pending schedule",
  pending_technician_response: "Awaiting technician",
  accepted: "Accepted",
  technician_rejected: "Schedule rejected",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
  cancelled: "Cancelled",

  pending_review: "Pending review",
  created: "Created",
  assigned: "Assigned",
};

const priorityLabels: Record<JobOrderPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

function statusVariant(status: JobOrderStatus) {
  if (
    status === "pending_schedule" ||
    status === "pending_review"
  ) {
    return "outline";
  }

  if (
    status === "pending_technician_response" ||
    status === "completed" ||
    status === "closed"
  ) {
    return "secondary";
  }

  if (
    status === "technician_rejected" ||
    status === "cancelled"
  ) {
    return "destructive";
  }

  return "default";
}

function priorityVariant(priority: JobOrderPriority) {
  if (priority === "urgent") {
    return "destructive";
  }

  if (priority === "high") {
    return "default";
  }

  return "secondary";
}

export function JobOrderStatusBadge({
  status,
}: JobOrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariant(status)}>
      {statusLabels[status]}
    </Badge>
  );
}

export function JobOrderPriorityBadge({
  priority,
}: JobOrderPriorityBadgeProps) {
  return (
    <Badge variant={priorityVariant(priority)}>
      {priorityLabels[priority]}
    </Badge>
  );
}