<script setup lang="ts">
import { useForm, useIsFormValid } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'
import { ListFilterPlus } from 'lucide-vue-next'
import * as Sentry from '@sentry/nuxt'

import { Check, ChevronsUpDown } from 'lucide-vue-next'

import FILTER_OPTIONS_QUERY from '@/sanity/queries/filterOptions.sanity'
import { ARTICLE_TYPE } from '@/lib/types'
import { FILTER_TYPES } from '@/assets/utils/filter-types'
import type { FILTER_OPTIONS_QUERYResult } from '@/sanity/types'

import { codeToLabel } from '@/assets/utils/language-labels'

const { t } = useI18n()

const props = defineProps<{
  locale: string
  type: ARTICLE_TYPE
}>()

const emit = defineEmits<{
  (e: 'update:filters', payload: Record<string, string>): void
}>()

const filters = computed(() => FILTER_TYPES[props.type] || [])

const { data: filterOptions, status } = await Sentry.startSpan(
  {
    name: 'fetch publication filter options',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<FILTER_OPTIONS_QUERYResult>(
      FILTER_OPTIONS_QUERY,
      {
        locale: props.locale,
        tag: '', // TODO: enable on tag page
        type: props.type,
      },
    )
  },
)

const languageList = computed(() => {
  if (status.value !== 'success') return []
  return (
    filterOptions.value?.languages?.map((code) => ({
      label: codeToLabel(code),
      value: code,
    })) || []
  )
})

const sourceList = computed(() => {
  if (status.value !== 'success') return []
  return (
    filterOptions.value?.sources.map((source) => ({
      label: source,
      value: source,
    })) || []
  )
})

const tagList = computed(() => {
  if (status.value !== 'success') return []
  return filterOptions.value?.tags || []
})

const formSchema = toTypedSchema(
  z.object({
    language: z.string().optional(),
    source: z.string().optional(),
    tag: z.string().optional(),
  }),
)

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    language: '',
    source: '',
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
          <FormField
            v-for="(filter, index) in filters"
            v-slot="{ componentField }"
            :key="index"
            :name="filter.key"
          >
            <FormItem v-auto-animate>
              <FormLabel>{{ t(`filters.label.${filter.key}`) }}</FormLabel>
              <Combobox by="label" class="w-full">
                <FormControl>
                  <ComboboxAnchor class="flex w-full">
                    <div class="relative w-full items-center">
                      <ComboboxInput
                        :display-value="(val) => val?.label ?? ''"
                        :placeholder="t(`filters.placeholder.${filter.key}`)"
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
                    <template v-if="filter.key === 'language'">
                      <ComboboxItem
                        v-for="lang in languageList"
                        :key="lang.value"
                        :value="lang"
                        @select="
                          () => {
                            setFieldValue('language', lang.value as string)
                          }
                        "
                      >
                        {{ lang.label }}
                        <ComboboxItemIndicator>
                          <Check :class="cn('ml-auto h-4 w-4')" />
                        </ComboboxItemIndicator>
                      </ComboboxItem>
                    </template>
                    <template v-if="filter.key === 'source'">
                      <ComboboxItem
                        v-for="source in sourceList"
                        :key="<string>source.value"
                        :value="source"
                        @select="
                          () => {
                            setFieldValue('source', source.value as string)
                          }
                        "
                      >
                        {{ source.label }}
                        <ComboboxItemIndicator>
                          <Check :class="cn('ml-auto h-4 w-4')" />
                        </ComboboxItemIndicator>
                      </ComboboxItem>
                    </template>
                    <template v-if="filter.key === 'tag'">
                      <ComboboxItem
                        v-for="tag in tagList"
                        :key="tag.value!"
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
                    </template>
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
