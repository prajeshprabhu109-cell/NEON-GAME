export const Brand = {
  ctx: null,
  canvas: null,
  y: 500,
  speed: 5,

  async load() {
    const brand = await fetch("../config/brand.json").then(r => r.json());
    document.title = brand.gameName;
    document.getElementById("gameTitle").innerText = brand.gameName;
    document.getElementById("tagline").innerText = brand.tagline;

    document.documentElement.style.setProperty("--primary", brand.primaryColor);
    document.documentElement.style.setProperty("--accent", brand.accentColor);
  },

  start() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    requestAnimationFrame(this.loop.bind(this));
  },

  loop() {
    this.ctx.clearRect(0, 0, 400, 600);

    // Road
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(150, 0, 100, 600);

    // Player car
    this.ctx.fillStyle = "var(--accent)";
    this.ctx.fillRect(185, this.y, 30, 50);

    requestAnimationFrame(this.loop.bind(this));
  }
};
