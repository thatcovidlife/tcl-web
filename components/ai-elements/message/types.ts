import type { UIMessage } from 'ai'
import type { HTMLAttributes } from 'vue'
import type { MessageContentVariants } from './message-content-variants'

export type MessageProps = HTMLAttributes & {
  from: UIMessage['role']
}

export type MessageContentProps = HTMLAttributes & {
  variant?: MessageContentVariants['variant']
}

export type MessageAvatarProps = HTMLAttributes & {
  src: string
  name?: string
}
