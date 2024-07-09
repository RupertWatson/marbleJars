const jarWidth = 300;
const jarHeight = 500;
const gravity = 0.1;
const friction = 0.8; // Higher for more bounce
const ballFriction = 0.8; // Lower for more damping
let jarCount = 0;

// Array to store references to multiple canvas contexts
const jars = [];

// Function to create a new jar
function addJar() {
  const jarContainer = document.getElementById('jars-container');
  // Create a new jar div
  const jarDiv = document.createElement('div');
  jarDiv.classList.add('jar');

  // Create a canvas element for the jar
  const jarCanvas = document.createElement('canvas');
  jarCanvas.width = jarWidth;
  jarCanvas.height = jarHeight;
  jarCanvas.style.border = '4px hidden #000000';
  const rVal = Math.round(150 + Math.random() * 105);
  const gVal = Math.round(150 + Math.random() * 105);
  const bVal = Math.round(150 + Math.random() * 105);
  const newBgColor = `rgb(${rVal}, ${gVal}, ${bVal})`;
  jarCanvas.style.backgroundColor = newBgColor;

  // Create a text input field for the jar name
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Enter Team Name';
  nameInput.className = "TeamName";
  // Array to store marbles for this jar
  const jarMarbles = [];

  // Add the canvas to the jars array
  jars.push({ canvas: jarCanvas, marbles: jarMarbles });

  // Create the "Add Marble" button
  const addButton = document.createElement('button');
  addButton.textContent = '+1';
  addButton.className = "scoreButton";
  addButton.addEventListener('click', function() {
    addMarble(jarMarbles, jarCanvas.getContext('2d'));
  });

  // Create the "Remove Marble" button
  const removeButton = document.createElement('button');
  removeButton.textContent = '-1';
  removeButton.className = "minusButton";
  removeButton.addEventListener('click', function() {
    removeMarble(jarMarbles, jarCanvas.getContext('2d'));
  });

  // Create the "Remove Jar" button
  const removeJarButton = document.createElement('button');
  removeJarButton.textContent = 'Remove Jar';
  removeJarButton.addEventListener('click', function() {
    // Find the index of the current jar
    const index = Array.from(jarDiv.parentNode.children).indexOf(jarDiv);
    removeJar(index);
  });
  // Create the "Change Background Color" button
  const changeColorButton = document.createElement('input');
  changeColorButton.type = 'color';
  changeColorButton.value = rgbToHex(rVal,gVal,bVal); // Set default color //DOESN'T WORK BECAUSE NEEDS TO BE HEX!
  changeColorButton.addEventListener('input', function() {
    const newColor = changeColorButton.value;
    jarCanvas.style.backgroundColor = newColor;
  });
  // Append the jar div to the container
  jarContainer.appendChild(jarDiv);
  jarDiv.appendChild(nameInput);  
  jarDiv.appendChild(addButton);
  jarDiv.appendChild(removeButton);
  jarDiv.appendChild(changeColorButton);
  jarDiv.appendChild(jarCanvas);
  // Append the canvas and buttons to the jar div

  jarDiv.appendChild(removeJarButton);
  // Increment the jar count
  jarCount++;
  // Update container width if necessary
  adjustContainerWidth(jarCount);
 
  // Start animating marbles within this jar
  animate(jarMarbles, jarCanvas.getContext('2d'));
}

function adjustContainerWidth() {
  const jarContainer = document.getElementById('jars-container');
  const viewportWidth = window.innerWidth;
  const maxJarsInRow = Math.floor(viewportWidth / 300); // Assuming each jar is 300px wide
  const totalJars = document.querySelectorAll('.jar').length;
  
  let jarWidthPercentage;
  if (totalJars <= maxJarsInRow) {
    // All jars can fit in a single row
    jarWidthPercentage = 100;
  } else {
    // Jars need to be resized to fit on the screen
    jarWidthPercentage = (maxJarsInRow/totalJars)*100;
  }

  // Set the width for each jar canvas
  const jarCanvases = document.querySelectorAll('.jar canvas');
  jarCanvases.forEach(canvas => {
    canvas.style.width = jarWidthPercentage + '%';
  });
}
// Function to remove a jar
function removeJar(index) {
  // Remove the jar's div from the DOM
  const jarContainer = document.getElementById('jars-container');
  const jarToRemove = jarContainer.getElementsByClassName('jar')[index];
  jarToRemove.remove();
  // Decrement the jar count
  jarCount--;
  // Remove the jar from the jars array
  jars.splice(index, 1);
  adjustContainerWidth(jarCount);
}

// Function to add a marble to a specific jar
function addMarble(jarMarbles, ctx) {
  playMarbleSound();
  const radius = 30;
  const x =  ctx.canvas.width/2;
  const y = 0 + radius;
  const dx = (Math.random() - 0.5) * 5;
  const dy = (Math.random() - 0.5) * 5;
  const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

  const marbleImage = new Image();
  marbleImage.src = getRandomImageUrl();

  jarMarbles.push(new Marble(x, y, radius, marbleImage, dx, dy));
}

const imageUrls = [
  'images/1.png',
  'images/2.png',
  'images/3.png',
  'images/4.png',
  'images/5.png',
  'images/6.png',
  'images/7.png',
  'images/8.png',
  'images/9.png',
  'images/10.png',
  'images/11.png',
  'images/12.png',
  'images/13.png',
  'images/14.png',
  'images/15.png',
];

function getRandomImageUrl() {
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
}

// Function to remove a marble from a specific jar
function removeMarble(jarMarbles, ctx) {
  jarMarbles.shift();
  removeMarbleSound()
}

// Function to animate marbles within a jar
function animate(marbles, ctx) {
  requestAnimationFrame(() => animate(marbles, ctx));
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Text to show number of marbles in the jar
  ctx.font = "60px 'Rupe-Regular'";
  ctx.fillStyle = "black";
  ctx.textAlign = "right";
  ctx.fillText(marbles.length, ctx.canvas.width - 10, 50);

  marbles.forEach(marble => {
    handleCollision(marble, marbles);
    marble.update(ctx);
  });
}

// Marble class definition Optimise
function Marble(x, y, radius, image, dx, dy) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.image = image; // Use preloaded image directly
  this.dx = dx;
  this.dy = dy;
  this.rotation = 0; // Initial rotation angle
  this.angularVelocity = 0; // Initial angular velocity

  this.draw = function(ctx) {
    // Draw the marble image with rotation
    ctx.save(); // Save the current transformation state
    ctx.translate(this.x, this.y); // Translate to the center of the marble
    ctx.rotate(this.rotation); // Rotate by the current rotation angle
    ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2); // Draw the image
    ctx.restore(); // Restore the previous transformation state
  }

// // Marble class definition
// function Marble(x, y, radius, imageUrl, dx, dy) {
//   this.x = x;
//   this.y = y;
//   this.radius = radius;
//   this.imageUrl = imageUrl;
//   //this.color = color;
//   this.image
//   this.dx = dx;
//   this.dy = dy;
//   this.rotation = 0; // Initial rotation angle
//   this.angularVelocity = 0; // Initial angular velocity

//   this.draw = function(ctx) {
//     // Draw the marble image with rotation
//     const image = new Image();
//     image.src = this.imageUrl;
//     image.id = 'marbleImage'; // Set the id attribute

//     ctx.save(); // Save the current transformation state
//     ctx.translate(this.x, this.y); // Translate to the center of the marble
//     ctx.rotate(this.rotation); // Rotate by the current rotation angle
//     ctx.drawImage(image, -this.radius, -this.radius, this.radius * 2, this.radius * 2); // Draw the image
//     ctx.restore(); // Restore the previous transformation state
//   }

  // this.draw = function(ctx) {
  //   // Draw the marble on the canvas using the provided context (ctx)
  //   ctx.beginPath();
  //   ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  //   ctx.fillStyle = 'black';
  //   ctx.fill();
  //   ctx.closePath();
    
  //   ctx.beginPath();
  //   ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
  //   ctx.fillStyle = this.color;
  //   ctx.fill();
  //   ctx.closePath();
  // }

  this.update = function (ctx) {
    // Update position
    this.x += this.dx;
    this.y += this.dy;

    // Calculate linear velocity magnitude
    const linearVelocity = Math.sqrt(this.dx ** 2 + this.dy ** 2);

    // Calculate angular velocity based on linear velocity and radius
    this.angularVelocity = linearVelocity / this.radius;

    if (linearVelocity > 0.01) {
      this.rotation += 0.6* this.dx * this.angularVelocity; //* this.angularVelocity;
    }
    // Apply damping to angular velocity
    this.angularVelocity *= (1);

    // Handle collisions with walls
    if (this.x - this.radius <= 0 || this.x + this.radius >= ctx.canvas.width) {
      this.dx = -this.dx * friction; // Reverse direction and apply friction
    }
    	//Prevent phasing through left wall
    if (this.x - this.radius <= 0){
      this.x = this.radius;
    }
    //Prevent phasing through right wall
    if (this.x + this.radius >= ctx.canvas.width){
      this.x = ctx.canvas.width - this.radius;
    }

    // Handle collisions with floor
    if (this.y + this.radius >= jarHeight) {
      this.y = jarHeight - this.radius; // Prevent phasing through floor
      this.dy = -this.dy * friction; // Reverse direction and apply friction
    }

    // Apply gravity
    this.dy += gravity;

    // Limit minimum velocity to prevent excessive shaking
    if (Math.abs(this.dx) < 0.1) {
      this.dx = 0;
    }
    if (Math.abs(this.dy) < 0.1) {
      this.dy = 0;
    }

    this.draw(ctx);
  }
}
function handleCollision(marble, marbles) {
  marbles.forEach(otherMarble => {
    if (marble !== otherMarble) {
      const dx = otherMarble.x - marble.x;
      const dy = otherMarble.y - marble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < marble.radius + otherMarble.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate marble velocities
        const vx1 = marble.dx * cos + marble.dy * sin;
        const vy1 = marble.dy * cos - marble.dx * sin;
        const vx2 = otherMarble.dx * cos + otherMarble.dy * sin;
        const vy2 = otherMarble.dy * cos - otherMarble.dx * sin;

        // Swap velocities
        const vxTotal = vx1 - vx2;
        vx1Final = ballFriction* ((marble.radius - otherMarble.radius) * vx1 + 2 * otherMarble.radius * vx2) / (marble.radius + otherMarble.radius);
        vx2Final = ballFriction* (vxTotal + vx1Final);

        // Update velocities
        marble.dx = vx1Final * cos - vy1 * sin;
        marble.dy = vy1 * cos + vx1Final * sin;
        otherMarble.dx = vx2Final * cos - vy2 * sin;
        otherMarble.dy = vy2 * cos + vx2Final * sin;

        // Separate colliding marbles to avoid sticking
        const overlap = marble.radius + otherMarble.radius - distance;
        const moveX = overlap * Math.cos(angle);
        const moveY = overlap * Math.sin(angle);

        marble.x -= moveX;
        marble.y -= moveY;
        otherMarble.x += moveX;
        otherMarble.y += moveY;
      }
    }
  });
}

function playMarbleSound() {
  const marbleSound = document.getElementById('addMarbleSound');
  marbleSound.play();
}

function removeMarbleSound() {
  const marbleSound = document.getElementById('removeMarbleSound');
  marbleSound.play();
}

function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// Event listener for adding a jar
document.getElementById('add-jar-btn').addEventListener('click', addJar);

// Adjust container width initially and on window resize
window.addEventListener('resize', adjustContainerWidth);
adjustContainerWidth();


