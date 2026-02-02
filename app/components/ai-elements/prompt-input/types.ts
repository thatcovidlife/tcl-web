import type { ChatStatus, FileUIPart } from 'ai'

export type PromptInputAttachmentFile = FileUIPart & { id: string }

export type PromptInputMessage = {
  text?: string
  files?: FileUIPart[]
}

export type PromptInputErrorCode = 'max_files' | 'max_file_size' | 'accept'

export type PromptInputError = {
  code: PromptInputErrorCode
  message: string
}

export type PromptInputStatus = ChatStatus
