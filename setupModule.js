module.exports = {
  name: 'zcWisdom',
  filename: 'remoteEntry.js',
  remotes: {
    zcLowCodeUI: `zcLowCodeUI@${process.env.VUE_APP_lowcodeUI}/zc-lowcode-remoteEntry.js`,
  },
  shared: [
    'vue-router',
    'element-ui',
    'zc-framework-ui',
    {
      vue: {
        singleton: true,
      },
    },
    {
      vant: {
        singleton: true,
      },
    },
  ],
};
