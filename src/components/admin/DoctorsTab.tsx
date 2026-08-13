import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";
import { updateDoctorStatus } from "../../services/AdminService";
import { DoctorResponse, getAllDoctors } from "../../services/DoctorService";
import PrimaryButton from "../buttons/PrimaryButton";
import PaginationControls from "../ui/PaginationControls";
import SearchBar from "../ui/SearchBar";

export default function DoctorsTab() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [verifyLicense, setVerifyLicense] = useState(false);
  const [verifyDegree, setVerifyDegree] = useState(false);
  const [verifySpecialization, setVerifySpecialization] = useState(false);

  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctors(searchQuery, page);
  }, [page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchDoctors(searchQuery, 0);
      else setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchDoctors = async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      const data = await getAllDoctors(search, pageNum, 10);
      setDoctors(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.log("Error fetching doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const openVerifyModal = (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setStep(1);
    setVerifyLicense(false);
    setVerifyDegree(false);
    setVerifySpecialization(false);
    setNewStatus(doctor.status || "APPROVED");
    setShowModal(true);
  };

  const handleNextStep = () => {
    if (step === 1 && !verifyLicense) {
      Toast.show({ type: "error", text1: "Validation", text2: "Please verify the license to proceed." });
      return;
    }
    if (step === 2 && !verifyDegree) {
      Toast.show({ type: "error", text1: "Validation", text2: "Please verify the degree to proceed." });
      return;
    }
    if (step === 3 && !verifySpecialization) {
      Toast.show({ type: "error", text1: "Validation", text2: "Please verify specialization to proceed." });
      return;
    }
    setStep(step + 1);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDoctor) return;
    try {
      setSaving(true);
      await updateDoctorStatus(selectedDoctor.id, { status: newStatus });
      Toast.show({ type: "success", text1: "Status Updated", text2: `Doctor is now ${newStatus}` });
      setShowModal(false);
      fetchDoctors(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Approve Doctors</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search doctors by name or specialization..."
      />

      {loading && doctors.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : doctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No doctors found.</Text>
        </View>
      ) : (
        doctors.map(d => {
          const statusStyle = getStatusStyle(d.status || "PENDING");
          return (
            <View key={d.id} style={[styles.listItem, { borderLeftColor: AdminTheme.primary, borderLeftWidth: 4 }]}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{d.accountName || "Unknown Name"}</Text>
                <Text style={styles.listItemSubtitle}>{d.specialization || "No Specialization"}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{d.status || "PENDING"}</Text>
                  </View>
                  <Text style={styles.listItemBadge2}>{d.hospitalName || "No Hospital"}</Text>
                </View>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity onPress={() => openVerifyModal(d)} style={styles.verifyBtn}>
                  <Text style={styles.verifyBtnText}>Verify</Text>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!loading && doctors.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {step === 1 ? "Step 1: Verify License" :
                  step === 2 ? "Step 2: Verify Degree" :
                    step === 3 ? "Step 3: Check Specialization" : "Step 4: Final Status"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map(s => (
                <View key={s} style={styles.progressStep}>
                  <View style={[styles.progressCircle, step >= s && styles.progressCircleActive]}>
                    {step > s ? (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    ) : (
                      <Text style={[styles.progressStepText, step >= s && styles.progressStepTextActive]}>{s}</Text>
                    )}
                  </View>
                  {s < 4 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
                </View>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 500 }}>
              {selectedDoctor && (
                <View style={styles.detailsCard}>
                  <Text style={styles.detailText}>Name: {selectedDoctor.accountName}</Text>
                  {step === 1 && <Text style={styles.detailText}>License: {selectedDoctor.licenseNumber || "N/A"}</Text>}
                  {step === 2 && <Text style={styles.detailText}>Degree/Qual: {selectedDoctor.qualification || "N/A"}</Text>}
                  {step === 3 && <Text style={styles.detailText}>Specialization: {selectedDoctor.specialization || "N/A"}</Text>}
                </View>
              )}

              {step === 1 && (
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setVerifyLicense(!verifyLicense)}>
                  <Ionicons name={verifyLicense ? "checkbox" : "square-outline"} size={24} color={verifyLicense ? "#10B981" : "#94A3B8"} />
                  <Text style={styles.checkboxLabel}>I confirm the license is valid</Text>
                </TouchableOpacity>
              )}

              {step === 2 && (
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setVerifyDegree(!verifyDegree)}>
                  <Ionicons name={verifyDegree ? "checkbox" : "square-outline"} size={24} color={verifyDegree ? "#10B981" : "#94A3B8"} />
                  <Text style={styles.checkboxLabel}>I confirm the degree is verified</Text>
                </TouchableOpacity>
              )}

              {step === 3 && (
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setVerifySpecialization(!verifySpecialization)}>
                  <Ionicons name={verifySpecialization ? "checkbox" : "square-outline"} size={24} color={verifySpecialization ? "#10B981" : "#94A3B8"} />
                  <Text style={styles.checkboxLabel}>I confirm the specialization matches</Text>
                </TouchableOpacity>
              )}

              {step === 4 && (
                <View>
                  <Text style={styles.sectionLabel}>Select Status</Text>
                  <View style={styles.statusButtonsRow}>
                    <TouchableOpacity
                      style={[styles.bigActionBtn, newStatus === "ACTIVE" ? { backgroundColor: AdminTheme.success } : { backgroundColor: AdminTheme.surfaceAlt, borderWidth: 1, borderColor: AdminTheme.border }]}
                      onPress={() => setNewStatus("ACTIVE")}
                    >
                      <Ionicons name="checkmark-circle-outline" size={24} color={newStatus === "ACTIVE" ? "#FFF" : AdminTheme.success} />
                      <Text style={[styles.bigActionBtnText, { color: newStatus === "ACTIVE" ? "#FFF" : AdminTheme.textPrimary }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.bigActionBtn, newStatus === "SUSPENDED" ? { backgroundColor: AdminTheme.danger } : { backgroundColor: AdminTheme.surfaceAlt, borderWidth: 1, borderColor: AdminTheme.border }]}
                      onPress={() => setNewStatus("SUSPENDED")}
                    >
                      <Ionicons name="close-circle-outline" size={24} color={newStatus === "SUSPENDED" ? "#FFF" : AdminTheme.danger} />
                      <Text style={[styles.bigActionBtnText, { color: newStatus === "SUSPENDED" ? "#FFF" : AdminTheme.textPrimary }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.modalActionRow}>
                {step > 1 ? (
                  <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                {step < 4 ? (
                  <PrimaryButton title="Next" onPress={handleNextStep} style={{ paddingHorizontal: 20 }} />
                ) : (
                  <PrimaryButton title="Update Status" onPress={handleUpdateStatus} loading={saving} style={{ paddingHorizontal: 20 }} />
                )}
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  emptyState: { padding: 30, alignItems: "center", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 12 },
  emptyStateText: { color: "#64748B" },
  listItem: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  listItemSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 8 },
  listItemBadge: { fontSize: 10, backgroundColor: "#E0E7FF", color: "#4F46E5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold" },
  listItemBadge2: { fontSize: 10, backgroundColor: "#F3F4F6", color: "#4B5563", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold" },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  verifyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#10B981", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  verifyBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { backgroundColor: "#fff", width: "100%", maxWidth: 500, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "bold" },
  progressContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 10 },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: AdminTheme.border, justifyContent: "center", alignItems: "center", zIndex: 2 },
  progressCircleActive: { backgroundColor: AdminTheme.primary },
  progressStepText: { color: AdminTheme.textMuted, fontSize: 12, fontWeight: "bold" },
  progressStepTextActive: { color: "#FFF" },
  progressLine: { flex: 1, height: 4, backgroundColor: AdminTheme.border, marginHorizontal: -5, zIndex: 1 },
  progressLineActive: { backgroundColor: AdminTheme.primary },
  detailsCard: { backgroundColor: AdminTheme.surfaceAlt, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: AdminTheme.border },
  detailText: { fontSize: 14, color: AdminTheme.textPrimary, marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: "bold", color: AdminTheme.textPrimary, marginTop: 10, marginBottom: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 10, gap: 10, backgroundColor: AdminTheme.surfaceAlt, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: AdminTheme.border },
  checkboxLabel: { fontSize: 15, color: AdminTheme.textPrimary, fontWeight: "600" },
  statusButtonsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  bigActionBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  bigActionBtnText: { fontSize: 16, fontWeight: "bold" },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 20 },
  modalCancelBtn: { padding: 12 },
  modalCancelText: { color: "#64748B", fontWeight: "bold" },
});

