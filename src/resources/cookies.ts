import Cookies from 'js-cookie';

export function getDeviceIDFromCookie(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const DeviceID = Cookies.get('tracekey_device_id');
    if (DeviceID) {
        return DeviceID;
    }
    return null;
}
export function setDeviceIDInCookie(userId: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    Cookies.set('tracekey_device_id', userId, { expires: 365, secure: true, sameSite: 'strict', path: '/' });
}
export function createDeviceID() : string{
    const userId = crypto.randomUUID();
    return userId;
}
