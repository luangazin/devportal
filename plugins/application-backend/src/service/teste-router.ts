import { Router } from "express";
import { RouterOptions } from "./router";
import { PostgresPartnerRepository } from "../modules/partners/repositories/Knex/KnexPartnerReppository";
import { AclPlugin } from "../modules/kong/plugins/AclPlugin";
import { KeyAuthPlugin } from "../modules/kong/plugins/KeyAuthPlugin";

import { Oauth2Plugin } from "../modules/kong/plugins/Oauth2Plugin";
import { CredentialsOauth } from "../modules/kong/services/CredentialsOauth";


/** @public */
export async function testeRoute(
  options: RouterOptions,
): Promise<Router> {
  const partnerRepository = await PostgresPartnerRepository.create(
    await options.database.getClient(),
  );
  const router = Router();
  const credentialsOauth = new CredentialsOauth();
  const aclPlugin = AclPlugin.Instance;
  const keyAuthPlugin = KeyAuthPlugin.Instance;
  const oauth = Oauth2Plugin.Instance;


  // KEY-AUTH
  router.post('/key-auth/:serviceName', async (request, response) => {
    const keyNamesList: string[] = request.body.keyNamesList;
    const teste = await keyAuthPlugin.configKeyAuthKongService(request.params.serviceName, keyNamesList )
    response.status(200).json({ status: 'ok', return: teste });
  });

  router.delete('/key-auth/:serviceName', async (request, response) => {
    const pluginId = request.query.pluginId as string;
    keyAuthPlugin.removeKeyAuthKongService(request.params.serviceName, pluginId);
    response.status(204).json({status: 'ok'})
  });

  router.patch(
    '/kong-service/plugin/keyauth/:serviceName/:pluginId',
    async (request, response) => {
      try {
        const serviceStore = await keyAuthPlugin.updateKeyAuthKongService(
          request.params.serviceName,
          request.params.pluginId,
          request.body.config.key_names,
        );
          response.json({ status: 'ok', plugins: serviceStore });
      } catch (error: any) {
        let date = new Date();
        console.log(error);
        response.status(error.response.status).json({
          status: 'ERROR',
          message: error.response.data.message,
          timestamp: new Date(date).toISOString(),
        });
      }
    },
  );

  // OAUTH2 
  router.post('/oauth/:serviceName', async (request, response) => {
       const teste = await oauth.configureOauth(request.params.serviceName);
        response.json({status: 'ok', response: teste})
  });

  router.delete('/oauth/:serviceName', async (request, response) =>{
    const pluginId = request.query.pluginId as string;
    const teste = oauth.removeOauth(request.params.serviceName,pluginId )
    response.status(204).json({status: 'ok', response: teste})
  })

  // CREDENTIALS_OAUTH2
  router.post('/credentials-oauth2/:idConsumer', async (request, response) => {
    const id = request.params.idConsumer as string
    const name = request.query.name as string;
    const credential = await credentialsOauth.generateCredentials(id, name)

    response.status(201).json({status: 'ok', response: credential})
  });

  router.get('/credentials-oauth2/:idConsumer', async (request, response) => {
    const id = request.params.idConsumer as string
    const credential = await credentialsOauth.findAllCredentials(id)
    
    response.json({status: 'ok', response: credential})
  });
  router.delete('/credentials-oauth2/:idConsumer', async (request, response) => {
    const id = request.params.idConsumer as string
    const idCredential = request.query.idCredential as string;
    const teste = await credentialsOauth.deleteCredentialById(id, idCredential)
    
    response.status(204).json({status: 'ok', response: teste})
  });




  // ACL
  router.post('/acl/:serviceName', async (request, response) => {
    const allowedList: string[] = request.body.allowedList
    const teste = aclPlugin.configAclKongService(request.params.serviceName, allowedList)
    response.json({status: 'ok', return: teste})
  })









  return router;
}