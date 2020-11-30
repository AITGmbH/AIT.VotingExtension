export class CookieService {  
    public static setCookie(cname : string, cvalue: string , maxAgeDays?: number) {
        // VSTS Extensions are not hosted on same domain as visualstudio.com, so we need to allow CORS
        document.cookie = cname + "=" + cvalue + "; max-age="+ maxAgeDays*24*60*60 + "; path=/; SameSite=None; Secure";
    }  

    public static isCookieSet(cname : string, cvalue: string) {

        let decodedCookie: string = decodeURIComponent(document.cookie);
        let allCookies: string[] = decodedCookie.split(";");
        for (let i = 0; i < allCookies.length; i++) {
            if (allCookies[i].trim() === cname + "=" + cvalue) {
                return true;
            }
        }
        return false;
    }
}
