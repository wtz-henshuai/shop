const productPlugins = []
if (process.env.NODE_ENV === 'production') {
  productPlugins.push('transform-remove-console')
}
module.exports = {
  'presets': [
    '@vue/app'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    ...productPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}