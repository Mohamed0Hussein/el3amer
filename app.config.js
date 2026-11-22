// google-services.json is not in git. EAS builds get it from the
// GOOGLE_SERVICES_JSON secret file variable; local builds use the file on disk.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
