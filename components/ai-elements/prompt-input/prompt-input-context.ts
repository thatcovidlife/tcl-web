import { inject, provide, type Ref } from 'vue'

import type { PromptInputAttachmentFile } from './types'

export type AttachmentsContext = {
  files: Ref<PromptInputAttachmentFile[]>
  add: (files: File[] | FileList) => void
  remove: (id: string) => void
  clear: () => void
  openFileDialog: () => void
  fileInputRef: Ref<HTMLInputElement | null>
}

export type TextInputContext = {
  value: Ref<string>
  setInput: (value: string) => void
  clear: () => void
}

export type PromptInputController = {
  textInput: TextInputContext
  attachments: AttachmentsContext
  __registerFileInput: (
    ref: Ref<HTMLInputElement | null>,
    open: () => void,
  ) => void
}

const PROMPT_INPUT_CONTROLLER_KEY = Symbol('PromptInputController')
const PROVIDER_ATTACHMENTS_KEY = Symbol('PromptInputProviderAttachments')
const LOCAL_ATTACHMENTS_KEY = Symbol('PromptInputLocalAttachments')
const TEXTAREA_REF_KEY = Symbol('PromptInputTextareaRef')

export function providePromptInputController(
  controller: PromptInputController,
) {
  provide(PROMPT_INPUT_CONTROLLER_KEY, controller)
  return controller
}

export function usePromptInputController() {
  const controller = inject<PromptInputController | null>(
    PROMPT_INPUT_CONTROLLER_KEY,
    null,
  )
  if (!controller) {
    throw new Error(
      'Wrap your component inside <PromptInputProvider> to access the controller.',
    )
  }
  return controller
}

export function useOptionalPromptInputController() {
  return inject<PromptInputController | null>(PROMPT_INPUT_CONTROLLER_KEY, null)
}

export function provideProviderAttachments(context: AttachmentsContext) {
  provide(PROVIDER_ATTACHMENTS_KEY, context)
  return context
}

export function useProviderAttachments() {
  const context = inject<AttachmentsContext | null>(
    PROVIDER_ATTACHMENTS_KEY,
    null,
  )
  if (!context) {
    throw new Error(
      'Wrap your component inside <PromptInputProvider> to access attachments.',
    )
  }
  return context
}

export function useOptionalProviderAttachments() {
  return inject<AttachmentsContext | null>(PROVIDER_ATTACHMENTS_KEY, null)
}

export function provideLocalAttachments(context: AttachmentsContext) {
  provide(LOCAL_ATTACHMENTS_KEY, context)
  return context
}

function useOptionalLocalAttachments() {
  return inject<AttachmentsContext | null>(LOCAL_ATTACHMENTS_KEY, null)
}

export function usePromptInputAttachments() {
  const provider = useOptionalProviderAttachments()
  const local = useOptionalLocalAttachments()
  const context = provider ?? local
  if (!context) {
    throw new Error(
      'PromptInput attachments are unavailable. Mount PromptInput or PromptInputProvider first.',
    )
  }
  return context
}

export function providePromptInputTextareaRef(
  ref: Ref<HTMLTextAreaElement | null>,
) {
  provide(TEXTAREA_REF_KEY, ref)
  return ref
}

export function useOptionalPromptInputTextareaRef() {
  return inject<Ref<HTMLTextAreaElement | null> | null>(TEXTAREA_REF_KEY, null)
}
