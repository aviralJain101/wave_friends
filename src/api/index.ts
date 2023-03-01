import { Router } from 'express';
import policy from './routes/policy';

// guaranteed to get dependencies
export default (): Router => {
  const app = Router();
  policy(app);
  return app;
};