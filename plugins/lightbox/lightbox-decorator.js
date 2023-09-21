const LightboxDecorator = {
  decorate: function(settings) {
    let images = document.querySelectorAll(settings.imageSelector);
    let resizeDuration = settings.resizeDuration ?? 200;

    // Attach lightbox functionality to every image
    images.forEach((img) => {
      // Wrap every image inside an <a href> element.    
      let linkWrapper = document.createElement("a");
      linkWrapper.className = "post-image-link";
      linkWrapper.setAttribute("data-lightbox", "post-image");
      linkWrapper.setAttribute("href", img.getAttribute("src"));
      img.parentNode.insertBefore(linkWrapper, img);
      linkWrapper.appendChild(img);
    
      // Attach caption element based on <img> title attribute
      if (settings.captionEnabled && img.title) {
        let imgCaption = document.createElement("div");
        imgCaption.setAttribute("class", "post-image-caption");
        imgCaption.innerHTML = img.title;
        linkWrapper.after(imgCaption);
      }
    });

    // Activate the lightbox functionality
    lightbox.option({
      'resizeDuration': resizeDuration
    });
  }
};