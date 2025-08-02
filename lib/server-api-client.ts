import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { auth } from "@/auth"

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: any
}

class ServerApiClient {
  mode = process.env.NODE_ENV || "development"
  private baseURL: string = this.mode === "development" ? "http://localhost:5050/api" : "https://api.example.com"
  private axiosInstance: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      ...config,
    })
  }

  private async getAuthHeaders() {
    try {
      const session = await auth()
      if (session?.accessToken) {
        return {
          Authorization: `Bearer ${session.accessToken}`,
        }
      }
    } catch (error) {
      console.warn("Failed to get session for server API request:", error)
    }
    return {}
  }

  private async handleRequest<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    try {
      const response = await request
      return { success: true, data: response.data }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return { success: false, error: error.response.data }
      } else {
        return { success: false, error: { message: error.message } }
      }
    }
  }

  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    return this.handleRequest(
      this.axiosInstance.get<T>(endpoint, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    )
  }

  public async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    return this.handleRequest(
      this.axiosInstance.post<T>(endpoint, data, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    )
  }

  public async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    return this.handleRequest(
      this.axiosInstance.put<T>(endpoint, data, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    )
  }

  public async delete<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    return this.handleRequest(
      this.axiosInstance.delete<T>(endpoint, {
        ...config,
        data,
        headers: { ...authHeaders, ...config?.headers },
      }),
    )
  }

  public async patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    return this.handleRequest(
      this.axiosInstance.patch<T>(endpoint, data, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    )
  }
}

export default ServerApiClient
