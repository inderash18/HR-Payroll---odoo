import React from 'react';
import { OdooLogo } from './OdooLogo';

export function FullScreenLoader({ message = 'Verifying secure session...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-main, #f8f6fb)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem',
          borderRadius: '24px',
          background: 'var(--surface, rgba(255, 255, 255, 0.85))',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-soft, rgba(142, 68, 173, 0.12))',
          boxShadow: '0 20px 50px rgba(74, 20, 140, 0.08)',
          maxWidth: '380px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            marginBottom: '1.25rem',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--primary, #714B67) 0%, transparent 70%)',
              opacity: 0.2,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <OdooLogo
            size={52}
            color="var(--primary, #714B67)"
            style={{
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 4px 12px rgba(113, 75, 103, 0.25))',
            }}
          />
        </div>

        {/* Brand Title */}
        <div
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-primary, #1e1b2e)',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem',
            fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)',
          }}
        >
          Odoo
        </div>

        {/* Spinner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2.5px solid var(--surface-soft, rgba(113, 75, 103, 0.15))',
              borderTopColor: 'var(--primary, #714B67)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: '0.84rem',
            fontWeight: 500,
            color: 'var(--text-secondary, #6b647c)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.28; }
        }
      `}</style>
    </div>
  );
}

export default FullScreenLoader;
