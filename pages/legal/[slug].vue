<script setup lang="ts">
import { motion } from 'motion-v'
import {
  getPolicyTypeLabel,
  type PolicyType,
} from '@/assets/utils/policy-types'
import { SERIALIZERS } from '@/assets/constants/serializers'
import POLICY_QUERY from '@/sanity/queries/policy.sanity'
import type { POLICY_QUERYResult } from '@/sanity/types'

const route = useRoute()
const { locale } = useI18n()
const policyType = route.params.slug as PolicyType
const policyTypeLabel = getPolicyTypeLabel(policyType)

const { data: policyData, status } = await useSanityQuery<POLICY_QUERYResult>(
  POLICY_QUERY,
  {
    locale,
    policyType: policyTypeLabel,
  },
)

const loading = computed(
  () => status?.value === 'pending' || status?.value === 'idle',
)
</script>

<template>
  <div>
    <TclLoader v-if="loading" />
    <motion.div
      v-else
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      class="container max-w-3xl py-4 md:py-8 mx-auto"
    >
      <h1
        class="font-pt antialiased text-4xl leading-[42px] font-bold mb-4 md:mb-8"
      >
        {{ policyData?.title }}
      </h1>
      <section class="article-body">
        <SanityContent
          v-if="policyData?.contents"
          :blocks="<any>policyData?.contents"
          :serializers="SERIALIZERS"
        />
      </section>
    </motion.div>
  </div>
</template>
