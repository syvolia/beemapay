// carrierChecker.js

// Define the dial code prefixes for each carrier with no overlaps
const safaricomPrefixes = [
    "700",
    "701",
    "702",
    "703",
    "704",
    "705",
    "706",
    "707",
    "708",
    "709",
    "710",
    "711",
    "712",
    "713",
    "714",
    "715",
    "716",
    "717",
    "718",
    "719",
    "720",
    "721",
    "722",
    "723",
    "724",
    "725",
    "726",
    "727",
    "728",
    "729",
    "740",
    "741",
    "742",
    "743",
    "745",
    "746",
    "748",
    "757",
    "758",
    "759",
    "768",
    "769",
    "790",
    "791",
    "792",
    "793",
    "794",
    "795",
    "796",
    "797",
    "798",
    "799",
    "110",
    "111",
    "112",
    "113",
    "114",
    "115",
    "116",
    "117", // New Safaricom codes
];

const airtelPrefixes = [
    "730",
    "731",
    "732",
    "733",
    "734",
    "735",
    "736",
    "737",
    "738",
    "739",
    "750",
    "751",
    "752",
    "753",
    "754",
    "755",
    "756",
    "762",
    "767",
    "780",
    "781",
    "782",
    "783",
    "784",
    "785",
    "786",
    "787",
    "788",
    "789",
    "100",
    "101",
    "102",
    "103",
    "104",
    "105",
    "106",
    "107",
    "108", // New Airtel codes
];

const telkomPrefixes = [
    "770",
    "771",
    "772",
    "773",
    "774",
    "775",
    "776",
    "777",
    "778",
    "779",
];

/**
 * Normalizes a Kenyan phone number by removing non-numeric characters,
 * country codes, and leading zeros.
 *
 * @param {string} number - The phone number to normalize.
 * @returns {string} - The normalized phone number.
 */
function normalizeNumber(number) {
    number = number.replace(/[\s\-()]/g, ""); // Remove spaces, hyphens, parentheses

    // Remove the country code if present
    if (number.startsWith("+254")) {
        number = number.substring(4);
    } else if (number.startsWith("254")) {
        number = number.substring(3);
    }

    // Remove leading zero if present
    if (number.startsWith("0")) {
        number = number.substring(1);
    }

    return number;
}

/**
 * Determines the mobile carrier based on the phone number's dial code.
 *
 * @param {string} phoneNumber - The phone number to check.
 * @returns {string} - The name of the mobile carrier or "Unknown Carrier" if not found.
 */
function checkMobileCarrier(phoneNumber) {
    const normalizedNumber = normalizeNumber(phoneNumber);

    if (normalizedNumber.length < 3) {
        return "Unknown Carrier";
    }

    const prefix = normalizedNumber.substring(0, 3);

    if (safaricomPrefixes.includes(prefix)) {
        return "Safaricom";
    } else if (airtelPrefixes.includes(prefix)) {
        return "Airtel";
    } else if (telkomPrefixes.includes(prefix)) {
        return "Telkom";
    } else {
        return "Unknown Carrier";
    }
}

// Export the checkMobileCarrier function for use in other files
module.exports = {
    checkMobileCarrier,
};
