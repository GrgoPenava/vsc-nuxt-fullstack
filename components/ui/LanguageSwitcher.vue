<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-1 focus:outline-none text-gray-700 dark:text-gray-300"
    >
      <span class="text-sm">{{ displayLanguage }}</span>
      <svg
        class="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10"
    >
      <button
        @click="changeLanguage('hr')"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-700': currentLanguage === 'hr' }"
      >
        Hrvatski
      </button>
      <button
        @click="changeLanguage('en')"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-700': currentLanguage === 'en' }"
      >
        English
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";
import { toast } from "@/components/ui/toast/use-toast";

const authStore = useAuthStore();
const { currentLanguage, getTranslation } = useTranslation();

const isOpen = ref(false);
const isLoading = ref(false);

const displayLanguage = computed(() =>
  currentLanguage.value === "hr" ? "HR" : "EN"
);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

async function changeLanguage(lang: string) {
  if (lang === currentLanguage.value || isLoading.value) {
    isOpen.value = false;
    return;
  }

  isLoading.value = true;

  try {
    const result = await authStore.updateLanguage(lang);

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
    isOpen.value = false;
  }
}

// Zatvaranje dropdown-a klikom van komponente
function handleClickOutside(event: MouseEvent) {
  if (
    isOpen.value &&
    !event.composedPath().includes(event.currentTarget as EventTarget)
  ) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
