class Camera {

    // contructs a camera object at the origin
    constructor() {
        this.pos = createVector(0, 0, 0);
    }

    // sets the position of the camera (used by set_eye_position())
    setPosition(x, y, z) {
        this.pos = createVector(x, y, z);
    }

    // sets the basis for the coordinate system (used by set_uvw())
    setBasis(u, v, w) {
        this.u = u.normalize();
        this.v = v.normalize();
        this.w = w.normalize();
    }
}