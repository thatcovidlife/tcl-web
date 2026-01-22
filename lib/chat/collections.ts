export const collections = [
  {
    label: 'General Knowledge',
    value: 'tcl-chatbot-general-db-qwen',
  },
  {
    label: 'Scientific Knowledge (Lancet)',
    value: 'tcl-chatbot-lancet-db-qwen',
  },
]

export const defaultCollection: string = collections[0].value

export const collectionName = (selection: string) =>
  `tcl-chatbot-${selection}-db-qwen`
