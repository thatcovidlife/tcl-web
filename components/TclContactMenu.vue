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
      <!-- <DropdownMenuItem>
        <NuxtLink :to="localePath('/contact-us')">{{
          t('layout.contactUs')
        }}</NuxtLink>
      </DropdownMenuItem> -->
      <DropdownMenuItem>
        <NuxtLink :to="localePath('/contribute')">{{
          t('layout.submitContent')
        }}</NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <NuxtLink :to="localePath('/support')">{{
          t('layout.support')
        }}</NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
