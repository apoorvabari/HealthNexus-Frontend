import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const saveSession = async (token: string, user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth session:", error);
  }
};

export const getUserSession = async (): Promise<UserSession | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
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
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error clearing auth session:", error);
  }
};

export const saveUserSession = saveSession;
export const clearUserSession = clearSession;
export const getSession = getUserSession;
