const submit = document.getElementById("submit-btn");
const simulation = document.getElementById("simulation");
const inputDiv = document.querySelector(".inputDiv");

let liftState = [];
let floorLiftCount = {};
let requestQueue = [];
let activeRequests = new Set(); // Track floors with active requests by direction

submit.addEventListener("click", () => {
  const floors = parseInt(document.getElementById("floors").value);
  const lifts = parseInt(document.getElementById("lifts").value);

  if (isNaN(floors) || isNaN(lifts) || floors < 0 || lifts < 0) {
    alert("Please enter positive numbers for floors and lifts.");
    return;
  }
  if (floors === 0) {
    alert("Add at least 1 floor.");
    return;
  }

  inputDiv.style.display = "none";
  simulation.innerHTML = "";
  liftState = Array.from({ length: lifts }, () => ({
    currentFloor: 0,
    destinationQueue: [],
    direction: null, // 'UP' or 'DOWN'
    busy: false,
  }));

  floorLiftCount = {};
  activeRequests.clear(); // Reset active requests

  for (let i = floors - 1; i >= 0; i--) {
    floorLiftCount[i] = 0;
    simulation.appendChild(createFloor(i, lifts));
  }
});

function createFloor(floor, lifts) {
  const floorDiv = document.createElement("div");
  floorDiv.className = "floor";

  const floorLabel = document.createElement("div");
  floorLabel.className = "floor-label";
  floorLabel.innerHTML = `Floor ${floor}`;
  floorDiv.appendChild(floorLabel);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  if (floor > 0) {
    const downButton = document.createElement("button");
    downButton.className = "buttons down";
    downButton.innerHTML = "DOWN";
    downButton.addEventListener("click", () =>
      handleButtonClick(floor, "DOWN")
    );
    buttonContainer.appendChild(downButton);
  }

  if (floor < parseInt(document.getElementById("floors").value) - 1) {
    const upButton = document.createElement("button");
    upButton.className = "buttons up";
    upButton.innerHTML = "UP";
    upButton.addEventListener("click", () => handleButtonClick(floor, "UP"));
    buttonContainer.appendChild(upButton);
  }

  floorDiv.appendChild(buttonContainer);

  if (floor === 0) {
    const liftContainer = document.createElement("div");
    liftContainer.className = "lift-container";

    for (let j = 0; j < lifts; j++) {
      const liftDiv = document.createElement("div");
      liftDiv.className = "lift";
      liftDiv.id = `lift-${j}`;

      liftDiv.style.transform = `translateY(${floor * -100}px)`;

      const leftDoor = document.createElement("div");
      leftDoor.className = "doors left-door";

      const rightDoor = document.createElement("div");
      rightDoor.className = "doors right-door";

      liftDiv.appendChild(leftDoor);
      liftDiv.appendChild(rightDoor);

      liftContainer.appendChild(liftDiv);
    }

    floorDiv.appendChild(liftContainer);
  }

  return floorDiv;
}

function handleButtonClick(floor, direction) {
  // Create a unique key for the request (floor + direction)
  const requestKey = `${floor}-${direction}`;

  // Check if the floor and direction is already being served
  if (activeRequests.has(requestKey)) {
    console.log(
      `Request for floor ${floor}, direction ${direction} is already being served.`
    );
    return;
  }

  let nearestLift = -1;
  let minDistance = Infinity;

  let allBusy = liftState.every((lift) => lift.busy);

  if (allBusy) {
    queueRequest(floor, direction);
    return;
  }

  liftState.forEach((lift, index) => {
    if (
      !lift.busy &&
      (lift.direction === null || lift.direction === direction)
    ) {
      const distance = Math.abs(lift.currentFloor - floor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = index;
      }
    }
  });

  if (nearestLift !== -1) {
    assignLift(nearestLift, floor, direction);
  } else {
    queueRequest(floor, direction);
  }
}

function queueRequest(floor, direction) {
  requestQueue.push({ floor, direction });
  console.log(`Queued request for floor ${floor}, direction ${direction}`);
}

function checkQueuedRequests() {
  if (requestQueue.length === 0) return;

  requestQueue = requestQueue.filter((request) => {
    const { floor, direction } = request;
    let nearestLift = -1;
    let minDistance = Infinity;

    liftState.forEach((lift, index) => {
      if (
        !lift.busy &&
        (lift.direction === null || lift.direction === direction)
      ) {
        const distance = Math.abs(lift.currentFloor - floor);
        if (distance < minDistance) {
          minDistance = distance;
          nearestLift = index;
        }
      }
    });

    if (nearestLift !== -1) {
      assignLift(nearestLift, floor, direction);
      return false; // Remove the request from the queue
    }

    return true; // Keep it in the queue if no lift was available
  });
}

function assignLift(liftIndex, floor, direction) {
  const lift = liftState[liftIndex];
  lift.busy = true;
  lift.direction = direction;

  // Create a unique key for the request (floor + direction)
  const requestKey = `${floor}-${direction}`;

  // Mark the floor and direction as being served
  activeRequests.add(requestKey);

  const liftDiv = document.getElementById(`lift-${liftIndex}`);
  const distance = Math.abs(lift.currentFloor - floor);
  const travelTime = distance * 2; // 2 seconds per floor
  lift.currentFloor = floor;

  liftDiv.style.transition = `transform ${travelTime}s ease-in-out`;
  liftDiv.style.transform = `translateY(${floor * -100}px)`;

  setTimeout(() => {
    openCloseDoors(liftDiv, liftIndex, () => {
      lift.busy = false;
      lift.direction = null; // Lift is idle

      // After serving, remove the floor and direction from active requests
      activeRequests.delete(requestKey);

      checkQueuedRequests(); // After completing the task, check if any requests are pending
    });
  }, travelTime * 1000);
}

function openCloseDoors(liftDiv, liftIndex, callback) {
  const leftDoor = liftDiv.querySelector(".left-door");
  const rightDoor = liftDiv.querySelector(".right-door");

  leftDoor.style.width = "0"; // Open doors
  rightDoor.style.width = "0";

  setTimeout(() => {
    leftDoor.style.width = "50%"; // Close doors
    rightDoor.style.width = "50%";

    setTimeout(() => {
      callback(); // Once doors are closed, proceed to the next task
    }, 2500); // Allow 2.5 seconds for the doors to fully close
  }, 2500); // Keep doors open for 2.5 seconds
}
