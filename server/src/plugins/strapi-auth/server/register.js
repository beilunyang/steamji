'use strict';

module.exports = ({ strapi }) => {
  if (!strapi.contentType('plugin::users-permissions.user').attributes['wx_openid']) {
    strapi.contentType('plugin::users-permissions.user').attributes['wx_openid'] = {
      type: 'string',
    }
  }
  if (!strapi.contentType('plugin::users-permissions.user').attributes['qq_openid']) {
    strapi.contentType('plugin::users-permissions.user').attributes['qq_openid'] = {
      type: 'string',
    }
  }
  if (!strapi.contentType('plugin::users-permissions.user').attributes['avatar']) {
    strapi.contentType('plugin::users-permissions.user').attributes['avatar'] = {
      type: 'string',
    }
  }
};
