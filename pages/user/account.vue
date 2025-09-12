<script setup lang="ts">
import { motion } from 'motion-v'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useUserStore } from '@/store/user'
import { getGravatarUrl } from '@/assets/utils/gravatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const userStore = useUserStore()

const profileFormSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: t('account.errors.name.required') })
      .min(2, t('account.errors.name.min')),
    website: z
      .string({ required_error: t('account.errors.website.required') })
      .url(t('account.errors.website.invalid')),
    bio: z
      .string({ required_error: t('account.errors.bio.required') })
      .min(10, t('account.errors.bio.min'))
      .max(160, t('account.errors.bio.max')),
    language: z.string({
      required_error: t('account.errors.language.required'),
    }),
    theme: z.string({ required_error: t('account.errors.theme.required') }),
  }),
)

const form = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    name: userStore.info?.profile?.name || '',
    website: userStore.info?.profile?.website || '',
    bio: userStore.info?.profile?.bio || '',
    language: 'en',
    theme: 'light',
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  // In a real app, this would call an API to update the user's information
  console.log('Saving profile data:', values)
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success(t('account.toast.profile.success'))
    // Update user store with new values
    if (userStore.info?.profile) {
      userStore.info.profile = { ...userStore.info.profile, ...values }
    }
  } catch (error) {
    toast.error(t('account.toast.profile.error'))
  }
})

const avatarUrl = ref<string | null>(null)

watch(
  () => userStore?.info?.email,
  async () => {
    avatarUrl.value = await getGravatarUrl(userStore?.info?.email || '', 128)
    form.setValues(
      {
        name: userStore.info?.profile?.name || '',
        website: userStore.info?.profile?.website || '',
        bio: userStore.info?.profile?.bio || '',
      },
      false,
    )
  },
  { immediate: true },
)
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5 }"
    class="container max-w-4xl py-8 mx-auto px-4"
  >
    <div class="grid gap-8 md:grid-cols-3">
      <!-- Profile Card -->
      <motion.div
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
        class="md:col-span-1"
      >
        <Card>
          <CardHeader class="text-center">
            <Avatar class="w-24 h-24 mx-auto mb-4">
              <AvatarImage :src="avatarUrl || ''" alt="Profile" />
              <AvatarFallback class="text-2xl">
                {{ userStore.info?.profile?.name?.charAt(0) || 'U' }}
              </AvatarFallback>
            </Avatar>
            <CardTitle v-if="userStore.info?.profile?.name" class="text-xl">{{
              userStore.info?.profile?.name || 'User'
            }}</CardTitle>
            <CardDescription class="truncate">{{
              userStore.info?.email
            }}</CardDescription>
          </CardHeader>
          <!-- <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Member since</span>
                <span class="text-sm">January 2023</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground"
                  >Account status</span
                >
                <span class="text-sm text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent> -->
        </Card>
      </motion.div>

      <!-- Account Details Card -->
      <motion.div
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.5, delay: 0.4 }"
        class="md:col-span-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" class="w-full">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <!-- <TabsTrigger value="security">Security</TabsTrigger> -->
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <form @submit="onSubmit">
                <TabsContent value="profile" class="space-y-6">
                  <div class="space-y-4">
                    <FormField v-slot="{ componentField }" name="name">
                      <FormItem>
                        <FormLabel>{{ t('account.labels.name') }}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            :placeholder="t('account.placeholders.name')"
                            v-bind="componentField"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="website">
                      <FormItem>
                        <FormLabel>{{ t('account.labels.website') }}</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            :placeholder="t('account.placeholders.website')"
                            v-bind="componentField"
                          />
                        </FormControl>
                        <FormDescription>
                          {{ t('account.help.website') }}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="bio">
                      <FormItem>
                        <FormLabel>{{ t('account.labels.bio') }}</FormLabel>
                        <FormControl>
                          <textarea
                            v-bind="componentField"
                            class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            :placeholder="t('account.placeholders.bio')"
                          />
                        </FormControl>
                        <FormDescription>
                          {{ t('account.help.bio') }}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <Button type="submit" class="w-full">
                      {{ t('account.labels.save') }}
                    </Button>
                  </div>
                </TabsContent>

                <!-- <TabsContent value="security" class="space-y-6">
                <div class="space-y-4">
                  <div
                    class="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 class="font-medium">Password</h4>
                      <p class="text-sm text-muted-foreground">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button variant="outline" @click="handlePasswordChange">
                      Change Password
                    </Button>
                  </div>
                  <div
                    class="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 class="font-medium">Two-Factor Authentication</h4>
                      <p class="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline" disabled> Enable 2FA </Button>
                  </div>
                  <div
                    class="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 class="font-medium">Connected Devices</h4>
                      <p class="text-sm text-muted-foreground">
                        Manage active sessions
                      </p>
                    </div>
                    <Button variant="outline"> View Devices </Button>
                  </div>
                </div>
              </TabsContent> -->

                <TabsContent value="preferences" class="space-y-6">
                  <div class="space-y-6">
                    <FormField v-slot="{ componentField }" name="language">
                      <FormItem>
                        <FormLabel>{{
                          t('account.labels.language')
                        }}</FormLabel>
                        <FormControl>
                          <Select v-bind="componentField">
                            <SelectTrigger>
                              <SelectValue
                                :placeholder="
                                  t('account.placeholders.language')
                                "
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          {{ t('account.help.language') }}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="theme">
                      <FormItem>
                        <FormLabel>{{ t('account.labels.theme') }}</FormLabel>
                        <FormControl>
                          <Select v-bind="componentField">
                            <SelectTrigger>
                              <SelectValue
                                :placeholder="t('account.placeholders.theme')"
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          {{ t('account.help.theme') }}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </motion.div>
</template>
