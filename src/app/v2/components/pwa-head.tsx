import Head from 'next/head'

export function PWAHead() {
  return (
    <Head>
      {/* PWA Meta Tags */}
      <meta name="application-name" content="Finance" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Finance" />
      <meta name="description" content="AI-powered financial insights with modern dark UI and voice chat" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />

      {/* Viewport */}
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
      />

      {/* Icons */}
      <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/icons/icon.svg" color="#000000" />
      <link rel="shortcut icon" href="/icons/icon-72x72.png" />

      {/* Splash Screens for iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* iPhone X, XS, 11 Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/iphone-x.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      />
      
      {/* iPhone XR, 11 */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/iphone-xr.png"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      />
      
      {/* iPhone XS Max, 11 Pro Max */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/iphone-xs-max.png"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      />
      
      {/* iPad */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/ipad.png"
        media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      />
      
      {/* iPad Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/ipad-pro.png"
        media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      />

      {/* Preload critical resources */}
      <link rel="preload" href="/icons/icon-192x192.png" as="image" />
      <link rel="preload" href="/manifest.json" as="fetch" crossOrigin="anonymous" />
    </Head>
  )
}
