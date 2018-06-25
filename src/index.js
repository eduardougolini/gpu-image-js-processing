const BLACK_AND_WHITE = "0";
const MOSAIC = "1";
const INVERTED = "2";

function processImage() {
  let processingType = document.getElementById("processing-type").value;
  let processType = document.getElementById("process-type").value;
  let gpu = new GPU({
    mode:  processType
  });

  let blackAndWhiteFilter = gpu.createKernel(function(image) {
    const pixel = image[this.thread.y][this.thread.x];
    const red = pixel[0];
    const green = pixel[1];
    const blue = pixel[2];

    const pixelColor = (red + green + blue) / 3;

    this.color(pixelColor, pixelColor, pixelColor, pixel[3]);
  }, {
    output : getOutputArray(),
    graphical: true
  });

  let mosaic = gpu.createKernel(function(image, w, h) {
    let yOriginalPosition = this.thread.y;
    let xOriginalPosition = this.thread.x;
    while (yOriginalPosition >= h) {
      yOriginalPosition -= h;
    }
    while (xOriginalPosition >= w) {
      xOriginalPosition -= w;
    }
    const pixel = image[yOriginalPosition][xOriginalPosition];
    this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
  }, {
    output : getOutputArray('mosaic'),
    graphical: true
  });

  let invertedFilter = gpu.createKernel(function(image) {
    const pixel = image[this.thread.y][this.thread.x];
    const red = 1 - pixel[0];
    const green = 1 - pixel[1];
    const blue = 1 - pixel[2];

    this.color(red, green, blue, pixel[3]);
  }, {
    output : getOutputArray(),
    graphical: true
  });

  let image = document.createElement('img');
  image.src = document.getElementById("image").value;
  document.querySelector('.output-block').innerHTML = "";
  
  switch(processingType) {
  case BLACK_AND_WHITE:
    document.querySelector('.output-block').insertBefore(blackAndWhiteFilter.getCanvas(), document.querySelector('.output-block').children[0]);
    break;
  case MOSAIC:
    document.querySelector('.output-block').insertBefore(mosaic.getCanvas(), document.querySelector('.output-block').children[0]);
    break;
  case INVERTED:
    document.querySelector('.output-block').insertBefore(invertedFilter.getCanvas(), document.querySelector('.output-block').children[0]);
    break;
  }
    
  document.querySelector('.output-block').insertBefore(image, document.querySelector('.output-block').children[0]);
  
  image.onload = function () {
    let t0 = performance.now();
    
    switch(processingType) {
      case BLACK_AND_WHITE:
        blackAndWhiteFilter(image);
        break;
      case MOSAIC:
        mosaic(image, image.width, image.height);
        break;
      case INVERTED:
        invertedFilter(image);
        break;
    }

    let t1 = performance.now();

    let h3 = document.createElement("h3");
    h3.innerHTML = `Demorou ${t1 - t0} milisegundos.`;
    document.querySelector('.output-block').insertBefore(h3, document.querySelector('.output-block').children[0]);
  };
}

function getOutputArray(type) {
  let elt = document.getElementById('image');

  if (elt.options[elt.selectedIndex].text === 'lenna') {
    if (type === 'mosaic') {
      return [2560, 2560];
    }

    return [512, 512];
  }

  if (type === 'mosaic') {
    return [1380, 915];
  }

  return [276, 183];
}