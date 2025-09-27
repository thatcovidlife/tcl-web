import { ARTICLE_TYPE } from '@/lib/types'

export const FILTER_TYPES = {
  [ARTICLE_TYPE.BLOG]: ['tag'],
  [ARTICLE_TYPE.COVIDNET]: ['tag', 'language'],
  [ARTICLE_TYPE.DIRECTORY]: ['tag', 'language', 'onlineOnly'],
  [ARTICLE_TYPE.EVENT]: ['tag', 'language', 'isEventFree'],
  [ARTICLE_TYPE.HEALTH]: ['tag', 'language', 'source'],
  [ARTICLE_TYPE.LIBRARY]: ['tag', 'language', 'source'],
  [ARTICLE_TYPE.NEWS]: ['tag', 'language', 'source'],
  [ARTICLE_TYPE.PRODUCT]: ['tag', 'brand'],
  [ARTICLE_TYPE.RESOURCE]: ['tag', 'language'],
  [ARTICLE_TYPE.TAG]: ['type'],
  [ARTICLE_TYPE.VIDEO]: ['tag', 'language'],
}
