<template>
  <div class="flex">
    <Skeleton
      class="hidden rounded-xl xl:block xl:shrink-0 xl:mr-8 xl:w-[180px] 2xl:w-[240px] xl:h-[101px] 2xl:h-[135px]"
    />
    <div class="grow">
      <Skeleton class="h-8 w-2/3 mb-4 rounded-full" />
      <Skeleton class="h-4 w-5/6 mb-3 rounded-full" />
      <Skeleton class="h-4 w-4/5 mb-4 rounded-full" />
      <Skeleton class="h-6 w-1/3 rounded-full" />
    </div>
  </div>
</template>
