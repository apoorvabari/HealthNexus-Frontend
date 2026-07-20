import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  Platform,
} from "react-native";

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
}

const CustomInput = ({ label, error, ...props }: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          error ? styles.errorInput : null,
          isFocused ? styles.focusedInput : null
        ]}
        placeholderTextColor={isFocused ? "#0D6EFD" : "#C0C0C0"}
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) {
            props.onFocus(e);
          }
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) {
            props.onBlur(e);
          }
        }}
        {...props}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default CustomInput;

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

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any
    })
  },

  focusedInput: {
    borderColor: "#0D6EFD",
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
