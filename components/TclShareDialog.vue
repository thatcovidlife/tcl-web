<script setup lang="ts">
import {
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ShareIcon,
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // type DialogProps,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  chatId: string
  chatTitle: string
}>()

const emit = defineEmits<{
  (e: 'created', shareUrl: string): void
}>()

const { t } = useI18n()
const { createShareLink, copyToClipboard } = useShareActions()

const open = defineModel<boolean>('open', { default: false })
const loading = ref(false)
const shareUrl = ref('')
const expirationDays = ref<number | null>(30)
const copied = ref(false)

const expirationOptions = computed(() => [
  { label: t('chatbot.share.never'), value: null as number | null },
  { label: `7 ${t('chatbot.share.days')}`, value: 7 },
  { label: `30 ${t('chatbot.share.days')}`, value: 30 },
  { label: `90 ${t('chatbot.share.days')}`, value: 90 },
])

const handleCreate = async () => {
  loading.value = true
  copied.value = false

  const expiresAt = expirationDays.value
    ? new Date(
        Date.now() + expirationDays.value * 24 * 60 * 60 * 1000,
      ).toISOString()
    : undefined

  const result = await createShareLink(props.chatId, expiresAt)
  loading.value = false

  if (result) {
    shareUrl.value = `${window.location.origin}${result.shareUrl}`
    emit('created', shareUrl.value)
  }
}

const handleCopy = async () => {
  const success = await copyToClipboard(shareUrl.value)
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const reset = () => {
  shareUrl.value = ''
  expirationDays.value = 30
  copied.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    // Reset when dialog closes
    setTimeout(reset, 200)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="sm">
        <ShareIcon :size="16" class="mr-2" />
        {{ t('chatbot.actions.labels.share') }}
      </Button>
    </DialogTrigger>
    <DialogContent
      @escape-key-down="open = false"
      @pointer-down-outside="open = false"
    >
      <DialogHeader>
        <DialogTitle>{{ t('chatbot.share.title') }}</DialogTitle>
        <DialogDescription class="truncate">
          {{ props.chatTitle }}
        </DialogDescription>
      </DialogHeader>

      <!-- Expiration selection -->
      <div v-if="!shareUrl" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="expiration">{{ t('chatbot.share.expires') }}</Label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              v-for="opt in expirationOptions"
              :key="opt.label"
              :variant="expirationDays === opt.value ? 'default' : 'outline'"
              type="button"
              @click="expirationDays = opt.value"
            >
              {{ opt.label }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Share URL display -->
      <div v-else class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="share-url">{{ t('chatbot.share.copyLink') }}</Label>
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="relative flex-1 flex items-center rounded-md border border-input bg-muted px-3 py-1.5">
              <span class="font-mono text-sm text-foreground flex-1 truncate select-all">
                {{ shareUrl }}
              </span>
              <a
                :href="shareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
                :title="'Open in new tab'"
                :aria-label="t('chatbot.share.copyLink')"
              >
                <ExternalLinkIcon :size="14" />
              </a>
            </div>
            <Button
              variant="outline"
              size="icon"
              @click="handleCopy"
              :disabled="copied"
              class="sm:w-auto w-full"
            >
              <CheckIcon v-if="copied" :size="16" class="text-green-600" />
              <CopyIcon v-else :size="16" />
            </Button>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          {{
            expirationDays
              ? `Link expires in ${expirationDays} days`
              : 'Link never expires'
          }}
        </p>
      </div>

      <DialogFooter>
        <Button
          v-if="!shareUrl"
          @click="handleCreate"
          :disabled="loading"
          class="w-full"
        >
          {{ loading ? 'Creating...' : t('chatbot.share.create') }}
        </Button>
        <template v-else>
          <Button variant="outline" @click="reset">
            {{ t('chatbot.share.createLink') }}
          </Button>
          <Button @click="open = false">Done</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
