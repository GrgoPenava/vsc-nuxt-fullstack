<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold dark:text-white">
        {{ t("profiles.title") }}
      </h1>
      <NuxtLink
        v-if="isLoggedIn"
        to="/profiles/create"
        class="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
      >
        {{ t("profiles.createProfile") }}
      </NuxtLink>
      <button
        v-else
        @click="handleCreateProfileClick"
        class="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
      >
        {{ t("profiles.createProfile") }}
      </button>
    </div>

    <!-- Filteri i pretraga -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('common.search')"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            @input="debounceSearch"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="sortBy"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            @change="loadProfiles"
          >
            <option value="recent">{{ t("profiles.sortRecent") }}</option>
            <option value="oldest">{{ t("profiles.sortOldest") }}</option>
            <option value="popular">{{ t("profiles.sortPopular") }}</option>
            <option value="name">{{ t("profiles.sortName") }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista profila -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="loader"></div>
    </div>

    <div v-else-if="profiles.length === 0" class="text-center py-12">
      <p class="text-xl text-gray-600 dark:text-gray-400">
        {{ t("profiles.noProfiles") }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="profile in profiles"
        :key="profile.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
      >
        <NuxtLink :to="`/profiles/${profile.id}`">
          <div class="h-40 bg-gray-200 dark:bg-gray-700 relative">
            <img
              v-if="profile.previewImageUrl"
              :src="profile.previewImageUrl"
              alt=""
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"
            >
              <span>{{ t("profiles.noImage") }}</span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex justify-between items-start">
              <h2
                class="text-xl font-semibold text-gray-800 dark:text-white mb-2"
              >
                {{ profile.name }}
              </h2>
              <div
                class="flex items-center text-sm text-gray-600 dark:text-gray-400"
              >
                <font-awesome-icon
                  icon="far fa-thumbs-up"
                  class="w-5 h-5 mr-2"
                />
                <span>{{ profile.likeCount }}</span>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {{ profile.description }}
            </p>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <img
                  v-if="profile.user?.avatar"
                  :src="profile.user.avatar"
                  alt=""
                  class="w-8 h-8 rounded-full mr-2 object-cover border-2 border-teal-400"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full mr-2 bg-teal-500 flex items-center justify-center text-white border-2 border-teal-400"
                >
                  <font-awesome-icon icon="fas fa-user" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ profile.user?.username }}
                </span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-500">
                {{ formatDate(profile.createdAt) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Paginacija -->
    <div
      v-if="profiles.length > 0 && totalPages > 1"
      class="flex justify-center mt-8"
    >
      <div class="flex space-x-1">
        <button
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-md dark:bg-gray-800 dark:text-white disabled:opacity-50"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in paginationRange"
          :key="page"
          :class="[
            'px-4 py-2 rounded-md',
            page === currentPage
              ? 'bg-teal-500 text-white'
              : 'dark:bg-gray-800 dark:text-white',
          ]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-md dark:bg-gray-800 dark:text-white disabled:opacity-50"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";
import { debounce } from "lodash-es";
import { useToast } from "@/components/ui/toast/use-toast";
import { useRouter } from "vue-router";

const { t } = useTranslation();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const { toast } = useToast();
const router = useRouter();

// Stanje
const profiles = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");
const sortBy = ref("recent");
const currentPage = ref(1);
const totalPages = ref(0);
const totalProfiles = ref(0);
const itemsPerPage = ref(9);

// Računata svojstva za paginaciju
const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  const halfVisible = Math.floor(maxVisiblePages / 2);

  let start = Math.max(1, currentPage.value - halfVisible);
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

// Metode
async function loadProfiles() {
  try {
    loading.value = true;
    error.value = null;

    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.value.toString(),
      sort: sortBy.value,
    });

    if (searchQuery.value) {
      queryParams.append("search", searchQuery.value);
    }

    const { data } = await useFetch(
      `/api/public/profiles?${queryParams.toString()}`
    );

    if (data.value) {
      profiles.value = data.value.profiles;
      totalPages.value = data.value.totalPages;
      totalProfiles.value = data.value.total;
    }
  } catch (err: any) {
    console.error("Error loading profiles:", err);
    error.value = err.message || "Failed to load profiles";
  } finally {
    loading.value = false;
  }
}

// Debounce za pretragu
const debounceSearch = debounce(() => {
  currentPage.value = 1;
  loadProfiles();
}, 300);

function changePage(page: number) {
  currentPage.value = page;
  loadProfiles();
}

function formatDate(dateString: string) {
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

// Funkcija za preusmjeravanje neprijavljenih korisnika
function handleCreateProfileClick() {
  toast({
    title: t("common.error"),
    description: t("profiles.loginRequired"),
    variant: "destructive",
  });

  // Preusmjeri na login stranicu
  router.push("/login");
}

// Učitaj profile pri montiranju komponente
onMounted(() => {
  loadProfiles();
});
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
