export interface RegisterRequest {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phoneNumber: string;
}

export interface RegisterResponse {
    id: string | number;
    userId?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    role: string;
    message: string;
    phoneNumber: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id?: string | number;
    userId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
    message: string;
}

export interface LogoutResponse {
    message: string;
}

export interface PasswordResetRequest {
    email: string;
    newPassword: string;
    confirmPassword: string;
}