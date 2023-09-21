const MasonryWrapper = {
  wrap: function(settings) {
    let articleElement = document.querySelector(settings.galleryParent);
    let galleryImages = document.querySelectorAll(settings.galleryImageSelector);
    let gallery = {};

    // This will wrap around the entire gallery.
    gallery = document.createElement('div');
    gallery.id = 'masonry-grid';
    gallery.className = 'grid';
    
    // This element is used to determine the gallery's column widths.
    // @see https://masonry.desandro.com/options#element-sizing:~:text=Layout-,Element%20sizing,-Sizing%20options%20columnWidth
    let gridSizer = document.createElement('div');
    gridSizer.className = 'grid-sizer';
    gallery.appendChild(gridSizer);
    
    // Find all the gallery images and move them into the gallery.
    galleryImages.forEach((image) => {
      // Sometimes, `image` is literally the <img> element
      let imageElement = image;

      // Other times, `image` is the parent of the actual <img> element.
      if (imageElement.tagName != 'img') {
        imageElement = image.querySelector('img'); 

        // Some classes applied to the actual <img> element need to be re-applied to the parent
        // So that the image behaves properly in the masonry grid
        if (imageElement.classList.contains('grid-item--width2')) {
          image.classList.add('grid-item--width2');
        }
      }

      // Add class to image to indicate its a masonry grid item
      image.classList.add('grid-item');

      // Add the image to the gallery
      gallery.appendChild(image);
    });

    // Now that gallery is fully constructed, add it to the end of the article
    articleElement.appendChild(gallery);

    // Initiate the masonry behavior, but wait until after all the images have finished loading
    let masonryContext;
    imagesLoaded( gallery, function() {
      // init Isotope after all images have loaded
      masonryContext = new Masonry( '#masonry-grid', {
        itemSelector: '.post-image-link',
        columnWidth: '.grid-sizer',
        percentPosition: true
      });
    });

    // Return the copmlete gallery element
    return gallery;
  },
};