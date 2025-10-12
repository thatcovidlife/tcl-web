import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const PUBLICATION_QUERY = groq`
*[_type == $type && tags[0]->uri.current == $category && uri.current == $slug][0] {
  "id": _id,
  "title": coalesce(title[_key == $locale][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title[_key == ^.language][0].value, title[$locale], title['${BASE_LANGUAGE}'], title, ''),
  name,
  "author": author-> { nickname, "slug": uri.current, "avatar": visual.asset._ref },
  "published": _createdAt,
  "date": coalesce(publicationDate, eventDate),
  "end": endDate,
  "updated": _updatedAt,
  "body": coalesce(description[_key == $locale][0].value, description[_key == ^.language][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, []),
  "description": array::join(string::split((pt::text(coalesce(description[_key == $locale][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, null))), "")[0..252], ""),
  "category": coalesce(tags[0]->name[$locale], tags[0]->name['${BASE_LANGUAGE}'], null),
  "info": contactInfo {
    "street1": streetAdressOne,
    "street2": streetAdressTwo,
    city,
    zipCode,
    "country": coalesce(country->name[_key == $locale][0].value, country->name[_key == '${BASE_LANGUAGE}'][0].value, null),
    "phone": phoneNumber,
    email,
    website,
  },
  "link": url,
  embedCode,
  language,
  location,
  onlineOnly,
  "free": coalesce(isEventFree, false),
  "limited": coalesce(limitedAccess, false),
  "onlineOnly": coalesce(onlineOnly, false),
  "premium": coalesce(premiumAccess, false),
  "tags": tags[]-> { 'label': coalesce(name[$locale], name['${BASE_LANGUAGE}'], ''), 'slug': uri.current },
  "promos": *[(_type == "promo") && !(_id in path('drafts.**')) && (enabled)] {
    "external": isExternalLink,
    name,
    url,
    "visual": visual.asset._ref,
    "zoneId": zoneId.current,
  },
  "image": visual.asset->url,
  "related": *[
    _type == ^._type &&
    _id != ^._id &&
    !(_id in path('drafts.**')) &&
    (tags[]->uri.current match ^.tags[]->uri.current || ^.tags[]->uri.current match tags[]->uri.current) &&
    language == $locale
  ] [0...5] {
    "id": _id,
    "title": coalesce(title[_key == $locale][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, title[_key == ^.language][0].value, title, ''),
    "visual": visual.asset._ref,
    "url": "/" + _type + "/" + tags[0]->uri.current + "/" + uri.current,
    "tags": tags[]-> { 'label': coalesce(name[$locale], name['${BASE_LANGUAGE}'], ''), 'slug': uri.current },
    "date": coalesce(publicationDate, eventDate),
    "description": array::join(string::split((pt::text(coalesce(description[_key == $locale][0].value, description[_key == '${BASE_LANGUAGE}'][0].value, null))), "")[0..96], ""),
  },
  "contentType": coalesce(contentType, null),
  "thumbnail": coalesce(visual.asset._ref, null),
  "covidnet": {
    blogFeaturedURLs,
    blogRssURL,
    blogURL,
    channelID,
    channelURL,
    contentType,
    twitterFeaturedPosts,
    twitterUsername,
  },
  "brand": brand-> {
    name,
    url,
    "path": '/brand/' + tags[0]->uri.current + '/' + uri.current,
  },
  "products": *[^._type == 'brand' && _type == 'product' && brand->name == ^.name] | order(coalesce(title[_key == $locale].value, title[_key == '${BASE_LANGUAGE}'].value)[0] asc) {
    "id": _id,
    "url": '/product/' + tags[0]->uri.current + '/' + uri.current,
    "title": coalesce(title[_key == $locale].value, title[_key == '${BASE_LANGUAGE}'].value)[0],
    "description": array::join(string::split(pt::text(coalesce(description[_key == $locale].value, description[_key == '${BASE_LANGUAGE}'].value)), '')[0..255], '') + '...',
    "tags": tags[]-> { 'label': coalesce(name[$locale], name['${BASE_LANGUAGE}'], ''), 'slug': uri.current },
    "visual": coalesce(visual.asset._ref, null),
  },
  source,
}
`

export { PUBLICATION_QUERY as default }
