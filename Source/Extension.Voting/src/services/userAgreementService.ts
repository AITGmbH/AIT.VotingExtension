import { CookieService } from "./cookieService";

export class UserAgreementService {
    private static cname: string = "VotingExtension.UserConfirmation";
    private static cvalue: string = "true";

    public acceptUserAgreement() {  
        CookieService.setCookie(UserAgreementService.cname, UserAgreementService.cvalue, 365) 
    }

    public isUserAgreementAccepted() {
        return CookieService.isCookieSet(UserAgreementService.cname, UserAgreementService.cvalue);       
    }
}