<template>
  <div class="container py-8">
    <div class="max-w-4xl mx-auto">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"
        ></div>
      </div>

      <div
        v-else-if="user"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <!-- Zaglavlje profila -->
        <div class="bg-gradient-to-r from-teal-500 to-blue-500 h-32"></div>

        <div class="px-6 py-4 md:px-8">
          <div class="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
            <!-- Avatar korisnika -->
            <div class="relative">
              <template v-if="avatarUrl">
                <img
                  :src="avatarUrl"
                  :alt="user.username"
                  class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
              </template>
              <template v-else>
                <div
                  class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-teal-500 flex items-center justify-center text-white font-bold text-4xl"
                >
                  {{ getUserInitials(user) }}
                </div>
              </template>

              <!-- Badge za verifikaciju -->
              <div
                v-if="user.verified"
                :title="t('admin.verifiedUser')"
                class="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 md:h-5 md:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div class="mt-4 md:mt-0 md:ml-6 flex-grow">
              <div>
                <h1 class="text-2xl font-bold">
                  {{ user.firstName }} {{ user.lastName }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                  @{{ user.username }}
                </p>
              </div>
            </div>

            <!-- Gumb za uređivanje profila -->
            <div v-if="isOwnProfile" class="mt-4 md:mt-0">
              <NuxtLink
                to="/settings/profile"
                class="inline-flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
                {{ t("profile.editProfile") }}
              </NuxtLink>
            </div>
          </div>

          <!-- Sadržaj profila -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h2 class="text-xl font-semibold mb-4">
              {{ t("profile.aboutMe") }}
            </h2>
            <p v-if="user.bio" class="text-gray-700 dark:text-gray-300">
              {{ user.bio }}
            </p>
            <p v-else class="text-gray-500 dark:text-gray-400 italic">
              {{ t("profile.noBio") }}
            </p>
          </div>

          <!-- Dodatne sekcije profila -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h2 class="text-xl font-semibold mb-4">
              {{ t("profile.profileDetails") }}
            </h2>

            <div class="space-y-2">
              <div class="flex flex-col md:flex-row md:items-center">
                <span class="text-gray-500 dark:text-gray-400 md:w-32"
                  >{{ t("profile.memberSince") }}:</span
                >
                <span class="text-gray-700 dark:text-gray-300">
                  {{ t("profile.january") }} 2023
                </span>
              </div>

              <div class="flex flex-col md:flex-row md:items-center">
                <span class="text-gray-500 dark:text-gray-400 md:w-32"
                  >{{ t("admin.role") }}:</span
                >
                <span
                  class="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full"
                  :class="
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  "
                >
                  {{ user.role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
      >
        <p class="text-gray-700 dark:text-gray-300">
          {{ t("profile.userNotFound") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";

const route = useRoute();
const authStore = useAuthStore();
const { t } = useTranslation();
const user = computed(() => authStore.user);
const isLoading = computed(() => authStore.isLoading);
const defaultAvatar = "https://i.pravatar.cc/150?img=30";

// Funkcija za dohvat inicijala korisnika
function getUserInitials(user: any): string {
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (user.username) {
    return user.username[0].toUpperCase();
  }

  return "U";
}

// Dohvati avatar URL
const avatarUrl = ref<string | null>(null);

// Provjeri je li trenutni korisnik gleda svoj profil
const isOwnProfile = computed(() => {
  console.log("isOwnProfile");

  // Ako nema userId parametra u URL-u, onda je to vlastiti profil
  if (!route.params.userId) {
    return true;
  }

  // Inače provjeri podudaraju li se ID-evi
  return user.value?.id === route.params.userId;
});

// Dohvat avatara korisnika iz S3 bucketa
async function fetchAvatarUrl() {
  if (!user.value) return;

  try {
    const userId = route.params.userId || user.value.id;
    avatarUrl.value = await authStore.getAvatarUrl(userId as string);
    console.log("avatarUrl", avatarUrl.value);
  } catch (err) {
    console.error("Error fetching avatar:", err);
  }
}

// Dohvati podatke korisnika
onMounted(async () => {
  try {
    // Ako smo na vlastitom profilu, dohvati trenutnog korisnika
    if (!route.params.userId) {
      await authStore.fetchCurrentUser();
    } else {
      // Trebalo bi implementirati dohvat drugog korisnika prema ID-u
      await authStore.fetchCurrentUser();
    }

    // Dohvati avatar URL
    await fetchAvatarUrl();
  } catch (error) {
    console.error("Error loading profile:", error);
  }
});
</script>
