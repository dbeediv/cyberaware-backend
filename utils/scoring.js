function getScoreDelta(event) {
  if (event === 'clicked')   return -15;
  if (event === 'submitted') return -30;
  if (event === 'reported')  return +15;
  if (event === 'training')  return +10;
  return 0;
}

module.exports = { getScoreDelta };
