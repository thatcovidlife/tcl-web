import { z } from 'zod'
import { ARTICLE_TYPE } from '@/lib/types'
import type { Filter, FilterType } from '@/lib/types'

export const BRAND: Filter = {
  key: 'brand',
  type: z.string(),
}

export const IS_EVENT_FREE: Filter = {
  key: 'isEventFree',
  type: z.boolean(),
}

export const LANGUAGE: Filter = {
  key: 'language',
  type: z.string(),
}

export const ONLINE_ONLY: Filter = {
  key: 'onlineOnly',
  type: z.boolean(),
}

export const SOURCE: Filter = {
  key: 'source',
  type: z.string(),
}

export const TAG: Filter = {
  key: 'tag',
  type: z.string(),
}

export const TYPE: Filter = {
  key: 'type',
  type: z.string(),
}

export const FILTER_TYPES: FilterType = {
  [ARTICLE_TYPE.BLOG]: [TAG],
  [ARTICLE_TYPE.COVIDNET]: [TAG, LANGUAGE],
  [ARTICLE_TYPE.DIRECTORY]: [TAG, LANGUAGE, ONLINE_ONLY],
  [ARTICLE_TYPE.EVENT]: [TAG, LANGUAGE, IS_EVENT_FREE],
  [ARTICLE_TYPE.HEALTH]: [TAG, LANGUAGE, SOURCE],
  [ARTICLE_TYPE.LIBRARY]: [TAG, LANGUAGE, SOURCE],
  [ARTICLE_TYPE.NEWS]: [TAG, LANGUAGE, SOURCE],
  [ARTICLE_TYPE.PRODUCT]: [TAG, BRAND],
  [ARTICLE_TYPE.RESOURCE]: [TAG, LANGUAGE],
  [ARTICLE_TYPE.TAG]: [TYPE],
  [ARTICLE_TYPE.VIDEO]: [TAG, LANGUAGE],
}
