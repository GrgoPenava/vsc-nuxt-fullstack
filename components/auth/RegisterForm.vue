<script setup lang="ts">
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";

const authStore = useAuthStore();
const router = useRouter();

// Form state
const formData = reactive({
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
});

const isSubmitting = computed(() => authStore.isLoading);
const formError = ref<string | null>(null);

// Regularni izraz za provjeru lozinke: najmanje 6 znakova, 1 veliko slovo i 1 poseban znak
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/;

// Validacija forme
const registerSchema = z
  .object({
    username: z.string().min(3, "Korisničko ime mora imati barem 3 znaka"),
    email: z.string().email("Unesite važeću email adresu"),
    firstName: z.string().min(1, "Ime je obavezno"),
    lastName: z.string().min(1, "Prezime je obavezno"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i jedan poseban znak"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Lozinke se ne podudaraju",
    path: ["confirmPassword"],
  });

// Registracija korisnika
const handleRegister = async () => {
  try {
    // Validiraj formu
    registerSchema.parse(formData);

    // Resetiraj grešku
    formError.value = null;

    // Pokušaj registraciju
    const result = await authStore.register({
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (result.success) {
      // Uspješna registracija
      toast({
        title: "Uspješna registracija",
        description: "Račun je uspješno kreiran. Možete se prijaviti.",
        variant: "default",
      });
      router.push("/login");
    } else {
      // Neuspješna registracija
      formError.value =
        result.error || "Došlo je do greške prilikom registracije";
      toast({
        title: "Greška prilikom registracije",
        description:
          formError.value || "Došlo je do greške prilikom registracije",
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
      formError.value = "Došlo je do greške prilikom registracije";
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom registracije",
        variant: "destructive",
      });
    }
  }
};
</script>

<template>
  <div class="w-full max-w-lg mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Registracija</h1>
      <p class="text-muted-foreground mt-2">Kreirajte novi korisnički račun</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="firstName" class="block text-sm font-medium">Ime</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="Vaše ime"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <label for="lastName" class="block text-sm font-medium"
            >Prezime</label
          >
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="Vaše prezime"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium"
          >Korisničko ime</label
        >
        <input
          id="username"
          v-model="formData.username"
          type="text"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="korisnicko_ime"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="vas@email.com"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium">Lozinka</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="********"
          :disabled="isSubmitting"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Lozinka mora sadržavati najmanje 6 znakova, jedno veliko slovo i jedan
          poseban znak.
        </p>
      </div>

      <div class="space-y-2">
        <label for="confirmPassword" class="block text-sm font-medium"
          >Potvrda lozinke</label
        >
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
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
        <template v-if="isSubmitting"> Učitavanje... </template>
        <template v-else> Registriraj se </template>
      </button>
    </form>

    <div class="text-center text-sm">
      Već imate račun?
      <NuxtLink to="/login" class="text-blue-600 hover:underline">
        Prijavite se
      </NuxtLink>
    </div>
  </div>
</template>
