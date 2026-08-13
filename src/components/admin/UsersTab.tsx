import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getAllUsers, UserResponse } from "../../services/UserService";
import { toggleUserBlock } from "../../services/AdminService";

import SearchBar from "../ui/SearchBar";
import PaginationControls from "../ui/PaginationControls";
import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";

export default function UsersTab() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Tabs for sub-filtering
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PATIENTS" | "DOCTORS">("ALL");

  useEffect(() => {
    fetchUsers(searchQuery, page);
  }, [page, activeFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchUsers(searchQuery, 0);
      else setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchUsers = async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      const data = await getAllUsers(search, pageNum, 10);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.log("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user: UserResponse) => {
    const isCurrentlyActive = user.isActive;
    try {
      await toggleUserBlock(user.id, isCurrentlyActive || false);
      Toast.show({ type: "success", text1: "Success", text2: `User ${isCurrentlyActive ? "blocked" : "unblocked"}` });
      fetchUsers(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Failed", text2: err.message });
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "PATIENTS") return u.role === "patient";
    if (activeFilter === "DOCTORS") return u.role === "doctor";
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>User Management</Text>
      </View>
      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "ALL" && styles.filterTabActive]} onPress={() => setActiveFilter("ALL")}>
          <Text style={[styles.filterText, activeFilter === "ALL" && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "PATIENTS" && styles.filterTabActive]} onPress={() => setActiveFilter("PATIENTS")}>
          <Text style={[styles.filterText, activeFilter === "PATIENTS" && styles.filterTextActive]}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "DOCTORS" && styles.filterTabActive]} onPress={() => setActiveFilter("DOCTORS")}>
          <Text style={[styles.filterText, activeFilter === "DOCTORS" && styles.filterTextActive]}>Doctors</Text>
        </TouchableOpacity>
      </View>

      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Search users by name or email..."
      />

      {loading && filteredUsers.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found.</Text>
        </View>
      ) : (
        filteredUsers.map(u => {
          const status = u.isActive ? "ACTIVE" : "BLOCKED";
          const statusStyle = getStatusStyle(status);
          return (
            <View key={u.id} style={[styles.listItem, { borderLeftColor: AdminTheme.info, borderLeftWidth: 4 }]}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{u.firstName} {u.lastName}</Text>
                <Text style={styles.listItemSubtitle}>{u.email}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.listItemBadge2}>{u.role}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity onPress={() => handleToggleBlock(u)} style={[styles.actionBtn, u.isActive ? styles.btnBlock : styles.btnUnblock]}>
                  <Text style={styles.actionBtnText}>{u.isActive ? "Block" : "Unblock"}</Text>
                  <Ionicons name={u.isActive ? "ban" : "checkmark-circle"} size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!loading && filteredUsers.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: AdminTheme.textPrimary },
  filterTabs: { flexDirection: "row", marginBottom: 15, gap: 10 },
  filterTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: AdminTheme.border },
  filterTabActive: { backgroundColor: AdminTheme.primary },
  filterText: { fontSize: 13, color: AdminTheme.textSecondary, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  emptyState: { padding: 30, alignItems: "center", backgroundColor: AdminTheme.surfaceAlt, borderRadius: 12 },
  emptyStateText: { color: AdminTheme.textSecondary },
  listItem: { flexDirection: "row", backgroundColor: AdminTheme.surface, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  listItemSubtitle: { fontSize: 13, color: AdminTheme.textSecondary, marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "bold" },
  listItemBadge2: { fontSize: 10, backgroundColor: "#F3F4F6", color: "#4B5563", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold", textTransform: "uppercase" },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  btnBlock: { backgroundColor: AdminTheme.danger },
  btnUnblock: { backgroundColor: AdminTheme.success },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
