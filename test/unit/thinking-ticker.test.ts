import { expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('../../webview/src/bridge', () => ({ send: vi.fn() }));
vi.mock('../../webview/src/i18n', () => ({ useI18n: () => ({ t: (text: string) => text }) }));
const tickerPath = '../../webview/src/ai/ThinkingTicker';
const settingsPath = '../../webview/src/settings/AiSettingsCard';
const { ThinkingTicker } = await import(tickerPath);
const { AiSettingsCard } = await import(settingsPath);
it('escapes provider text, keeps a bounded single-line tail, and hides empty thinking', () => {
  expect(renderToStaticMarkup(createElement(ThinkingTicker, { text: ' \n' }))).toBe('');
  const html = renderToStaticMarkup(
    createElement(ThinkingTicker, { text: 'discard'.repeat(300) + '\n<script>text</script>' }),
  );
  expect(html).toContain('assistant-thinking-track');
  expect(html).toContain('&lt;script&gt;text&lt;/script&gt;');
  expect(html).not.toContain('<script>');
  expect(html).not.toContain('\n');
  expect(html.length).toBeLessThan(1400);
});
it('renders the shared ticker during a connection test and hides it after success or failure', () => {
  for (const status of ['checking', 'passed', 'failed'] as const) {
    const html = renderToStaticMarkup(
      createElement(AiSettingsCard, {
        busy: status === 'checking',
        state: {
          config: { baseUrl: 'https://example.com', model: 'model' },
          hasKey: false,
          result: { status, thinking: 'Check the response' },
        },
      }),
    );
    expect(html.includes('assistant-thinking-track')).toBe(status === 'checking');
  }
});
