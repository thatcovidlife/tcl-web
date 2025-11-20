<template>
  <div class="font-sans">
    <TclHeader />
    <TclBody class="h-[calc(100vh-64px)] grid md:grid-cols-[16rem_1fr]">
      <TclChatSidebar />
      <NuxtPage />
    </TclBody>
    <Toaster />
  </div>
</template>
