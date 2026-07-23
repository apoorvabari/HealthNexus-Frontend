import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function ReceptionistHomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/receptionist/logout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.portalBadge}>📋 RECEPTION DESKBOARD</Text>
            <Text style={styles.welcomeTitle}>Welcome, Receptionist 👋</Text>
            <Text style={styles.userEmail}>reception@healthnexus.com</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Front Desk Live Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>14</Text>
            <Text style={styles.statLabel}>Checked-in</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>In Waiting</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Doctors On-Duty</Text>
          </View>
        </View>

        {/* Front Desk Actions Grid */}
        <Text style={styles.sectionTitle}>Reception Operations</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push("/register?role=PATIENT")}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Register Walk-In</Text>
            <Text style={styles.cardSub}>Create new patient account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>📌</Text>
            <Text style={styles.cardTitle}>Patient Check-In</Text>
            <Text style={styles.cardSub}>Mark arrival & issue token</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>🗓️</Text>
            <Text style={styles.cardTitle}>Book Appointment</Text>
            <Text style={styles.cardSub}>Assign doctor time slots</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>🩺</Text>
            <Text style={styles.cardTitle}>Doctor Schedules</Text>
            <Text style={styles.cardSub}>View active duty rosters</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Desk Activity */}
        <Text style={styles.sectionTitle}>Front Desk Queue</Text>
        <View style={styles.queueList}>
          <View style={styles.queueItem}>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>#T-101</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>John Doe (Patient)</Text>
              <Text style={styles.patientDesc}>Assigned to Dr. Sarah Jenkins (Cardiology)</Text>
            </View>
          </View>

          <View style={styles.queueItem}>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>#T-102</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Alice Smith (Patient)</Text>
              <Text style={styles.patientDesc}>Assigned to Dr. Michael Brown (Orthopedics)</Text>
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
    backgroundColor: "#EEF2FF",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 20,
  },
  portalBadge: {
    color: "#4F46E5",
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
  statsCard: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#4F46E5",
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
    color: "#C7D2FE",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#818CF8",
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
  tokenBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginRight: 12,
  },
  tokenText: {
    color: "#4F46E5",
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
