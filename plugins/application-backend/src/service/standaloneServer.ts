

import {
  createServiceBuilder, loadBackendConfig, useHotMemoize, ServerTokenManager, SingleHostDiscovery} from '@backstage/backend-common';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
//import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { Server } from 'http';
import knexFactory from 'knex';
import { Logger } from 'winston';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'application-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const tokenManager = ServerTokenManager.fromConfig(config, {logger,});
  const discovery = SingleHostDiscovery.fromConfig(config);
  const permissions = ServerPermissionClient.fromConfig(config, {discovery,tokenManager,});
  const db = useHotMemoize(module, () => {
    const knex = knexFactory({
      client: 'pg',
      connection: {
        user: config.getString('backend.database.connection.user'),
        database: config.getString('backend.database.connection.database'),
        password: config.getString('backend.database.connection.password'),
        port: config.getNumber('backend.database.connection.port'),
        host: config.getString('backend.database.connection.host'),
      },
      // useNullAsDefault: true,
    });

    knex.client.pool.on('createSuccess', (_eventId: any, resource: any) => {
      resource.run('PRAGMA foreign_keys = ON', () => {});
    });

    return knex;
  });

  const router = await createRouter({
    logger,
    database: { getClient: async () => db },
    config: config,
    permissions,
    /*identity: DefaultIdentityClient.create({
      discovery,
      issuer: await discovery.getExternalBaseUrl('auth'),
    }),*/
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/application', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
