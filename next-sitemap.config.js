/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://kendalladkins.dev",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  exclude: ["/keystatic", "/keystatic/*", "/api/*"],
};
