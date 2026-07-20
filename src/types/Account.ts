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
    id: number;
    firstName: string;
    middleName: string;
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
    role: string;
    message: string;
}