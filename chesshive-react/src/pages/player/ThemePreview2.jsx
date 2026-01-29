import React, { useState, useEffect } from 'react';
import { lightThemes, darkThemes } from '../../styles/themes/theme-library';
import './ThemePreview.css';

function ThemePreview2() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Theme 2: Ocean Breeze (Light) and Deep Purple (Dark)
  const lightTheme = lightThemes.ocean;
  const darkTheme = darkThemes.deepPurple;
  
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set CSS variables
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

    // Apply dark/light class
    document.body.className = isDarkMode ? 'theme-preview dark' : 'theme-preview light';
    document.body.style.backgroundColor = colors.background;
  }, [isDarkMode, currentTheme]);

  return (
    <div className="theme-preview-container" style={{ 
      background: currentTheme.colors.background,
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Theme Info Header */}
      <div className="theme-header" style={{
        background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
        border: `2px solid ${currentTheme.colors.border}`,
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: isDarkMode 
          ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 30px ${currentTheme.colors.primary}40`
          : `0 4px 20px rgba(0, 0, 0, 0.1)`
      }}>
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
              boxShadow: !isDarkMode ? `0 4px 15px ${currentTheme.colors.primary}40` : 'none'
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
              boxShadow: isDarkMode ? `0 4px 15px ${currentTheme.colors.primary}40` : 'none'
            }}
          >
            🌙 Dark Mode - {darkTheme.name}
          </button>
        </div>

        <h1 style={{
          fontSize: '3rem',
          background: currentTheme.gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          textShadow: isDarkMode ? `0 0 30px ${currentTheme.colors.primary}50` : 'none'
        }}>
          {currentTheme.name}
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: currentTheme.colors.textSecondary,
          marginBottom: '2rem'
        }}>
          {currentTheme.description}
        </p>

        {/* Color Palette */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            background: currentTheme.colors.primary,
            border: `2px solid ${currentTheme.colors.border}`,
            minWidth: '120px',
            textAlign: 'center',
            boxShadow: isDarkMode ? `0 0 20px ${currentTheme.colors.primary}50` : 'none'
          }}>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>PRIMARY</div>
            <code style={{ color: 'white', fontSize: '0.75rem' }}>{currentTheme.colors.primary}</code>
          </div>
          
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            background: currentTheme.colors.accent,
            border: `2px solid ${currentTheme.colors.border}`,
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, color: isDarkMode ? '#F5F5F5' : '#000', marginBottom: '0.5rem' }}>ACCENT</div>
            <code style={{ color: isDarkMode ? '#F5F5F5' : '#000', fontSize: '0.75rem' }}>{currentTheme.colors.accent}</code>
          </div>
          
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
            border: `2px solid ${currentTheme.colors.border}`,
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, color: currentTheme.colors.text, marginBottom: '0.5rem' }}>SURFACE</div>
            <code style={{ color: currentTheme.colors.text, fontSize: '0.75rem' }}>
              {currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF')}
            </code>
          </div>
        </div>
      </div>

      {/* UI Component Preview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Card Component */}
        <div style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          transition: 'all 0.3s ease',
          boxShadow: isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? `0 8px 30px rgba(0, 0, 0, 0.6), 0 0 35px ${currentTheme.colors.primary}50`
            : `0 8px 30px ${currentTheme.colors.primary}25`;
          e.currentTarget.style.borderColor = currentTheme.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`;
          e.currentTarget.style.borderColor = currentTheme.colors.border;
        }}
        >
          <h3 style={{
            color: currentTheme.colors.primary,
            marginBottom: '1rem',
            fontSize: '1.5rem',
            borderLeft: `4px solid ${currentTheme.colors.primary}`,
            paddingLeft: '1rem',
            textShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
          }}>
            Card Component
          </h3>
          <p style={{ color: currentTheme.colors.text, marginBottom: '1rem', lineHeight: '1.7' }}>
            This is how cards look in <strong>{currentTheme.name}</strong>. Notice the smooth borders and elegant styling.
            {isDarkMode && ' With mystical purple glow effects.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '10px',
              background: currentTheme.gradient,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 15px ${currentTheme.colors.primary}50`,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px ${currentTheme.colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 15px ${currentTheme.colors.primary}50`;
            }}
            >
              Primary Button
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              border: `2px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.1)`,
              color: currentTheme.colors.primary,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.2)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.1)`;
            }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}>
          <h3 style={{
            color: currentTheme.colors.primary,
            marginBottom: '1rem',
            fontSize: '1.5rem',
            borderLeft: `4px solid ${currentTheme.colors.primary}`,
            paddingLeft: '1rem',
            textShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
          }}>
            Form Elements
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>
              Input Field
            </label>
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
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentTheme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${currentTheme.colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentTheme.colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>
              Select Dropdown
            </label>
            <select style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${currentTheme.colors.border}`,
              borderRadius: '8px',
              background: currentTheme.colors.background,
              color: currentTheme.colors.text,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${currentTheme.colors.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = currentTheme.colors.border;
              e.target.style.boxShadow = 'none';
            }}
            >
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: currentTheme.colors.text, fontWeight: 600 }}>
              Textarea
            </label>
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
                resize: 'vertical',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentTheme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${currentTheme.colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentTheme.colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Badges & Tags */}
        <div style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}>
          <h3 style={{
            color: currentTheme.colors.primary,
            marginBottom: '1rem',
            fontSize: '1.5rem',
            borderLeft: `4px solid ${currentTheme.colors.primary}`,
            paddingLeft: '1rem',
            textShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
          }}>
            Badges & Tags
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Success</span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#F59E0B',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Warning</span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Error</span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.2)`,
              color: currentTheme.colors.primary,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
            }}>Info</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.1)`,
              color: currentTheme.colors.primary,
              border: `1px solid ${currentTheme.colors.border}`,
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Tournament</span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.1)`,
              color: currentTheme.colors.primary,
              border: `1px solid ${currentTheme.colors.border}`,
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Active</span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: currentTheme.gradient,
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: `0 4px 15px ${currentTheme.colors.primary}40`
            }}>₹1,500</span>
          </div>
        </div>

        {/* List Items */}
        <div style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}>
          <h3 style={{
            color: currentTheme.colors.primary,
            marginBottom: '1rem',
            fontSize: '1.5rem',
            borderLeft: `4px solid ${currentTheme.colors.primary}`,
            paddingLeft: '1rem',
            textShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
          }}>
            List Items
          </h3>
          
          <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              marginBottom: '0.75rem',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.05)`,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.1)`;
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.borderColor = currentTheme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.05)`;
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = currentTheme.colors.border;
            }}
            >
              <i className="fas fa-chess-king" style={{ fontSize: '1.5rem', color: currentTheme.colors.primary }}></i>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: currentTheme.colors.text, marginBottom: '0.25rem' }}>
                  Chess Tournament
                </div>
                <div style={{ color: currentTheme.colors.textSecondary, fontSize: '0.9rem' }}>
                  October 15, 2025
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                background: currentTheme.gradient,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 10px ${currentTheme.colors.primary}40`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 6px 15px ${currentTheme.colors.primary}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 4px 10px ${currentTheme.colors.primary}40`;
              }}
              >
                Join
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              marginBottom: '0.75rem',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.05)`,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.1)`;
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.borderColor = currentTheme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.05)`;
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = currentTheme.colors.border;
            }}
            >
              <i className="fas fa-chess-queen" style={{ fontSize: '1.5rem', color: currentTheme.colors.primary }}></i>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: currentTheme.colors.text, marginBottom: '0.25rem' }}>
                  Player Match
                </div>
                <div style={{ color: currentTheme.colors.textSecondary, fontSize: '0.9rem' }}>
                  Today at 3:00 PM
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                background: currentTheme.gradient,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 10px ${currentTheme.colors.primary}40`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 6px 15px ${currentTheme.colors.primary}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 4px 10px ${currentTheme.colors.primary}40`;
              }}
              >
                View
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: `rgba(${currentTheme.colors.primaryRgb}, 0.05)`,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.1)`;
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.borderColor = currentTheme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(${currentTheme.colors.primaryRgb}, 0.05)`;
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = currentTheme.colors.border;
            }}
            >
              <i className="fas fa-trophy" style={{ fontSize: '1.5rem', color: currentTheme.colors.primary }}></i>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: currentTheme.colors.text, marginBottom: '0.25rem' }}>
                  Championship Finals
                </div>
                <div style={{ color: currentTheme.colors.textSecondary, fontSize: '0.9rem' }}>
                  November 1, 2025
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                background: currentTheme.gradient,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 10px ${currentTheme.colors.primary}40`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 6px 15px ${currentTheme.colors.primary}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 4px 10px ${currentTheme.colors.primary}40`;
              }}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div style={{
          background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: isDarkMode 
            ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px ${currentTheme.colors.primary}33`
            : `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}>
          <h3 style={{
            color: currentTheme.colors.primary,
            marginBottom: '1rem',
            fontSize: '1.5rem',
            borderLeft: `4px solid ${currentTheme.colors.primary}`,
            paddingLeft: '1rem',
            textShadow: isDarkMode ? `0 0 10px ${currentTheme.colors.primary}30` : 'none'
          }}>
            Typography
          </h3>
          
          <h1 style={{
            fontSize: '2.5rem',
            background: currentTheme.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            textShadow: isDarkMode ? `0 0 20px ${currentTheme.colors.primary}40` : 'none'
          }}>Heading 1</h1>
          
          <h2 style={{
            fontSize: '2rem',
            color: currentTheme.colors.primary,
            marginBottom: '0.5rem',
            textShadow: isDarkMode ? `0 0 15px ${currentTheme.colors.primary}30` : 'none'
          }}>Heading 2</h2>
          
          <h3 style={{
            fontSize: '1.5rem',
            color: currentTheme.colors.primary,
            marginBottom: '0.5rem'
          }}>Heading 3</h3>
          
          <p style={{
            color: currentTheme.colors.text,
            lineHeight: '1.7',
            marginBottom: '0.75rem'
          }}>
            This is body text. It should be readable and comfortable to read for extended periods. 
            The color contrast ensures excellent legibility.
          </p>
          
          <p style={{
            color: currentTheme.colors.muted,
            lineHeight: '1.7',
            fontSize: '0.95rem'
          }}>
            This is muted text for less important information or secondary content.
          </p>
        </div>
      </div>

      {/* Finalize Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '2rem',
        background: currentTheme.colors.surface || (isDarkMode ? currentTheme.colors.surfaceElevated : '#FFFFFF'),
        border: `2px solid ${currentTheme.colors.border}`,
        borderRadius: '16px',
        maxWidth: '600px',
        margin: '3rem auto 0',
        boxShadow: isDarkMode 
          ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 30px ${currentTheme.colors.primary}40`
          : `0 4px 20px rgba(0, 0, 0, 0.1)`
      }}>
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
            boxShadow: `0 8px 30px ${currentTheme.colors.primary}50`,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = `0 12px 40px ${currentTheme.colors.primary}70`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = `0 8px 30px ${currentTheme.colors.primary}50`;
          }}
        >
          ✅ Finalize This Theme
        </button>
      </div>
    </div>
  );
}

export default ThemePreview2;
