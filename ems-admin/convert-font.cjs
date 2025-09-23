// convert-font.js
const fs = require("fs");

// Adjust path if your font is inside src/fonts
const fontFile = "src/fonts/NotoSansEthiopic-Regular.ttf";  
const fontData = fs.readFileSync(fontFile);
const base64 = fontData.toString("base64");

console.log(base64);
