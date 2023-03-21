export class SimInfo {
    getData() {
        const telephonyInfo = TelephonyInfo.alloc();
        const data = JSON.parse(String(telephonyInfo.getData()));
        if (data.length === 0) {
            return Promise.reject('Sim information is unaccessible');
        }
        else {
            return Promise.resolve(data);
        }
    }
}
//# sourceMappingURL=sim-info.ios.js.map