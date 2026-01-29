import React, { useState, useEffect } from 'react';
import { lightThemes, darkThemes } from '../../styles/themes/theme-library';
import './ThemePreview.css';

function ThemePreview() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLightTheme, setCurrentLightTheme] = useState('emerald');
  const [currentDarkTheme, setCurrentDarkTheme] = useState('neonCyan');
  const [activeTheme, setActiveTheme] = useState(null);

  // Get current theme based on mode
  const getCurrentTheme = () => {
    const themeKey = isDarkMode ? currentDarkTheme : currentLightTheme;
    const themes = isDarkMode ? darkThemes : lightThemes;
    return themes[themeKey];
  };

  // Apply theme to document
  useEffect(() => {
    const theme = getCurrentTheme();
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors;

    // Set CSS variables
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-rgb', colors.primaryRgb);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark || colors.primary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-muted', colors.muted);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-gradient', theme.gradient);

    // Apply dark/light class
    document.body.className = isDarkMode ? 'theme-preview dark' : 'theme-preview light';
  }, [isDarkMode, currentLightTheme, currentDarkTheme]);

  const theme = getCurrentTheme();
  const themes = isDarkMode ? darkThemes : lightThemes;
  const themeKeys = Object.keys(themes);
  const currentIndex = themeKeys.indexOf(isDarkMode ? currentDarkTheme : currentLightTheme);

  const nextTheme = () => {
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextKey = themeKeys[nextIndex];
    if (isDarkMode) {
      setCurrentDarkTheme(nextKey);
    } else {
      setCurrentLightTheme(nextKey);
    }
  };

  const prevTheme = () => {
    const prevIndex = (currentIndex - 1 + themeKeys.length) % themeKeys.length;
    const prevKey = themeKeys[prevIndex];
    if (isDarkMode) {
      setCurrentDarkTheme(prevKey);
    } else {
      setCurrentLightTheme(prevKey);
    }
  };

  const selectTheme = (key) => {
    if (isDarkMode) {
      setCurrentDarkTheme(key);
    } else {
      setCurrentLightTheme(key);
    }
  };

  if (!theme) return null;

  return (
    <div className="theme-preview-container">
      {/* Theme Controls */}
      <div className="theme-controls">
        <div className="mode-toggle">
          <button 
            className={!isDarkMode ? 'active' : ''} 
            onClick={() => setIsDarkMode(false)}
          >
            ☀️ Light Mode
          </button>
          <button 
            className={isDarkMode ? 'active' : ''} 
            onClick={() => setIsDarkMode(true)}
          >
            🌙 Dark Mode
          </button>
        </div>

        <div className="theme-navigation">
          <button onClick={prevTheme}>← Previous</button>
          <span className="theme-counter">
            {currentIndex + 1} / {themeKeys.length}
          </span>
          <button onClick={nextTheme}>Next →</button>
        </div>

        <div className="theme-selector">
          <h3>Select Theme:</h3>
          <div className="theme-grid">
            {themeKeys.map((key) => {
              const t = themes[key];
              const isActive = (isDarkMode && key === currentDarkTheme) || 
                              (!isDarkMode && key === currentLightTheme);
              return (
                <button
                  key={key}
                  className={`theme-option ${isActive ? 'active' : ''}`}
                  onClick={() => selectTheme(key)}
                  style={{
                    background: t.gradient,
                    borderColor: isActive ? t.colors.primary : 'transparent'
                  }}
                >
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="theme-preview-area">
        <div className="theme-header">
          <h1 className="theme-title">{theme.name}</h1>
          <p className="theme-description">{theme.description}</p>
          <div className="theme-colors">
            <div className="color-swatch" style={{ background: theme.colors.primary }}>
              <span>Primary</span>
              <code>{theme.colors.primary}</code>
            </div>
            <div className="color-swatch" style={{ background: theme.colors.accent }}>
              <span>Accent</span>
              <code>{theme.colors.accent}</code>
            </div>
            <div className="color-swatch" style={{ background: theme.colors.surface }}>
              <span>Surface</span>
              <code>{theme.colors.surface}</code>
            </div>
          </div>
        </div>

        {/* UI Component Preview */}
        <div className="ui-preview">
          <div className="preview-card">
            <h3>Card Component</h3>
            <p>This is a preview of how cards look in this theme.</p>
            <div className="card-actions">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary</button>
            </div>
          </div>

          <div className="preview-card">
            <h3>Form Elements</h3>
            <div className="form-group">
              <label>Input Field</label>
              <input type="text" placeholder="Enter text..." />
            </div>
            <div className="form-group">
              <label>Select Dropdown</label>
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Textarea</label>
              <textarea placeholder="Enter message..."></textarea>
            </div>
          </div>

          <div className="preview-card">
            <h3>Badges & Tags</h3>
            <div className="badges">
              <span className="badge success">Success</span>
              <span className="badge warning">Warning</span>
              <span className="badge error">Error</span>
              <span className="badge info">Info</span>
            </div>
            <div className="tags">
              <span className="tag">Tournament</span>
              <span className="tag">Active</span>
              <span className="tag price">₹1,500</span>
            </div>
          </div>

          <div className="preview-card">
            <h3>List Items</h3>
            <ul className="preview-list">
              <li>
                <i className="fas fa-chess-king"></i>
                <div>
                  <strong>Chess Tournament</strong>
                  <span>October 15, 2025</span>
                </div>
                <button className="btn-small">Join</button>
              </li>
              <li>
                <i className="fas fa-chess-queen"></i>
                <div>
                  <strong>Player Match</strong>
                  <span>Today at 3:00 PM</span>
                </div>
                <button className="btn-small">View</button>
              </li>
              <li>
                <i className="fas fa-trophy"></i>
                <div>
                  <strong>Championship Finals</strong>
                  <span>November 1, 2025</span>
                </div>
                <button className="btn-small">Register</button>
              </li>
            </ul>
          </div>

          <div className="preview-card">
            <h3>Typography</h3>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>This is body text. It should be readable and comfortable to read for extended periods.</p>
            <p className="muted">This is muted text for less important information.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="theme-actions">
          <button className="btn-finalize" onClick={() => {
            setActiveTheme({
              mode: isDarkMode ? 'dark' : 'light',
              key: isDarkMode ? currentDarkTheme : currentLightTheme,
              name: theme.name
            });
            alert(`Theme "${theme.name}" selected! This would be saved to your preferences.`);
          }}>
            ✅ Finalize This Theme
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
