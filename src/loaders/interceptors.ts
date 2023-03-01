import axios from 'axios';
import httpContext from 'express-http-context';
import { v1 as uuidV1 } from 'uuid';

const loadInterceptors = (): void => {
  // Check number returned and usage
  axios.interceptors.request.use(
    function (config) {
      const requestId = httpContext.get('requestId') || uuidV1();
      config.headers['X-Request-ID'] = requestId;
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );
};

export default loadInterceptors;