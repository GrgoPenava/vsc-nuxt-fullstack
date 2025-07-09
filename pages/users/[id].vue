<template>
  <div class="container py-8">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else-if="user" class="max-w-4xl mx-auto">
      <!-- User profile header -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6"
      >
        <!-- Header background -->
        <div class="bg-gradient-to-r from-teal-500 to-blue-500 h-32"></div>

        <div class="px-6 py-4 md:px-8">
          <div class="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
            <!-- User avatar -->
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
                  <font-awesome-icon icon="fas fa-user" class="text-4xl" />
                </div>
              </template>

              <!-- Verification badge -->
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
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ user.firstName }} {{ user.lastName }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                  @{{ user.username }}
                </p>
              </div>
            </div>
          </div>

          <!-- User bio -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h2
              class="text-xl font-semibold mb-4 text-gray-900 dark:text-white"
            >
              {{ t("profile.aboutMe") }}
            </h2>
            <p v-if="user.bio" class="text-gray-700 dark:text-gray-300">
              {{ user.bio }}
            </p>
            <p v-else class="text-gray-500 dark:text-gray-400 italic">
              {{ t("profile.noBio") }}
            </p>
          </div>

          <!-- User details -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h2
              class="text-xl font-semibold mb-4 text-gray-900 dark:text-white"
            >
              {{ t("profile.profileDetails") }}
            </h2>

            <div class="space-y-2">
              <div class="flex flex-col md:flex-row md:items-center">
                <span class="text-gray-500 dark:text-gray-400 md:w-32"
                  >{{ t("profile.memberSince") }}:</span
                >
                <span class="text-gray-700 dark:text-gray-300">
                  {{ formatDate(user.createdAt) }}
                </span>
              </div>

              <div class="flex flex-col md:flex-row md:items-center">
                <span class="text-gray-500 dark:text-gray-400 md:w-32"
                  >{{ t("admin.role") }}:</span
                >
                <span
                  class="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full"
                  :class="
                    user.role.name === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  "
                >
                  {{ user.role.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs for profiles and comments -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex -mb-px" aria-label="Tabs">
            <button
              @click="activeTab = 'profiles'"
              class="px-6 py-3 border-b-2 font-medium text-sm focus:outline-none"
              :class="
                activeTab === 'profiles'
                  ? 'border-teal-500 text-teal-500 dark:text-teal-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-300'
              "
            >
              {{ t("users.profiles") }}
              <span v-if="!isLoadingProfiles">({{ userProfiles.length }})</span>
              <span v-else>({{ t("common.loading") }})</span>
            </button>
            <button
              @click="activeTab = 'comments'"
              class="px-6 py-3 border-b-2 font-medium text-sm focus:outline-none"
              :class="
                activeTab === 'comments'
                  ? 'border-teal-500 text-teal-500 dark:text-teal-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-300'
              "
            >
              {{ t("users.comments") }}
              <span
                v-if="
                  userComments.length > 0 ||
                  (activeTab === 'comments' && !isLoadingComments)
                "
                >({{ userComments.length }})</span
              >
              <span v-else-if="activeTab === 'comments' && isLoadingComments"
                >({{ t("common.loading") }})</span
              >
            </button>
          </nav>
        </div>

        <!-- User profiles -->
        <div v-if="activeTab === 'profiles'" class="p-6">
          <div v-if="isLoadingProfiles" class="flex justify-center py-10">
            <div
              class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"
            ></div>
          </div>

          <div
            v-else-if="userProfiles.length === 0"
            class="text-center py-10 text-gray-500 dark:text-gray-400"
          >
            {{ t("users.noProfiles") }}
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="profile in userProfiles"
              :key="profile.id"
              class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden"
            >
              <div
                v-if="profile.imageUrls && profile.imageUrls.length > 0"
                class="h-48"
              >
                <img
                  :src="profile.imageUrls[0].url"
                  alt=""
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
              >
                <span class="text-gray-500 dark:text-gray-400">{{
                  t("profiles.noImage")
                }}</span>
              </div>

              <div class="p-4">
                <NuxtLink :to="`/profiles/${profile.id}`" class="block">
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white hover:text-teal-500 dark:hover:text-teal-400 transition-colors mb-2"
                  >
                    {{ profile.name }}
                  </h3>
                </NuxtLink>

                <p
                  class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2"
                >
                  {{ profile.description }}
                </p>

                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center space-x-4">
                    <span
                      class="flex items-center text-gray-500 dark:text-gray-400"
                    >
                      <font-awesome-icon icon="fas fa-thumbs-up" class="mr-1" />
                      {{ profile.likeCount }}
                    </span>
                    <span
                      class="flex items-center text-gray-500 dark:text-gray-400"
                    >
                      <font-awesome-icon icon="fas fa-comment" class="mr-1" />
                      {{ profile.comments?.length || 0 }}
                    </span>
                  </div>
                  <span class="text-gray-500 dark:text-gray-400">{{
                    formatDate(profile.createdAt)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User comments -->
        <div v-if="activeTab === 'comments'" class="p-6">
          <div v-if="isLoadingComments" class="flex justify-center py-10">
            <div
              class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"
            ></div>
          </div>

          <div
            v-else-if="userComments.length === 0"
            class="text-center py-10 text-gray-500 dark:text-gray-400"
          >
            {{ t("users.noComments") }}
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="comment in userComments"
              :key="comment.id"
              class="bg-white dark:bg-gray-700 rounded-lg shadow p-4"
            >
              <p class="text-gray-700 dark:text-gray-300 mb-3">
                {{ comment.content }}
              </p>

              <div class="flex items-center justify-between text-sm">
                <NuxtLink
                  :to="`/profiles/${comment.profileId}`"
                  class="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-500 transition-colors"
                >
                  {{ comment.profile?.name || comment.profileId }}
                </NuxtLink>
                <span class="text-gray-500 dark:text-gray-400">{{
                  formatDate(comment.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center"
    >
      <p class="text-gray-700 dark:text-gray-300">
        {{ t("profile.userNotFound") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";

interface UserProfile {
  id: string;
  name: string;
  description: string;
  likeCount: number;
  dislikeCount?: number;
  comments?: any[];
  createdAt: string;
  imageUrls?: { url: string }[];
  user?: {
    id: string;
    username: string;
  };
}

interface UserComment {
  id: string;
  content: string;
  createdAt: string;
  profileId: string;
  profile?: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role: { name: string };
  verified: boolean;
  avatar?: string | null;
  createdAt?: string;
}

const route = useRoute();
const authStore = useAuthStore();
const { t } = useTranslation();

// State
const user = ref<User | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const avatarUrl = ref<string | null>(null);
const activeTab = ref("profiles");
const userProfiles = ref<UserProfile[]>([]);
const userComments = ref<UserComment[]>([]);
const isLoadingProfiles = ref(false);
const isLoadingComments = ref(false);

// User ID from route params
const userId = computed(() => route.params.id as string);

// Function to get user initials
function getUserInitials(user: User): string {
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const username = user.username || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (username) {
    return username[0].toUpperCase();
  }

  return "?";
}

// Format date
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return t("common.today");
  } else if (diffDays === 1) {
    return t("common.yesterday");
  } else if (diffDays < 7) {
    return diffDays + " " + t("common.days");
  } else {
    return new Date(dateString).toLocaleDateString();
  }
}

// Fetch user data
async function fetchUserData() {
  try {
    isLoading.value = true;
    error.value = null;

    // Fetch user profile using public API
    const { data: userData, error: userError } = await useFetch<User>(
      `/api/public/users/${userId.value}`
    );

    if (userError.value) {
      error.value = userError.value.message || "Failed to load user profile";
      return;
    }

    if (userData.value) {
      user.value = userData.value;
    }

    // Fetch avatar URL
    if (user.value && user.value.avatar) {
      avatarUrl.value = await authStore.getPublicAvatarUrl(userId.value);
    }
  } catch (err: any) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user profile";
  } finally {
    isLoading.value = false;
  }
}

// Fetch user's VSCode profiles
async function fetchUserProfiles() {
  try {
    isLoadingProfiles.value = true;

    const { data, error: profilesError } = await useFetch<UserProfile[]>(
      `/api/public/users/${userId.value}/profiles`
    );

    if (profilesError.value) {
      console.error("Error fetching user profiles:", profilesError.value);
      return;
    }

    if (data.value) {
      userProfiles.value = data.value;
    }
  } catch (err: any) {
    console.error("Error fetching user profiles:", err);
  } finally {
    isLoadingProfiles.value = false;
  }
}

// Fetch user's comments
async function fetchUserComments() {
  try {
    isLoadingComments.value = true;

    const { data, error: commentsError } = await useFetch<UserComment[]>(
      `/api/public/users/${userId.value}/comments`
    );

    if (commentsError.value) {
      console.error("Error fetching user comments:", commentsError.value);
      return;
    }

    if (data.value) {
      userComments.value = data.value;
    }
  } catch (err: any) {
    console.error("Error fetching user comments:", err);
  } finally {
    isLoadingComments.value = false;
  }
}

// Load initial data
onMounted(async () => {
  await fetchUserData();

  // Učitaj obje vrste podataka odjednom
  fetchUserProfiles();
  fetchUserComments();
});

// Watch activeTab changes (više nam nije potrebno jer već učitavamo sve podatke)
// watch(activeTab, async (newTab) => {
//   if (newTab === 'profiles' && userProfiles.value.length === 0) {
//     await fetchUserProfiles();
//   } else if (newTab === 'comments' && userComments.value.length === 0) {
//     await fetchUserComments();
//   }
// });
</script>
