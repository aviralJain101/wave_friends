import { celebrate, Joi, Segments } from 'celebrate';
import { Router, Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { Gender } from '../../utils/enums';
import UserService from '../../services/user';
import Errors from '../../utils/errors';

const router = Router();

export default (app: Router): void => {
  app.use('/user', router);

  const postUserInputSchema = {
    [Segments.BODY]: Joi.object().keys({
      // authToken: Joi.string().alphanum().min(2).required().messages({
      //   // Here's how you may set custom error messages
      //   'string.alphanum': 'Auth Token is invalid',
      //   'string.min': 'Auth token is too short',
      // }),
      user: Joi.object({
        name: Joi.string().required(),
        interests: Joi.array().min(1).items(Joi.string()).required(),
        location: Joi.object({
          latitude: Joi.string().required(),
          longitude: Joi.string().required()
        }).required(),
        gender: Joi.string().valid(... Object.values(Gender)).required(),
        acceptedRadius: Joi.number().required()
      }) 
    })
  }

  //Post api which creates a new user
  router.post('/', celebrate(postUserInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    req.log.apiName = 'POST-USER';
    try{
      const user = new User(req.body.user);
      await user.save()
      res.status(200).json(user);
    } catch(error){
      next(error);
    }
  })

  const getUserInpurSchema = {
    [Segments.BODY]: {
      authToken: Joi.string().min(2).required(),
      policyId: Joi.string().required(),
      readingValue: Joi.string().required(),
    },
  };
  //Get api to get user details
  router.get('/', celebrate(getUserInpurSchema), async (req: Request, res: Response, next: NextFunction) => {
    req.log.apiName = 'GET-USER'
    //TODO: get user Id from AuthTOken
    const userId = "";
    try{
      const user = await UserService.getUserFromUserId(userId);
      if(!user){
        throw new Errors.NotFoundError("User Not found");
      }
      res.status(200).json(user);
    } catch(error){
      next(error);
    }
  })
}