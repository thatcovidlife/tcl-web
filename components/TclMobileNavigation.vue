<script setup lang="ts">
import { useNavConfig } from '@/composables/useNavConfig'
import { cn } from '@/lib/utils'

const props = defineProps<{
  loggedIn?: boolean
  withTaco?: boolean
}>()

const { mobileConfig } = useNavConfig()
const localePath = useLocalePath()
const { t } = useI18n()

const lockIcon = computed(() =>
  props.loggedIn ? 'mynaui:lock-open' : 'mynaui:lock',
)
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="outline" size="icon" class="shrink-0 md:hidden">
        <Icon v-if="withTaco" name="mdi:taco" :size="20" class="h-5 w-5" />
        <Icon v-else name="cil:hamburger-menu" :size="20" class="h-5 w-5" />
        <span class="sr-only">{{ t('layout.toggleNavMenu') }}</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      <SheetHeader class="hidden">
        <SheetTitle>{{ t('layout.tcl') }}</SheetTitle>
        <SheetDescription>{{ t('layout.tcl') }}</SheetDescription>
      </SheetHeader>
      <nav class="grid gap-5 text-lg font-medium">
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-2 text-lg font-semibold"
        >
          <TclLogo />
          <span class="sr-only">{{ t('layout.tcl') }}</span>
        </NuxtLink>
        <NuxtLink
          v-for="item in mobileConfig"
          :key="item.id"
          :to="localePath(item.link)"
          :class="
            cn(
              'flex items-center text-muted-foreground transition-colors hover:text-foreground',
              !item.enabled ? 'hidden' : '',
            )
          "
        >
          {{ item.title }}
          <Icon
            :name="lockIcon"
            v-if="item.premium"
            class="ml-2 text-primary"
          />
        </NuxtLink>
      </nav>
    </SheetContent>
  </Sheet>
</template>
