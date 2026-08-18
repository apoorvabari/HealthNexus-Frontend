import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
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

  const [error, setError] = useState(false);

  // Tabs for sub-filtering
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PATIENT" | "DOCTOR" | "ADMIN" | "RECEPTIONIST">("ALL");

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
      setError(false);
      const data = await getAllUsers(search, pageNum, 10);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.log("Error fetching users", err);
      setError(true);
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
    if (!u.role) return false;
    return u.role.toUpperCase() === activeFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>User Management</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }} contentContainerStyle={{ gap: 10 }}>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "ALL" && styles.filterTabActive]} onPress={() => setActiveFilter("ALL")}>
          <Text style={[styles.filterText, activeFilter === "ALL" && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "PATIENT" && styles.filterTabActive]} onPress={() => setActiveFilter("PATIENT")}>
          <Text style={[styles.filterText, activeFilter === "PATIENT" && styles.filterTextActive]}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "DOCTOR" && styles.filterTabActive]} onPress={() => setActiveFilter("DOCTOR")}>
          <Text style={[styles.filterText, activeFilter === "DOCTOR" && styles.filterTextActive]}>Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "RECEPTIONIST" && styles.filterTabActive]} onPress={() => setActiveFilter("RECEPTIONIST")}>
          <Text style={[styles.filterText, activeFilter === "RECEPTIONIST" && styles.filterTextActive]}>Receptionists</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeFilter === "ADMIN" && styles.filterTabActive]} onPress={() => setActiveFilter("ADMIN")}>
          <Text style={[styles.filterText, activeFilter === "ADMIN" && styles.filterTextActive]}>Admins</Text>
        </TouchableOpacity>
      </ScrollView>

      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Search users by name or email..."
      />

      {loading && filteredUsers.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{color: AdminTheme.danger, marginBottom: 12}}>Failed to load users</Text>
          <TouchableOpacity onPress={() => fetchUsers(searchQuery, page)} style={{backgroundColor: AdminTheme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8}}>
            <Text style={{color: "#FFF", fontWeight: "600"}}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found.</Text>
        </View>
      ) : (
        filteredUsers.map(u => {
          const status = u.isActive ? "ACTIVE" : "INACTIVE";
          return (
            <View key={u.id} style={[styles.listItem, { borderLeftColor: AdminTheme.info, borderLeftWidth: 4 }]}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{u.firstName} {u.lastName}</Text>
                <Text style={styles.listItemSubtitle}>{u.email}</Text>
                <View style={{ marginBottom: 4 }}>
                  <Text style={[styles.listItemSubtitle, { marginBottom: 2 }]}>Role: {(u.role || "UNKNOWN").toUpperCase()}</Text>
                  <Text style={[styles.listItemSubtitle, { marginBottom: 0 }]}>Status: {status}</Text>
                </View>
              </View>
              <View style={styles.listItemActions}>
                {u.isActive ? (
                  <TouchableOpacity onPress={() => handleToggleBlock(u)} style={[styles.actionBtn, styles.btnBlock]}>
                    <Text style={styles.actionBtnText}>Block</Text>
                    <Ionicons name="ban" size={16} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleToggleBlock(u)} style={[styles.actionBtn, styles.btnUnblock]}>
                    <Text style={styles.actionBtnText}>Unblock</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
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
  listItem: { flexDirection: "row", backgroundColor: AdminTheme.surface, padding: 20, borderRadius: AdminTheme.borderRadius.lg, marginBottom: 16, ...AdminTheme.shadows.soft, borderWidth: 1, borderColor: AdminTheme.border },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  listItemSubtitle: { fontSize: 13, color: AdminTheme.textSecondary, marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "bold" },
  listItemBadge2: { fontSize: 10, backgroundColor: "#F3F4F6", color: "#4B5563", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold", textTransform: "uppercase" },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: AdminTheme.borderRadius.pill, gap: 6 },
  btnBlock: { backgroundColor: AdminTheme.danger },
  btnUnblock: { backgroundColor: AdminTheme.success },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
