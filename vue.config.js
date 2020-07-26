module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          target: "portable"
        }
      }
    }
  },
  chainWebpack: config => {
    config.module.rule('eslint').use('eslint-loader').options({
      fix: true
    })
  }
};
