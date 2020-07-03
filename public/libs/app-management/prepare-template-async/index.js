const path = require('path');
const xmlParser = require('fast-xml-parser');
const { fork } = require('child_process');
const { app } = require('electron');

const customizedFetch = require('../../customized-fetch');
const sendToAllWindows = require('../../send-to-all-windows');
const { getPreference, getPreferences } = require('../../preferences');

// force re-extract for first installation after launch
global.forceExtract = true;

// use in-house API
// to avoid using GitHub API as it has rate limit (60 requests per hour)
// to avoid bugs with instead of https://github.com/atomery/juli/releases.atom
// https://github.com/atomery/webcatalog/issues/890
const getTagNameAsync = () => {
  const allowPrerelease = getPreference('allowPrerelease');
  // prerelease is not supported by in-house API
  if (allowPrerelease) {
    return customizedFetch('https://github.com/atomery/juli/releases.atom')
      .then((res) => res.text())
      .then((xmlData) => {
        const releases = xmlParser.parse(xmlData).feed.entry;

        // just return the first one
        const tagName = releases[0].id.split('/').pop();
        return tagName;
      });
  }

  return customizedFetch('https://juli.webcatalogapp.com/releases/latest.json')
    .then((res) => res.json())
    .then((data) => `v${data.version}`);
};

const downloadExtractTemplateAsync = (tagName) => new Promise((resolve, reject) => {
  let latestTemplateVersion = '0.0.0';
  const scriptPath = path.join(__dirname, 'forked-script.js');

  const {
    proxyPacScript,
    proxyRules,
    proxyType,
  } = getPreferences();

  const child = fork(scriptPath, [
    '--appVersion',
    app.getVersion(),
    '--templatePath',
    path.join(app.getPath('userData'), 'webcatalog-template'),
    '--templateZipPath',
    path.join(app.getPath('userData'), 'webcatalog-template.zip'),
    '--platform',
    process.platform,
    '--arch',
    process.arch,
    '--tagName',
    tagName,
  ], {
    env: {
      ELECTRON_RUN_AS_NODE: 'true',
      ELECTRON_NO_ASAR: 'true',
      APPDATA: app.getPath('appData'),
      PROXY_PAC_SCRIPT: proxyPacScript,
      PROXY_RULES: proxyRules,
      PROXY_TYPE: proxyType,
      FORCE_EXTRACT: Boolean(global.forceExtract).toString(),
    },
  });

  let err = null;
  child.on('message', (message) => {
    if (message && message.versionInfo) {
      latestTemplateVersion = message.versionInfo.version;
    } else if (message && message.progress) {
      sendToAllWindows('update-installation-progress', message.progress);
    } else if (message && message.error) {
      err = new Error(message.error.message);
      err.stack = message.error.stack;
      err.name = message.error.name;
    } else {
      console.log(message); // eslint-disable-line no-console
    }
  });

  child.on('exit', (code) => {
    if (code === 1) {
      reject(err || new Error('Forked script failed to run correctly.'));
      return;
    }

    // // extracting template code successful so need to re-extract next time
    global.forceExtract = false;

    resolve(latestTemplateVersion);
  });
});

const prepareTemplateAsync = () => getTagNameAsync()
  .then((tagName) => downloadExtractTemplateAsync(tagName));

module.exports = prepareTemplateAsync;
