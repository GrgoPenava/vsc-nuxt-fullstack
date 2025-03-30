<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <!-- Slika koda -->
    <div class="h-48 overflow-hidden">
      <img
        :src="profile.imageUrl"
        :alt="profile.title"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Sadržaj kartice -->
    <div class="p-5">
      <div class="flex items-center mb-4">
        <img
          :src="profile.userAvatar"
          :alt="profile.userName"
          class="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white">
            {{ profile.userName }}
          </h3>
        </div>
      </div>

      <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {{ profile.title }}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {{ profile.description }}
      </p>

      <!-- Ekstenzije -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ekstenzije ({{ profile.extensions.length }})
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="extension in profile.extensions.slice(0, 3)"
            :key="extension.id"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          >
            {{ extension.name }}
          </span>
          <span
            v-if="profile.extensions.length > 3"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          >
            +{{ profile.extensions.length - 3 }} više
          </span>
        </div>
      </div>

      <!-- Footer with stats -->
      <div
        class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {{ profile.likes }}
        </div>

        <NuxtLink
          :to="`/profile/${profile.id}`"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Pogledaj profil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Extension {
  id: string;
  name: string;
  publisher: string;
}

interface Profile {
  id: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  extensions: Extension[];
}

defineProps<{
  profile: Profile;
}>();
</script>

<style scoped>
.fill-current {
  fill: currentColor;
}
</style>
