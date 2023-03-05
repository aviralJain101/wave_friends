import {Schema, model} from 'mongoose';
import IUser from '../interfaces/user';
import { Gender } from '../utils/enums';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  avatar: String,
  interests: {
    type: [String],
    required: true,
  },
  location: {
    latitude: {
      type: String,
      required: true
    }, 
    longitude: {
      type: String,
      required: true
    },
  },
  gender: {
    type: String,
    enum: Gender,
    required: true
  },
  acceptedRadius: {
    type: Number,
    required: true
  }
});

const User = model<IUser>('User', userSchema);

export default User;