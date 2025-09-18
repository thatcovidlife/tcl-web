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
    <h1>Tag: {{ slug }}</h1>
  </div>
</template>
