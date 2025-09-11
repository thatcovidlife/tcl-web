<script setup lang="ts">
import { motion } from 'motion-v'
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

const userStore = useUserStore()

// Mock form data - in a real app, this would be managed by a form library or state
const formData = ref({
  name: userStore.info?.profile?.name || '',
  website: userStore.info?.profile?.website || '',
  bio: userStore.info?.profile?.bio || '',
})

const handleSave = () => {
  // In a real app, this would call an API to update the user's information
  console.log('Saving profile data:', formData.value)
  // Show a success message (you could use a toast notification here)
}

const handlePasswordChange = () => {
  // In a real app, this would handle password change logic
  console.log('Changing password')
  // Show a success message (you could use a toast notification here)
}

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

              <TabsContent value="profile" class="space-y-6">
                <div class="space-y-4">
                  <div class="grid gap-2">
                    <Label for="name">Full Name</Label>
                    <Input
                      id="name"
                      v-model="formData.name"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div class="grid gap-2">
                    <Label for="email">Website</Label>
                    <Input
                      id="email"
                      v-model="formData.website"
                      type="email"
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  <div class="grid gap-2">
                    <Label for="bio">Bio</Label>
                    <textarea
                      id="bio"
                      v-model="formData.bio"
                      class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <Button @click="handleSave" class="w-full">
                    Save Changes
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
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium">Language</h4>
                      <p class="text-sm text-muted-foreground">
                        Display language
                      </p>
                    </div>
                    <Button variant="outline" size="sm"> English </Button>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium">Theme</h4>
                      <p class="text-sm text-muted-foreground">
                        Appearance preference
                      </p>
                    </div>
                    <Button variant="outline" size="sm"> Light </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </motion.div>
</template>
