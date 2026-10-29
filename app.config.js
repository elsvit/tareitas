const fs = require('fs');
const path = require('path');

/** @type {import('expo/config').ExpoConfig} */
const proguardAdditions = fs.readFileSync(
  path.join(__dirname, 'android-proguard-additions.pro'),
  'utf8',
);

function patchBuildProperties(plugins) {
  if (!plugins) {
    return plugins;
  }

  return plugins.map(plugin => {
    if (Array.isArray(plugin) && plugin[0] === 'expo-build-properties') {
      const opts = plugin[1] ?? {};

      return [
        'expo-build-properties',
        {
          ...opts,
          android: {
            ...opts.android,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            extraProguardRules: proguardAdditions,
          },
        },
      ];
    }

    return plugin;
  });
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  plugins: patchBuildProperties(config.plugins),
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  },
});
