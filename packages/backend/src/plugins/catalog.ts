import { GithubEntityProvider } from '@backstage/plugin-catalog-backend-module-github';
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { ScaffolderEntitiesProcessor } from '@veecode-platform/plugin-scaffolder-backend';
// Bitbucket Cloud
import { BitbucketCloudEntityProvider } from '@backstage/plugin-catalog-backend-module-bitbucket-cloud';
// Bitbucket Server
import { BitbucketServerEntityProvider } from '@backstage/plugin-catalog-backend-module-bitbucket-server';
// Gitlab
import { GitlabFillerProcessor } from '@immobiliarelabs/backstage-plugin-gitlab-backend';
import { GitlabDiscoveryEntityProvider } from '@backstage/plugin-catalog-backend-module-gitlab';
// Keycloak Orgs
import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';
import { ClusterEntitiesProcessor, EnvironmentEntitiesProcessor } from '@veecode-platform/plugin-veecode-platform-common';


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addEntityProvider(
    GithubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      scheduler: env.scheduler,
      /* schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 10 },
        timeout: { minutes: 3 },
      }),*/
    }),
  );

  builder.addEntityProvider(
    BitbucketCloudEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      scheduler: env.scheduler,
      /* schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 10 },
        timeout: { minutes: 3 },
      }),*/
    }),
  )

  builder.addEntityProvider(
    BitbucketServerEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      scheduler: env.scheduler,
      /* schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 10 },
        timeout: { minutes: 3 },
      }),*/
    }),
  )

  // gitlab provider
  if (env.config.getBoolean("enabledPlugins.gitlabPlugin")) {
    builder.addEntityProvider(
      ...GitlabDiscoveryEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        scheduler: env.scheduler,
        /* schedule: env.scheduler.createScheduledTaskRunner({
          frequency: { minutes: 10 },
          timeout: { minutes: 3 },
        }),*/      
      }),
    );
    builder.addProcessor(new GitlabFillerProcessor(env.config));
  }

  // keycloak
  if (env.config.getBoolean("enabledPlugins.keycloak")) {
  builder.addEntityProvider(
    KeycloakOrgEntityProvider.fromConfig(env.config, {
      id: 'development',
      logger: env.logger,
      scheduler: env.scheduler,
      /* schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 10 },
        timeout: { minutes: 1 },
      }),*/
    }),
  );
  }

  builder.addProcessor( new ClusterEntitiesProcessor());
  builder.addProcessor( new EnvironmentEntitiesProcessor());

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
