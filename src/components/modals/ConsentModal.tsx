import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import {
  getConsentByType,
  updateConsent,
  ConsentType,
  ConsentStatus,
} from "../../services/ConsentService";

export interface ConsentAppointmentDetails {
  doctorName: string;
  date: string;
  time: string;
  type: string;
  fee?: number;
}

interface ConsentModalProps {
  visible: boolean;
  type: ConsentType;
  title: string;
  description: string;
  appointmentDetails?: ConsentAppointmentDetails;
  onConsentGranted: () => void;
  onConsentDeclined: () => void;
  onClose: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  visible,
  type,
  title,
  description,
  appointmentDetails,
  onConsentGranted,
  onConsentDeclined,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [updating, setUpdating] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const checkExistingConsent = useCallback(async () => {
    await Promise.resolve();
    setTermsChecked(false);
    setLoading(true);
    try {
      const consent = await getConsentByType(type);
      setStatus(consent.status);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (!visible) return;

    queueMicrotask(() => {
      void checkExistingConsent();
    });
  }, [visible, checkExistingConsent]);

  const handleUpdate = async (newStatus: ConsentStatus) => {
    try {
      setUpdating(true);
      await updateConsent({ consentType: type, status: newStatus });
      Toast.show({
        type: newStatus === "GRANTED" ? "success" : "info",
        text1: newStatus === "GRANTED" ? "Consent Granted" : "Consent Declined",
      });
      if (newStatus === "GRANTED") {
        onConsentGranted();
      } else {
        onConsentDeclined();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Consent Update Failed",
        text2: err?.message || "Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <LinearGradient colors={["#1C1535", "#1C1535"]} style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#6C63FF" />
            </View>
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>

          <View style={styles.body}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#6C63FF"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <>
                {appointmentDetails && (
                  <View style={styles.detailsBox}>
                    <Text style={styles.detailsTitle}>
                      Review Appointment Details
                    </Text>
                    <DetailRow
                      label="Doctor"
                      value={appointmentDetails.doctorName}
                    />
                    <DetailRow label="Date" value={appointmentDetails.date} />
                    <DetailRow label="Time" value={appointmentDetails.time} />
                    <DetailRow label="Type" value={appointmentDetails.type} />
                    {appointmentDetails.fee !== undefined && (
                      <DetailRow
                        label="Consultation Fee"
                        value={`₹${appointmentDetails.fee}`}
                      />
                    )}
                  </View>
                )}

                <Text style={styles.description}>{description}</Text>

                {status === "REVOKED" || status === "DECLINED" ? (
                  <View style={styles.warningBox}>
                    <Ionicons
                      name="warning-outline"
                      size={16}
                      color="#F59E0B"
                    />
                    <Text style={styles.warningText}>
                      You previously declined or revoked this consent. It is
                      required to proceed.
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                  onPress={() => setTermsChecked(!termsChecked)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      termsChecked && styles.checkboxChecked,
                    ]}
                  >
                    {termsChecked && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I acknowledge the terms and privacy policy, and I provide my
                    consent for this appointment.
                  </Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.declineBtn]}
                    onPress={() => handleUpdate("DECLINED")}
                    disabled={updating}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.agreeBtn,
                      !termsChecked && styles.disabledAgreeBtn,
                    ]}
                    onPress={() => handleUpdate("GRANTED")}
                    disabled={updating || !termsChecked}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.agreeText}>Agree & Continue</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelLink}
                  onPress={onClose}
                  disabled={updating}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#12102B",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2D2550",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(108,99,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  body: {
    padding: 24,
    paddingTop: 8,
  },
  description: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#FCD34D",
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  declineText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
  agreeBtn: {
    backgroundColor: "#6C63FF",
  },
  agreeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelLink: {
    marginTop: 20,
    alignItems: "center",
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 14,
  },
  detailsBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailsTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  detailValue: {
    color: "#F3F4F6",
    fontSize: 13,
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4B5563",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  checkboxText: {
    flex: 1,
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
  },
  disabledAgreeBtn: {
    backgroundColor: "#4B5563",
    opacity: 0.5,
  },
});

export default ConsentModal;
