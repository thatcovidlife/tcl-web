<script setup lang="ts">
import { toRef } from 'vue'
import { SERIALIZERS } from '@/assets/constants/serializers'
import POLICY_QUERY from '@/sanity/queries/policy.sanity'
import type { POLICY_QUERYResult } from '@/sanity/types'

const props = defineProps<{
  locale: string
}>()

const locale = toRef(props, 'locale')

const { data: policyData } = await useSanityQuery<POLICY_QUERYResult>(
  POLICY_QUERY,
  {
    locale,
    policyType: 'Chatbot Disclaimer',
  },
)
</script>

<template>
  <div
    class="prose prose-invert prose-a:text-primary hover:prose-a:text-primary-hover [&>p]:mb-4 max-h-[50vh] overflow-y-auto"
  >
    <SanityContent
      v-if="policyData?.contents"
      :blocks="<any>policyData?.contents"
      :serializers="SERIALIZERS"
    />
  </div>
</template>
