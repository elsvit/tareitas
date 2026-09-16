const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withRemoveAudioForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    manifest['uses-permission'] = manifest['uses-permission'] || [];

    const permissionName =
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK';

    const existingPermission = manifest['uses-permission'].find(
      (permission) => permission.$?.['android:name'] === permissionName
    );

    if (existingPermission) {
      existingPermission.$['tools:node'] = 'remove';
    } else {
      manifest['uses-permission'].push({
        $: {
          'android:name': permissionName,
          'tools:node': 'remove',
        },
      });
    }

    // Remove Expo Audio's media playback foreground service.
    manifest.application = manifest.application?.map((application) => {
      if (application.service) {
        application.service = application.service.map((service) => {
          if (
            service.$?.['android:name'] ===
            'expo.modules.audio.service.AudioControlsService'
          ) {
            service.$['tools:node'] = 'remove';
          }

          return service;
        });
      }

      return application;
    });

    return config;
  });
};