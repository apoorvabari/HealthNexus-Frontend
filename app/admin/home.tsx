import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { getUserSession } from "../../src/storage/AuthStorage";
import OverviewTab from "../../src/components/admin/OverviewTab";
import DoctorsTab from "../../src/components/admin/DoctorsTab";
import HospitalsTab from "../../src/components/admin/HospitalsTab";
import DepartmentsTab from "../../src/components/admin/DepartmentsTab";
import UsersTab from "../../src/components/admin/UsersTab";
import SettingsTab from "../../src/components/admin/SettingsTab";
import { AdminTheme } from "../../src/constants/adminTheme";

type TabType = "OVERVIEW" | "DOCTORS" | "HOSPITALS" | "DEPARTMENTS" | "USERS" | "SETTINGS";

export default function AdminHomeScreen() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getUserSession();
        if (!user || user.role !== "ADMIN") {
          router.replace("/select-portal");
          return;
        }
        setSessionUser(user);
      } catch (e) {
        router.replace("/select-portal");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const formatLastLogin = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "OVERVIEW": return <OverviewTab />;
      case "DOCTORS": return <DoctorsTab />;
      case "HOSPITALS": return <HospitalsTab />;
      case "DEPARTMENTS": return <DepartmentsTab />;
      case "USERS": return <UsersTab />;
      case "SETTINGS": return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  const tabs: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: "OVERVIEW", label: "Analytics", icon: "pie-chart-outline" },
    { key: "DOCTORS", label: "Verify Doctors", icon: "medkit-outline" },
    { key: "HOSPITALS", label: "Verify Clinics", icon: "business-outline" },
    { key: "DEPARTMENTS", label: "Departments", icon: "git-network-outline" },
    { key: "USERS", label: "Users", icon: "people-outline" },
    { key: "SETTINGS", label: "Settings & Logs", icon: "settings-outline" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9", "#E0E7FF"]} style={styles.gradientContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={20} color={AdminTheme.textSecondary} />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hello, {sessionUser?.accountName || "Admin"} 👋</Text>
                <Text style={styles.subtitle}>Last login: {formatLastLogin(sessionUser?.lastLogin)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/logout")}>
              <Ionicons name="log-out-outline" size={20} color={AdminTheme.danger} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerAccentBar} />
        </View>

        <View style={styles.tabScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Ionicons name={tab.icon} size={16} color={isActive ? AdminTheme.primary : AdminTheme.textSecondary} style={{marginRight: 6}} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  {tab.badge ? (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{tab.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderTab()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AdminTheme.background },
  gradientContainer: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: AdminTheme.surface, borderBottomWidth: 1, borderBottomColor: AdminTheme.border },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 40 },
  headerAccentBar: { height: 4, backgroundColor: AdminTheme.primary, width: "100%" },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: AdminTheme.surfaceAlt },
  greeting: { fontSize: 22, fontWeight: "bold", color: AdminTheme.textPrimary },
  subtitle: { fontSize: 14, color: AdminTheme.textSecondary, marginTop: 4 },
  logoutBtn: { padding: 10, backgroundColor: AdminTheme.dangerBg, borderRadius: 12 },
  tabScrollContainer: { backgroundColor: AdminTheme.surface, borderBottomWidth: 1, borderBottomColor: AdminTheme.border },
  tabContainer: { flexDirection: "row", paddingHorizontal: 15, paddingTop: 10 },
  tabBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, borderBottomWidth: 3, borderBottomColor: "transparent", borderRadius: 8 },
  tabBtnActive: { borderBottomColor: AdminTheme.primary, backgroundColor: AdminTheme.primaryBg },
  tabText: { fontSize: 14, fontWeight: "600", color: AdminTheme.textSecondary },
  tabTextActive: { color: AdminTheme.primary },
  badgeContainer: { backgroundColor: AdminTheme.danger, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 40 },
});
