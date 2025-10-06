// ../data/test.config.ts
export const TestConfig = {
    // 👉 Pan & Token Inquiry 
    // Pan to Token  
    panNumber: ["1111", "1111", "1111", "1"],
    expiry: "1225",
    incompliteExpiryDate: "12",
    token: "1111-1149-3111-1",   // ✅ should corresponding to cardNumber
    invalidPanNumber: ["0000", "0000", "0000", "00"],
    invalidExpiry: "0925",
    companyCode: "1a01111",
    cardIdentificationNumber: "111100",

    //Token to Pan
    tokenNumber: ["1111", "1111", "1111", "1"],
    expectedCardNumber: "1111117641111",      // ✅ should corresponding to TokenNumber
    invalidTokenNumber: ["1111", "1111", "1111", "1"],

    


    // 👉 File Upload / Hnadling
    uploadFileName: "20250627_002  1.csv",   // ✅ file name here
    fileNumber: 1,         // ✅ new
    recordCount: 5555,      // ✅ new


    // 👉 Operation Data & Time
    userId: "rushikesh.wasule@dgfuturetech.com",
    unregistered_userId: "test.test@dgfuturetech.com",
    username: "RushikeshWasule",
    contract1: "K&K",
    contract2: "e-BIS",
    
    

    // 👉 Operation History
    
};