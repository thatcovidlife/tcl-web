<script setup lang="ts">
import { motion } from 'motion-v'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const formSchema = toTypedSchema(
  z.object({
    from_name: z
      .string({ required_error: t('contribute.errors.from_name.required') })
      .min(3, t('contribute.errors.from_name.min')),
    email: z
      .string({ required_error: t('contribute.errors.email.required') })
      .email(t('contribute.errors.email.invalid')),
    category: z
      .string({
        required_error: t('contribute.errors.category.required'),
      })
      .min(1, t('contribute.errors.category.required')),
    description: z
      .string({ required_error: t('contribute.errors.description.required') })
      .min(20, t('contribute.errors.description.min'))
      .max(500),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    from_name: '',
    email: '',
    category: '',
    description: '',
  },
})

const onSubmit = handleSubmit((values) => {
  if (!token.value) return

  const payload = {
    ...values,
  }

  // Send to server
  $fetch('/api/contribute', {
    method: 'POST',
    body: payload,
  })
    .then(() => {
      toast.success(t('contribute.toast.success.title'), {
        description: t('contribute.toast.success.message'),
      })
    })
    .catch((error) => {
      toast.error(t('contribute.toast.error.title'), {
        description: t('contribute.toast.error.message'),
      })
    })
    .finally(() => {
      // Reset form
      resetForm()
      token.value = ''
    })
})

const token = ref()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    class="container max-w-3xl py-4 md:py-8 mx-auto"
  >
    <h1
      class="font-pt antialiased text-4xl leading-[42px] font-bold mb-4 md:mb-8"
    >
      {{ t('contribute.title') }}
    </h1>
    <p class="text-base mb-4 md:mb-8">{{ t('contribute.description') }}</p>
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
          <FormLabel>{{ t('contribute.labels.email') }}</FormLabel>
          <FormControl>
            <Input
              type="text"
              :placeholder="t('contribute.placeholders.email')"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            {{ t('contribute.help.email') }}
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="category">
        <FormItem>
          <FormLabel>{{ t('contribute.labels.category') }}</FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <SelectTrigger>
                <SelectValue
                  :placeholder="t('contribute.placeholders.category')"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Directory">
                    {{ t('layout.directory') }}
                  </SelectItem>
                  <SelectItem value="News"> {{ t('layout.news') }} </SelectItem>
                  <SelectItem value="PPE">
                    {{ t('layout.product') }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>{{ t('contribute.labels.description') }}</FormLabel>
          <FormControl>
            <Textarea
              type="text"
              :placeholder="t('contribute.placeholders.description')"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            {{ t('contribute.help.description') }}
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <NuxtTurnstile v-model="token" />
      <Button type="submit" :disabled="!token">{{
        t('contribute.labels.submit')
      }}</Button>
    </form>
  </motion.div>
</template>
