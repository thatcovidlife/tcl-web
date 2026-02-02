export const cleanPostBody = (str: string) =>
  `${str.replace(/(<([^>]+)>)/gi, '').substr(0, 255)}...`
