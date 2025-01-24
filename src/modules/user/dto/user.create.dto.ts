enum Role{
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export class userCreateDto{
    email: string;
    name: string;
    password: string;
    role: Role;
}
