import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    boxSizing: 'border-box'
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',

    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box'
  };

  return (
    <div style={layoutStyle}>
      <div style={containerStyle}>
        {children}
      </div>
    </div>
  );
}
