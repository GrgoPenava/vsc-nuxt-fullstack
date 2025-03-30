<template>
  <div class="container mx-auto py-10">
    <div
      class="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center"
    >
      <div class="w-full max-w-lg rounded-lg border bg-card p-8 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from "@/components/auth/RegisterForm.vue";

definePageMeta({
  layout: "default",
  middleware: ["guest"],
});
</script>
