<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline" size="icon" class="rounded-full">
        <Icon
          name="streamline:interface-edit-write-1-edit-edition-form-pen-text-write"
          :size="18"
        />
        <span class="sr-only">{{ t('layout.toggleContactMenu') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{{ t('layout.contactInfo') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <NuxtLink :to="localePath('/contribute')">
        <DropdownMenuItem class="hover:cursor-pointer">
          {{ t('layout.submitContent') }}
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink :to="localePath('/support')">
        <DropdownMenuItem class="hover:cursor-pointer">
          {{ t('layout.support') }}
        </DropdownMenuItem>
      </NuxtLink>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
