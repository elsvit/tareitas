const { withXcodeProject } = require('expo/config-plugins');

const PHASE_NAME = 'Generate Hermes dSYM';

const SHELL_SCRIPT = `set -e

# Xcode 16+ validates that archives include a dSYM for embedded hermes.framework.
# Prebuilt Hermes does not ship dSYMs, so generate one from the embedded binary.
if [[ "$CONFIGURATION" == *Release* ]] || [[ "$ACTION" == "install" ]]; then
  HERMES_BIN="\${TARGET_BUILD_DIR}/\${FRAMEWORKS_FOLDER_PATH}/hermes.framework/hermes"
  if [[ -f "$HERMES_BIN" ]]; then
    HERMES_DSYM="\${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"
    echo "note: Generating Hermes dSYM at $HERMES_DSYM"
    xcrun dsymutil "$HERMES_BIN" -o "$HERMES_DSYM"
  else
    echo "warning: Hermes binary not found at $HERMES_BIN; skipping dSYM generation"
  fi
fi
`;

function hasHermesDsymPhase(project) {
  const phases = project.hash.project.objects.PBXShellScriptBuildPhase ?? {};

  return Object.values(phases).some(
    (phase) =>
      phase &&
      typeof phase === 'object' &&
      typeof phase.name === 'string' &&
      phase.name.includes(PHASE_NAME)
  );
}

function addHermesDsymBuildPhase(project) {
  if (hasHermesDsymPhase(project)) {
    return project;
  }

  const targetUuid = project.getFirstTarget().uuid;

  project.addBuildPhase([], 'PBXShellScriptBuildPhase', PHASE_NAME, targetUuid, {
    shellPath: '/bin/sh',
    shellScript: SHELL_SCRIPT,
  });

  return project;
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = function withHermesDsym(config) {
  return withXcodeProject(config, (config) => {
    config.modResults = addHermesDsymBuildPhase(config.modResults);
    return config;
  });
};

module.exports.addHermesDsymBuildPhase = addHermesDsymBuildPhase;
module.exports.PHASE_NAME = PHASE_NAME;
