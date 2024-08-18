const submit = document.getElementById("submit-btn");
const simulation = document.getElementById("simulation");

submit.addEventListener("click", () => {
  const floors = parseInt(document.getElementById("floors").value);
  const lifts = parseInt(document.getElementById("lifts").value);

  simulation.innerHTML = "";

  for (let i = floors; i > 0; i--) {
    simulation.appendChild(createFloor(i, floors));
    simulation.appendChild(document.createElement("hr"));
  }
});

function createFloor(floor, totalFloors, lifts) {
  const child = document.createElement("div");
  child.className = "floor";
  child.innerHTML = `Floor ${floor}: `;

  // Top floor
  if (floor === totalFloors) {
    const downButton = document.createElement("button");
    downButton.innerHTML = "DOWN";
    child.appendChild(downButton);
  }
  // Bottom floor
  else if (floor === 1) {
    const upButton = document.createElement("button");
    upButton.innerHTML = "UP";
    child.appendChild(upButton);
  }
  // Middle floors
  else {
    const upButton = document.createElement("button");
    upButton.innerHTML = "UP";
    child.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.innerHTML = "DOWN";
    child.appendChild(downButton);
  }

  return child;
}
