import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, TextInput, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getAllHospitals, HospitalResponse, createHospital, updateHospital, deleteHospital } from "../../services/HospitalService";
import {
  updateHospitalVerification,
  HospitalVerificationStatus,
} from "../../services/AdminService";
import PrimaryButton from "../buttons/PrimaryButton";
import CustomInput from "../inputs/CustomInput";
import { Picker } from "@react-native-picker/picker";

import SearchBar from "../ui/SearchBar";
import PaginationControls from "../ui/PaginationControls";
import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";

export default function HospitalsTab() {
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const [verificationStatus, setVerificationStatus] =
    useState<HospitalVerificationStatus>("PENDING");

  const [verificationRemarks, setVerificationRemarks] =
    useState("");

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
      setError(false);
      const data = await getAllHospitals(search, pageNum, 10);
      setHospitals(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.log("Error fetching hospitals", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setHId(""); setHName(""); setHEmail(""); setHPhone(""); setHAddress("");
    setHCity(""); setHState(""); setHPin(""); setHRegNo(""); setHType("CLINIC");
    setShowManageModal(true);
  };

  const openEdit = (h: HospitalResponse) => {
    setHId(h.id); setHName(h.hospitalName || ""); setHEmail(h.email || ""); setHPhone(h.phoneNumber || "");
    setHAddress(h.address || ""); setHCity(h.city || ""); setHState(h.state || "");
    setHPin(h.postalCode || ""); setHRegNo(h.registrationNumber || ""); setHType(h.hospitalType || "CLINIC");
    setShowManageModal(true);
  };

  const openVerify = (h: HospitalResponse) => {
    setSelectedHospital(h);

    setVerifyDetails(
      h.detailsVerified ?? false
    );

    setVerifyLocation(
      h.locationVerified ?? false
    );

    setVerificationStatus(
      h.verificationStatus || "PENDING"
    );

    setVerificationRemarks(
      h.verificationRemarks || ""
    );

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
      fetchHospitals(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVerification = async () => {
    if (!selectedHospital) {
      return;
    }

    if (
      verificationStatus === "APPROVED" &&
      (!verifyDetails || !verifyLocation)
    ) {
      Toast.show({
        type: "error",
        text1: "Cannot Approve Hospital",
        text2:
          "Hospital details and location must both be verified.",
      });

      return;
    }

    if (
      verificationStatus === "REJECTED" &&
      !verificationRemarks.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Rejection Reason Required",
        text2:
          "Please provide a reason for rejecting the hospital.",
      });

      return;
    }

    try {
      setSaving(true);

      await updateHospitalVerification(
        selectedHospital.id,
        {
          verificationStatus,

          detailsVerified: verifyDetails,

          locationVerified: verifyLocation,

          verificationRemarks:
            verificationRemarks.trim() || undefined,
        }
      );

      Toast.show({
        type: "success",
        text1: "Verification Updated",
        text2:
          verificationStatus === "APPROVED"
            ? "Hospital approved successfully."
            : verificationStatus === "REJECTED"
              ? "Hospital rejected successfully."
              : "Verification progress saved.",
      });

      setShowVerifyModal(false);

      await fetchHospitals(
        searchQuery,
        page
      );

    } catch (err: any) {

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to update hospital verification.",
      });

    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHospital(id);
      Toast.show({ type: "success", text1: "Hospital Deleted" });
      fetchHospitals(searchQuery, page);
    } catch (err: any) {
      Toast.show({
        type: "error", text1: "Delete Failed", text2: err?.response?.data?.message || err?.message || "Unable to delete hospital",
      });
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manage Hospitals</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add Hospital</Text>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search hospitals by name, city, or state..."
      />

      {loading && hospitals.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: AdminTheme.danger, marginBottom: 12 }}>Failed to load hospitals</Text>
          <TouchableOpacity onPress={() => fetchHospitals(searchQuery, page)} style={{ backgroundColor: AdminTheme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : hospitals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hospitals found.</Text>
        </View>
      ) : (
        <View>
          <View style={{ gap: 16, paddingBottom: 16 }}>
            {hospitals.map((h, index) => {
              const statusStyle = getStatusStyle(h.verificationStatus || "PENDING");
              return (
                <View key={h.id} style={[styles.verticalCard, { borderTopColor: statusStyle.bg, borderTopWidth: 4 }]}>
                  <View style={styles.horizontalCardContent}>
                    <Text style={styles.tableRowTitle} numberOfLines={1}>{h.hospitalName}</Text>
                    <Text style={styles.tableRowSubtitle} numberOfLines={1}>{h.city}, {h.state}</Text>
                  </View>

                  <View style={{ marginVertical: 12, gap: 8 }}>
                    <View style={styles.pillBadgeNeutral}>
                      <Text style={styles.pillBadgeNeutralText}>{h.hospitalType}</Text>
                    </View>
                    <View style={[styles.statusBadgeDot, { backgroundColor: statusStyle.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{h.verificationStatus || "PENDING"}</Text>
                    </View>
                  </View>

                  <View style={styles.horizontalCardActions}>
                    <TouchableOpacity onPress={() => openVerify(h)} style={styles.cardActionBtn}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={AdminTheme.success} />
                      <Text style={{ color: AdminTheme.success, fontSize: 13, fontWeight: "600" }}>Verify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEdit(h)} style={styles.cardActionBtn}>
                      <Ionicons name="create-outline" size={16} color={AdminTheme.info} />
                      <Text style={{ color: AdminTheme.info, fontSize: 13, fontWeight: "600" }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(h.id)} style={styles.cardActionBtn}>
                      <Ionicons name="trash-outline" size={16} color={AdminTheme.danger} />
                      <Text style={{ color: AdminTheme.danger, fontSize: 13, fontWeight: "600" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {!loading && hospitals.length > 0 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
            />
          )}
        </View>
      )}

      {/* VERIFY MODAL */}
      {/* VERIFY CLINIC MODAL */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Verify Clinic
              </Text>

              <TouchableOpacity
                onPress={() => setShowVerifyModal(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 550 }}
              showsVerticalScrollIndicator={false}
            >

              {/* CLINIC DETAILS */}
              {selectedHospital && (
                <View style={styles.detailsCard}>

                  <Text style={styles.detailTitle}>
                    Clinic Information
                  </Text>

                  <Text style={styles.detailText}>
                    Name: {selectedHospital.hospitalName}
                  </Text>

                  <Text style={styles.detailText}>
                    Registration No:{" "}
                    {selectedHospital.registrationNumber || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    Email:{" "}
                    {selectedHospital.email || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    Phone:{" "}
                    {selectedHospital.phoneNumber || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    Type:{" "}
                    {selectedHospital.hospitalType || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    Address:{" "}
                    {selectedHospital.address || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    City:{" "}
                    {selectedHospital.city || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    State:{" "}
                    {selectedHospital.state || "N/A"}
                  </Text>

                  <Text style={styles.detailText}>
                    PIN:{" "}
                    {selectedHospital.postalCode || "N/A"}
                  </Text>

                </View>
              )}

              {/* VERIFICATION CHECKLIST */}
              <Text style={styles.sectionLabel}>
                Verification Checklist
              </Text>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setVerifyDetails(!verifyDetails)
                }
              >
                <Ionicons
                  name={
                    verifyDetails
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={
                    verifyDetails
                      ? AdminTheme.success
                      : "#94A3B8"
                  }
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.checkboxLabel}>
                    Verify Hospital Details
                  </Text>

                  <Text style={styles.checkboxHint}>
                    Registration, contact and hospital information
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setVerifyLocation(!verifyLocation)
                }
              >
                <Ionicons
                  name={
                    verifyLocation
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={
                    verifyLocation
                      ? AdminTheme.success
                      : "#94A3B8"
                  }
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.checkboxLabel}>
                    Check Location
                  </Text>

                  <Text style={styles.checkboxHint}>
                    Verify hospital address and location
                  </Text>
                </View>
              </TouchableOpacity>

              {/* FINAL DECISION */}
              <Text style={styles.sectionLabel}>
                Final Decision
              </Text>

              <View style={styles.statusButtonsRow}>

                {/* APPROVE */}
                <TouchableOpacity
                  style={[
                    styles.bigActionBtn,
                    verificationStatus === "APPROVED"
                      ? {
                        backgroundColor:
                          AdminTheme.success,
                      }
                      : {
                        backgroundColor:
                          AdminTheme.surfaceAlt,
                        borderWidth: 1,
                        borderColor:
                          AdminTheme.border,
                      },
                  ]}
                  onPress={() =>
                    setVerificationStatus("APPROVED")
                  }
                >

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color={
                      verificationStatus === "APPROVED"
                        ? "#FFF"
                        : AdminTheme.success
                    }
                  />

                  <Text
                    style={[
                      styles.bigActionBtnText,
                      {
                        color:
                          verificationStatus === "APPROVED"
                            ? "#FFF"
                            : AdminTheme.textPrimary,
                      },
                    ]}
                  >
                    Approve
                  </Text>

                </TouchableOpacity>

                {/* REJECT */}
                <TouchableOpacity
                  style={[
                    styles.bigActionBtn,
                    verificationStatus === "REJECTED"
                      ? {
                        backgroundColor:
                          AdminTheme.danger,
                      }
                      : {
                        backgroundColor:
                          AdminTheme.surfaceAlt,
                        borderWidth: 1,
                        borderColor:
                          AdminTheme.border,
                      },
                  ]}
                  onPress={() =>
                    setVerificationStatus("REJECTED")
                  }
                >

                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color={
                      verificationStatus === "REJECTED"
                        ? "#FFF"
                        : AdminTheme.danger
                    }
                  />

                  <Text
                    style={[
                      styles.bigActionBtnText,
                      {
                        color:
                          verificationStatus === "REJECTED"
                            ? "#FFF"
                            : AdminTheme.textPrimary,
                      },
                    ]}
                  >
                    Reject
                  </Text>

                </TouchableOpacity>

              </View>

              {/* REMARKS */}
              <Text style={styles.sectionLabel}>
                Verification Remarks
              </Text>

              <TextInput
                value={verificationRemarks}
                onChangeText={setVerificationRemarks}
                placeholder={
                  verificationStatus === "REJECTED"
                    ? "Enter reason for rejection..."
                    : "Optional verification remarks..."
                }
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.remarksInput}
              />

              {/* SUMMARY */}
              <View style={styles.verificationSummaryCard}>

                <Text style={styles.summaryTitle}>
                  Verification Summary
                </Text>

                <Text style={styles.summaryItem}>
                  Hospital Details:{" "}
                  {verifyDetails
                    ? "Verified ✓"
                    : "Not Verified"}
                </Text>

                <Text style={styles.summaryItem}>
                  Location:{" "}
                  {verifyLocation
                    ? "Verified ✓"
                    : "Not Verified"}
                </Text>

                <Text style={styles.summaryItem}>
                  Decision:{" "}
                  {verificationStatus}
                </Text>

              </View>

              {/* ACTIONS */}
              <View style={styles.modalActionRow}>

                <TouchableOpacity
                  onPress={() =>
                    setShowVerifyModal(false)
                  }
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <PrimaryButton
                  title={
                    verificationStatus === "APPROVED"
                      ? "Approve Hospital"
                      : verificationStatus === "REJECTED"
                        ? "Reject Hospital"
                        : "Save Verification"
                  }
                  onPress={handleUpdateVerification}
                  loading={saving}
                  style={{
                    paddingHorizontal: 20,
                  }}
                />

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
              <Text style={styles.modalTitle}>{hId ? "Edit Hospital" : "Add Hospital"}</Text>
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
                  <Picker.Item
                    label="Government"
                    value="GOVERNMENT"
                  />

                  <Picker.Item
                    label="Private"
                    value="PRIVATE"
                  />

                  <Picker.Item
                    label="Trust"
                    value="TRUST"
                  />

                  <Picker.Item
                    label="Clinic"
                    value="CLINIC"
                  />
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
  verticalCard: { backgroundColor: AdminTheme.surface, width: "100%", padding: 16, borderRadius: AdminTheme.borderRadius.xl, ...AdminTheme.shadows.medium, marginBottom: 16 },
  horizontalCardContent: { flex: 1 },
  tableRowTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  tableRowSubtitle: { fontSize: 13, color: AdminTheme.textSecondary },
  pillBadgeNeutral: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: AdminTheme.borderRadius.pill, alignSelf: "flex-start" },
  pillBadgeNeutralText: { fontSize: 10, fontWeight: "bold", color: "#475569" },
  statusBadgeDot: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: AdminTheme.borderRadius.pill, alignSelf: "flex-start", gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  horizontalCardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: AdminTheme.border },
  cardActionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { backgroundColor: AdminTheme.surface, width: "100%", maxWidth: 500, borderRadius: AdminTheme.borderRadius.xl, padding: 24, ...AdminTheme.shadows.medium },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: AdminTheme.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: AdminTheme.borderRadius.pill },
  statusBadgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
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
  detailTitle: {
    fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 10,
  },

  checkboxHint: {
    fontSize: 12, color: AdminTheme.textSecondary, marginTop: 3,
  },

  remarksInput: {
    borderWidth: 1,
    borderColor: AdminTheme.border,
    backgroundColor: AdminTheme.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: AdminTheme.textPrimary,
    marginBottom: 15,
  },

  verificationSummaryCard: {
    backgroundColor: AdminTheme.primaryBg,
    borderWidth: 1,
    borderColor: AdminTheme.border,
    borderRadius: 12,
    padding: 15,
    marginTop: 5,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
    marginBottom: 8,
  },

  summaryItem: {
    fontSize: 13,
    color: AdminTheme.textSecondary,
    marginBottom: 5,
  },

});
