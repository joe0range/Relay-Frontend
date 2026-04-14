import React from 'react'
import styles from './LanguageBar.module.css'

const SwapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3" />
  </svg>
)

export default function LanguageBar({ languages, source, target, onSourceChange, onTargetChange, onSwap, canSwap }) {
  return (
    <div className={styles.bar}>
      <div className={styles.side}>
        <span className={styles.label}>From</span>
        <select
          className={styles.select}
          value={source}
          onChange={e => onSourceChange(e.target.value)}
          aria-label="Source language"
        >
          <option value="auto">Detect automatically</option>
          {languages.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className={styles.swapWrap}>
        <button
          className={styles.swapBtn}
          onClick={onSwap}
          disabled={!canSwap}
          title={canSwap ? 'Swap languages' : 'Select a source language to swap'}
          aria-label="Swap languages"
        >
          <SwapIcon />
        </button>
      </div>

      <div className={styles.side}>
        <span className={styles.label}>To</span>
        <select
          className={styles.select}
          value={target}
          onChange={e => onTargetChange(e.target.value)}
          aria-label="Target language"
        >
          {languages.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
