// routines for creating a ray tracing scene
// Nathan Davenport - project 3B march 30 2021

let camera;
let lights = [];
let objects = [];
let ambientLight = [];
let backgroundColor;
let fov; // radians

// project 3b
let sampleLevel = 1;
let jitter = false;

// NEW COMMANDS FOR PART B

// create a new disk
function new_disk(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {
    objects.push(new Disk(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow));
}

// create a new area light source
function area_light(r, g, b, x, y, z, ux, uy, uz, vx, vy, vz) {
    lights.push(new AreaLight(x, y, z, r, g, b, ux, uy, uz, vx, vy, vz));
}

function set_sample_level(num) {
    sampleLevel = num;
}

function jitter_on() {
    jitter = true;
}

function jitter_off() {
    jitter = false;
}

// OLD COMMANDS FROM PART A (some of which you will still need to modify)

// clear out all scene contents
function reset_scene() {
    camera = new Camera();
    lights = [];
    objects = [];
    ambientLight = [0, 0, 0];
    backgroundColor = 0;
    fov = 60;
}

// create a new point light source
function new_light(r, g, b, x, y, z) {
    lights.push(new Light(x, y, z, r, g, b));
}

// set value of ambient light source
function ambient_light(r, g, b) {
    ambientLight = [r, g, b];
}

// set the background color for the scene
function set_background(r, g, b) {
    backgroundColor = [r, g, b];
}

// set the field of view
function set_fov(theta) {
    fov = radians(theta);
}

// set the position of the virtual camera/eye
function set_eye_position(x, y, z) {
    camera.setPosition(x, y, z);
}

// set the virtual camera's viewing direction
// x1, y1, z1 define the vector u. x2, y2, and z2 are v, and x3, y3, and z3 are w. 
// Together they form the orthonormal basis for the eye. You should simply store 
// those values as globals so you can use them later to calculate the eye rays.
function set_uvw(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    camera.setBasis(
        createVector(x1, y1, z1),
        createVector(x2, y2, z2),
        createVector(x3, y3, z3) // idk??
    );
}

// create a new sphere
function new_sphere(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
    objects.push(new Sphere(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow));
}

// create an eye ray based on the current pixel's position
function eye_ray_uvw(i, j) {

    i = i;
    j = height - j;

    // organizing scalars for my sanity
    let dScalar = 1 / (tan(fov / 2));
    let uScalar = -1 + ((2 * i) / width);
    let vScalar = -1 + ((2 * j) / height);

    // multiplying the camera basis by the scalars based on lecture formula:
    // -d(w>) + u*u> + v*(v>)
    let w = p5.Vector.mult(camera.w, -dScalar);
    let u = p5.Vector.mult(camera.u, uScalar);
    let v = p5.Vector.mult(camera.v, vScalar);

    // adding the vectors together and normalizing
    let direction = p5.Vector.add(w, p5.Vector.add(u, v));

    // storing the xo, yo, zo from the eye position
    let origin = camera.pos;

    return new Ray(direction, origin);
}

// this is the main routine for drawing your ray traced scene
function draw_scene() {

    noStroke();  // so we don't get a border when we draw a tiny rectangle

    // go through all the pixels in the image

    let scene = [];

    // loop thru screen
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            // placeholders to store the pixel's color
            let r = 0;
            let g = 0;
            let b = 0;

            // anti aliasing -- distribution ray tracing -- bound to sampleLevel
            for (let subY = 0; subY < sampleLevel; subY++) {
                for (let subX = 0; subX < sampleLevel; subX++) {

                    let subXPrime = ((subX + 1) / (sampleLevel + 1)) - 0.5;
                    let subYPrime = ((subY + 1) / (sampleLevel + 1)) - 0.5;

                    // create eye ray
                    let ray = eye_ray_uvw(x + subXPrime, y + subYPrime);
                
                    // stores the closest t value
                    let closestT = 0;
                    let closestObject;
                
                    for (let object of objects) {
                        // method to detect intersection
                        var tValue = ray.cast(object);
                
                        if (closestT == 0 && tValue > 0) {
                            closestT = tValue;
                            closestObject = ray.collidedObject;
                
                        } else {
                            if (tValue <= closestT && tValue > 0) {
                                closestT = tValue;
                                closestObject = ray.collidedObject;
                            }
                        }
                    }
                
                    // shading 
                    if (closestT && closestObject) {
                        let diffuseR = 0;
                        let diffuseG = 0;
                        let diffuseB = 0;
                
                        let ambientApplied = false;
                
                        // calculate diffuse light vector
                        for (let light of lights) {
                            // calculating base values based on shape and light -- intersection, N vector, L vector
                            let multiplier = p5.Vector.mult(ray.direction, closestT); 

                            let closestIntersectionPoint = p5.Vector.add(ray.origin, multiplier);
                            let nVector;
                            // checks that the object is a sphere
                            if (closestObject.constructor.name == "Sphere") {
                                nVector = p5.Vector.sub(closestObject.pos, closestIntersectionPoint).normalize()
                            }
                            // checks that the object is a disk
                            if (closestObject.constructor.name == "Disk") {
                                // calculate normal vector, flip to fix orientation
                                //nVector = p5.Vector.mult(closestObject.normal, -1);
                                nVector = p5.Vector.mult(closestObject.normal, -1).normalize();
                            }

                            // applying ambient light once
                            let ambientR = 0;
                            let ambientG = 0;
                            let ambientB = 0;
                
                            if (!ambientApplied) {
                                ambientApplied = true;
                
                                ambientR = ambientLight[0] * closestObject.k_ambient;
                                ambientG = ambientLight[1] * closestObject.k_ambient;
                                ambientB = ambientLight[2] * closestObject.k_ambient;
                            } 
                
                            // calcuating color if light is a point light
                            if (light.constructor.name == "Light") {             
                                let lVector = (p5.Vector.sub(closestIntersectionPoint, light.pos)).normalize();
                                
                                // calculating the dot product and keeping it above 0
                                let dotProduct = max(0, p5.Vector.dot(nVector, lVector));
                                
                                // calculating shadow rays
                                let shadowRay = new Ray(
                                    p5.Vector.mult(lVector, -1), // flipping the L vector to orient the collision in the right direction
                                    p5.Vector.sub( // moving the N vector by a small factor in normal direction as suggested by piazza
                                        closestIntersectionPoint, 
                                        p5.Vector.div(nVector, 100)) // dividing the normal vector to make it a very small factor to just avoid the camera collision
                                        );
                                let shadow = false;
                                
                                for (let object of objects) {
                                    let shadowT = shadowRay.cast(object);
                                    if (shadowT) {
                                        shadow = true;
                                    }
                                }
                                
                                // summing the diffuse RGB values using the diffuse equation
                                let lightR = light.r;
                                let lightG = light.g;
                                let lightB = light.b;
                
                                if (shadow) {
                                    lightR = 0;
                                    lightG = 0;
                                    lightB = 0;
                                }
                                
                                // COLOR = cr * cl * max(0, N dot L)
                                diffuseR += closestObject.dr * (ambientR + (lightR * dotProduct));
                                diffuseG += closestObject.dg * (ambientG + (lightG * dotProduct));
                                diffuseB += closestObject.db * (ambientB + (lightB * dotProduct));
                
                            }

                            // calculating color if light is an area light
                            if (light.constructor.name == "AreaLight") {
                                let lightR = light.r;
                                let lightG = light.g;
                                let lightB = light.b;

                                let s = (((subX + 1) / (sampleLevel + 1)) * 2) - 1;
                                let t = (((subY + 1) / (sampleLevel + 1)) * 2) - 1;

                                if (jitter) {
                                    s = (((subX + 1 + random(-.5, .5)) / (sampleLevel + 1)) * 2) - 1;
                                    t = (((subY + 1 + random(-.5, .5)) / (sampleLevel + 1)) * 2) - 1;
                                }

                                // pos + s*u + t*v
                                let lightPosition = 
                                    p5.Vector.add(light.pos,
                                        p5.Vector.add(
                                            p5.Vector.mult(light.u, s), 
                                            p5.Vector.mult(light.v, t)));

                                let lVector = (p5.Vector.sub(closestIntersectionPoint, lightPosition)).normalize();

                                // calculating shadow rays
                                let shadowRay = new Ray(
                                    p5.Vector.mult(lVector, -1), // flipping the L vector to orient the collision in the right direction // TODO, why 1 or neg 1
                                    p5.Vector.sub( // moving the N vector by a small factor in normal direction as suggested by piazza
                                        closestIntersectionPoint, 
                                        p5.Vector.div(nVector, 500)) // dividing the normal vector to make it a very small factor to just avoid the camera collision
                                        );
                                let shadow = false;
                                
                                for (let object of objects) {
                                    let shadowT = shadowRay.cast(object);
                                    if (shadowT) {
                                        shadow = true;
                                    }
                                }

                                // calculating the dot product and keeping it above 0
                                let dotProduct = max(0, p5.Vector.dot(nVector, p5.Vector.mult(lVector, 1))); // TODO, why 1 or neg 1

                                if (shadow) {
                                    lightR = 0;
                                    lightG = 0;
                                    lightB = 0;
                                }

                                diffuseR += closestObject.dr * (ambientR + lightR * dotProduct);
                                diffuseG += closestObject.dg * (ambientG + lightG * dotProduct);
                                diffuseB += closestObject.db * (ambientB + lightB * dotProduct);
                            }
                        }
                
                        // final color values
                        r += diffuseR;
                        g += diffuseG;
                        b += diffuseB;
                
                    } else {
                        // if no hit, mark the pixel as the background color
                
                        r += backgroundColor[0];
                        g += backgroundColor[1];
                        b += backgroundColor[2];
                    }
                }
            }

            // averaging the pixel color if sampleLevel > 1
            r = r / sq(sampleLevel);
            g = g / sq(sampleLevel);
            b = b / sq(sampleLevel);


            // set the pixel color, converting values from [0,1] into [0,255]
            fill(255 * r, 255 * g, 255 * b);

            // flipped y to fix orientation
            rect(x, y, 1, 1);   // make a little rectangle to fill in the pixel
        }
    }
}
