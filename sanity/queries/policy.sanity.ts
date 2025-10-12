import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const POLICY_QUERY = groq`
*[_type == "policy" && title[_key == '${BASE_LANGUAGE}'][0].value == $policyType] {
  "title": coalesce(title[_key == $locale][0].value, title[_key == '${BASE_LANGUAGE}'][0].value, ''),
  "contents": coalesce(contents[_key == $locale][0].value, contents[_key == '${BASE_LANGUAGE}'][0].value, []),
}[0]
`

export { POLICY_QUERY as default }
