import { celebrate, Joi, Segments } from 'celebrate';
import { Router, Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { Gender } from '../../utils/enums';
import UserService from '../../services/user';
import Errors from '../../utils/errors';
import authMiddleware from '../../middlewares/auth';
import IUser from '../../interfaces/user';

const router = Router();

export default (app: Router): void => {
  app.use('/user', router);

  const postUserInputSchema = {
    [Segments.BODY]: Joi.object().keys({
      user: Joi.object({
        name: Joi.string().required(),
        interests: Joi.array().min(1).items(Joi.string()).required(),
        location: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required()
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
      await user.save();
      const token = authMiddleware.generateAuthToken(user);
      res.status(201).json({user, token});
    } catch(error){
      next(error);
    }
  })

  const getUserInputSchema = {
    [Segments.HEADERS]: Joi.object().keys({
      Authorization: Joi.string().min(2).required(),
    }).options({allowUnknown: true}),
  };
  //Get api to get user details
  router.get('/', celebrate(getUserInputSchema), authMiddleware.auth,  async (req: Request, res: Response, next: NextFunction) => {
    req.log.apiName = 'GET-USER'
    try{
      const user = req.user;
      if(!user){
        throw new Errors.NotFoundError("User Not found");
      }
      res.status(200).json(user);
    } catch(error){
      next(error);
    }
  })

  const matchUserInputSchema = {
    [Segments.HEADERS]: Joi.object().keys({
      Authorization: Joi.string().min(2).required(),
    }).options({allowUnknown: true}),
  };
  //Get api to get user details
  router.get('/match', celebrate(matchUserInputSchema), authMiddleware.auth,  async (req: Request, res: Response, next: NextFunction) => {
    req.log.apiName = 'GET-MATCH'
    try{
      const user = req.user;
      if(!user){
        throw new Errors.NotFoundError("User Not found");
      }
      const users: IUser[] | null = await UserService.getUsersInYourRadius(user);
      res.status(200).json(users);
    } catch(error){
      next(error);
    }
  })
}