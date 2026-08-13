import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getAllDepartments, DepartmentResponse, createDepartment, updateDepartment, deleteDepartment } from "../../services/DepartmentService";
import { getAllHospitals, HospitalResponse } from "../../services/HospitalService";
import PrimaryButton from "../buttons/PrimaryButton";
import CustomInput from "../inputs/CustomInput";
import { Picker } from "@react-native-picker/picker";

import SearchBar from "../ui/SearchBar";
import PaginationControls from "../ui/PaginationControls";
import { AdminTheme } from "../../constants/adminTheme";

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [dId, setDId] = useState("");
  const [dHospitalId, setDHospitalId] = useState("");
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dDesc, setDDesc] = useState("");

  useEffect(() => {
    fetchData(searchQuery, page);
  }, [page]);

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
      const [deptData, hospData] = await Promise.all([
        getAllDepartments(search, pageNum, 10),
        getAllHospitals("", 0, 1000) // Need all hospitals for the dropdown
      ]);
      setDepartments(deptData.content);
      setTotalPages(deptData.totalPages);
      setTotalElements(deptData.totalElements);
      setHospitals(hospData.content || hospData as any);
      if ((hospData.content || hospData).length > 0 && !dHospitalId) {
        setDHospitalId((hospData.content || hospData as any)[0].id);
      }
    } catch (err) {
      console.log("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setDId(""); setDCode(""); setDName(""); setDDesc("");
    if (hospitals.length > 0) setDHospitalId(hospitals[0].id);
    setShowModal(true);
  };

  const openEdit = (d: DepartmentResponse) => {
    setDId(d.id); setDHospitalId(d.hospitalId || ""); setDCode(d.departmentCode || "");
    setDName(d.departmentName || ""); setDDesc(d.description || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!dHospitalId || !dCode || !dName) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Hospital, Code and Name are required" });
      return;
    }
    try {
      setSaving(true);
      const data = {
        hospitalId: dHospitalId, departmentCode: dCode,
        departmentName: dName, description: dDesc
      };
      if (dId) {
        await updateDepartment(dId, data);
        Toast.show({ type: "success", text1: "Department Updated" });
      } else {
        await createDepartment(data);
        Toast.show({ type: "success", text1: "Department Created" });
      }
      setShowModal(false);
      fetchData(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      Toast.show({ type: "success", text1: "Department Deleted" });
      fetchData(searchQuery, page);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manage Departments</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add Dept</Text>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Search departments..."
      />

      {loading && departments.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AdminTheme.primary} /></View>
      ) : departments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No departments found.</Text>
        </View>
      ) : (
        departments.map(d => (
          <View key={d.id} style={[styles.listItem, { borderLeftColor: AdminTheme.primary, borderLeftWidth: 4 }]}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{d.departmentName} ({d.departmentCode})</Text>
              <Text style={styles.listItemSubtitle}>
                Hospital: {hospitals.find(h => h.id === d.hospitalId)?.hospitalName || "Unknown"}
              </Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity onPress={() => openEdit(d)} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color={AdminTheme.info} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(d.id)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={AdminTheme.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {!loading && departments.length > 0 && (
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
              <Text style={styles.modalTitle}>{dId ? "Edit Department" : "Add Department"}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400, marginTop: 10 }}>
              <Text style={styles.label}>Select Hospital</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={dHospitalId} onValueChange={setDHospitalId} style={styles.picker as any}>
                  {hospitals.map(h => (
                    <Picker.Item key={h.id} label={h.hospitalName} value={h.id} />
                  ))}
                </Picker>
              </View>
              <CustomInput label="Department Code" value={dCode} onChangeText={setDCode} />
              <CustomInput label="Department Name" value={dName} onChangeText={setDName} />
              <CustomInput label="Description" value={dDesc} onChangeText={setDDesc} />

              <View style={styles.modalActionRow}>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancelBtn}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <PrimaryButton title="Save" onPress={handleSave} loading={saving} style={{ paddingHorizontal: 30 }} />
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
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: AdminTheme.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  emptyState: { padding: 30, alignItems: "center", backgroundColor: AdminTheme.surfaceAlt, borderRadius: 12 },
  emptyStateText: { color: AdminTheme.textSecondary },
  listItem: { flexDirection: "row", backgroundColor: AdminTheme.surface, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  listItemSubtitle: { fontSize: 13, color: AdminTheme.textSecondary, marginBottom: 6 },
  listItemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, backgroundColor: AdminTheme.surfaceAlt, borderRadius: 8 },
  label: { fontSize: 14, color: AdminTheme.textSecondary, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  pickerContainer: { backgroundColor: "#F1F5F9", borderRadius: 12, overflow: "hidden", marginBottom: 15, borderWidth: 1, borderColor: AdminTheme.border },
  picker: { height: 50, color: AdminTheme.textPrimary, borderWidth: 0, outlineStyle: "none" as any },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { backgroundColor: AdminTheme.surface, width: "100%", maxWidth: 500, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: AdminTheme.textPrimary },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 20 },
  modalCancelBtn: { padding: 12 },
  modalCancelText: { color: AdminTheme.textSecondary, fontWeight: "bold" },
});
