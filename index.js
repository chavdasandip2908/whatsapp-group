const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const readline = require('readline');

// Function to extract phone numbers from Excel
function extractPhoneNumbers(filePath) {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Assuming phone numbers are stored in a column named "Phone"
    const phoneNumbers = jsonData.map(row => row.Phone);

    return phoneNumbers;
}

// Function to wait for user input ("yes")
function waitForUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(question, ans => {
        rl.close();
        resolve(ans.toLowerCase() === 'yes');
    }));
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

async function createWhatsAppGroup(phoneNumbers) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to WhatsApp Web with extended timeout
    try {
        await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2', timeout: 120000 });  // Increased timeout to 120 seconds
    } catch (error) {
        console.error('Error navigating to WhatsApp Web:', error);
        await browser.close();
        return;
    }

    // Prompt user to scan the QR code and confirm
    console.log('Please scan the QR code in WhatsApp Web.');

    const isReady = await waitForUserInput('Have you scanned the QR code and logged in? Type "yes" to continue: ');

    if (!isReady) {
        console.log('Please scan the QR code and log in before proceeding.');
        await browser.close();
        return;
    }

    // Click on the menu button to reveal options (including "New group")
    await page.waitForSelector('div[aria-label="Menu"]', { timeout: 60000 });  // Correct the selector to the menu button with extended timeout
    await page.click('div[aria-label="Menu"]');

    // Wait for and click the "New group" button inside the <li> tag
    try {
        await page.waitForSelector('li>div[aria-label="New group"]', { timeout: 60000 });  // Adjusted selector for "New group" with extended timeout
        await page.click('li>div[aria-label="New group"]');
    } catch (error) {
        // Capture a screenshot to see what's on the page for debugging
        await page.screenshot({ path: 'error_screenshot.png' });
        console.error('Failed to find "New group" button:', error);
        await browser.close();
        return;
    }

    // Type each phone number into the search input and press Enter
    for (let phoneNumber of phoneNumbers) {
        await page.waitForSelector('#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x9desvi.x1gz9zih.xsag5q8.x1b9tyad.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x150wa6m > div > div > div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.x1q0g3np.x1cy8zhl > input', { timeout: 60000 });
        await page.type('#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x9desvi.x1gz9zih.xsag5q8.x1b9tyad.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x150wa6m > div > div > div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.x1q0g3np.x1cy8zhl > input', phoneNumber.toString());
        await delay(1000);
        try {
            await page.waitForSelector("#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x1n2onr6.x1n2onr6.x1iyjqo2.xs83m0k.x1r8uery.x6ikm8r.x1odjw0f.x150wa6m > div[role='button']", { timeout: 60000 });
            await page.click("#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x1n2onr6.x1n2onr6.x1iyjqo2.xs83m0k.x1r8uery.x6ikm8r.x1odjw0f.x150wa6m > div[role='button']");
        } catch (e) {
            try {
                await page.waitForSelector("#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x1n2onr6.x1n2onr6.x1iyjqo2.xs83m0k.x1r8uery.x6ikm8r.x1odjw0f.x150wa6m > div > div > div > div > div[role='button'] > div", { timeout: 60000 });
                await page.click("#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x1n2onr6.x1n2onr6.x1iyjqo2.xs83m0k.x1r8uery.x6ikm8r.x1odjw0f.x150wa6m > div > div > div > div > div[role='button'] > div");
            } catch (e2) {

                await page.waitForSelector("#app > div > div.two._aigs > div._aigu > div._aohf._aigv._aigw._aigx > span > div > span > div > div > div.x1n2onr6.x1n2onr6.x1iyjqo2.xs83m0k.x1r8uery.x6ikm8r.x1odjw0f.x150wa6m > div > div > span", { timeout: 60000 });


            }
        }
        await delay(1000);

    }

    // Click the "Next" button after all numbers are entered
    await page.waitForSelector('div[aria-label="Next"]', { timeout: 60000 });
    await page.click('div[aria-label="Next"]');

    // Enter a group name (you can customize the group name here)
    // await page.waitForSelector('input[placeholder="Group subject"]', { timeout: 60000 });
    // await page.type('input[placeholder="Group subject"]', 'My WhatsApp Group');

    // Click the "Create group" button
    await page.waitForSelector('div[aria-label="Create group"]', { timeout: 60000 });
    await page.click('div[aria-label="Create group"]');

    console.log('WhatsApp group created successfully!');
    // await browser.close();
}


// Example usage
const filePath = './contacts.xlsx'; // Path to your Excel file
const phoneNumbers = extractPhoneNumbers(filePath);
createWhatsAppGroup(phoneNumbers);
// console.log("phoneNumbers :: ", phoneNumbers);
