const color1 = 'rgb(170, 0, 0)';
const color2 = 'rgb(0, 170, 0)';


function genNextColor(c1, c2, factor) {
  const cNew = [];
  for (let i in c1) {
    cNew.push(Math.round(c1[i] + factor * (c2[i] - c1[i])));
  }
  return cNew;
}

function createGradient(color1, color2, numColors, opacity) {
  const stepFactor = 1 / (numColors - 1)
  const gradient = [];
  let c1 = color1.match(/\d+/g).map(Number);
  let c2 = color2.match(/\d+/g).map(Number);
  for (let i = 0; i < numColors; i++) {
    gradient.push(genNextColor(c1, c2, stepFactor * i));
  }
  const solids =  gradient.map(c => `rgba(${c.join(',')})`);
  // if (opacity) {
  //   // translucents = solids.map()
  // }
  return solids;
}

createGradient(color1, color2, 11);

module.exports = createGradient;

console.log(createGradient('rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)', 10));
