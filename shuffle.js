module.exports = {
    shuffle:function shuffleArray(array) { 
    for (let i = array.length - 1; i > 0; i--) {  
     
        // Generate random number  
        let j = Math.floor(Math.random() * (i + 1)); 
                     
        let temp = array[i]; 
        array[i] = array[j]; 
        array[j] = temp; 
    } 
    
    return array; 
},
convert:function convertExcelToList() {
    EmpNames = [];
    const excelToJson = require('convert-excel-to-json');
    const result = excelToJson({
        sourceFile: 'test.xlsx'
    });
    //console.log(result);
    for(let i = 0;i<result.Gift_links.length;i++) {
        let doc = result.Gift_links[i];
        if(doc["A"] != undefined){
            EmpNames.push(doc["A"]);
        }
    }
    return EmpNames;
}}