/** Goat Theme Editor - Color Utilities
 * @file GoatThemeEditorColorUtils.js
 * @description Contains utility functions for parsing, formatting, and
 * calculating contrast for colors, building upon the GoatColorToolbox library.
 * @license MIT
 * @author Chase McGoat
 */

function parseColorString(str) {
    if (typeof str !== 'string') return null;
    str = str.trim();
    let originalInputFormat = null;
    let originalPrefix = "";
    let originalUsesCommas = false;
    let originalHadExplicitAlpha = false;
    const lowerStr = str.toLowerCase();

    if (lowerStr.startsWith('#') || /^(0x)?[0-9a-f]+$/i.test(str)) {
        originalInputFormat = "hex";
        if (str.startsWith('#')) originalPrefix = "#";
        else if (lowerStr.startsWith('0x')) originalPrefix = str.substring(0, 2);
        const hexContent = str.replace(/^#|^0x/i, '');
        if (hexContent.length === 4 || hexContent.length === 8 || (hexContent.length === 10 && lowerStr.startsWith('0x'))) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("rgb")) {
        originalInputFormat = "rgb";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (str.includes('/') || (originalPrefix.toLowerCase() === 'rgba' && str.split(originalUsesCommas ? ',' : ' ').length > 3)) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("hsl")) {
        originalInputFormat = "hsl";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (str.includes('/') || (originalPrefix.toLowerCase() === 'hsla' && str.split(originalUsesCommas ? ',' : ' ').length > 3)) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("oklch")) {
        originalInputFormat = "oklch";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes('/')) originalHadExplicitAlpha = true;
    }

    const gc = new GoatColor(str);
    if (gc.isValid()) {
        const rgb = gc.toRgb();
        const rHex = Math.round(rgb.r).toString(16).padStart(2, '0');
        const gHex = Math.round(rgb.g).toString(16).padStart(2, '0');
        const bHex = Math.round(rgb.b).toString(16).padStart(2, '0');
        const internalHex = (rHex + gHex + bHex).toUpperCase();
        return {
            hex: internalHex,
            alpha: gc.a,
            goatColor: gc,
            originalString: str,
            inputFormat: originalInputFormat || "unknown",
            originalPrefix: originalPrefix,
            originalUsesCommas: originalUsesCommas,
            originalHadExplicitAlpha: originalHadExplicitAlpha,
        };
    }
    return null;
}

function formatColorForOutput(colorInfo) {
    if (!colorInfo || !colorInfo.goatColor || !colorInfo.goatColor.isValid()) {
        return colorInfo && typeof colorInfo.originalString === 'string' ? colorInfo.originalString : "#000000";
    }
    const gc = colorInfo.goatColor;
    const inputFormat = colorInfo.inputFormat;
    const originalPrefix = colorInfo.originalPrefix || "";
    const usesCommas = colorInfo.originalUsesCommas;
    const outputAlpha = colorInfo.originalHadExplicitAlpha || gc.a < 1 ||
        (originalPrefix.toLowerCase().endsWith('a') && originalPrefix.length > 3);
    let outputString = "";

    switch (inputFormat) {
        case "hex":
            const originalHexContent = colorInfo.originalString.replace(/^#|^0x/i, '');
            const isShortHexLen = originalHexContent.length === 3 || originalHexContent.length === 4;
            if (outputAlpha) {
                const shortHexa = gc.toHexaShort();
                outputString = isShortHexLen && shortHexa ? shortHexa : gc.toHexa();
            } else {
                const shortHex = gc.toHexShort();
                outputString = isShortHexLen && shortHex ? shortHex : gc.toHex();
            }
            if (originalPrefix.toLowerCase() === "0x") {
                if (outputString.startsWith("#")) {
                    if (outputString.length === 9) {
                        outputString = originalPrefix + outputString.substring(7, 9) + outputString.substring(1, 7);
                    } else if (outputString.length === 5 && outputString.charAt(0) === '#') {
                        const r = outputString[1] + outputString[1];
                        const g = outputString[2] + outputString[2];
                        const b = outputString[3] + outputString[3];
                        const a_val = outputString[4] + outputString[4];
                        outputString = originalPrefix + a_val + r + g + b;
                    } else {
                        outputString = originalPrefix + outputString.substring(1);
                    }
                }
            } else if (originalPrefix === "" && outputString.startsWith("#")) {
                outputString = outputString.substring(1);
            } else if (originalPrefix === "#" && !outputString.startsWith("#")) {
                outputString = "#" + outputString;
            }
            break;
        case "rgb":
            let rgbBaseString = outputAlpha ? gc.toRgbaString(usesCommas) : gc.toRgbString(usesCommas);
            if (originalPrefix && rgbBaseString.toLowerCase().startsWith(originalPrefix.toLowerCase())) {
                outputString = originalPrefix + rgbBaseString.substring(originalPrefix.length);
            } else if (originalPrefix && outputAlpha && originalPrefix.toLowerCase() === "rgb" && rgbBaseString.toLowerCase().startsWith("rgba")) {
                let newPrefixAttempt = originalPrefix + "a";
                if (rgbBaseString.toLowerCase().startsWith(newPrefixAttempt.toLowerCase())) {
                    outputString = newPrefixAttempt + rgbBaseString.substring(newPrefixAttempt.length);
                } else { outputString = rgbBaseString; }
            } else { outputString = rgbBaseString; }
            break;
        case "hsl":
            let hslBaseString = outputAlpha ? gc.toHslaString(usesCommas) : gc.toHslString(usesCommas);
            if (originalPrefix && hslBaseString.toLowerCase().startsWith(originalPrefix.toLowerCase())) {
                outputString = originalPrefix + hslBaseString.substring(originalPrefix.length);
            } else { outputString = hslBaseString; }
            break;
        case "oklch":
            outputString = outputAlpha ? gc.toOklchaString() : gc.toOklchString();
            break;
        default:
            outputString = gc.toString("auto");
            if (outputString.startsWith("#")) {
                if (originalPrefix.toLowerCase() === "0x") {
                    if (outputString.length === 9) {
                        outputString = originalPrefix + outputString.substring(7, 9) + outputString.substring(1, 7);
                    } else { outputString = originalPrefix + outputString.substring(1); }
                } else if (originalPrefix === "") {
                    outputString = outputString.substring(1);
                }
            }
            break;
    }
    return outputString;
}

function normalizeHex(hexInput) {
    const gc = new GoatColor(hexInput);
    return gc.isValid() ? gc.toHex().substring(1).toUpperCase() : '000000';
}

function getContrastingBackground(textColorHex) {
    const lightCandidate = '#FFFFFF';
    const darkCandidate = '#282828';
    const contrastWithLight = GoatColor.getContrastRatio(textColorHex, lightCandidate);
    if (contrastWithLight >= 4.5) {
        return lightCandidate;
    }
    const contrastWithDark = GoatColor.getContrastRatio(textColorHex, darkCandidate);
    if (contrastWithDark >= 4.5) {
        return darkCandidate;
    }
    return contrastWithLight > contrastWithDark ? lightCandidate : darkCandidate;
}