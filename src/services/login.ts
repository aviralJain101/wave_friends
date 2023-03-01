/* eslint-disable prettier/prettier */
import { Service } from 'typedi';
import config from '../loaders/config';
import errors from '../utils/errors';
import axios from 'axios';

@Service()
export default class LoginService {
  loginServiceUrl: string;

  constructor(){
    this.loginServiceUrl = config.login_service.loginServiceUrl;
  }

  public async getUserId(authToken: string): Promise<string> {
    try{
      const res = await axios.get(this.loginServiceUrl, {
        headers: {
          Authorization: 'Bearer ' + authToken //the token is a variable which holds the token
        }
      });
      if(res.data.error === true){
        throw new errors.BadRequestError('Unable to get userId from authToken');
      }
      return res.data.data.metaData.customer._id as string;
    }catch(error){
      throw new errors.BadRequestError('Unable to get userId from authToken');
    }
  }
}
