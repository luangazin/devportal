import { Config } from '@backstage/config';
import { PluginName, PluginService } from '../services/PluginService';

export class AclPlugin extends PluginService {
  // private static _instance: AclPlugin;
  // private static _config: Config;

  // private constructor(_config: Config) {
  //   super(_config);
  // }

  public async configAclKongService(
    serviceName: string,
    allowedList: Array<string>,
  ) {
    let map: Map<string, any> = new Map<string, any>();
    map.set('hide_groups_header', true);
    map.set('allow', allowedList);

    return this.applyPluginKongService(serviceName, PluginName.ACL, map);
  }

  public async updateAclKongService(
    serviceName: string,
    allowedList: Array<string>,
  ) {
    let map: Map<string, any> = new Map<string, any>();
    map.set('hide_groups_header', true);
    map.set('allow', allowedList);

    return this.applyPluginKongService(serviceName, PluginName.ACL, map);
  }

  public async removeAclKongService(serviceName: string, pluginId: string) {
    this.removePluginKongService(serviceName, pluginId);
  }

  // public static get Instance() {
  //   return this._instance || (this._instance = new this(this._config));
  // }
}
