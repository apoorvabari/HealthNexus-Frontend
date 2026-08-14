import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { AdminTheme } from "../../constants/adminTheme";
import { Ionicons } from "@expo/vector-icons";
import { getDashboardStats, AdminDashboardStatsResponse } from "../../services/AdminService";

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
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load platform stats</Text>
      </View>
    );
  }

  const sections = [
    {
      title: "Doctors",
      icon: "medkit",
      color: AdminTheme.primary,
      items: [
        { label: "Total", value: stats.totalDoctors },
        { label: "Pending", value: stats.pendingDoctors, color: AdminTheme.warning },
        { label: "Approved", value: stats.approvedDoctors, color: AdminTheme.success },
        { label: "Rejected", value: stats.rejectedDoctors, color: AdminTheme.danger },
      ]
    },
    {
      title: "Hospitals / Clinics",
      icon: "business",
      color: AdminTheme.info,
      items: [
        { label: "Total", value: stats.totalHospitals },
        { label: "Pending", value: stats.pendingHospitals, color: AdminTheme.warning },
        { label: "Approved", value: stats.approvedHospitals, color: AdminTheme.success },
        { label: "Rejected", value: stats.rejectedHospitals, color: AdminTheme.danger },
      ]
    },
    {
      title: "Users",
      icon: "people",
      color: AdminTheme.success,
      items: [
        { label: "Total", value: stats.totalUsers },
        { label: "Active", value: stats.activeUsers, color: AdminTheme.success },
        { label: "Deleted", value: stats.deletedUsers, color: AdminTheme.danger },
      ]
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Platform Overview</Text>
      
      {sections.map((section, idx) => (
        <View key={idx} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: section.color + "1A" }]}>
              <Ionicons name={section.icon as any} size={24} color={section.color} />
            </View>
            <Text style={styles.sectionTitleText}>{section.title}</Text>
          </View>
          
          <View style={styles.grid}>
            {section.items.map((item, itemIdx) => (
              <View key={itemIdx} style={[styles.card, item.color && { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
                <Text style={[styles.cardValue, item.color && { color: item.color }]}>{item.value}</Text>
                <Text style={styles.cardTitle}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  pageTitle: { fontSize: 20, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 20 },
  errorText: { color: AdminTheme.danger, fontWeight: "600" },
  sectionContainer: {
    backgroundColor: AdminTheme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  sectionTitleText: { fontSize: 18, fontWeight: "700", color: AdminTheme.textPrimary },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 15 },
  card: {
    backgroundColor: AdminTheme.background,
    borderRadius: 10,
    padding: 15,
    width: "47%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: { fontSize: 26, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 5 },
  cardTitle: { fontSize: 13, color: AdminTheme.textSecondary, fontWeight: "600" },
});
