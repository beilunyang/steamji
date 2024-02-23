'use strict';

/**
 * server service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::server.server');
