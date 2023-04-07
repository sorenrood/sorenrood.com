(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path'), require('graceful-fs'), require('loader-utils'), require('gray-matter'), require('slash'), require('child_process'), require('util'), require('download'), require('remark'), require('strip-markdown')) :
  typeof define === 'function' && define.amd ? define(['path', 'graceful-fs', 'loader-utils', 'gray-matter', 'slash', 'child_process', 'util', 'download', 'remark', 'strip-markdown'], factory) :
  (global = global || self, global.nextra = factory(global.path, global.gracefulFs, global.loaderUtils, global.grayMatter, global.slash, global.childProcess, global.util, global.download, global.remark, global.stripMarkdown));
}(this, (function (path, gracefulFs, loaderUtils, grayMatter, slash, cp, util, download, remark, strip) {
  path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
  grayMatter = grayMatter && Object.prototype.hasOwnProperty.call(grayMatter, 'default') ? grayMatter['default'] : grayMatter;
  slash = slash && Object.prototype.hasOwnProperty.call(slash, 'default') ? slash['default'] : slash;
  cp = cp && Object.prototype.hasOwnProperty.call(cp, 'default') ? cp['default'] : cp;
  download = download && Object.prototype.hasOwnProperty.call(download, 'default') ? download['default'] : download;
  remark = remark && Object.prototype.hasOwnProperty.call(remark, 'default') ? remark['default'] : remark;
  strip = strip && Object.prototype.hasOwnProperty.call(strip, 'default') ? strip['default'] : strip;

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function filterRouteLocale(pageMap, locale, defaultLocale) {
    const isDefaultLocale = !locale || locale === defaultLocale;
    const filteredPageMap = []; // We fallback to the default locale

    const fallbackPages = {};

    for (const page of pageMap) {
      if (page.children) {
        filteredPageMap.push(_extends({}, page, {
          children: filterRouteLocale(page.children, locale, defaultLocale)
        }));
        continue;
      }

      const localDoesMatch = !page.locale && isDefaultLocale || page.locale === locale;

      if (localDoesMatch) {
        fallbackPages[page.name] = null;
        filteredPageMap.push(page);
      } else {
        if (fallbackPages[page.name] !== null && (!page.locale || page.locale === defaultLocale)) {
          fallbackPages[page.name] = page;
        }
      }
    }

    for (const name in fallbackPages) {
      if (fallbackPages[name]) {
        filteredPageMap.push(fallbackPages[name]);
      }
    }

    return filteredPageMap;
  }

  const execFile = util.promisify(cp.execFile);
  const isProduction = process.env.NODE_ENV === 'production';
  const files = {};

  const escapeQuote = str => str.replace(/"/g, '\\"');

  const getStemmingLanguage = locale => {
    // en, en-US
    if (locale.toLowerCase().startsWith('en')) {
      return 'English';
    }

    return 'None';
  };

  const getPlainText = async content => {
    let plainText = '';
    await remark().use(strip).use(() => tree => {
      for (let i = 0; i < tree.children.length; i++) {
        try {
          const value = tree.children[i].children[0].value;

          if (/^(import|export) /.test(value)) {
            continue;
          }

          plainText += value + '\n';
        } catch (e) {}
      }
    }).process(content);
    return plainText;
  };

  async function addStorkIndex({
    fileLocale,
    route,
    title,
    data,
    content
  }) {
    if (!isProduction) return;
    if (!files[fileLocale]) files[fileLocale] = {
      toml: `[input]\n` + `minimum_indexed_substring_length = 2\n` + `title_boost = "Ridiculous"\n` + `stemming = "${getStemmingLanguage(fileLocale)}"\n\n`
    };

    if (!files[fileLocale][route]) {
      const plainText = await getPlainText(content);
      files[fileLocale][route] = true;
      files[fileLocale].toml += `[[input.files]]\n`;
      files[fileLocale].toml += `title = "${escapeQuote(data.title || title)}"\n`;
      files[fileLocale].toml += `url = "${escapeQuote(route)}"\n`;
      files[fileLocale].toml += `contents = "${escapeQuote(plainText.replace(/\n/g, '\\n'))}"\n`;
      files[fileLocale].toml += `filetype = "PlainText"`;
      files[fileLocale].toml += `\n`;
      const assetDir = path.join(process.cwd(), 'public');
      const tomlFile = path.join(assetDir, `index-${fileLocale}.toml`);

      try {
        gracefulFs.statSync(assetDir);
      } catch (err) {
        gracefulFs.mkdirSync(assetDir);
      }

      await gracefulFs.promises.writeFile(tomlFile, files[fileLocale].toml);
    }
  }

  function getLocaleFromFilename(name) {
    const localeRegex = /\.([a-zA-Z-]+)?\.(mdx?|jsx?|json)$/;
    const match = name.match(localeRegex);
    if (match) return match[1];
    return undefined;
  }
  function removeExtension(name) {
    const match = name.match(/^([^.]+)/);
    return match !== null ? match[1] : '';
  }
  function getFileName(resourcePath) {
    return removeExtension(path.basename(resourcePath));
  }
  const parseJsonFile = (content, path) => {
    let parsed = {};

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error(`Error parsing ${path}, make sure it's a valid JSON \n` + err);
    }

    return parsed;
  };

  const extension = /\.(mdx?|jsx?|tsx?)$/;
  const mdxExtension = /\.mdx?$/;
  const metaExtension = /meta\.?([a-zA-Z-]+)?\.json/;

  async function getPageMap(currentResourcePath) {
    const activeRouteLocale = getLocaleFromFilename(currentResourcePath);
    let activeRoute = '';
    let activeRouteTitle = '';

    async function getFiles(dir, route) {
      const files = await gracefulFs.promises.readdir(dir, {
        withFileTypes: true
      });
      let dirMeta = {}; // go through the directory

      const items = (await Promise.all(files.map(async f => {
        const filePath = path.resolve(dir, f.name);
        const fileRoute = path.join(route, removeExtension(f.name).replace(/^index$/, ''));

        if (f.isDirectory()) {
          const children = await getFiles(filePath, fileRoute);
          if (!children.length) return null;
          return {
            name: f.name,
            children,
            route: fileRoute
          };
        } else if (extension.test(f.name)) {
          const locale = getLocaleFromFilename(f.name);

          if (filePath === currentResourcePath) {
            activeRoute = fileRoute;
          } // MDX or MD


          if (mdxExtension.test(f.name)) {
            const fileContents = await gracefulFs.promises.readFile(filePath, 'utf-8');
            const {
              data
            } = grayMatter(fileContents);

            if (Object.keys(data).length) {
              return {
                name: removeExtension(f.name),
                route: fileRoute,
                frontMatter: data,
                locale
              };
            }
          }

          return {
            name: removeExtension(f.name),
            route: fileRoute,
            locale
          };
        } else if (metaExtension.test(f.name)) {
          const content = await gracefulFs.promises.readFile(filePath, 'utf-8');
          const meta = parseJsonFile(content, filePath);
          const locale = f.name.match(metaExtension)[1];

          if (!activeRouteLocale || locale === activeRouteLocale) {
            dirMeta = meta;
          }

          return {
            name: 'meta.json',
            meta,
            locale
          };
        }
      }))).map(item => {
        if (!item) return;

        if (item.route === activeRoute) {
          activeRouteTitle = dirMeta[item.name] || item.name;
        }

        return _extends({}, item);
      }).filter(Boolean);
      return items;
    }

    return [await getFiles(path.join(process.cwd(), 'pages'), '/'), activeRoute, activeRouteTitle];
  }

  async function analyzeLocalizedEntries(currentResourcePath, defaultLocale) {
    const filename = getFileName(currentResourcePath);
    const dir = path.dirname(currentResourcePath);
    const filenameRe = new RegExp('^' + filename + '.[a-zA-Z-]+.(mdx?|jsx?|tsx?|json)$');
    const files = await gracefulFs.promises.readdir(dir, {
      withFileTypes: true
    });
    let hasSSR = false,
        hasSSG = false,
        defaultIndex = 0;
    const filteredFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!filenameRe.test(file.name)) continue;
      const content = await gracefulFs.promises.readFile(path.join(dir, file.name), 'utf-8');
      const locale = getLocaleFromFilename(file.name); // Note: this is definitely not correct, we have to use MDX tokenizer here.

      const exportSSR = /^export .+ getServerSideProps[=| |\(]/m.test(content);
      const exportSSG = /^export .+ getStaticProps[=| |\(]/m.test(content);
      hasSSR = hasSSR || exportSSR;
      hasSSG = hasSSG || exportSSG;
      if (locale === defaultLocale) defaultIndex = filteredFiles.length;
      filteredFiles.push({
        name: file.name,
        locale,
        ssr: exportSSR,
        ssg: exportSSG
      });
    }

    return {
      ssr: hasSSR,
      ssg: hasSSG,
      files: filteredFiles,
      defaultIndex
    };
  }

  async function loader (source) {
    const callback = this.async();
    this.cacheable();
    const options = loaderUtils.getOptions(this);
    const {
      theme,
      themeConfig,
      locales,
      defaultLocale
    } = options;
    const {
      resourcePath,
      resourceQuery
    } = this;
    const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1);
    const fileLocale = getLocaleFromFilename(filename) || 'default'; // Add the entire directory `pages` as the dependency
    // so we can generate the correct page map

    this.addContextDependency(path.resolve('pages')); // Generate the page map

    let [pageMap, route, title] = await getPageMap(resourcePath); // Extract frontMatter information if it exists

    const {
      data,
      content
    } = grayMatter(source); // Remove frontMatter from the source

    source = content; // Add content to stork indexes

    if (options.stork) {
      // We only index .MD and .MDX files
      if (mdxExtension.test(filename)) {
        await addStorkIndex({
          pageMap,
          filename,
          fileLocale,
          route,
          title,
          data,
          content,
          locales
        });
      }
    } // Check if there's a theme provided


    if (!theme) {
      console.error('No Nextra theme found!');
      return callback(null, source);
    }

    let layout = theme;
    let layoutConfig = themeConfig || null; // Relative path instead of a package name

    if (theme.startsWith('.') || theme.startsWith('/')) {
      layout = path.resolve(theme);
    }

    if (layoutConfig) {
      layoutConfig = slash(path.resolve(layoutConfig));
    }

    const notI18nEntry = resourceQuery.includes('nextra-raw');

    if (locales && !notI18nEntry) {
      // We need to handle the locale router here
      const {
        files,
        defaultIndex,
        ssr,
        ssg
      } = await analyzeLocalizedEntries(resourcePath, defaultLocale);
      const i18nEntry = `	
import { useRouter } from 'next/router'	
${files.map((file, index) => `import Page_${index}${file.ssg || file.ssr ? `, { ${file.ssg ? 'getStaticProps' : 'getServerSideProps'} as page_data_${index} }` : ''} from './${file.name}?nextra-raw'`).join('\n')}

export default function I18NPage (props) {	
  const { locale } = useRouter()	
  ${files.map((file, index) => `if (locale === '${file.locale}') {
    return <Page_${index} {...props}/>
  } else `).join('')} {	
    return <Page_${defaultIndex} {...props}/>	
  }
}

${ssg || ssr ? `export async function ${ssg ? 'getStaticProps' : 'getServerSideProps'} (context) {
  const locale = context.locale
  ${files.map((file, index) => `if (locale === '${file.locale}' && ${ssg ? file.ssg : file.ssr}) {
    return page_data_${index}(context)
  } else `).join('')} {	
    return { props: {} }
  }
}` : ''}
`;
      return callback(null, i18nEntry);
    }

    if (locales) {
      const locale = getLocaleFromFilename(filename);

      if (locale) {
        pageMap = filterRouteLocale(pageMap, locale, defaultLocale);
      }
    }

    const prefix = `
import withLayout from '${layout}'
import { withSSG } from 'nextra/ssg'
${layoutConfig ? `import layoutConfig from '${layoutConfig}'` : ''}

`;
    const suffix = `\n\nexport default function NextraPage (props) {
    return withSSG(withLayout({
      filename: "${slash(filename)}",
      route: "${slash(route)}",
      meta: ${JSON.stringify(data)},
      pageMap: ${JSON.stringify(pageMap)}
    }, ${layoutConfig ? 'layoutConfig' : 'null'}))(props)
}`; // Add imports and exports to the source

    source = prefix + '\n' + source + '\n' + suffix;
    return callback(null, source);
  }

  return loader;

})));
