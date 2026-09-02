const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1️⃣ Use SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer'
);

// 2️⃣ Remove svg from assetExts
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);

// 3️⃣ Add svg to sourceExts
config.resolver.sourceExts.push('svg');

// Native-only app — do not resolve the web platform in Metro.
config.resolver.platforms = ['ios', 'android', 'native'];

// 4️⃣ (Optional) Keep your minifier config
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
