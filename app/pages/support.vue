<script setup lang="ts">
import { motion } from 'motion-v'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { useUserStore } from '@/store/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const userStore = useUserStore()
const { t } = useI18n()
const formSchema = toTypedSchema(
  z.object({
    from_name: z
      .string({ required_error: t('contribute.errors.from_name.required') })
      .min(3, t('contribute.errors.from_name.min')),
    email: z
      .string({ required_error: t('support.errors.email.required') })
      .email(t('support.errors.email.invalid')),
    product: z
      .string({ required_error: t('support.errors.product.required') })
      .min(1, t('support.errors.product.required')),
    subject: z
      .string({ required_error: t('support.errors.subject.required') })
      .min(5, t('support.errors.subject.min'))
      .max(100, t('support.errors.subject.max')),
    message: z
      .string({ required_error: t('support.errors.message.required') })
      .min(20, t('support.errors.message.min'))
      .max(2000, t('support.errors.message.max')),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    from_name: userStore.info?.profile?.name || '',
    email: userStore.info?.email || '',
    product: '',
    subject: '',
    message: '',
  },
})

const onSubmit = form.handleSubmit((values) => {
  if (!token.value) return

  const payload = {
    ...values,
  }

  // Send to server
  $fetch('/api/support', {
    method: 'POST',
    body: payload,
  })
    .then(() => {
      toast.success(t('support.toast.success.title'), {
        description: t('support.toast.success.message'),
      })
      form.resetForm()
    })
    .catch((error) => {
      toast.error(t('support.toast.error.title'), {
        description: error.data?.message || t('support.toast.error.message'),
      })
    })
})

const token = ref()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5 }"
    class="container max-w-3xl py-4 md:py-8 mx-auto mb-8"
  >
    <h1
      class="font-pt antialiased text-4xl leading-[42px] font-bold mb-4 md:mb-8"
    >
      {{ t('support.title') }}
    </h1>
    <p class="text-base mb-4 md:mb-8">{{ t('support.description') }}</p>
    <form @submit="onSubmit" class="grid gap-4 md:gap-8">
      <FormField v-slot="{ componentField }" name="from_name">
        <FormItem>
          <FormLabel>{{ t('contribute.labels.name') }}</FormLabel>
          <FormControl>
            <Input
              type="text"
              :placeholder="t('contribute.placeholders.name')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>{{ t('support.labels.email') }}</FormLabel>
          <FormControl>
            <Input
              type="email"
              :placeholder="t('support.placeholders.email')"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            {{ t('support.help.email') }}
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="product">
        <FormItem>
          <FormLabel>{{ t('support.labels.product') }}</FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <SelectTrigger>
                <SelectValue :placeholder="t('support.placeholders.product')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">{{
                  t('support.products.website')
                }}</SelectItem>
                <SelectItem value="chatbot">{{
                  t('support.products.chatbot')
                }}</SelectItem>
                <SelectItem value="mobile app">{{
                  t('support.products.mobile')
                }}</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="subject">
        <FormItem>
          <FormLabel>{{ t('support.labels.subject') }}</FormLabel>
          <FormControl>
            <Input
              type="text"
              :placeholder="t('support.placeholders.subject')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="message">
        <FormItem>
          <FormLabel>{{ t('support.labels.message') }}</FormLabel>
          <FormControl>
            <Textarea
              :placeholder="t('support.placeholders.message')"
              :rows="6"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            {{ t('support.help.message') }}
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <NuxtTurnstile v-model="token" />
      <Button type="submit" class="w-full" :disabled="!token">
        {{ t('support.labels.submit') }}
      </Button>
    </form>
  </motion.div>
</template>
