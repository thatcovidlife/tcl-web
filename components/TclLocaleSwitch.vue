<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline" size="icon" class="rounded-full">
        <span class="uppercase font-light text-sm tracking-wider">{{
          locale
        }}</span>
        <span class="sr-only">{{ $t('layout.toggleLanguage') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{{ $t('layout.language') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <NuxtLink
        v-for="locale in locales"
        :to="switchLocalePath(locale.code)"
        :key="locale.code"
      >
        <DropdownMenuItem class="hover:cursor-pointer">
          {{ locale.name }}
        </DropdownMenuItem>
      </NuxtLink>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
