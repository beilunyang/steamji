'use strict';

/**
 * wallet service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::wallet.wallet');
