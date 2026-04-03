import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Generate session ID for analytics
    if (!sessionStorage.getItem('fenntel_session')) {
      const sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('fenntel_session', sid);
    }
  }, []);

  return (
    <>
      <canvas id="particle-canvas" />
      <Component {...pageProps} />
    </>
  );
}
