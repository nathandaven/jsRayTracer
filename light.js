class Light {
    // constructs a point light with a position and a color
    constructor(x, y, z, r, g, b) {
        this.pos = createVector(x, y, z);
        this.r = r;
        this.g = g;
        this.b = b;
        this.color = color(r, g, b);
    }
}

class AreaLight extends Light {

    constructor(x, y, z, r, g, b, ux, uy, uz, vx, vy, vz) {
        super(x, y, z, r, g, b);
        this.pos = createVector(x, y, z);
        this.center = createVector(x, y, z);

        this.ux = ux;
        this.uy = uy;
        this.uz = uz;
        this.u = createVector(ux, uy, uz);

        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.v = createVector(vx, vy, vz);
    }
}