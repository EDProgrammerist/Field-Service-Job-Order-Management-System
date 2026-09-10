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
  pending_review: "Pending review",
  created: "Created",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
  cancelled: "Cancelled",
};

const priorityLabels: Record<JobOrderPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

function statusVariant(status: JobOrderStatus) {
  if (status === "pending_review") {
    return "outline";
  }

  if (status === "completed" || status === "closed") {
    return "secondary";
  }

  if (status === "cancelled") {
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
  return <Badge variant={statusVariant(status)}>{statusLabels[status]}</Badge>;
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