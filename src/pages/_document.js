// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1D4ED8" />
        <link rel="apple-touch-icon" href="/images/logo/logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Register the service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(registration => {
                    console.log('Service Worker registered with scope: ', registration.scope);
                  })
                  .catch(error => {
                    console.log('Service Worker registration failed: ', error);
                  });
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}
