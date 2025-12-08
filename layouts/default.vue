<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="font-sans">
    <TclHeader />
    <TclBody>
      <NuxtPage />
    </TclBody>
    <Separator />
    <TclFooter class="bg-muted" />
    <Toaster />
    <NuxtPwaManifest />
  </div>
</template>
