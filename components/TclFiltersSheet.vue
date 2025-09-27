<script setup lang="ts">
import { useForm, useIsFormValid } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'
import { ListFilterPlus } from 'lucide-vue-next'
import * as Sentry from '@sentry/nuxt'

import { Check, ChevronsUpDown } from 'lucide-vue-next'

import TAGS_BY_TYPE_QUERY from '@/sanity/queries/tagsByType.sanity'
import { ARTICLE_TYPE } from '@/lib/types'
import type { TAGS_BY_TYPE_QUERYResult } from '@/sanity/types'

const { t } = useI18n()

const props = defineProps<{
  locale: string
  type: string
}>()

const emit = defineEmits<{
  (e: 'update:filters', payload: Record<string, string>): void
}>()

const { data: tagList, status } = await Sentry.startSpan(
  {
    name: 'fetch publication tags',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<TAGS_BY_TYPE_QUERYResult>(
      TAGS_BY_TYPE_QUERY,
      {
        locale: props.locale,
        type: props.type,
      },
    )
  },
)

const formSchema = toTypedSchema(
  z.object({
    tag: z.string(),
  }),
)

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    tag: '',
  },
})

const isFormValid = useIsFormValid()

const onSubmit = handleSubmit((values) => emit('update:filters', values))
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button>
        <ListFilterPlus />
        {{ t('filters.title') }}
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{{ t('filters.title') }}</SheetTitle>
        <SheetDescription>
          {{ t('filters.description') }}
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <FormField v-slot="{ componentField }" name="tag">
            <FormItem v-auto-animate>
              <FormLabel>{{ t('filters.label.tags') }}</FormLabel>
              <Combobox by="label" class="w-full">
                <FormControl>
                  <ComboboxAnchor class="flex w-full">
                    <div class="relative w-full items-center">
                      <ComboboxInput
                        :display-value="(val) => val?.label ?? ''"
                        :placeholder="t('filters.placeholder.tags')"
                      />
                      <ComboboxTrigger
                        class="absolute end-0 inset-y-0 flex items-center justify-center px-3"
                      >
                        <ChevronsUpDown class="size-4 text-muted-foreground" />
                      </ComboboxTrigger>
                    </div>
                  </ComboboxAnchor>
                </FormControl>
                <ComboboxList
                  class="max-h-60 w-[250px] sm:w-[325px] overflow-auto"
                >
                  <ComboboxEmpty>{{ t('filters.noResults') }}</ComboboxEmpty>
                  <ComboboxGroup>
                    <ComboboxItem
                      v-for="tag in tagList"
                      :key="<string>tag.value"
                      :value="tag"
                      @select="
                        () => {
                          setFieldValue('tag', tag.value as string)
                        }
                      "
                    >
                      {{ tag.label }}
                      <ComboboxItemIndicator>
                        <Check :class="cn('ml-auto h-4 w-4')" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
              <!-- <FormDescription> Choose a tag. </FormDescription> -->
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <SheetFooter>
          <SheetClose as-child>
            <Button class="mb-3 mr-1" variant="secondary">{{
              t('filters.close')
            }}</Button>
          </SheetClose>
          <SheetClose as-child>
            <Button class="mb-3" type="submit" :disabled="!isFormValid">{{
              t('filters.apply')
            }}</Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
