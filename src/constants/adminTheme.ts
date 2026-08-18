export const AdminTheme = {
  // Primary brand (Deep Medical Teal / Sapphire)
  primary: "#0F766E",          // Teal 700
  primaryLight: "#2DD4BF",     // Teal 400
  primaryDark: "#115E59",      // Teal 800
  primaryBg: "#F0FDFA",        // Teal 50

  // Secondary accents
  success: "#059669",          // Emerald 600
  successBg: "#D1FAE5",        // Emerald 100
  warning: "#D97706",          // Amber 600
  warningBg: "#FEF3C7",        // Amber 100
  danger: "#DC2626",           // Red 600
  dangerBg: "#FEE2E2",         // Red 100
  info: "#2563EB",             // Blue 600
  infoBg: "#DBEAFE",           // Blue 100

  // Neutrals
  background: "#F8FAFC",       // Slate 50
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",       // Slate 100
  border: "#E2E8F0",           // Slate 200
  textPrimary: "#0F172A",      // Slate 900
  textSecondary: "#475569",    // Slate 600
  textMuted: "#94A3B8",        // Slate 400

  // Standardized Design Tokens
  shadows: {
    soft: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    }
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  },

  // Status colors (pill badges)
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
      return AdminTheme.status.PENDING;
    case "REJECTED":
    case "DELETED":
      return AdminTheme.status.REJECTED;
    case "SUSPENDED":
    case "INACTIVE":
    case "BLOCKED":
      return AdminTheme.status.BLOCKED;
    default:
      return AdminTheme.status.BLOCKED;
  }
};
