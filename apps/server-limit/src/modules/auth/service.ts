import { registerSchemaType, loginSchemaType } from "z-limit";
import { db, user, eq } from "db-limit";
import { jwtConfig } from "../../config";
// import { TRPCError } from "@trpc/server";
import { SignJWT, importPKCS8, importSPKI, jwtVerify } from "jose";

export class AuthService {
  public async register(dto: registerSchemaType) {
    await db.transaction(async (tx) => {
      try {
        const [tempUser] = await tx
          .select()
          .from(user)
          .where(eq(user.name, dto.name));

        // if (tempUser.length > 0) {
        //   throw new TRPCError({code: "BAD_REQUEST", message: "Пользователь с таким именем уже существует"});
        // }

        // const newUser = await tx.insert(user).values(dto).returning();
        // console.log(tempUser);
        const test = await this.generateToken(tempUser.id);
        console.log(test);
        this.verifyRefresh(test.refresh);
        return this.generateToken(tempUser.id);
      } catch (error) {
        console.log(error);
        tx.rollback();
      }
    });
  }

  public async login(dto: loginSchemaType) {}

  public async generateToken(userId: number) {
    const refresh = await this.signRefresh(userId);
    const access = await this.signAccess(userId);

    return { refresh, access };
  }

  public async signRefresh(userId: number) {
    const secret = await importPKCS8(
      this.refreshPrivateKey,
      jwtConfig.algorithm
    );

    return new SignJWT()
      .setProtectedHeader({ alg: jwtConfig.algorithm })
      .setSubject(userId.toString())
      .setIssuedAt()
      .setExpirationTime(jwtConfig.refreshExpiresTime)
      .sign(secret);
  }
  public async signAccess(userId: number) {
    const secret = await importPKCS8(
      this.accessPrivateKey,
      jwtConfig.algorithm
    );

    return new SignJWT()
      .setProtectedHeader({ alg: jwtConfig.algorithm })
      .setSubject(userId.toString())
      .setIssuedAt()
      .setExpirationTime(jwtConfig.accessExpiresTime)
      .sign(secret);
  }

  public async verifyRefresh(refresh: string) {
    
    const spki =  await importSPKI(
      this.refreshPublicKey, 
      jwtConfig.algorithm
    )
    const verified = await jwtVerify(refresh, spki, {
      algorithms: [jwtConfig.algorithm],
    });
    
    console.log(verified);
    
  }



  public async verifyAccess(access: string) {
    

    
    const spki =  await importSPKI(
      this.accessPublicKey, 
      jwtConfig.algorithm
    )

    const verified = await jwtVerify(access, spki, {
      algorithms: [jwtConfig.algorithm],
    });

    console.log(verified);
    
  }

  private get refreshPrivateKey() {
    return `-----BEGIN PRIVATE KEY-----\n${jwtConfig.refreshPrivateKey}\n-----END PRIVATE KEY-----`;
  }

  private get refreshPublicKey() {
    return `-----BEGIN PUBLIC KEY-----\n${jwtConfig.refreshPublicKey}\n-----END PUBLIC KEY-----`;
  }

  private get accessPrivateKey() {
    return `-----BEGIN PRIVATE KEY-----\n${jwtConfig.accessPrivateKey}-----END PRIVATE KEY-----`;
  }

  private get accessPublicKey() {
    return `-----BEGIN PUBLIC KEY-----\n${jwtConfig.accessPublicKey}\n-----END PUBLIC KEY-----`;
  }
}

export const authService = new AuthService();
