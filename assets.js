module.asset = {
  jpg: {
    moon: require('./src/test/assets/moon.jpg'),
    nested_assets_1: {
      moon: require('./src/test/assets/nested_assets_1/moon.jpg'),
      sun: require('./src/test/assets/nested_assets_1/sun.jpg')
    },
    nested_assets_2: {
      moon: require('./src/test/assets/nested_assets_2/moon.jpg'),
      nested_assets: {
        moon: require('./src/test/assets/nested_assets_2/nested_assets/moon.jpg'),
        sun: require('./src/test/assets/nested_assets_2/nested_assets/sun.jpg')
      },
      sun: require('./src/test/assets/nested_assets_2/sun.jpg')
    },
    sun: require('./src/test/assets/sun.jpg')
  }
}
