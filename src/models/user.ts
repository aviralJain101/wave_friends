import {Schema, model} from 'mongoose';
import IUser from '../interfaces/user';
import { Gender } from '../utils/enums';

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true,
    unique: true, // TODO: remove this later
  },
  avatar: String,
  interests: {
    type: [String],
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true
    }, 
    longitude: {
      type: Number,
      required: true
    },
  },
  gender: {
    type: String,
    enum: Gender,
    required: true
  },
  acceptedRadius: {
    type: Number, //in meters
    required: true
  }
});

const User = model<IUser>('User', userSchema);

export default User;