import consola from 'consola'
import type { Publication, Tag } from '@/lib/types'
import { useGroqd } from '@/composables/useGroqd'
import { BASE_LANGUAGE } from '@/assets/constants/base-language'
import { isSearch, isTag } from '@/assets/utils/article-types'
import { ARTICLE_TYPE } from '@/lib/types'

export const useDynamicQuery = () => {
  const results = ref<Publication[]>([])

  const loading = ref(false)
  const total = ref(0)

  const { q, runQuery } = useGroqd()

  const buildDynamicQuery = async ({
    end,
    filters,
    locale,
    searchTerm,
    start,
    type,
  }: {
    end: number
    filters: Record<string, string>
    locale: string | null
    searchTerm?: string
    start: number
    type: ARTICLE_TYPE | string
  }) => {
    let query = isSearch(type)
      ? q.star.filterRaw(
          `_type != 'feedSettings' && !(_id in path('drafts.**')) && [coalesce(title[_key == "${locale}"][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title, null), coalesce(description[_key == "${locale}"][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, [])[0].children[0].text] match "**${searchTerm}**"`,
        )
      : isTag(type)
        ? q.star.filterRaw(
            `!(_id in path('drafts.**')) && "${searchTerm}" in tags[]->uri.current`,
          )
        : q.star
            .filterByType(type as any)
            .filterRaw(`!(_id in path('drafts.**'))`)

    if (locale) {
      query = query.filterRaw(`language == "${locale}"`)
    }

    Object.keys(filters).forEach((key: string) => {
      if (key === 'tag') {
        query = query.filterRaw(`"${filters[key]}" in tags[]->uri.current`)
      }
    })

    const countQuery = q.count(query)

    query = query
      // @ts-ignore
      .order('publicationDate desc, _createdAt desc')
      .slice(start, end)

    query = query.project((sub) => ({
      date: sub.raw<Date | string>(
        'coalesce(eventDate, publicationDate, _createdAt)',
      ),
      description: sub.raw<string | null>(
        `array::join(string::split(pt::text(coalesce(description[_key == ${locale}][0].value, description[_key == ^.language][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, [])), "")[0..384], "") + "..."`,
      ),
      end: sub.raw<Date | string | null>('endDate'),
      free: sub.raw<boolean | null>('coalesce(isEventFree, false)'),
      id: sub.raw<string>('_id'),
      language: sub.raw<string>('language'),
      limited: sub.raw<boolean>('coalesce(limitedAccess, false)'),
      link: sub.raw<string>(
        `"/" + _type + "/" + tags[0]->uri.current + "/" + uri.current`,
      ),
      metadata: sub.raw<Record<string, any> | null>(
        'visual.asset->metadata.dimensions { aspectRatio, height, width }',
      ),
      onlineOnly: sub.raw<boolean>('coalesce(onlineOnly, false)'),
      premium: sub.raw<boolean>('coalesce(premiumAccess, false)'),
      source: sub.raw<string | null>('coalesce(source, null)'),
      tags: sub.raw<Tag[]>(
        `tags[]-> { 'label': coalesce(name[${locale}], name['${BASE_LANGUAGE}'], ''), 'slug': uri.current }`,
      ),
      title: sub.raw<string | null>(
        `coalesce(title[_key == '${locale}'][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title[_key == ^.language][0].value, title['${locale}'], title['${BASE_LANGUAGE}'], title, null)`,
      ),
      type: sub.raw<string>('_type'),
      url: sub.raw<string | null>('url'),
      visual: sub.raw<string | null>('visual.asset._ref'),
    }))

    try {
      loading.value = true
      total.value = 0

      const data = await runQuery(query)
      const count = await runQuery(countQuery)

      results.value = data as unknown as Publication[]
      total.value = count
    } catch (error) {
      consola.error(error)
    } finally {
      loading.value = false
    }
  }

  return {
    buildDynamicQuery,
    loading,
    results,
    total,
  }
}
