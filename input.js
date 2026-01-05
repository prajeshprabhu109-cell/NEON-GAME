export const Input = {
  state: { up:false, down:false, left:false, right:false },

  init() {
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowUp") this.state.up = true;
      if (e.key === "ArrowDown") this.state.down = true;
      if (e.key === "ArrowLeft") this.state.left = true;
      if (e.key === "ArrowRight") this.state.right = true;
    });

    window.addEventListener("keyup", e => {
      if (e.key === "ArrowUp") this.state.up = false;
      if (e.key === "ArrowDown") this.state.down = false;
      if (e.key === "ArrowLeft") this.state.left = false;
      if (e.key === "ArrowRight") this.state.right = false;
    });
  }
};
