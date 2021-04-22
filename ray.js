class Ray {

    // constructs a ray based on the (i, j) pixel location from the screen and the camera
    constructor(direction, origin) {
        // generalizing the ray for eye rays and shadow rays
        this.direction = direction.normalize();
        this.origin = origin;
    }

    // for debugging
    debugValues() {
        console.log(this.direction);
    }

    // detects ray intersection with an object and returns the point of intersection
    // i wish javascript had support for overloading methods / type checking. shoutout typescript
    // so apologies for this ugly method, let me know if theres a better way to do this in plain JS lol
    cast(object) {

        // casting to a sphere
        if (object.constructor.name == "Sphere") {
            let sphere = object;

            // organizing values like the notes for my sanity
            // direction vector of ray
            let dx = this.direction.x;
            let dy = this.direction.y;
            let dz = this.direction.z;

            // initial point of ray
            let xo = this.origin.x;
            let yo = this.origin.y;
            let zo = this.origin.z;

            // center of sphere
            let xc = sphere.pos.x;
            let yc = sphere.pos.y;
            let zc = sphere.pos.z;

            // calculating a, b, c of quadratic equation
            let a = sq(dx) + sq(dy) + sq(dz);
            let b = 2 * ((dx * (xo - xc)) + (dy * (yo - yc)) + (dz * (zo - zc)));
            let c = sq(xc - xo) + sq(yc - yo) + sq(zc - zo) - sq(sphere.radius);

            // calculating positive and negative values of quadratic formula
            let tpos = (-b + (sqrt(sq(b) - 4 * a * c))) / (2 * a);
            let tneg = (-b - (sqrt(sq(b) - 4 * a * c))) / (2 * a);


            // returning the closest t value, or nothing if no intersection

            let closestT;

            if (tpos < tneg) {
                closestT = tpos;
            } else {
                closestT = tneg;
            }

            if (closestT > 0) {
                this.collidedObject = sphere;
                return closestT;
            } else {
                return;
            }
        }

        // casting to a disk
        if (object.constructor.name == "Disk") {
            let disk = object;

            // direction vector of ray
            let dx = this.direction.x;
            let dy = this.direction.y;
            let dz = this.direction.z;
        
            // initial point of ray
            let xo = this.origin.x;
            let yo = this.origin.y;
            let zo = this.origin.z;

            let a = disk.nx;
            let b = disk.ny;
            let c = disk.nz;
            let d = -(disk.x * disk.nx) - (disk.y * disk.ny) - (disk.z * disk.nz);
            //console.log(d);
            

            //https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-plane-and-ray-disk-intersection#:~:text=The%20ray%2Ddisk%20intersection%20routine%20is%20very%20simple.&text=If%20the%20ray%20intersects%20this,the%20ray%20intersects%20the%20disk.
            // organizing values like the notes for my sanity


            // plane equation
            // ax + by + cz + d = 0

            // t = (ray.origin - disk.pos) dot disk.normal
            //      --------------------------------------
            //           ray.direction dot disk.normal

            // vector based version
            let top = p5.Vector.dot(p5.Vector.sub(disk.pos, this.origin), disk.normal);  
            let bottom = p5.Vector.dot(disk.normal, this.direction); // if bottom zero no intersection
            let t = (top / bottom);

            // version from the lectures
            //let t = (-1 * ((a * xo) + (b * yo) + (c * zo) + d)) / ((a * dx) + (b * dy) + (c * dz));

            // making sure T is a real number (type checking)
            if (isFinite(t)) {
                let intersection = p5.Vector.add(this.origin, p5.Vector.mult(this.direction, t));
                let magnitude = p5.Vector.mag(p5.Vector.sub(intersection, disk.pos));
    
    
                if (t > 0 && (sq(magnitude) <= sq(disk.radius))) {
                    this.collidedObject = disk;
                    return t;
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }
}