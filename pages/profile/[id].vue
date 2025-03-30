<template>
  <div v-if="profile" class="py-8 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Profile header -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
      >
        <!-- Cover image -->
        <div
          class="h-48 w-full object-cover bg-gradient-to-r from-gray-800 to-gray-900"
        >
          <img
            :src="profile.imageUrl"
            class="w-full h-full object-cover opacity-75"
          />
        </div>

        <div class="p-6">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex sm:space-x-5">
              <div class="flex-shrink-0">
                <img
                  class="h-20 w-20 rounded-full border-4 border-white dark:border-gray-700 -mt-16 shadow-lg"
                  :src="profile.userAvatar"
                  :alt="profile.userName"
                />
              </div>
              <div class="mt-4 sm:mt-0 sm:pt-1 text-center sm:text-left">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  VS Code Profile by
                </p>
                <p
                  class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
                >
                  {{ profile.userName }}
                </p>
              </div>
            </div>
            <div class="mt-5 flex justify-center sm:mt-0">
              <button
                class="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                @click="toggleLike"
              >
                <svg
                  :class="[
                    'w-5 h-5 mr-2',
                    { 'text-red-500 fill-current': isLiked },
                  ]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {{ isLiked ? "Liked" : "Like" }} ({{ localLikes }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile content -->
      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main content -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {{ profile.title }}
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              {{ profile.description }}
            </p>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3
                class="text-lg font-medium text-gray-900 dark:text-white mb-4"
              >
                VS Code Screenshots
              </h3>
              <div class="grid grid-cols-1 gap-4">
                <div
                  class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <img :src="profile.imageUrl" class="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Extensions -->
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Extensions
            </h3>
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="ext in profile.extensions" :key="ext.id" class="py-3">
                <div class="flex items-start">
                  <div class="ml-3">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ ext.name }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ ext.publisher }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- User info -->
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              About {{ profile.userName }}
            </h3>
            <div class="flex items-center mb-4">
              <svg
                class="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-gray-700 dark:text-gray-300"
                >Member since Jan 2023</span
              >
            </div>
            <div class="flex items-center">
              <svg
                class="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-gray-700 dark:text-gray-300">{{
                profile.userName
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-64 dark:bg-gray-900">
    <div class="text-gray-500 dark:text-gray-400">Loading profile...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const profileId = route.params.id;

// These interfaces should be in a shared types file in a real app
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

const profile = ref<Profile | null>(null);
const isLiked = ref(false);
const localLikes = ref(0);

// Fetch profile data
onMounted(async () => {
  // In a real app, this would be an API call
  // For demo purposes, we'll simulate a response delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data based on profile ID
  const mockProfiles = [
    {
      id: "1",
      userName: "Sarah Chen",
      userAvatar: "https://i.pravatar.cc/150?img=5",
      title: "React Developer Setup",
      description:
        "This is my optimized VS Code setup for React development. I've been refining it over 3 years of professional React development. It includes customized settings for ESLint, Prettier and React specific extensions to boost productivity and code quality. The theme is a modified version of One Dark Pro with a custom font that improves readability during long coding sessions.",
      imageUrl:
        "https://res.cloudinary.com/practicaldev/image/fetch/s--JrHl4K_D--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8ncoy6vc2eaufmvhe0ta.png",
      likes: 243,
      extensions: [
        {
          id: "dbaeumer.vscode-eslint",
          name: "ESLint",
          publisher: "Microsoft",
        },
        {
          id: "esbenp.prettier-vscode",
          name: "Prettier",
          publisher: "Prettier",
        },
        {
          id: "dsznajder.es7-react-js-snippets",
          name: "ES7 React Snippets",
          publisher: "dsznajder",
        },
        {
          id: "ms-vscode.vscode-typescript-next",
          name: "TypeScript Nightly",
          publisher: "Microsoft",
        },
      ],
    },
    {
      id: "2",
      userName: "Alex Morgan",
      userAvatar: "https://i.pravatar.cc/150?img=12",
      title: "Python Data Science Workspace",
      description:
        "A VS Code environment optimized for data science workflows with Python. Integrates seamlessly with Jupyter notebooks and includes visualization tools for data exploration. The setup makes it easy to alternate between interactive data analysis and writing production-ready code.",
      imageUrl:
        "https://miro.medium.com/v2/resize:fit:1400/1*3JL5fKrnr_4FDN9SSPtcAw.png",
      likes: 187,
      extensions: [
        { id: "ms-python.python", name: "Python", publisher: "Microsoft" },
        { id: "ms-toolsai.jupyter", name: "Jupyter", publisher: "Microsoft" },
        {
          id: "mechatroner.rainbow-csv",
          name: "Rainbow CSV",
          publisher: "mechatroner",
        },
        {
          id: "ms-python.vscode-pylance",
          name: "Pylance",
          publisher: "Microsoft",
        },
      ],
    },
    {
      id: "3",
      userName: "Miguel Rodriguez",
      userAvatar: "https://i.pravatar.cc/150?img=68",
      title: "Full-Stack JavaScript Theme",
      description:
        "My custom VS Code setup for full-stack JavaScript development with Node.js, Express, and Vue.js. Includes a dark theme with custom icons that make it easy to distinguish between different file types in complex projects. The terminal is integrated with Git for a smooth workflow.",
      imageUrl:
        "https://camo.githubusercontent.com/a5b3ede19b1aa76b0baeac0739a721c7f64d7d1e077d56285fb1f2ae2c6d1b19/68747470733a2f2f692e6962622e636f2f546678737930342f4e65772d4d6f6e6f6b61692d312e706e67",
      likes: 312,
      extensions: [
        { id: "octref.vetur", name: "Vetur", publisher: "Pine Wu" },
        {
          id: "ritwickdey.liveserver",
          name: "Live Server",
          publisher: "Ritwick Dey",
        },
        {
          id: "pkief.material-icon-theme",
          name: "Material Icon Theme",
          publisher: "Philipp Kief",
        },
        {
          id: "formulahendry.auto-rename-tag",
          name: "Auto Rename Tag",
          publisher: "Jun Han",
        },
      ],
    },
  ];

  const foundProfile = mockProfiles.find((p) => p.id === profileId);

  if (foundProfile) {
    profile.value = foundProfile;
    localLikes.value = foundProfile.likes;
  } else {
    // Handle profile not found
    console.error("Profile not found");
  }
});

function toggleLike() {
  isLiked.value = !isLiked.value;

  if (isLiked.value) {
    localLikes.value++;
  } else {
    localLikes.value--;
  }

  // In a real app, would update the like status on the server
}
</script>
