<script setup lang="ts">
import { Search as SearchIcon } from 'lucide-vue-next'

const localePath = useLocalePath()
const { loggedIn } = useUserSession()
const { t } = useI18n()
</script>

<template>
  <header
    class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-[2] justify-between"
  >
    <nav
      class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
    >
      <NuxtLink :to="localePath('/')" class="min-w-[46px]">
        <TclLogo />
        <span class="sr-only">{{ t('layout.tcl') }}</span>
      </NuxtLink>
      <TclTopNavigation :logged-in="loggedIn" />
    </nav>
    <TclMobileNavigation :logged-in="loggedIn" with-taco />
    <div class="grid grid-flow-col items-center gap-2 md:ml-auto md:gap-4">
      <!-- <NuxtLink :to="localePath('/search')" class="md:hidden"> -->
      <!-- <Button size="icon" variant="outline" class="rounded-full">
        <SearchIcon />
      </Button> -->
      <!-- </NuxtLink> -->
      <TclSearchSheet class="md:hidden" />
      <TclSearchbox
        class="hidden md:block min-w-175px md:min-w-[225px] lg:min-w-[350px]"
      />
      <TclModeToggle />
      <TclLocaleSwitch />
      <TclContactMenu />
      <TclUserMenu :logged-in="loggedIn" />
    </div>
  </header>
</template>
