import User from '../models/user';
import IUser from '../interfaces/user';


const getUserFromUserId = async function (userId: string): Promise<IUser | null> {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const getUsersInYourRadius = async function (userId: string) {
    //Get user from user Id
    const user = await getUserFromUserId(userId);
    if(user == null){
        return null;
    }
    const radius = user.acceptedRadius;
    
};

export default {
    getUserFromUserId,
    getUsersInYourRadius
}