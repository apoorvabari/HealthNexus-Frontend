import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "@healthnexus_token";
const USER_KEY = "@healthnexus_user";

export interface UserSession {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  token?: string;
  [key: string]: any;
}

const setItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn("sessionStorage not available, fallback to AsyncStorage", e);
      await AsyncStorage.setItem(key, value);
    }
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn("sessionStorage not available, fallback to AsyncStorage", e);
      return await AsyncStorage.getItem(key);
    }
  } else {
    return await AsyncStorage.getItem(key);
  }
};

const removeItem = async (key: string) => {
  if (Platform.OS === "web") {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("sessionStorage not available, fallback to AsyncStorage", e);
      await AsyncStorage.removeItem(key);
    }
  } else {
    await AsyncStorage.removeItem(key);
  }
};

export const saveSession = async (token: string, user: any): Promise<void> => {
  try {
    await setItem(TOKEN_KEY, token);
    await setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth session:", error);
  }
};

export const getUserSession = async (): Promise<UserSession | null> => {
  try {
    const token = await getItem(TOKEN_KEY);
    const userJson = await getItem(USER_KEY);
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return { ...user, token };
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await removeItem(TOKEN_KEY);
    await removeItem(USER_KEY);
  } catch (error) {
    console.error("Error clearing auth session:", error);
  }
};

export const saveUserSession = saveSession;
export const clearUserSession = clearSession;
export const getSession = getUserSession;
