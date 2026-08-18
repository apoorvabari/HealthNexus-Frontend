import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { AdminTheme } from '../../../constants/adminTheme';
import PrimaryButton from '../../buttons/PrimaryButton';
import CustomInput from '../../inputs/CustomInput';

const createStyle = StyleSheet.create({
  card: { backgroundColor: AdminTheme.surface, padding: 20, borderRadius: AdminTheme.borderRadius.lg, marginBottom: 20, ...AdminTheme.shadows.medium, borderWidth: 1, borderColor: AdminTheme.border },
  title: { fontSize: 18, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 8 },
  description: { fontSize: 13, color: AdminTheme.textSecondary, marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: AdminTheme.border },
  rowText: { fontSize: 15, color: AdminTheme.textPrimary, fontWeight: "500" },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }
});

export const GeneralSettingsForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { appName: "HealthNexus", supportEmail: "", supportPhone: "", language: "en", timezone: "UTC", maintenanceMode: false });

  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>General / Platform Settings</Text>
      <Text style={createStyle.description}>Configure basic application identity and global behavior.</Text>

      <CustomInput label="Application Name" value={form.appName} onChangeText={t => setForm({ ...form, appName: t })} />
      <CustomInput label="Support Email" value={form.supportEmail} onChangeText={t => setForm({ ...form, supportEmail: t })} />
      <CustomInput label="Support Phone" value={form.supportPhone} onChangeText={t => setForm({ ...form, supportPhone: t })} />
      <CustomInput label="Default Language" value={form.language} onChangeText={t => setForm({ ...form, language: t })} />

      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Maintenance Mode</Text>
        <Switch value={form.maintenanceMode} onValueChange={v => setForm({ ...form, maintenanceMode: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>

      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('GENERAL_SETTINGS', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const UserAccountSettingsForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { allowRegistration: true, emailVerification: true, minPasswordLength: "8", sessionTimeout: "30" });

  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>User & Account Settings</Text>
      <Text style={createStyle.description}>Manage global user registration and account policies.</Text>

      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Allow User Registration</Text>
        <Switch value={form.allowRegistration} onValueChange={v => setForm({ ...form, allowRegistration: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Require Email Verification</Text>
        <Switch value={form.emailVerification} onValueChange={v => setForm({ ...form, emailVerification: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>

      <CustomInput label="Minimum Password Length" value={form.minPasswordLength} onChangeText={t => setForm({ ...form, minPasswordLength: t })} keyboardType="numeric" />
      <CustomInput label="Session Timeout (minutes)" value={form.sessionTimeout} onChangeText={t => setForm({ ...form, sessionTimeout: t })} keyboardType="numeric" />

      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('USER_ACCOUNT_SETTINGS', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const RolePermissionSettingsForm = ({ data, onSave, saving }: any) => {
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Role & Permission Settings</Text>
      <Text style={createStyle.description}>Manage system roles and access control.</Text>
      <Text style={{ color: AdminTheme.textSecondary, fontStyle: "italic", marginVertical: 20 }}>Role configuration is tied to the backend authorization system. Select a role below to view its permissions.</Text>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('ROLE_SETTINGS', {})} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const SecuritySettingsForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { jwtExpiration: "1440", maxLoginAttempts: "5", forceLogout: false, twoFactorAuth: false });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Security Settings</Text>
      <Text style={createStyle.description}>Configure JWT, 2FA, and intrusion prevention.</Text>
      <CustomInput label="JWT Expiration (minutes)" value={form.jwtExpiration} onChangeText={t => setForm({ ...form, jwtExpiration: t })} keyboardType="numeric" />
      <CustomInput label="Max Failed Login Attempts" value={form.maxLoginAttempts} onChangeText={t => setForm({ ...form, maxLoginAttempts: t })} keyboardType="numeric" />
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Require Two-Factor Auth (Admins)</Text>
        <Switch value={form.twoFactorAuth} onValueChange={v => setForm({ ...form, twoFactorAuth: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('SECURITY_SETTINGS', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const HospitalConfigForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { approvalRequired: true, autoOnboarding: false, maxDepartments: "20" });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Hospital Configuration</Text>
      <Text style={createStyle.description}>Global policies for hospital onboarding and limits.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Require Admin Approval for Registration</Text>
        <Switch value={form.approvalRequired} onValueChange={v => setForm({ ...form, approvalRequired: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('HOSPITAL_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const AppointmentConfigForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { defaultDuration: "30", maxAdvanceBooking: "30", allowCancellation: true });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Appointment Configuration</Text>
      <Text style={createStyle.description}>Global scheduling and booking rules.</Text>
      <CustomInput label="Default Appointment Duration (mins)" value={form.defaultDuration} onChangeText={t => setForm({ ...form, defaultDuration: t })} keyboardType="numeric" />
      <CustomInput label="Max Advance Booking (days)" value={form.maxAdvanceBooking} onChangeText={t => setForm({ ...form, maxAdvanceBooking: t })} keyboardType="numeric" />
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Allow Patient Cancellations</Text>
        <Switch value={form.allowCancellation} onValueChange={v => setForm({ ...form, allowCancellation: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('APPOINTMENT_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const QueueConfigForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { queueEnabled: true, tokenPrefix: "T-", autoReset: true });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Smart Queue Configuration</Text>
      <Text style={createStyle.description}>Settings for token generation and patient flow.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Enable Queue System</Text>
        <Switch value={form.queueEnabled} onValueChange={v => setForm({ ...form, queueEnabled: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <CustomInput label="Token Prefix (e.g. T-)" value={form.tokenPrefix} onChangeText={t => setForm({ ...form, tokenPrefix: t })} />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('QUEUE_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const NotificationSettingsForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { pushEnabled: true, appointmentReminders: true });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Notification Settings</Text>
      <Text style={createStyle.description}>Toggle push and in-app notifications globally.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Enable Push Notifications</Text>
        <Switch value={form.pushEnabled} onValueChange={v => setForm({ ...form, pushEnabled: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('NOTIFICATION_SETTINGS', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const EmailConfigForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { smtpHost: "", smtpPort: "587", senderEmail: "" });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Email Configuration</Text>
      <Text style={createStyle.description}>SMTP settings for transactional emails.</Text>
      <CustomInput label="SMTP Host" value={form.smtpHost} onChangeText={t => setForm({ ...form, smtpHost: t })} />
      <CustomInput label="SMTP Port" value={form.smtpPort} onChangeText={t => setForm({ ...form, smtpPort: t })} keyboardType="numeric" />
      <CustomInput label="Sender Email Address" value={form.senderEmail} onChangeText={t => setForm({ ...form, senderEmail: t })} />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('EMAIL_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const SmsConfigForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { provider: "Twilio", senderId: "", enabled: false });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>SMS Configuration</Text>
      <Text style={createStyle.description}>Configure SMS gateway for OTPs and alerts.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Enable SMS Delivery</Text>
        <Switch value={form.enabled} onValueChange={v => setForm({ ...form, enabled: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <CustomInput label="SMS Provider (e.g., Twilio, AWS SNS)" value={form.provider} onChangeText={t => setForm({ ...form, provider: t })} />
      <CustomInput label="Sender ID" value={form.senderId} onChangeText={t => setForm({ ...form, senderId: t })} />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('SMS_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const PrivacyDataForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { retentionDays: "365", exportEnabled: true });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Privacy & Data Settings</Text>
      <Text style={createStyle.description}>Configure data retention and compliance policies.</Text>
      <CustomInput label="Data Retention Period (Days)" value={form.retentionDays} onChangeText={t => setForm({ ...form, retentionDays: t })} keyboardType="numeric" />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('PRIVACY_DATA_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const FileDocumentForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { maxUploadSize: "10", allowedFormats: "pdf,jpg,png" });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>File & Document Settings</Text>
      <Text style={createStyle.description}>Storage and upload limitations.</Text>
      <CustomInput label="Max Upload Size (MB)" value={form.maxUploadSize} onChangeText={t => setForm({ ...form, maxUploadSize: t })} keyboardType="numeric" />
      <CustomInput label="Allowed Formats (comma separated)" value={form.allowedFormats} onChangeText={t => setForm({ ...form, allowedFormats: t })} />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('FILE_DOC_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const BackupRecoveryForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { autoBackup: true, frequency: "Daily" });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Backup & Recovery</Text>
      <Text style={createStyle.description}>Database snapshot and automated backup scheduling.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Enable Automated Backups</Text>
        <Switch value={form.autoBackup} onValueChange={v => setForm({ ...form, autoBackup: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('BACKUP_RECOVERY_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const MaintenanceForm = ({ data, onSave, saving }: any) => {
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Maintenance Operations</Text>
      <Text style={createStyle.description}>Perform destructive or heavy system tasks.</Text>
      <View style={[createStyle.row, { justifyContent: "flex-start", gap: 10 }]}>
        <PrimaryButton title="Clear System Cache" onPress={() => { }} style={{ backgroundColor: AdminTheme.warning }} />
        <PrimaryButton title="Clear Expired Sessions" onPress={() => { }} style={{ backgroundColor: AdminTheme.warning }} />
      </View>
    </View>
  );
};

export const IntegrationsForm = ({ data, onSave, saving }: any) => {
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Third-Party Integrations</Text>
      <Text style={createStyle.description}>Manage webhooks and external service links.</Text>
      <Text style={{ color: AdminTheme.textSecondary, fontStyle: "italic", marginVertical: 20 }}>No active integrations detected.</Text>
    </View>
  );
};

export const AuditLogSettingsForm = ({ data, onSave, saving }: any) => {
  const [form, setForm] = useState(data || { enableLogging: true, retentionDays: "90" });
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>Audit Log Settings</Text>
      <Text style={createStyle.description}>Configure retention and logging granularity.</Text>
      <View style={createStyle.row}>
        <Text style={createStyle.rowText}>Enable System Audit Logging</Text>
        <Switch value={form.enableLogging} onValueChange={v => setForm({ ...form, enableLogging: v })} trackColor={{ false: "#CBD5E1", true: AdminTheme.primary }} />
      </View>
      <CustomInput label="Audit Log Retention Period (Days)" value={form.retentionDays} onChangeText={t => setForm({ ...form, retentionDays: t })} keyboardType="numeric" />
      <View style={createStyle.btnRow}>
        <PrimaryButton title="Save Changes" onPress={() => onSave('AUDIT_LOG_CONFIG', form)} loading={saving} style={{ paddingHorizontal: 24 }} />
      </View>
    </View>
  );
};

export const SystemInformation = () => {
  return (
    <View style={createStyle.card}>
      <Text style={createStyle.title}>System Information</Text>
      <Text style={createStyle.description}>Read-only diagnostic metrics.</Text>
      <Text style={{ fontSize: 14, color: AdminTheme.textPrimary, marginVertical: 4 }}>Application Version: v1.2.0</Text>
      <Text style={{ fontSize: 14, color: AdminTheme.textPrimary, marginVertical: 4 }}>Backend Framework: Spring Boot 3.2.1</Text>
      <Text style={{ fontSize: 14, color: AdminTheme.textPrimary, marginVertical: 4 }}>Frontend Framework: React Native (Expo SDK 51)</Text>
      <Text style={{ fontSize: 14, color: AdminTheme.textPrimary, marginVertical: 4 }}>Database Status: Healthy</Text>
      <Text style={{ fontSize: 14, color: AdminTheme.textPrimary, marginVertical: 4 }}>Last Deployment: 2026-08-15 10:00 UTC</Text>
    </View>
  );
};
