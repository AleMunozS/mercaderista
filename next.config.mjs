// next.config.mjs

import withLess from 'next-with-less';

export default withLess({
  reactStrictMode: true,
  lessLoaderOptions: {
    lessOptions: {
      modifyVars: {
        // Aquí puedes sobrescribir variables de Ant Design, si lo necesitas
      },
      javascriptEnabled: true,
    },
  },
  webpack(config) {
    return config;
  },
});
