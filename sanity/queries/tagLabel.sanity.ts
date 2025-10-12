import groq from 'groq'
import { BASE_LANGUAGE } from '../../assets/constants/base-language'

const TAG_LABEL_QUERY = groq`
*[_type == 'tag' && uri.current == $slug][0] {
  "label": coalesce(name[$locale], name['${BASE_LANGUAGE}'], ''),
}
`

export { TAG_LABEL_QUERY as default }
