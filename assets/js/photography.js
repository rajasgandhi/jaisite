document.addEventListener("DOMContentLoaded", function() {
  const gallery       = document.getElementById("photography-gallery");
  const photoModal    = document.getElementById("photo-modal");
  const modalImg      = document.getElementById("modal-img");
  const modalDate     = document.getElementById("modal-date");
  const modalLocation = document.getElementById("modal-location");
  const closeModal    = document.querySelector(".close-modal");

  let isDragging   = false;
  let currentBrick = null;
  let offsetX      = 0;
  let offsetY      = 0;

  // We'll track the velocity in px/ms for each brick while dragging
  // (vx, vy) will get set on eachmousemove/touchmove.
  let vx = 0, vy = 0;

  // Keep a list of all brick DIVs to “fling” them later if needed
  let bricks = [];

  // ─────────────── Create photo bricks ─────────────────
  function createPhotoBricks() {
    photos.forEach((photo, index) => {
      const brick = document.createElement("div");
      brick.className = "photo-brick";
      brick.style.backgroundImage = `url(${photo.url})`;

      // random initial position
      const randomTop  = Math.random() * (gallery.offsetHeight - 100);
      const randomLeft = Math.random() * (gallery.offsetWidth - 150);

      brick.style.top       = `${randomTop}px`;
      brick.style.left      = `${randomLeft}px`;
      brick.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;

      // store which photo index this brick represents
      brick.dataset.index = index;

      gallery.appendChild(brick);
      bricks.push(brick);

      // ---------------- Click (to open modal) ----------------
      // We only open the modal if the user did NOT "move" (flick/drag) this brick.
      // We'll flip a flag (brick._wasMoved) to know if they dragged it.
      brick._wasMoved = false;
      brick.addEventListener("click", function(e) {
        if (brick._wasMoved === false) {
          const photoData = photos[this.dataset.index];
          modalImg.src          = photoData.url;
          modalDate.textContent = photoData.date;
          modalLocation.textContent = photoData.location;
          photoModal.style.display = "block";
        }
        // reset for next time:
        brick._wasMoved = false;
      });

      // ---------------- Drag / Touch Start ----------------
      brick.addEventListener("mousedown", startDrag);
      brick.addEventListener("touchstart", startDrag, { passive: false });
    });
  }

  // ─────────────── Drag / Flick Logic ─────────────────

  function startDrag(e) {
    e.preventDefault();

    // mark dragging
    isDragging   = true;
    currentBrick = this;
    vx = 0; vy = 0;                           // reset velocity
    currentBrick._wasMoved = false;           // initially, we haven't moved yet

    // bring this brick to front
    currentBrick.style.zIndex = 10;

    // figure out where inside the brick we clicked/touched
    const event    = (e.touches ? e.touches[0] : e);
    const rect     = currentBrick.getBoundingClientRect();
    offsetX        = event.clientX - rect.left;
    offsetY        = event.clientY - rect.top;

    // We'll use these to compute velocity (px/ms):
    currentBrick._lastX    = event.clientX;
    currentBrick._lastY    = event.clientY;
    currentBrick._lastTime = performance.now();

    // Listen for move/end events
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  function moveDrag(e) {
    if (!isDragging || !currentBrick) return;
    e.preventDefault();

    const event = (e.touches ? e.touches[0] : e);
    const now   = performance.now();

    // Compute instantaneous velocity = Δpixels / Δms
    const dx      = event.clientX - currentBrick._lastX;
    const dy      = event.clientY - currentBrick._lastY;
    const dt      = now - currentBrick._lastTime; // in ms

    if (dt > 0) {
      vx = dx / dt;  // px per ms
      vy = dy / dt;
    }

    currentBrick._lastX    = event.clientX;
    currentBrick._lastY    = event.clientY;
    currentBrick._lastTime = now;

    // Move the brick to follow the cursor/finger, clamped inside the gallery
    const galleryRect = gallery.getBoundingClientRect();
    let x = event.clientX - galleryRect.left - offsetX;
    let y = event.clientY - galleryRect.top  - offsetY;

    // Boundaries:
    const maxX = gallery.offsetWidth  - currentBrick.offsetWidth;
    const maxY = gallery.offsetHeight - currentBrick.offsetHeight;
    x = Math.min(Math.max(0, x), maxX);
    y = Math.min(Math.max(0, y), maxY);

    currentBrick.style.left = `${x}px`;
    currentBrick.style.top  = `${y}px`;

    // Note: if the brick actually moved by more than a few pixels, mark it as "wasMoved"
    if (Math.abs(dx) + Math.abs(dy) > 2) {
      currentBrick._wasMoved = true;
    }
  }

  function endDrag() {
    if (!isDragging || !currentBrick) return;

    isDragging = false;

    // After a short delay, send this brick back to normal z-index
    setTimeout(() => {
      if (currentBrick) currentBrick.style.zIndex = 1;
    }, 200);

    // Remove move/end listeners
    document.removeEventListener("mousemove", moveDrag);
    document.removeEventListener("touchmove", moveDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchend", endDrag);

    // If we did actually move it, start the inertia/bounce animation:
    if (currentBrick._wasMoved) {
      flingBrickWithPhysics(currentBrick, vx, vy);
    }

    // clear currentBrick reference so we don't accidentally use it later
    currentBrick = null;
    vx = 0; vy = 0;
  }

  // ─────────────── Physics / Inertia / Bounce ─────────────────

  function flingBrickWithPhysics(brick, initVx, initVy) {
    let velocityX = initVx; // px per ms
    let velocityY = initVy; // px per ms

    // We’ll store the timestamp of the previous animation frame:
    let lastTimestamp = null;

    function step(timestamp) {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        requestAnimationFrame(step);
        return;
      }

      // Δt in ms
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Current position
      let left = parseFloat(brick.style.left);
      let top  = parseFloat(brick.style.top);

      // Move according to velocity
      // (since velocityX is px/ms, multiplying by dt [ms] gives px delta)
      let nextX = left + velocityX * dt;
      let nextY = top  + velocityY * dt;

      // Gallery bounds
      const maxX = gallery.offsetWidth  - brick.offsetWidth;
      const maxY = gallery.offsetHeight - brick.offsetHeight;

      // If we hit left/right walls, bounce on X
      if (nextX < 0) {
        nextX = 0;
        velocityX = -velocityX;
      } else if (nextX > maxX) {
        nextX = maxX;
        velocityX = -velocityX;
      }

      // If we hit top/bottom walls, bounce on Y
      if (nextY < 0) {
        nextY = 0;
        velocityY = -velocityY;
      } else if (nextY > maxY) {
        nextY = maxY;
        velocityY = -velocityY;
      }

      // Apply friction (slow down over time). Tweak the “0.98” factor if you want more/less drag.
      velocityX *= 0.98;
      velocityY *= 0.98;

      // Update the brick’s position
      brick.style.left = `${nextX}px`;
      brick.style.top  = `${nextY}px`;

      // If velocity is still “noticeable,” keep animating
      if (Math.abs(velocityX) > 0.02 || Math.abs(velocityY) > 0.02) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ─────────────── “Fling All Bricks” on double‐click empty area ─────────────────
  function initFlingBehaviour() {
    gallery.addEventListener("dblclick", function(e) {
      if (e.target === gallery) {
        flingAllBricks();
      }
    });
    gallery.addEventListener("click", function(e) {
      // Single‐click on empty space also flings all bricks
      if (e.target === gallery) {
        flingAllBricks();
      }
    });
  }

  function flingAllBricks() {
    bricks.forEach(brick => {
      // random target position & rotation
      const randomTop      = Math.random() * (gallery.offsetHeight - 100);
      const randomLeft     = Math.random() * (gallery.offsetWidth - 150);
      const randomRotation = Math.random() * 20 - 10;

      brick.style.transition = "all 0.8s ease-out";
      brick.style.top       = `${randomTop}px`;
      brick.style.left      = `${randomLeft}px`;
      brick.style.transform = `rotate(${randomRotation}deg)`;

      setTimeout(() => {
        brick.style.transition = "";
      }, 1000);
    });
  }

  // ─────────────── Modal Closing ─────────────────
  closeModal.addEventListener("click", function() {
    photoModal.style.display = "none";
  });

  window.addEventListener("click", function(e) {
    if (e.target === photoModal) {
      photoModal.style.display = "none";
    }
  });

  // ─────────────── Window Resize Handling ─────────────────
  window.addEventListener("resize", function() {
    // If the container got smaller, ensure bricks stay in‐bounds:
    bricks.forEach(brick => {
      const maxX = gallery.offsetWidth  - brick.offsetWidth;
      const maxY = gallery.offsetHeight - brick.offsetHeight;
      let x     = parseInt(brick.style.left);
      let y     = parseInt(brick.style.top);

      if (x > maxX) brick.style.left = `${maxX}px`;
      if (y > maxY) brick.style.top  = `${maxY}px`;
    });
  });

  // ─────────────── Initialize ─────────────────
  createPhotoBricks();
  initFlingBehaviour();
});
