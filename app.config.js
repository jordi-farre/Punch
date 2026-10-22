module.exports = ({ config }) => {
  if (!process.env.PUNCH_BUILD_PROFILE) return config;
  return { ...config, extra: { ...config.extra, buildProfile: process.env.PUNCH_BUILD_PROFILE } };
};
