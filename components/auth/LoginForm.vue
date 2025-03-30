<script setup lang="ts">
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";

const authStore = useAuthStore();
const router = useRouter();

// Form state
const email = ref("");
const password = ref("");
const isSubmitting = computed(() => authStore.isLoading);
const formError = ref<string | null>(null);

// Validacija forme
const loginSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(8, "Lozinka mora sadržavati najmanje 8 znakova"),
});

// Prijava korisnika
const handleLogin = async () => {
  try {
    // Validiraj formu
    loginSchema.parse({
      email: email.value,
      password: password.value,
    });

    // Resetiraj grešku
    formError.value = null;

    // Pokušaj prijavu
    const result = await authStore.login(email.value, password.value);

    if (result.success) {
      // Uspješna prijava
      toast({
        title: "Uspješna prijava",
        description: "Uspješno ste prijavljeni u sustav",
        variant: "default",
      });
      router.push("/");
    } else {
      // Neuspješna prijava
      formError.value = result.error || "Došlo je do greške prilikom prijave";
      toast({
        title: "Greška prilikom prijave",
        description: formError.value || "Došlo je do greške prilikom prijave",
        variant: "destructive",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Greška validacije
      formError.value = error.errors[0].message;
      toast({
        title: "Pogrešan unos",
        description: formError.value || "Pogrešan unos podataka",
        variant: "destructive",
      });
    } else {
      // Ostale greške
      formError.value = "Došlo je do greške prilikom prijave";
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave",
        variant: "destructive",
      });
    }
  }
};
</script>

<template>
  <div class="w-full max-w-md mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Prijava</h1>
      <p class="text-muted-foreground mt-2">Unesite svoje podatke za prijavu</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="vas@email.com"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm font-medium"
            >Lozinka</label
          >
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-blue-600 hover:underline"
          >
            Zaboravili ste lozinku?
          </NuxtLink>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="********"
          :disabled="isSubmitting"
        />
      </div>

      <div v-if="formError" class="text-red-500 text-sm">
        {{ formError }}
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        :disabled="isSubmitting"
      >
        <template v-if="isSubmitting"> Prijavljivanje... </template>
        <template v-else> Prijavi se </template>
      </button>
    </form>

    <div class="text-center text-sm">
      Nemate račun?
      <NuxtLink to="/register" class="text-blue-600 hover:underline">
        Registrirajte se
      </NuxtLink>
    </div>
  </div>
</template>
