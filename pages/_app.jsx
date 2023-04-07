import 'nextra-theme-blog/style.css'
import 'tailwindcss/tailwind.css'

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
