import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getAllHospitals, HospitalResponse, createHospital, updateHospital, deleteHospital } from "../../services/HospitalService";
import { updateHospitalStatus } from "../../services/AdminService";
import PrimaryButton from "../buttons/PrimaryButton";
import CustomInput from "../inputs/CustomInput";
import { Picker } from "@react-native-picker/picker";

import SearchBar from "../ui/SearchBar";
import PaginationControls from "../ui/PaginationControls";
import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";

export default function HospitalsTab() {
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Manage Hospital Modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [hId, setHId] = useState("");
  const [hName, setHName] = useState("");
  const [hEmail, setHEmail] = useState("");
  const [hPhone, setHPhone] = useState("");
  const [hAddress, setHAddress] = useState("");
  const [hCity, setHCity] = useState("");
  const [hState, setHState] = useState("");
  const [hPin, setHPin] = useState("");
  const [hType, setHType] = useState("GENERAL");
  const [hRegNo, setHRegNo] = useState("");
  const [saving, setSaving] = useState(false);

  // Verify Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalResponse | null>(null);
  const [verifyDetails, setVerifyDetails] = useState(false);
  const [verifyLocation, setVerifyLocation] = useState(false);
  const [newStatus, setNewStatus] = useState("ACTIVE");

  useEffect(() => {
    fetchHospitals(searchQuery, page);
  }, [page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchHospitals(searchQuery, 0);
      else setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchHospitals = async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      const data = await getAllHospitals(search, pageNum, 10);
      setHospitals(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.log("Error fetching hospitals", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setHId(""); setHName(""); setHEmail(""); setHPhone(""); setHAddress("");
    setHCity(""); setHState(""); setHPin(""); setHRegNo(""); setHType("GENERAL");
    setShowManageModal(true);
  };

  const openEdit = (h: HospitalResponse) => {
    setHId(h.id); setHName(h.hospitalName || ""); setHEmail(h.email || ""); setHPhone(h.phoneNumber || "");
    setHAddress(h.address || ""); setHCity(h.city || ""); setHState(h.state || "");
    setHPin(h.postalCode || ""); setHRegNo(h.registrationNumber || ""); setHType(h.hospitalType || "GENERAL");
    setShowManageModal(true);
  };

  const openVerify = (h: HospitalResponse) => {
    setSelectedHospital(h);
    setVerifyDetails(false);
    setVerifyLocation(false);
    setNewStatus(h.status || "APPROVED");
    setShowVerifyModal(true);
  };

  const handleSaveHospital = async () => {
    if (!hName || !hEmail || !hPhone || !hAddress || !hCity || !hState || !hPin || !hRegNo) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "All fields are required" });
      return;
    }
    try {
      setSaving(true);
      const data = {
        hospitalName: hName, email: hEmail, phoneNumber: hPhone,
        address: hAddress, city: hCity, state: hState,
        postalCode: hPin, hospitalType: hType, registrationNumber: hRegNo
      };
      if (hId) {
        await updateHospital(hId, data);
        Toast.show({ type: "success", text1: "Hospital Updated" });
      } else {
        await createHospital(data);
        Toast.show({ type: "success", text1: "Hospital Created" });
      }
      setShowManageModal(false);
      fetchHospitals();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedHospital) return;
    if (newStatus === "APPROVED" && (!verifyDetails || !verifyLocation)) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "All checks must be verified to approve." });
      return;
    }
    try {
      setSaving(true);
      await updateHospitalStatus(selectedHospital.id, { status: newStatus });
      Toast.show({ type: "success", text1: "Status Updated", text2: `Hospital is now ${newStatus}` });
      setShowVerifyModal(false);
      fetchHospitals(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHospital(id);
      Toast.show({ type: "success", text1: "Hospital Deleted" });
      fetchHospitals();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manage Clinics</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add Clinic</Text>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Search clinics by name, city, or state..."
      />

      {loading && hospitals.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : hospitals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No clinics found.</Text>
        </View>
      ) : (
        hospitals.map(h => {
          const statusStyle = getStatusStyle(h.status || "PENDING");
          return (
            <View key={h.id} style={[styles.listItem, { borderLeftColor: AdminTheme.success, borderLeftWidth: 4 }]}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{h.hospitalName}</Text>
                <Text style={styles.listItemSubtitle}>{h.city}, {h.state}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.listItemBadge2}>{h.hospitalType}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{h.status || "PENDING"}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity onPress={() => openVerify(h)} style={styles.verifyBtn}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(h)} style={styles.iconBtn}>
                  <Ionicons name="create-outline" size={20} color={AdminTheme.info} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(h.id)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color={AdminTheme.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!loading && hospitals.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      )}

      {/* VERIFY MODAL */}
      <Modal visible={showVerifyModal} transparent animationType="slide" onRequestClose={() => setShowVerifyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Verify Clinic</Text>
              <TouchableOpacity onPress={() => setShowVerifyModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 500 }}>
              {selectedHospital && (
                <View style={styles.detailsCard}>
                  <Text style={styles.detailText}>Name: {selectedHospital.hospitalName}</Text>
                  <Text style={styles.detailText}>Reg No: {selectedHospital.registrationNumber || "N/A"}</Text>
                  <Text style={styles.detailText}>Address: {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}</Text>
                  <Text style={styles.detailText}>Type: {selectedHospital.hospitalType || "GENERAL"}</Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>Verification Checklist</Text>
              
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setVerifyDetails(!verifyDetails)}>
                <Ionicons name={verifyDetails ? "checkbox" : "square-outline"} size={24} color={verifyDetails ? "#10B981" : "#94A3B8"} />
                <Text style={styles.checkboxLabel}>Verify Clinic Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setVerifyLocation(!verifyLocation)}>
                <Ionicons name={verifyLocation ? "checkbox" : "square-outline"} size={24} color={verifyLocation ? "#10B981" : "#94A3B8"} />
                <Text style={styles.checkboxLabel}>Check Location</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>Final Status</Text>
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

              <View style={styles.modalActionRow}>
                <TouchableOpacity onPress={() => setShowVerifyModal(false)} style={styles.modalCancelBtn}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <PrimaryButton title="Update Status" onPress={handleUpdateStatus} loading={saving} style={{ paddingHorizontal: 20 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MANAGE MODAL */}
      <Modal visible={showManageModal} transparent animationType="slide" onRequestClose={() => setShowManageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{hId ? "Edit Clinic" : "Add Clinic"}</Text>
              <TouchableOpacity onPress={() => setShowManageModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 500, marginTop: 10 }}>
              <CustomInput label="Hospital Name" value={hName} onChangeText={setHName} />
              <CustomInput label="Email" value={hEmail} onChangeText={setHEmail} />
              <CustomInput label="Phone Number" value={hPhone} onChangeText={setHPhone} />
              <CustomInput label="Address" value={hAddress} onChangeText={setHAddress} />
              <CustomInput label="City" value={hCity} onChangeText={setHCity} />
              <CustomInput label="State" value={hState} onChangeText={setHState} />
              <CustomInput label="PIN Code" value={hPin} onChangeText={setHPin} />
              <CustomInput label="Registration Number" value={hRegNo} onChangeText={setHRegNo} maxLength={20} />
              
              <Text style={styles.label}>Hospital Type</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={hType} onValueChange={setHType} style={styles.picker as any}>
                  <Picker.Item label="GENERAL" value="GENERAL" />
                  <Picker.Item label="SPECIALTY" value="SPECIALTY" />
                </Picker>

              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity onPress={() => setShowManageModal(false)} style={styles.modalCancelBtn}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <PrimaryButton title="Save" onPress={handleSaveHospital} loading={saving} style={{ paddingHorizontal: 30 }} />
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
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#8B5CF6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  emptyState: { padding: 30, alignItems: "center", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 12 },
  emptyStateText: { color: "#64748B" },
  listItem: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  listItemSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 8 },
  listItemBadge: { fontSize: 10, backgroundColor: "#E0E7FF", color: "#4F46E5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold" },
  listItemBadge2: { fontSize: 10, backgroundColor: "#F3F4F6", color: "#4B5563", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "bold" },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  verifyBtn: { padding: 8, backgroundColor: "#10B981", borderRadius: 8 },
  iconBtn: { padding: 8, backgroundColor: "#F8FAFC", borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { backgroundColor: "#fff", width: "100%", maxWidth: 500, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "bold" },
  detailsCard: { backgroundColor: AdminTheme.surfaceAlt, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: AdminTheme.border },
  detailText: { fontSize: 14, color: AdminTheme.textPrimary, marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: "bold", color: AdminTheme.textPrimary, marginTop: 10, marginBottom: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10, backgroundColor: AdminTheme.surfaceAlt, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: AdminTheme.border },
  checkboxLabel: { fontSize: 15, color: AdminTheme.textPrimary, fontWeight: "600" },
  statusButtonsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  bigActionBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  bigActionBtnText: { fontSize: 16, fontWeight: "bold" },
  pickerContainer: { backgroundColor: "#F1F5F9", borderRadius: 12, overflow: "hidden", marginBottom: 15, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  picker: { height: 50, color: "#1E293B", borderWidth: 0, outlineStyle: "none" as any },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 20 },
  modalCancelBtn: { padding: 12 },
  modalCancelText: { color: "#64748B", fontWeight: "bold" },
  label: { fontSize: 14, color: "#64748B", fontWeight: "600", marginBottom: 6, marginTop: 10 },
});
