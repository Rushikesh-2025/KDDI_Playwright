import AdmZip from "adm-zip";

const zip = new AdmZip();
zip.addLocalFolder("./allure-report");
zip.writeZip("./allure-report.zip");

console.log("✅ Allure report zipped successfully!");
