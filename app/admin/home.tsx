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
import AdminHeader, { TabType } from "../../src/components/admin/AdminHeader";
import { AdminTheme } from "../../src/constants/adminTheme";

export default function AdminHomeScreen() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getUserSession();
        if (!user || user.role?.toLowerCase() !== "admin") {
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
      case "OVERVIEW": return <OverviewTab key={refreshKey} />;
      case "DOCTORS": return <DoctorsTab key={refreshKey} />;
      case "HOSPITALS": return <HospitalsTab key={refreshKey} />;
      case "DEPARTMENTS": return <DepartmentsTab key={refreshKey} />;
      case "USERS": return <UsersTab key={refreshKey} />;
      case "SETTINGS": return <SettingsTab key={refreshKey} />;
      default: return <OverviewTab key={refreshKey} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9", "#E0E7FF"]} style={styles.gradientContainer}>
        
        <AdminHeader 
          sessionUser={sessionUser}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

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
  scrollContent: { padding: 20, paddingBottom: 40 },
});
