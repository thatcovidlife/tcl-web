export const collections = [
  {
    label: 'General Knowledge',
    value: 'tcl-chatbot-general-db',
  },
  {
    label: 'Scientific Knowledge (Lancet)',
    value: 'tcl-chatbot-lancet-db',
  },
]

export const defaultCollection: string = collections[0].value

export const collectionName = (selection: string) =>
  `tcl-chatbot-${selection}-db`
