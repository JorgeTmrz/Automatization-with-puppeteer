const fs = require("fs");
const puppeteer = require("puppeteer");
const pdfDocument = require("pdfkit");

// This function recieves a Cedula and returns the response from the page
async function checkRegistered (Cedulas) {
    // Initializing puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var response = [];
    var result;
    
    // Going to Pa´ti Page
    await page.goto("https://pati.hacienda.gob.do/inicio", {waitUntil: "load"});
    
    await Promise.all(Cedulas.map(async (ced) =>{
        page.$("#documento");

        // Selecting input, typing and submiting
        await page.focus(".documento_con_mascara");
        await page.type(".documento_con_mascara", ced);
        await page.keyboard.press("Enter");

        // getting information back
        await page.waitForNavigation({waitUntil: "load"});
        result = await page.evaluate(() => document.querySelector(".user-information").lastElementChild.textContent)
        response.push(`${ced} - ${result}`);
    }));
    // Closing the browser
    browser.close();
    console.log(response);
    // returning the page response
    return response;

}

// reading the txt file
fs.readFile("src/Cedulas.txt", "utf8", async (err, data) => {
    // handling errors with the file
    if (err){
        console.log(err);
        return
    }
    // managing data from teh file
    const ceds = data.split(",");
    const cedsProcessed = await checkRegistered(ceds);
    
    // putting cedulas on a PDF
    const doc = new pdfDocument();
    doc.pipe(fs.createWriteStream("./result.pdf"));
    cedsProcessed.forEach(ced => {
        doc.text(ced);
        doc.moveDown();
    })
    doc.end();
})