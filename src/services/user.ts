import User from '../models/user';
import IUser from '../interfaces/user';
import matchService from './matchService';


const getMatchedUsers = async function (myUser: IUser): Promise<{ user: IUser, matchScore: number }[] | null> {
    if(myUser == null){
        return null;
    }
    
    const usersInRadius: { user: IUser, matchScore: number }[] = [];

    const users: IUser[] = await User.find();
    for(const user of users){
        if(myUser._id?.toString() != user._id?.toString()){
            const matchScore = matchService.matchScore(myUser, user);
            if(matchScore > 0){
                    usersInRadius.push({user, matchScore});
                }
        }
    }
    return usersInRadius;
};

export default {
    getMatchedUsers
}