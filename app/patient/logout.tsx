import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { logout } from "../../src/services/AccountService";

export default function PatientLogoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      // Call backend POST /api/accounts/logout
      const response = await logout();
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: response.message || "You have been logged out successfully.",
      });
      setTimeout(() => router.replace("/select-portal"), 1000);
    } catch (error: any) {
      // Even if API fails, navigate away (stateless logout)
      Toast.show({
        type: "info",
        text1: "Logged Out",
        text2: "You have been signed out of the Patient Portal.",
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🩺</Text>
          </View>

          <Text style={styles.portalBadge}>PATIENT PORTAL</Text>
          <Text style={styles.title}>Sign Out</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to sign out of your Patient Portal?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✅ Your session will be ended securely on the server.
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0284C7" style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                <Text style={styles.logoutBtnText}>Yes, Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
                <Text style={styles.cancelBtnText}>Cancel — Stay in Portal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#E0F2FE",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  iconText: { fontSize: 32 },
  portalBadge: {
    color: "#0284C7", fontSize: 12, fontWeight: "800",
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
    backgroundColor: "#F0F9FF",
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#BAE6FD",
    width: "100%", marginBottom: 24,
  },
  infoText: { color: "#0369A1", fontSize: 13, fontWeight: "600", textAlign: "center" },
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
