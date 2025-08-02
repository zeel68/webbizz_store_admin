import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { getSession } from "next-auth/react";

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

class ApiClient {
  mode = process.env.NODE_ENV || "production";
  private baseURL: string = "http://localhost:5050/api";
  private axiosInstance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      ...config,
    });

    // Add request interceptor to include auth token
    // this.axiosInstance.interceptors.request.use(
    //   async (config) => {
    //     try {
    //       const session = await getSession()
    //       if (session?.accessToken) {
    //         config.headers.Authorization = `Bearer ${session.accessToken}`
    //       }
    //     } catch (error) {
    //       console.warn("Failed to get session for API request:", error)
    //     }
    //     return config
    //   },
    //   (error) => {
    //     return Promise.reject(error)
    //   },
    // )

    // Add response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token might be expired, you can implement refresh logic here
          console.warn("API request failed with 401, token might be expired");
        }
        return Promise.reject(error);
      },
    );
  }

  private async handleRequest<T>(
    request: Promise<AxiosResponse<T>>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await request;
      return { success: true, data: response.data };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return { success: false, error: error.response.data };
      } else {
        return { success: false, error: { message: error.message } };
      }
    }
  }

  public async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.get<T>(endpoint, config));
  }

  public async post<T>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(
      this.axiosInstance.post<T>(endpoint, data, config),
    );
  }

  public async put<T>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(
      this.axiosInstance.put<T>(endpoint, data, config),
    );
  }

  public async delete<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(
      this.axiosInstance.delete<T>(endpoint, { ...config, data }),
    );
  }

  public async patch<T>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(
      this.axiosInstance.patch<T>(endpoint, data, config),
    );
  }

  public async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.handleRequest(
      this.axiosInstance.request<T>({ method, url: endpoint, data, ...config }),
    );
  }
}

export default ApiClient;
