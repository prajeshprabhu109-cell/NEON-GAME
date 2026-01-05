export function exportLevel(objects) {
  const data = JSON.stringify({ objects }, null, 2);
  console.log(data);
  alert("Level exported to console");
}
