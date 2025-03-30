<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-8">{{ t("profile.editProfile") }}</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Avatar sekcija -->
        <div class="md:col-span-1">
          <h2 class="text-lg font-medium mb-4">Avatar</h2>

          <AvatarUpload v-if="user" :userId="user.id" />
        </div>

        <!-- Forma za uređivanje profila -->
        <div class="md:col-span-2">
          <h2 class="text-lg font-medium mb-4">
            {{ t("profile.personalInfo") }}
          </h2>

          <form @submit.prevent="updateProfile" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium mb-1">{{
                t("auth.username")
              }}</label>
              <input
                id="username"
                v-model="profileForm.username"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                :placeholder="t('auth.username')"
                disabled
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ t("profile.usernameCannotBeChanged") }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium mb-1">{{
                t("auth.email")
              }}</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="w-full px-3 py-2 border rounded-md"
                :placeholder="t('auth.email')"
              />
            </div>

            <!-- Ime i prezime -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium mb-1">{{
                  t("auth.firstName")
                }}</label>
                <input
                  id="firstName"
                  v-model="profileForm.firstName"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md"
                  :placeholder="t('auth.firstName')"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium mb-1">{{
                  t("auth.lastName")
                }}</label>
                <input
                  id="lastName"
                  v-model="profileForm.lastName"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md"
                  :placeholder="t('auth.lastName')"
                />
              </div>
            </div>

            <!-- Bio -->
            <div>
              <label for="bio" class="block text-sm font-medium mb-1">{{
                t("profile.bio")
              }}</label>
              <textarea
                id="bio"
                v-model="profileForm.bio"
                rows="4"
                class="w-full px-3 py-2 border rounded-md resize-none"
                :placeholder="t('profile.bioPlaceholder')"
              ></textarea>
            </div>

            <!-- Greška -->
            <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-md">
              {{ error }}
            </div>

            <!-- Gumbi -->
            <div class="flex justify-end space-x-3 pt-4">
              <NuxtLink
                to="/profile"
                class="px-4 py-2 border border-gray-300 rounded-md"
              >
                {{ t("profile.cancel") }}
              </NuxtLink>
              <button
                type="submit"
                class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                :disabled="isLoading"
              >
                <span v-if="isLoading">{{ t("common.loading") }}</span>
                <span v-else>{{ t("profile.saveChanges") }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";
import { useTranslation } from "@/composables/useTranslation";

definePageMeta({
  middleware: ["auth"], // Koristimo auth middleware da osiguramo da je korisnik prijavljen
});

const router = useRouter();
const authStore = useAuthStore();
const { t, getTranslation } = useTranslation();
const isLoading = ref(false);
const error = ref("");
const user = computed(() => authStore.user);

// Forma za uređivanje profila
const profileForm = reactive({
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  bio: "",
});

// Popuni formu s trenutnim podacima korisnika
onMounted(() => {
  if (user.value) {
    profileForm.username = user.value.username || "";
    profileForm.email = user.value.email || "";
    profileForm.firstName = user.value.firstName || "";
    profileForm.lastName = user.value.lastName || "";
    profileForm.bio = user.value.bio || "";
  }
});

// Funkcija za ažuriranje profila
async function updateProfile() {
  try {
    isLoading.value = true;
    error.value = "";

    // Pozovi API za ažuriranje profila
    const result = await authStore.updateProfile({
      email: profileForm.email,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      bio: profileForm.bio,
    });

    if (result.success) {
      toast({
        title: t("common.success"),
        description: t("profile.updateSuccess"),
        variant: "default",
      });

      // Preusmjeri na profil
      router.push("/profile");
    } else {
      error.value = result.error || t("errors.profile");
      toast({
        title: t("common.error"),
        description: error.value,
        variant: "destructive",
      });
    }
  } catch (err: any) {
    error.value = err.message || t("errors.profile");
    toast({
      title: t("common.error"),
      description: error.value,
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
