export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.setAttribute(
    'src',
    'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js',
  )
  script.onload = () => {
    // @ts-ignore
    kofiWidgetOverlay.draw('thatcovidlife', {
      type: 'floating-chat',
      'floating-chat.donateButton.text': 'Tip Us',
      'floating-chat.donateButton.background-color': '#DC2626',
      'floating-chat.donateButton.text-color': '#fff',
    })
  }
  document.head.appendChild(script)
})
