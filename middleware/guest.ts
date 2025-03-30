import { useAuthStore } from "@/stores/auth";

// Middleware za rute dostupne samo gostima (npr. login i register)
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  // Ako je korisnik već prijavljen, preusmjeri na početnu stranicu
  if (authStore.isLoggedIn) {
    return navigateTo("/");
  }
});
