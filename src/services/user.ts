import User from '../models/user';
import IUser from '../interfaces/user';
import matchService from './matchService';


const getUsersInYourRadius = async function (myUser): Promise<IUser[] | null> {
    if(myUser == null){
        return null;
    }
    var usersInRadius: IUser[] = [];
    const users: IUser[] = await User.find();
    for(const user of users){
        if(myUser._id != user._id){
            if(matchService.match(
                myUser.location.latitude, 
                myUser.location.longitude, 
                myUser.acceptedRadius, 
                user.location.latitude, 
                user.location.longitude, 
                user.acceptedRadius)){
                    usersInRadius.push(user);
                }
        }
    }
    return usersInRadius;
};

export default {
    getUsersInYourRadius
}