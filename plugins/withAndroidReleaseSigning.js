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

    // Ensure the release signing configuration exists inside signingConfigs.
    if (!contents.includes('keyAlias "upload"')) {
      const signingConfigsMatch = contents.match(
        /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\}/
      );

      if (!signingConfigsMatch) {
        throw new Error(
          'Could not find signingConfigs block in android/app/build.gradle'
        );
      }

      const insertAt = signingConfigsMatch.index + signingConfigsMatch[0].length;
      contents =
        contents.slice(0, insertAt) +
        releaseSigningConfig +
        contents.slice(insertAt);
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