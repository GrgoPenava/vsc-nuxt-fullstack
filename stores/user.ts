import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import type { User } from "./auth";

interface Role {
  id: string;
  name: string;
}

interface UserState {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    users: [],
    roles: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    setLoading(value: boolean) {
      this.isLoading = value;
    },

    setError(error: string | null) {
      this.error = error;
    },

    async fetchUsers() {
      this.setLoading(true);
      this.setError(null);

      try {
        const authStore = useAuthStore();
        const users = await $fetch<User[]>("/api/users", {
          headers: authStore.getAuthHeaders,
        });

        this.users = users;
        return users;
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom dohvata korisnika";
        this.setError(message);
        return [];
      } finally {
        this.setLoading(false);
      }
    },

    async fetchRoles() {
      this.setLoading(true);
      this.setError(null);

      try {
        const authStore = useAuthStore();
        const roles = await $fetch<Role[]>("/api/roles", {
          headers: authStore.getAuthHeaders,
        });

        this.roles = roles;
        return roles;
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom dohvata rola";
        this.setError(message);
        return [];
      } finally {
        this.setLoading(false);
      }
    },

    async updateUser(userData: {
      userId: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      roleId?: string;
      verified?: boolean;
      disabled?: boolean;
    }) {
      this.setLoading(true);
      this.setError(null);

      try {
        const authStore = useAuthStore();
        const response = await $fetch("/api/users/update", {
          method: "PUT",
          body: userData,
          headers: authStore.getAuthHeaders,
        });

        // Maknuli smo ponovno dohvaćanje korisnika jer ažuriramo lokalno
        // await this.fetchUsers();

        return { success: true, message: "Korisnik uspješno ažuriran" };
      } catch (error: any) {
        const message =
          error.data?.statusMessage ||
          "Došlo je do greške prilikom ažuriranja korisnika";
        this.setError(message);
        return { success: false, error: message };
      } finally {
        this.setLoading(false);
      }
    },
  },
});
