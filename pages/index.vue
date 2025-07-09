<template>
  <div>
    <!-- Hero Section -->
    <section
      class="py-12 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            {{ t("home.heroTitle").split("VS Code")[0] }}
            <span class="text-teal-400">VS Code</span>
            {{ t("home.heroTitle").split("VS Code")[1] }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-300">
            {{ t("home.heroSubtitle") }}
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink
              to="/profiles"
              class="px-8 py-3 bg-teal-500 hover:bg-teal-600 rounded-md transition-colors text-center font-medium"
            >
              {{ t("home.exploreProfiles") }}
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-center font-medium"
            >
              {{ t("home.createAccount") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Profiles -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center dark:text-white">
          {{ t("home.featuredProfiles") }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProfileCard
            v-for="profile in featuredProfiles"
            :key="profile.id"
            :profile="profile"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center dark:text-white">
          {{ t("home.howItWorks") }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              1
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              {{ t("home.step1Title") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ t("home.step1Description") }}
            </p>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              2
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              {{ t("home.step2Title") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ t("home.step2Description") }}
            </p>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              3
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              {{ t("home.step3Title") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ t("home.step3Description") }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from "@/composables/useTranslation";

const { t } = useTranslation();

interface Extension {
  id: string;
  name: string;
  publisher: string;
}

interface Profile {
  id: string;
  userName: string;
  userAvatar: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  likeCount: number;
  extensions: Extension[];
}

// Dohvat najpopularnijih profila iz API-ja
const { data: popularProfiles, error: profileError } = await useFetch<
  Profile[]
>("/api/public/profiles/popular", {
  key: "popular-profiles",
  default: () => [],
});

// Mapirati API odgovor da odgovara strukturi
const featuredProfiles = computed(() => {
  if (popularProfiles.value.length === 0) {
    // Ako nema profila, vrati prazna 3 placeholder profila
    return Array(3)
      .fill(null)
      .map((_, index) => ({
        id: `placeholder-${index}`,
        userName: t("home.comingSoon"),
        userAvatar: null,
        name: t("home.profileComingSoon"),
        description: t("home.beFirstToAdd"),
        imageUrl: null,
        likeCount: 0,
        extensions: [],
      }));
  }

  // Ako ima manje od 3 profila, dopuni sa placeholderima
  const profiles = [...popularProfiles.value];

  while (profiles.length < 3) {
    profiles.push({
      id: `placeholder-${profiles.length}`,
      userName: t("home.comingSoon"),
      userAvatar: null,
      name: t("home.profileComingSoon"),
      description: t("home.beFirstToAdd"),
      imageUrl: null,
      likeCount: 0,
      extensions: [],
    });
  }

  return profiles;
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
