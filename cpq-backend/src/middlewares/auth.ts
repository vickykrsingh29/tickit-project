import { expressjwt as jwt } from 'express-jwt';
import {GetVerificationKey} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

export interface AuthenticatedRequest extends Request {
    auth?: {
      sub: string;
      [key: string]: any;
    }
  }
  

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as unknown as GetVerificationKey,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});