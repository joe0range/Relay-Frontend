import React from 'react'
import styles from './RecentTranslations.module.css'

export default function RecentTranslations({ items, onSelect }) {
  if (!items.length) return null

  return (
    <section className={styles.section} aria-label="Recent translations">
      <p className={styles.label}>Recent</p>
      <div className={styles.chips}>
        {items.map((item, i) => {
          const fromLabel = item.sourceLanguage === 'auto'
            ? (item.detectedLang ? item.detectedLang.slice(0, 2).toUpperCase() : '?')
            : item.sourceLanguage.slice(0, 2).toUpperCase()
          const toLabel = item.targetLanguage.slice(0, 2).toUpperCase()

          return (
            <button
              key={i}
              className={styles.chip}
              onClick={() => onSelect(item)}
              title={item.text}
            >
              <span className={styles.langs}>{fromLabel} → {toLabel}</span>
              <span className={styles.preview}>
                {item.text.length > 45 ? item.text.slice(0, 45) + '…' : item.text}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
