import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { register } from "../src/services/AccountService";
import RolePicker from "../src/components/dropdowns/RolePicker";
import CustomInput from "../src/components/inputs/CustomInput";
import PasswordInput from "../src/components/inputs/PasswordInput";
import PrimaryButton from "../src/components/buttons/PrimaryButton";

export default function Register() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "",
    };

    // First Name Validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
      valid = false;
    } else if (!/^[A-Za-z]+$/.test(firstName.trim())) {
      newErrors.firstName = "Only alphabets are allowed in first name.";
      valid = false;
    } else if (firstName.trim().length < 3 || firstName.trim().length > 10) {
      newErrors.firstName = "First name must be between 3 and 10 characters.";
      valid = false;
    }

    // Middle Name Validation (Optional, but if filled must be validated)
    if (middleName.trim()) {
      if (!/^[A-Za-z]+$/.test(middleName.trim())) {
        newErrors.middleName = "Only alphabets are allowed in middle name.";
        valid = false;
      } else if (middleName.trim().length < 1 || middleName.trim().length > 10) {
        newErrors.middleName = "Middle name must be between 1 and 10 characters.";
        valid = false;
      }
    }

    // Last Name Validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
      valid = false;
    } else if (!/^[A-Za-z]+$/.test(lastName.trim())) {
      newErrors.lastName = "Only alphabets are allowed in last name.";
      valid = false;
    } else if (lastName.trim().length < 1 || lastName.trim().length > 10) {
      newErrors.lastName = "Last name must be between 1 and 10 characters.";
      valid = false;
    }

    // Email Validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    // Phone Number Validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      valid = false;
    }

    // Password Validation
    if (!password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,8}$/.test(password)
    ) {
      newErrors.password =
        "Password must be 4-8 characters with uppercase, lowercase, number and special character.";
      valid = false;
    }

    // Role Validation
    if (!role) {
      newErrors.role = "Please select a role.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please correct the errors in the form.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        role,
      });

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: response.message || "Account registered successfully!",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to register account.";

      if (
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("exist")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Email already exists.",
        }));
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: "Email already exists.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: message,
        });
      }
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

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>Register to continue</Text>

        <CustomInput
          label="First Name"
          placeholder="Enter First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setErrors({
              ...errors,
              firstName: "",
            });
          }}
          error={errors.firstName}
        />

        <CustomInput
          label="Middle Name"
          placeholder="Enter Middle Name"
          value={middleName}
          onChangeText={(text) => {
            setMiddleName(text);
            setErrors({
              ...errors,
              middleName: "",
            });
          }}
          error={errors.middleName}
        />

        <CustomInput
          label="Last Name"
          placeholder="Enter Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setErrors({
              ...errors,
              lastName: "",
            });
          }}
          error={errors.lastName}
        />

        <CustomInput
          label="Email"
          placeholder="Enter Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({
              ...errors,
              email: "",
            });
          }}
          error={errors.email}
        />

        <CustomInput
          label="Phone Number"
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            setErrors({
              ...errors,
              phoneNumber: "",
            });
          }}
          error={errors.phoneNumber}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({
              ...errors,
              password: "",
            });
          }}
          error={errors.password}
        />

        <Text style={styles.label}>Role</Text>

        <RolePicker
          role={role}
          setRole={(value) => {
            setRole(value);
            setErrors({
              ...errors,
              role: "",
            });
          }}
          error={errors.role}
        />

        <PrimaryButton
          title="Register"
          onPress={handleRegister}
          loading={loading}
        />

        <Text style={styles.loginText} onPress={() => router.push("/login")}>
          Already have an account? Login
        </Text>
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

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#0D6EFD",
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 5,
    color: "#333333",
  },
});
