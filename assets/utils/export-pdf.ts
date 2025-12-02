export const exportPDF = async (
  content: string,
  title: string,
  filename: string,
) => {
  try {
    const res = await fetch('https://tcl-pdf-export.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        title,
      }),
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.pdf`
    a.click()
  } catch (error) {
    console.error('Error exporting PDF:', error)
  }
}
