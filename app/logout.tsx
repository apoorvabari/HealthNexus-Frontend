import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { logout } from "../src/services/AccountService";

type PortalType = "patient" | "doctor" | "receptionist";

interface LogoutScreenProps {
  portal?: PortalType;
}

const PORTAL_CONFIG = {
  patient: {
    icon: "🩺",
    badge: "PATIENT PORTAL",
    subtitle: "Are you sure you want to sign out of your Patient Portal?",
    infoText: "✅ Your session will be ended securely on the server.",
    cancelText: "Cancel — Stay in Portal",
    themeColor: "#0284C7",
    bgColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    badgeBg: "#E0F2FE",
    infoTextCol: "#0369A1",
    feedback: "You have been signed out of the Patient Portal."
  },
  doctor: {
    icon: "👨‍⚕️",
    badge: "DOCTOR CONSOLE",
    subtitle: "Are you sure you want to sign out of the Doctor Console?",
    infoText: "✅ Your clinical session will be ended securely.",
    cancelText: "Cancel — Stay in Console",
    themeColor: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    badgeBg: "#D1FAE5",
    infoTextCol: "#065F46",
    feedback: "You have been signed out of Doctor Console."
  },
  receptionist: {
    icon: "📋",
    badge: "RECEPTIONIST PORTAL",
    subtitle: "Are you sure you want to sign out of the Reception Desk?",
    infoText: "✅ Your front desk session will be ended securely.",
    cancelText: "Cancel — Stay at Desk",
    themeColor: "#4F46E5",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    badgeBg: "#E0E7FF",
    infoTextCol: "#3730A3",
    feedback: "You have been signed out of Reception Desk."
  },
  default: {
    icon: "🩺",
    badge: "HEALTHNEX ACCESS",
    subtitle: "Are you sure you want to sign out of your session?",
    infoText: "✅ Your session will be ended securely.",
    cancelText: "Cancel — Stay Signed In",
    themeColor: "#0D6EFD",
    bgColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    badgeBg: "#EFF6FF",
    infoTextCol: "#0B5ED7",
    feedback: "You have been signed out successfully."
  }
};

export default function LogoutScreen({ portal }: LogoutScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const activePortal = (portal || params.portal as string)?.toLowerCase() as PortalType;
  const config = PORTAL_CONFIG[activePortal] || PORTAL_CONFIG.default;

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await logout();
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: response.message || config.feedback,
      });
      setTimeout(() => router.replace("/select-portal"), 1000);
    } catch (error: any) {
      Toast.show({
        type: "info",
        text1: "Logged Out",
        text2: config.feedback,
      });
      router.replace("/select-portal");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: config.bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={config.bgColor} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { borderColor: config.borderColor, shadowColor: config.themeColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: config.badgeBg }]}>
            <Text style={styles.iconText}>{config.icon}</Text>
          </View>

          <Text style={[styles.portalBadge, { color: config.themeColor }]}>{config.badge}</Text>
          <Text style={styles.title}>Sign Out</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          <View style={[styles.infoBox, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
            <Text style={[styles.infoText, { color: config.infoTextCol }]}>
              {config.infoText}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={config.themeColor} style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                <Text style={styles.logoutBtnText}>Yes, Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
                <Text style={styles.cancelBtnText}>{config.cancelText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  iconText: { fontSize: 32 },
  portalBadge: {
    fontSize: 12, fontWeight: "800",
    letterSpacing: 0.8, marginBottom: 8,
  },
  title: {
    fontSize: 26, fontWeight: "800", color: "#0F172A",
    marginBottom: 10, textAlign: "center",
  },
  subtitle: {
    fontSize: 15, color: "#475569",
    textAlign: "center", lineHeight: 22, marginBottom: 20,
  },
  infoBox: {
    borderRadius: 12, padding: 14,
    borderWidth: 1,
    width: "100%", marginBottom: 24,
  },
  infoText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  buttonGroup: { width: "100%", gap: 12 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  cancelBtnText: { color: "#475569", fontSize: 15, fontWeight: "600" },
});
