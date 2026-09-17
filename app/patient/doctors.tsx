import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import {
  DoctorResponse,
  searchDoctorsForPatient,
  getNearbyDoctors,
  getOnlineDoctors,
} from "../../src/services/DoctorService";
import {
  DepartmentResponse,
  getDepartmentsByHospital,
} from "../../src/services/DepartmentService";
import { getSelectedHospitalId } from "../../src/storage/AuthStorage";
import { subscribeTopic, unsubscribeTopic } from "../../src/services/websocket";

export default function PatientDoctorsScreen() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [minExperience, setMinExperience] = useState("");

  const [isNearbySearch, setIsNearbySearch] = useState(false);
  const [latitude, setLatitude] = useState("12.9716");
  const [longitude, setLongitude] = useState("77.5946");
  const [radiusKm, setRadiusKm] = useState("10");

  const requestDeviceLocation = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position?.coords) {
            setLatitude(String(position.coords.latitude));
            setLongitude(String(position.coords.longitude));
            Toast.show({
              type: "success",
              text1: "Location Detected",
              text2: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`,
            });
          }
        },
        (error) => {
          Toast.show({
            type: "info",
            text1: "Location Access",
            text2: error?.message || "Using current coordinate values.",
          });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const toggleNearbySearch = useCallback(() => {
    const nextState = !isNearbySearch;
    setIsNearbySearch(nextState);
    if (nextState) {
      requestDeviceLocation();
    }
  }, [isNearbySearch, requestDeviceLocation]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [onlineDoctors, setOnlineDoctors] = useState<Set<string>>(new Set());

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization?.trim())
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort();
  }, [doctors]);

  const searchDoctors = useCallback(
    async (pageIndex = 0) => {
      try {
        setSearching(true);
        let response;
        if (isNearbySearch && latitude && longitude) {
          response = await getNearbyDoctors({
            latitude: Number(latitude),
            longitude: Number(longitude),
            radiusKm: radiusKm.trim() ? Number(radiusKm) : 10,
            specialization: specialization || undefined,
            maxFee: maxFee.trim() ? Number(maxFee) : undefined,
            minExperience: minExperience.trim()
              ? Number(minExperience)
              : undefined,
            page: pageIndex,
            size: 10,
          });
        } else {
          response = await searchDoctorsForPatient({
            search: search.trim() || undefined,
            specialization: specialization || undefined,
            departmentId: departmentId || undefined,
            maxFee: maxFee.trim() ? Number(maxFee) : undefined,
            minExperience: minExperience.trim()
              ? Number(minExperience)
              : undefined,
            page: pageIndex,
            size: 10,
          });
        }
        setDoctors(response.content || []);
        setTotalPages(response.totalPages || 0);
        setPage(pageIndex);
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Doctor Search Failed",
          text2:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to load doctors.",
        });
      } finally {
        setSearching(false);
      }
    },
    [
      search,
      specialization,
      departmentId,
      maxFee,
      minExperience,
      isNearbySearch,
      latitude,
      longitude,
      radiusKm,
    ],
  );

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      setLoading(true);
      await searchDoctors(0);

      try {
        const initialOnline = await getOnlineDoctors();
        if (active) setOnlineDoctors(new Set(initialOnline));

        const activeHospitalId = await getSelectedHospitalId();
        if (!activeHospitalId) {
          return;
        }

        const presenceTopic = `/topic/hospital/${activeHospitalId}/doctor-presence`;

        await subscribeTopic(presenceTopic, (presenceEvent: any) => {
          if (!active) return;
          if (typeof presenceEvent === "object" && presenceEvent.doctorId) {
            setOnlineDoctors((prev) => {
              const newSet = new Set(prev);
              if (presenceEvent.online) {
                newSet.add(presenceEvent.doctorId);
              } else {
                newSet.delete(presenceEvent.doctorId);
              }
              return newSet;
            });
          }
        });
      } catch (error) {
        console.error("Failed to load initial online doctors", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    queueMicrotask(() => {
      void initialise();
    });

    return () => {
      active = false;
      void getSelectedHospitalId().then((activeHospitalId) => {
        if (activeHospitalId) {
          unsubscribeTopic(
            `/topic/hospital/${activeHospitalId}/doctor-presence`,
          );
        }
      });
    };
  }, [searchDoctors]);

  useEffect(() => {
    void getSelectedHospitalId().then((activeHospitalId) => {
      setHospitalId(activeHospitalId || "");
    });
  }, []);

  useEffect(() => {
    let active = true;
    const fetchDepartments = async () => {
      if (!hospitalId) {
        await Promise.resolve();
        if (active) {
          setDepartments([]);
          setDepartmentId("");
        }
        return;
      }
      try {
        const response = await getDepartmentsByHospital(hospitalId);
        if (active) {
          setDepartments(response || []);
          setDepartmentId("");
        }
      } catch (error) {
        console.error("Failed to load departments", error);
        if (active) setDepartments([]);
      }
    };
    void fetchDepartments();
    return () => {
      active = false;
    };
  }, [hospitalId]);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setDepartmentId("");
    setMaxFee("");
    setMinExperience("");
    setIsNearbySearch(false);
    setLatitude("12.9716");
    setLongitude("77.5946");
    setRadiusKm("10");
    void getSelectedHospitalId().then((activeHospitalId) => {
      setHospitalId(activeHospitalId || "");
      void searchDoctors(0);
    });
  };

  const handleBook = (doctor: DoctorResponse) => {
    router.push({
      pathname: "/patient/doctor-profile",
      params: { doctorId: doctor.id },
    });
  };

  const renderDoctorCard = (doctor: DoctorResponse) => {
    const isOnline = onlineDoctors.has(doctor.id);

    return (
      <View key={doctor.id} style={styles.doctorCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="person" size={28} color="#0F766E" />
              </View>
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
                ]}
              />
            </View>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.doctorName} numberOfLines={1}>
                Dr. {doctor.accountName || "Doctor"}
              </Text>
              <Text style={styles.specialization}>
                {doctor.specialization || "Specialization N/A"}
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDotSmall,
                      { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isOnline ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDotSmall,
                      {
                        backgroundColor:
                          doctor.status === "ACTIVE" ? "#10B981" : "#94A3B8",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          doctor.status === "ACTIVE" ? "#10B981" : "#94A3B8",
                      },
                    ]}
                  >
                    {doctor.status === "ACTIVE" ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.feeBadge}>
            <Text style={styles.feeAmount}>₹{doctor.consultationFee ?? 0}</Text>
            <Text style={styles.feeLabelText}>consultation</Text>
          </View>
        </View>

        <View style={styles.cardGrid}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Ionicons name="school-outline" size={16} color="#64748B" />
              <Text style={styles.gridText} numberOfLines={1}>
                {doctor.qualification || "MD"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="business-outline" size={16} color="#64748B" />
              <Text style={styles.gridText} numberOfLines={1}>
                {doctor.hospitalName || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Ionicons name="briefcase-outline" size={16} color="#64748B" />
              <Text style={styles.gridText} numberOfLines={1}>
                {doctor.experience ?? 0} years experience
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="git-network-outline" size={16} color="#64748B" />
              <Text style={styles.gridText} numberOfLines={1}>
                {doctor.departmentName || "N/A"}
              </Text>
            </View>
          </View>
          {doctor.distanceKm !== undefined && doctor.distanceKm !== null && (
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Ionicons name="location-outline" size={16} color="#0F766E" />
                <Text
                  style={[styles.gridText, { color: "#0F766E", fontWeight: "600" }]}
                  numberOfLines={1}
                >
                  {doctor.distanceKm} km away
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push({
                pathname: "/patient/doctor-profile",
                params: { doctorId: doctor.id },
              })
            }
          >
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleBook(doctor)}
          >
            <Text style={styles.primaryButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Finding doctors...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <FlatList
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={doctors}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.badge}>PATIENT PORTAL</Text>
                <Text style={styles.title}>Find a Doctor</Text>
                <Text style={styles.subtitle}>
                  Search and compare doctors based on your needs.
                </Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#0F172A"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchCard}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search doctor or specialization"
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() => searchDoctors(0)}
                />
              </View>

              <View style={styles.searchDivider} />

              <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters((value) => !value)}
              >
                <Ionicons name="options-outline" size={20} color="#0F766E" />
                <Text style={styles.filterToggleText}>Filters</Text>
                <Ionicons
                  name={showFilters ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#0F172A"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {showFilters && (
                <View style={styles.filters}>
                  <Text style={styles.label}>Specialization</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={specialization}
                      onValueChange={setSpecialization}
                      style={styles.picker}
                    >
                      <Picker.Item label="All specializations" value="" />
                      {specializations.map((value) => (
                        <Picker.Item key={value} label={value} value={value} />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.label}>Department</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={departmentId}
                      onValueChange={setDepartmentId}
                      enabled={Boolean(hospitalId)}
                      style={styles.picker}
                    >
                      <Picker.Item
                        label={
                          hospitalId
                            ? "All departments"
                            : "Select hospital first"
                        }
                        value=""
                      />
                      {departments.map((department) => (
                        <Picker.Item
                          key={department.id}
                          label={department.departmentName}
                          value={department.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>Max fee (₹)</Text>
                      <TextInput
                        value={maxFee}
                        onChangeText={setMaxFee}
                        placeholder="e.g. 1000"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>Min experience</Text>
                      <TextInput
                        value={minExperience}
                        onChangeText={setMinExperience}
                        placeholder="e.g. 5"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <TouchableOpacity
                      style={[
                        styles.halfInput,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: isNearbySearch ? "#CCFBF1" : "#F8FAFC",
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: isNearbySearch ? "#0F766E" : "#E2E8F0",
                        },
                      ]}
                      onPress={toggleNearbySearch}
                    >
                      <Text style={{ fontWeight: "600", color: isNearbySearch ? "#0F766E" : "#475569" }}>
                        📍 Nearby Search
                      </Text>
                      <Ionicons
                        name={isNearbySearch ? "checkbox" : "square-outline"}
                        size={20}
                        color={isNearbySearch ? "#0F766E" : "#94A3B8"}
                      />
                    </TouchableOpacity>
                    {isNearbySearch && (
                      <View style={styles.halfInput}>
                        <Text style={styles.label}>Radius (km)</Text>
                        <TextInput
                          value={radiusKm}
                          onChangeText={setRadiusKm}
                          placeholder="e.g. 10"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          style={styles.textInput}
                        />
                      </View>
                    )}
                  </View>

                  {isNearbySearch && (
                    <TouchableOpacity
                      style={{
                        marginVertical: 4,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: "#E0F2FE",
                        borderRadius: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={requestDeviceLocation}
                    >
                      <Ionicons name="navigate-outline" size={16} color="#0284C7" />
                      <Text style={{ marginLeft: 6, color: "#0284C7", fontWeight: "600", fontSize: 13 }}>
                        Detect My Current GPS Location
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isNearbySearch && (
                    <View style={styles.inputRow}>
                      <View style={styles.halfInput}>
                        <Text style={styles.label}>Latitude</Text>
                        <TextInput
                          value={latitude}
                          onChangeText={setLatitude}
                          placeholder="e.g. 12.9716"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          style={styles.textInput}
                        />
                      </View>
                      <View style={styles.halfInput}>
                        <Text style={styles.label}>Longitude</Text>
                        <TextInput
                          value={longitude}
                          onChangeText={setLongitude}
                          placeholder="e.g. 77.5946"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.filterButtons}>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearFilters}
                    >
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={() => searchDoctors(0)}
                    >
                      {searching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.applyButtonText}>
                          Search Doctors
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Available Doctors</Text>
              <Text style={styles.resultsCount}>{doctors.length} found</Text>
            </View>
          </>
        }
        renderItem={({ item }) => renderDoctorCard(item)}
        ListEmptyComponent={
          searching && doctors.length === 0 ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="small" color="#0F766E" />
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No doctors found</Text>
              <Text style={styles.emptyText}>
                Try changing your search or filters.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    page === 0 && styles.pageButtonDisabled,
                  ]}
                  disabled={page === 0}
                  onPress={() => searchDoctors(page - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={page === 0 ? "#94A3B8" : "#0F766E"}
                  />
                  <Text
                    style={[
                      styles.pageButtonText,
                      page === 0 && styles.pageTextDisabled,
                    ]}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  Page {page + 1} of {totalPages}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    page === totalPages - 1 && styles.pageButtonDisabled,
                  ]}
                  disabled={page === totalPages - 1}
                  onPress={() => searchDoctors(page + 1)}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      page === totalPages - 1 && styles.pageTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={page === totalPages - 1 ? "#94A3B8" : "#0F766E"}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.legendCard}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: "#10B981" },
                  ]}
                />
                <Text style={styles.legendText}>Online</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: "#EF4444" },
                  ]}
                />
                <Text style={styles.legendText}>Offline</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: "#10B981" },
                  ]}
                />
                <Text style={styles.legendText}>Active</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: "#94A3B8" },
                  ]}
                />
                <Text style={styles.legendText}>Inactive</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="information" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.infoTextMain}>
                Online doctors are available for online consultations. Offline
                doctors may still be available for appointments.
              </Text>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: { color: "#64748B", fontSize: 14 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 4,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1 },
  badge: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: { color: "#0F172A", fontSize: 26, fontWeight: "800", marginTop: 2 },
  subtitle: { color: "#64748B", fontSize: 13, marginTop: 6, marginBottom: 18 },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: "#0F172A", fontSize: 15 },
  searchDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: -16,
    marginBottom: 12,
  },
  filterToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  filterToggleText: { color: "#0F766E", fontWeight: "800", fontSize: 14 },
  filters: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
  },
  pickerWrapper: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: { color: "#0F172A", height: 50 },
  inputRow: { flexDirection: "row", gap: 10 },
  halfInput: { flex: 1 },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  filterButtons: { flexDirection: "row", gap: 10, marginTop: 20 },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: { color: "#475569", fontWeight: "800" },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: { color: "#FFFFFF", fontWeight: "800" },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultsTitle: { color: "#0F172A", fontSize: 18, fontWeight: "800" },
  resultsCount: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", gap: 14, flex: 1 },
  avatarContainer: { position: "relative" },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerTitleWrap: { flex: 1, justifyContent: "center" },
  doctorName: { color: "#0F172A", fontSize: 18, fontWeight: "800" },
  specialization: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 6,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  feeBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  feeAmount: { color: "#065F46", fontSize: 16, fontWeight: "800" },
  feeLabelText: { color: "#065F46", fontSize: 10, fontWeight: "600" },
  cardGrid: { flexDirection: "column", gap: 12, marginBottom: 20 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  gridItem: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  gridText: { color: "#475569", fontSize: 12, fontWeight: "500", flex: 1 },
  cardActions: { flexDirection: "row", gap: 12 },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: "#0F766E", fontWeight: "800", fontSize: 14 },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 16,
    marginTop: 10,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#CCFBF1",
  },
  pageButtonDisabled: { backgroundColor: "#F1F5F9" },
  pageButtonText: { color: "#0F766E", fontWeight: "700", fontSize: 14 },
  pageTextDisabled: { color: "#94A3B8" },
  pageInfo: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  legendCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 24,
    marginBottom: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { color: "#475569", fontSize: 12, fontWeight: "500" },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextMain: {
    flex: 1,
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
});
