import React from 'react';
import { useI18n } from '../i18n';

/** Display only thinking supplied by the provider, independently of answer rendering. */
export function ThinkingTicker({ text }: { text?: string }) {
  const { t } = useI18n();
  if (!text?.trim()) return null;
  return (
    <div className="assistant-thinking" role="status" aria-label={t('AI is thinking…')}>
      <span className="assistant-thinking-label">{t('AI is thinking…')}</span>
      <span className="assistant-thinking-track">
        <span>{text.slice(-1000).replace(/\s+/g, ' ')}</span>
      </span>
    </div>
  );
}
