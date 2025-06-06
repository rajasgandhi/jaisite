# Photography Section

This directory contains photographs for the interactive gallery.

## How to add photographs to the gallery

1. Place your image files in this directory (.jpg, .jpeg, or .png format works best)
2. Open the `/assets/js/photography.js` file
3. Add your photos to the `samplePhotos` array at the top of the file following this format:

```javascript
{ 
  url: '/docs/assets/images/photography/your-photo-name.jpg',
  date: 'June 5, 2025', // The date the photo was taken
  location: 'Boston, MA' // Location where the photo was taken
}
```

4. Save the file and your photos will appear in the gallery!

## Tips for best results

- For optimal display, use images that are at least 800px wide
- Keep file sizes reasonable (under 500KB per image) for faster loading
- Try to maintain consistent aspect ratios for more uniform appearance
- JPEG format with 80-90% quality is a good balance of quality and file size
