import React, { useState } from "react";
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import CustomInput from "../src/components/inputs/CustomInput";
import PasswordInput from "../src/components/inputs/PasswordInput";
import PrimaryButton from "../src/components/buttons/PrimaryButton";
import { login } from "../src/services/AccountService";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        email: email.trim(),
        password: password.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: response.message || "Welcome back to HealthNexus!",
      });

      setTimeout(() => {
        router.replace("/home");
      }, 1500);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login.";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../src/assets/images/healthnexus-logo.png")}
          style={styles.logo}
        />

        <Text style={styles.appName}>HealthNexus</Text>

        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>Login to continue</Text>

        <CustomInput
          label="Email"
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
        />

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerText}>
            {"Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 15,
  },

  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0D6EFD",
    textAlign: "center",
    marginBottom: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },

  registerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#0D6EFD",
    fontWeight: "600",
  },
});