import { useAuthStore } from "@/stores/auth";

// Middleware za rute koje zahtijevaju autentikaciju korisnika
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  // Ako korisnik nije prijavljen, preusmjeri na login stranicu
  if (!authStore.isLoggedIn) {
    return navigateTo("/login");
  }
});
