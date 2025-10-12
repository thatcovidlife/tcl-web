import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const PUBLICATION_BY_TYPE_QUERY = groq`
{
  "results": *[_type == $type && !(_id in path('drafts.**'))] | order(publicationDate desc, _createdAt desc)[$start..$end] {
    "attributes": {
      "free": coalesce(isEventFree, false),
      "limited": coalesce(limitedAccess, false),
      "onlineOnly": coalesce(onlineOnly, false),
      "premium": coalesce(premiumAccess, false),
    },
    "date": coalesce(eventDate, publicationDate, _createdAt),
    "description": array::join(string::split(pt::text(coalesce(description[_key == $locale][0].value, description[_key == ^.language][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, [])), "")[0..512], "") + "...",
    "end": endDate,
    "id": _id,
    "language": language,
    "link": "/" + _type + "/" + tags[0]->uri.current + "/" + uri.current,
    "metadata": visual.asset->metadata.dimensions { aspectRatio, height, width },
    "source": coalesce(source, null),
    "tags": tags[]-> { 'label': coalesce(name[$locale], name['${BASE_LANGUAGE}'], ''), 'slug': uri.current },
    "title": coalesce(title[_key == $locale][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title[_key == ^.language][0].value, title[$locale], title['${BASE_LANGUAGE}'], title, null),
    "type": _type,
    "url": url,
    "visual": visual.asset._ref,
  },
  "info": {
    "locale": coalesce($locale, "en"),
    "start": coalesce($start, 0),
    "end": coalesce($end, 5),
    "total": coalesce(count(*[_type == $type && !(_id in path('drafts.**'))]), 0),
  },
}
`

// export const makePublicationByTypeQuery = (selection: Record<string, any>) => {
//   const filters = Object.entries(selection)
//     .reduce((result, entry) => {
//       const [key, value] = entry
//       let fltr = Array.isArray(value)
//         ? `${key} in [${value.map((v: string) => `"${v}"`).join(', ')}]`
//         : `${key} == "${value}"`

//       if (key === 'tags') {
//         fltr = `tags[]->uri.current in [${value.map((v: string) => `"${v}"`).join(', ')}]`
//       }
//       return [...result, fltr]
//     }, [] as string[])
//     .join(' && ')

//   return filters
// }

export { PUBLICATION_BY_TYPE_QUERY as default }
