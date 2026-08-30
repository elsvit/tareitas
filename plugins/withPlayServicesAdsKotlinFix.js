const { withProjectBuildGradle, withGradleProperties } = require('expo/config-plugins');

const KOTLIN_VERSION = '2.3.0';
const KSP_VERSION = '2.2.20-2.0.3';

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = function withPlayServicesAdsKotlinFix(config) {
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => item.type !== 'property' || item.key !== 'android.kotlinVersion'
    );
    config.modResults.push({
      type: 'property',
      key: 'android.kotlinVersion',
      value: KOTLIN_VERSION,
    });
    return config;
  });

  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('android.kotlinVersion')) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /buildscript\s*\{/,
      `buildscript {
  ext {
    kotlinVersion = findProperty('android.kotlinVersion') ?: '${KOTLIN_VERSION}'
    kspVersion = '${KSP_VERSION}'
  }`
    );

    config.modResults.contents = config.modResults.contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")'
    );

    return config;
  });
};
