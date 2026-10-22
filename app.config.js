module.exports = ({ config }) => {
  const profile = process.env.PUNCH_BUILD_PROFILE;
  if (!profile) return config;
  const extra = { ...config.extra, buildProfile: profile };
  if (profile !== 'preview') return { ...config, extra };
  return {
    ...config,
    name: 'Punch Preview',
    scheme: 'punch-preview',
    android: { ...config.android, package: 'com.jordifr.punch.preview' },
    extra,
  };
};
