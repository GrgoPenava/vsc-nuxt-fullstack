import { computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
import type { ComputedRef } from "vue";
import { useAuthStore } from "@/stores/auth";

// Provjeri jesmo li u browseru ili na serveru
const isClient = typeof window !== "undefined";

// Globalni store za jezik
const globalLanguageStore = reactive({
  currentLanguage: "en",
  setLanguage(lang: string) {
    this.currentLanguage = lang;
    if (isClient) {
      localStorage.setItem("app_language", lang);
    }
  },
});

// Globalni event bus za promjene jezika
const LANGUAGE_CHANGED_EVENT = "app-language-changed";
const USER_LOGIN_EVENT = "app-user-login";

// Funkcija za dohvat prijevoda
export function useTranslation() {
  const authStore = useAuthStore();

  // Učitaj prijevode odmah pri pokretanju
  const translations = reactive<Record<string, any>>({
    hr: null,
    en: null,
  });

  // Ref za praćenje promjena jezika na nivou komponente
  const componentLanguageCounter = ref(0);

  // Funkcija za ažuriranje jezika
  const updateLanguage = (lang: string) => {
    if (isClient) {
      // Ažuriraj globalni store
      globalLanguageStore.setLanguage(lang);

      // Povećaj counter za reaktivnost
      componentLanguageCounter.value++;

      // Dispatch custom event za ažuriranje komponenti
      window.dispatchEvent(
        new CustomEvent(LANGUAGE_CHANGED_EVENT, {
          detail: { lang, timestamp: Date.now() },
        })
      );
    }
  };

  // Funkcija za inicijalizaciju jezika
  const initializeLanguage = () => {
    if (isClient) {
      // Ako je korisnik prijavljen, koristimo jezik iz baze
      if (authStore.isLoggedIn && authStore.user?.language) {
        // Sinkroniziramo localStorage s jezikom iz baze
        updateLanguage(authStore.user.language);
      } else {
        // Ako korisnik nije prijavljen, dohvatimo iz localStorage ili koristimo default
        const storedLanguage = localStorage.getItem("app_language");
        updateLanguage(storedLanguage || "en");
      }
    }
  };

  // Inicijalizacija pri montiranju komponente
  onMounted(() => {
    if (isClient) {
      // Inicijaliziraj jezik
      initializeLanguage();

      // Dodaj event listener za promjene u localStorage (za promjene iz drugih tabova)
      window.addEventListener("storage", (event) => {
        if (event.key === "app_language" && event.newValue) {
          updateLanguage(event.newValue);
        }
      });

      // Dodaj event listener za custom event za promjenu jezika
      const handleLanguageChange = () => {
        componentLanguageCounter.value++;
      };

      window.addEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChange);

      // Dodaj event listener za custom event za prijavu korisnika
      const handleUserLogin = (event: CustomEvent) => {
        if (event.detail && event.detail.user && event.detail.user.language) {
          updateLanguage(event.detail.user.language);
        }
      };

      window.addEventListener(
        USER_LOGIN_EVENT,
        handleUserLogin as EventListener
      );

      // Čistimo event listener kada se komponenta unmounta
      onUnmounted(() => {
        window.removeEventListener(
          LANGUAGE_CHANGED_EVENT,
          handleLanguageChange
        );
        window.removeEventListener(
          USER_LOGIN_EVENT,
          handleUserLogin as EventListener
        );
      });
    }
  });

  // Computed koji vraća aktivni jezik s prioritetima
  // 1. Ako je korisnik prijavljen - koristimo jezik iz baze
  // 2. Ako korisnik nije prijavljen - koristimo localStorage ili default 'en'
  const currentLanguage = computed(() => {
    // Dummy read kako bi osigurali reaktivnost
    const _ = componentLanguageCounter.value;

    // Ako je korisnik prijavljen, koristimo jezik iz baze
    if (authStore.isLoggedIn && authStore.user?.language) {
      return authStore.user.language;
    }

    // Ako korisnik nije prijavljen, koristimo globalni store
    return globalLanguageStore.currentLanguage;
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
    // Dummy read kako bi osigurali reaktivnost
    const _ = componentLanguageCounter.value;

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

  // Funkcija za promjenu jezika (i za neprijavljene korisnike)
  async function changeLanguage(
    lang: string
  ): Promise<{ success: boolean; error?: string }> {
    if (lang !== "hr" && lang !== "en") {
      return { success: false, error: "Invalid language" };
    }

    try {
      // Ako je korisnik prijavljen, postavi jezik kroz API
      if (authStore.isLoggedIn) {
        const result = await authStore.updateLanguage(lang);

        // Ako je ažuriranje uspješno, ažuriramo i localStorage
        if (result.success && isClient) {
          updateLanguage(lang);
        }

        return result;
      } else if (isClient) {
        // Inače, spremi u localStorage, ali samo ako smo u browseru
        updateLanguage(lang);
        return { success: true };
      }
      return { success: true }; // Na serveru ne radimo ništa, ali vraćamo uspjeh
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Osluškujemo promjene na auth store-u
  watch(
    () => authStore.user?.language,
    (newLang) => {
      // Ako se jezik korisnika u bazi podataka promijeni, ažuriramo localStorage
      if (newLang && isClient) {
        updateLanguage(newLang);
      }
    }
  );

  // Osluškujemo promjene statusa prijave - kada se korisnik prijavi/odjavi
  watch(
    () => [authStore.isLoggedIn, authStore.user],
    ([isLoggedIn, user]) => {
      if (isClient) {
        if (isLoggedIn && user && typeof user !== "boolean" && user.language) {
          // Ako se korisnik prijavi, koristimo jezik iz baze
          updateLanguage(user.language);

          // Dodatno osigurajmo da se komponente ažuriraju nakon prijave
          setTimeout(() => {
            componentLanguageCounter.value++;
            window.dispatchEvent(
              new CustomEvent(LANGUAGE_CHANGED_EVENT, {
                detail: { lang: user.language, timestamp: Date.now() },
              })
            );
          }, 200);
        } else if (!isLoggedIn) {
          // Ako se korisnik odjavi, koristimo jezik iz localStorage
          const storedLanguage = localStorage.getItem("app_language");
          updateLanguage(storedLanguage || "en");
        }
      }
    },
    { immediate: true } // Dodajemo immediate: true da se watcher pokrene odmah
  );

  return {
    currentLanguage,
    t,
    getTranslation,
    changeLanguage,
  };
}
