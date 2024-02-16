import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { createRouter } from '@backstage/plugin-permission-backend';
import { AuthorizeResult, PolicyDecision, isPermission } from '@backstage/plugin-permission-common';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { Config } from '@backstage/config';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  catalogEntityDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';

class DefaultPermissionPolicy implements PermissionPolicy {
  config: Config;
  constructor(config: Config) {
    this.config = config;
  }
  async handle(request: PolicyQuery, user: BackstageIdentityResponse): Promise<PolicyDecision> {

    if (request.permission.name === 'catalog.entity.create' && this.config.getBoolean("platform.guest.enabled")) return { result: AuthorizeResult.DENY };
    if (request.permission.name === 'apiManagement.access.read' && !this.config.getBoolean("platform.apiManagement.enabled")) return { result: AuthorizeResult.DENY };
    if (request.permission.name === 'apiManagement.access.read' && this.config.getBoolean("platform.guest.enabled")) return { result: AuthorizeResult.DENY };
    if (request.permission.name === 'admin.access.read'){
      if(this.config.getBoolean("platform.guest.enabled")){
        return { result: AuthorizeResult.DENY }
      }
      if(user){
        if(user.identity.ownershipEntityRefs.includes(`group:default/${this.config.getString("platform.group.user")}`)) return { result: AuthorizeResult.DENY };
      }
    }

    if (isPermission(request.permission, catalogEntityDeletePermission)) {
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: user?.identity.ownershipEntityRefs ?? [],
        }),
      );
    }  
    

    return { result: AuthorizeResult.ALLOW }; 
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new DefaultPermissionPolicy(env.config),
    identity: env.identity,
  });
}
