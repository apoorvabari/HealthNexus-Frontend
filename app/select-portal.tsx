import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function SelectPortalScreen() {
  const router = useRouter();

  const portals = [
    {
      id: "patient",
      title: "Patient Portal",
      subtitle: "Access personal medical records & book appointments",
      icon: "🩺",
      badge: "Patient Workspace",
      route: "/login?role=patient",
      gradient: ["#059669", "#10B981"],
      badgeBg: "rgba(16, 185, 129, 0.18)",
      badgeColor: "#34D399",
      borderColor: "rgba(52, 211, 153, 0.35)",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
      id: "doctor",
      title: "Doctor Portal",
      subtitle: "Manage daily schedules & consult patients",
      icon: "👨‍⚕️",
      badge: "Medical Staff",
      route: "/login?role=doctor",
      gradient: ["#0284C7", "#06B6D4"],
      badgeBg: "rgba(6, 182, 212, 0.18)",
      badgeColor: "#38BDF8",
      borderColor: "rgba(56, 189, 248, 0.35)",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    {
      id: "receptionist",
      title: "Receptionist Portal",
      subtitle: "Handle front desk check-ins & schedule slots",
      icon: "📋",
      badge: "Hospital Ops",
      route: "/login?role=receptionist",
      gradient: ["#6366F1", "#8B5CF6"],
      badgeBg: "rgba(139, 92, 246, 0.18)",
      badgeColor: "#C4B5FD",
      borderColor: "rgba(167, 139, 250, 0.35)",
      glowColor: "rgba(139, 92, 246, 0.15)",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.topOrb} />
        <View style={styles.middleOrb} />
        <View style={styles.bottomOrb} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/")}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={16} color="#94A3B8" />
              <Text style={styles.backText}>Back to Home</Text>
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
                  styles.glassCard,
                  { borderColor: portal.borderColor },
                ]}
                onPress={() => router.push(portal.route as any)}
                activeOpacity={0.88}
              >
                <View
                  style={[
                    styles.cardGlow,
                    { backgroundColor: portal.glowColor },
                  ]}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                    <Text style={styles.emojiIcon}>{portal.icon}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: portal.badgeBg, borderColor: portal.borderColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: portal.badgeColor },
                      ]}
                    >
                      {portal.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.portalTitle}>{portal.title}</Text>
                <Text style={styles.portalSubtitle}>{portal.subtitle}</Text>

                <LinearGradient
                  colors={portal.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>
                    Login to {portal.title}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Need a new account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/patient/register")}
              activeOpacity={0.8}
            >
              <Text style={styles.registerLink}>Register Patient Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  topOrb: {
    position: "absolute",
    top: -width * 0.2,
    right: -width * 0.15,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },
  middleOrb: {
    position: "absolute",
    top: width * 0.6,
    left: -width * 0.25,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(16, 185, 129, 0.18)",
  },
  bottomOrb: {
    position: "absolute",
    bottom: -width * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(139, 92, 246, 0.18)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 640,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: 28,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  backText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "500",
  },
  portalList: {
    gap: 20,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  emojiIcon: {
    fontSize: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  portalSubtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
    marginBottom: 20,
    fontWeight: "400",
  },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  registerLink: {
    color: "#34D399",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
