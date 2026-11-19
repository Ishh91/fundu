// Simple holding page shown on production while the site is under maintenance.
// Localhost bypasses this (see main.tsx) so development keeps working.

export function MaintenancePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        background: '#0b0f17',
        color: '#e6edf7',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <div
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            marginBottom: '1.25rem',
          }}
          aria-hidden="true"
        >
          🛠️
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.75rem' }}>
          We&rsquo;ll be back shortly
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.85 }}>
          Fundu is undergoing a quick update. Please check back in a little
          while &mdash; thanks for your patience!
        </p>
      </div>
    </main>
  );
}

export default MaintenancePage;
