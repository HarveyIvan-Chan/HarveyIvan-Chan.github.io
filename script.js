function bcdToDpd(first, second, third) {

    // use AND operation with mask, shift bits to check if 0 or 1
    const a = (first & 8) >> 3, b = (first & 4) >> 2, c = (first & 2) >> 1, d = first & 1;
    const e = (second & 8) >> 3, f = (second & 4) >> 2, g = (second & 2) >> 1, h = second & 1;
    const i = (third & 8) >> 3, j = (third & 4) >> 2, k = (third & 2) >> 1, m = third & 1;

    let dpd = 0;

    //shift bits to position as indicated on conversion tables
    if (a === 0 && e === 0 && i === 0) {
        dpd = (b << 9) | (c << 8) | (d << 7) | (f << 6) | (g << 5) | (h << 4) | (0 << 3) | (j << 2) | (k << 1) | m;
    } else if (a === 0 && e === 0 && i === 1) {
        dpd = (b << 9) | (c << 8) | (d << 7) | (f << 6) | (g << 5) | (h << 4) | (1 << 3) | (0 << 2) | (0 << 1) | m;
    } else if (a === 0 && e === 1 && i === 0) {
        dpd = (b << 9) | (c << 8) | (d << 7) | (j << 6) | (k << 5) | (h << 4) | (1 << 3) | (0 << 2) | (1 << 1) | m;
    } else if (a === 1 && e === 0 && i === 0) {
        dpd = (j << 9) | (k << 8) | (d << 7) | (f << 6) | (g << 5) | (h << 4) | (1 << 3) | (1 << 2) | (0 << 1) | m;
    } else if (a === 1 && e === 1 && i === 0) {
        dpd = (j << 9) | (k << 8) | (d << 7) | (0 << 6) | (0 << 5) | (h << 4) | (1 << 3) | (1 << 2) | (1 << 1) | m;
    } else if (a === 1 && e === 0 && i === 1) {
        dpd = (f << 9) | (g << 8) | (d << 7) | (0 << 6) | (1 << 5) | (h << 4) | (1 << 3) | (1 << 2) | (1 << 1) | m;
    } else if (a === 0 && e === 1 && i === 1) {
        dpd = (b << 9) | (c << 8) | (d << 7) | (1 << 6) | (0 << 5) | (h << 4) | (1 << 3) | (1 << 2) | (1 << 1) | m;
    } else if (a === 1 && e === 1 && i === 1) {
        dpd = (0 << 9) | (0 << 8) | (d << 7) | (1 << 6) | (1 << 5) | (h << 4) | (1 << 3) | (1 << 2) | (1 << 1) | m;
    }

    return dpd.toString(2);
}

function startBackgroundEffect() {
    const effectElement = document.getElementById('backgroundEffect');
    effectElement.innerHTML = ''; // Clear previous content

    const numRows = Math.floor(window.innerHeight / 16); // Adjust based on font-size
    const numCols = Math.floor(window.innerWidth / 8);  // Adjust based on font-size

    // Create a grid of 0s and 1s
    for (let i = 0; i < numRows; i++) {
        let row = '';
        for (let j = 0; j < numCols; j++) {
            row += Math.random() < 0.5 ? '0' : '1';
        }
        effectElement.innerHTML += row + '<br>';
    }

    effectElement.style.display = 'block';

    // Fade out the effect after a short time
    setTimeout(() => {
        effectElement.style.opacity = 1;
        effectElement.style.transition = 'opacity 1s ease-out';
        effectElement.style.opacity = 0;
        setTimeout(() => {
            effectElement.style.display = 'none';
            effectElement.style.opacity = 1; // Reset opacity for next use
        }, 1000);
    }, 100); // Start effect immediately
}

function convert() {
    const decimalValue = document.getElementById('decimalInput').value;
    const roundingMethod = document.getElementById('roundingMethod').value;
    var binaryOutput = "";
    var hexOutput = "";

    if (validate(decimalValue)){
        // Convert to Decimal-32
        binaryOutput = decimal32ToBinary(decimalValue, roundingMethod);
        hexOutput = binaryToHex(binaryOutput);
    }
    else{
        binaryOutput = "0 11111 000000 00000000000000000000";
        hexOutput = "7C000000";
    }

    document.getElementById('binaryOutput').innerText = binaryOutput;
    document.getElementById('hexOutput').innerText = hexOutput;
    startBackgroundEffect();
}

// validates input if NaN
// assumptions:
// if input is .0x10^1 assume 0.0x10^1, 
// if input is x10^1 assume 0x10^1
// if input is 0x10^ assume 0x10^0
function validate(string){
    let numPoints = (string.match(/\./g) || []).length;
    let numPow = (string.match(/\^/g) || []).length;
    let numX = (string.match(/\x/g) || []).length;

    if (!/^[0-9.x^-]*$/.test(string))
        return false;

    if ((string.match(/\./g) || []).length > 1)
        return false;

    if ((string.match(/\^/g) || []).length != 1)
        return false;

    if ((string.match(/\-/g) || []).length > 2)
        return false;

    if (string.includes("--"))
        return false;

    if ((string.match(/x/g) || []).length != 1)
        return false;

    // input 
    return string.includes("x10^");
}

function decimal32ToBinary(value, round) {
    // Declare string
    let outputBinary = '';

    // Convert decimal to a string and extract the integer and fractional parts
    let [decimalString, pow] = value.toString().split('x');
    let [base10, expString] = pow.toString().split('^');

    // Sign bit
    if (decimalString[0] == '-') {
        outputBinary += '1 ';
        decimalString = decimalString.substring(1);
    } else if (decimalString[0] == "+") {
        outputBinary += '0 ';
        decimalString = decimalString.substring(1);
    } else {
        outputBinary += '0 ';
    }

    // cases for multiple zeros/zero extended numbers
    let front = "";
    let back = "";

    if (decimalString.includes(".")){
        [front, back] = decimalString.split('.');

        if (front === "")
            front = "0";

        if (back === "")
            back = "0";

        if (/^0+$/.test(back)){
            decimalString = parseInt(front).toString();
        }
        
        decimalString = parseInt(front).toString() + "." + back;
    }
    else{
        if (decimalString === "")
            decimalString = "0";

        if (/^0+$/.test(decimalString))
            decimalString = "0";
    }

    //check length of string & fractional part of coefficient
    //then appends the nearest fractional digit for rounding
    let wholeStr = decimalString.replace('.','');
    let decimalPlaces = decimalString.includes('.') ? decimalString.split('.')[1].length : 0;
	let wholePlaces = decimalString.includes('.') ? decimalString.split('.')[0].length : decimalString.length;

    // if input is .0x10^1 assume 0.0x10^1, 
    // if input is x10^1 assume 0x10^1
    if(wholePlaces === 0){
        wholeStr = "0" + wholeStr;
        wholePlaces = 1;
    }

    wholeStr = parseInt(wholeStr).toString();

    if(wholeStr.length <= 7){
            let rightExtend = 7 - wholeStr.length;
            let zeroExtend = "0".repeat(rightExtend);
            rightExtend = +expString - 7 + wholeStr.length - decimalPlaces; 
            expString = rightExtend.toString();
            wholeStr = wholeStr + zeroExtend  + ".0";
        } 
    else if (wholeStr.length > 7){
            let moveLeft = 0
            if(wholePlaces >= 7){
                moveLeft = wholePlaces - 7;
                moveLeft += +expString;
            }
            else{
                moveLeft = 7 - wholePlaces;
                moveLeft = +expString - 7 + wholePlaces;
            }
            wholeStr = wholeStr.slice(0,7) + "." + wholeStr.slice(7,8);
            
            expString = moveLeft.toString();
        }

    //prepare for rounding
    let [wholePart, fracPart] = wholeStr.split('.');
    
    //overflow
    if (+expString > 90){
        outputBinary += "11110 000000 00000000000000000000"
        return outputBinary;
    }

    // Perform rounding based on user choice
    // toZero is truncation
    // toPosInf is ceiling
    // toNegInf is floor
    // toNearAway is if fractional >= .5,
    //               if positive then ceiling, else floors
    //               if fractional < .5, truncates
    // toNearEven is similar to toNearAway, but ties (.5) towards nearest even
    if (round === 'toZero') {
        decimalString = wholePart;
    } else if (round === 'toPosInf') {
        if ((wholePart === "9999999" && +fracPart > 0) && +expString >= 90 && outputBinary === '0 '){
            outputBinary += "11110 000000 00000000000000000000"
            return outputBinary;
        }
        else if (+fracPart > 0 && outputBinary === '0 ')
            decimalString = (+wholePart + 1).toString();
        else
            decimalString = wholePart;
    } else if (round === 'toNegInf') {
        if ((wholePart === "9999999" && +fracPart > 0) && +expString >= 90 && outputBinary === '1 '){
            outputBinary += "11110 000000 00000000000000000000"
            return outputBinary;
        }
        else if (+fracPart > 0 && outputBinary === '1 ')
            decimalString = (+wholePart + 1).toString();
        else
            decimalString = wholePart;
    } else if (round === 'toNearAway') {
        if ((wholePart === "9999999" && +fracPart > 5) && +expString >= 90){
            outputBinary += "11110 000000 00000000000000000000"
            return outputBinary;
        }
        else if (+fracPart >= 5)
            decimalString = (+wholePart + 1).toString();
        else
            decimalString = wholePart;
    } else if (round === 'toNearEven') {
        if ((wholePart === "9999999" && +fracPart >= 5) && +expString >= 90){
            outputBinary += "11110 000000 00000000000000000000"
            return outputBinary;
        }
        else if (+fracPart > 5)
            decimalString = (+wholePart + 1).toString();
        else if (+fracPart === 5){
            if (+wholePart % 2 === 0)
                decimalString = wholePart;
            else
                decimalString = (+wholePart + 1).toString();
        }
        else
            decimalString = wholePart;
    }


    // Get exponent bias (e')
    let expBias = +expString;
    expBias += 101;
    expBias = expBias.toString(2);
    while (expBias.length < 8) {
        expBias = "0" + expBias;
    }

    // Get binary value of MSD
    MSDBinary = parseInt(decimalString[0]).toString(2);
    while (MSDBinary.length < 4) {
        MSDBinary = "0" + MSDBinary;
    }

    // Create combination field
    // First, check MSD
    if (decimalString[0] < '8') {
        outputBinary += expBias[0];
        outputBinary += expBias[1];
        outputBinary += MSDBinary[1];
        outputBinary += MSDBinary[2];
        outputBinary += MSDBinary[3];
    } else {
        outputBinary += '11';
        outputBinary += expBias[0];
        outputBinary += expBias[1];
        outputBinary += MSDBinary[3];
    }

    // Exponent continuation
    outputBinary += ' ' + expBias.substring(2);

    // Coefficient continuation
    let coeffCont = bcdToDpd(+decimalString[1], +decimalString[2], +decimalString[3]) + bcdToDpd(+decimalString[4], +decimalString[5], +decimalString[6]);
    while (coeffCont.length < 20) {
        coeffCont = "0" + coeffCont;
    }
    outputBinary += " " + coeffCont;

    return outputBinary;
}

function binaryToHex(binary) {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
        const chunk = binary.substring(i, i + 4);
        hex += parseInt(chunk, 2).toString(16);
    }
    return hex.toUpperCase();
}

function downloadOutput() {
    const binaryOutput = document.getElementById('binaryOutput').innerText;
    const hexOutput = document.getElementById('hexOutput').innerText;
    const content = `Binary Output: ${binaryOutput}\nHexadecimal Output: ${hexOutput}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
}
