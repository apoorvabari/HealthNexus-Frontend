import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  createDepartment,
  deleteDepartment,
  DepartmentAnalyticsResponse,
  DepartmentDoctorResponse,
  DepartmentResponse,
  getAllDepartments,
  getDepartmentAnalytics,
  getDoctorsByDepartment,
  updateDepartment,
} from "../../services/DepartmentService";
import {
  getAllHospitals,
  HospitalResponse,
} from "../../services/HospitalService";
import PrimaryButton from "../buttons/PrimaryButton";
import CustomInput from "../inputs/CustomInput";

import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";
import PaginationControls from "../ui/PaginationControls";
import SearchBar from "../ui/SearchBar";

export default function DepartmentsTab() {
  // =========================================================
  // DEPARTMENT DATA
  // =========================================================

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  // =========================================================
  // DEPARTMENT PAGINATION + SEARCH
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // =========================================================
  // DOCTORS MODAL
  // =========================================================

  const [showDoctorsModal, setShowDoctorsModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentResponse | null>(null);

  const [doctors, setDoctors] = useState<DepartmentDoctorResponse[]>([]);
  const [doctorPage, setDoctorPage] = useState(0);
  const [doctorTotalPages, setDoctorTotalPages] = useState(0);
  const [doctorTotalElements, setDoctorTotalElements] = useState(0);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // =========================================================
  // ANALYTICS MODAL
  // =========================================================

  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const [departmentAnalytics, setDepartmentAnalytics] =
    useState<DepartmentAnalyticsResponse | null>(null);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // =========================================================
  // ADD / EDIT DEPARTMENT MODAL
  // =========================================================

  const [showModal, setShowModal] = useState(false);

  const [dId, setDId] = useState("");
  const [dHospitalId, setDHospitalId] = useState("");
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dDesc, setDDesc] = useState("");

  // =========================================================
  // INITIAL / PAGE LOAD
  // =========================================================

  useEffect(() => {
    fetchData(searchQuery, page);
  }, [page]);

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) {
        fetchData(searchQuery, 0);
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // =========================================================
  // FETCH DEPARTMENTS + HOSPITALS
  // =========================================================

  const fetchData = async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      setError(false);

      const [deptData, hospData] = await Promise.all([
        getAllDepartments(search, pageNum, 10),
        getAllHospitals("", 0, 1000),
      ]);

      setDepartments(deptData.content);
      setTotalPages(deptData.totalPages);
      setTotalElements(deptData.totalElements);

      const hospitalList = hospData.content || hospData;

      setHospitals(hospitalList as HospitalResponse[]);

      if (
        hospitalList.length > 0 &&
        !dHospitalId
      ) {
        setDHospitalId(hospitalList[0].id);
      }
    } catch (err) {
      console.log("Error fetching department data", err);
      setError(true);

      Toast.show({
        type: "error",
        text1: "Failed to Load Data",
        text2: "Unable to fetch departments or hospitals.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ADD DEPARTMENT
  // =========================================================

  const openAdd = () => {
    setDId("");
    setDCode("");
    setDName("");
    setDDesc("");

    if (hospitals.length > 0) {
      setDHospitalId(hospitals[0].id);
    } else {
      setDHospitalId("");
    }

    setShowModal(true);
  };

  // =========================================================
  // EDIT DEPARTMENT
  // =========================================================

  const openEdit = (department: DepartmentResponse) => {
    setDId(department.id);
    setDHospitalId(department.hospitalId || "");
    setDCode(department.departmentCode || "");
    setDName(department.departmentName || "");
    setDDesc(department.description || "");

    setShowModal(true);
  };

  // =========================================================
  // SAVE DEPARTMENT
  // =========================================================

  const handleSave = async () => {
    if (!dHospitalId || !dCode.trim() || !dName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Hospital, Code and Name are required",
      });

      return;
    }

    try {
      setSaving(true);

      const data = {
        hospitalId: dHospitalId,
        departmentCode: dCode.trim(),
        departmentName: dName.trim(),
        description: dDesc.trim(),
      };

      if (dId) {
        await updateDepartment(dId, data);

        Toast.show({
          type: "success",
          text1: "Department Updated",
          text2: "Department updated successfully.",
        });
      } else {
        await createDepartment(data);

        Toast.show({
          type: "success",
          text1: "Department Created",
          text2: "Department created successfully.",
        });
      }

      setShowModal(false);

      await fetchData(searchQuery, page);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save department.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE / DEACTIVATE DEPARTMENT
  // =========================================================

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);

      Toast.show({
        type: "success",
        text1: "Department Deleted",
        text2: "Department deactivated successfully.",
      });

      await fetchData(searchQuery, page);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to delete department.",
      });
    }
  };

  // =========================================================
  // OPEN DOCTORS MODAL
  // =========================================================

  const openDoctors = async (department: DepartmentResponse) => {
    try {
      setSelectedDepartment(department);
      setDoctors([]);
      setDoctorPage(0);
      setDoctorTotalPages(0);
      setDoctorTotalElements(0);

      setShowDoctorsModal(true);
      setDoctorsLoading(true);

      const data = await getDoctorsByDepartment(
        department.id,
        0,
        10
      );

      setDoctors(data.content);
      setDoctorPage(data.pageNumber);
      setDoctorTotalPages(data.totalPages);
      setDoctorTotalElements(data.totalElements);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Load Doctors",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch doctors.",
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  // =========================================================
  // DOCTOR PAGINATION
  // =========================================================

  const loadDoctorPage = async (newPage: number) => {
    if (!selectedDepartment) {
      return;
    }

    try {
      setDoctorsLoading(true);

      const data = await getDoctorsByDepartment(
        selectedDepartment.id,
        newPage,
        10
      );

      setDoctors(data.content);
      setDoctorPage(data.pageNumber);
      setDoctorTotalPages(data.totalPages);
      setDoctorTotalElements(data.totalElements);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Load Doctors",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch doctors.",
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  // =========================================================
  // OPEN ANALYTICS MODAL
  // =========================================================

  const openAnalytics = async (department: DepartmentResponse) => {
    try {
      setSelectedDepartment(department);
      setDepartmentAnalytics(null);

      setShowAnalyticsModal(true);
      setAnalyticsLoading(true);

      const data = await getDepartmentAnalytics(department.id);

      setDepartmentAnalytics(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Load Analytics",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch department analytics.",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // =========================================================
  // CLOSE DOCTORS MODAL
  // =========================================================

  const closeDoctorsModal = () => {
    setShowDoctorsModal(false);
    setDoctors([]);
    setSelectedDepartment(null);
  };

  // =========================================================
  // CLOSE ANALYTICS MODAL
  // =========================================================

  const closeAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setDepartmentAnalytics(null);
    setSelectedDepartment(null);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <View style={styles.container}>

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Manage Departments
        </Text>

        <TouchableOpacity
          onPress={openAdd}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>
            Add Dept
          </Text>

          <Ionicons
            name="add"
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search departments..."
      />

      {/* =====================================================
          DEPARTMENT LIST
      ===================================================== */}

      {loading && departments.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={AdminTheme.primary}
          />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{color: AdminTheme.danger, marginBottom: 12}}>Failed to load departments</Text>
          <TouchableOpacity onPress={() => fetchData(searchQuery, page)} style={{backgroundColor: AdminTheme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8}}>
            <Text style={{color: "#FFF", fontWeight: "600"}}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : departments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No departments found.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 16, paddingBottom: 16 }}>
          {departments.map((department) => {
            const hospital = hospitals.find((h) => h.id === department.hospitalId);
            return (
              <View key={department.id} style={[styles.verticalCard, { borderTopColor: AdminTheme.primary, borderTopWidth: 4 }]}>
                <View style={styles.verticalCardContent}>
                  <Text style={styles.tableRowTitle} numberOfLines={1}>{department.departmentName}</Text>
                  <Text style={styles.tableRowSubtitle} numberOfLines={1}>Department Code: {department.departmentCode}</Text>
                  <Text style={styles.tableRowSubtitle} numberOfLines={1}>Hospital: {hospital?.hospitalName || "Unknown"}</Text>
                  
                  {department.description ? (
                    <Text style={[styles.tableRowSubtitle, { fontStyle: "italic", marginTop: 4 }]} numberOfLines={2}>
                      {department.description}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.verticalCardActions}>
                  <TouchableOpacity onPress={() => openDoctors(department)} style={styles.cardActionBtn}>
                    <Ionicons name="people-outline" size={16} color={AdminTheme.primary} />
                    <Text style={{color: AdminTheme.primary, fontSize: 13, fontWeight: "600"}}>Doctors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openAnalytics(department)} style={styles.cardActionBtn}>
                    <Ionicons name="stats-chart-outline" size={16} color={AdminTheme.info} />
                    <Text style={{color: AdminTheme.info, fontSize: 13, fontWeight: "600"}}>Stats</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openEdit(department)} style={styles.cardActionBtn}>
                    <Ionicons name="create-outline" size={16} color={AdminTheme.info} />
                    <Text style={{color: AdminTheme.info, fontSize: 13, fontWeight: "600"}}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(department.id)} style={styles.cardActionBtn}>
                    <Ionicons name="trash-outline" size={16} color={AdminTheme.danger} />
                    <Text style={{color: AdminTheme.danger, fontSize: 13, fontWeight: "600"}}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* =====================================================
          DEPARTMENT PAGINATION
      ===================================================== */}

      {!loading && departments.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      )}

      {/* =====================================================
          ADD / EDIT DEPARTMENT MODAL
          IMPORTANT: THIS MODAL IS INDEPENDENT
      ===================================================== */}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {dId
                  ? "Edit Department"
                  : "Add Department"}
              </Text>

              <TouchableOpacity
                onPress={() => setShowModal(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{
                maxHeight: 400,
                marginTop: 10,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>
                Select Hospital
              </Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dHospitalId}
                  onValueChange={setDHospitalId}
                  style={styles.picker as any}
                >
                  {hospitals.map((hospital) => (
                    <Picker.Item
                      key={hospital.id}
                      label={hospital.hospitalName}
                      value={hospital.id}
                    />
                  ))}
                </Picker>
              </View>

              <CustomInput
                label="Department Code"
                value={dCode}
                onChangeText={setDCode}
              />

              <CustomInput
                label="Department Name"
                value={dName}
                onChangeText={setDName}
              />

              <CustomInput
                label="Description"
                value={dDesc}
                onChangeText={setDDesc}
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <PrimaryButton
                  title="Save"
                  onPress={handleSave}
                  loading={saving}
                  style={{
                    paddingHorizontal: 30,
                  }}
                />
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* =====================================================
          DOCTORS MODAL
          IMPORTANT: SIBLING OF DEPARTMENT MODAL
      ===================================================== */}

      <Modal
        visible={showDoctorsModal}
        transparent
        animationType="slide"
        onRequestClose={closeDoctorsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeaderRow}>

              <View>
                <Text style={styles.modalTitle}>
                  Doctors
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectedDepartment?.departmentName ||
                    "Department"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeDoctorsModal}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>

            </View>

            {doctorsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator
                  size="large"
                  color={AdminTheme.primary}
                />
              </View>
            ) : doctors.length === 0 ? (
              <View style={styles.emptyState}>

                <Ionicons
                  name="people-outline"
                  size={40}
                  color={AdminTheme.textSecondary}
                />

                <Text style={styles.emptyStateText}>
                  No doctors assigned to this department.
                </Text>

              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
              >
                {doctors.map((doctor) => (
                  <View
                    key={doctor.id}
                    style={styles.doctorCard}
                  >
                    <View style={styles.doctorInfo}>

                      <Text style={styles.doctorName}>
                        {doctor.accountName || "Doctor"}
                      </Text>

                      <Text style={styles.doctorDetail}>
                        Specialization:{" "}
                        {doctor.specialization || "N/A"}
                      </Text>

                      <Text style={styles.doctorDetail}>
                        Qualification:{" "}
                        {doctor.qualification || "N/A"}
                      </Text>

                      <Text style={styles.doctorDetail}>
                        Experience:{" "}
                        {doctor.experience ?? 0} years
                      </Text>

                      <Text style={styles.doctorDetail}>
                        License:{" "}
                        {doctor.licenseNumber || "N/A"}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {doctor.status || "N/A"}
                          </Text>
                        </View>

                        {(() => {
                          const vStatus = doctor.verificationStatus || "PENDING";
                          const vStyle = getStatusStyle(vStatus);
                          return (
                            <View style={[styles.statusBadge, { backgroundColor: vStyle.bg }]}>
                              <Text style={[styles.statusText, { color: vStyle.text }]}>
                                {vStatus}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>

                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Doctor Pagination */}

            {!doctorsLoading &&
              doctors.length > 0 && (
                <PaginationControls
                  currentPage={doctorPage}
                  totalPages={doctorTotalPages}
                  totalElements={doctorTotalElements}
                  onPageChange={loadDoctorPage}
                />
              )}

          </View>
        </View>
      </Modal>

      {/* =====================================================
          ANALYTICS MODAL
          IMPORTANT: SIBLING OF OTHER MODALS
      ===================================================== */}

      <Modal
        visible={showAnalyticsModal}
        transparent
        animationType="slide"
        onRequestClose={closeAnalyticsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeaderRow}>

              <View>
                <Text style={styles.modalTitle}>
                  Department Analytics
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectedDepartment?.departmentName ||
                    "Department"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeAnalyticsModal}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>

            </View>

            {analyticsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator
                  size="large"
                  color={AdminTheme.primary}
                />
              </View>
            ) : departmentAnalytics ? (
              <View style={styles.analyticsGrid}>

                {/* Total Doctors */}

                <View style={styles.analyticsCard}>
                  <Ionicons
                    name="people-outline"
                    size={28}
                    color={AdminTheme.primary}
                  />

                  <Text style={styles.analyticsValue}>
                    {departmentAnalytics.totalDoctors}
                  </Text>

                  <Text style={styles.analyticsLabel}>
                    Total Doctors
                  </Text>
                </View>

                {/* Active Doctors */}

                <View style={styles.analyticsCard}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={28}
                    color={AdminTheme.success}
                  />

                  <Text style={styles.analyticsValue}>
                    {departmentAnalytics.activeDoctors}
                  </Text>

                  <Text style={styles.analyticsLabel}>
                    Active Doctors
                  </Text>
                </View>

                {/* Inactive Doctors */}

                <View style={styles.analyticsCard}>
                  <Ionicons
                    name="pause-circle-outline"
                    size={28}
                    color={AdminTheme.warning}
                  />

                  <Text style={styles.analyticsValue}>
                    {departmentAnalytics.inactiveDoctors}
                  </Text>

                  <Text style={styles.analyticsLabel}>
                    Inactive Doctors
                  </Text>
                </View>

                {/* Suspended Doctors */}

                <View style={styles.analyticsCard}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={28}
                    color={AdminTheme.danger}
                  />

                  <Text style={styles.analyticsValue}>
                    {departmentAnalytics.suspendedDoctors}
                  </Text>

                  <Text style={styles.analyticsLabel}>
                    Suspended Doctors
                  </Text>
                </View>

              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Analytics unavailable.
                </Text>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AdminTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },

  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor: AdminTheme.surfaceAlt,
    borderRadius: 12,
  },

  emptyStateText: {
    color: AdminTheme.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },

  verticalCard: { backgroundColor: AdminTheme.surface, width: "100%", padding: 16, borderRadius: AdminTheme.borderRadius.xl, ...AdminTheme.shadows.medium, marginBottom: 16 },
  verticalCardContent: { flex: 1 },
  tableRowTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  tableRowSubtitle: { fontSize: 13, color: AdminTheme.textSecondary },
  verticalCardActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: AdminTheme.border },
  cardActionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, backgroundColor: AdminTheme.surfaceAlt, paddingHorizontal: 12, borderRadius: 8 },

  hospitalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AdminTheme.borderRadius.pill,
  },

  hospitalStatusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  listItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBtn: {
    padding: 8,
    backgroundColor: AdminTheme.surfaceAlt,
    borderRadius: 8,
  },

  label: {
    fontSize: 14,
    color: AdminTheme.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  pickerContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: AdminTheme.border,
  },

  picker: {
    height: 50,
    color: AdminTheme.textPrimary,
    borderWidth: 0,
    outlineStyle: "none" as any,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: AdminTheme.surface,
    width: "100%",
    maxWidth: 500,
    borderRadius: AdminTheme.borderRadius.xl,
    padding: 24,
    ...AdminTheme.shadows.medium,
  },

  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
  },

  modalSubtitle: {
    fontSize: 13,
    color: AdminTheme.textSecondary,
    marginTop: 2,
  },

  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },

  modalCancelBtn: {
    padding: 12,
  },

  modalCancelText: {
    color: AdminTheme.textSecondary,
    fontWeight: "bold",
  },

  doctorCard: {
    backgroundColor: AdminTheme.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AdminTheme.border,
  },

  doctorInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
    marginBottom: 6,
  },

  doctorDetail: {
    fontSize: 13,
    color: AdminTheme.textSecondary,
    marginBottom: 3,
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: AdminTheme.surface,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
  },

  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  analyticsCard: {
    width: "48%",
    backgroundColor: AdminTheme.surfaceAlt,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AdminTheme.border,
  },

  analyticsValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
    marginTop: 8,
  },

  analyticsLabel: {
    fontSize: 12,
    color: AdminTheme.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
});