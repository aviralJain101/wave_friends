import { Gender } from "../utils/enums";

export default interface IUser{
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