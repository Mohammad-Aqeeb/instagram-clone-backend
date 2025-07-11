import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = "isPublicKey"
export const Public = (...data: string[]) => SetMetadata(IS_PUBLIC_KEY, data);
