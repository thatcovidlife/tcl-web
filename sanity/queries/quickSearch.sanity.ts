import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const QUICK_SEARCH_QUERY = groq`
*[
  _type in ["news", "scientific-library", "public-health", "video"]
  && language == $locale
  && title match "**" + $searchTerm + "**"
] | order(_createdAt desc)[0..4] {
  "date": publicationDate,
  "description": array::join(string::split(pt::text(coalesce(description[_key == $locale][0].value, description[_key == ^.language][0].value, description[_key == '${BASE_LANGUAGE}'][0].value)), '')[0..80], '') + '...',
  "id": _id,
  "link": '/' + _type + '/' + tags[0]->uri.current + '/' + uri.current,
  title,
  "type": _type,
  url,
}
`

export { QUICK_SEARCH_QUERY as default }
