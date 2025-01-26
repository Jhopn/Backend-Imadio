export class PasswordRedefinition{
    email: string; 
}

export class TokenConfirmed{
    userId: string;
    tokenId: string;
    token: string;
}

export class NewPassword{
    userId: string;
    tokenId: string;
    password: string;
}

