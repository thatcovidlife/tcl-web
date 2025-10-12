export const parseBody = (body: any) =>
  Object.keys(body).reduce((acc, val) => {
    if (body[val].value) {
      // @ts-expect-error
      acc[val] = body[val].value || null
    }

    return acc
  }, {})
