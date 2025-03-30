import { computed, reactive, ref, watch, onMounted } from "vue";
import type { ComputedRef } from "vue";
import { useAuthStore } from "@/stores/auth";

// Funkcija za dohvat prijevoda
export function useTranslation() {
  const authStore = useAuthStore();

  // Dohvati jezik iz korisničkih postavki, default je hrvatski
  const currentLanguage = computed(() => authStore.user?.language || "hr");

  // Učitaj prijevode odmah pri pokretanju
  const translations = reactive<Record<string, any>>({
    hr: null,
    en: null,
  });

  // Učitaj prijevode za trenutni jezik
  async function loadTranslations() {
    if (!translations.hr) {
      translations.hr = await import("@/locales/hr.json").then(
        (module) => module.default
      );
    }
    if (!translations.en) {
      translations.en = await import("@/locales/en.json").then(
        (module) => module.default
      );
    }
  }

  // Odmah učitaj prijevode
  loadTranslations();

  // Dohvati prijevod prema ključu
  function getTranslationSync(key: string): string {
    const lang = currentLanguage.value;
    if (!translations[lang]) {
      return key; // Ako prijevodi još nisu učitani, vrati ključ
    }

    // Podijeli ključ na dijelove (npr. "common.home" -> ["common", "home"])
    const parts = key.split(".");
    let result = translations[lang];

    // Pronađi prijevod prateći stablo
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        // Ako prijevod nije pronađen, vrati ključ
        return key;
      }
    }

    return typeof result === "string" ? result : key;
  }

  // Funkcija za dohvat određenog prijevoda (async verzija)
  async function getTranslation(key: string): Promise<string> {
    await loadTranslations();
    return getTranslationSync(key);
  }

  // Funkcija za prijevod koja vraća string
  function t(key: string): string {
    return getTranslationSync(key);
  }

  return {
    currentLanguage,
    t,
    getTranslation,
  };
}
