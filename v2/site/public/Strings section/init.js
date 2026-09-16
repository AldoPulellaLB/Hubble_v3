// Initialize the section once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('#network-strings-demo');
  if (!el) return;

  new StringsViewport(el, {
    color: '#1748DF',
    rotationSeconds: 220,
    labelFadeMs: 2700,
    labelHoldMs: 5800,
    labelStaggerMs: 900,
    labelGapMs: 1150,
    centerPulsePeriod: 1.75,
    centerPulseLifetime: 1.9,
    centerPulseStrength: 18
  });
});
