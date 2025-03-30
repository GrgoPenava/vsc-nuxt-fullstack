<template>
  <div class="container py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <!-- Kartica s brojem korisnika -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">
            Ukupno korisnika
          </h3>
          <p class="text-3xl font-bold mt-2">{{ users.length }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">
            Verificirani korisnici
          </h3>
          <p class="text-3xl font-bold mt-2">{{ verifiedUsersCount }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">
            Disabled
          </h3>
          <p class="text-3xl font-bold mt-2">{{ disabledUsersCount }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">
            Admini
          </h3>
          <p class="text-3xl font-bold mt-2">{{ adminUsersCount }}</p>
        </div>
      </div>

      <!-- Tablica korisnika -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <h2 class="text-xl font-semibold">Upravljanje korisnicima</h2>

          <div class="flex flex-col md:flex-row gap-4">
            <!-- Filter za status -->
            <select
              v-model="statusFilter"
              class="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Svi korisnici</option>
              <option value="enabled">Samo omogućeni</option>
              <option value="disabled">Samo onemogućeni</option>
            </select>

            <!-- Pretraživanje -->
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <svg
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                v-model="searchQuery"
                class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Pretraži po email ili username..."
              />
            </div>
          </div>

          <div v-if="isLoading" class="text-gray-500">Učitavanje...</div>
        </div>

        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Korisnik
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Uloga
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="user in paginatedUsers"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <template v-if="user.avatar">
                        <img
                          class="h-10 w-10 rounded-full"
                          :src="user.avatar"
                          :alt="user.username"
                        />
                      </template>
                      <template v-else>
                        <div
                          class="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium"
                        >
                          {{ getUserInitials(user) }}
                        </div>
                      </template>
                    </div>
                    <div class="ml-4">
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        @{{ user.username }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ user.email }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    "
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="
                      user.verified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    "
                  >
                    {{ user.verified ? "Verificiran" : "Neverificiran" }}
                  </span>

                  <!-- Status računa (omogućen/onemogućen) -->
                  <span
                    v-if="user.disabled"
                    class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    Onemogućen
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex space-x-2 justify-end">
                    <!-- Gumb za omogućavanje/onemogućavanje korisnika -->
                    <button
                      v-if="!user.disabled"
                      @click="toggleUserStatus(user, true)"
                      class="px-3 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                      :disabled="user.role === 'admin'"
                      :class="{
                        'opacity-50 cursor-not-allowed': user.role === 'admin',
                      }"
                    >
                      Onemogući
                    </button>
                    <button
                      v-else
                      @click="toggleUserStatus(user, false)"
                      class="px-3 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                    >
                      Omogući
                    </button>

                    <button
                      @click="openEditModal(user)"
                      class="px-3 py-1 text-xs rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                    >
                      Uredi
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Ako nema rezultata pretrage -->
              <tr v-if="filteredUsers.length === 0">
                <td
                  colspan="5"
                  class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Nema pronađenih korisnika
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginacija -->
        <div
          class="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              Prethodna
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              :class="{
                'opacity-50 cursor-not-allowed': currentPage === totalPages,
              }"
            >
              Sljedeća
            </button>
          </div>
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Prikazuje se
                <span class="font-medium">{{ paginationStart }}</span> do
                <span class="font-medium">{{ paginationEnd }}</span> od
                <span class="font-medium">{{ filteredUsers.length }}</span>
                korisnika
              </p>
            </div>
            <div>
              <nav
                class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === 1,
                  }"
                >
                  <span class="sr-only">Prva</span>
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === 1,
                  }"
                >
                  <span class="sr-only">Prethodna</span>
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <template v-for="page in displayedPages" :key="page.id">
                  <button
                    v-if="page.value !== '...'"
                    @click="currentPage = Number(page.value)"
                    :class="[
                      currentPage === page.value
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-200'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600',
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    ]"
                  >
                    {{ page.value }}
                  </button>
                  <span
                    v-else
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    ...
                  </span>
                </template>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === totalPages,
                  }"
                >
                  <span class="sr-only">Sljedeća</span>
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === totalPages,
                  }"
                >
                  <span class="sr-only">Zadnja</span>
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal za uređivanje korisnika -->
  <div
    v-if="editModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold">Uredi korisnika</h3>
      </div>

      <form @submit.prevent="updateUser" class="p-4">
        <!-- Avatar korisnika -->
        <div class="mb-6 flex flex-col items-center">
          <div class="relative group mb-3">
            <template v-if="previewSrc">
              <img
                :src="previewSrc"
                class="h-24 w-24 rounded-full object-cover border-2 border-teal-400"
                alt="Avatar Preview"
              />
            </template>
            <template v-else-if="editUserAvatar">
              <img
                :src="editUserAvatar"
                class="h-24 w-24 rounded-full object-cover border-2 border-teal-400"
                alt="Avatar"
              />
            </template>
            <template v-else>
              <div
                class="h-24 w-24 rounded-full border-2 border-teal-400 bg-teal-500 flex items-center justify-center text-white font-bold text-xl"
              >
                {{ getUserInitials(editUserForm) }}
              </div>
            </template>

            <!-- Overlay s ikonom za promjenu -->
            <div
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <label for="avatar-edit-upload" class="cursor-pointer p-4">
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
                id="avatar-edit-upload"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleAvatarFileChange"
              />
            </div>
          </div>

          <div class="flex space-x-2">
            <button
              v-if="editUserAvatar || previewSrc"
              type="button"
              class="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              @click="deleteAvatar"
            >
              Obriši avatar
            </button>
            <button
              v-if="previewSrc"
              type="button"
              class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              @click="cancelAvatarChange"
            >
              Poništi
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-1"
              >Email</label
            >
            <input
              id="email"
              v-model="editUserForm.email"
              type="email"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Email korisnika"
            />
          </div>

          <!-- Ime i prezime -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium mb-1"
                >Ime</label
              >
              <input
                id="firstName"
                v-model="editUserForm.firstName"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                placeholder="Ime"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium mb-1"
                >Prezime</label
              >
              <input
                id="lastName"
                v-model="editUserForm.lastName"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                placeholder="Prezime"
              />
            </div>
          </div>

          <!-- Nova lozinka -->
          <div>
            <label for="password" class="block text-sm font-medium mb-1"
              >Nova lozinka</label
            >
            <input
              id="password"
              v-model="editUserForm.password"
              type="password"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Ostavite prazno ako ne želite mijenjati"
            />
            <p class="text-xs text-gray-500 mt-1">
              Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i jedan
              poseban znak
            </p>
          </div>

          <!-- Uloga -->
          <div>
            <label for="roleId" class="block text-sm font-medium mb-1"
              >Uloga</label
            >
            <select
              id="roleId"
              v-model="editUserForm.roleId"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <!-- Verifikacija -->
          <div class="flex items-center">
            <input
              id="verified"
              v-model="editUserForm.verified"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label for="verified" class="ml-2 block text-sm">
              Verificiran korisnik
            </label>
          </div>

          <!-- Greška -->
          <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-md">
            {{ error }}
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md"
            @click="closeEditModal"
          >
            Odustani
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Spremanje...</span>
            <span v-else>Spremi promjene</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { toast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  middleware: ["admin"],
});

const userStore = useUserStore();
const authStore = useAuthStore();
const isLoading = computed(() => userStore.isLoading);
const error = computed(() => userStore.error);

// Stanja za modalno okno i formu
const editModalOpen = ref(false);
const editUserForm = reactive({
  userId: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  roleId: "",
  verified: false,
});

// Stanja za avatar
const editUserAvatar = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const avatarToDelete = ref(false);

// Podaci o korisnicima i rolama
const users = ref<any[]>([]);
const roles = ref<any[]>([]);

// Izračunaj broj verificiranih korisnika
const verifiedUsersCount = computed(() => {
  return users.value.filter((user) => user.verified).length;
});

// Izračunaj broj onemogućenih korisnika
const disabledUsersCount = computed(() => {
  return users.value.filter((user) => user.disabled).length;
});

// Izračunaj broj admin korisnika
const adminUsersCount = computed(() => {
  return users.value.filter((user) => user.role === "admin").length;
});

// Pretraživanje
const searchQuery = ref("");

// Paginacija
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Status filter
const statusFilter = ref("all");

// Filtriranje korisnika na temelju pretrage i statusa
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Primijeni filter za status
  if (statusFilter.value === "enabled") {
    filtered = filtered.filter((user) => !user.disabled);
  } else if (statusFilter.value === "disabled") {
    filtered = filtered.filter((user) => user.disabled);
  }

  // Primijeni filter za pretragu
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Izračunaj ukupan broj stranica
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

// Generiraj array stranica za prikaz u paginaciji, s dodatnim ID za key u v-for
const displayedPages = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => ({
      id: `page-${i + 1}`,
      value: i + 1,
    }));
  }

  if (currentPage.value <= 3) {
    return [
      { id: "page-1", value: 1 },
      { id: "page-2", value: 2 },
      { id: "page-3", value: 3 },
      { id: "page-4", value: 4 },
      { id: "ellipsis-1", value: "..." },
      { id: `page-${totalPages.value}`, value: totalPages.value },
    ];
  }

  if (currentPage.value >= totalPages.value - 2) {
    return [
      { id: "page-1", value: 1 },
      { id: "ellipsis-1", value: "..." },
      { id: `page-${totalPages.value - 3}`, value: totalPages.value - 3 },
      { id: `page-${totalPages.value - 2}`, value: totalPages.value - 2 },
      { id: `page-${totalPages.value - 1}`, value: totalPages.value - 1 },
      { id: `page-${totalPages.value}`, value: totalPages.value },
    ];
  }

  return [
    { id: "page-1", value: 1 },
    { id: "ellipsis-1", value: "..." },
    { id: `page-${currentPage.value - 1}`, value: currentPage.value - 1 },
    { id: `page-${currentPage.value}`, value: currentPage.value },
    { id: `page-${currentPage.value + 1}`, value: currentPage.value + 1 },
    { id: "ellipsis-2", value: "..." },
    { id: `page-${totalPages.value}`, value: totalPages.value },
  ];
});

// Straničeni korisnici za trenutnu stranicu
const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  return filteredUsers.value.slice(startIndex, startIndex + itemsPerPage.value);
});

// Podaci za paginaciju
const paginationStart = computed(() => {
  if (filteredUsers.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredUsers.value.length === 0) return 0;
  return Math.min(
    currentPage.value * itemsPerPage.value,
    filteredUsers.value.length
  );
});

// Resetiraj stranicu kad se promijeni filter
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

// Dohvat podataka o korisnicima i rolama
onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    const [fetchedUsers, fetchedRoles] = await Promise.all([
      userStore.fetchUsers(),
      userStore.fetchRoles(),
    ]);

    users.value = fetchedUsers;
    roles.value = fetchedRoles;

    // Dohvati avatare korisnika
    await fetchUserAvatars();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Funkcija za dohvaćanje avatara korisnika iz S3 bucketa
async function fetchUserAvatars() {
  try {
    // Ažuriraj avatar URL za svakog korisnika
    for (let i = 0; i < users.value.length; i++) {
      const user = users.value[i];
      if (user.avatar) {
        const avatarUrl = await authStore.getAvatarUrl(user.id);
        if (avatarUrl) {
          users.value[i].avatar = avatarUrl;
        } else {
          // Ako avatar postoji u bazi ali ne i u S3, postavi na null
          users.value[i].avatar = null;
        }
      }
    }
  } catch (error) {
    console.error("Greška pri dohvatu avatara korisnika:", error);
  }
}

// Funkcije za modalno okno za uređivanje
function openEditModal(user: any) {
  // Nađi roleId prema imenu role
  const userRole = roles.value.find((role) => role.name === user.role);

  editUserForm.userId = user.id;
  editUserForm.email = user.email;
  editUserForm.firstName = user.firstName;
  editUserForm.lastName = user.lastName;
  editUserForm.password = "";
  editUserForm.roleId = userRole?.id || "";
  editUserForm.verified = user.verified;

  // Postavi avatar korisnika
  editUserAvatar.value = user.avatar;
  previewSrc.value = null;
  avatarFile.value = null;
  avatarToDelete.value = false;

  editModalOpen.value = true;
}

function closeEditModal() {
  editModalOpen.value = false;

  // Resetiraj stanja avatara
  editUserAvatar.value = null;
  previewSrc.value = null;
  avatarFile.value = null;
  avatarToDelete.value = false;
}

// Funkcija za rukovanje odabirom datoteke za avatar
function handleAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  const file = files[0];
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg"];

  // Provjeri je li datoteka slika
  if (!supportedTypes.includes(file.type)) {
    toast({
      title: "Greška",
      description: "Možete prenijeti samo slike",
      variant: "destructive",
    });
    return;
  }

  // Postavi datoteku i prikaz previewa
  avatarFile.value = file;
  previewSrc.value = URL.createObjectURL(file);
  avatarToDelete.value = false;
}

// Funkcija za poništavanje promjene avatara
function cancelAvatarChange() {
  previewSrc.value = null;
  avatarFile.value = null;
  avatarToDelete.value = false;
}

// Funkcija za brisanje avatara
function deleteAvatar() {
  previewSrc.value = null;
  avatarFile.value = null;
  editUserAvatar.value = null;
  avatarToDelete.value = true;
}

async function updateUser() {
  try {
    // Pripremi podatke za slanje - samo popunjena polja
    const updateData: any = { userId: editUserForm.userId };

    if (editUserForm.email) updateData.email = editUserForm.email;
    if (editUserForm.firstName) updateData.firstName = editUserForm.firstName;
    if (editUserForm.lastName) updateData.lastName = editUserForm.lastName;
    if (editUserForm.password) updateData.password = editUserForm.password;
    if (editUserForm.roleId) updateData.roleId = editUserForm.roleId;
    updateData.verified = editUserForm.verified;

    // Prvo ažuriramo korisničke podatke
    const result = await userStore.updateUser(updateData);

    if (result.success) {
      let avatarChanged = false;

      // Ako postoji nova datoteka za upload
      if (avatarFile.value) {
        try {
          await uploadUserAvatar(editUserForm.userId, avatarFile.value);
          avatarChanged = true;
        } catch (error) {
          console.error("Greška pri uploadu avatara:", error);
          toast({
            title: "Upozorenje",
            description:
              "Korisnički podaci su ažurirani, ali avatar nije uspješno učitan",
            variant: "destructive",
          });
        }
      }

      // Ako je avatar označen za brisanje
      if (avatarToDelete.value) {
        try {
          await deleteUserAvatar(editUserForm.userId);
          avatarChanged = true;
        } catch (error) {
          console.error("Greška pri brisanju avatara:", error);
          toast({
            title: "Upozorenje",
            description:
              "Korisnički podaci su ažurirani, ali avatar nije uspješno obrisan",
            variant: "destructive",
          });
        }
      }

      // Ažuriraj korisnika u lokalnoj listi odmah
      const userIndex = users.value.findIndex(
        (u) => u.id === editUserForm.userId
      );
      if (userIndex !== -1) {
        // Dohvati rolu prema ID-u
        const selectedRole = roles.value.find(
          (role) => role.id === editUserForm.roleId
        );
        const roleName = selectedRole
          ? selectedRole.name
          : users.value[userIndex].role;

        // Ažuriraj lokalne podatke
        users.value[userIndex] = {
          ...users.value[userIndex],
          email: editUserForm.email || users.value[userIndex].email,
          firstName: editUserForm.firstName || users.value[userIndex].firstName,
          lastName: editUserForm.lastName || users.value[userIndex].lastName,
          role: roleName,
          verified: editUserForm.verified,
        };

        // Ažuriraj avatar ako je promijenjen
        if (avatarChanged) {
          // Osvježi sve avatare nakon promjene
          await fetchUserAvatars();
        }
      }

      // Prikaži toast obavijest
      toast({
        title: "Uspješno",
        description: `Korisnik ${editUserForm.firstName} ${editUserForm.lastName} je uspješno ažuriran!`,
        variant: "default",
      });

      closeEditModal();
    } else {
      toast({
        title: "Greška",
        description:
          result.error || "Došlo je do greške prilikom ažuriranja korisnika",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    toast({
      title: "Greška",
      description:
        err.message || "Došlo je do greške prilikom ažuriranja korisnika",
      variant: "destructive",
    });
  }
}

// Funkcija za upload avatara za korisnika
async function uploadUserAvatar(userId: string, file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  formData.append("userId", userId); // Dodajemo userId da znamo za kojeg korisnika spremamo avatar

  await $fetch("/api/admin/uploadUserAvatar", {
    method: "POST",
    body: formData,
    headers: authStore.getAuthHeaders,
  });
}

// Funkcija za brisanje avatara korisnika
async function deleteUserAvatar(userId: string) {
  await $fetch(`/api/admin/deleteUserAvatar?userId=${userId}`, {
    method: "DELETE",
    headers: authStore.getAuthHeaders,
  });
}

// Prilagođeno za template kako bismo mogli provjeriti je li vrijednost string ili broj
function isNumber(value: any): boolean {
  return typeof value === "number";
}

// Funkcija za dohvat inicijala korisnika
function getUserInitials(user: {
  firstName?: string;
  lastName?: string;
  username?: string;
}): string {
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
}

// Funkcija za omogućavanje/onemogućavanje korisnika
async function toggleUserStatus(user: any, disableUser: boolean) {
  try {
    const result = await userStore.updateUser({
      userId: user.id,
      disabled: disableUser,
    });

    if (result.success) {
      // Ažuriraj korisnika u lokalnoj listi odmah
      const userIndex = users.value.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        // Ažuriraj disabled status
        users.value[userIndex].disabled = disableUser ? new Date() : null;
      }

      // Prikaži toast obavijest
      toast({
        title: "Uspješno",
        description: disableUser
          ? `Korisnički račun ${user.firstName} ${user.lastName} je onemogućen`
          : `Korisnički račun ${user.firstName} ${user.lastName} je omogućen`,
        variant: "default",
      });
    } else {
      toast({
        title: "Greška",
        description:
          result.error || "Došlo je do greške prilikom ažuriranja korisnika",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    toast({
      title: "Greška",
      description:
        err.message || "Došlo je do greške prilikom ažuriranja korisnika",
      variant: "destructive",
    });
  }
}
</script>
