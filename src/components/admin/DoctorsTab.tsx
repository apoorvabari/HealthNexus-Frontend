import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { AdminTheme, getStatusStyle } from "../../constants/adminTheme";

import {
  DoctorVerificationStatus,
  updateDoctorStatus,
  updateDoctorVerification,
  DoctorStatus,
} from "../../services/AdminService";

import {
  DoctorResponse,
  getAllDoctors,
} from "../../services/DoctorService";


import PrimaryButton from "../buttons/PrimaryButton";
import PaginationControls from "../ui/PaginationControls";
import SearchBar from "../ui/SearchBar";


export default function DoctorsTab() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorResponse | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [step, setStep] = useState(1);

  const [verifyLicense, setVerifyLicense] = useState(false);
  const [verifyDegree, setVerifyDegree] = useState(false);
  const [verifySpecialization, setVerifySpecialization] = useState(false);

  const [verificationStatus, setVerificationStatus] =
    useState<DoctorVerificationStatus>("PENDING");

  const [verificationRemarks, setVerificationRemarks] = useState("");

  const [saving, setSaving] = useState(false);

  const [showRejectLicense, setShowRejectLicense] = useState(false);
  const [rejectLicenseRemarks, setRejectLicenseRemarks] = useState("");
  const [rejectingLicense, setRejectingLicense] = useState(false);

  /*
   * ---------------------------------------------------------
   * FETCH DOCTORS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchDoctors(searchQuery, page);
  }, [page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) {
        fetchDoctors(searchQuery, 0);
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchDoctors = async (
    search = "",
    pageNum = 0
  ) => {
    try {
      setLoading(true);
      setError(false);
      const data = await getAllDoctors(
        search,
        pageNum,
        10
      );

      setDoctors(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      console.log("Error fetching doctors", err);
      setError(true);

      Toast.show({
        type: "error",
        text1: "Failed to Load Doctors",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch doctors.",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * OPEN VERIFICATION MODAL
   * ---------------------------------------------------------
   */

  const openVerifyModal = (
    doctor: DoctorResponse
  ) => {
    setSelectedDoctor(doctor);

    setStep(1);

    setVerifyLicense(
      doctor.licenseVerified ?? false
    );

    setVerifyDegree(
      doctor.degreeVerified ?? false
    );

    setVerifySpecialization(
      doctor.specializationVerified ?? false
    );

    setVerificationStatus(
      doctor.verificationStatus || "PENDING"
    );

    setVerificationRemarks(
      doctor.verificationRemarks || ""
    );

    setShowRejectLicense(false);
    setRejectLicenseRemarks("");

    setShowModal(true);
  };

  /*
   * ---------------------------------------------------------
   * VERIFICATION STEPS
   * ---------------------------------------------------------
   */

  const handleNextStep = () => {
    if (step === 1 && !verifyLicense) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2:
          "Please verify the license to proceed.",
      });

      return;
    }

    if (step === 2 && !verifyDegree) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2:
          "Please verify the degree to proceed.",
      });

      return;
    }

    if (step === 3 && !verifySpecialization) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2:
          "Please verify specialization to proceed.",
      });

      return;
    }

    setStep(step + 1);
  };

  /*
   * ---------------------------------------------------------
   * UPDATE VERIFICATION
   * ---------------------------------------------------------
   */

  const handleUpdateVerification = async () => {
    if (!selectedDoctor) {
      return;
    }

    if (verificationStatus === "APPROVED") {
      if (
        !verifyLicense ||
        !verifyDegree ||
        !verifySpecialization
      ) {
        Toast.show({
          type: "error",
          text1: "Cannot Approve Doctor",
          text2:
            "License, degree and specialization must all be verified.",
        });

        return;
      }
    }

    if (verificationStatus === "REJECTED") {
      if (!verificationRemarks.trim()) {
        Toast.show({
          type: "error",
          text1: "Rejection Reason Required",
          text2:
            "Please provide a reason for rejecting the doctor.",
        });

        return;
      }
    }

    try {
      setSaving(true);

      await updateDoctorVerification(
        selectedDoctor.id,
        {
          verificationStatus,
          licenseVerified: verifyLicense,
          degreeVerified: verifyDegree,
          specializationVerified:
            verifySpecialization,
          verificationRemarks:
            verificationRemarks.trim() ||
            undefined,
        }
      );

      Toast.show({
        type: "success",
        text1: "Verification Updated",
        text2:
          verificationStatus === "APPROVED"
            ? "Doctor approved successfully."
            : verificationStatus === "REJECTED"
              ? "Doctor rejected successfully."
              : "Verification progress saved.",
      });

      setShowModal(false);

      await fetchDoctors(
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
          "Unable to update doctor verification.",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UPDATE DOCTOR STATUS
   * ---------------------------------------------------------
   */

  const handleDoctorStatus = async (
    doctor: DoctorResponse,
    status: DoctorStatus
  ) => {
    try {
      setSaving(true);

      await updateDoctorStatus(
        doctor.id,
        {
          status,
        }
      );

      Toast.show({
        type: "success",
        text1: "Doctor Status Updated",
        text2: `Doctor status changed to ${status}.`,
      });

      setSelectedDoctor(
        selectedDoctor?.id === doctor.id
          ? {
            ...selectedDoctor,
            status,
          }
          : selectedDoctor
      );

      await fetchDoctors(
        searchQuery,
        page
      );
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Status Update Failed",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to update doctor status.",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * STATUS COLOR
   * ---------------------------------------------------------
   */

  const getDoctorStatusStyle = (
    status?: DoctorStatus
  ) => {
    switch (status) {
      case "ACTIVE":
        return {
          backgroundColor:
            "rgba(16,185,129,0.12)",
          color: AdminTheme.success,
        };

      case "INACTIVE":
        return {
          backgroundColor:
            "rgba(100,116,139,0.12)",
          color: AdminTheme.textSecondary,
        };

      case "SUSPENDED":
        return {
          backgroundColor:
            "rgba(239,68,68,0.12)",
          color: AdminTheme.danger,
        };

      default:
        return {
          backgroundColor:
            "rgba(100,116,139,0.12)",
          color: AdminTheme.textSecondary,
        };
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Manage Doctors
        </Text>
      </View>

      {/* SEARCH */}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search doctors by name or specialization..."
      />

      {/* DOCTOR LIST */}

      {loading && doctors.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={AdminTheme.primary}
          />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{color: AdminTheme.danger, marginBottom: 12}}>Failed to load doctors</Text>
          <TouchableOpacity onPress={() => fetchDoctors(searchQuery, page)} style={{backgroundColor: AdminTheme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8}}>
            <Text style={{color: "#FFF", fontWeight: "600"}}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="medkit-outline"
            size={40}
            color={AdminTheme.textSecondary}
          />

          <Text style={styles.emptyStateText}>
            No doctors found.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 16, paddingBottom: 16 }}>
          {doctors.map((doctor) => {
            const verificationStyle = getStatusStyle(doctor.verificationStatus || "PENDING");
            const doctorStatusStyle = getDoctorStatusStyle(doctor.status);

            return (
              <View key={doctor.id} style={[styles.verticalCard, { borderTopColor: verificationStyle.bg, borderTopWidth: 4 }]}>
                <View style={styles.verticalCardContent}>
                  <Text style={styles.tableRowTitle} numberOfLines={1}>{doctor.accountName || "Unknown Doctor"}</Text>
                  <Text style={styles.tableRowSubtitle} numberOfLines={1}>Specialization: {doctor.specialization || "N/A"}</Text>
                  <Text style={styles.tableRowSubtitle} numberOfLines={1}>Hospital: {doctor.hospitalName || "No Hospital"}</Text>
                  <Text style={styles.tableRowSubtitle} numberOfLines={1}>Department: {doctor.departmentName || "No Department"}</Text>
                </View>
                
                <View style={{ marginVertical: 12, gap: 8 }}>
                  <View style={[styles.statusBadgeDot, { backgroundColor: verificationStyle.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: verificationStyle.text }]} />
                    <Text style={[styles.statusBadgeText, { color: verificationStyle.text }]}>Verification: {doctor.verificationStatus || "PENDING"}</Text>
                  </View>
                  <View style={[styles.statusBadgeDot, { backgroundColor: doctorStatusStyle.backgroundColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: doctorStatusStyle.color }]} />
                    <Text style={[styles.statusBadgeText, { color: doctorStatusStyle.color }]}>Status: {doctor.status || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.verticalCardActions}>
                  <TouchableOpacity onPress={() => openVerifyModal(doctor)} style={styles.cardActionBtn}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={AdminTheme.success} />
                    <Text style={{color: AdminTheme.success, fontSize: 13, fontWeight: "600"}}>
                      {doctor.verificationStatus === "APPROVED" ? "View" : doctor.verificationStatus === "REJECTED" ? "Review" : "Verify"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* PAGINATION */}

      {!loading &&
        doctors.length > 0 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalElements={
              totalElements
            }
            onPageChange={setPage}
          />
        )}

      {/* VERIFICATION / DETAILS MODAL */}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowModal(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContainer}
          >

            {/* MODAL HEADER */}

            <View
              style={styles.modalHeaderRow}
            >
              <View>
                <Text
                  style={styles.modalTitle}
                >
                  {step === 1
                    ? "Step 1: Verify License"
                    : step === 2
                      ? "Step 2: Verify Degree"
                      : step === 3
                        ? "Step 3: Check Specialization"
                        : "Step 4: Final Status"}
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  {selectedDoctor?.accountName ||
                    "Doctor"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* PROGRESS */}

            <View
              style={
                styles.progressContainer
              }
            >
              {[1, 2, 3, 4].map(
                (s) => (
                  <View
                    key={s}
                    style={
                      styles.progressStep
                    }
                  >
                    <View
                      style={[
                        styles.progressCircle,
                        step >= s &&
                        styles.progressCircleActive,
                      ]}
                    >
                      {step > s ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#FFF"
                        />
                      ) : (
                        <Text
                          style={[
                            styles.progressStepText,
                            step >= s &&
                            styles.progressStepTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      )}
                    </View>

                    {s < 4 && (
                      <View
                        style={[
                          styles.progressLine,
                          step > s &&
                          styles.progressLineActive,
                        ]}
                      />
                    )}
                  </View>
                )
              )}
            </View>

            <ScrollView
              style={{
                maxHeight: 550,
              }}
            >

              {/* DOCTOR DETAILS */}

              {selectedDoctor && (
                <View
                  style={
                    styles.detailsCard
                  }
                >
                  <Text
                    style={
                      styles.detailsTitle
                    }
                  >
                    Doctor Details
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Name:{" "}
                    {selectedDoctor.accountName ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Hospital:{" "}
                    {selectedDoctor.hospitalName ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Department:{" "}
                    {selectedDoctor.departmentName ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Specialization:{" "}
                    {selectedDoctor.specialization ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Qualification:{" "}
                    {selectedDoctor.qualification ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Experience:{" "}
                    {selectedDoctor.experience ??
                      0}{" "}
                    years
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Consultation Fee:{" "}
                    {selectedDoctor.consultationFee ??
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    License:{" "}
                    {selectedDoctor.licenseNumber ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Doctor Account Status:{" "}
                    {selectedDoctor.status ||
                      "INACTIVE"}
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Doctor Verification:{" "}
                    {selectedDoctor.verificationStatus ||
                      "PENDING"}
                  </Text>
                </View>
              )}

              {/* STEP 1 */}

              {step === 1 && (
                <View>
                  <TouchableOpacity
                    style={
                      styles.checkboxRow
                    }
                    onPress={() =>
                      setVerifyLicense(
                        !verifyLicense
                      )
                    }
                  >
                    <Ionicons
                      name={
                        verifyLicense
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        verifyLicense
                          ? "#10B981"
                          : "#94A3B8"
                      }
                    />

                    <Text
                      style={
                        styles.checkboxLabel
                      }
                    >
                      I confirm the license is
                      valid
                    </Text>
                  </TouchableOpacity>

                  {/* REJECT LICENSE BUTTON */}

                  {!showRejectLicense ? (
                    <TouchableOpacity
                      style={
                        styles.rejectLicenseBtn
                      }
                      onPress={() =>
                        setShowRejectLicense(
                          true
                        )
                      }
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={AdminTheme.danger}
                      />

                      <Text
                        style={
                          styles.rejectLicenseBtnText
                        }
                      >
                        Reject License
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={
                        styles.rejectLicenseCard
                      }
                    >
                      <View
                        style={
                          styles.rejectLicenseCardHeader
                        }
                      >
                        <View
                          style={
                            styles.rejectLicenseCardHeaderLeft
                          }
                        >
                          <Ionicons
                            name="warning-outline"
                            size={18}
                            color={AdminTheme.danger}
                          />

                          <Text
                            style={
                              styles.rejectLicenseCardTitle
                            }
                          >
                            Reject License
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            setShowRejectLicense(
                              false
                            );
                            setRejectLicenseRemarks(
                              ""
                            );
                          }}
                        >
                          <Ionicons
                            name="close"
                            size={20}
                            color="#94A3B8"
                          />
                        </TouchableOpacity>
                      </View>

                      <Text
                        style={
                          styles.rejectLicenseHint
                        }
                      >
                        This will immediately
                        reject the doctor's
                        verification.
                      </Text>

                      <TextInput
                        value={
                          rejectLicenseRemarks
                        }
                        onChangeText={
                          setRejectLicenseRemarks
                        }
                        placeholder="Enter reason for rejecting the license..."
                        multiline
                        numberOfLines={3}
                        style={
                          styles.rejectLicenseInput
                        }
                        textAlignVertical="top"
                      />

                      <TouchableOpacity
                        disabled={
                          rejectingLicense
                        }
                        style={[
                          styles.confirmRejectBtn,
                          rejectingLicense && {
                            opacity: 0.6,
                          },
                        ]}
                        onPress={async () => {
                          if (
                            !rejectLicenseRemarks.trim()
                          ) {
                            Toast.show({
                              type: "error",
                              text1:
                                "Reason Required",
                              text2:
                                "Please provide a reason for rejecting the license.",
                            });
                            return;
                          }

                          if (
                            !selectedDoctor
                          ) {
                            return;
                          }

                          try {
                            setRejectingLicense(
                              true
                            );

                            await updateDoctorVerification(
                              selectedDoctor.id,
                              {
                                verificationStatus:
                                  "REJECTED",
                                licenseVerified:
                                  false,
                                degreeVerified:
                                  verifyDegree,
                                specializationVerified:
                                  verifySpecialization,
                                verificationRemarks:
                                  rejectLicenseRemarks.trim(),
                              }
                            );

                            Toast.show({
                              type: "success",
                              text1:
                                "License Rejected",
                              text2:
                                "Doctor verification has been rejected due to invalid license.",
                            });

                            setShowModal(
                              false
                            );

                            await fetchDoctors(
                              searchQuery,
                              page
                            );
                          } catch (
                            err: any
                          ) {
                            Toast.show({
                              type: "error",
                              text1:
                                "Rejection Failed",
                              text2:
                                err?.response
                                  ?.data
                                  ?.message ||
                                err?.message ||
                                "Unable to reject the license.",
                            });
                          } finally {
                            setRejectingLicense(
                              false
                            );
                          }
                        }}
                      >
                        {rejectingLicense ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFF"
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="close-circle"
                              size={18}
                              color="#FFF"
                            />

                            <Text
                              style={
                                styles.confirmRejectBtnText
                              }
                            >
                              Confirm Rejection
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* STEP 2 */}

              {step === 2 && (
                <TouchableOpacity
                  style={
                    styles.checkboxRow
                  }
                  onPress={() =>
                    setVerifyDegree(
                      !verifyDegree
                    )
                  }
                >
                  <Ionicons
                    name={
                      verifyDegree
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={24}
                    color={
                      verifyDegree
                        ? "#10B981"
                        : "#94A3B8"
                    }
                  />

                  <Text
                    style={
                      styles.checkboxLabel
                    }
                  >
                    I confirm the degree is
                    verified
                  </Text>
                </TouchableOpacity>
              )}

              {/* STEP 3 */}

              {step === 3 && (
                <TouchableOpacity
                  style={
                    styles.checkboxRow
                  }
                  onPress={() =>
                    setVerifySpecialization(
                      !verifySpecialization
                    )
                  }
                >
                  <Ionicons
                    name={
                      verifySpecialization
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={24}
                    color={
                      verifySpecialization
                        ? "#10B981"
                        : "#94A3B8"
                    }
                  />

                  <Text
                    style={
                      styles.checkboxLabel
                    }
                  >
                    I confirm the specialization
                    matches
                  </Text>
                </TouchableOpacity>
              )}

              {/* STEP 4 */}

              {step === 4 && (
                <View>

                  <Text
                    style={
                      styles.sectionLabel
                    }
                  >
                    Final Verification Decision
                  </Text>

                  <View
                    style={
                      styles.statusButtonsRow
                    }
                  >

                    {/* APPROVE */}

                    <TouchableOpacity
                      style={[
                        styles.bigActionBtn,
                        verificationStatus ===
                          "APPROVED"
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
                        setVerificationStatus(
                          "APPROVED"
                        )
                      }
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color={
                          verificationStatus ===
                            "APPROVED"
                            ? "#FFF"
                            : AdminTheme.success
                        }
                      />

                      <Text
                        style={[
                          styles.bigActionBtnText,
                          {
                            color:
                              verificationStatus ===
                                "APPROVED"
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
                        verificationStatus ===
                          "REJECTED"
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
                        setVerificationStatus(
                          "REJECTED"
                        )
                      }
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color={
                          verificationStatus ===
                            "REJECTED"
                            ? "#FFF"
                            : AdminTheme.danger
                        }
                      />

                      <Text
                        style={[
                          styles.bigActionBtnText,
                          {
                            color:
                              verificationStatus ===
                                "REJECTED"
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

                  <Text
                    style={
                      styles.sectionLabel
                    }
                  >
                    Verification Remarks
                  </Text>

                  <TextInput
                    value={
                      verificationRemarks
                    }
                    onChangeText={
                      setVerificationRemarks
                    }
                    placeholder={
                      verificationStatus ===
                        "REJECTED"
                        ? "Enter reason for rejection..."
                        : "Optional verification remarks..."
                    }
                    multiline
                    numberOfLines={4}
                    style={
                      styles.remarksInput
                    }
                    textAlignVertical="top"
                  />

                  {/* VERIFICATION SUMMARY */}

                  <Text
                    style={
                      styles.verificationSummary
                    }
                  >
                    License:{" "}
                    {verifyLicense
                      ? "Verified ✓"
                      : "Not Verified"}
                  </Text>

                  <Text
                    style={
                      styles.verificationSummary
                    }
                  >
                    Degree:{" "}
                    {verifyDegree
                      ? "Verified ✓"
                      : "Not Verified"}
                  </Text>

                  <Text
                    style={
                      styles.verificationSummary
                    }
                  >
                    Specialization:{" "}
                    {verifySpecialization
                      ? "Verified ✓"
                      : "Not Verified"}
                  </Text>

                  {/* DOCTOR STATUS MANAGEMENT */}

                  {selectedDoctor?.verificationStatus === "APPROVED" && (
                    <>
                      <Text
                        style={
                          styles.sectionLabel
                        }
                      >
                        Doctor Account Status
                      </Text>

                      <View
                        style={
                          styles.doctorStatusRow
                        }
                      >

                        {/* ACTIVE */}
                        {(selectedDoctor?.status === "INACTIVE" || selectedDoctor?.status === "SUSPENDED") && (
                          <TouchableOpacity
                            disabled={saving}
                            onPress={() =>
                              selectedDoctor &&
                              handleDoctorStatus(
                                selectedDoctor,
                                "ACTIVE"
                              )
                            }
                            style={[
                              styles.doctorStatusButton,
                            ]}
                          >
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={18}
                              color={AdminTheme.success}
                            />

                            <Text
                              style={[
                                styles.doctorStatusButtonText,
                              ]}
                            >
                              Activate
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* INACTIVE */}
                        {selectedDoctor?.status === "ACTIVE" && (
                          <TouchableOpacity
                            disabled={saving}
                            onPress={() =>
                              selectedDoctor &&
                              handleDoctorStatus(
                                selectedDoctor,
                                "INACTIVE"
                              )
                            }
                            style={[
                              styles.doctorStatusButton,
                            ]}
                          >
                            <Ionicons
                              name="pause-circle-outline"
                              size={18}
                              color={AdminTheme.textSecondary}
                            />

                            <Text
                              style={[
                                styles.doctorStatusButtonText,
                              ]}
                            >
                              Deactivate
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* SUSPENDED */}
                        {(selectedDoctor?.status === "ACTIVE" || selectedDoctor?.status === "INACTIVE") && (
                          <TouchableOpacity
                            disabled={saving}
                            onPress={() =>
                              selectedDoctor &&
                              handleDoctorStatus(
                                selectedDoctor,
                                "SUSPENDED"
                              )
                            }
                            style={[
                              styles.doctorStatusButton,
                            ]}
                          >
                            <Ionicons
                              name="ban-outline"
                              size={18}
                              color={AdminTheme.danger}
                            />

                            <Text
                              style={[
                                styles.doctorStatusButtonText,
                              ]}
                            >
                              Suspend
                            </Text>
                          </TouchableOpacity>
                        )}

                      </View>
                    </>
                  )}

                </View>
              )}

              {/* MODAL ACTIONS */}

              <View
                style={
                  styles.modalActionRow
                }
              >

                {step > 1 ? (
                  <TouchableOpacity
                    onPress={() =>
                      setStep(step - 1)
                    }
                    style={
                      styles.modalCancelBtn
                    }
                  >
                    <Text
                      style={
                        styles.modalCancelText
                      }
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      setShowModal(false)
                    }
                    style={
                      styles.modalCancelBtn
                    }
                  >
                    <Text
                      style={
                        styles.modalCancelText
                      }
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                )}

                {step < 4 ? (
                  <PrimaryButton
                    title="Next"
                    onPress={
                      handleNextStep
                    }
                    style={{
                      paddingHorizontal: 20,
                    }}
                  />
                ) : (
                  <PrimaryButton
                    title={
                      verificationStatus ===
                        "APPROVED"
                        ? "Approve Doctor"
                        : verificationStatus ===
                          "REJECTED"
                          ? "Reject Doctor"
                          : "Save Verification"
                    }
                    onPress={
                      handleUpdateVerification
                    }
                    loading={saving}
                    style={{
                      paddingHorizontal: 20,
                    }}
                  />
                )}

              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

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

  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.5)",
    borderRadius: 12,
  },

  emptyStateText: {
    color: AdminTheme.textSecondary,
    marginTop: 8,
  },

  verticalCard: { backgroundColor: AdminTheme.surface, width: "100%", padding: 16, borderRadius: AdminTheme.borderRadius.xl, ...AdminTheme.shadows.medium, marginBottom: 16 },
  verticalCardContent: { flex: 1 },
  tableRowTitle: { fontSize: 16, fontWeight: "bold", color: AdminTheme.textPrimary, marginBottom: 4 },
  tableRowSubtitle: { fontSize: 13, color: AdminTheme.textSecondary },
  statusBadgeDot: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: AdminTheme.borderRadius.pill, alignSelf: "flex-start", gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  verticalCardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: AdminTheme.border },
  cardActionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },

  verifyBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AdminTheme.borderRadius.pill,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15,23,42,0.5)",
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

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      AdminTheme.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  progressCircleActive: {
    backgroundColor:
      AdminTheme.primary,
  },

  progressStepText: {
    color: AdminTheme.textMuted,
    fontSize: 12,
    fontWeight: "bold",
  },

  progressStepTextActive: {
    color: "#FFF",
  },

  progressLine: {
    flex: 1,
    height: 4,
    backgroundColor:
      AdminTheme.border,
    marginHorizontal: -5,
    zIndex: 1,
  },

  progressLineActive: {
    backgroundColor:
      AdminTheme.primary,
  },

  detailsCard: {
    backgroundColor:
      AdminTheme.surfaceAlt,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor:
      AdminTheme.border,
  },

  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
    marginBottom: 10,
  },

  detailText: {
    fontSize: 14,
    color: AdminTheme.textPrimary,
    marginBottom: 6,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
    marginTop: 10,
    marginBottom: 10,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    gap: 10,
    backgroundColor:
      AdminTheme.surfaceAlt,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      AdminTheme.border,
  },

  checkboxLabel: {
    fontSize: 15,
    color: AdminTheme.textPrimary,
    fontWeight: "600",
  },

  statusButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  bigActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  bigActionBtnText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  remarksInput: {
    borderWidth: 1,
    borderColor:
      AdminTheme.border,
    backgroundColor:
      AdminTheme.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: AdminTheme.textPrimary,
    marginBottom: 15,
  },

  verificationSummary: {
    fontSize: 14,
    color: AdminTheme.textSecondary,
    marginBottom: 6,
  },

  doctorStatusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  doctorStatusButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      AdminTheme.border,
    backgroundColor:
      AdminTheme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 6,
  },

  doctorStatusButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: AdminTheme.textPrimary,
  },

  activeStatusButton: {
    backgroundColor:
      AdminTheme.success,
    borderColor:
      AdminTheme.success,
  },

  activeStatusButtonText: {
    color: "#FFF",
  },

  inactiveStatusButton: {
    backgroundColor:
      AdminTheme.textSecondary,
    borderColor:
      AdminTheme.textSecondary,
  },

  inactiveStatusButtonText: {
    color: "#FFF",
  },

  suspendedStatusButton: {
    backgroundColor:
      AdminTheme.danger,
    borderColor:
      AdminTheme.danger,
  },

  suspendedStatusButtonText: {
    color: "#FFF",
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
    color: "#64748B",
    fontWeight: "bold",
  },

  rejectLicenseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AdminTheme.danger,
    borderStyle: "dashed" as any,
    backgroundColor:
      "rgba(239,68,68,0.06)",
    marginBottom: 10,
  },

  rejectLicenseBtnText: {
    fontSize: 14,
    fontWeight: "bold" as any,
    color: AdminTheme.danger,
  },

  rejectLicenseCard: {
    backgroundColor:
      "rgba(239,68,68,0.04)",
    borderWidth: 1,
    borderColor:
      "rgba(239,68,68,0.25)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },

  rejectLicenseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  rejectLicenseCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rejectLicenseCardTitle: {
    fontSize: 15,
    fontWeight: "bold" as any,
    color: AdminTheme.danger,
  },

  rejectLicenseHint: {
    fontSize: 13,
    color: AdminTheme.textSecondary,
    marginBottom: 12,
  },

  rejectLicenseInput: {
    borderWidth: 1,
    borderColor:
      "rgba(239,68,68,0.3)",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: AdminTheme.textPrimary,
    marginBottom: 12,
  },

  confirmRejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor:
      AdminTheme.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  confirmRejectBtnText: {
    fontSize: 14,
    fontWeight: "bold" as any,
    color: "#FFF",
  },
});