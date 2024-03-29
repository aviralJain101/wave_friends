import IUser from "../interfaces/user";
import { Gender } from "../utils/enums";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Circle {
  center: Coordinates;
  radius: number;
}

function matchScore(myUser: IUser, user: IUser): number {
  if( matchByRadius(
    myUser.location.latitude, 
    myUser.location.longitude, 
    myUser.acceptedRadius, 
    user.location.latitude, 
    user.location.longitude, 
    user.acceptedRadius) == false
    ||
    matchByGender(myUser.gender, user.gender) == false ) {
      return 0;
    }
    return getInterestsMatchScore(myUser.interests, user.interests) + 1;
}

//Functions to match user by Interests
function countCommonElements(array1: string[], array2: string[]): number {
  let count = 0;

  for (const element of array1) {
    if (array2.includes(element)) {
      count++;
    }
  }

  return count;
}

function getInterestsMatchScore(myUserInterests: string[], userInterests: string[]): number {
  const numberOfCommonInterests: number = countCommonElements(myUserInterests, userInterests);
  return numberOfCommonInterests;
}

//Function to match user by "Gender"
function matchByGender(myUserGender: Gender, userGender: Gender): boolean {
  return myUserGender === userGender;
}

//Functions to Match user by "Radius"
function matchByRadius(lat1: number, lng1: number, rad1: number, lat2: number, lng2: number, rad2: number): boolean {
  const circle1: Circle = {
    center: { lat: lat1, lng: lng1 },
    radius: rad1, // in meters
  };
  
  const circle2: Circle = {
    center: { lat: lat2, lng: lng2 },
    radius: rad2, // in meters
  };
  const centerDistance = getDistance(circle1.center, circle2.center);
  return centerDistance <= circle1.radius && centerDistance <= circle2.radius;
}

function getDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // earth's radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180; // convert to radians
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // distance in meters
  return distance;
}

// // Example usage
// const circle1: Circle = {
//   center: { lat: 52.5200, lng: 13.4050 },
//   radius: 1000, // in meters
// };

// const circle2: Circle = {
//   center: { lat: 52.5171, lng: 13.4150 },
//   radius: 500, // in meters
// };

// const overlap = isMatch(circle1, circle2);
// console.log(overlap); // true if the two users overlap with each other

export default {
  matchScore
}