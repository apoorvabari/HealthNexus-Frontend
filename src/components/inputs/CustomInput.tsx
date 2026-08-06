import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";

export interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  darkTheme?: boolean;
}

export default function CustomInput({ label, error, style, darkTheme = true, ...props }: CustomInputProps) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, darkTheme ? styles.labelDark : null]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          darkTheme ? styles.inputDark : null,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={darkTheme ? "#94A3B8" : "#94A3B8"}
        {...props}
      />
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
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
  errorText: {
    fontSize: 12,
    color: "#F87171",
    marginTop: 4,
  },
});
