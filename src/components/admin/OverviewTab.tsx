import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AdminTheme } from "../../constants/adminTheme";
import { AdminDashboardStatsResponse, getDashboardStats } from "../../services/AdminService";

export default function OverviewTab() {
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.log("Error fetching stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AdminTheme.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load platform stats</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchStats}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Platform Overview</Text>
      <Text style={styles.pageSubtitle}>Monitor users, doctors, hospitals and platform activity</Text>

      {/* DOCTORS CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: AdminTheme.primaryBg }]}>
            <Ionicons name="medkit" size={24} color={AdminTheme.primary} />
          </View>
          <Text style={styles.sectionTitle}>Doctors</Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.tile, styles.tileTotal]}>
            <Text style={[styles.tileNumber, styles.textTotal]}>{stats.totalDoctors}</Text>
            <Text style={styles.tileLabel}>Total</Text>
          </View>
          <View style={[styles.tile, styles.tilePending]}>
            <Text style={[styles.tileNumber, styles.textPending]}>{stats.pendingDoctors}</Text>
            <Text style={styles.tileLabel}>Pending</Text>
          </View>
          <View style={[styles.tile, styles.tileApproved]}>
            <Text style={[styles.tileNumber, styles.textApproved]}>{stats.approvedDoctors}</Text>
            <Text style={styles.tileLabel}>Approved</Text>
          </View>
          <View style={[styles.tile, styles.tileRejected]}>
            <Text style={[styles.tileNumber, styles.textRejected]}>{stats.rejectedDoctors}</Text>
            <Text style={styles.tileLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* HOSPITALS CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: AdminTheme.infoBg }]}>
            <Ionicons name="business" size={24} color={AdminTheme.info} />
          </View>
          <Text style={styles.sectionTitle}>Hospitals</Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.tile, styles.tileTotal]}>
            <Text style={[styles.tileNumber, styles.textTotal]}>{stats.totalHospitals}</Text>
            <Text style={styles.tileLabel}>Total</Text>
          </View>
          <View style={[styles.tile, styles.tilePending]}>
            <Text style={[styles.tileNumber, styles.textPending]}>{stats.pendingHospitals}</Text>
            <Text style={styles.tileLabel}>Pending</Text>
          </View>
          <View style={[styles.tile, styles.tileApproved]}>
            <Text style={[styles.tileNumber, styles.textApproved]}>{stats.approvedHospitals}</Text>
            <Text style={styles.tileLabel}>Approved</Text>
          </View>
          <View style={[styles.tile, styles.tileRejected]}>
            <Text style={[styles.tileNumber, styles.textRejected]}>{stats.rejectedHospitals}</Text>
            <Text style={styles.tileLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* USERS CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: AdminTheme.successBg }]}>
            <Ionicons name="people" size={24} color={AdminTheme.success} />
          </View>
          <Text style={styles.sectionTitle}>Users</Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.tile, styles.tileTotal]}>
            <Text style={[styles.tileNumber, styles.textTotal]}>{stats.totalUsers}</Text>
            <Text style={styles.tileLabel}>Total</Text>
          </View>
          <View style={[styles.tile, styles.tileApproved]}>
            <Text style={[styles.tileNumber, styles.textApproved]}>{stats.activeUsers}</Text>
            <Text style={styles.tileLabel}>Active</Text>
          </View>
          <View style={[styles.tile, styles.tileRejected]}>
            <Text style={[styles.tileNumber, styles.textRejected]}>{stats.deletedUsers}</Text>
            <Text style={styles.tileLabel}>Deleted</Text>
          </View>
          <View style={styles.tileEmpty} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: AdminTheme.textSecondary, marginBottom: 24 },
  errorText: { color: AdminTheme.danger, fontWeight: "600", marginBottom: 12 },
  retryBtn: { backgroundColor: AdminTheme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryBtnText: { color: "#FFF", fontWeight: "600" },

  sectionCard: {
    backgroundColor: AdminTheme.surface,
    borderRadius: AdminTheme.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    ...AdminTheme.shadows.medium,
    width: "100%",
    borderWidth: 1,
    borderColor: AdminTheme.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  tile: {
    width: "48%", // strictly 2-column, leaves a small gap
    borderRadius: AdminTheme.borderRadius.lg,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmpty: {
    width: "48%", // empty placeholder to force 2-column alignment for Users deleted tile
  },

  tileNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AdminTheme.textSecondary,
    textAlign: "center",
  },

  // Color specific styles
  tileTotal: { backgroundColor: AdminTheme.surfaceAlt },
  textTotal: { color: AdminTheme.textPrimary },

  tilePending: { backgroundColor: AdminTheme.status.PENDING.bg },
  textPending: { color: AdminTheme.status.PENDING.text },

  tileApproved: { backgroundColor: AdminTheme.status.APPROVED.bg },
  textApproved: { color: AdminTheme.status.APPROVED.text },

  tileRejected: { backgroundColor: AdminTheme.status.REJECTED.bg },
  textRejected: { color: AdminTheme.status.REJECTED.text },
});
