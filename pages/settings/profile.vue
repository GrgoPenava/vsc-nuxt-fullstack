<template>
  <div class="container py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Uredi profil</h1>

      <!-- Forma za uređivanje profila -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Osnovni podaci -->
          <div>
            <h2 class="text-lg font-semibold mb-4">Osnovni podaci</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <!-- Korisnički podaci koji se ne mogu mijenjati -->
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Korisničko ime</label
                >
                <input
                  type="text"
                  class="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                  :value="userData?.username"
                  disabled
                />
                <p class="text-xs text-gray-500 mt-1">
                  Korisničko ime se ne može mijenjati
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  class="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                  :value="userData?.email"
                  disabled
                />
                <p class="text-xs text-gray-500 mt-1">
                  Email adresa se ne može mijenjati
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Ime i prezime -->
              <div>
                <label for="firstName" class="block text-sm font-medium mb-1"
                  >Ime</label
                >
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="Vaše ime"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium mb-1"
                  >Prezime</label
                >
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="Vaše prezime"
                />
              </div>
            </div>
          </div>

          <!-- Avatar -->
          <div>
            <h2 class="text-lg font-semibold mb-4">Profilna slika</h2>

            <div class="flex items-center space-x-6">
              <div class="shrink-0">
                <img
                  :src="avatarPreview"
                  alt="Profilna slika"
                  class="h-24 w-24 object-cover rounded-full"
                />
              </div>

              <div class="flex-1">
                <label for="avatar" class="block text-sm font-medium mb-1"
                  >URL profilne slike</label
                >
                <input
                  id="avatar"
                  v-model="formData.avatar"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="https://primjer.com/slika.jpg"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Unesite URL do vaše profilne slike
                </p>
              </div>
            </div>
          </div>

          <!-- Biografija -->
          <div>
            <h2 class="text-lg font-semibold mb-4">Biografija</h2>

            <div>
              <label for="bio" class="block text-sm font-medium mb-1"
                >O meni</label
              >
              <textarea
                id="bio"
                v-model="formData.bio"
                rows="4"
                class="w-full px-3 py-2 border rounded-md"
                placeholder="Napišite nešto o sebi..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Maksimalno 500 znakova</p>
            </div>
          </div>

          <!-- Promjena lozinke -->
          <div>
            <h2 class="text-lg font-semibold mb-4">Promjena lozinke</h2>
            <p class="text-sm text-gray-500 mb-4">
              Ostavite prazno ako ne želite mijenjati lozinku
            </p>

            <div class="space-y-4">
              <div>
                <label
                  for="currentPassword"
                  class="block text-sm font-medium mb-1"
                  >Trenutna lozinka</label
                >
                <input
                  id="currentPassword"
                  v-model="formData.currentPassword"
                  type="password"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="********"
                />
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium mb-1"
                  >Nova lozinka</label
                >
                <input
                  id="newPassword"
                  v-model="formData.newPassword"
                  type="password"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="********"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i
                  jedan poseban znak
                </p>
              </div>

              <div>
                <label
                  for="confirmNewPassword"
                  class="block text-sm font-medium mb-1"
                  >Potvrda nove lozinke</label
                >
                <input
                  id="confirmNewPassword"
                  v-model="formData.confirmNewPassword"
                  type="password"
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="********"
                />
              </div>
            </div>
          </div>

          <!-- Greška -->
          <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-md">
            {{ error }}
          </div>

          <!-- Gumbi -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md"
              @click="resetForm"
            >
              Odustani
            </button>

            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Spremanje...</span>
              <span v-else>Spremi promjene</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/toast/use-toast";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();
const userData = computed(() => authStore.user);
const isLoading = computed(() => authStore.isLoading);
const error = ref<string | null>(null);

// Formular za uređivanje profila
const formData = reactive({
  firstName: "",
  lastName: "",
  bio: "",
  avatar: "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

// Preview avatara
const avatarPreview = computed(
  () =>
    formData.avatar ||
    userData.value?.avatar ||
    "https://i.pravatar.cc/150?img=30"
);

// Popuni obrazac s postojećim podacima
onMounted(() => {
  resetForm();
});

// Resetiraj obrazac na početne vrijednosti
function resetForm() {
  if (userData.value) {
    formData.firstName = userData.value.firstName || "";
    formData.lastName = userData.value.lastName || "";
    formData.bio = userData.value.bio || "";
    formData.avatar = userData.value.avatar || "";
  }
  formData.currentPassword = "";
  formData.newPassword = "";
  formData.confirmNewPassword = "";
  error.value = null;
}

// Ažuriraj profil
async function updateProfile() {
  try {
    error.value = null;

    // Filtriraj podatke - šalji samo popunjena polja
    const profileData: any = {};
    if (formData.firstName) profileData.firstName = formData.firstName;
    if (formData.lastName) profileData.lastName = formData.lastName;
    if (formData.bio !== undefined) profileData.bio = formData.bio;
    if (formData.avatar) profileData.avatar = formData.avatar;

    // Dodaj podatke za promjenu lozinke samo ako su uneseni
    if (formData.newPassword) {
      profileData.currentPassword = formData.currentPassword;
      profileData.newPassword = formData.newPassword;
      profileData.confirmNewPassword = formData.confirmNewPassword;
    }

    // Pošalji zahtjev za ažuriranje
    const result = await authStore.updateProfile(profileData);

    if (result.success) {
      toast({
        title: "Uspješno",
        description: "Profil je uspješno ažuriran",
        variant: "default",
      });

      // Resetiraj polja za lozinku
      formData.currentPassword = "";
      formData.newPassword = "";
      formData.confirmNewPassword = "";
    } else {
      error.value =
        result.error || "Došlo je do greške prilikom ažuriranja profila";
      toast({
        title: "Greška",
        description:
          error.value || "Došlo je do greške prilikom ažuriranja profila",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    error.value =
      err.message || "Došlo je do greške prilikom ažuriranja profila";
    toast({
      title: "Greška",
      description: "Došlo je do greške prilikom ažuriranja profila",
      variant: "destructive",
    });
  }
}
</script>
