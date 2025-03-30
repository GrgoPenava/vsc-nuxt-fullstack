import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  // Middleware se izvršava samo na klijentskoj strani
  if (process.server) return;

  const authStore = useAuthStore();

  // Ako korisnik nije prijavljen, preusmjeri na login
  if (!authStore.isLoggedIn) {
    return navigateTo("/login");
  }

  // Ako korisnik nije admin, preusmjeri na početnu stranicu
  if (!authStore.isAdmin) {
    return navigateTo("/");
  }
});
