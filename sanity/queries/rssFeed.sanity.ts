import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const RSS_FEED_QUERY = groq`
  {
    "all_entries": *[(_type in ["news", "scientific-library", "video", "resource", "event", "product", "directory", "education", "public-health", "covidnet", "blog"]) && excludeFromRSS != true && !(_id in path('drafts.**'))]| order(_createdAt desc) {
      "id": _id,
      "type": _type,
      "title": coalesce(title[_key == $locale][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title[_key == ^.language][0].value, title[$locale], title['${BASE_LANGUAGE}'], title, null),
      "description": array::join(string::split((pt::text(coalesce(description[_key == $locale][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, null))), "")[0..252], ""),
      "publishedAt": _createdAt,
      "updatedAt": _updatedAt,
      "link": url,
      "slug": "/" + _type + "/" + tags[0]->uri.current + "/" + uri.current,
      "source": source,
      "category": coalesce(tags[0]->name[$locale], tags[0]->name['${BASE_LANGUAGE}'], null),
      "image": visual.asset->url,
      "author": author-> { "name": nickname },
      "contentType": coalesce(contentType, null),
    },
    "settings": *[_type == "feedSettings"][0] {
      "title": title,
      "description": coalesce(description[_key == $locale][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, ''),
      "image": logo.asset->url,
      "author": {
        "email": author.email,
        "name": author.name,
      },
    },
  } | {
    "entries": all_entries[0..20],
    "settings": settings
  }
`

export { RSS_FEED_QUERY as default }
