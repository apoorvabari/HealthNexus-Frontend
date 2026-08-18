import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminTheme } from "../../constants/adminTheme";

export type TabType = "OVERVIEW" | "DOCTORS" | "HOSPITALS" | "DEPARTMENTS" | "USERS" | "SETTINGS";

interface AdminHeaderProps {
  sessionUser: any;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function AdminHeader({ sessionUser, activeTab, onTabChange }: AdminHeaderProps) {
  const router = useRouter();

  const formatLastLogin = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const tabs: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: "OVERVIEW", label: "Analytics", icon: "pie-chart" },
    { key: "DOCTORS", label: "Verify Doctors", icon: "medkit" },
    { key: "HOSPITALS", label: "Verify Hospitals", icon: "business" },
    { key: "DEPARTMENTS", label: "Departments", icon: "git-network" },
    { key: "USERS", label: "Users", icon: "people" },
    { key: "SETTINGS", label: "Settings", icon: "settings" },
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={styles.userInfoRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={AdminTheme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {sessionUser?.accountName ? sessionUser.accountName.charAt(0).toUpperCase() : "A"}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Good morning, {sessionUser?.accountName || "Admin"} 👋</Text>
            <Text style={styles.subtitle}>Last login: {formatLastLogin(sessionUser?.lastLogin)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/logout")}>
          <Ionicons name="log-out-outline" size={20} color={AdminTheme.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => onTabChange(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isActive ? tab.icon : `${tab.icon}-outline`} 
                  size={18} 
                  color={isActive ? AdminTheme.primary : AdminTheme.textSecondary} 
                  style={{marginRight: 8}} 
                />
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    backgroundColor: AdminTheme.surface, 
    ...AdminTheme.shadows.soft,
    zIndex: 10,
  },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 24, 
    paddingTop: 48,
    paddingBottom: 24,
  },
  userInfoRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 16 
  },
  backBtn: { 
    padding: 10, 
    borderRadius: AdminTheme.borderRadius.pill, 
    backgroundColor: AdminTheme.surfaceAlt,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AdminTheme.primaryLight + "33", // 20% opacity
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AdminTheme.primaryLight + "66",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: AdminTheme.primaryDark,
  },
  greeting: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: AdminTheme.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 13, 
    color: AdminTheme.textMuted, 
    marginTop: 4,
    fontWeight: "500",
  },
  logoutBtn: { 
    padding: 12, 
    backgroundColor: AdminTheme.dangerBg, 
    borderRadius: AdminTheme.borderRadius.pill, 
  },
  tabScrollWrapper: {
    borderTopWidth: 1,
    borderTopColor: AdminTheme.border,
  },
  tabContainer: { 
    flexDirection: "row", 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: AdminTheme.borderRadius.pill, 
    flexShrink: 0,
    backgroundColor: "transparent",
  },
  tabBtnActive: { 
    backgroundColor: AdminTheme.primaryBg, 
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: AdminTheme.textSecondary,
  },
  tabTextActive: { 
    color: AdminTheme.primary,
    fontWeight: "700",
  },
  badgeContainer: { 
    backgroundColor: AdminTheme.danger, 
    borderRadius: 12, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    marginLeft: 8 
  },
  badgeText: { 
    color: "#FFF", 
    fontSize: 11, 
    fontWeight: "bold" 
  },
});
