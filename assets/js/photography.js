document.addEventListener("DOMContentLoaded", function() {
  const gallery = document.getElementById('photography-gallery');
  const photoModal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');
  const modalDate = document.getElementById('modal-date');
  const modalLocation = document.getElementById('modal-location');
  const closeModal = document.querySelector('.close-modal');
  
  let isDragging = false;
  let currentBrick = null;
  let offsetX = 0, offsetY = 0;
  let bricks = [];
  
  // Create photo bricks
  function createPhotoBricks() {
    photos.forEach((photo, index) => {
      const brick = document.createElement('div');
      brick.className = 'photo-brick';
      brick.style.backgroundImage = `url(${photo.url})`;
      
      // Position randomly within the container
      const randomTop = Math.random() * (gallery.offsetHeight - 100);
      const randomLeft = Math.random() * (gallery.offsetWidth - 150);
      
      brick.style.top = `${randomTop}px`;
      brick.style.left = `${randomLeft}px`;
      brick.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
      
      // Store photo data
      brick.dataset.index = index;
      
      gallery.appendChild(brick);
      bricks.push(brick);
      
      // Add click event for enlarging
      brick.addEventListener('click', function(e) {
        if (!isDragging) {
          const photoData = photos[this.dataset.index];
          modalImg.src = photoData.url;
          modalDate.textContent = photoData.date;
          modalLocation.textContent = photoData.location;
          photoModal.style.display = 'block';
        }
      });
      
      // Add drag events
      brick.addEventListener('mousedown', startDrag);
      brick.addEventListener('touchstart', startDrag, { passive: false });
    });
  }
  
  // Drag functionality
  function startDrag(e) {
    e.preventDefault();
    
    // Bring to front
    this.style.zIndex = 10;
    
    isDragging = true;
    currentBrick = this;
    
    // Calculate the initial position
    const event = e.touches ? e.touches[0] : e;
    const brickRect = currentBrick.getBoundingClientRect();
    
    offsetX = event.clientX - brickRect.left;
    offsetY = event.clientY - brickRect.top;
    
    // Add event listeners for move and end
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }
  
  function moveDrag(e) {
    if (!isDragging) return;
    
    const event = e.touches ? e.touches[0] : e;
    
    // Calculate the new position
    const galleryRect = gallery.getBoundingClientRect();
    const x = event.clientX - galleryRect.left - offsetX;
    const y = event.clientY - galleryRect.top - offsetY;
    
    // Set bounds
    const maxX = gallery.offsetWidth - currentBrick.offsetWidth;
    const maxY = gallery.offsetHeight - currentBrick.offsetHeight;
    
    // Update position within bounds
    currentBrick.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
    currentBrick.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
  }
  
  function endDrag() {
    isDragging = false;
    
    if (currentBrick) {
      // Reset z-index (still keeping stacking order)
      setTimeout(() => {
        currentBrick.style.zIndex = 1;
      }, 200);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
  }
  
  // Add fling functionality
  function initFlingBehaviour() {
    gallery.addEventListener('click', function(e) {
      if (e.target === gallery) {
        flingAllBricks();
      }
    });
    
    // Double click on empty space to fling all bricks
    gallery.addEventListener('dblclick', function(e) {
      if (e.target === gallery) {
        flingAllBricks();
      }
    });
  }
  
  function flingAllBricks() {
    bricks.forEach(brick => {
      // Random position
      const randomTop = Math.random() * (gallery.offsetHeight - 100);
      const randomLeft = Math.random() * (gallery.offsetWidth - 150);
      const randomRotation = Math.random() * 20 - 10;
      
      // Animate to new position
      brick.style.transition = 'all 0.8s ease-out';
      brick.style.top = `${randomTop}px`;
      brick.style.left = `${randomLeft}px`;
      brick.style.transform = `rotate(${randomRotation}deg)`;
      
      // Remove transition after animation completes
      setTimeout(() => {
        brick.style.transition = '';
      }, 800);
    });
  }
  
  // Close modal
  closeModal.addEventListener('click', function() {
    photoModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === photoModal) {
      photoModal.style.display = 'none';
    }
  });
  
  // Initialize
  createPhotoBricks();
  initFlingBehaviour();
  
  // Window resize handling
  window.addEventListener('resize', function() {
    // Ensure bricks stay within container when window is resized
    bricks.forEach(brick => {
      const maxX = gallery.offsetWidth - brick.offsetWidth;
      const maxY = gallery.offsetHeight - brick.offsetHeight;
      
      const currentX = parseInt(brick.style.left);
      const currentY = parseInt(brick.style.top);
      
      if (currentX > maxX) brick.style.left = `${maxX}px`;
      if (currentY > maxY) brick.style.top = `${maxY}px`;
    });
  });
});
