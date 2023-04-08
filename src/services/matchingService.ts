interface Circle {
    lat: number;
    lng: number;
    radius: number;
  }
  
  function circlesIntersect(circle1: Circle, circle2: Circle): boolean {
    const distanceBetweenCenters = Math.sqrt(
      (circle1.lat - circle2.lat) ** 2 + (circle1.lng - circle2.lng) ** 2
    );
  
    if (distanceBetweenCenters > circle1.radius + circle2.radius) {
      // Circles do not intersect
      return false;
    }
  
    const smallerCircle = circle1.radius < circle2.radius ? circle1 : circle2;
    const largerCircle = smallerCircle === circle1 ? circle2 : circle1;
  
    const distanceFromSmallerToIntersection = (
      smallerCircle.radius ** 2 -
      largerCircle.radius ** 2 +
      distanceBetweenCenters ** 2
    ) / (2 * distanceBetweenCenters);
  
    if (smallerCircle.radius ** 2 - distanceFromSmallerToIntersection ** 2 < 0) {
      // Circles do not intersect
      return false;
    }
  
    const intersectionX =
      (smallerCircle.lat +
        (distanceFromSmallerToIntersection * (largerCircle.lat - smallerCircle.lat)) /
          distanceBetweenCenters) as number;
    const intersectionY =
      (smallerCircle.lng +
        (distanceFromSmallerToIntersection * (largerCircle.lng - smallerCircle.lng)) /
          distanceBetweenCenters) as number;
  
    // Check if the intersection point is inside both circles
    const intersectionInCircle1 =
      Math.sqrt((intersectionX - circle1.lat) ** 2 + (intersectionY - circle1.lng) ** 2) <=
      circle1.radius;
    const intersectionInCircle2 =
      Math.sqrt((intersectionX - circle2.lat) ** 2 + (intersectionY - circle2.lng) ** 2) <=
      circle2.radius;
  
    return intersectionInCircle1 && intersectionInCircle2;
  }
  