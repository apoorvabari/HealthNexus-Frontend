import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { verifyEmail } from "../src/services/UserService";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        setLoading(true);
        const res = await verifyEmail(token);
        setSuccess(true);
        setMessage(res.message || "Email verified successfully! You can now log in.");
        Toast.show({
          type: "success",
          text1: "Email Verified",
          text2: "Your account is now ready. Please log in.",
        });
      } catch (err: any) {
        setSuccess(false);
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to verify email. Token may be invalid or expired.";
        setMessage(errorMsg);
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: errorMsg,
        });
      } finally {
        setLoading(false);
      }
    };

    handleVerification();
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F8FAFC", "#E2E8F0"]}
        style={styles.gradient}
      >
        <View style={styles.card}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#10B981" style={styles.icon} />
              <Text style={styles.title}>Verifying Email...</Text>
              <Text style={styles.subtitle}>
                Please wait while we validate your email verification token.
              </Text>
            </>
          ) : success ? (
            <>
              <View style={[styles.iconCircle, styles.successCircle]}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.subtitle}>{message}</Text>
              {email ? (
                <Text style={styles.emailText}>Verified Account: {email}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.buttonText}>Proceed to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, styles.errorCircle]}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
              </View>
              <Text style={styles.title}>Verification Failed</Text>
              <Text style={styles.subtitle}>{message}</Text>
              <TouchableOpacity
                style={[styles.button, styles.errorButton]}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.buttonText}>Go to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successCircle: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  errorCircle: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
  },
  errorButton: {
    backgroundColor: "#0F172A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
