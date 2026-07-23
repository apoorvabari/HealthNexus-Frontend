import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function DoctorHomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/doctor/logout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.portalBadge}>👨‍⚕️ DOCTOR CONSOLE</Text>
            <Text style={styles.welcomeTitle}>Dr. Specialist 🩺</Text>
            <Text style={styles.userEmail}>doctor@healthnexus.com</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Doctor Schedule Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>8</Text>
            <Text style={styles.statLabel}>Today's Patients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>98%</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
        </View>

        {/* Doctor Quick Tools Grid */}
        <Text style={styles.sectionTitle}>Clinical Tools</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>🩺</Text>
            <Text style={styles.cardTitle}>Consultations</Text>
            <Text style={styles.cardSub}>View today's patient lineup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>Write E-Prescription</Text>
            <Text style={styles.cardSub}>Issue digital medication orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>📂</Text>
            <Text style={styles.cardTitle}>Patient Records</Text>
            <Text style={styles.cardSub}>Search medical chart history</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>⏰</Text>
            <Text style={styles.cardTitle}>Shift Schedule</Text>
            <Text style={styles.cardSub}>Manage availability & slots</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Patient Queue */}
        <Text style={styles.sectionTitle}>Next Appointments</Text>
        <View style={styles.queueList}>
          <View style={styles.queueItem}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>10:00 AM</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Robert Fox</Text>
              <Text style={styles.patientDesc}>Routine Follow-up | Hypertension</Text>
            </View>
          </View>

          <View style={styles.queueItem}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>11:15 AM</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Emily Watson</Text>
              <Text style={styles.patientDesc}>New Consultation | Cardiac Echo</Text>
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
    backgroundColor: "#ECFDF5",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 20,
  },
  portalBadge: {
    color: "#059669",
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
    color: "#475569",
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
  summaryCard: {
    backgroundColor: "#059669",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  statBox: {
    alignItems: "center",
  },
  statNum: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: "#D1FAE5",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#34D399",
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
  queueList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginRight: 12,
  },
  timeText: {
    color: "#059669",
    fontWeight: "800",
    fontSize: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  patientDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});
