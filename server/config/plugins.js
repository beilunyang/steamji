module.exports = ({ env }) => ({
  documentation: true,
  "strapi-auth": {
    enabled: true,
    resolve: "./src/plugins/strapi-auth",
  },
});
