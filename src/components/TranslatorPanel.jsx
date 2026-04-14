import React, { useRef, useEffect } from 'react'
import styles from './TranslatorPanel.module.css'

const MAX_CHARS = 3000

export default function TranslatorPanel({
  inputValue,
  onInputChange,
  outputValue,
  detectedLang,
  isStreaming,
  onClear,
  onCopy,
  copyState,
}) {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current && isStreaming) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [outputValue, isStreaming])

  return (
    <div className={styles.panels}>
      {/* ── Input panel ── */}
      <div className={styles.panelIn}>
        <textarea
          className={styles.textarea}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          placeholder="Type or paste text to translate…"
          maxLength={MAX_CHARS}
          aria-label="Source text"
          spellCheck
        />
        <div className={styles.footer}>
          <span className={styles.charCount}>
            {inputValue.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
          <button className={styles.textBtn} onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      {/* ── Output panel ── */}
      <div className={styles.panelOut}>
        <div
          className={styles.outputBox}
          ref={outputRef}
          aria-live="polite"
          aria-label="Translation output"
        >
          {outputValue ? (
            <>
              <span className={styles.outputText}>{outputValue}</span>
              {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
            </>
          ) : (
            <span className={styles.placeholder}>
              {isStreaming ? '' : 'Translation will appear here…'}
              {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          {detectedLang ? (
            <span className={styles.detectPill}>Detected: {detectedLang}</span>
          ) : (
            <span />
          )}
          {outputValue && !isStreaming && (
            <button
              className={`${styles.copyBtn} ${copyState === 'copied' ? styles.copied : ''}`}
              onClick={onCopy}
            >
              {copyState === 'copied' ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
