<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Toast komponenta za obavijesti -->
  <UiToastToaster />
</template>

<script setup>
import UiToastToaster from "@/components/ui/toast/Toaster.vue";
</script>
