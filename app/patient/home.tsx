import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function PatientHomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/patient/logout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.portalBadge}>🩺 PATIENT PORTAL</Text>
            <Text style={styles.welcomeTitle}>Welcome, Patient 👋</Text>
            <Text style={styles.userEmail}>patient@healthnexus.com</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Health Status Summary Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Next Upcoming Appointment</Text>
          <Text style={styles.statusDetail}>Dr. Sarah Jenkins - General Cardiology</Text>
          <Text style={styles.statusTime}>📅 Tomorrow at 10:30 AM | Room 204</Text>
        </View>

        {/* Quick Services Grid */}
        <Text style={styles.sectionTitle}>Patient Services</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardTitle}>Book Appointment</Text>
            <Text style={styles.cardSub}>Schedule visit with top doctors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Medical Records</Text>
            <Text style={styles.cardSub}>View lab reports & diagnostics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>💊</Text>
            <Text style={styles.cardTitle}>Prescriptions</Text>
            <Text style={styles.cardSub}>Active medications & refills</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>👨‍⚕️</Text>
            <Text style={styles.cardTitle}>Find Doctors</Text>
            <Text style={styles.cardSub}>Browse specialists & ratings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Health Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.actIcon}>✅</Text>
            <View>
              <Text style={styles.actTitle}>Blood Test Report Available</Text>
              <Text style={styles.actSub}>Uploaded 2 days ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.actIcon}>💊</Text>
            <View>
              <Text style={styles.actTitle}>Prescription Refill Issued</Text>
              <Text style={styles.actSub}>Dr. Smith - Amoxicillin 500mg</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 20,
  },
  portalBadge: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#FFE4E6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  logoutText: {
    color: "#E11D48",
    fontWeight: "700",
    fontSize: 13,
  },
  statusCard: {
    backgroundColor: "#0284C7",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  statusTitle: {
    color: "#BAE6FD",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  statusDetail: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  statusTime: {
    color: "#E0F2FE",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 14,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  actSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});
