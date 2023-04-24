import jwt from 'jsonwebtoken';
import IUser from '../interfaces/user';
import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import Errors from '../utils/errors';

const generateAuthToken = (user: IUser)=>{
    const token = jwt.sign({pk:user._id},'wave');
    return token;
}

const auth = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ','');
        const decoded = jwt.verify(token, 'wave');
        const user: IUser | null = await User.findById(decoded.pk);
        if(!user){
            throw new Errors.NotFoundError("User Not found");
        }
        req.token = token;
        req.user = user;
        next();
    }catch(e){
        res.status(401).send('authenticate first')
    }
}

export default {
    generateAuthToken,
    auth
}