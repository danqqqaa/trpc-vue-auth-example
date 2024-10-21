import { registerSchema } from "../../../../../packages/z/auth";



export class AuthService {
    async register(opts) {
        return {id: 1};
    }
}

export const authService = new AuthService();
