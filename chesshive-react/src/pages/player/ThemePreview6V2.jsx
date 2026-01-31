import React, { useEffect, useMemo, useState } from 'react';
import { lightThemes, darkThemes } from '../../styles/themes/theme-library-v2';
import './ThemePreview.css';

function ThemePreview6V2() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme 6V2: Scholar's Desk (Light) and Deep Strategy (Dark)
  const lightTheme = lightThemes.scholar;
  const darkTheme = darkThemes.deepStrategy;

  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode, lightTheme, darkTheme]
  );

  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-rgb', colors.primaryRgb);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark || colors.primary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface || (isDarkMode ? colors.surfaceElevated : '#FFFFFF'));
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-muted', colors.muted);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-gradient', currentTheme.gradient);

    document.body.className = isDarkMode ? 'theme-preview dark' : 'theme-preview light';
    document.body.style.backgroundColor = colors.background;

    return () => {
      document.body.className = '';
      document.body.style.backgroundColor = '';
    };
  }, [isDarkMode, currentTheme]);

  return (
    <div className="theme-preview-container" style={{ minHeight: '100vh' }}>
      <div className="theme-controls">
        <div className="mode-toggle">
          <button
            className={!isDarkMode ? 'active' : ''}
            onClick={() => setIsDarkMode(false)}
            type="button"
          >
            Light — {lightTheme.name}
          </button>
          <button
            className={isDarkMode ? 'active' : ''}
            onClick={() => setIsDarkMode(true)}
            type="button"
          >
            Dark — {darkTheme.name}
          </button>
        </div>

        <div className="theme-navigation">
          <div className="theme-counter">Theme Preview 6 (V2)</div>
          <div style={{ color: 'var(--theme-text-secondary)', fontWeight: 600 }}>
            {currentTheme.description}
          </div>
        </div>
      </div>

      <div className="theme-preview-area">
        <div
          style={{
            background: 'var(--theme-surface)',
            border: '2px solid var(--theme-border)',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>{currentTheme.name}</h2>
          <p style={{ marginTop: '0.75rem', color: 'var(--theme-text-secondary)' }}>
            Minimal theme preview to satisfy routing/imports.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div style={{ borderRadius: 14, border: '2px solid var(--theme-border)', padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--theme-primary)' }}>Info</div>
              <div style={{ marginTop: '0.5rem', color: 'var(--theme-text-secondary)' }}>
                Background: {currentTheme.colors.background}
              </div>
            </div>
            <div style={{ borderRadius: 14, border: '2px solid var(--theme-border)', padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--theme-primary)' }}>Accent</div>
              <div style={{ marginTop: '0.5rem', color: 'var(--theme-text-secondary)' }}>
                Accent: {currentTheme.colors.accent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview6V2;
