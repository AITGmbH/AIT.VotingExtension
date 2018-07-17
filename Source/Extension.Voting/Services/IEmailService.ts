interface IEmailService {
    sendEmail(recipients: string[], subject: string, body: string): Promise<boolean>;
}