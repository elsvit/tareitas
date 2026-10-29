const { withGradleProperties } = require('@expo/config-plugins');

function upsertProperty(modResults, key, value) {
  const existing = modResults.find(
    item => item.type === 'property' && item.key === key,
  );

  if (existing) {
    existing.value = value;
    return modResults;
  }

  modResults.push({ type: 'property', key, value });
  return modResults;
}

/**
 * Faster local release builds: more heap for R8, Gradle cache, skip release lint.
 * Play Store runs its own checks on upload.
 */
module.exports = function withAndroidGradleBuildPerf(config) {
  return withGradleProperties(config, configWithProps => {
    let props = configWithProps.modResults;

    props = upsertProperty(
      props,
      'org.gradle.jvmargs',
      '-Xmx4096m -XX:MaxMetaspaceSize=768m -XX:+HeapDumpOnOutOfMemoryError',
    );
    props = upsertProperty(props, 'org.gradle.caching', 'true');
    props = upsertProperty(props, 'android.lint.checkReleaseBuilds', 'false');

    configWithProps.modResults = props;
    return configWithProps;
  });
};
