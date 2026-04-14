import React, { useState, useEffect, useCallback, useRef } from 'react'
import LanguageBar from './components/LanguageBar.jsx'
import TranslatorPanel from './components/TranslatorPanel.jsx'
import RecentTranslations from './components/RecentTranslations.jsx'
import { fetchLanguages, streamTranslation } from './api.js'
import styles from './App.module.css'

const DEFAULT_TARGET = 'Spanish'
const MAX_RECENTS = 6

export default function App() {
  const [languages, setLanguages]       = useState([])
  const [sourceLanguage, setSourceLang] = useState('auto')
  const [targetLanguage, setTargetLang] = useState(DEFAULT_TARGET)
  const [inputValue, setInputValue]     = useState('')
  const [outputValue, setOutputValue]   = useState('')
  const [detectedLang, setDetectedLang] = useState('')
  const [isStreaming, setIsStreaming]   = useState(false)
  const [error, setError]               = useState('')
  const [copyState, setCopyState]       = useState('idle')  // 'idle' | 'copied'
  const [recents, setRecents]           = useState([])
  const abortRef                        = useRef(null)

  // Load language list on mount
  useEffect(() => {
    fetchLanguages()
      .then(setLanguages)
      .catch(() => setError('Could not load languages. Is the server running?'))
  }, [])

  const clearOutput = useCallback(() => {
    setOutputValue('')
    setDetectedLang('')
    setError('')
    setCopyState('idle')
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    clearOutput()
  }, [clearOutput])

  const handleCopy = useCallback(() => {
    if (!outputValue) return
    navigator.clipboard.writeText(outputValue).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    })
  }, [outputValue])

  const handleSwap = useCallback(() => {
    if (sourceLanguage === 'auto') return
    const prevOutput = outputValue
    setSourceLang(targetLanguage)
    setTargetLang(sourceLanguage)
    if (prevOutput) {
      setInputValue(prevOutput)
      clearOutput()
    }
  }, [sourceLanguage, targetLanguage, outputValue, clearOutput])

  const handleSelectRecent = useCallback((item) => {
    setInputValue(item.text)
    setSourceLang(item.sourceLanguage)
    setTargetLang(item.targetLanguage)
    setOutputValue(item.result)
    setDetectedLang(item.detectedLang || '')
    setError('')
  }, [])

  const translate = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || isStreaming) return

    clearOutput()
    setIsStreaming(true)
    setError('')

    let accumulated = ''
    let streamedOutput = ''
    let detected = ''

    await streamTranslation({
      text,
      sourceLanguage,
      targetLanguage,
      onChunk(chunk) {
        accumulated += chunk

        // Parse optional DETECTED_LANG header out of stream
        let display = accumulated
        if (display.startsWith('DETECTED_LANG:')) {
          const nl = display.indexOf('\n')
          if (nl !== -1) {
            detected = display.slice(14, nl).trim()
            display = display.slice(nl + 1)
            setDetectedLang(detected)
          } else {
            display = ''
          }
        }
        streamedOutput = display
        setOutputValue(display)
      },
      onDone() {
        setIsStreaming(false)
        // Push to recents
        setRecents(prev => {
          const entry = { text, sourceLanguage, targetLanguage, result: streamedOutput, detectedLang: detected }
          const next = [entry, ...prev.filter((_, i) => i < MAX_RECENTS - 1)]
          return next
        })
      },
      onError(msg) {
        setIsStreaming(false)
        setError(msg)
      },
    })
  }, [inputValue, sourceLanguage, targetLanguage, isStreaming, clearOutput])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        translate()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [translate])

  const isMac = navigator.platform?.includes('Mac') || navigator.userAgent.includes('Mac')
  const shortcutHint = isMac ? '⌘ Enter' : 'Ctrl+Enter'

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon} aria-hidden="true">🌐</div>
          <span className={styles.logoName}>Linguist</span>
        </div>
        <p className={styles.logoSub}>AI-powered translation · Any language, instantly</p>
      </header>

      {/* Main card */}
      <main>
        <div className={styles.card}>
          <LanguageBar
            languages={languages}
            source={sourceLanguage}
            target={targetLanguage}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={handleSwap}
            canSwap={sourceLanguage !== 'auto'}
          />

          <TranslatorPanel
            inputValue={inputValue}
            onInputChange={setInputValue}
            outputValue={outputValue}
            detectedLang={detectedLang}
            isStreaming={isStreaming}
            onClear={handleClear}
            onCopy={handleCopy}
            copyState={copyState}
          />

          {error && (
            <div className={styles.errorBar} role="alert">{error}</div>
          )}

          <div className={styles.actionBar}>
            <button
              className={styles.translateBtn}
              onClick={translate}
              disabled={isStreaming || !inputValue.trim()}
              aria-label="Translate text"
            >
              {isStreaming
                ? <><span className={styles.spinner} aria-hidden="true" /> Translating…</>
                : 'Translate'
              }
            </button>
            <span className={styles.hint}>{shortcutHint}</span>
          </div>
        </div>

        <RecentTranslations items={recents} onSelect={handleSelectRecent} />
      </main>
    </div>
  )
}
