import { ref, provide, inject, watch, type Ref } from 'vue'

const BRANCH_KEY = Symbol('BranchContext')

type BranchContext = {
  currentBranch: Ref<number>
  totalBranches: Ref<number>
  branches: Ref<any[]>
  goToNext: () => void
  goToPrevious: () => void
  setBranches: (newBranches: any[]) => void
}

export function provideBranch({
  defaultBranch = 0,
  onBranchChange,
}: {
  defaultBranch: number
  onBranchChange: (branch: number) => void
}) {
  const currentBranch = ref(defaultBranch)
  const branches = ref<any[]>([])
  const totalBranches = ref(0)

  const goToNext = () => {
    currentBranch.value =
      currentBranch.value < branches.value.length - 1
        ? currentBranch.value + 1
        : 0
  }

  const goToPrevious = () => {
    currentBranch.value =
      currentBranch.value > 0
        ? currentBranch.value - 1
        : branches.value.length - 1
  }

  const setBranches = (newBranches: any[]) => {
    branches.value = newBranches
    totalBranches.value = newBranches.length
  }

  watch(currentBranch, (newIndex) => {
    onBranchChange?.(newIndex)
  })

  const context: BranchContext = {
    currentBranch,
    totalBranches,
    branches,
    goToNext,
    goToPrevious,
    setBranches,
  }

  provide(BRANCH_KEY, context)

  return context
}

export function useBranch() {
  const context = inject(BRANCH_KEY)
  if (!context)
    throw new Error('Branch composables must be used within provideBranch()')
  return context as BranchContext
}
