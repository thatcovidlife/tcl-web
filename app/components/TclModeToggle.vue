<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline" size="icon" class="rounded-full">
        <Icon
          name="bi:sun"
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Icon
          name="mynaui:moon-star"
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">{{ t('layout.toggleTheme') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{{ t('layout.theme') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        @click="colorMode.preference = 'light'"
        class="hover:cursor-pointer"
      >
        <span>{{ t('layout.themeOptions.light') }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="colorMode.preference = 'dark'"
        class="hover:cursor-pointer"
      >
        <span>{{ t('layout.themeOptions.dark') }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="colorMode.preference = 'system'"
        class="hover:cursor-pointer"
      >
        <span>{{ t('layout.themeOptions.system') }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
