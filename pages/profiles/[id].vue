<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <div class="loader"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 text-2xl mb-4">
        <font-awesome-icon icon="fas fa-exclamation-circle" class="mr-2" />
        {{ error }}
      </div>
      <NuxtLink
        to="/profiles"
        class="inline-flex items-center text-teal-500 hover:text-teal-600"
      >
        <font-awesome-icon icon="fas fa-arrow-left" class="mr-2" />
        {{ t("common.backToProfiles") }}
      </NuxtLink>
    </div>

    <!-- Profile content -->
    <div
      v-else-if="profile"
      class="bg-white dark:bg-gray-900 rounded-lg shadow-md"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-start"
        >
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ profile.name }}
            </h1>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t("profiles.createdBy") }}
              </p>
              <p
                class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
              >
                <NuxtLink
                  :to="`/users/${profile.user?.id}`"
                  class="hover:text-teal-500 transition-colors"
                >
                  {{ profile.user?.username }}
                </NuxtLink>
              </p>
              <span class="mx-2">•</span>
              {{ formatDate(profile.createdAt) }}
            </div>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ profile.description }}
            </p>
          </div>

          <div class="flex flex-col items-center md:items-end mt-4 md:mt-0">
            <div class="flex items-center space-x-4 mb-3">
              <!-- Like/Dislike buttons -->
              <button
                class="flex items-center py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                :class="{ 'bg-gray-100 dark:bg-gray-800': liked }"
                @click="toggleLike"
                :disabled="
                  !isLoggedIn ||
                  isPerformingLikeAction ||
                  isPerformingDislikeAction
                "
                :title="
                  !isLoggedIn
                    ? t('profiles.loginRequired')
                    : isPerformingLikeAction
                    ? t('common.processing')
                    : ''
                "
              >
                <div
                  v-if="isPerformingLikeAction"
                  class="w-5 h-5 mr-2 spinner-small"
                ></div>
                <font-awesome-icon
                  v-else
                  icon="far fa-thumbs-up"
                  class="w-5 h-5 mr-2"
                  :class="{ 'text-teal-500': liked }"
                />
                {{ profile.likeCount }}
              </button>
              <button
                class="flex items-center py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                :class="{ 'bg-gray-100 dark:bg-gray-800': disliked }"
                @click="toggleDislike"
                :disabled="
                  !isLoggedIn ||
                  isPerformingLikeAction ||
                  isPerformingDislikeAction
                "
                :title="
                  !isLoggedIn
                    ? t('profiles.loginRequired')
                    : isPerformingDislikeAction
                    ? t('common.processing')
                    : ''
                "
              >
                <div
                  v-if="isPerformingDislikeAction"
                  class="w-5 h-5 mr-2 spinner-small"
                ></div>
                <font-awesome-icon
                  v-else
                  icon="far fa-thumbs-down"
                  class="w-5 h-5 mr-2"
                  :class="{ 'text-red-500': disliked }"
                />
                {{ profile.dislikeCount }}
              </button>
            </div>
          </div>
        </div>

        <!-- Profile images -->
        <div
          v-if="profile.imageUrls && profile.imageUrls.length > 0"
          class="p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t("profiles.screenshots") }}
          </h2>

          <!-- Carousel -->
          <div class="relative">
            <div class="overflow-hidden rounded-lg">
              <div
                class="flex transition-transform duration-300 ease-in-out"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              >
                <div
                  v-for="(image, index) in profile.imageUrls"
                  :key="index"
                  class="w-full flex-shrink-0 h-96"
                >
                  <img
                    v-if="image.url"
                    :src="image.url"
                    alt=""
                    class="w-full h-full object-contain cursor-pointer"
                    @click="openImage(image.url)"
                  />
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <button
              v-if="profile.imageUrls.length > 1 && currentSlide > 0"
              @click="currentSlide--"
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous image"
            >
              <font-awesome-icon
                icon="far fa-circle-left"
                class="w-6 h-6 text-gray-800 dark:text-white"
                alt="Previous"
              />
            </button>
            <button
              v-if="
                profile.imageUrls.length > 1 &&
                currentSlide < profile.imageUrls.length - 1
              "
              @click="currentSlide++"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next image"
            >
              <font-awesome-icon
                icon="far fa-circle-right"
                class="w-6 h-6 text-gray-800 dark:text-white"
                alt="Next"
              />
            </button>

            <!-- Dots indicator -->
            <div
              v-if="profile.imageUrls.length > 1"
              class="flex justify-center mt-4"
            >
              <button
                v-for="(_, index) in profile.imageUrls"
                :key="index"
                @click="currentSlide = index"
                class="mx-1 w-3 h-3 rounded-full focus:outline-none"
                :class="
                  currentSlide === index
                    ? 'bg-teal-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                "
                :aria-label="`Go to image ${index + 1}`"
              ></button>
            </div>
          </div>
        </div>

        <!-- Profile file -->
        <div
          v-if="profile.fileUrl"
          class="p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t("profiles.downloadProfile") }}
          </h2>
          <div class="flex flex-wrap gap-3">
            <a
              :href="profile.fileUrl"
              download
              class="inline-flex items-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
            >
              <font-awesome-icon
                icon="fas fa-download"
                class="mr-2 text-white"
              />
              {{ t("profiles.download") }} {{ profile.fileName }}
              <span class="ml-2 text-sm text-teal-200">
                ({{ formatFileSize(profile.fileSize) }})
              </span>
            </a>
            <button
              @click="copyProfileContent"
              class="inline-flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              <font-awesome-icon icon="fas fa-copy" class="mr-2 text-white" />
              {{ t("profiles.copy") }}
            </button>
            <button
              @click="showFilePreview"
              class="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              <font-awesome-icon
                icon="fas fa-file-alt"
                class="mr-2 text-white"
              />
              {{ t("profiles.preview") }}
            </button>
          </div>
        </div>

        <!-- Extensions -->
        <div
          v-if="
            profile.profileExtensions && profile.profileExtensions.length > 0
          "
          class="p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t("profiles.extensions") }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="ext in profile.profileExtensions"
              :key="ext.extension.id"
              class="relative group"
            >
              <a
                :href="
                  ext.extension.link ||
                  `https://marketplace.visualstudio.com/items?itemName=${ext.extension.publisher}.${ext.extension.name}`
                "
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                {{ ext.extension.name }}
              </a>

              <!-- Tooltip on hover -->
              <div
                class="absolute z-10 left-0 top-full mt-2 w-64 p-3 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
              >
                <div
                  class="text-sm font-medium text-gray-900 dark:text-white mb-1"
                >
                  {{ ext.extension.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {{ ext.extension.publisher }}
                </div>
                <p
                  v-if="ext.extension.description"
                  class="text-xs text-gray-700 dark:text-gray-300"
                >
                  {{ ext.extension.description }}
                </p>
                <a
                  :href="
                    ext.extension.link ||
                    `https://marketplace.visualstudio.com/items?itemName=${ext.extension.publisher}.${ext.extension.name}`
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block mt-2 text-xs text-teal-500 hover:text-teal-600"
                >
                  <font-awesome-icon
                    icon="fas fa-external-link-alt"
                    class="mr-1 text-teal-500"
                  />
                  Marketplace
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t("profiles.comments") }} ({{ profile.comments?.length || 0 }})
          </h2>

          <!-- Comment form -->
          <div v-if="isLoggedIn" class="mb-6">
            <textarea
              v-model="commentText"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              :placeholder="t('profiles.addComment')"
              rows="3"
            ></textarea>
            <div class="flex justify-end mt-2">
              <button
                :disabled="!commentText.trim() || commenting"
                class="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
                @click="addComment"
              >
                {{ commenting ? t("common.posting") : t("common.postComment") }}
              </button>
            </div>
          </div>

          <!-- Comments list -->
          <div
            v-if="profile.comments && profile.comments.length > 0"
            class="space-y-4"
          >
            <div
              v-for="comment in profile.comments"
              :key="comment.id"
              class="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                  <img
                    v-if="comment.user?.avatar"
                    :src="comment.user.avatar"
                    alt=""
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs"
                  >
                    <font-awesome-icon icon="fas fa-user" />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center mb-1">
                    <span
                      class="font-medium text-gray-900 dark:text-white mr-2"
                    >
                      <NuxtLink
                        :to="`/users/${comment.user?.id}`"
                        class="hover:text-teal-500 transition-colors"
                      >
                        {{ comment.user?.username }}
                      </NuxtLink>
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(comment.createdAt) }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
            {{ t("profiles.noComments") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      @click.self="selectedImage = null"
    >
      <div class="max-w-4xl max-h-full p-4 relative">
        <img
          :src="selectedImage"
          alt=""
          class="max-w-full max-h-[90vh] object-contain"
        />

        <!-- Navigation buttons u modalnom prozoru -->
        <button
          v-if="modalImageIndex > 0"
          @click.stop="navigateModalImage(-1)"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous image"
        >
          <font-awesome-icon
            icon="far fa-circle-left"
            class="w-8 h-8 text-gray-800 dark:text-white"
            alt="Previous"
          />
        </button>
        <button
          v-if="modalImageIndex < profile.imageUrls.length - 1"
          @click.stop="navigateModalImage(1)"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next image"
        >
          <font-awesome-icon
            icon="far fa-circle-right"
            class="w-8 h-8 text-gray-800 dark:text-white"
            alt="Next"
          />
        </button>
      </div>
      <button
        class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700"
        @click.stop="selectedImage = null"
      >
        <font-awesome-icon
          icon="far fa-circle-xmark"
          class="w-6 h-6 text-gray-900 dark:text-white"
          alt="Close"
        />
      </button>
    </div>

    <!-- File Content Modal -->
    <div
      v-if="showFileContent && profile?.jsonContent"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      @click.self="showFileContent = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ profile.fileName }}
          </h3>
          <button
            class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            @click="showFileContent = false"
          >
            <font-awesome-icon
              icon="far fa-circle-xmark"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              alt="Close"
            />
          </button>
        </div>
        <div class="p-4 overflow-auto max-h-[80vh]">
          <pre
            v-if="isJsonContent"
            class="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto"
            v-html="formatJsonContent(profile.jsonContent)"
          ></pre>
          <pre
            v-else
            class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md"
            >{{ profile.jsonContent }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";

const { t } = useTranslation();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// Stanje
const profile = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const commentText = ref("");
const commenting = ref(false);
const liked = ref(false);
const disliked = ref(false);
const selectedImage = ref<string | null>(null);
const showFileContent = ref(false);
const currentSlide = ref(0);
const modalImageIndex = ref(0);

// Dodaj referentnu varijablu za stanje učitavanja like/dislike operacija
const isPerformingLikeAction = ref(false);
const isPerformingDislikeAction = ref(false);

// Dohvati ID profila iz rute
const profileId = computed(() => route.params.id as string);

// Funkcija za dohvat inicijala korisnika
function getUserInitials(user: any): string {
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const username = user.username || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (username) {
    return username[0].toUpperCase();
  }

  return "?";
}

// Metode
async function loadProfile() {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await useFetch(
      `/api/public/profiles/${profileId.value}`
    );

    if (fetchError.value) {
      error.value = fetchError.value.message || "Failed to load profile";
      return;
    }

    if (data.value) {
      profile.value = data.value;

      // Provjeri je li korisnik lajkao ili dislajkao profil
      if (isLoggedIn.value && profile.value) {
        const userId = authStore.user?.id;

        if (profile.value.likes) {
          liked.value = profile.value.likes.some(
            (like: any) => like.userId === userId
          );
        }

        if (profile.value.dislikes) {
          disliked.value = profile.value.dislikes.some(
            (dislike: any) => dislike.userId === userId
          );
        }
      }
    }
  } catch (err: any) {
    console.error("Error loading profile:", err);
    error.value = err.message || "Failed to load profile";
  } finally {
    loading.value = false;
  }
}

async function toggleLike() {
  if (
    !isLoggedIn.value ||
    isPerformingLikeAction.value ||
    isPerformingDislikeAction.value
  ) {
    if (!isLoggedIn.value) {
      toast.toast({
        title: t("common.error"),
        description: t("profiles.loginRequired"),
        variant: "destructive",
      });
    }
    return;
  }

  try {
    isPerformingLikeAction.value = true;

    // Spremi trenutno stanje lokalno prije API poziva
    const wasLiked = liked.value;
    const wasDisliked = disliked.value;

    const { data } = await useFetch(`/api/profiles/${profileId.value}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (data.value) {
      const { liked: isLiked, disliked: isDisliked } = data.value;

      // Ažuriraj brojače prema promjeni stanja
      if (wasLiked && !isLiked) {
        // Lajk je uklonjen
        profile.value.likeCount = Math.max(0, profile.value.likeCount - 1);
      } else if (!wasLiked && isLiked) {
        // Dodan je lajk
        profile.value.likeCount++;
      }

      // Ako je prethodno imao dislike koji je sada uklonjen
      if (wasDisliked && !isDisliked) {
        profile.value.dislikeCount = Math.max(
          0,
          profile.value.dislikeCount - 1
        );
      }

      // Postavi lokalno stanje
      liked.value = isLiked;
      disliked.value = isDisliked;
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    toast.toast({
      title: t("common.error"),
      description: t("common.somethingWentWrong"),
      variant: "destructive",
    });
  } finally {
    isPerformingLikeAction.value = false;
  }
}

async function toggleDislike() {
  if (
    !isLoggedIn.value ||
    isPerformingLikeAction.value ||
    isPerformingDislikeAction.value
  ) {
    if (!isLoggedIn.value) {
      toast.toast({
        title: t("common.error"),
        description: t("profiles.loginRequired"),
        variant: "destructive",
      });
    }
    return;
  }

  try {
    isPerformingDislikeAction.value = true;

    // Spremi trenutno stanje lokalno prije API poziva
    const wasLiked = liked.value;
    const wasDisliked = disliked.value;

    const { data } = await useFetch(
      `/api/profiles/${profileId.value}/dislike`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (data.value) {
      const { liked: isLiked, disliked: isDisliked } = data.value;

      // Ažuriraj brojače prema promjeni stanja
      if (wasDisliked && !isDisliked) {
        // Dislike je uklonjen
        profile.value.dislikeCount = Math.max(
          0,
          profile.value.dislikeCount - 1
        );
      } else if (!wasDisliked && isDisliked) {
        // Dodan je dislike
        profile.value.dislikeCount++;
      }

      // Ako je prethodno imao like koji je sada uklonjen
      if (wasLiked && !isLiked) {
        profile.value.likeCount = Math.max(0, profile.value.likeCount - 1);
      }

      // Postavi lokalno stanje
      liked.value = isLiked;
      disliked.value = isDisliked;
    }
  } catch (err) {
    console.error("Error toggling dislike:", err);
    toast.toast({
      title: t("common.error"),
      description: t("common.somethingWentWrong"),
      variant: "destructive",
    });
  } finally {
    isPerformingDislikeAction.value = false;
  }
}

async function addComment() {
  if (!commentText.value.trim() || !isLoggedIn.value) return;

  try {
    commenting.value = true;

    const { data } = await useFetch(
      `/api/profiles/${profileId.value}/comment`,
      {
        method: "POST",
        body: {
          content: commentText.value.trim(),
        },
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (data.value && data.value.comment) {
      // Dodaj novi komentar na početak liste
      if (!profile.value.comments) {
        profile.value.comments = [];
      }

      profile.value.comments.unshift(data.value.comment);
      commentText.value = ""; // Očisti polje za komentar
    }
  } catch (err) {
    console.error("Error adding comment:", err);
  } finally {
    commenting.value = false;
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return t("common.today");
  } else if (diffDays === 1) {
    return t("common.yesterday");
  } else if (diffDays < 7) {
    return diffDays + " " + t("common.days");
  } else {
    return new Date(dateString).toLocaleDateString();
  }
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function openImage(url: string) {
  selectedImage.value = url;
  // Postaviti modalImageIndex na temelju URL-a
  const index = profile.value.imageUrls.findIndex(
    (img: any) => img.url === url
  );
  if (index !== -1) {
    modalImageIndex.value = index;
  }
}

function navigateModalImage(direction: number) {
  const newIndex = modalImageIndex.value + direction;
  if (newIndex >= 0 && newIndex < profile.value.imageUrls.length) {
    modalImageIndex.value = newIndex;
    selectedImage.value = profile.value.imageUrls[newIndex].url;
  }
}

// Copy profile content to clipboard
async function copyProfileContent() {
  if (!profile.value?.jsonContent && !profile.value?.fileName) return;

  try {
    // Ako imamo jsonContent, kopiraj direktno
    if (profile.value.jsonContent) {
      await navigator.clipboard.writeText(profile.value.jsonContent);
    }
    // Ako nemamo jsonContent, pokušaj dohvatiti datoteku i pretvoriti u tekst
    else if (profile.value.fileUrl) {
      try {
        const response = await fetch(profile.value.fileUrl);
        const text = await response.text();
        await navigator.clipboard.writeText(text);
      } catch (err) {
        throw new Error("Failed to fetch file content");
      }
    }

    toast.toast({
      title: t("common.success"),
      description: t("profiles.contentCopied"),
      variant: "default",
    });
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.toast({
      title: t("common.error"),
      description: t("profiles.copyFailed"),
      variant: "destructive",
    });
  }
}

// Za pregled datoteke
async function showFilePreview() {
  if (!profile.value?.jsonContent && !profile.value?.fileUrl) return;

  // Ako već imamo jsonContent, samo prikaži modal
  if (profile.value.jsonContent) {
    showFileContent.value = true;
    return;
  }

  // Ako nemamo jsonContent, pokušaj dohvatiti datoteku
  if (profile.value.fileUrl) {
    try {
      loading.value = true;
      const response = await fetch(profile.value.fileUrl);
      profile.value.jsonContent = await response.text();
      showFileContent.value = true;
    } catch (err) {
      console.error("Failed to fetch file content:", err);
      toast.toast({
        title: t("common.error"),
        description: t("profiles.previewFailed"),
        variant: "destructive",
      });
    } finally {
      loading.value = false;
    }
  }
}

// Provjeri je li sadržaj JSON
const isJsonContent = computed(() => {
  if (!profile.value?.jsonContent) return false;
  try {
    JSON.parse(profile.value.jsonContent);
    return true;
  } catch (e) {
    return false;
  }
});

// Formatiranje JSON-a s bojama i poboljšanim rukovanjem ugniježđenim stringovima
function formatJsonContent(jsonString: string): string {
  try {
    // Raščlani JSON i ponovno ga formatiraj s razmacima za bolje čitanje
    const obj = JSON.parse(jsonString);
    const formatted = JSON.stringify(obj, null, 2);

    // Zamijeni posebne znakove kako bi se izbjeglo XSS ranjivosti
    const escaped = formatted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Prvo pronađi i obradi sve ugniježđene JSON stringove
    let processedContent = escaped;

    // Traži potencijalne JSON stringove unutar vrijednosti
    const stringPattern = /: &quot;(.*?)&quot;/g;
    processedContent = processedContent.replace(
      stringPattern,
      (match, capturedStr) => {
        // Provjeri je li uhvaćeni string potencijalno JSON
        if (
          (capturedStr.includes("\\&quot;") ||
            capturedStr.includes("\\\\&quot;")) &&
          (capturedStr.startsWith("{") || capturedStr.startsWith("["))
        ) {
          try {
            // Pokušaj dekodirati unutarnji string
            let innerString = capturedStr
              .replace(/\\&quot;/g, '"')
              .replace(/\\\\&quot;/g, '\\"')
              .replace(/\\\\/g, "\\");

            // Pokušaj parsirati kao JSON
            JSON.parse(innerString);

            // Ako je uspješno parsiran, formatiraj ga s uvlakama (oboji ga drugom bojom za lakše razlikovanje)
            const formattedInner = innerString
              .replace(/\n/g, "<br>")
              .replace(/ /g, "&nbsp;")
              .replace(/\\r\\n/g, "<br>")
              .replace(/\\n/g, "<br>");

            return (
              ': <span style="color: #98c379;">&quot;<span style="color: #b9ca88;">' +
              formattedInner +
              "</span>&quot;</span>"
            );
          } catch {
            // Ako nije valjan JSON, tretiramo ga kao običan string
            return (
              ': <span style="color: #98c379;">&quot;' +
              capturedStr +
              "&quot;</span>"
            );
          }
        }
        return (
          ': <span style="color: #98c379;">&quot;' +
          capturedStr +
          "&quot;</span>"
        );
      }
    );

    // Dodaj bojanje sintakse za ostale elemente
    return (
      processedContent
        // ključevi (imena svojstava)
        .replace(
          /&quot;([^&]*)&quot;:/g,
          '<span style="color: #e06c75;">&quot;$1&quot;</span>:'
        )
        // brojevi
        .replace(
          /: ([0-9]+)(,?)/g,
          ': <span style="color: #d19a66;">$1</span>$2'
        )
        // boolean vrijednosti i null
        .replace(
          /: (true|false|null)(,?)/g,
          ': <span style="color: #56b6c2;">$1</span>$2'
        )
        // zagrade za objekte
        .replace(
          /[{}]/g,
          (match) => `<span style="color: #abb2bf;">${match}</span>`
        )
        // zagrade za polja
        .replace(
          /[\[\]]/g,
          (match) => `<span style="color: #abb2bf;">${match}</span>`
        )
        // zarezi
        .replace(/,/g, '<span style="color: #abb2bf;">,</span>')
    );
  } catch (e) {
    console.error("Failed to format JSON:", e);
    return jsonString;
  }
}

// Učitaj profil pri montiranju komponente
onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Ukloni bijele obrube oko SVG ikonica */
.icon-no-border {
  border: none;
  outline: none;
}

/* Dodaj filtriranje za bojanje ikona kad su aktivne */
.filter-teal {
  /* color is now handled by text-teal-500 class */
}

.filter-red {
  /* color is now handled by text-red-500 class */
}

/* Spinner za stanje učitavanja */
.spinner-small {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 2px solid #3498db;
  animation: spin 1s linear infinite;
}

.dark .spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #3498db;
}
</style>
