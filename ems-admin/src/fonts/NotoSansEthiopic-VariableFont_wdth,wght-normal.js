import jsPDF from "jspdf";

(function(jsPDFAPI){
    if (!jsPDF || !jsPDF.API) return;
    const callAddFont = function(){
        this.addFileToVFS(
            "NotoSansEthiopic-VariableFont_wdth,wght-normal.ttf",
            "<YOUR_BASE64_STRING_HERE>"
        );
        this.addFont(
            "NotoSansEthiopic-VariableFont_wdth,wght-normal.ttf",
            "NotoSansEthiopic-VariableFont_wdth,wght",
            "normal"
        );
    };
    jsPDFAPI.events.push(["addFonts", callAddFont]);
})(jsPDF.API);
