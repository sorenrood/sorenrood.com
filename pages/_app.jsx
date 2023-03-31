import 'nextra-theme-blog/style.css'
import 'tailwindcss/tailwind.css'
import { Analytics } from '@vercel/analytics/react';

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
