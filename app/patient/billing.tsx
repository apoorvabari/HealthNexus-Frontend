import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useFocusEffect } from "expo-router";

import { getMyPatientProfile } from "../../src/services/PatientService";
import {
  BillingResponse,
  getBillingById,
  getBillingReceipt,
  getPatientBillings,
  payBilling,
} from "../../src/services/BillingService";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount: number) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

export default function PatientBillingScreen() {
  const [billings, setBillings] = useState<BillingResponse[]>([]);
  const [selected, setSelected] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const loadBillings = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const profile = await getMyPatientProfile();
      const data = await getPatientBillings(profile.id);
      setBillings(data || []);
    } catch (error: any) {
      Alert.alert(
        "Unable to load billing",
        error?.response?.data?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBillings();
    }, [loadBillings]),
  );

  const openDetails = async (item: BillingResponse) => {
    try {
      const latest = await getBillingById(item.id);
      setSelected(latest);
    } catch {
      setSelected(item);
    }
  };

  const handlePay = () => {
    if (!selected || selected.paymentStatus === "PAID") return;

    Alert.alert(
      "Confirm Payment",
      `Pay ${formatAmount(selected.amount)} using Online payment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: async () => {
            try {
              setPaying(true);
              const updated = await payBilling(selected.id, "ONLINE");
              setSelected(updated);
              setBillings((current) =>
                current.map((billing) =>
                  billing.id === updated.id ? updated : billing,
                ),
              );
              Alert.alert("Payment Successful", "Your invoice has been marked as paid.");
            } catch (error: any) {
              Alert.alert(
                "Payment Failed",
                error?.response?.data?.message || "Unable to process payment.",
              );
            } finally {
              setPaying(false);
            }
          },
        },
      ],
    );
  };

  const handleReceipt = async () => {
    if (!selected) return;

    try {
      setReceiptLoading(true);
      const buffer = await getBillingReceipt(selected.id);

      if (Platform.OS === "web") {
        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      const base64 = toBase64(buffer);
      const fileUri = `${FileSystem.cacheDirectory}healthnexus-receipt-${selected.invoiceNumber}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "HealthNexus Receipt",
        });
      } else {
        Alert.alert("Receipt Ready", "The receipt was generated successfully.");
      }
    } catch (error: any) {
      Alert.alert(
        "Receipt Failed",
        error?.response?.data?.message || "Unable to generate receipt.",
      );
    } finally {
      setReceiptLoading(false);
    }
  };

  const statusIsPaid = selected?.paymentStatus === "PAID";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Billing & Payments</Text>
          <Text style={styles.subtitle}>Your consultation invoices and payment history</Text>
        </View>
        <Ionicons name="receipt-outline" size={30} color="#0F766E" />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      ) : (
        <FlatList
          data={billings}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadBillings(true)} />
          }
          contentContainerStyle={billings.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={52} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No invoices yet</Text>
              <Text style={styles.emptyText}>
                Invoices will appear here after a completed consultation.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openDetails(item)} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="receipt-outline" size={22} color="#0F766E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                  <Text style={styles.doctorName}>{item.doctorName}</Text>
                </View>
                <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.billingDate}>Billed {formatDate(item.billingDate)}</Text>
                <Text style={[styles.statusText, item.paymentStatus === "PAID" ? styles.statusPaid : styles.statusPending]}>
                  {item.paymentStatus}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selected && (
              <View style={styles.modalBody}>
                <Text style={styles.modalInvoiceNum}>{selected.invoiceNumber}</Text>

                <View style={styles.modalAmountBox}>
                  <Text style={styles.modalAmountLabel}>Total Amount</Text>
                  <Text style={styles.modalAmountValue}>{formatAmount(selected.amount)}</Text>
                  <Text style={[styles.statusText, selected.paymentStatus === "PAID" ? styles.statusPaid : styles.statusPending, { marginTop: 8 }]}>
                    {selected.paymentStatus}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Doctor</Text>
                  <Text style={styles.infoValue}>{selected.doctorName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Invoice Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selected.billingDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>{selected.paymentMethod || "Not paid"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selected.paymentDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Appointment ID</Text>
                  <Text style={styles.infoValue}>{selected.appointmentId}</Text>
                </View>

                <View style={styles.modalActions}>
                  {!statusIsPaid && (
                    <TouchableOpacity
                      style={[styles.payButton, paying && styles.payButtonDisabled]}
                      onPress={handlePay}
                      disabled={paying}
                    >
                      {paying ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.payButtonText}>Pay Now</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {statusIsPaid && (
                    <TouchableOpacity
                      style={styles.receiptButton}
                      onPress={handleReceipt}
                      disabled={receiptLoading}
                    >
                      {receiptLoading ? (
                        <ActivityIndicator color="#0F766E" />
                      ) : (
                        <Ionicons name="download-outline" size={20} color="#0F766E" />
                      )}
                      <Text style={styles.receiptText}>
                        {receiptLoading ? "Generating..." : "View / Download Receipt"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  doctorName: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F766E",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  billingDate: {
    fontSize: 13,
    color: "#94A3B8",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  statusPaid: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  statusPending: {
    backgroundColor: "#FEF9C3",
    color: "#A16207",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },
  modalBody: {
    paddingBottom: Platform.OS === "ios" ? 24 : 0,
  },
  modalInvoiceNum: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 24,
  },
  modalAmountBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  modalAmountLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  modalAmountValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F766E",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  modalActions: {
    marginTop: 32,
    gap: 12,
  },
  payButton: {
    backgroundColor: "#0F766E",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  receiptButton: {
    backgroundColor: "#F0FDFA",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  receiptText: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "bold",
  },
});
