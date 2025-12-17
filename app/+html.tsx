import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * HTML Document customization for web platform
 * Minimal reset to avoid interfering with React Native Web
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Minimal reset - only body margin */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0;
            padding: 0;
          }
        `}} />

        {/* Expo's ScrollView reset for web */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
