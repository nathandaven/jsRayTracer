class Sphere {
    // creates a sphere object with parameters
    constructor(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.pos = createVector(x, y, z);
        
        this.radius = radius;
        this.dr = dr;
        this.dg = dg;
        this.db = db;
        this.diffuseColor = color(dr, dg, db);
        this.k_ambient = k_ambient;
        this.k_specular = k_specular;
        this.specular_pow = specular_pow;
    }
}