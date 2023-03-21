import { Application } from '@nativescript/core';
import * as permissions from 'nativescript-permissions';
export class SimInfo {
    constructor() {
        this.permissionTypes = [];
        this.permissionTypes = this.getPermissionTypes();
        this.apiLevel = android.os.Build.VERSION.SDK_INT;
    }
    getPermissionTypes() {
        if (this.apiLevel <= 22) {
            return [android.Manifest.permission.READ_PHONE_STATE];
        }
        else if (this.apiLevel <= 25) {
            return [android.Manifest.permission.READ_PHONE_STATE, android.Manifest.permission.READ_SMS];
        }
        else {
            return [android.Manifest.permission.READ_PHONE_STATE, android.Manifest.permission.READ_SMS, 'android.permission.READ_PHONE_NUMBERS'];
        }
    }
    hasPermission() {
        let hasPermission = false;
        const isPermissionTypeGranted = (permissionType) => {
            return permissions.hasPermission(permissionType);
        };
        hasPermission = this.permissionTypes.every(isPermissionTypeGranted);
        return hasPermission;
    }
    getData() {
        let getData = Promise.resolve(null);
        if (!this.hasPermission()) {
            getData = permissions.requestPermissions(this.permissionTypes);
        }
        return getData.then(() => {
            const telephonyManager = Application.android.context.getSystemService(android.content.Context.TELEPHONY_SERVICE);
            const telephonyManagerData = this.getDataFromTelephonyManager(telephonyManager);
            if (this.apiLevel >= 22) {
                const subscriptionManager = Application.android.context.getSystemService('telephony_subscription_service');
                const subscriberList = subscriptionManager.getActiveSubscriptionInfoList();
                const subscribersData = this.getDataFromSubscriberList(subscriberList);
                for (let i = 0; i < subscribersData.length; i++) {
                    if (subscribersData[i].phoneNumber === telephonyManagerData.phoneNumber) {
                        subscribersData[i] = Object.assign({}, telephonyManagerData, subscribersData[i], { isDefaultSim: true });
                    }
                }
                return Promise.resolve(subscribersData);
            }
            else {
                return Promise.resolve([telephonyManagerData]);
            }
        }).catch((err) => {
            return Promise.reject(err);
        });
    }
    getDataFromSubscriberList(subscribers) {
        const subscribersData = [];
        const subscribersArray = subscribers.toArray();
        for (let i = 0; i < subscribersArray.length; i++) {
            subscribersData.push(this.getDataFromSubscriber(subscribersArray[i]));
        }
        return subscribersData;
    }
    getDataFromSubscriber(subscriber) {
        let data = {
            isoCountryCode: subscriber.getCountryIso() || '',
            carrierName: subscriber.getCarrierName() || '',
            isNetworkRoaming: subscriber.getDataRoaming() === 1 || null,
            phoneNumber: subscriber.getNumber() || '',
            mcc: subscriber.getMcc() || null,
            mnc: subscriber.getMnc() || null,
            subscriptionId: subscriber.getSubscriptionId() || null,
            simSerialNumber: subscriber.getIccId() || '',
            isDefaultSim: false,
        };
        return data;
    }
    getDataFromTelephonyManager(manager) {
        let data = {
            isoCountryCode: manager.getSimCountryIso() || '',
            simOperator: manager.getSimOperator() || '',
            carrierName: manager.getSimOperatorName() || '',
            callState: manager.getCallState() || null,
            dataActivity: manager.getDataActivity() || null,
            phoneType: manager.getPhoneType() || null,
            simState: manager.getSimState() || null,
            isNetworkRoaming: manager.isNetworkRoaming() || null,
            mcc: '',
            mnc: '',
            phoneNumber: manager.getLine1Number() || '',
            deviceSoftwareVersion: manager.getDeviceSoftwareVersion() || '',
            isDefaultSim: true,
        };
        if (data.simOperator.length >= 3) {
            data = Object.assign({}, data, {
                mcc: data.simOperator.substring(0, 3),
                mnc: data.simOperator.substring(3),
            });
        }
        if (this.apiLevel >= 24) {
            data = Object.assign({}, data, {
                networkType: manager['getDataNetworkType']() || null,
            });
        }
        return data;
    }
}
//# sourceMappingURL=sim-info.android.js.map