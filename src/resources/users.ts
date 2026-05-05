import type { TracekeyClient } from '../client';
import type { ListUsersParams, User } from '../types';
import {UaHighEntropyValues,DeviceInfo} from '../types';

/**
 * Handles operations related to users.
 * Example of how to define a resource grouped by its endpoint (e.g., /users)
 */
export class UserResource {
  private client: TracekeyClient;
  private heartBeatTimer: ReturnType<typeof setInterval> | null = null;
  private pageHideHandler: ((event: PageTransitionEvent) => void) | null = null;
  // The client passes a reference of itself to the resource, meaning all requests
  // use the same API key and base configuration.
  constructor(client: TracekeyClient) {
    this.client = client;
  }
  /**
   * Log a new event for the client
   * @param actionName - The name of the action to log
   */
  public async LogEvent(actionName: string): Promise<void> {
    const deviceInfo : DeviceInfo = await this.getClientAdditionalInfo();
    const requestBody = {
        api_key : this.client.apiKey,
        device_id : this.client.deviceID,
        page_route : this.client.pageRoute,
        event_name : actionName,
        additionalDeviceInfo : deviceInfo
    }
    await this.client.request(`api/v1/events`, {
        method: 'POST',
        body: requestBody

    })
  }
  public async startHeartBeatSession(): Promise<void> {
    if (this.heartBeatTimer) {
      return;
    }

    this.pageHideHandler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        return;
      }

      if (this.heartBeatTimer) {
        clearInterval(this.heartBeatTimer);
        this.heartBeatTimer = null;
      }

      void this.LogEvent('user_exit').catch((error) => {
        console.warn('Failed to log user_exit event:', error);
      });
    };

    window.addEventListener('pagehide', this.pageHideHandler);

    this.heartBeatTimer = setInterval(() => {
      void this.LogEvent('heartbeat').catch((error) => {
        console.warn('Failed to log heartbeat event:', error);
      });
    }, 60_000);
  }

  public async getClientAdditionalInfo() : Promise<DeviceInfo> {
    let deviceInfo: DeviceInfo = {};
    try{
        if((navigator as any).userAgentData){
            const uaData = (navigator as any).userAgentData as UaHighEntropyValues;
            const primaryBrand = uaData.brands.find(b => b.brand !== "Not;A=Brand");
            deviceInfo = {
                brand: primaryBrand?.brand,
                model: uaData.model,
                platform: uaData.platform,
                platformVersion: uaData.platformVersion,
            };
        }else{
            return {}
        }
    }catch(error){
        // If any error occurs while accessing userAgentData, we can choose to log it or ignore it. For now, we'll just ignore it and return an empty device info object.
        console.warn('Error accessing userAgentData:', error);
        return {};
    }
    return deviceInfo;
  }

}
