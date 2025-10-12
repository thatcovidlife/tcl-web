<script setup lang="ts">
defineProps<{
  initialPage?: number
  limit: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'page:change', page: number): void
}>()
</script>

<template>
  <Pagination
    v-slot="{ page }"
    :items-per-page="limit"
    :total="total"
    :sibling-count="1"
    show-edges
    :default-page="initialPage || 1"
    class="flex justify-center"
    @update:page="(value) => emit('page:change', value)"
  >
    <PaginationList v-slot="{ items }" class="flex items-center gap-1">
      <PaginationFirst />
      <PaginationPrev />

      <template v-for="(item, index) in items">
        <PaginationListItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          as-child
        >
          <Button
            class="w-9 h-9 p-0"
            :variant="item.value === page ? 'default' : 'outline'"
          >
            {{ item.value }}
          </Button>
        </PaginationListItem>
        <PaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <PaginationNext />
      <PaginationLast />
    </PaginationList>
  </Pagination>
</template>
