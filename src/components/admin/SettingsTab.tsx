import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { AdminTheme } from "../../constants/adminTheme";
import { AuditLogResponse, getAllSystemSettings, getAuditLogs, SystemSettingsResponse, updateSystemSetting } from "../../services/AdminService";
import PaginationControls from "../ui/PaginationControls";
import SearchBar from "../ui/SearchBar";
import {
  GeneralSettingsForm,
  UserAccountSettingsForm,
  RolePermissionSettingsForm,
  SecuritySettingsForm,
  HospitalConfigForm,
  AppointmentConfigForm,
  QueueConfigForm,
  NotificationSettingsForm,
  EmailConfigForm,
  SmsConfigForm,
  PrivacyDataForm,
  FileDocumentForm,
  BackupRecoveryForm,
  MaintenanceForm,
  IntegrationsForm,
  SystemInformation,
  AuditLogSettingsForm
} from "./settings/SettingsForms";

const SETTING_CATEGORIES = [
  { id: "GENERAL_SETTINGS", label: "General Settings" },
  { id: "USER_ACCOUNT_SETTINGS", label: "User & Account" },
  { id: "ROLE_SETTINGS", label: "Roles & Permissions" },
  { id: "SECURITY_SETTINGS", label: "Security" },
  { id: "HOSPITAL_CONFIG", label: "Hospital Config" },
  { id: "APPOINTMENT_CONFIG", label: "Appointment Config" },
  { id: "QUEUE_CONFIG", label: "Queue Config" },
  { id: "NOTIFICATION_SETTINGS", label: "Notifications" },
  { id: "EMAIL_CONFIG", label: "Email Config" },
  { id: "SMS_CONFIG", label: "SMS Config" },
  { id: "AUDIT_LOG_CONFIG", label: "Audit Log Settings" },
  { id: "PRIVACY_DATA_CONFIG", label: "Privacy & Data" },
  { id: "FILE_DOC_CONFIG", label: "Files & Documents" },
  { id: "BACKUP_RECOVERY_CONFIG", label: "Backup & Recovery" },
  { id: "MAINTENANCE_CONFIG", label: "Maintenance" },
  { id: "INTEGRATIONS", label: "Integrations" },
  { id: "SYSTEM_INFO", label: "System Information" },
  { id: "AUDIT_LOGS_VIEW", label: "View Audit Logs" },
];

export default function SettingsTab() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [activeTab, setActiveTab] = useState("GENERAL_SETTINGS");
  
  const [settingsDict, setSettingsDict] = useState<Record<string, any>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "AUDIT_LOGS_VIEW") {
      fetchLogs(searchQuery, page);
    }
  }, [activeTab, page]);

  useEffect(() => {
    if (activeTab === "AUDIT_LOGS_VIEW") {
      const delayDebounceFn = setTimeout(() => {
        if (page === 0) fetchLogs(searchQuery, 0);
        else setPage(0);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getAllSystemSettings();
      const dict: Record<string, any> = {};
      data.forEach(s => {
        try {
          dict[s.settingKey] = JSON.parse(s.settingValue);
        } catch {
          // Fallback if it's not JSON
          dict[s.settingKey] = s.settingValue;
        }
      });
      setSettingsDict(dict);
    } catch (err) {
      console.log("Error fetching settings", err);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load settings." });
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchLogs = async (search = "", pageNum = 0) => {
    try {
      setLoadingLogs(true);
      const data = await getAuditLogs(search, pageNum, 10);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.log("Error fetching logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveSetting = async (key: string, data: any) => {
    try {
      setSaving(true);
      await updateSystemSetting({
        settingKey: key,
        settingValue: JSON.stringify(data),
        description: "Managed by Admin Portal Settings"
      });
      Toast.show({ type: "success", text1: "Settings Saved", text2: "Configuration updated successfully." });
      // Update local dictionary so it reflects immediately without refetching everything
      setSettingsDict(prev => ({ ...prev, [key]: data }));
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Save Failed", text2: err.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const renderActiveForm = () => {
    if (loadingSettings) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AdminTheme.primary} />
          <Text style={{marginTop: 10, color: AdminTheme.textSecondary}}>Loading configuration...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "GENERAL_SETTINGS": return <GeneralSettingsForm data={settingsDict["GENERAL_SETTINGS"]} onSave={handleSaveSetting} saving={saving} />;
      case "USER_ACCOUNT_SETTINGS": return <UserAccountSettingsForm data={settingsDict["USER_ACCOUNT_SETTINGS"]} onSave={handleSaveSetting} saving={saving} />;
      case "ROLE_SETTINGS": return <RolePermissionSettingsForm data={settingsDict["ROLE_SETTINGS"]} onSave={handleSaveSetting} saving={saving} />;
      case "SECURITY_SETTINGS": return <SecuritySettingsForm data={settingsDict["SECURITY_SETTINGS"]} onSave={handleSaveSetting} saving={saving} />;
      case "HOSPITAL_CONFIG": return <HospitalConfigForm data={settingsDict["HOSPITAL_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "APPOINTMENT_CONFIG": return <AppointmentConfigForm data={settingsDict["APPOINTMENT_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "QUEUE_CONFIG": return <QueueConfigForm data={settingsDict["QUEUE_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "NOTIFICATION_SETTINGS": return <NotificationSettingsForm data={settingsDict["NOTIFICATION_SETTINGS"]} onSave={handleSaveSetting} saving={saving} />;
      case "EMAIL_CONFIG": return <EmailConfigForm data={settingsDict["EMAIL_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "SMS_CONFIG": return <SmsConfigForm data={settingsDict["SMS_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "AUDIT_LOG_CONFIG": return <AuditLogSettingsForm data={settingsDict["AUDIT_LOG_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "PRIVACY_DATA_CONFIG": return <PrivacyDataForm data={settingsDict["PRIVACY_DATA_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "FILE_DOC_CONFIG": return <FileDocumentForm data={settingsDict["FILE_DOC_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "BACKUP_RECOVERY_CONFIG": return <BackupRecoveryForm data={settingsDict["BACKUP_RECOVERY_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "MAINTENANCE_CONFIG": return <MaintenanceForm data={settingsDict["MAINTENANCE_CONFIG"]} onSave={handleSaveSetting} saving={saving} />;
      case "INTEGRATIONS": return <IntegrationsForm data={settingsDict["INTEGRATIONS"]} onSave={handleSaveSetting} saving={saving} />;
      case "SYSTEM_INFO": return <SystemInformation />;
      case "AUDIT_LOGS_VIEW": return renderAuditLogs();
      default: return null;
    }
  };

  const renderAuditLogs = () => (
    <View style={styles.card}>
      <Text style={styles.title}>System Audit Logs</Text>
      <Text style={styles.description}>Track all administrative actions and security events.</Text>
      
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search audit logs..." />

      {loadingLogs ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AdminTheme.primary} />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No audit logs found.</Text>
        </View>
      ) : (
        <View>
          {logs.map((l: any) => {
            let actionColor = AdminTheme.textMuted;
            if (l.action.includes("CREATE") || l.action.includes("ADD")) actionColor = AdminTheme.success;
            if (l.action.includes("UPDATE") || l.action.includes("EDIT")) actionColor = AdminTheme.info;
            if (l.action.includes("DELETE") || l.action.includes("REMOVE")) actionColor = AdminTheme.danger;
            if (l.action.includes("LOGIN") || l.action.includes("AUTH")) actionColor = AdminTheme.primary;

            return (
              <View key={l.id} style={[styles.logItem, { borderLeftColor: actionColor }]}>
                <View style={styles.logHeader}>
                  <Text style={[styles.logAction, { color: actionColor }]}>{l.action}</Text>
                  <Text style={styles.logTime}>{new Date(l.timestamp).toLocaleString()}</Text>
                </View>
                <Text style={[styles.logDetails, {marginBottom: 4}]}>Entity: {l.entityName} ({l.entityId})</Text>
                {l.performedBy && <Text style={[styles.logDetails, {marginBottom: 4}]}>Performed By: {l.performedBy}</Text>}
                <Text style={styles.logDetails}>{l.details}</Text>
              </View>
            );
          })}
        </View>
      )}

      {!loadingLogs && logs.length > 0 && (
        <PaginationControls currentPage={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Platform Settings</Text>
      </View>

      <View style={[styles.layoutWrapper, isMobile && { flexDirection: "column" }]}>
        
        {/* SIDEBAR NAVIGATION */}
        <View style={[styles.sidebar, isMobile && { width: "100%", marginBottom: 20 }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {SETTING_CATEGORIES.map(cat => {
              const isActive = activeTab === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setActiveTab(cat.id)}
                >
                  <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* MAIN CONTENT AREA */}
        <View style={[styles.mainContent, isMobile && { paddingLeft: 0 }]}>
          {renderActiveForm()}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, flex: 1 },
  sectionHeader: { marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: "bold", color: AdminTheme.textPrimary },
  
  layoutWrapper: { flexDirection: "row", flex: 1 },
  
  sidebar: { width: 250, borderRightWidth: 1, borderRightColor: AdminTheme.border, paddingRight: 10 },
  sidebarItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  sidebarItemActive: { backgroundColor: AdminTheme.primary + "1A" },
  sidebarText: { fontSize: 14, color: AdminTheme.textSecondary, fontWeight: "600" },
  sidebarTextActive: { color: AdminTheme.primary, fontWeight: "bold" },
  
  mainContent: { flex: 1, paddingLeft: 20 },
  
  center: { padding: 40, alignItems: "center" },
  card: { backgroundColor: AdminTheme.surface, padding: 20, borderRadius: AdminTheme.borderRadius.lg, ...AdminTheme.shadows.medium, borderWidth: 1, borderColor: AdminTheme.border },
  title: { fontSize: 18, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 8 },
  description: { fontSize: 13, color: AdminTheme.textSecondary, marginBottom: 20 },
  
  emptyState: { padding: 30, alignItems: "center", backgroundColor: AdminTheme.surfaceAlt, borderRadius: 12 },
  emptyStateText: { color: AdminTheme.textSecondary },
  
  logItem: { backgroundColor: AdminTheme.surface, padding: 20, borderRadius: AdminTheme.borderRadius.lg, marginBottom: 16, borderLeftWidth: 4, borderWidth: 1, borderColor: AdminTheme.border, ...AdminTheme.shadows.soft },
  logHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  logAction: { fontSize: 14, fontWeight: "bold" },
  logTime: { fontSize: 12, color: AdminTheme.textMuted },
  logDetails: { fontSize: 13, color: AdminTheme.textSecondary },
});
