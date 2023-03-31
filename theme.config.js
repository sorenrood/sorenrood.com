const YEAR = new Date().getFullYear()

export default {
  github: 'https://github.com/sorenrood/',
  docsRepositoryBase: 'https://github.com/sorenrood/blog',
  titleSuffix: ' – Søren Rood',
  logo: (
    <>
      <span className="mr-2 font-extrabold hidden md:inline">Søren Rood</span>
      <span className="text-gray-600 font-normal hidden md:inline">
        A place to share my thoughts and learn.
      </span>
    </>
  ),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="Søren Rood" />
      <meta name="og:description" content="Søren Rood" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/894804525494456343/958585474597937152/unknown.png" />
      <meta name="twitter:site:domain" content="Søren Rood" />
      <meta name="twitter:url" content="https://sorenrood.com" />
      <meta name="og:title" content="Søren Rood" />
      <meta name="og:image" content="Søren Rood" />
      <meta name="apple-mobile-web-app-title" content="Nextra" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    </>
  ),
  search: true,
  prevLinks: true,
  nextLinks: true,
  footer: true,
  footerEditLink: 'Edit this page on GitHub',
  footerText: <>{YEAR} © Søren Rood.</>,
  unstable_faviconGlyph: '👋',
}
