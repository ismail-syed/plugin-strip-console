// @ts-check
const swc = require("@swc/core");
const ReactI18n = require("../lib/react-i18n").default;

// it.skip("injects arguments into withI18n when adjacent translations exist");

const TRANSLATION_DIRECTORY_NAME = "translations";
const defaultHash = Number.MAX_SAFE_INTEGER.toString(36).substr(0, 5);

const useI18nFixture = `
  import React from 'react';
  import {useI18n} from '@shopify/react-i18n';

  export default function MyComponent() {
    const [i18n] = useI18n();
    return i18n.translate('key');
  }
`;

it("injects arguments into useI18n when adjacent translations exist", async () => {
  const transformedCode = await transformUsingReactI18nPlugin(useI18nFixture);
  // const transformedCode = "console.log('hi')";
  // console.log("res", transformedCode);

  expect(transformedCode).toBe(`
    import _en from './${TRANSLATION_DIRECTORY_NAME}/en.json';
    import React from 'react';
    import {useI18n} from '@shopify/react-i18n';

    export default function MyComponent() {
      const [i18n] = useI18n({
        id: 'MyComponent_${defaultHash}',
        fallback: _en,
        ${createExpectedTranslationsOption()}
      });
      return i18n.translate('key');
    }
  `);
});

async function transformUsingReactI18nPlugin(codeToTransform) {
  console.log("before: ", codeToTransform);
  /* */

  /** @type {import('@swc/core').Options} */
  const transformConfig = {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
        dynamicImport: true,
      },
    },
    // plugin: (m) => new ReactI18n().visitModule(m),
  };
  const res = swc.transformSync(codeToTransform, transformConfig);

  console.log("after: ", res.code);

  return res.code;
}

function createExpectedTranslationsOption(options = {}) {
  const { translationArrayString = '["de", "fr", "zh-TW"]' } = options;

  return `
  translations(locale) {
    if (${translationArrayString}.indexOf(locale) < 0) {
      return;
    }

    return (async () => {
      const dictionary = await import(/* webpackChunkName: "MyComponent_${defaultHash}-i18n", webpackMode: "lazy-once" */ \`./${TRANSLATION_DIRECTORY_NAME}/$\{locale}.json\`);
      return dictionary && dictionary.default;
    })();
  }
`;
}
