<script setup lang="ts">
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useTranslation } from "@/composables/useTranslation";

const authStore = useAuthStore();
const router = useRouter();
const { t } = useTranslation();

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
    username: z.string().min(3, t("errors.minLength").replace("{min}", "3")),
    email: z.string().email(t("errors.invalidEmail")),
    firstName: z.string().min(1, t("errors.required")),
    lastName: z.string().min(1, t("errors.required")),
    password: z.string().regex(passwordRegex, t("auth.passwordRules")),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("errors.passwordsNoMatch"),
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
        title: t("auth.registerSuccess"),
        description: t("auth.registerSuccessMessage"),
        variant: "default",
      });
      router.push("/login");
    } else {
      // Neuspješna registracija
      formError.value = result.error || t("errors.register");
      toast({
        title: t("errors.register"),
        description: formError.value || t("errors.register"),
        variant: "destructive",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Greška validacije
      formError.value = error.errors[0].message;
      toast({
        title: t("errors.validationFailed"),
        description: formError.value || t("errors.validationFailed"),
        variant: "destructive",
      });
    } else {
      // Ostale greške
      formError.value = t("errors.register");
      toast({
        title: t("errors.general"),
        description: t("errors.register"),
        variant: "destructive",
      });
    }
  }
};
</script>

<template>
  <div class="w-full max-w-lg mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold">{{ t("auth.registerTitle") }}</h1>
      <p class="text-muted-foreground mt-2">{{ t("auth.registerSubtitle") }}</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="firstName" class="block text-sm font-medium">{{
            t("auth.firstName")
          }}</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            :placeholder="t('auth.firstNamePlaceholder')"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <label for="lastName" class="block text-sm font-medium">{{
            t("auth.lastName")
          }}</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            :placeholder="t('auth.lastNamePlaceholder')"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium">{{
          t("auth.username")
        }}</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          class="w-full px-3 py-2 border rounded-md"
          :placeholder="t('auth.usernamePlaceholder')"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium">{{
          t("auth.email")
        }}</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          :placeholder="t('auth.emailPlaceholder')"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium">{{
          t("auth.password")
        }}</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="********"
          :disabled="isSubmitting"
        />
        <p class="text-xs text-muted-foreground mt-1">
          {{ t("auth.passwordRules") }}
        </p>
      </div>

      <div class="space-y-2">
        <label for="confirmPassword" class="block text-sm font-medium">{{
          t("auth.confirmPassword")
        }}</label>
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
        <template v-if="isSubmitting"> {{ t("auth.registering") }} </template>
        <template v-else> {{ t("auth.register") }} </template>
      </button>
    </form>

    <div class="text-center text-sm">
      {{ t("auth.haveAccount") }}
      <NuxtLink to="/login" class="text-blue-600 hover:underline">
        {{ t("auth.login") }}
      </NuxtLink>
    </div>
  </div>
</template>
