class Disk {

    constructor(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {

        //size and postition
        this.x = x;
        this.y = y;
        this.z = z;
        this.pos = createVector(x, y, z);
        this.radius = radius;

        // surface normal
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;

        this.normal = createVector(nx, ny, nz).normalize();

        // diffuse color
        this.dr = dr;
        this.dg = dg;
        this.db = db;
        this.diffuseColor = color(dr, dg, db);


        this.k_ambient = k_ambient;
        this.k_specular = k_specular;
        this.specular_pow = specular_pow;
    }
}