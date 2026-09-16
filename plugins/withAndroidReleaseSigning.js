const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const releaseSigningConfig = `
        release {
            storeFile file('../../product.keystore')
            storePassword System.getenv("TAREITAS_KEYSTORE_PASSWORD")
            keyAlias "upload"
            keyPassword System.getenv("TAREITAS_KEY_PASSWORD")
        }
`;

    // Ensure the release signing configuration exists.
    if (!contents.includes('keyAlias "upload"')) {
      const signingConfigsEnd = contents.indexOf('\n    }\n    buildTypes {');

      if (signingConfigsEnd === -1) {
        throw new Error(
          'Could not find signingConfigs block in android/app/build.gradle'
        );
      }

      contents =
        contents.slice(0, signingConfigsEnd + 6) +
        releaseSigningConfig +
        contents.slice(signingConfigsEnd + 6);
    }

    // Make release builds use the release signing configuration.
    contents = contents.replace(
      /release\s*\{\s*\n(\s*)signingConfig signingConfigs\.debug/,
      'release {\n$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = contents;

    return config;
  });
};