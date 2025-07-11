<template>
  <div class="flex flex-col items-center">
    <div class="relative group">
      <!-- Avatar slika -->
      <img
        v-if="previewSrc"
        :src="previewSrc"
        class="w-32 h-32 rounded-full object-cover border-4 border-teal-400"
        alt="Avatar"
      />
      <template v-else-if="currentAvatarUrl">
        <img
          :src="currentAvatarUrl"
          class="w-32 h-32 rounded-full object-cover border-4 border-teal-400"
          alt="Avatar"
        />
      </template>
      <template v-else>
        <div
          class="w-32 h-32 rounded-full border-4 border-teal-400 bg-teal-500 flex items-center justify-center text-white font-bold text-2xl"
        >
          <font-awesome-icon icon="fas fa-user" class="text-2xl" />
        </div>
      </template>

      <!-- Overlay s ikonom za promjenu -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <label for="avatar-upload" class="cursor-pointer p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </label>
        <input
          id="avatar-upload"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
      </div>

      <!-- Spinner tijekom uploada -->
      <div
        v-if="isUploading"
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"
        ></div>
      </div>
    </div>

    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
      {{ t("profile.clickToChangeAvatar") }}
    </p>

    <!-- Prikaz greške -->
    <p v-if="error" class="text-sm text-red-500 mt-2">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";
import { useTranslation } from "@/composables/useTranslation";

const props = defineProps<{
  userId: string;
}>();

const authStore = useAuthStore();
const { t } = useTranslation();
const isUploading = ref(false);
const error = ref("");
const previewSrc = ref("");
const currentAvatarUrl = ref<string | null>(null);

// Dohvati inicijale korisnika iz auth store-a
const getUserInitials = computed(() => {
  const user = authStore.user;
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (user.username) {
    return user.username[0].toUpperCase();
  }

  return "U";
});

// Dohvati URL avatara korisnika
async function fetchAvatarUrl() {
  try {
    const url = await authStore.getAvatarUrl(props.userId);
    currentAvatarUrl.value = url;
  } catch (err) {
    console.error("Error fetching avatar:", err);
  }
}

// Obradi odabir nove datoteke
async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  const file = files[0];

  const supportedTypes = ["image/png", "image/jpeg", "image/jpg"];

  // Provjeri je li datoteka slika
  if (!supportedTypes.includes(file.type)) {
    error.value = "Možete prenijeti samo slike";
    return;
  }

  // Prikaz pregleda slike
  previewSrc.value = URL.createObjectURL(file);

  // Upload slike
  try {
    isUploading.value = true;
    error.value = "";

    const result = await authStore.uploadAvatar(file);

    if (result.success) {
      toast({
        title: t("common.success"),
        description: t("profile.uploadSuccess"),
        variant: "default",
      });

      // Osvježi URL avatara
      await fetchAvatarUrl();
    } else {
      error.value = result.error || t("errors.profile");
      toast({
        title: t("common.error"),
        description: error.value,
        variant: "destructive",
      });

      // Resetiraj preview ako je došlo do greške
      previewSrc.value = "";
    }
  } catch (err: any) {
    error.value = err.message || t("errors.profile");
    toast({
      title: t("common.error"),
      description: error.value,
      variant: "destructive",
    });

    // Resetiraj preview ako je došlo do greške
    previewSrc.value = "";
  } finally {
    isUploading.value = false;

    // Resetiraj input kako bi se mogla odabrati ista datoteka ponovno
    input.value = "";
  }
}

// Dohvati avatar URL pri učitavanju komponente
onMounted(async () => {
  await fetchAvatarUrl();
});

// Slušaj promjene userId-a
watch(
  () => props.userId,
  async () => {
    await fetchAvatarUrl();
  }
);
</script>
