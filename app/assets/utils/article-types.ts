import {
  BLOG,
  BRAND,
  COMMUNITY,
  COVIDNET,
  DIRECTORY,
  EVENT,
  FORUM,
  HEALTH,
  LIBRARY,
  NEWS,
  PRODUCT,
  RESOURCE,
  SEARCH,
  TAG,
  VIDEO,
} from '../constants/types'

export const isBlog = (type: string): boolean => type === BLOG
export const isBrand = (type: string): boolean => type === BRAND
export const isCommunity = (type: string): boolean => type === COMMUNITY
export const isCovidnet = (type: string): boolean => type === COVIDNET
export const isDirectory = (type: string): boolean => type === DIRECTORY
export const isEvent = (type: string): boolean => type === EVENT
export const isForum = (type: string): boolean => type === FORUM
export const isHealth = (type: string): boolean => type === HEALTH
export const isLibrary = (type: string): boolean => type === LIBRARY
export const isNews = (type: string): boolean => type === NEWS
export const isProduct = (type: string): boolean => type === PRODUCT
export const isResource = (type: string): boolean => type === RESOURCE
export const isSearch = (type: string): boolean => type === SEARCH
export const isTag = (type: string): boolean => type == TAG
export const isVideo = (type: string): boolean => type === VIDEO

export const isExternalLink = (type: string): boolean =>
  isNews(type) || isHealth(type)
export const showPublicationDate = (type: string): boolean =>
  !isBrand(type) &&
  !isProduct(type) &&
  !isCovidnet(type) &&
  !isDirectory(type) &&
  !isResource(type)
