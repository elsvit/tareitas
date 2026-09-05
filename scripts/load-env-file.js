const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath, projectRoot = path.resolve(__dirname, '..')) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      loaded: false,
      resolvedPath,
      keys: [],
    };
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const keys = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
    keys.push(key);
  }

  return {
    loaded: true,
    resolvedPath,
    keys,
  };
}

module.exports = {
  loadEnvFile,
};
