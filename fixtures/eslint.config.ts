import rhapsodic from './src'

export default rhapsodic(
  {
    vue: {
      a11y: true,
    },
    typescript: true,
  },
  {
    ignores: [
      'fixtures',
      '_fixtures',
      '**/constants-generated.ts',
    ],
  },
)
