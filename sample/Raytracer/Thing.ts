export interface Thing {
    intersect: (ray: Ray) => Intersection;
    normal: (pos: Vector) => Vector;
    surface: Surface;
}