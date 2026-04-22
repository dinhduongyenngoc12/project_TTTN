// next.config.mjs
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/Login',
        permanent: false,
      },
    ]
  },
}

export default nextConfig