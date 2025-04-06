<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <!-- Slika koda -->
    <div
      class="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
    >
      <img
        v-if="profile.imageUrl"
        :src="profile.imageUrl"
        :alt="profile.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="text-center p-4">
        <font-awesome-icon
          icon="fas fa-file-code"
          class="text-gray-400 dark:text-gray-500 text-5xl mb-2"
        />
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ profile.name }}
        </p>
      </div>
    </div>

    <!-- Sadržaj kartice -->
    <div class="p-5">
      <div class="flex items-center mb-4">
        <div
          v-if="profile.userAvatar"
          class="w-10 h-10 rounded-full mr-3 overflow-hidden"
        >
          <img
            :src="profile.userAvatar"
            :alt="profile.userName"
            class="w-full h-full object-cover border-2 border-teal-400"
          />
        </div>
        <div
          v-else
          class="w-10 h-10 rounded-full mr-3 bg-teal-500 flex items-center justify-center text-white border-2 border-teal-400"
        >
          <font-awesome-icon icon="fas fa-user" />
        </div>
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white">
            {{ profile.userName }}
          </h3>
        </div>
      </div>

      <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {{ profile.name }}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {{ profile.description }}
      </p>

      <!-- Ekstenzije -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ekstenzije ({{ profile.extensions.length }})
        </h4>
        <div v-if="profile.extensions.length > 0" class="flex flex-wrap gap-2">
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
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Nema instaliranih ekstenzija
        </div>
      </div>

      <!-- Footer with stats -->
      <div
        class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <font-awesome-icon icon="far fa-thumbs-up" class="w-5 h-5 mr-2" />
          {{ profile.likeCount }}
        </div>

        <NuxtLink
          v-if="!profile.id.startsWith('placeholder')"
          :to="`/profiles/${profile.id}`"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Pogledaj profil
        </NuxtLink>
        <span v-else class="text-gray-400 dark:text-gray-500 text-sm"
          >Uskoro...</span
        >
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
  userAvatar: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  likeCount: number;
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
