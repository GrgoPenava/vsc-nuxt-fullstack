<template>
  <div
    class="min-h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <header
      ref="header"
      class="fixed w-full z-50 transition-transform duration-300 ease-in-out"
      :class="{ '-translate-y-full': isScrollingDown && !atTop }"
    >
      <div
        class="bg-gray-800 text-white dark:bg-gray-900 dark:border-b dark:border-gray-700"
      >
        <nav class="container mx-auto flex items-center justify-between p-4">
          <div class="flex items-center space-x-6">
            <NuxtLink
              to="/"
              class="text-xl font-bold hover:text-teal-400 transition-colors"
            >
              <span class="text-teal-400">&lt;</span>VS<span
                class="text-teal-400"
                >/&gt;</span
              >
              Profiles
            </NuxtLink>

            <div class="hidden md:flex space-x-4">
              <NuxtLink
                to="/"
                active-class="text-teal-400"
                class="py-2 px-4 rounded-md hover:text-teal-400 transition-colors"
                >Home</NuxtLink
              >
              <NuxtLink
                to="/explore"
                active-class="text-teal-400"
                class="py-2 px-4 rounded-md hover:text-teal-400 transition-colors"
                >Explore</NuxtLink
              >
              <NuxtLink
                v-if="isAdmin"
                to="/admin/dashboard"
                active-class="text-teal-400"
                class="py-2 px-4 rounded-md hover:text-teal-400 transition-colors"
                >Dashboard</NuxtLink
              >
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <ThemeToggle />

            <template v-if="isLoggedIn">
              <div class="relative profile-dropdown">
                <button
                  @click="toggleProfileMenu"
                  class="flex items-center focus:outline-none profile-dropdown"
                >
                  <template v-if="avatarUrl">
                    <img
                      :src="avatarUrl"
                      alt="User Avatar"
                      class="h-8 w-8 rounded-full object-cover border-2 border-teal-400"
                    />
                  </template>
                  <template v-else>
                    <div
                      class="h-8 w-8 rounded-full border-2 border-teal-400 bg-teal-500 flex items-center justify-center text-white font-medium text-sm"
                    >
                      {{ getUserInitials }}
                    </div>
                  </template>
                </button>

                <div
                  v-if="profileMenuOpen"
                  class="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20 transition-all duration-200 ease-in-out dark:bg-gray-800 dark:text-gray-100"
                >
                  <div
                    class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 dark:text-gray-300 dark:border-gray-700"
                  >
                    Signed in as <span class="font-medium">{{ userName }}</span>
                  </div>
                  <NuxtLink
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >Your Profile</NuxtLink
                  >
                  <NuxtLink
                    to="/settings/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >Edit Profile</NuxtLink
                  >
                  <NuxtLink
                    to="/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >Settings</NuxtLink
                  >
                  <div
                    class="border-t border-gray-100 dark:border-gray-700"
                  ></div>
                  <button
                    @click="signOut"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <NuxtLink
                to="/login"
                class="py-2 px-4 rounded-md hover:text-teal-400 transition-colors"
              >
                Log in
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="py-2 px-4 bg-teal-500 hover:bg-teal-600 rounded-md transition-colors"
              >
                Sign up
              </NuxtLink>
            </template>

            <button
              @click="toggleMobileMenu"
              class="md:hidden text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-gray-800 text-white dark:bg-gray-900"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink
            to="/"
            class="block px-3 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800"
            >Home</NuxtLink
          >
          <NuxtLink
            to="/explore"
            class="block px-3 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800"
            >Explore</NuxtLink
          >
          <NuxtLink
            v-if="isAdmin"
            to="/admin/dashboard"
            class="block px-3 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800"
            >Dashboard</NuxtLink
          >
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto p-4 pt-24">
      <slot />
    </main>

    <footer
      class="bg-gray-800 text-white dark:bg-gray-900 dark:border-t dark:border-gray-800 p-6 text-center"
    >
      <div class="container mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <div class="text-xl font-bold">
              <span class="text-teal-400">&lt;</span>VS<span
                class="text-teal-400"
                >/&gt;</span
              >
              Profiles
            </div>
            <p class="text-gray-400 mt-2">
              Share and discover amazing VS Code setups
            </p>
          </div>

          <div class="flex space-x-4">
            <a href="#" class="hover:text-teal-400 transition-colors">About</a>
            <a href="#" class="hover:text-teal-400 transition-colors"
              >Privacy</a
            >
            <a href="#" class="hover:text-teal-400 transition-colors">Terms</a>
            <a href="#" class="hover:text-teal-400 transition-colors"
              >Contact</a
            >
          </div>
        </div>
        <div class="mt-6 text-gray-400">
          &copy; {{ new Date().getFullYear() }} VS Code Profiles. All rights
          reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// Dohvati podatke o prijavljenom korisniku iz auth store-a
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isAdmin = computed(() => authStore.isAdmin);
const userName = computed(() => authStore.user?.username || "");

// Dohvati inicijale korisnika
const getUserInitials = computed(() => {
  if (!authStore.user) return "";

  const firstName = authStore.user.firstName || "";
  const lastName = authStore.user.lastName || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (authStore.user.username) {
    return authStore.user.username[0].toUpperCase();
  }

  return "U";
});

// Dohvati avatar URL
const avatarUrl = ref<string | null>(null);
const defaultAvatar = "https://i.pravatar.cc/150?img=30";
const userAvatar = computed(() => avatarUrl.value || defaultAvatar);

const profileMenuOpen = ref(false);
const mobileMenuOpen = ref(false);
const isScrollingDown = ref(false);
const atTop = ref(true);
const header = ref<HTMLElement | null>(null);
const lastScrollY = ref(0);

// Dohvat avatara korisnika iz S3 bucketa
async function fetchAvatarUrl() {
  if (!authStore.user) return;

  try {
    avatarUrl.value = await authStore.getAvatarUrl(authStore.user.id);
    console.log("navbar avatarUrl", avatarUrl.value);
  } catch (err) {
    console.error("Error fetching navbar avatar:", err);
  }
}

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value;
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function signOut() {
  // Implementiraj odjavu korisnika
  authStore.logout();
  profileMenuOpen.value = false;
  // Nakon odjave preusmjeri na početnu stranicu
  navigateTo("/");
}

// Handle scroll events for navbar animation
function handleScroll() {
  const currentScrollY = window.scrollY;

  atTop.value = currentScrollY < 20;

  if (currentScrollY > lastScrollY.value) {
    isScrollingDown.value = true;
  } else {
    isScrollingDown.value = false;
  }

  lastScrollY.value = currentScrollY;
}

// Create a named function for the click handler so we can properly remove it
function handleOutsideClick(e: MouseEvent) {
  if (
    profileMenuOpen.value &&
    !(e.target as Element)?.closest(".profile-dropdown")
  ) {
    profileMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Add click event listener for closing dropdowns
  window.addEventListener("click", handleOutsideClick);

  // Dohvati avatar URL kad je komponenta montirana
  if (isLoggedIn.value) {
    fetchAvatarUrl();
  }
});

// Prati promjene korisnika kako bi osvježili avatar
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      fetchAvatarUrl();
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  // Remove the click event listener
  window.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.transition-transform {
  transition-property: transform;
}
</style>
