<script setup lang="ts">
import { motion } from 'motion-v'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    class="container max-w-3xl py-4 md:py-8 mx-auto"
  >
    <h1>User Account</h1>
    <p>
      Welcome
      <span v-if="userStore.info?.profile?.name?.length"
        >, {{ userStore.info?.profile?.name }} </span
      >!
    </p>
    <p>Email: {{ userStore.info?.email }}</p>
    <!-- Add more user account details and functionalities here -->
  </motion.div>
</template>
