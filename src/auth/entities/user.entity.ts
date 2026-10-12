export class User {
    id: string | undefined;
    role_id: string | undefined;
    name: string | undefined;
    email: string | undefined;
    passwordHash: string | undefined;
    passwordSalt: string | undefined;
    phone: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    deletedAt: Date | undefined;
}