import { ref, watch, onMounted } from "vue";

export const useTheme = () => {
  const isDark = ref(false);

  // Update document class when theme changes
  const updateTheme = () => {
    // Remove both classes first
    document.documentElement.classList.remove("dark", "light");
    // Add the current theme class
    document.documentElement.classList.add(isDark.value ? "dark" : "light");
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDark.value ? "dark" : "light");
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // Watch for changes and update theme
  watch(isDark, () => {
    updateTheme();
  });

  // Initialize theme from localStorage or system preference
  onMounted(() => {
    if (typeof window !== "undefined") {
      // Check localStorage first
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        isDark.value = savedTheme === "dark";
      } else {
        // Fall back to system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        isDark.value = prefersDark;
      }

      // Update initial theme
      updateTheme();
    }
  });

  return {
    isDark,
    toggleTheme,
  };
};

// Create a global state to share across components
export const useGlobalTheme = () => {
  const theme = useState("theme", () => {
    return { isDark: false };
  });

  return theme;
};
