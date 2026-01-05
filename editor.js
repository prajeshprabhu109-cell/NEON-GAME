export const Editor = {
  objects: [],

  addCar(x, y) {
    this.objects.push({ type: "car", x, y });
  }
};
