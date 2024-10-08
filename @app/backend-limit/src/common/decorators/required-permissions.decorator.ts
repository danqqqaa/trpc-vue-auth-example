import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'src/user/user.model';


export const RequiredPermission = (...roles: ROLE[]) =>
  SetMetadata('requiredPermission', roles);
