import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { clearSession, getUserSession } from "../src/storage/AuthStorage";
import { logout } from "../src/services/UserService";

export default function LogoutScreen() {
  const router = useRouter();
  const { role: queryRole } = useLocalSearchParams<{ role?: string }>();
  const [loading, setLoading] = useState(true);

  const roleKey = (queryRole || "").toLowerCase().trim();

  let theme = {
    bgColor: "#F8FAFC",
    badgeBg: "#E2E8F0",
    badgeColor: "#0F172A",
    portalBadge: "HEALTHNEXUS",
    accentColor: "#0D6EFD",
  };

  if (roleKey === "patient") {
    theme = {
      bgColor: "#F0F9FF",
      badgeBg: "#BAE6FD",
      badgeColor: "#0284C7",
      portalBadge: "PATIENT PORTAL",
      accentColor: "#0284C7",
    };
  } else if (roleKey === "doctor") {
    theme = {
      bgColor: "#ECFDF5",
      badgeBg: "#A7F3D0",
      badgeColor: "#059669",
      portalBadge: "DOCTOR CONSOLE",
      accentColor: "#059669",
    };
  } else if (roleKey === "receptionist") {
    theme = {
      bgColor: "#EEF2FF",
      badgeBg: "#C7D2FE",
      badgeColor: "#4F46E5",
      portalBadge: "RECEPTION DESK",
      accentColor: "#4F46E5",
    };
  }

  useEffect(() => {
    const performLogout = async () => {
      try {
        setLoading(true);
        const session = await getUserSession();
        const response = await logout(session?.email || "");

        await clearSession();

        Toast.show({
          type: "success",
          text1: "Logged Out",
          text2: response.message || "You have been logged out successfully.",
        });

        setTimeout(() => router.replace("/select-portal"), 1000);
      } catch {
        await clearSession();
        Toast.show({
          type: "info",
          text1: "Logged Out",
          text2: `You have been signed out of ${theme.portalBadge.toLowerCase()}.`,
        });
        router.replace("/select-portal");
      } finally {
        setLoading(false);
      }
    };

    performLogout();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
          <Text style={[styles.badgeText, { color: theme.badgeColor }]}>
            {theme.portalBadge}
          </Text>
        </View>

        <Text style={styles.title}>Signing Out...</Text>
        <Text style={styles.subtitle}>
          Clearing session security tokens and workspace data...
        </Text>

        <ActivityIndicator
          size="large"
          color={theme.accentColor}
          style={styles.spinner}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
