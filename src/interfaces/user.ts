import { Gender } from "../utils/enums";

export default interface IUser{
  name: string;
  avatar?: string;
  interests: string[];
  location: {
    latitude: string;
    longitude: string;
  };
  gender: Gender;
  acceptedRadius: number;
}