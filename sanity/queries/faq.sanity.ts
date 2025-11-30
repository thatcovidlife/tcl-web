import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const FAQ_QUERY = groq`
*[_type == 'faq' && !(_id in path('drafts.**')) && category == $category] | order(_createdAt, "asc") {
  "id": uri.current,
  "title": coalesce(question[_key == $locale][0].value, question[_key == '${BASE_LANGUAGE}'][0].value, ''),
  "contents": coalesce(answer[_key == $locale][0].value, answer[_key == '${BASE_LANGUAGE}'][0].value, []),
}
`

export { FAQ_QUERY as default }
