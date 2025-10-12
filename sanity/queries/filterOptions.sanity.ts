import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const FILTER_OPTIONS_QUERY = groq`
{
  "brands": array::compact(array::unique(*[_type == $type && !(_id in path('drafts.**'))] {
    "brand": brand->uri.current
  }.brand)),

  "isEventFree": array::compact(array::unique(*[_type == $type && language == $locale && !(_id in path('drafts.**'))] {
    isEventFree
  }.isEventFree)),

  "languages": array::compact(array::unique(*[_type == $type && !(_id in path('drafts.**'))] {
    language
  }.language)),

  "onlineOnly": array::compact(array::unique(*[_type == $type && language == $locale && !(_id in path('drafts.**'))] {
    onlineOnly
  }.onlineOnly)),

  "sources": array::compact(array::unique(*[_type == $type && language == $locale && !(_id in path('drafts.**'))] {
    source
  }.source)),
    
  "tags": array::compact(array::unique(*[_type == $type && language == $locale && !(_id in path('drafts.**'))] {
    "tags": tags[]->uri.current,
  }.tags[])),

  "types": array::compact(array::unique(*[
    defined($tag)
    && _type in ["blog", "covidnet", "directory", "event", "public-health", "scientific-library", "news", "product", "resource", "tag", "video"]
    && !(_id in path('drafts.**'))
    && language == $locale
    && references(*[_type == "tag" && uri.current == $tag]._id)
  ] {
    "type": _type 
  }.type)),
} | {
  "brands": *[_type == 'brand' && uri.current in ^.brands] | order(name[$locale], "desc") {
    "value": uri.current,
    "label": name
  },
  isEventFree,
  languages,
  onlineOnly,
  sources,
  "tags": *[_type == 'tag' && uri.current in ^.tags] | order(name[$locale], "desc") {
    "value": uri.current,
    "label": coalesce(name[$locale], name['${BASE_LANGUAGE}'])
  },
  types,
}
`

export { FILTER_OPTIONS_QUERY as default }
