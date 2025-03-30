<template>
  <div>
    <!-- Hero Section -->
    <section
      class="py-12 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Share Your <span class="text-teal-400">VS Code</span> Setup
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-300">
            Discover amazing editor setups, extensions, and themes from
            developers around the world
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink
              to="/login"
              class="px-8 py-3 bg-teal-500 hover:bg-teal-600 rounded-md transition-colors text-center font-medium"
            >
              Explore Profiles
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-center font-medium"
            >
              Create Account
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Profiles -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center dark:text-white">
          Featured VS Code Profiles
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProfileCard
            v-for="profile in featuredProfiles"
            :key="profile.id"
            :profile="profile"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center dark:text-white">
          How It Works
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              1
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              Create an Account
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Sign up for free and join our community of VS Code enthusiasts
            </p>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              2
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              Share Your Setup
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Upload screenshots, add extension lists, and describe your VS Code
              configuration
            </p>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg text-center dark:bg-gray-800">
            <div
              class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            >
              3
            </div>
            <h3 class="text-xl font-bold mb-2 dark:text-white">
              Discover & Engage
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Explore setups from other developers, save favorites, and leave
              comments
            </p>
          </div>
        </div>
      </div>
    </section>
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

// Sample data - in a real app this would come from an API
const featuredProfiles = ref<Profile[]>([
  {
    id: "1",
    userName: "Sarah Chen",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    title: "React Developer Setup",
    description:
      "Clean, minimal setup for React development with a focus on productivity.",
    imageUrl:
      "https://res.cloudinary.com/practicaldev/image/fetch/s--JrHl4K_D--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8ncoy6vc2eaufmvhe0ta.png",
    likes: 243,
    extensions: [
      { id: "dbaeumer.vscode-eslint", name: "ESLint", publisher: "Microsoft" },
      { id: "esbenp.prettier-vscode", name: "Prettier", publisher: "Prettier" },
      {
        id: "dsznajder.es7-react-js-snippets",
        name: "ES7 React Snippets",
        publisher: "dsznajder",
      },
    ],
  },
  {
    id: "2",
    userName: "Alex Morgan",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    title: "Python Data Science Workspace",
    description:
      "Optimized for machine learning and data visualization projects.",
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
    ],
  },
  {
    id: "3",
    userName: "Miguel Rodriguez",
    userAvatar: "https://i.pravatar.cc/150?img=68",
    title: "Full-Stack JavaScript Theme",
    description:
      "Dark theme with custom icons for Node.js and Vue.js development.",
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
    ],
  },
]);
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
