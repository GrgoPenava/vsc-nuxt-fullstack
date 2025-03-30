import { defineStore } from "pinia";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  verified: boolean;
  bio?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    getUser: (state: AuthState) => state.user,
    getToken: (state: AuthState) => state.token,
    isLoggedIn: (state: AuthState) => !!state.token && !!state.user,
    isAdmin: (state: AuthState) => !!state.user && state.user.role === "admin",
    getAuthHeaders: (state: AuthState): Record<string, string> => {
      return state.token ? { Authorization: `Bearer ${state.token}` } : {};
    },
  },

  actions: {
    setLoading(value: boolean) {
      this.isLoading = value;
    },

    setError(error: string | null) {
      this.error = error;
    },

    setToken(token: string) {
      this.token = token;
      // Spremi token u local storage
      if (process.client) {
        localStorage.setItem("auth_token", token);
      }
    },

    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = true;
    },

    async login(email: string, password: string) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch<{ token: string; user: User }>(
          "/api/auth/login",
          {
            method: "POST",
            body: { email, password },
          }
        );

        // Postavi token i korisničke podatke
        this.setToken(response.token);
        this.setUser(response.user);

        return { success: true };
      } catch (error: any) {
        const message =
          error.data?.statusMessage || "Došlo je do greške prilikom prijave";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },

    async register(userData: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      confirmPassword: string;
    }) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch<{ message: string }>(
          "/api/auth/register",
          {
            method: "POST",
            body: userData,
          }
        );

        return { success: true, message: response.message };
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom registracije";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },

    async logout() {
      // Očisti stanje
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      // Očisti local storage
      if (process.client) {
        localStorage.removeItem("auth_token");
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return;

      this.setLoading(true);

      try {
        const user = await $fetch<User>("/api/auth/me", {
          headers: this.getAuthHeaders,
        });

        this.setUser(user);
      } catch (error) {
        this.logout();
      } finally {
        this.setLoading(false);
      }
    },

    // Inicijalizacija pri pokretanju aplikacije
    init() {
      if (process.client) {
        // Dohvati token iz local storage
        const token = localStorage.getItem("auth_token");

        if (token) {
          this.token = token;
          this.fetchCurrentUser();
        }
      }
    },

    async updateProfile(profileData: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      avatar?: string;
      currentPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    }) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch<{ message: string; user: User }>(
          "/api/users/update-profile",
          {
            method: "PUT",
            body: profileData,
            headers: this.getAuthHeaders,
          }
        );

        // Ažuriraj korisničke podatke u store-u
        this.setUser(response.user);

        return { success: true, message: response.message };
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom ažuriranja profila";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },
  },
});
