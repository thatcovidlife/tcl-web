import groq from 'groq'

const PROMO_QUERY = groq`
*[(_type == "promo") && !(_id in path('drafts.**')) && (enabled)] {
    "external": isExternalLink,
    name,
    url,
    "visual": visual.asset._ref,
    "zoneId": zoneId.current,
  }
`

export { PROMO_QUERY as default }
