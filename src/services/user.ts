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

export default {
    getUserFromUserId
}