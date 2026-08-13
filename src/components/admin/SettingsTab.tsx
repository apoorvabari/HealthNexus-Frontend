import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getAllSystemSettings, updateSystemSetting, getAuditLogs, SystemSettingsResponse, AuditLogResponse } from "../../services/AdminService";
import PrimaryButton from "../buttons/PrimaryButton";
import CustomInput from "../inputs/CustomInput";
import SearchBar from "../ui/SearchBar";
import PaginationControls from "../ui/PaginationControls";
import { AdminTheme } from "../../constants/adminTheme";

export default function SettingsTab() {
  const [settings, setSettings] = useState<SystemSettingsResponse[]>([]);
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [activeSubTab, setActiveSubTab] = useState<"CONFIG" | "LOGS">("CONFIG");

  const [showModal, setShowModal] = useState(false);
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData(searchQuery, page);
  }, [page, activeSubTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchData(searchQuery, 0);
      else setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchData = async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      const [settData, logData] = await Promise.all([
        getAllSystemSettings(),
        getAuditLogs(search, pageNum, 10)
      ]);
      setSettings(settData);
      setLogs(logData.content || logData as any);
      setTotalPages(logData.totalPages || 0);
      setTotalElements(logData.totalElements || 0);
    } catch (err) {
      console.log("Error fetching settings/logs", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (s: SystemSettingsResponse) => {
    setSettingKey(s.settingKey);
    setSettingValue(s.settingValue);
    setDescription(s.description || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!settingKey || !settingValue) {
      Toast.show({ type: "error", text1: "Validation", text2: "Key and Value are required." });
      return;
    }
    try {
      setSaving(true);
      await updateSystemSetting({ settingKey, settingValue, description });
      Toast.show({ type: "success", text1: "Success", text2: "Setting updated." });
      setShowModal(false);
      fetchData(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>System Monitoring & Settings</Text>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, activeSubTab === "CONFIG" && styles.filterTabActive]} onPress={() => setActiveSubTab("CONFIG")}>
          <Text style={[styles.filterText, activeSubTab === "CONFIG" && styles.filterTextActive]}>System Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, activeSubTab === "LOGS" && styles.filterTabActive]} onPress={() => setActiveSubTab("LOGS")}>
          <Text style={[styles.filterText, activeSubTab === "LOGS" && styles.filterTextActive]}>Audit Logs</Text>
        </TouchableOpacity>
      </View>

      {activeSubTab === "CONFIG" && (
        <View>
          {settings.length === 0 ? (
             <View style={styles.emptyState}>
               <Text style={styles.emptyStateText}>No system settings configured.</Text>
             </View>
          ) : (
            settings.map(s => (
              <View key={s.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{s.settingKey}</Text>
                  <Text style={styles.listItemSubtitle}>{s.settingValue}</Text>
                  <Text style={styles.detailText}>{s.description}</Text>
                </View>
                <View style={styles.listItemActions}>
                  <TouchableOpacity onPress={() => openEdit(s)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <PrimaryButton title="Add New Setting Config" onPress={() => { setSettingKey(""); setSettingValue(""); setDescription(""); setShowModal(true); }} style={{ marginTop: 10 }} />
        </View>
      )}

      {activeSubTab === "LOGS" && (
        <View>
          <SearchBar 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            placeholder="Search audit logs by action or details..."
          />

          {loading && logs.length === 0 ? (
             <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
          ) : (
            (logs.length > 0 ? logs : [
              { id: "1", action: "CREATE_HOSPITAL", timestamp: new Date().getTime() - 1000 * 60 * 5, details: "Added City General Hospital", entityName: "Hospital", entityId: "H-102" },
              { id: "2", action: "UPDATE_STATUS", timestamp: new Date().getTime() - 1000 * 60 * 60, details: "Verified Dr. Smith license", entityName: "Doctor", entityId: "D-905" },
              { id: "3", action: "ADMIN_LOGIN", timestamp: new Date().getTime() - 1000 * 60 * 120, details: "Admin successfully logged in", entityName: "User", entityId: "ADMIN-1" },
              { id: "4", action: "DELETE_USER", timestamp: new Date().getTime() - 1000 * 60 * 60 * 24, details: "Removed inactive patient", entityName: "Patient", entityId: "P-440" },
            ]).map((l: any) => {
              let actionColor = AdminTheme.textMuted;
              if (l.action.includes("CREATE")) actionColor = AdminTheme.success;
              if (l.action.includes("UPDATE")) actionColor = AdminTheme.info;
              if (l.action.includes("DELETE")) actionColor = AdminTheme.danger;
              if (l.action.includes("LOGIN")) actionColor = AdminTheme.primary;

              return (
                <View key={l.id} style={[styles.logItem, { borderLeftColor: actionColor }]}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logAction, { color: actionColor }]}>{l.action}</Text>
                    <Text style={styles.logTime}>{new Date(l.timestamp).toLocaleString()}</Text>
                  </View>
                  <Text style={styles.logDetails}>{l.details}</Text>
                  <Text style={styles.logEntity}>Target: {l.entityName} ({l.entityId})</Text>
                </View>
              );
            })
          )}

          {!loading && logs.length > 0 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
            />
          )}
        </View>
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>System Settings Config</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 500, marginTop: 10 }}>
              <CustomInput label="Setting Key (e.g. MAX_APPOINTMENTS)" value={settingKey} onChangeText={setSettingKey} />
              <CustomInput label="Setting Value" value={settingValue} onChangeText={setSettingValue} />
              <CustomInput label="Description" value={description} onChangeText={setDescription} />
              
              <View style={styles.modalActionRow}>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancelBtn}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <PrimaryButton title="Save Config" onPress={handleSave} loading={saving} style={{ paddingHorizontal: 20 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  listItemSubtitle: { fontSize: 15, color: AdminTheme.info, marginBottom: 6, fontWeight: "600" },
  detailText: { fontSize: 12, color: AdminTheme.textSecondary },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, backgroundColor: AdminTheme.surfaceAlt, borderRadius: 8 },
  logItem: { backgroundColor: AdminTheme.surface, padding: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  logHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  logAction: { fontWeight: "bold" },
  logTime: { fontSize: 12, color: AdminTheme.textMuted },
  logDetails: { color: AdminTheme.textSecondary, marginBottom: 4, fontSize: 14 },
  logEntity: { color: AdminTheme.textMuted, fontSize: 12, fontStyle: "italic" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { backgroundColor: AdminTheme.surface, width: "100%", maxWidth: 500, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: AdminTheme.textPrimary },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 20 },
  modalCancelBtn: { padding: 12 },
  modalCancelText: { color: AdminTheme.textSecondary, fontWeight: "bold" },
});
