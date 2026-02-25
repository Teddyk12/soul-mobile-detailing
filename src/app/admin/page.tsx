'use client';

import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    // Redirect to the standalone admin HTML page
    window.location.href = '/admin.html';
  }, []);

  // Return a loading state while the redirect happens
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          Loading admin panel...
        </div>
        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
          If you are not redirected automatically, <a href="/admin.html" style={{ color: '#3b82f6', textDecoration: 'underline' }}>click here</a>.
        </div>
      </div>
    </div>
  );
}
