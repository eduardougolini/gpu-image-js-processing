function processImage() {
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

  let image = document.createElement('img');
  image.src = document.getElementById("image").value;
  document.querySelector('.output-block').innerHTML = "";
  document.querySelector('.output-block').insertBefore(blackAndWhiteFilter.getCanvas(), document.querySelector('.output-block').children[0]);
  document.querySelector('.output-block').insertBefore(image, document.querySelector('.output-block').children[0]);
  image.onload = function () {
    let t0 = performance.now();
    blackAndWhiteFilter(image);
    let t1 = performance.now();

    let h3 = document.createElement("h3");
    h3.innerHTML = `Demorou ${t1 - t0} milisegundos.`;
    document.querySelector('.output-block').insertBefore(h3, document.querySelector('.output-block').children[0]);
  };
}

function getOutputArray() {
  let elt = document.getElementById('image');

  if (elt.options[elt.selectedIndex].text === 'lenna') {
    return [512, 512];
  }

  return [276, 183];
}