// takes in string of hex codes and returns rgb and rgb values with specified opacity
// Used with values from this site: https://javier.xyz/cohesive-colors/

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    console.log('m', m);
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var specs = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;

  var formatted = `rgb(${specs.r}, ${specs.g}, ${specs.b})`

  return formatted;
}

function rgbToRgba(rgb) {
  const parts = rgb.split(/\(|\)/);
  return `rgba(${parts[1]}, ${this.opacity})`;
}

function hexToRGBa (hexListStr, opacity) {
  return hexListStr.split(', ').map(hexToRgb).map(rgbToRgba, {opacity});
}


function generateColorMap (hexListString, opacity) {
  const pairs = hexListString.split(', ').map(hex => {
    return [
      rgbToRgba.apply({opacity: 1}, [hexToRgb(hex)]),
      rgbToRgba.apply({opacity: opacity}, [hexToRgb(hex)])
    ];
  });

  // table for orderomg emotion by color
  const emotions = {
    'sentiment': 1,
    'anger': 3,
    'fear': 4,
    'joy': 5,
    'sadness': 0,
    'surprise': 2
  };
  const colormap = {};
  for (let e of Object.keys(emotions)) {
    colormap[e] = pairs[emotions[e]];
  }
  return colormap;
}


// =======================================
// keeping different color palettes here
// =======================================
// ideal chart colors should be easily distinguishable
const blueishHL = '#365FA3, #9DD98A, #9A77C7, #D5475A, #FCE4A8, #4FCCED';
const randomHL = '#4E1C48, #61627D, #92C5C4, #F3E3D1, #E43E61, #D3FFE7';
const gentleGtoR = '#92A0A4, #ADAFA8, #E4D0B1, #E4AAAB, #E488A4, #C16F6D'; // better for gradient than chart
const pinksToGreens = '#FE2A57, #FB788C, #F6BAA1, #AFB39D, #4B918D, #3D494A';
const standard = '#3E455A, #A4CF4C, #A15697, #D83332, #FCDD5D, #5BBEDE';
const standardHalfDark = '#2B303F, #94C635, #913C85, #D12423, #FCD741, #3FB3D8';

// =======================================


// const blueishCM = generateColorMap(blueishHL);

console.log(generateColorMap(standard, 0.3));

module.exports = {
  hexToRgb,
  hexToRGBa,
  generateColormap: o => generateColorMap(standardHalfDark, o)
}
