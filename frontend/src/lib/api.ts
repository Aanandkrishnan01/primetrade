/**
 * API client for communicating with the FastAPI backend.
 * Handles JWT token management and request/response formatting.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  detail: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  setToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  clearToken(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  setUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        detail: data.detail || "An unexpected error occurred",
        status: response.status,
      };
      throw error;
    }

    return data as T;
  }

  // --- Auth ---
  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    this.setToken(response.access_token);
    this.setUser(response.user);
    return response;
  }

  async login(data: LoginData): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    this.setUser(response.user);
    return response;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/v1/auth/me");
  }

  logout(): void {
    this.clearToken();
  }

  // --- Tasks ---
  async getTasks(params?: TaskQueryParams): Promise<TaskListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page)
      searchParams.set("per_page", params.per_page.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.all) searchParams.set("all", "true");

    const query = searchParams.toString();
    return this.request<TaskListResponse>(
      `/api/v1/tasks/${query ? `?${query}` : ""}`
    );
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/api/v1/tasks/${id}`);
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    return this.request<Task>("/api/v1/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    return this.request<Task>(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // --- Users (Admin) ---
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/api/v1/users/");
  }
}

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface TaskQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  priority?: string;
  search?: string;
  all?: boolean;
}

export const api = new ApiClient(API_BASE);
