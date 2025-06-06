---
layout: custompage
title: Shot on iPhone
nav_order: 4
---

<div class="photography-container">
  <div id="photography-gallery" class="photography-gallery">
    <!-- Photos will be loaded dynamically -->
  </div>
</div>

<div id="photo-modal" class="photo-modal">
  <span class="close-modal">&times;</span>
  <img class="modal-content" id="modal-img">

  <div id="modal-caption">
    <p id="modal-date"></p>
    <p id="modal-location"></p>
  </div>
</div>
<!-- <script>
  // Sample photo data - will be replaced with actual photos later
  const samplePhotos = [
    { 
      url: '{{ site.url }}/assets/images/cocktail-party-1.jpg',
      date: 'December 1, 2023',
      location: 'Boston, MA'
    },
    { 
      url: '{{ site.url }}/assets/images/cocktail-party-2.jpg',
      date: 'December 1, 2023',
      location: 'Boston, MA'
    },
    { 
      url: '{{ site.url }}/assets/images/game-night-1.jpeg',
      date: 'January 1, 2025',
      location: 'Cambridge, MA'
    },
    { 
      url: '{{ site.url }}/assets/images/game-night-2.jpeg',
      date: 'January 1, 2025',
      location: 'Cambridge, MA'
    }
    // More photos will be added later
  ];
</script> -->
{% assign photo_files = site.static_files | where_exp:"f","f.path contains '/assets/images/photography'" %}
<script>
  const photos = [
  {% for f in photo_files %}
    {% assign meta = site.data.photos[f.name] %}
    {
        url: "{{ site.url }}{{ f.path }}",  // url: "{{ f.path | relative_url }}",
        date: "{{ meta.date }}",       // you can fill these in manually or via a data file
        location: "{{ meta.location }}"
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
  ];
</script>

<script src="{{ site.url }}/assets/js/photography.js"></script>
