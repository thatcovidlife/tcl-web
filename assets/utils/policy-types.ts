export const POLICY_TYPES = {
  about: 'About',
  disclaimer: 'Disclaimer',
  'privacy-policy': 'Privacy Policy',
  'terms-conditions': 'Terms & Conditions',
}

export type PolicyType = keyof typeof POLICY_TYPES

export const getPolicyTypeLabel = (type: PolicyType): string => {
  return POLICY_TYPES[type] || ''
}
