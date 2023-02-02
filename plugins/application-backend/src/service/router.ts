import {
  PluginDatabaseManager,
  errorHandler,
  loadBackendConfig,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

import { PostgresApplicationRepository } from '../modules/applications/repositories/knex/KnexApplicationRepository';

import { TestGroups } from '../modules/keycloak/adminClient';
import { AssociateService } from '../modules/kong-control/AssociateService';

import { Consumer } from '../modules/kong-control/model/Consumer';
import { ConsumerGroup } from '../modules/kong/model/ConsumerGroup';
import { AclPlugin } from '../modules/kong/plugins/AclPlugin';

import { RateLimitingPlugin } from '../modules/kong/plugins/RateLimitingPlugin';
import { ConsumerGroupService } from '../modules/kong/services/ConsumerGroupService';
import { ConsumerService } from '../modules/kong/services/ConsumerService';
import { PluginService } from '../modules/kong/services/PluginService';
import { UserInvite } from '../modules/okta-control/model/UserInvite';
import { UserService } from '../modules/okta-control/service/UserService';

import { KeycloakUserService } from '../modules/keycloak/service/UserService';
import { UpdateUserDto, UserDto } from '../modules/keycloak/dtos/UserDto';


import { PluginDto } from '../modules/plugins/dtos/PluginDto';
import { PostgresPluginRepository } from '../modules/plugins/repositories/Knex/KnexPluginRepository';
import { ControllPlugin } from '../modules/services/service/ControllPlugin';
import { createServiceRouter } from './service-route';
import { createPartnersRouter } from './partners-route';
import { createKongRouter } from './kong-extras-route';
import { createApplicationRouter } from './applications-route';

import { applyDatabaseMigrations } from '../../database/migrations';
import { testeRoute } from './teste-router';

/** @public */
export interface RouterOptions {
  logger: Logger;
  database: PluginDatabaseManager;
  config: Config;
}
export interface Service {
  name: string;
  description?: string;
}


/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database } = options;

  const pluginRepository = await PostgresPluginRepository.create(
    await database.getClient(),
  );

  await applyDatabaseMigrations(await database.getClient());

  const config = await loadBackendConfig({ logger, argv: process.argv });
  const adminClientKeycloak = new TestGroups();
  const userServiceKeycloak = new KeycloakUserService();


  const controllPlugin = new ControllPlugin();
  const consumerGroupService = new ConsumerGroupService();
  const pluginService = new PluginService();
  const aclPlugin = AclPlugin.Instance;


  logger.info('Initializing application backend');

  const router = Router();
  router.use(express.json());
  router.use('/services', await createServiceRouter(options))
  router.use('/partners', await createPartnersRouter(options))
  router.use('/kong-extras', await createKongRouter(options))
  router.use('/applications', await createApplicationRouter(options))
  router.use('/teste', await testeRoute(options))

  // KEYCLOAK
  router.get('/keycloak/groups', async (_, response) => {
    const groups = await adminClientKeycloak.getGroup();
    response.status(200).json({ status: 'ok', groups: groups });
  });

  router.post('/consumer_groups', async (request, response) => {
    try {
      const consumerGroup: ConsumerGroup = request.body;
      const result = await consumerGroupService.createConsumerGroup(
        consumerGroup,
      );
      response.status(201).json({ status: 'ok', service: result });
    } catch (error: any) {
      console.log(error);
      let date = new Date();
      response.status(error.response.status).json({
        status: 'ERROR',
        message: error.response.data.errorSummary,
        timestamp: new Date(date).toISOString(),
      });
    }
  });


  router.put('/remove-plugin/:idService', async (request, response) => {
    const teste = controllPlugin.removePlugin(
      options,
      request.params.idService as string,
    );
    response.status(404).json(teste);
  });

  router.get('/consumer_groups', async (_, response) => {
    try {
      const consumerGroups = await consumerGroupService.listConsumerGroups();
      response.status(200).json({ status: 'ok', groups: { consumerGroups } });
    } catch (error: any) {
      response.status(error.status).json({
        message: error.message,
        timestamp: error.timestamp,
      });
    }
  });

  router.post('/keycloak/users', async (request, response) => {
    const user: UserDto = request.body.user;
    const id = await userServiceKeycloak.createUser(user);
    response.status(201).json({ status: 'ok', id: id });
  });

  router.get('/keycloak/users', async (_, response) => {
    const users = await userServiceKeycloak.listUsers();
    response.status(200).json({ status: 'ok', users: users });
  });

  router.get('/keycloak/users/:id', async (request, response) => {
    const user_id = request.params.id;
    const user = await userServiceKeycloak.findUser(user_id);
    response.status(200).json({ status: 'ok', users: user });
  });

  router.put('/keycloak/users/:id', async (request, response) => {
    const code = request.params.id;
    const user: UpdateUserDto = request.body.user;
    await userServiceKeycloak.updateUser(code, user);
    response.status(200).json({ status: 'User Updated!' });
  });

  router.delete('/keycloak/users/:id', async (request, response) => {
    const user_id = request.params.id;
    await userServiceKeycloak.deleteUser(user_id);
    response.status(204).json({ status: 'User Deleted!' });
  });

  router.put(
    '/keycloak/users/:id/groups/:groupId',
    async (request, response) => {
      const user_id = request.params.id;
      const groupId = request.params.groupId;
      const add = await userServiceKeycloak.addUserToGroup(user_id, groupId);
      response.status(200).json({ status: 'User added to group!', add: add });
    },
  );

  router.delete(
    '/keycloak/users/:id/groups/:groupId',
    async (request, response) => {
      const user_id = request.params.id;
      const groupId = request.params.groupId;
      const res = await userServiceKeycloak.removeUserFromGroup(
        user_id,
        groupId,
      );
      response
        .status(204)
        .json({ status: 'User Removed From Group!', res: res });
    },
  );

  router.get('/keycloak/users/:id/groups', async (request, response) => {
    const user_id = request.params.id;
    const groups = await userServiceKeycloak.listUserGroups(user_id);
    response.status(200).json({ status: 'ok', groups: groups });
  });

  // PLUGINS
  router.get('/plugins', async (_, response) => {
    const plugins = await pluginRepository.getPlugins();
    response.status(200).json({ status: 'ok', plugins: plugins });
  });

  router.get('/plugin/:id', async (request, response) => {
    const pluginId = request.params.id;
    const plugin = await pluginRepository.getPluginById(pluginId);
    response.status(200).json({ status: 'ok', plugin: plugin });
  });

  router.post('/plugin', async (request, response) => {
    const plugin: PluginDto = request.body.plugin;
    const res = await pluginRepository.createPlugin(plugin);
    response.status(201).json({ status: 'ok', plugin: res });
  });

  router.patch('/plugin/:id', async (request, response) => {
    const pluginId = request.params.id;
    const plugin: PluginDto = request.body.plugin;
    const res = await pluginRepository.patchPlugin(pluginId, plugin);
    response.status(200).json({ status: 'ok', plugin: res });
  });

  router.delete('/plugin/:id', async (request, response) => {
    const pluginId = request.params.id;
    const res = await pluginRepository.deletePlugin(pluginId);
    response.status(204).json({ status: 'ok', plugin: res });
  });
 


  // RATE LIMITING - TEST ROUTER1
 
  //consumerGroup
  router.post('/consumer_groups', async (request, response) => {
    try {
      const consumerGroup: ConsumerGroup = request.body;
      const result = await consumerGroupService.createConsumerGroup(
        consumerGroup,
      );
      response.status(201).json({ status: 'ok', service: result });
    } catch (error: any) {
      let date = new Date();
      response.status(error.response.status).json({
        status: 'ERROR',
        message: error.response.data.errorSummary,
        timestamp: new Date(date).toISOString(),
      });
    }
  });

  router.post('/consumer_groups/:id/consumers', async (request, response) => {
    try {
      const consumerGroup = request.body;
      const result = await consumerGroupService.addConsumerToGroup(
        request.params.id,
        consumerGroup,
      );
      response.status(201).json({ status: 'ok', service: result });
    } catch (error: any) {
      let date = new Date();
      response.status(error.response.status).json({
        status: 'ERROR',
        message: error.response.data.errorSummary,
        timestamp: new Date(date).toISOString(),
      });
    }
  });

  router.delete('/consumer_groups/:id', async (request, response) => {
    try {
      const consumerGroup = await consumerGroupService.deleteConsumerGroup(
        request.params.id,
      );
      response.status(204).json({ status: 'ok', group: { consumerGroup } });
    } catch (error: any) {
      let date = new Date();
      response.status(error.response.status).json({
        status: 'ERROR',
        message: error.response.data.errorSummary,
        timestamp: new Date(date).toISOString(),
      });
    }
  });

  router.delete(
    '/consumers/:consumerId/consumer_groups/:groupId',
    async (request, response) => {
      try {
        const consumerGroup =
          await consumerGroupService.removeConsumerFromGroup(
            request.params.consumerId,
            request.params.groupId,
          );
        response.status(204).json({ status: 'ok', group: { consumerGroup } });
      } catch (error: any) {
        let date = new Date();
        response.status(error.response.status).json({
          status: 'ERROR',
          message: error.response.data.errorSummary,
          timestamp: new Date(date).toISOString(),
        });
      }
    },
  );
  // remove consumer from all
  router.delete('/consumers/:id/consumer_groups', async (request, response) => {
    try {
      const consumerGroup = await consumerGroupService.removeConsumerFromGroups(
        request.params.id,
      );
      response.status(204).json({ status: 'ok', group: { consumerGroup } });
    } catch (error: any) {
      let date = new Date();
      response.status(error.response.status).json({
        status: 'ERROR',
        message: error.response.data.errorSummary,
        timestamp: new Date(date).toISOString(),
      });
    }
  });

  router.use(errorHandler());
  return router;
}
