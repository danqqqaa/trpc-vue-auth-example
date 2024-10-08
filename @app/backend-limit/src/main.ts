import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    cors: true,
    // httpsOptions: {
    //   key: readFileSync('/var/opt/gazelle/secrets/private-key.pem'),
    //   cert: readFileSync('/var/opt/gazelle/secrets/public-certificate.pem'),
    //   passphrase: 'taxi.mmk.ru'
    // },
  });

  admin.initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: 'gazelle-a2c74',
      private_key_id: 'cc50960018c9c058faf2be5d37a750d2b7a6c90f',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCqnDpXg5YGpjfW\nO80ucfDkO2mYCRCiBo+yHhq4WlUXWTg+Cm2fqbpZC90+IHnxA2SsE/gbfF/uvV8+\nMfwYTmmRCw4HOLoCu5jKuAfuDyeRRyRUgBpfcgAyKYxp/8ZycHkwYt61xo+zEJSz\njYETW4rg0YctB2yIH9rVZlhzatMgh+UMlwYJKmq47xgYwpm8/AUX+mCviNIUqVW/\nrz1v4a/0ITNdya/xOzn9sPcXxVbnT4kn0CLx2FAHs0NUf5h8RqPkrKHkXEEb1Biw\ntOfJRw+8dpJOIFcFM8XsG0ZjPHW1eRA3FEfYd4ov2OP4ubiivpid1ZfPg5qX39DN\ngO1o3cZTAgMBAAECggEARSw1fWEFFWoULoCtlpys4iRykiluvHqzjTCmfcNmR6Kt\nan4Y50jOHKdySuuo9T5+dURdbmt1i9rtAE8M2qAELkIQrH3j8RK1hs+pq2wqiz0Q\nblBIIRWcHbp5y0pgX+rZP/R+Pq4keiIJYGlJgZs2iiN5zph5eRGNTMODrjwMIN4+\ngdT1R6A5oxcYNmwDjRRP1xazNMR06VnXNk0kN1jWw/CH+3azerEDOMczwq/o8gGz\nGhdND01IjGgw0UUSZIJvFTr7jTSnu6jeHxK/5fwnOHFA6awLUXdnUToC+Zpt/txe\nVm/2Bms1AIafwyWotHtpnA4A0A8tVbKceD+rvHJIxQKBgQDenzPGqslPJDHr/Ige\n4wDHtrTFy9aI20neLvmK8JeYhxYRfD8xvqwlAen4w10zh7rHNph2usxdZAhqjAKC\nzS5SszaJjfd6BjAIdU29YTxpPx/AlgUK3HHnYB3v27zWaWdSB7t166d+IM7aEW1K\np7Y6UhBHoFV2zBDw3nYxNt6ztQKBgQDEMK/Efa5vggWdeRtFAkOauUCwTB83KBxJ\nMFVn/91StCC/clMhKMe0PesHz56IWiVZb3A+jjSj223Ko+ht7yLrPZciKuR2dgM7\n5Ayd/1qZa23XizrnNwEhecNT02O0p120CrRbTYjqzulbKEOSfR1wF0vG2bMDcLS2\nAZslIcHm5wKBgClqNJeg7hJrCV59fFVCpcKBmt+xLBgJs5RB6OqQF6OofdKC6r62\nWhAIax58Obp8ZaLp5TMxTROSqH4pzc3HnfaEoIC2iHOK8ySfrfatQC/ULnQFdKqw\nmAATQX59woOg2DfKeHVXgbFVKSYoV8yrppry6VRp33xaOkyVFifRrVyBAoGAXN3m\n9Y3AekwDuGzRObM+qQiz1D/ULtmvuf1FEDuPWkyli7nkG7gf//OnQ0VF96kkMNeN\nPC84P6/oopk/tnoR/2RiG+xNxL1L/peOWWO8UQ8HKZZgRX5F7MCkcxOHCMaIlmbS\nxL1I6E0VLO88PSU4QAzm87OtBx3cjKLp+4OlM1UCgYBJK3ekXCczOAW3qPaCKQLm\nzQfcI5DxGO1AjZxnKwiak3pog/saRhe1HKNipRNtnuhVuUM5VhPvqmz+fjcJtKYp\nvXjUAU6xd6VuQMff7JU7yWhi8M014WWyW+yQQyu/d3KBzZpNiRe8dl0dbybKP0/x\nUapO+juyDaltgoMWgTP6Xw==\n-----END PRIVATE KEY-----\n',
      client_email:
        'firebase-adminsdk-ii5bf@gazelle-a2c74.iam.gserviceaccount.com',
      client_id: '107241193259454944583',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ii5bf%40gazelle-a2c74.iam.gserviceaccount.com',  
    } as any),
    databaseURL:  'https://gazelle-a2c74-default-rtdb.europe-west1.firebasedatabase.app',
  });
  await app.listen(Number(process.env.SERVICE_PORT), () => {
    const logger = new Logger('Main');
    logger.log(`Server started on port = ${process.env.SERVICE_PORT}`);
  });
}
bootstrap();
