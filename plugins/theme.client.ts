export default defineNuxtPlugin({
  name: "theme-handler",
  enforce: "pre", // runs before other plugins
  setup() {
    // Check localStorage for saved theme
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");

      // Apply theme class to html element
      if (savedTheme) {
        document.documentElement.classList.add(savedTheme);
      } else {
        // Check for system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.add(prefersDark ? "dark" : "light");
        localStorage.setItem("theme", prefersDark ? "dark" : "light");
      }
    }
  },
});
