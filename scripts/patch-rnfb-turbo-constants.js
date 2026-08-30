/**
 * RN 0.81 codegen expects ModuleConstants<...::Constants>, but RNFB 26.3.x
 * declares ModuleConstants<...::Constants::Builder> in a few iOS TurboModules.
 * See: https://github.com/invertase/react-native-firebase/issues/9206
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES = [
  'node_modules/@react-native-firebase/app/ios/RNFBApp/RNFBAppModule.mm',
  'node_modules/@react-native-firebase/app/ios/RNFBApp/RNFBUtilsModule.mm',
  'node_modules/@react-native-firebase/crashlytics/ios/RNFBCrashlytics/RNFBCrashlyticsModule.mm',
];

for (const relativePath of FILES) {
  const filePath = path.join(ROOT, relativePath);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const patched = source.replace(/Constants::Builder>/g, 'Constants>');

  if (patched === source) {
    continue;
  }

  fs.writeFileSync(filePath, patched);
  console.log(`patched ${relativePath}`);
}
