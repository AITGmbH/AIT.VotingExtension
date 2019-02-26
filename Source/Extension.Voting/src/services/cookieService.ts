export class CookieService {
    private cookie: string = "VotingExtension.UserConfirmation=true";

    public setCookie() {
        let expiringDate = new Date();
        expiringDate.setTime(
            expiringDate.getTime() + 365 * 24 * 60 * 60 * 1000
        );
        document.cookie = this.cookie + ";" + "expires=" + expiringDate.toUTCString();

    }

    public isCookieSet() {
        let decodedCookie: string = decodeURIComponent(document.cookie);
        let allCookies: string[] = decodedCookie.split(";");
        for (let i = 0; i < allCookies.length; i++) {
            if (allCookies[i] === this.cookie) {
                return true;
            }
        }
        return false;
    }
}
