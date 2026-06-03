function toHexByte(value) {
    return Math.round(Math.min(Math.max(value, 0), 255)).toString(16).padStart(2, '0');
}

function formatAlpha(a) {
    if (Math.abs(a - 1) < 0.0001) return '1';
    return parseFloat(a.toFixed(8)).toString();
}

function hexToShort(hex) {
    if (hex.length !== 7) return null;
    if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
        return '#' + hex[1] + hex[3] + hex[5];
    }
    return null;
}

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

    const c = colordx(str);
    if (c.isValid()) {
        const rgb = c.toRgb();
        const rHex = Math.round(rgb.r).toString(16).padStart(2, '0');
        const gHex = Math.round(rgb.g).toString(16).padStart(2, '0');
        const bHex = Math.round(rgb.b).toString(16).padStart(2, '0');
        const internalHex = (rHex + gHex + bHex).toUpperCase();
        return {
            hex: internalHex,
            alpha: c.alpha(),
            instance: c,
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
    if (!colorInfo || !colorInfo.instance || !colorInfo.instance.isValid()) {
        return colorInfo && typeof colorInfo.originalString === 'string' ? colorInfo.originalString : "#000000";
    }
    const c = colorInfo.instance;
    const inputFormat = colorInfo.inputFormat;
    const originalPrefix = colorInfo.originalPrefix || "";
    const usesCommas = colorInfo.originalUsesCommas;
    const outputAlpha = colorInfo.originalHadExplicitAlpha || c.alpha() < 1 ||
        (originalPrefix.toLowerCase().endsWith('a') && originalPrefix.length > 3);
    let outputString = "";

    switch (inputFormat) {
        case "hex": {
            const originalHexContent = colorInfo.originalString.replace(/^#|^0x/i, '');
            const isShortHexLen = originalHexContent.length === 3 || originalHexContent.length === 4;
            const hex = c.toHex();
            if (outputAlpha) {
                const hexa = hex.length === 7 ? hex + toHexByte(c.alpha() * 255) : hex;
                outputString = isShortHexLen ? hexToShort(hexa) || hexa : hexa;
            } else {
                const hexNoAlpha = hex.length > 7 ? hex.substring(0, 7) : hex;
                outputString = isShortHexLen ? hexToShort(hexNoAlpha) || hexNoAlpha : hexNoAlpha;
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
            }
            break;
        }
        case "rgb": {
            const rgb = c.toRgb();
            const r = Math.round(rgb.r);
            const g = Math.round(rgb.g);
            const b = Math.round(rgb.b);
            const a = rgb.alpha;
            if (usesCommas) {
                if (outputAlpha) {
                    outputString = `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})`;
                } else {
                    outputString = `rgb(${r}, ${g}, ${b})`;
                }
            } else {
                if (outputAlpha) {
                    outputString = `rgb(${r} ${g} ${b} / ${formatAlpha(a)})`;
                } else {
                    outputString = `rgb(${r} ${g} ${b})`;
                }
            }
            if (originalPrefix) {
                const funcName = outputString.substring(0, outputString.indexOf('('));
                if (funcName.toLowerCase() !== originalPrefix.toLowerCase()) {
                    outputString = originalPrefix + outputString.substring(funcName.length);
                }
            }
            break;
        }
        case "hsl": {
            const hsl = c.toHsl();
            const h = Math.round(hsl.h);
            const s = Math.round(hsl.s);
            const l = Math.round(hsl.l);
            const a = hsl.alpha;
            if (usesCommas) {
                if (outputAlpha) {
                    outputString = `hsla(${h}, ${s}%, ${l}%, ${formatAlpha(a)})`;
                } else {
                    outputString = `hsl(${h}, ${s}%, ${l}%)`;
                }
            } else {
                if (outputAlpha) {
                    outputString = `hsl(${h} ${s}% ${l}% / ${formatAlpha(a)})`;
                } else {
                    outputString = `hsl(${h} ${s}% ${l}%)`;
                }
            }
            if (originalPrefix) {
                const funcName = outputString.substring(0, outputString.indexOf('('));
                if (funcName.toLowerCase() !== originalPrefix.toLowerCase()) {
                    outputString = originalPrefix + outputString.substring(funcName.length);
                }
            }
            break;
        }
        case "oklch": {
            outputString = c.toOklchString();
            break;
        }
        default:
            outputString = c.toHex();
            if (outputAlpha) {
                outputString += toHexByte(c.alpha() * 255).toUpperCase();
            }
            if (outputString.startsWith("#")) {
                if (originalPrefix.toLowerCase() === "0x") {
                    if (outputAlpha) {
                        outputString = originalPrefix + outputString.substring(7, 9) + outputString.substring(1, 7);
                    } else {
                        outputString = originalPrefix + outputString.substring(1);
                    }
                } else if (originalPrefix === "") {
                    outputString = outputString.substring(1);
                }
            }
            break;
    }
    return outputString;
}

function normalizeHex(hexInput) {
    const c = colordx(hexInput);
    return c.isValid() ? c.toHex().substring(1, 7).toUpperCase() : '000000';
}

function getContrastingBackground(textColorHex) {
    const textColor = colordx(textColorHex);
    const lightCandidate = '#FFFFFF';
    const darkCandidate = '#282828';
    const contrastWithLight = textColor.contrast(colordx(lightCandidate));
    if (contrastWithLight >= 4.5) {
        return lightCandidate;
    }
    const contrastWithDark = textColor.contrast(colordx(darkCandidate));
    if (contrastWithDark >= 4.5) {
        return darkCandidate;
    }
    return contrastWithLight > contrastWithDark ? lightCandidate : darkCandidate;
}

window.parseColorString = parseColorString;
window.formatColorForOutput = formatColorForOutput;
window.normalizeHex = normalizeHex;
window.getContrastingBackground = getContrastingBackground;
