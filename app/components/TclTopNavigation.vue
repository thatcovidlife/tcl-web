<script setup lang="ts">
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { useNavConfig } from '@/composables/useNavConfig'

const props = defineProps<{
  loggedIn?: boolean
}>()

const { config } = useNavConfig()
const localePath = useLocalePath()

const lockIcon = computed(() =>
  props.loggedIn ? 'mynaui:lock-open' : 'mynaui:lock',
)
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <template v-for="item in config" :key="item.id">
        <NavigationMenuItem v-if="item.children">
          <NavigationMenuTrigger>{{ item.title }}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul
              class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[minmax(0,.75fr)_minmax(0,1fr)]"
            >
              <li class="row-span-3" v-if="item.display">
                <NavigationMenuLink as-child>
                  <div
                    class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <Icon :name="`${item.display.icon}`" :size="32" />
                    <div class="mb-2 mt-4 text-lg font-medium">
                      {{ item.display.title }}
                    </div>
                    <p class="text-sm leading-tight text-muted-foreground">
                      {{ item.display.description }}
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li v-for="child in item.children" :key="child.id">
                <NavigationMenuLink as-child>
                  <NuxtLink
                    :to="localePath(child.link)"
                    class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div
                      class="text-sm font-medium leading-none flex items-center"
                    >
                      {{ child.title }}
                      <Icon
                        :name="lockIcon"
                        v-if="child.premium"
                        class="ml-1 text-primary"
                      />
                    </div>
                    <p
                      class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                    >
                      {{ child.description }}
                    </p>
                  </NuxtLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem v-else>
          <NuxtLink :to="localePath(item.link as string)" v-if="item.enabled">
            <NavigationMenuLink :class="navigationMenuTriggerStyle()">
              {{ item.title }}
              <Icon
                :name="lockIcon"
                v-if="item.premium"
                class="ml-1 text-primary"
              />
            </NavigationMenuLink>
          </NuxtLink>
        </NavigationMenuItem>
      </template>
    </NavigationMenuList>
  </NavigationMenu>
</template>
