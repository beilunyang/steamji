'use strict';

/**
 * server controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::server.server');
