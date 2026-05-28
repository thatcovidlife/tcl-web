<template>
  <div class="font-sans">
    <TclHeader />
    <TclBody class="h-[calc(100vh-64px)]">
      <NuxtPage />
    </TclBody>
    <ClientOnly>
      <LazyTclPrivacyPolicyUpdateModal />
    </ClientOnly>
    <Toaster />
    <NuxtPwaManifest />
  </div>
</template>
