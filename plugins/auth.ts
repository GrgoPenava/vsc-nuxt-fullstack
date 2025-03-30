import { useAuthStore } from "@/stores/auth";

export default defineNuxtPlugin(async () => {
  // Dohvati auth store
  const authStore = useAuthStore();

  // Inicijaliziraj auth stanje
  authStore.init();
});
