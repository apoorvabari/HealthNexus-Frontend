import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AdminTheme } from "../../constants/adminTheme";
import { Ionicons } from "@expo/vector-icons";
import { getPlatformAnalytics, AnalyticsResponse } from "../../services/AdminService";

export default function OverviewTab() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.log("Error fetching analytics", err);
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

  if (!analytics) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
      </View>
    );
  }

  const statCards = [
    { title: "Total Doctors", value: analytics.totalDoctors, icon: "medkit", color: AdminTheme.info, trend: "+4% this week" },
    { title: "Total Patients", value: analytics.totalPatients, icon: "people", color: AdminTheme.success, trend: "+12% this month" },
    { title: "Total Hospitals", value: analytics.totalHospitals, icon: "business", color: AdminTheme.warning, trend: "No change" },
    { title: "Total Appointments", value: analytics.totalAppointments, icon: "calendar", color: AdminTheme.primary, trend: "+8% this week" },
    { title: "Appointments Today", value: analytics.appointmentsToday, icon: "today", color: AdminTheme.danger, trend: "High volume today", special: true },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Platform Overview</Text>
      
      <View style={styles.grid}>
        {statCards.map((card, index) => (
          <View key={index} style={[styles.card, { borderLeftColor: card.color, borderLeftWidth: 4 }, card.special && styles.cardSpecial]}>
            <View style={[styles.iconContainer, { backgroundColor: card.color + "1A" }]}>
              <Ionicons name={card.icon as any} size={24} color={card.color} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardValue, card.special && { fontSize: 32, color: card.color }]}>{card.value}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.trendText}>{card.trend}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 15 },
  errorText: { color: AdminTheme.danger, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 15 },
  card: {
    backgroundColor: AdminTheme.surface,
    borderRadius: 12,
    padding: 20,
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
  },
  cardSpecial: {
    width: "100%",
    backgroundColor: AdminTheme.dangerBg,
  },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 15 },
  cardContent: { flex: 1 },
  cardValue: { fontSize: 24, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  cardTitle: { fontSize: 13, color: AdminTheme.textSecondary, fontWeight: "600" },
  trendText: { fontSize: 11, color: AdminTheme.textMuted, marginTop: 4 },
});
