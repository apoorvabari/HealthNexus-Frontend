import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

interface PasswordInputProps {
  label: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const PasswordInput = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
}: PasswordInputProps) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.passwordContainer,
          error ? styles.errorInput : null,
          isFocused ? styles.focusedInput : null
        ]}
      >
        <TextInput
          style={styles.input}
          secureTextEntry={hidePassword}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isFocused ? "#0D6EFD" : "#C0C0C0"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#0D6EFD"
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333333",
  },

  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },

  focusedInput: {
    borderColor: "#0D6EFD",
  },

  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    borderWidth: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        boxShadow: "none",
      } as any
    })
  },

  errorInput: {
    borderColor: "#FF3B30",
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 3,
  },
});
