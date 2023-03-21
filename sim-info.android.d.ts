import { SimData } from './sim-info.common';
export declare class SimInfo {
    permissionTypes: any[];
    apiLevel: number;
    constructor();
    private getPermissionTypes;
    private hasPermission;
    getData(): Promise<SimData[]>;
    private getDataFromSubscriberList;
    private getDataFromSubscriber;
    private getDataFromTelephonyManager;
}
