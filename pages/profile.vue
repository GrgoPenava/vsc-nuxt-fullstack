<template>
  <div class="container py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profil header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="flex flex-col sm:flex-row items-center">
          <img
            :src="userAvatar"
            :alt="userData?.username"
            class="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
          />

          <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
            <h1 class="text-2xl font-bold">
              {{ userData?.firstName }} {{ userData?.lastName }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400">
              @{{ userData?.username }}
            </p>

            <div
              class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2"
            >
              <span
                v-if="isAdmin"
                class="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full"
              >
                Admin
              </span>
              <span
                v-if="userData?.verified"
                class="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
              >
                Verified
              </span>
            </div>
          </div>

          <!-- Gumbi za uređivanje profila -->
          <div class="ml-auto mt-4 sm:mt-0">
            <NuxtLink
              to="/settings/profile"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Uredi profil
            </NuxtLink>
          </div>
        </div>

        <!-- Biografija -->
        <div class="mt-6">
          <h3 class="text-lg font-medium mb-2">Bio</h3>
          <p class="text-gray-600 dark:text-gray-300">
            {{ userData?.bio || "Korisnik još nije dodao biografiju." }}
          </p>
        </div>
      </div>

      <!-- Ovdje možete dodati dodatne sekcije profila kao što su: -->
      <!-- - Lista postavki VS Code-a -->
      <!-- - Omiljene ekstenzije -->
      <!-- - Teme i postavke -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">VS Code postavke</h2>
        <p class="text-gray-600 dark:text-gray-300">
          Ovdje ćemo prikazati postavke VS Code-a, ekstenzije i druge
          informacije o korisničkom profilu.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const authStore = useAuthStore();

// Podaci o korisniku iz auth store-a
const userData = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
const userAvatar = computed(
  () => userData.value?.avatar || "https://i.pravatar.cc/150?img=30"
);

// Možete ovdje dodati dodatnu logiku za dohvat detalja profila ako je potrebno
</script>
