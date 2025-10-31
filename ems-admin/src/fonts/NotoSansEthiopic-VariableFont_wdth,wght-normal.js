import jsPDF from "jspdf";

(function (jsPDFAPI) {
  if (!jsPDF || !jsPDF.API) return;
  const callAddFont = function () {
    this.addFileToVFS(
      "NotoSansEthiopic-VariableFont_wdth,wght-normal.ttf",
      "<YOUR_BASE64_STRING_HERE>" // Ensure the Base64 string is correct
    );
    this.addFont(
      "NotoSansEthiopic-VariableFont_wdth,wght-normal.ttf",
      "NotoSansEthiopic", // Use a simpler, consistent font name
      "normal"
    );
  };
  jsPDFAPI.events.push(["addFonts", callAddFont]);
})(jsPDF.API);