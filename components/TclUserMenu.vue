<script setup lang="ts">
import { useSignOut } from '@/composables/useSignOut'
import { useStatsig } from '@/composables/useStatsig'
import { useUserStore } from '@/store/user'
import { getGravatarUrl } from '@/assets/utils/gravatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

defineProps<{
  loggedIn?: boolean
}>()

const localePath = useLocalePath()
const { t } = useI18n()
const { signOut } = useSignOut()
const { statsig } = useStatsig()
const userStore = useUserStore()
const user = computed(() => userStore.info || null)

const avatarUrl = ref<string | null>(null)

watch(
  () => userStore?.info?.email,
  async () => {
    avatarUrl.value = await getGravatarUrl(userStore?.info?.email || '', 128)
  },
  { immediate: true },
)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar
        class="h-[38px] w-[38px] border"
        :class="{ 'mt-1': avatarUrl }"
        v-if="loggedIn"
      >
        <AvatarImage
          :src="avatarUrl || ''"
          :alt="user?.profile?.name || 'User Avatar'"
        />
        <AvatarFallback>{{ user?.email?.substring(0, 2) }}</AvatarFallback>
      </Avatar>
      <Button v-else variant="outline" size="icon" class="rounded-full">
        <Icon name="iconoir:profile-circle" :size="20" />
        <span class="sr-only">{{ t('layout.toggleUserMenu') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>
        <div v-if="!loggedIn || !user?.profile?.name">
          {{ t('layout.user.account') }}
        </div>
        <div
          v-if="loggedIn && user?.profile?.name"
          class="truncate max-w-[175px]"
        >
          {{ user?.profile?.name }}
        </div>
        <div
          v-if="loggedIn && user?.email"
          class="text-xs font-normal text-muted-foreground truncate max-w-[175px]"
        >
          {{ user?.email }}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <template v-if="loggedIn">
        <NuxtLink :to="localePath('/user/bookmarks?offset=0&limit=5')">
          <DropdownMenuItem
            v-if="statsig?.checkGate('bookmarks_enabled')"
            class="hover:cursor-pointer"
          >
            {{ t('layout.user.bookmarks') }}
          </DropdownMenuItem>
        </NuxtLink>
        <NuxtLink :to="localePath('/user/account')">
          <DropdownMenuItem class="hover:cursor-pointer">
            {{ t('layout.user.settings') }}
          </DropdownMenuItem>
        </NuxtLink>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="() => signOut()" class="hover:cursor-pointer">
          {{ t('layout.user.signOut') }}
        </DropdownMenuItem>
      </template>
      <a href="/auth/auth0" v-else>
        <DropdownMenuItem class="hover:cursor-pointer">
          {{ t('layout.user.signIn') }}
        </DropdownMenuItem>
      </a>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
