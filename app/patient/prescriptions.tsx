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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

import { getMyPatientProfile } from "../../src/services/PatientService";
import {
  getPatientPrescriptions,
  PrescriptionResponse,
} from "../../src/services/PrescriptionService";

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

interface DetailModalProps {
  prescription: PrescriptionResponse | null;
  visible: boolean;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  prescription,
  visible,
  onClose,
}) => {
  if (!prescription) return null;

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
                <Text style={styles.modalTitle}>Prescription</Text>
                <Text style={styles.modalSubtitle}>
                  {formatDate(prescription.prescriptionDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close Prescription Detail"
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
            <View style={styles.detailHeaderCard}>
              <View style={styles.detailHeaderRow}>
                <Ionicons name="person-outline" size={16} color="#6C63FF" />
                <Text style={styles.detailHeaderLabel}>Doctor:</Text>
                <Text style={styles.detailHeaderValue}>
                  {prescription.doctorName || "—"}
                </Text>
              </View>
              <View style={styles.detailHeaderRow}>
                <Ionicons name="calendar-outline" size={16} color="#6C63FF" />
                <Text style={styles.detailHeaderLabel}>Date:</Text>
                <Text style={styles.detailHeaderValue}>
                  {formatDate(prescription.prescriptionDate)}
                </Text>
              </View>
              {prescription.instructions ? (
                <View
                  style={[styles.detailHeaderRow, { alignItems: "flex-start" }]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#6C63FF"
                  />
                  <Text style={styles.detailHeaderLabel}>Notes:</Text>
                  <Text style={[styles.detailHeaderValue, { flex: 1 }]}>
                    {prescription.instructions}
                  </Text>
                </View>
              ) : null}
            </View>

            {}
            <Text style={styles.sectionLabel}>PRESCRIBED MEDICINES</Text>
            {prescription.medicines && prescription.medicines.length > 0 ? (
              <View style={styles.medicinesContainer}>
                {prescription.medicines.map((med, idx) => (
                  <View key={med.id || idx} style={styles.medicineCard}>
                    <View style={styles.medicineHeader}>
                      <View style={styles.medicineIcon}>
                        <Ionicons
                          name="flask-outline"
                          size={16}
                          color="#A78BFA"
                        />
                      </View>
                      <Text style={styles.medicineName}>
                        {med.medicineName}
                      </Text>
                    </View>
                    <View style={styles.medicineDetailsRow}>
                      <View style={styles.medicineDetailCol}>
                        <Text style={styles.medicineDetailLabel}>Dosage</Text>
                        <Text style={styles.medicineDetailValue}>
                          {med.dosage}
                        </Text>
                      </View>
                      <View style={styles.medicineDetailCol}>
                        <Text style={styles.medicineDetailLabel}>
                          Frequency
                        </Text>
                        <Text style={styles.medicineDetailValue}>
                          {med.frequency}
                        </Text>
                      </View>
                      <View style={styles.medicineDetailCol}>
                        <Text style={styles.medicineDetailLabel}>Duration</Text>
                        <Text style={styles.medicineDetailValue}>
                          {med.duration}
                        </Text>
                      </View>
                    </View>
                    {med.instructions ? (
                      <View style={styles.medicineInstructionRow}>
                        <Text style={styles.medicineInstructionText}>
                          Note: {med.instructions}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noMedicinesText}>No medicines listed.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface PrescriptionCardProps {
  prescription: PrescriptionResponse;
  onPress: () => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onPress,
}) => {
  const medicineCount = prescription.medicines?.length || 0;
  const firstMedicine =
    medicineCount > 0 ? prescription.medicines![0].medicineName : "";
  const remainingCount = medicineCount - 1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`View prescription from ${formatDate(
        prescription.prescriptionDate,
      )}`}
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
          <Text style={styles.cardDoctor} numberOfLines={1}>
            Dr. {prescription.doctorName || "—"}
          </Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              {formatDate(prescription.prescriptionDate)}
            </Text>
          </View>
        </View>

        <Text style={styles.cardSummary} numberOfLines={1}>
          {medicineCount > 0 ? (
            <>
              {firstMedicine}
              {remainingCount > 0 && ` + ${remainingCount} more`}
            </>
          ) : (
            "No medicines listed"
          )}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardMedicineCount}>
            <Ionicons name="flask-outline" size={12} color="#A78BFA" />{" "}
            {medicineCount} {medicineCount === 1 ? "Medicine" : "Medicines"}
          </Text>
          <Text style={styles.cardViewMore}>
            View <Ionicons name="chevron-forward" size={12} color="#6C63FF" />
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function PrescriptionsScreen() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadPrescriptions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const profile = await getMyPatientProfile();
      const data = await getPatientPrescriptions(profile.id);
      const owned = data.filter(
        (p: any) => !p.patientId || p.patientId === profile.id,
      );
      setPrescriptions(owned);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setPrescriptions([]);
      } else if (status === 403) {
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "You are not authorized to view these prescriptions.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to load prescriptions",
          text2: err?.message || "Please try again.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        await loadPrescriptions();
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [loadPrescriptions]);

  const handleCardPress = (prescription: PrescriptionResponse) => {
    setSelectedPrescription(prescription);
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
          <Text style={styles.headerTitle}>Prescriptions</Text>
          <Text style={styles.headerSub}>
            {prescriptions.length} prescription
            {prescriptions.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => loadPrescriptions(true)}
          style={styles.refreshHeaderBtn}
          accessibilityLabel="Refresh prescriptions"
        >
          <Ionicons name="refresh-outline" size={20} color="#A78BFA" />
        </TouchableOpacity>
      </LinearGradient>

      {}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading prescriptions…</Text>
        </View>
      ) : prescriptions.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="medical-outline" size={48} color="#4B5563" />
          </View>
          <Text style={styles.emptyTitle}>No Prescriptions</Text>
          <Text style={styles.emptySubtitle}>
            Your prescriptions will appear here once a doctor prescribes
            medicines for you.
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => loadPrescriptions()}
            accessibilityLabel="Retry loading prescriptions"
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
              onRefresh={() => loadPrescriptions(true)}
              tintColor="#6C63FF"
              colors={["#6C63FF"]}
            />
          }
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PrescriptionCard
              prescription={item}
              onPress={() => handleCardPress(item)}
            />
          )}
        />
      )}

      {}
      <DetailModal
        prescription={selectedPrescription}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  cardDoctor: {
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
  cardSummary: {
    fontSize: 13,
    color: "#D1D5DB",
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardMedicineCount: {
    fontSize: 12,
    color: "#9CA3AF",
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
    paddingTop: 16,
  },

  detailHeaderCard: {
    backgroundColor: "rgba(108,99,255,0.08)",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.15)",
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailHeaderLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    width: 50,
  },
  detailHeaderValue: {
    fontSize: 14,
    color: "#E5E7EB",
    fontWeight: "500",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 24,
  },
  medicinesContainer: {
    gap: 12,
  },
  medicineCard: {
    backgroundColor: "#1C1535",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D2550",
  },
  medicineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  medicineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(167,139,250,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F3F4F6",
    flex: 1,
  },
  medicineDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 8,
    padding: 10,
  },
  medicineDetailCol: {
    alignItems: "center",
    flex: 1,
  },
  medicineDetailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  medicineDetailValue: {
    fontSize: 13,
    color: "#E5E7EB",
    fontWeight: "600",
  },
  medicineInstructionRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D2550",
  },
  medicineInstructionText: {
    fontSize: 13,
    color: "#A78BFA",
    fontStyle: "italic",
    lineHeight: 18,
  },
  noMedicinesText: {
    color: "#6B7280",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
});
