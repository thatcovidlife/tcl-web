export function sanityFileUrl(ref: string): string {
  const { config } = useSanity()
  const { projectId, dataset } = config

  // ref format: file-{hash}-{extension}
  // target:     {hash}.{extension}
  const withoutPrefix = ref.replace(/^file-/, '')
  const lastDash = withoutPrefix.lastIndexOf('-')
  const filename =
    withoutPrefix.substring(0, lastDash) +
    '.' +
    withoutPrefix.substring(lastDash + 1)

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${filename}`
}
