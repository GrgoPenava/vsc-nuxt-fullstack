<script setup lang="ts">
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useTranslation } from "@/composables/useTranslation";

const authStore = useAuthStore();
const router = useRouter();
const { t } = useTranslation();

// Form state
const email = ref("");
const password = ref("");
const isSubmitting = computed(() => authStore.isLoading);
const formError = ref<string | null>(null);

// Validacija forme
const loginSchema = z.object({
  email: z.string().email(t("errors.invalidEmail")),
  password: z.string().min(8, t("errors.minLength").replace("{min}", "8")),
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
        title: t("auth.loginSuccess"),
        description: t("auth.loginSuccessMessage"),
        variant: "default",
      });
      router.push("/");
    } else {
      // Neuspješna prijava
      formError.value = result.error || t("errors.login");
      toast({
        title: t("errors.login"),
        description: formError.value || t("errors.login"),
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
      formError.value = t("errors.login");
      toast({
        title: t("errors.general"),
        description: t("errors.login"),
        variant: "destructive",
      });
    }
  }
};
</script>

<template>
  <div class="w-full max-w-md mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold">{{ t("auth.loginTitle") }}</h1>
      <p class="text-muted-foreground mt-2">{{ t("auth.loginSubtitle") }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium">{{
          t("auth.email")
        }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          :placeholder="t('auth.emailPlaceholder')"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm font-medium">{{
            t("auth.password")
          }}</label>
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ t("auth.forgotPassword") }}
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
        <template v-if="isSubmitting"> {{ t("auth.loggingIn") }} </template>
        <template v-else> {{ t("auth.login") }} </template>
      </button>
    </form>

    <div class="text-center text-sm">
      {{ t("auth.noAccount") }}
      <NuxtLink to="/register" class="text-blue-600 hover:underline">
        {{ t("auth.register") }}
      </NuxtLink>
    </div>
  </div>
</template>
