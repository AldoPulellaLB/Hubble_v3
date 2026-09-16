/**
 * Frame fetcher for the scroll-scrubbed hero sequence.
 * Exists purely to keep 300+ network fetches off the main thread —
 * the decode still happens on the UI thread via an Image element.
 */
self.addEventListener('message', async (event) => {
  const { imageUrl, index } = event.data
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(String(response.status))
    const blob = await response.blob()
    self.postMessage({ blob, index })
  } catch (err) {
    self.postMessage({ index, error: String(err) })
  }
})
