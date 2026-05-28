<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DISMISSED_COOKIE = 'tcl-privacy-policy-update-dismissed'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const { t } = useI18n()

const dismissed = useCookie<'true' | null>(DISMISSED_COOKIE, {
  default: () => null,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
  sameSite: 'lax',
})

const open = shallowRef(false)

const markDismissed = () => {
  dismissed.value = 'true'
}

const dismiss = () => {
  markDismissed()
  open.value = false
}

onMounted(() => {
  open.value = dismissed.value !== 'true'
})

watch(open, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) {
    markDismissed()
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('layout.privacyPolicyUpdate.title') }}</DialogTitle>
        <DialogDescription class="text-pretty leading-6">
          {{ t('layout.privacyPolicyUpdate.content') }}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button type="button" class="w-full sm:w-auto" @click="dismiss">
          {{ t('layout.privacyPolicyUpdate.dismiss') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
