import { useEffect } from "react";

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = () => {
      window.eruda.init();
    };
    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
