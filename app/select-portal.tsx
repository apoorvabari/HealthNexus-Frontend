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

export default function SelectPortalScreen() {
  const router = useRouter();

  const portals = [
    {
      id: "patient",
      title: "Patient Portal",
      subtitle: "Access personal medical records, book appointments & track prescriptions",
      icon: "🩺",
      badge: "Patient Access",
      route: "/patient/login",
      color: "#0284C7",
      bgColor: "#F0F9FF",
      borderColor: "#BAE6FD",
    },
    {
      id: "doctor",
      title: "Doctor Portal",
      subtitle: "Manage daily schedules, consult patients & write electronic prescriptions",
      icon: "👨‍⚕️",
      badge: "Medical Staff",
      route: "/doctor/login",
      color: "#059669",
      bgColor: "#ECFDF5",
      borderColor: "#A7F3D0",
    },
    {
      id: "receptionist",
      title: "Receptionist Portal",
      subtitle: "Handle front desk check-ins, register walk-ins & schedule doctor slots",
      icon: "📋",
      badge: "Desk Operations",
      route: "/receptionist/login",
      color: "#4F46E5",
      bgColor: "#EEF2FF",
      borderColor: "#C7D2FE",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backText}>← Back to Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your Portal</Text>
          <Text style={styles.headerSubtitle}>
            Choose your role to proceed to your dedicated workspace
          </Text>
        </View>

        <View style={styles.portalList}>
          {portals.map((portal) => (
            <TouchableOpacity
              key={portal.id}
              style={[
                styles.portalCard,
                { backgroundColor: portal.bgColor, borderColor: portal.borderColor },
              ]}
              onPress={() => router.push(portal.route as any)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: portal.color }]}>
                  <Text style={styles.iconText}>{portal.icon}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: portal.color }]}>
                  <Text style={styles.badgeText}>{portal.badge}</Text>
                </View>
              </View>

              <Text style={styles.portalTitle}>{portal.title}</Text>
              <Text style={styles.portalSubtitle}>{portal.subtitle}</Text>

              <View style={[styles.actionBtn, { backgroundColor: portal.color }]}>
                <Text style={styles.actionBtnText}>Login to {portal.title}</Text>
                <Text style={styles.actionBtnArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Need a new patient account?</Text>
          <TouchableOpacity onPress={() => router.push("/patient/register")}>
            <Text style={styles.registerLink}>Register Patient Account</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#0D6EFD",
    fontSize: 15,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 22,
  },
  portalList: {
    gap: 18,
  },
  portalCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  portalSubtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 18,
  },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  actionBtnArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  footerInfo: {
    marginTop: 32,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  registerLink: {
    color: "#0D6EFD",
    fontSize: 15,
    fontWeight: "700",
  },
});
