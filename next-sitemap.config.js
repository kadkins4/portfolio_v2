/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://kendalladkins.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  exclude: ["/keystatic", "/keystatic/*", "/api/*"],
};
