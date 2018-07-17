class EmailService implements IEmailService {
    sendEmail(recipients: string[], subject: string, body: string): Promise<boolean> {
        return new Promise(() => { return true; });
    }
}