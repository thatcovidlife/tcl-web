import { FORUM, POST } from '../constants/types'

export const mapForumSearchResult = (result: any) => {
  const { t } = useI18n()
  const topic = result.categories[0].name || ''

  return {
    author: {
      nickname: `@${result.author?.profile?.name}`,
      slug: result.author?.authorId,
    },
    avatar: null, //TODO: fix
    category: t(`forum.create.categories.${topic}`),
    categoryUri: topic,
    description: result.content.substr(0, 255) + '...',
    path: `/${FORUM}/${POST}/${result.id}`,
    published: result.createdAt,
    title: result.title,
    type: FORUM,
  }
}
