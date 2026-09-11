import {
  ChartNoAxesCombined,
  ClipboardList,
  FilePlus2,
  History,
  Radar,
  UserCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";

export const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export const services = [
  {
    title: "Service Request Intake",
    description:
      "Customers can submit the issue details the service team needs for review.",
    icon: Wrench,
  },
  {
    title: "Job Order Coordination",
    description:
      "Approved requests become organized job orders with the work details kept together.",
    icon: ClipboardList,
  },
  {
    title: "Technician Assignment",
    description:
      "Dispatchers can assign the right technician and keep responsibility visible.",
    icon: UserRoundCheck,
  },
  {
    title: "Status History",
    description:
      "Customers and staff can follow recorded updates as work moves toward completion.",
    icon: ChartNoAxesCombined,
  },
];

export const workflowSteps = [
  {
    title: "Create a request",
    description: "Describe the service issue and send the required details.",
    icon: FilePlus2,
  },
  {
    title: "Review and assign",
    description: "The service team reviews the request and assigns the work.",
    icon: UserCheck,
  },
  {
    title: "Track the job",
    description: "Follow the recorded status while the technician handles the work.",
    icon: Radar,
  },
  {
    title: "Close with a record",
    description: "Completed work remains available in the job-order history.",
    icon: History,
  },
];
