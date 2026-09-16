# Implementation guide

## 1) Add the markup
Paste the contents of `section.html` where you want the section to appear.

## 2) Add the CSS
Include `section.css` in your global stylesheet or import it into your component.

## 3) Add the JavaScript
Load `strings-effect.js` first, then `init.js` after it.

### Example HTML includes
```html
<link rel="stylesheet" href="./section.css">
<script src="./strings-effect.js" defer></script>
<script src="./init.js" defer></script>
```

## 4) Height / layout
The section is designed to work as a full-width page section with a tall visual area.
You can reduce or increase section height by editing:
- `.network-strings-section`
- `.network-strings-viewport`

## 5) Behavior included
- slow rotation of the string circle
- three visible labels
- labels only outside the upper half
- labels never rise above the top of the circle
- dot-to-ring connection on label hover
- soft center pulse on center hover
- cursor-based string deformation

## 6) Main tuning options
In `init.js` you can adjust:
- `rotationSeconds`
- `labelFadeMs`
- `labelHoldMs`
- `labelStaggerMs`
- `labelGapMs`
- `centerPulsePeriod`
- `centerPulseLifetime`
- `centerPulseStrength`

## 7) Claude Code prompt hint
If you are asking Claude Code to implement this section, tell it:
- use `section.html` as the markup
- use `section.css` as the scoped section stylesheet
- load `strings-effect.js` and then `init.js`
- preserve the colors `#F7F7F7` and `#1748DF`
- keep labels constrained below the top of the circle
