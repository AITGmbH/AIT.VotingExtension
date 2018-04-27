///<summary>
/// image of a User
/// not persisted
///</summary>

class User {
    private id: string;
    private email: string;
    private name: string;
    private uniqueName: string;
    private team: string;
    private isAdmin: boolean;

    get Id(): string {
        return this.id;
    }
    set Id(value: string) {
        this.id = value;
    }

    get Email(): string {
        return this.email;
    }
    set Email(value: string) {
        this.email = value;
    }

    get Name(): string {
        return this.name;
    }
    set Name(value: string) {
        this.name = value;
    }

    get UniqueName(): string {
        return this.uniqueName;
    }
    set UniqueName(value: string) {
        this.uniqueName = value;
    }

    get Team(): string {
        return this.team;
    }
    set Team(value: string) {
        this.team = value;
    }

    get IsAdmin(): boolean {
        return this.isAdmin;
    }
    set IsAdmin(value: boolean) {
        this.isAdmin = value;
    }

}
