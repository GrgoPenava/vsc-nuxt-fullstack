<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6 flex items-center">
        <NuxtLink
          to="/profiles"
          class="flex items-center text-teal-500 hover:text-teal-600"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          {{ t("common.backToProfiles") }}
        </NuxtLink>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {{ t("profiles.createNewProfile") }}
      </h1>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form @submit.prevent="submitForm">
          <!-- Basic info -->
          <div class="mb-8">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              {{ t("profiles.basicInfo") }}
            </h2>

            <div class="mb-4">
              <label
                class="block text-gray-700 dark:text-gray-300 mb-2"
                for="name"
              >
                {{ t("profiles.profileName") }} *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                :placeholder="t('profiles.profileNamePlaceholder')"
                required
              />
            </div>

            <div class="mb-4">
              <label
                class="block text-gray-700 dark:text-gray-300 mb-2"
                for="description"
              >
                {{ t("profiles.description") }} *
              </label>
              <textarea
                id="description"
                v-model="form.description"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                :placeholder="t('profiles.descriptionPlaceholder')"
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <!-- Profile file -->
          <div class="mb-8">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              {{ t("profiles.profileFile") }}
            </h2>

            <div class="mb-4">
              <label
                class="block text-gray-700 dark:text-gray-300 mb-2"
                for="profileFile"
              >
                {{ t("profiles.uploadProfile") }} *
              </label>
              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4"
              >
                <div v-if="profileFile" class="mb-2">
                  <div class="flex items-center text-teal-500">
                    <i class="fas fa-file-code mr-2"></i>
                    <span>{{ profileFile.name }}</span>
                    <button
                      type="button"
                      class="ml-2 text-red-500 hover:text-red-600"
                      @click="profileFile = null"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ formatFileSize(profileFile.size) }}
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <i
                    class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"
                  ></i>
                  <p class="text-gray-500 dark:text-gray-400 mb-2">
                    {{ t("profiles.dragProfileFile") }}
                  </p>
                  <button
                    type="button"
                    class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                    @click="profileFileInput?.click()"
                  >
                    {{ t("profiles.browseFiles") }}
                  </button>
                </div>
                <input
                  ref="profileFileInput"
                  type="file"
                  class="hidden"
                  accept=".code-profile,.vsix"
                  @change="handleProfileFileChange"
                />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ t("profiles.acceptedFileTypes") }}: .code-profile, .vsix
              </p>
            </div>
          </div>

          <!-- Extensions -->
          <div class="mb-8">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              {{ t("profiles.extensions") }}
            </h2>

            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">
                {{ t("profiles.addExtensions") }}
              </label>
              <div class="space-y-2">
                <div
                  v-for="(extension, index) in form.extensions"
                  :key="index"
                  class="relative"
                >
                  <div
                    class="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-3"
                  >
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {{ t("profiles.publisher") }}
                        </label>
                        <input
                          v-model="extension.publisher"
                          type="text"
                          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {{ t("profiles.extensionName") }}
                        </label>
                        <input
                          v-model="extension.name"
                          type="text"
                          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {{ t("profiles.description") }} ({{
                          t("common.optional")
                        }})
                      </label>
                      <textarea
                        v-model="extension.description"
                        rows="2"
                        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      ></textarea>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {{ t("profiles.link") }} ({{ t("common.optional") }})
                      </label>
                      <input
                        v-model="extension.link"
                        type="url"
                        placeholder="https://marketplace.visualstudio.com/..."
                        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    class="text-red-500 hover:text-red-600"
                    @click="removeExtension(index)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="mt-2 flex items-center text-teal-500 hover:text-teal-600"
                @click="addExtension"
              >
                <i class="fas fa-plus-circle mr-2"></i>
                {{ t("profiles.addMoreExtensions") }}
              </button>
            </div>
          </div>

          <!-- Images -->
          <div class="mb-8">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              {{ t("profiles.screenshots") }}
            </h2>

            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">
                {{ t("profiles.uploadScreenshots") }}
              </label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  v-for="(image, index) in previewImages"
                  :key="index"
                  class="relative h-40 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
                >
                  <img
                    :src="image.preview"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
                    @click="removeImage(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div
                  v-if="previewImages.length < 7"
                  class="h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex flex-col items-center justify-center cursor-pointer"
                  @click="imageInput?.click()"
                >
                  <i class="fas fa-image text-3xl text-gray-400 mb-2"></i>
                  <span class="text-gray-500 dark:text-gray-400">
                    {{ t("profiles.addImage") }}
                  </span>
                  <input
                    ref="imageInput"
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleImageChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end mt-6">
            <button
              type="button"
              class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md mr-2"
              @click="resetForm"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              {{ submitting ? t("common.submitting") : t("common.submit") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/composables/useTranslation";
import { useRouter } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";

const { t } = useTranslation();
const authStore = useAuthStore();
const router = useRouter();
const { toast } = useToast();

// Provjera autentifikacije
onMounted(() => {
  if (!authStore.isLoggedIn) {
    toast({
      title: t("common.error"),
      description: t("profiles.loginRequired"),
      variant: "destructive",
    });
    router.push("/login");
  }
});

// Refs
const profileFileInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

// Stanje
const form = reactive({
  name: "",
  description: "",
  extensions: [{ publisher: "", name: "", description: "", link: "" }],
});

const profileFile = ref<File | null>(null);
const previewImages = ref<Array<{ file: File; preview: string }>>([]);
const submitting = ref(false);

// Metode
function addExtension() {
  form.extensions.push({ publisher: "", name: "", description: "", link: "" });
}

function removeExtension(index: number) {
  form.extensions.splice(index, 1);
  // Osiguraj da uvijek postoji barem jedna ekstenzija
  if (form.extensions.length === 0) {
    form.extensions.push({
      publisher: "",
      name: "",
      description: "",
      link: "",
    });
  }
}

function handleProfileFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    profileFile.value = target.files[0];
  }
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    // Provjeri maksimalni broj slika
    if (previewImages.value.length >= 7) {
      alert(t("profiles.maxImagesReached"));
      target.value = ""; // Reset input
      return;
    }

    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && e.target.result) {
        previewImages.value.push({
          file,
          preview: e.target.result as string,
        });
      }
    };

    reader.readAsDataURL(file);
    target.value = ""; // Reset input za ponovno korištenje
  }
}

function removeImage(index: number) {
  previewImages.value.splice(index, 1);
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

function resetForm() {
  form.name = "";
  form.description = "";
  form.extensions = [{ publisher: "", name: "", description: "", link: "" }];
  profileFile.value = null;
  previewImages.value = [];

  router.push("/profiles");
}

async function submitForm() {
  if (!form.name || !form.description || !profileFile.value) {
    alert(t("profiles.fillRequiredFields"));
    return;
  }

  // Filtriraj nepotpune ekstenzije
  const validExtensions = form.extensions.filter(
    (ext) => ext.publisher && ext.name
  );

  try {
    submitting.value = true;

    // Pripremi FormData za upload
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("extensions", JSON.stringify(validExtensions));

    // Dodaj profile file
    formData.append("profileFile", profileFile.value);

    // Dodaj slike
    previewImages.value.forEach((img, index) => {
      formData.append(`image${index}`, img.file);
    });

    // Pošalji zahtjev
    const { data, error } = await useFetch("/api/profiles", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (error.value) {
      throw new Error(error.value.message || "Failed to create profile");
    }

    if (data.value) {
      // Uspješno kreiran profil, preusmjeri na detalje profila
      router.push(`/profiles/${data.value.id}`);
    }
  } catch (err: any) {
    console.error("Error creating profile:", err);
    alert(err.message || t("common.errorOccurred"));
  } finally {
    submitting.value = false;
  }
}
</script>
