// In development, Vite proxy forwards these to localhost:8000.
// In production (Vercel), VITE_API_URL must be set to your Render backend URL.
const BASE = import.meta.env.VITE_API_URL ?? ''

/**
 * Fetch supported language list from backend.
 * @returns {Promise<string[]>}
 */
export async function fetchLanguages() {
  const res = await fetch(`${BASE}/languages`)
  if (!res.ok) throw new Error('Failed to load languages')
  const data = await res.json()
  return data.languages
}

/**
 * Stream a translation from the backend.
 *
 * @param {object} params
 * @param {string} params.text
 * @param {string} params.sourceLanguage  — language name or "auto"
 * @param {string} params.targetLanguage  — language name
 * @param {(chunk: string) => void} params.onChunk   — called for each streamed text chunk
 * @param {() => void}              params.onDone    — called when stream finishes
 * @param {(msg: string) => void}   params.onError   — called on error
 * @returns {Promise<void>}
 */
export async function streamTranslation({ text, sourceLanguage, targetLanguage, onChunk, onDone, onError }) {
  let res
  try {
    res = await fetch(`${BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }),
    })
  } catch {
    onError('Network error. Is the server running?')
    return
  }

  if (!res.ok) {
    let msg = `Server error ${res.status}`
    try { const d = await res.json(); msg = d.detail || msg } catch {}
    onError(msg)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()  // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const evt = JSON.parse(line.slice(6))
        if (evt.type === 'delta') onChunk(evt.text)
        else if (evt.type === 'done') onDone()
        else if (evt.type === 'error') onError(evt.message)
      } catch {}
    }
  }
}
