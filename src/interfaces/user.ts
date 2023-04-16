import { Gender } from "../utils/enums";
import { Document } from "mongoose";

export default interface IUser extends Document{
  _id?: string;
  name: string;
  avatar?: string;
  interests: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  gender: Gender;
  acceptedRadius: number; //in meters
}