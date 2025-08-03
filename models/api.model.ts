

interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    data?: T;
    error?: string;
}

// Define the shape of the login response data
interface iLoginResponseData {
    user: iUser
    accessToken: string;
    refreshToken: string;
}

interface iSignupResponse {
    user: iUser
    accessToken: string;
    refreshToken: string;
}

