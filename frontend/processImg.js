const Jimp = require('jimp');

async function processImg() {
  try {
    const img = await Jimp.read('public/logo.png');
    const threshold = 15; // Set lower so we don't accidentally erase dark hair, but the background is solid black (0,0,0)
    
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx+1];
      const b = this.bitmap.data[idx+2];
      
      // If it's pure black or very close
      if (r <= threshold && g <= threshold && b <= threshold) {
        this.bitmap.data[idx+3] = 0; // Alpha to 0
      }
    });

    await img.writeAsync('public/logo.png');
    console.log("Image processed successfully!");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

processImg();
