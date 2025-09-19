// Authentication service for API calls
const API_BASE_URL = 'http://localhost:5002';

export interface SignupData {
  phone: string;
  gmail: string;
  username: string;
  password: string;
  name?: string;
}

export interface SigninData {
  identifier: string; // phone, gmail, or username
  password: string;
}

export interface User {
  id: number;
  phone: string;
  gmail: string;
  username: string;
  name: string;
  created_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
  error?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup request failed');
    }
  }

  async signin(data: SigninData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Signin failed');
      }

      // Store token in localStorage and memory
      if (result.token) {
        this.token = result.token;
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signin request failed');
    }
  }

  async getProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get profile');
      }

      return result.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile request failed');
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Get auth headers for API requests
  getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;