<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">
      {{ t("settings.languageSettings") }}
    </h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <form @submit.prevent="updateLanguage">
        <div class="mb-6">
          <label for="language" class="block text-sm font-medium mb-2">
            {{ t("settings.chooseLanguage") }}
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              @click="selectedLanguage = 'hr'"
              class="border rounded-lg p-4 cursor-pointer flex items-center space-x-3"
              :class="
                selectedLanguage === 'hr'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              "
            >
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="
                  selectedLanguage === 'hr'
                    ? 'border-teal-500'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <div
                  v-if="selectedLanguage === 'hr'"
                  class="w-3 h-3 rounded-full bg-teal-500"
                ></div>
              </div>
              <span>{{ t("settings.croatian") }}</span>
            </div>

            <div
              @click="selectedLanguage = 'en'"
              class="border rounded-lg p-4 cursor-pointer flex items-center space-x-3"
              :class="
                selectedLanguage === 'en'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              "
            >
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="
                  selectedLanguage === 'en'
                    ? 'border-teal-500'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <div
                  v-if="selectedLanguage === 'en'"
                  class="w-3 h-3 rounded-full bg-teal-500"
                ></div>
              </div>
              <span>{{ t("settings.english") }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-300"
            @click="$router.back()"
          >
            {{ t("settings.cancel") }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            :disabled="isLoading || selectedLanguage === currentLanguage"
          >
            <span v-if="isLoading">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
            <span v-else>{{ t("settings.saveChanges") }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";
import { toast } from "@/components/ui/toast/use-toast";

// Dohvati auth store
const authStore = useAuthStore();
const { t, currentLanguage, getTranslation } = useTranslation();

// State i computed
const selectedLanguage = ref(currentLanguage.value);
const isLoading = ref(false);

// Metoda za ažuriranje jezika
async function updateLanguage() {
  if (selectedLanguage.value === currentLanguage.value) {
    return;
  }

  isLoading.value = true;

  try {
    const result = await authStore.updateLanguage(selectedLanguage.value);

    if (result.success) {
      toast({
        title: await getTranslation("settings.languageUpdateSuccess"),
        variant: "default",
      });
    } else {
      toast({
        title: await getTranslation("errors.language"),
        description: result.error,
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: await getTranslation("errors.language"),
      description: error.message,
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
}

// Postavljanje početne vrijednosti
onMounted(() => {
  selectedLanguage.value = currentLanguage.value;
});
</script>
