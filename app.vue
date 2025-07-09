<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Toast komponenta za obavijesti -->
  <UiToastToaster />
</template>

<script setup lang="ts">
import UiToastToaster from "@/components/ui/toast/Toaster.vue";
</script>
