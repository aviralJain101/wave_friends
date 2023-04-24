import IUser from "../../interfaces/user";

declare global{
  namespace Express {
    export interface Request {
      requestId?: string | string[];
      log?: any;
      token?: string;
      user?: IUser;
    }
  }
}