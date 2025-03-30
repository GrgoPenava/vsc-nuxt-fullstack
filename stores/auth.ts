import { defineStore } from "pinia";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  role: string;
  verified: boolean;
  bio?: string | null;
  language?: string;
  disabled?: Date | null;
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
      email?: string;
      firstName?: string;
      lastName?: string;
      bio?: string;
    }) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch<{ user: User }>(
          "/api/users/updateProfile",
          {
            method: "PUT",
            body: profileData,
            headers: this.getAuthHeaders,
          }
        );

        // Ažuriraj korisnika u storu
        if (response.user) {
          this.setUser(response.user);
        }

        return { success: true, message: "Profil je uspješno ažuriran" };
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

    async uploadAvatar(file: File) {
      this.setLoading(true);
      this.setError(null);

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await $fetch("/api/users/uploadAvatar", {
          method: "POST",
          body: formData,
          headers: this.getAuthHeaders,
        });

        // Dohvati osvježene podatke o korisniku
        await this.fetchCurrentUser();

        return { success: true, message: "Avatar je uspješno učitan" };
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom učitavanja avatara";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },

    // Dodajemo metodu za dohvat URL-a avatara
    async getAvatarUrl(userId: string) {
      try {
        const response = await $fetch<{ avatarUrl: string | null }>(
          `/api/users/avatar?userId=${userId}`,
          {
            headers: this.getAuthHeaders,
          }
        );
        return response.avatarUrl || null;
      } catch (error) {
        console.error("Error fetching avatar URL:", error);
        return null;
      }
    },

    // Dodajem metodu za ažuriranje jezika korisnika
    async updateLanguage(language: string) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch<{ user: User }>(
          "/api/users/updateLanguage",
          {
            method: "PUT",
            body: { language },
            headers: this.getAuthHeaders,
          }
        );

        // Ažuriraj korisnika u storu
        if (response.user) {
          this.setUser(response.user);
        }

        return { success: true, message: "Jezik je uspješno ažuriran" };
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom ažuriranja jezika";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },
  },
});
