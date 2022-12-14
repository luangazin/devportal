import axios from 'axios';
import { KongServiceBase } from './KongServiceBase';

export class PluginService extends KongServiceBase {
  public async applyPluginKongService(
    serviceName: string,
    pluginName: string,
    config?: Map<string, string>,
  ) {
    const url = `${this.baseUrl}/services/${serviceName}/plugins`;
    const response = await axios.post(url, {
      service: serviceName,
      name: pluginName,
      config: config,
    });
    return response;
  }

  public async updatePluginKongService(
    serviceName: string,
    pluginName: string,
    config?: Map<string, string>,
  ) {
    const url = `${this.baseUrl}/services/${serviceName}/plugins`;
    const response = await axios.post(url, {
      service: serviceName,
      name: pluginName,
      config: config,
    });
    return response;
  }

  public async findAllPluginKongService(
    serviceName: string,
  ) {
    const url = `${this.baseUrl}/services/${serviceName}/plugins`;
    const response = await axios.get(url);
    return response;
  }




}
