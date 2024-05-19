module.exports = {
  purge: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './*.html',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none'
          }
        }
      },
      colors: {
        brand: {
          light: 'rgb(104, 109, 224)',
          dark: 'rgb(72, 52, 212)'
        },
      },
      gridTemplateColumns: {
        layout: '1fr 250px 100ch 1fr'
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
}