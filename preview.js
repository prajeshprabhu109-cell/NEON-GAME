export function preview(canvas, objects) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  objects.forEach(obj => {
    ctx.fillStyle = "red";
    ctx.fillRect(obj.x, obj.y, 30, 50);
  });
}
