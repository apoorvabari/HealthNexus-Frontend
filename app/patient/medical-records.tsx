import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { getMyPatientProfile } from "../../src/services/PatientService";
import {
  getPatientMedicalHistory,
  getMedicalHistoryPdf,
  MedicalHistoryResponse,
} from "../../src/services/MedicalHistoryService";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={16} color="#6C63FF" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, multiline && styles.infoValueMultiline]}
      >
        {value || "—"}
      </Text>
    </View>
  </View>
);

interface DetailModalProps {
  record: MedicalHistoryResponse | null;
  visible: boolean;
  onClose: () => void;
  onDownloadPdf: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  record,
  visible,
  onClose,
  onDownloadPdf,
}) => {
  if (!record) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {}
          <LinearGradient
            colors={["#6C63FF", "#8B5CF6"]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="medical" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Visit {record.visitNumber}</Text>
                <Text style={styles.modalSubtitle}>
                  {formatDate(record.visitDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close Visit Detail"
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {}
            <Text style={styles.sectionLabel}>PHYSICIAN</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="person-circle-outline"
                label="Doctor"
                value={record.doctorName}
              />
              <InfoRow
                icon="medical-outline"
                label="Specialization"
                value={record.doctorSpecialization}
              />
              <InfoRow
                icon="calendar-outline"
                label="Appointment No."
                value={record.appointmentNumber}
              />
            </View>

            {}
            <Text style={styles.sectionLabel}>CONSULTATION</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="play-circle-outline"
                label="Started"
                value={formatDateTime(record.consultation?.startTime)}
              />
              <InfoRow
                icon="checkmark-circle-outline"
                label="Completed"
                value={formatDateTime(record.consultation?.endTime)}
              />
              <InfoRow
                icon="clipboard-outline"
                label="Visit Summary"
                value={record.consultation?.remarks}
                multiline
              />
            </View>

            {}
            <Text style={styles.sectionLabel}>MEDICAL RECORD</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="bandage-outline"
                label="Diagnosis"
                value={record.medicalRecord?.diagnosis}
                multiline
              />
              <InfoRow
                icon="clipboard-outline"
                label="Doctor Notes"
                value={record.medicalRecord?.notes}
                multiline
              />
              <InfoRow
                icon="calendar-outline"
                label="Record Date"
                value={formatDate(record.medicalRecord?.recordDate)}
              />
            </View>

            {}
            <Text style={styles.sectionLabel}>PRESCRIPTION</Text>
            <View style={styles.infoCard}>
              {record.prescriptions && record.prescriptions.length > 0 ? (
                record.prescriptions.map((prescription) => (
                  <View key={prescription.id} style={{ padding: 12 }}>
                    <InfoRow
                      icon="calendar-outline"
                      label="Prescription Date"
                      value={formatDate(prescription.prescriptionDate)}
                    />
                    {prescription.instructions ? (
                      <InfoRow
                        icon="information-circle-outline"
                        label="Instructions"
                        value={prescription.instructions}
                        multiline
                      />
                    ) : null}

                    {prescription.medicines?.map((medicine) => (
                      <View
                        key={medicine.id || medicine.medicineName}
                        style={{
                          paddingVertical: 10,
                          borderTopWidth: 1,
                          borderTopColor: "#2D2550",
                          marginTop: 8,
                        }}
                      >
                        <Text style={styles.infoLabel}>Medicine</Text>
                        <Text style={styles.infoValue}>
                          {medicine.medicineName}
                        </Text>

                        <Text style={[styles.infoLabel, { marginTop: 4 }]}>
                          Dosage
                        </Text>
                        <Text style={styles.infoValue}>{medicine.dosage}</Text>

                        <Text style={[styles.infoLabel, { marginTop: 4 }]}>
                          Frequency
                        </Text>
                        <Text style={styles.infoValue}>{medicine.frequency}</Text>

                        <Text style={[styles.infoLabel, { marginTop: 4 }]}>
                          Duration
                        </Text>
                        <Text style={styles.infoValue}>{medicine.duration}</Text>

                        {medicine.instructions ? (
                          <>
                            <Text style={[styles.infoLabel, { marginTop: 4 }]}>
                              Instructions
                            </Text>
                            <Text style={styles.infoValue}>
                              {medicine.instructions}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View style={{ padding: 14 }}>
                  <Text style={styles.infoValue}>
                    No prescription was issued for this visit.
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#6C63FF",
                paddingVertical: 12,
                borderRadius: 10,
                marginTop: 16,
                marginHorizontal: 16,
                marginBottom: 16,
              }}
              onPress={onDownloadPdf}
            >
              <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Download Medical History PDF
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface RecordCardProps {
  record: MedicalHistoryResponse;
  onPress: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityLabel={`View visit ${record.visitNumber} from ${formatDate(record.visitDate)}`}
  >
    <View style={styles.cardLeft}>
      <LinearGradient
        colors={["#6C63FF22", "#8B5CF622"]}
        style={styles.cardIcon}
      >
        <Ionicons name="medical-outline" size={22} color="#6C63FF" />
      </LinearGradient>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardDiagnosis} numberOfLines={1}>
          Visit {record.visitNumber}
        </Text>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>
            {formatDate(record.visitDate)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDoctor} numberOfLines={1}>
        <Ionicons name="person-outline" size={12} color="#9CA3AF" />{" "}
        {record.doctorName || "Doctor"}
        {record.doctorSpecialization
          ? ` · ${record.doctorSpecialization}`
          : ""}
      </Text>

      <View style={{ marginTop: 4 }}>
        <Text style={[styles.cardDoctor, { fontWeight: "600" }]}>Diagnosis:</Text>
        <Text style={styles.cardNotes} numberOfLines={2}>
          {record.medicalRecord?.diagnosis || "Diagnosis not recorded"}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardApptNum}>
          {record.appointmentNumber ? `Appt: ${record.appointmentNumber}` : ""}
        </Text>
        <Text style={styles.cardViewMore}>
          View Visit{" "}
          <Ionicons name="chevron-forward" size={12} color="#6C63FF" />
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<MedicalHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MedicalHistoryResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadRecords = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const profile = await getMyPatientProfile();
      const data = await getPatientMedicalHistory(profile.id);
      setRecords(data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setRecords([]);
      } else if (status === 403) {
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "You are not authorized to view this medical history.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to load medical history",
          text2: err?.message || "Please try again.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const profile = await getMyPatientProfile();
      const buffer = await getMedicalHistoryPdf(profile.id);

      if (Platform.OS === "web") {
        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      const toBase64 = (arrayBuffer: ArrayBuffer) => {
        let binary = "";
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };

      const base64 = toBase64(buffer);
      const fileUri = `${FileSystem.cacheDirectory}healthnexus-medical-history-${profile.id}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "HealthNexus Medical History Report",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "PDF Download Failed",
        text2: err?.response?.data?.message || err?.message || "Unable to download PDF.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        await loadRecords();
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [loadRecords]);

  const handleCardPress = (record: MedicalHistoryResponse) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0A1E" />

      {}
      <LinearGradient
        colors={["#0F0A1E", "#1A1040"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.headerSub}>
            {records.length} visit{records.length !== 1 ? "s" : ""} found
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDownloadPdf}
          disabled={downloadingPdf}
          style={[styles.refreshHeaderBtn, { marginRight: 8 }]}
          accessibilityLabel="Download Medical History PDF"
        >
          {downloadingPdf ? (
            <ActivityIndicator size="small" color="#A78BFA" />
          ) : (
            <Ionicons name="document-text-outline" size={20} color="#A78BFA" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => loadRecords(true)}
          style={styles.refreshHeaderBtn}
          accessibilityLabel="Refresh history"
        >
          <Ionicons name="refresh-outline" size={20} color="#A78BFA" />
        </TouchableOpacity>
      </LinearGradient>

      {}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading your history…</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="medical-outline" size={52} color="#4B5563" />
          </View>
          <Text style={styles.emptyTitle}>No Medical History</Text>
          <Text style={styles.emptySubtitle}>
            Your completed doctor visits will appear here as a chronological timeline.
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => loadRecords()}
            accessibilityLabel="Retry loading history"
          >
            <Ionicons name="refresh" size={16} color="#6C63FF" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRecords(true)}
              tintColor="#6C63FF"
              colors={["#6C63FF"]}
            />
          }
          data={records}
          keyExtractor={(item) => item.visitId || item.appointmentId}
          renderItem={({ item }) => (
            <RecordCard record={item} onPress={() => handleCardPress(item)} />
          )}
        />
      )}

      {}
      <DetailModal
        record={selectedRecord}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onDownloadPdf={handleDownloadPdf}
      />

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F0A1E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "#A78BFA",
    marginTop: 1,
  },
  refreshHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(167,139,250,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(75,85,99,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(108,99,255,0.12)",
    borderWidth: 1,
    borderColor: "#6C63FF44",
  },
  refreshBtnText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "600",
  },

  listContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#1C1535",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#2D2550",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    paddingTop: 2,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6C63FF33",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardDiagnosis: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#F3F4F6",
  },
  dateBadge: {
    backgroundColor: "rgba(108,99,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6C63FF33",
  },
  dateBadgeText: {
    fontSize: 11,
    color: "#A78BFA",
    fontWeight: "600",
  },
  cardDoctor: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cardNotes: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  cardApptNum: {
    fontSize: 11,
    color: "#4B5563",
    fontStyle: "italic",
  },
  cardViewMore: {
    fontSize: 12,
    color: "#6C63FF",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#12102B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 18,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: "#1C1535",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2550",
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2D2550",
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(108,99,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    color: "#E5E7EB",
    fontWeight: "500",
  },
  infoValueMultiline: {
    lineHeight: 20,
  },
});
