export const Physics = {
  speed: 0,
  maxSpeed: 12,
  accel: 0.4,
  friction: 0.15,
  steer: 4,

  update(input, car) {
    if (input.up) this.speed += this.accel;
    if (input.down) this.speed -= this.accel;

    this.speed -= Math.sign(this.speed) * this.friction;
    this.speed = Math.max(-this.maxSpeed, Math.min(this.speed, this.maxSpeed));

    if (input.left) car.x -= this.steer;
    if (input.right) car.x += this.steer;

    car.y -= this.speed;
  }
};
