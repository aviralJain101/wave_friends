declare namespace Express {
  export interface Request {
    requestId?: string | string[];
    log?: any;
  }
}
