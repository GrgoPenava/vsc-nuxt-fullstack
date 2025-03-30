<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">{{ t("settings.title") }}</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Jezične postavke -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">{{ t("settings.language") }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{
            currentLanguage === "hr"
              ? t("settings.croatian")
              : t("settings.english")
          }}
        </p>
        <NuxtLink
          to="/settings/language"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
        >
          {{ t("settings.chooseLanguage") }}
        </NuxtLink>
      </div>

      <!-- Ovdje se mogu dodati ostale postavke u budućnosti -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from "@/composables/useTranslation";

const { t, currentLanguage } = useTranslation();
</script>
