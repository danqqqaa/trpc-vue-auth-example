import { registerSchemaType, loginSchemaType } from "z-limit";
import { db, eq, user, userCredentials } from "db-limit";
import { jwtConfig } from "../../config";
// import { TRPCError } from "@trpc/server";
import {
  SignJWT,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importPKCS8,
  importSPKI,
  jwtVerify,
} from "jose";
import { TRPCError } from "@trpc/server";
import { hashSync, compareSync } from "bcryptjs";

export class AuthService {
  public async register(dto: registerSchemaType) {
    await db.transaction(async (tx) => {
      try {
        const [insertedUser] = await tx
          .insert(user)
          .values({
            login: dto.login,
          })
          .returning();

        const insertedUserCredentials = await tx
          .insert(userCredentials)
          .values({
            user_id: insertedUser.id,
            payload: hashSync(dto.password),
          })
          .returning();

        console.log(insertedUserCredentials);
      } catch (error) {
        console.log(error);
        tx.rollback();
      }
    });
  }

  public async login(dto: loginSchemaType) {
    const [loggedUser] = await db
      .select()
      .from(user)
      .where(eq(user.login, dto.login));

    if (!loggedUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Пользователь не найден",
      });
    }

    const [userCred] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.user_id, loggedUser.id));

    const isValidPass = compareSync(dto.password, userCred.payload);

    if (!isValidPass) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Пароль не подходит",
      });
    }

    return this.generateToken(loggedUser.id);
  }

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
      .setExpirationTime(jwtConfig.accessExpiresTime)
      .sign(secret);
  }

  public async verifyRefresh(refresh: string) {
    const spki = await importSPKI(this.refreshPublicKey, jwtConfig.algorithm);

    const verified = await jwtVerify(refresh, spki, {
      algorithms: [jwtConfig.algorithm],
    });

    return verified.payload;
  }

  public async verifyAccess(access: string) {
    const spki = await importSPKI(this.accessPublicKey, jwtConfig.algorithm);
    const verified = await jwtVerify(access, spki, {
      algorithms: [jwtConfig.algorithm],
    });

    return verified.payload;
  }

  public async refreshTokens(refresh: string) {
    const getExpiresTime = (exp: number) => {
      return exp * 1000 - Date.now();
    };
    // cделать отправку невалидных токенов в redis
    const decodedRefresh = await this.verifyRefresh(refresh);

    if (getExpiresTime(decodedRefresh.exp!) < 0) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Refresh token expired",
      });
    }

    return this.generateToken(+decodedRefresh.sub!);
  }

  // @ts-ignore
  private async generateKeys() {
    const { publicAccess, privateAccess } = await this.generateAccessKeys();
    const { publicRefresh, privateRefresh } = await this.generateRefreshKeys();

    return { publicAccess, privateAccess, publicRefresh, privateRefresh };
  }

  private async generateAccessKeys() {
    const { publicKey, privateKey } = await generateKeyPair(
      jwtConfig.algorithm
    );
    const publicAccess = await exportSPKI(publicKey);
    const privateAccess = await exportPKCS8(privateKey);

    return { publicAccess, privateAccess };
  }

  private async generateRefreshKeys() {
    const { publicKey, privateKey } = await generateKeyPair(
      jwtConfig.algorithm
    );

    const publicRefresh = await exportSPKI(publicKey);
    const privateRefresh = await exportPKCS8(privateKey);

    return { publicRefresh, privateRefresh };
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
