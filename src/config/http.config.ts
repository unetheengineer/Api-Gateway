import { HttpModuleOptions } from '@nestjs/axios';

export const httpConfig: HttpModuleOptions = {
  timeout: 10000,
  maxRedirects: 5,
  validateStatus: (status: number) => status >= 200 && status < 500,
};
