import {
  ChartNoAxesCombined,
  ClipboardList,
  FilePlus2,
  History,
  MapPinCheck,
  RadioTower,
  UserCheck,
  UserRoundCheck,
} from "lucide-react";

export const navigationItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export const services = [
  {
    title: "Job Order Management",
    description:
      "Create, assign, and track each job order in one connected record.",
    icon: ClipboardList,
  },
  {
    title: "Technician Management",
    description:
      "Keep technician assignments and responsibility visible to the service team.",
    icon: UserRoundCheck,
  },
  {
    title: "Real-Time Tracking",
    description:
      "Follow recorded job progress and status updates throughout the work.",
    icon: RadioTower,
  },
  {
    title: "Records & History",
    description:
      "Review completed work and the status history connected to each job.",
    icon: ChartNoAxesCombined,
  },
];

export const workflowSteps = [
  {
    title: "Create Job Order",
    description: "Log a new service request with the details the team needs.",
    icon: FilePlus2,
  },
  {
    title: "Assign & Schedule",
    description: "Review the request and assign it to the right technician.",
    icon: UserCheck,
  },
  {
    title: "Track in Real-Time",
    description: "Monitor progress through each recorded service status.",
    icon: MapPinCheck,
  },
  {
    title: "Complete & Report",
    description: "Close the job and keep its completed record available.",
    icon: History,
  },
];
