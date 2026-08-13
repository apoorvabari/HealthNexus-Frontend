export const AdminTheme = {
  // Primary brand
  primary: "#7C3AED",          // Deep violet
  primaryLight: "#A78BFA",
  primaryDark: "#5B21B6",
  primaryBg: "#F5F3FF",

  // Secondary accents
  success: "#10B981",          // Approve / Active
  successBg: "#D1FAE5",
  warning: "#F59E0B",          // Pending
  warningBg: "#FEF3C7",
  danger: "#EF4444",           // Reject / Block
  dangerBg: "#FEE2E2",
  info: "#3B82F6",             // Info / Links
  infoBg: "#DBEAFE",

  // Neutrals
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  border: "#E2E8F0",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  // Status colors (very useful for badges)
  status: {
    PENDING: { bg: "#FEF3C7", text: "#B45309" },
    APPROVED: { bg: "#D1FAE5", text: "#047857" },
    REJECTED: { bg: "#FEE2E2", text: "#B91C1C" },
    BLOCKED: { bg: "#F1F5F9", text: "#475569" },
  },
};

export const getStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "ACTIVE":
      return AdminTheme.status.APPROVED;
    case "PENDING":
    case "INACTIVE":
      return AdminTheme.status.PENDING;
    case "REJECTED":
    case "SUSPENDED":
      return AdminTheme.status.REJECTED;
    case "BLOCKED":
      return AdminTheme.status.BLOCKED;
    default:
      return AdminTheme.status.BLOCKED;
  }
};
