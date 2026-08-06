import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from "react-native";

export interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
  darkTheme?: boolean;
}

export default function PasswordInput({ label, error, style, darkTheme = true, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, darkTheme ? styles.labelDark : null]}>{label}</Text>
      ) : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            darkTheme ? styles.inputDark : null,
            error ? styles.inputError : null,
            style,
          ]}
          secureTextEntry={!showPassword}
          placeholderTextColor={darkTheme ? "#94A3B8" : "#94A3B8"}
          {...props}
        />
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Text style={[styles.toggleText, darkTheme ? styles.toggleTextDark : null]}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  labelDark: {
    color: "#334155",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    paddingRight: 64,
    fontSize: 15,
    color: "#0F172A",
  },
  inputDark: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  toggleBtn: {
    position: "absolute",
    right: 14,
    padding: 6,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },
  toggleTextDark: {
    color: "#0284C7",
  },
  errorText: {
    fontSize: 12,
    color: "#F87171",
    marginTop: 4,
  },
});
