import { registerSchemaType, loginSchemaType } from "z-limit";
import { db } from "db-limit";
import { jwtConfig } from "../../config";
// import * as jose from 'jose'

export class AuthService {
  async register(dto: registerSchemaType) {
    await db.transaction(async (tx) => {
      try {
        // const [regUser] = await tx
        //   .insert(user)
        //   .values({ name: dto.name, password: dto.password })
        //   .returning();
        // return this.generateToken(regUser.id);
        // console.log(jose);
        
        console.log(jwtConfig.algorithm);
        

      } catch (error) {
        console.log(error);
        tx.rollback();
      }
    });
  }

  async login(dto: loginSchemaType) {
    
  }

  async generateToken(userId: number) {
    const refresh = await this.signRefresh(userId);
    const access = await this.signAccess(userId);
    return { refresh, access };
  }

  async signRefresh(userId: number) {}
  async signAccess(userId: number) {}
}

export const authService = new AuthService();
