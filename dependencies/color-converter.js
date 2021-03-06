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
  return hexListStr.split(',').map(hexToRgb).map(rgbToRgba, {opacity});
}


function generateColorMap (hexListString, opacity, keys) {
  const pairs = hexListString.split(', ').map(hex => {
    return [
      rgbToRgba.apply({opacity: 1}, [hexToRgb(hex)]),
      rgbToRgba.apply({opacity: opacity}, [hexToRgb(hex)])
    ];
  });

  const newMap = {};
  keys.forEach((k,i) => {
    newMap[k] = pairs[i];
  });
  return newMap;
}

const emotions= [
  'anger',
  'fear',
  'joy',
  'surprise',
  'sadness',
  'sentiment'
];

const politicalParties = [
  'libertarian',
  'green',
  'liberal',
  'conservative'
];

const personalityTraits = [
  'extraversion',
  'openness',
  'agreeableness',
  'conscientiousness'
];

// =======================================
// keeping different color palettes here
// get my colors here: https://javier.xyz/cohesive-colors/
// =======================================
// ideal chart colors should be easily distinguishable
const blueishHL = '#365FA3, #9DD98A, #9A77C7, #D5475A, #FCE4A8, #4FCCED';
const randomHL = '#4E1C48, #61627D, #92C5C4, #F3E3D1, #E43E61, #D3FFE7';
const gentleGtoR = '#92A0A4, #ADAFA8, #E4D0B1, #E4AAAB, #E488A4, #C16F6D'; // better for gradient than chart
const pinksToGreens = '#FE2A57, #FB788C, #F6BAA1, #AFB39D, #4B918D, #3D494A';
const standard = '#3E455A, #A4CF4C, #A15697, #D83332, #FCDD5D, #5BBEDE';
const standardHalfDark = '#2B303F, #94C635, #913C85, #D12423, #FCD741, #3FB3D8';
const politicalHexes = '#E5E34B, #66CA89, #4DA0BD, #E96767';
const green2reds = '#6E4B4B, #687279, #55A8A3, #B4DEA8';
const personalityHexes = '#399CB8, #9FF29C, #9CC4D6, #D67466';
// const newEmotions = '#4B5683, #AED66F, #AC6CB3, #DC4049, #FDE288, #6DC8E7';
const newEmotions = '#4B5683, #71D66F, #AC6CB3, #DC4049, #FDE288, #6DC8E7';
const newerEmotions = '#4458A6, #65D97A, #A474BA, #D84550, #D8CF68, #399EBA';
const newestEmotions = '#2C379E, #9F1991, #AC3016, #B3A025, #178D25, #077A91';
const newPersonalities = '#DAAA5A, #58CCB4, #BE7DDA, #CE2960';
const emotionWheel = '#CC421E, #178D25, #E4DF53, #4DBAC5, #303BB3, #B759D2';
// =======================================

const emotionColorMap = generateColorMap(emotionWheel, .4, emotions);
const politicalColorMap = generateColorMap(politicalHexes, .4, politicalParties);
const personalityColorMap = generateColorMap(newPersonalities, .4, personalityTraits);
// console.log('emotion', emotionColorMap);
// console.log('political:', politicalColorMap);
// console.log('personality:', personalityColorMap);


module.exports = {
  emotionColorMap,
  politicalColorMap,
  personalityColorMap
}
