<script setup lang="ts">
const { t } = useI18n()
const { slug } = useRoute().params
</script>
<template>
  <div class="container pt-4 md:pt-8">
    <TclSeo
      :description="t(`description.tag`)"
      image="/tcl-fallback-169.jpg"
      image-type="image/jpeg"
      :title="t(`layout.tag`)"
    />
    <div class="flex justify-between items-center">
      <div>
        <h1
          class="scroll-m-20 text-4xl font-extrabold lg:text-5xl font-title uppercase"
        >
          {{ t(`layout.tag`) }}
        </h1>
        <h4
          class="scroll-m-20 text-base lg:text-xl font-semibold tracking-tight"
        >
          {{ t(`description.tag`) }}
        </h4>
      </div>
    </div>
  </div>
</template>
