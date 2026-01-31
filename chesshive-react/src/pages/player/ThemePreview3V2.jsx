import React, { useState, useEffect } from 'react';
import { lightThemes, darkThemes } from '../../styles/themes/theme-library-v2';
import './ThemePreview.css';

function ThemePreview3V2() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme 3,3: Modern Arena (Light) and Carbon Arena (Dark)
  const lightTheme = lightThemes.modernArena;
  const darkTheme = darkThemes.carbon;

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Apply theme to document
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
  }, [isDarkMode, currentTheme]);

  return (
    <div
      className="theme-preview-container"
      style={{
        background: currentTheme.colors.background,
        minHeight: '100vh',
        padding: '2rem'
      }}
    >
      {/* Theme Info Header */}
      <div
        className="theme-header"
        style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: isDarkMode
            ? `0 4px 20px rgba(0, 0, 0, 0.55), 0 0 30px ${currentTheme.colors.accent}40`
            : `0 4px 20px rgba(0, 0, 0, 0.08)`
        }}
      >
        <div className="mode-toggle" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => setIsDarkMode(false)}
            style={{
              padding: '0.75rem 1.5rem',
              border: `2px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              background: !isDarkMode ? currentTheme.gradient : 'transparent',
              color: !isDarkMode ? 'white' : currentTheme.colors.text,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !isDarkMode ? `0 4px 15px rgba(47, 128, 237, 0.35)` : 'none'
            }}
          >
            ☀️ Light Mode - {lightTheme.name}
          </button>
          <button
            onClick={() => setIsDarkMode(true)}
            style={{
              padding: '0.75rem 1.5rem',
              border: `2px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              background: isDarkMode ? currentTheme.gradient : 'transparent',
              color: isDarkMode ? 'white' : currentTheme.colors.text,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isDarkMode ? `0 4px 15px rgba(0, 229, 255, 0.35)` : 'none'
            }}
          >
            🌙 Dark Mode - {darkTheme.name}
          </button>
        </div>

        <h1
          style={{
            fontSize: '3rem',
            background: currentTheme.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            textShadow: isDarkMode ? `0 0 30px rgba(0, 229, 255, 0.35)` : 'none'
          }}
        >
          {currentTheme.name}
        </h1>

        <p style={{ fontSize: '1.2rem', color: currentTheme.colors.textSecondary, marginBottom: '2rem' }}>
          {currentTheme.description}
        </p>

        {/* Color Palette */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <div
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '10px',
              background: currentTheme.colors.primary,
              border: `2px solid ${currentTheme.colors.border}`,
              minWidth: '120px',
              textAlign: 'center',
              boxShadow: isDarkMode ? `0 0 20px rgba(0, 229, 255, 0.25)` : `0 0 0 rgba(0,0,0,0)`
            }}
          >
            <div style={{ fontWeight: 700, color: isDarkMode ? '#111' : 'white', marginBottom: '0.5rem' }}>PRIMARY</div>
            <code style={{ color: isDarkMode ? '#111' : 'white', fontSize: '0.75rem' }}>{currentTheme.colors.primary}</code>
          </div>

          <div
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '10px',
              background: currentTheme.colors.accent,
              border: `2px solid ${currentTheme.colors.border}`,
              minWidth: '120px',
              textAlign: 'center',
              boxShadow: isDarkMode ? `0 0 20px rgba(0, 229, 255, 0.35)` : `0 0 0 rgba(0,0,0,0)`
            }}
          >
            <div style={{ fontWeight: 700, color: '#000', marginBottom: '0.5rem' }}>ACCENT</div>
            <code style={{ color: '#000', fontSize: '0.75rem' }}>{currentTheme.colors.accent}</code>
          </div>

          <div
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '10px',
              background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
              border: `2px solid ${currentTheme.colors.border}`,
              minWidth: '120px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: 700, color: currentTheme.colors.text, marginBottom: '0.5rem' }}>SURFACE</div>
            <code style={{ color: currentTheme.colors.text, fontSize: '0.75rem' }}>
              {currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF')}
            </code>
          </div>
        </div>
      </div>

      {/* UI Component Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Card Component */}
        <div
          style={{
            background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
            border: `2px solid ${currentTheme.colors.border}`,
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.3s ease',
            boxShadow: isDarkMode
              ? `0 4px 20px rgba(0, 0, 0, 0.55), 0 0 25px rgba(0, 229, 255, 0.18)`
              : `0 4px 20px rgba(0, 0, 0, 0.08)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <h3 style={{ color: currentTheme.colors.primary, marginBottom: '1rem', fontSize: '1.5rem', borderLeft: `4px solid ${currentTheme.colors.accent}`, paddingLeft: '1rem' }}>
            Card Component
          </h3>
          <p style={{ color: currentTheme.colors.text, marginBottom: '1rem', lineHeight: '1.7' }}>
            This is how cards look in <strong>{currentTheme.name}</strong>. {isDarkMode ? 'Esports-style neon cyan accents.' : 'Clean sports-tech blue accents.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '10px',
                background: currentTheme.gradient,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: isDarkMode ? `0 4px 15px rgba(0, 229, 255, 0.35)` : `0 4px 15px rgba(47, 128, 237, 0.30)`,
                transition: 'all 0.3s ease'
              }}
            >
              Primary Button
            </button>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                border: `2px solid ${currentTheme.colors.border}`,
                borderRadius: '10px',
                background: `rgba(${currentTheme.colors.primaryRgb}, 0.08)`,
                color: currentTheme.colors.primary,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div style={{ background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'), border: `2px solid ${currentTheme.colors.border}`, borderRadius: '16px', padding: '2rem', boxShadow: isDarkMode ? `0 4px 20px rgba(0, 0, 0, 0.55), 0 0 25px rgba(0, 229, 255, 0.18)` : `0 4px 20px rgba(0, 0, 0, 0.08)` }}>
          <h3 style={{ color: currentTheme.colors.primary, marginBottom: '1rem', fontSize: '1.5rem', borderLeft: `4px solid ${currentTheme.colors.accent}`, paddingLeft: '1rem' }}>
            Form Elements
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>Input Field</label>
            <input
              type="text"
              placeholder="Enter text..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${currentTheme.colors.border}`,
                borderRadius: '8px',
                background: currentTheme.colors.background,
                color: currentTheme.colors.text,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>Select Dropdown</label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${currentTheme.colors.border}`,
                borderRadius: '8px',
                background: currentTheme.colors.background,
                color: currentTheme.colors.text,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>Textarea</label>
            <textarea
              placeholder="Enter message..."
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${currentTheme.colors.border}`,
                borderRadius: '8px',
                background: currentTheme.colors.background,
                color: currentTheme.colors.text,
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      {/* Finalize Button */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'), border: `2px solid ${currentTheme.colors.border}`, borderRadius: '16px', maxWidth: '600px', margin: '3rem auto 0', boxShadow: isDarkMode ? `0 4px 20px rgba(0, 0, 0, 0.55), 0 0 30px rgba(0, 229, 255, 0.22)` : `0 4px 20px rgba(0, 0, 0, 0.08)` }}>
        <button
          onClick={() => alert(`Theme "${currentTheme.name}" selected! This would be saved to your preferences.`)}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            fontWeight: 700,
            background: currentTheme.gradient,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: isDarkMode ? `0 8px 30px rgba(0, 229, 255, 0.35)` : `0 8px 30px rgba(47, 128, 237, 0.30)`,
            transition: 'all 0.3s ease'
          }}
        >
          ✅ Finalize This Theme
        </button>
      </div>
    </div>
  );
}

export default ThemePreview3V2;

