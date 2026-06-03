// node_modules/@colordx/core/dist/chunk-IOXRZECH.mjs
var t = (n, r, e) => Math.min(Math.max(n, r), e);
var s = (n, r = 0) => {
  let e = 10 ** r;
  return Math.round(e * n) / e;
};
var u = (n) => n >= 0 && n < 360 ? n : (n % 360 + 360) % 360;
var m = { deg: 1, grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) };
var i = (n) => typeof n == "number";
var c = (n) => Number.isNaN(n) ? 0 : n;
var p = (n) => typeof n == "object" && n !== null && !Array.isArray(n);
var a = (n, r) => r.every((e) => (e in n));
var o = "[+-]?\\d*\\.?\\d+";
var N = `(?:none|${o})`;
var x = (n) => n.toLowerCase() === "none" ? 0 : Number(n);

// node_modules/@colordx/core/dist/chunk-RJNXPIQM.mjs
var h = Array.from({ length: 256 }, (t2, r) => r.toString(16).padStart(2, "0"));
var n = (t2) => h[t(Math.round(t2), 0, 255)];
var s2 = (t2) => (t2 & 15) + 9 * (t2 >> 6);
var a2 = (t2, r) => s2(t2.charCodeAt(r)) << 4 | s2(t2.charCodeAt(r + 1));
var i2 = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
var p2 = (t2) => {
  if (typeof t2 != "string")
    return null;
  let r = t2.trim();
  if (!i2.test(r))
    return null;
  let o2 = r.length;
  if (o2 === 4 || o2 === 5) {
    let e = s2(r.charCodeAt(1)), c2 = s2(r.charCodeAt(2)), b$1 = s2(r.charCodeAt(3)), l = o2 === 5 ? s2(r.charCodeAt(4)) : 15;
    return { r: e | e << 4, g: c2 | c2 << 4, b: b$1 | b$1 << 4, alpha: s((l | l << 4) / 255, 3) };
  }
  return { r: a2(r, 1), g: a2(r, 3), b: a2(r, 5), alpha: o2 === 9 ? s(a2(r, 7) / 255, 3) : 1 };
};
var x2 = ({ r: t2, g: r, b: o2, alpha: e }) => {
  let c2 = "#" + n(t2) + n(r) + n(o2);
  return e < 1 ? c2 + n(e * 255) : c2;
};
var f = ({ r: t2, g: r, b: o2, alpha: e }) => "#" + n(t2) + n(r) + n(o2) + n(e * 255);

// node_modules/@colordx/core/dist/chunk-YLJRINFM.mjs
var s3 = (r) => {
  let n2 = Math.abs(r), e = n2 <= 0.04045 ? n2 / 12.92 : ((n2 + 0.055) / 1.055) ** 2.4;
  return r < 0 ? -e : e;
};
var a3 = (r) => {
  let n2 = Math.abs(r), e = n2 <= 0.0031308 ? 12.92 * n2 : 1.055 * n2 ** (1 / 2.4) - 0.055;
  return r < 0 ? -e : e;
};
var t2 = 1.09929682680944;
var o2 = 0.018053968510807;
var b = (r) => {
  let n2 = Math.abs(r), e = n2 < o2 * 4.5 ? n2 / 4.5 : ((n2 + t2 - 1) / t2) ** (1 / 0.45);
  return r < 0 ? -e : e;
};

// node_modules/@colordx/core/dist/chunk-Q3O3QQ4H.mjs
var $ = (s4) => ({ r: t(s4.r, 0, 255), g: t(s4.g, 0, 255), b: t(s4.b, 0, 255), alpha: t(s(s4.alpha, 3), 0, 1) });
var x3 = (s4) => {
  if (!p(s4))
    return null;
  let n2 = s4.colorSpace;
  if (n2 === "display-p3" || n2 === "rec2020" || !a(s4, ["r", "g", "b"]))
    return null;
  let { r: e, g: t3, b: c2, alpha: l = 1 } = s4;
  return !i(e) || !i(t3) || !i(c2) || !i(l) ? null : $({ r: c(e), g: c(t3), b: c(c2), alpha: c(l) });
};
var y = new RegExp(`^rgba?\\(\\s*(?<r>${N})(?<rp>%?)\\s*(?:,\\s*(?<g_c>${N})(?<gp_c>%?)\\s*,\\s*(?<b_c>${N})(?<bp_c>%?)(?:\\s*,\\s*(?<al_c>${N})(?<alp_c>%?))?\\s*|\\s+(?<g_s>${N})(?<gp_s>%?)\\s+(?<b_s>${N})(?<bp_s>%?)(?:\\s*/\\s*(?<al_s>${N})(?<alp_s>%?))?\\s*)\\)$`, "i");
var N2 = (s4) => {
  if (typeof s4 != "string")
    return null;
  let n2 = y.exec(s4.trim())?.groups;
  if (!n2)
    return null;
  let e = n2.g_c !== undefined, t3 = n2.g_c ?? n2.g_s, c2 = n2.b_c ?? n2.b_s, l$1 = !!n2.rp, _ = !!(n2.gp_c ?? n2.gp_s), b2 = !!(n2.bp_c ?? n2.bp_s), m2 = l$1 ? x(n2.r) / 100 * 255 : x(n2.r), w = _ ? x(t3) / 100 * 255 : x(t3), d = b2 ? x(c2) / 100 * 255 : x(c2);
  if (e && (l$1 !== _ || _ !== b2 || /^none$/i.test(n2.r) || /^none$/i.test(t3) || /^none$/i.test(c2)))
    return null;
  let g = n2.al_c ?? n2.al_s, h2 = !!(n2.alp_c ?? n2.alp_s);
  if (e && g !== undefined && /^none$/i.test(g))
    return null;
  let k = g === undefined ? 1 : x(g) / (h2 ? 100 : 1);
  return $({ r: m2, g: w, b: d, alpha: k });
};

// node_modules/@colordx/core/dist/chunk-OX5CMKKI.mjs
var U = 0.4122214708;
var z = 0.5363325363;
var q = 0.0514459929;
var D = 0.2119034982;
var H = 0.6806995451;
var J = 0.1073969566;
var P = 0.0883024619;
var Q = 0.2817188376;
var V = 0.6299787005;
var W = 0.2104542553;
var X = 0.793617785;
var Y = -0.0040720468;
var Z = 1.9779984951;
var nn = -2.428592205;
var on = 0.4505937099;
var rn = 0.0259040371;
var tn = 0.7827717662;
var sn = -0.808675766;
var I = 0.3963377774;
var S = 0.2158037573;
var O = -0.1055613458;
var B = -0.0638541728;
var h2 = -0.0894841775;
var x4 = -1.291485548;
var A = 4.0767416613;
var C = -3.3077115904;
var w = 0.2309699287;
var T = -1.2684380041;
var y2 = 2.6097574007;
var G = -0.3413193963;
var d = -0.0041960865;
var N3 = -0.7034186145;
var $2 = 1.7076147009;
var cn = (o3, n2, r) => {
  let t3 = Math.cbrt(U * o3 + z * n2 + q * r), s4 = Math.cbrt(D * o3 + H * n2 + J * r), c2 = Math.cbrt(P * o3 + Q * n2 + V * r);
  return [W * t3 + X * s4 + Y * c2, Z * t3 + nn * s4 + on * c2, rn * t3 + tn * s4 + sn * c2];
};
var Mn = ({ r: o3, g: n2, b: r, alpha: t3 }) => {
  let [s4, c2, e] = cn(s3(o3 / 255), s3(n2 / 255), s3(r / 255));
  return { l: s4, a: c2, b: e, alpha: t3 };
};
var j = ({ l: o3, a: n2, b: r, alpha: t3 }) => {
  let [s4, c2, e] = en(o3, n2, r);
  return { r: a3(s4) * 255, g: a3(c2) * 255, b: a3(e) * 255, alpha: t3 };
};
var un = ({ l: o3, a: n2, b: r, alpha: t3 }) => {
  if (n2 === 0 && r === 0) {
    let K = o3 ** 3, k = a3(t(K, 0, 1)) * 255;
    return $({ r: k, g: k, b: k, alpha: t3 });
  }
  let s4 = o3 + 0.3963377774 * n2 + 0.2158037573 * r, c2 = o3 - 0.1055613458 * n2 - 0.0638541728 * r, e = o3 - 0.0894841775 * n2 - 1.291485548 * r, _ = s4 ** 3, l = c2 ** 3, b$1 = e ** 3, p3 = 4.0767416613 * _ - 3.3077115904 * l + 0.2309699287 * b$1, E = -1.2684380041 * _ + 2.6097574007 * l - 0.3413193963 * b$1, F = -0.0041960865 * _ - 0.7034186145 * l + 1.7076147009 * b$1;
  return $({ r: a3(t(p3, 0, 1)) * 255, g: a3(t(E, 0, 1)) * 255, b: a3(t(F, 0, 1)) * 255, alpha: t3 });
};
var en = (o3, n2, r) => {
  if (n2 === 0 && r === 0) {
    let b2 = o3 ** 3;
    return [b2, b2, b2];
  }
  let t3 = o3 + I * n2 + S * r, s4 = o3 + O * n2 + B * r, c2 = o3 + h2 * n2 + x4 * r, e = t3 ** 3, _ = s4 ** 3, l = c2 ** 3;
  return [A * e + C * _ + w * l, T * e + y2 * _ + G * l, d * e + N3 * _ + $2 * l];
};
var pn = (o3) => {
  if (!p(o3) || o3.colorSpace === "lab" || !a(o3, ["l", "a", "b"]) || "r" in o3 || "x" in o3 || "c" in o3 || "h" in o3)
    return null;
  let { l: n2, a: r, b: t3, alpha: s4 = 1 } = o3;
  return !i(n2) || !i(r) || !i(t3) || !i(s4) || c(n2) > 1 ? null : j({ l: c(n2), a: c(r), b: c(t3), alpha: t(c(s4), 0, 1) });
};
var _n = new RegExp(`^oklab\\(\\s*(?<l>${N})(?<lp>%?)\\s+(?<a>${N})(?<ap>%?)\\s+(?<b>${N})(?<bp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var vn = (o3) => {
  if (typeof o3 != "string")
    return null;
  let n2 = _n.exec(o3.trim())?.groups;
  if (!n2)
    return null;
  let r = n2.lp ? x(n2.l) / 100 : x(n2.l), t3 = n2.ap ? x(n2.a) * 0.004 : x(n2.a), s4 = n2.bp ? x(n2.b) * 0.004 : x(n2.b), c2 = n2.al === undefined ? 1 : x(n2.al) / (n2.alp ? 100 : 1);
  return j({ l: r, a: t3, b: s4, alpha: t(c2, 0, 1) });
};

// node_modules/@colordx/core/dist/chunk-F4W4HJCD.mjs
var L = 96.4295675298354;
var O2 = 100;
var w2 = 82.51046025104603;
var A2 = 0.032409699419045215;
var B2 = -0.015373831775700935;
var G2 = -0.004986107602930032;
var I2 = -0.009692436362808799;
var P2 = 0.018759675015077207;
var U2 = 0.0004155505740717561;
var F = 0.000556300796969936;
var H2 = -0.002039769588889766;
var K = 0.010569715142428786;
var xo = 0.955473421488075;
var go = -0.02309845494876471;
var mo = 0.06325924320057072;
var Do = -0.0283697093338637;
var zo = 1.0099953980813041;
var io = 0.021041441191917323;
var Xo = 0.012314014864481998;
var ho = -0.020507649298898964;
var Co = 1.330365926242124;
var Uo = (n2, o3, t3) => [A2 * n2 + B2 * o3 + G2 * t3, I2 * n2 + P2 * o3 + U2 * t3, F * n2 + H2 * o3 + K * t3];
var M = (n2, o3, t3) => {
  let s4 = xo * n2 + go * o3 + mo * t3, r = Do * n2 + zo * o3 + io * t3, l = Xo * n2 + ho * o3 + Co * t3;
  return [A2 * s4 + B2 * r + G2 * l, I2 * s4 + P2 * r + U2 * l, F * s4 + H2 * r + K * l];
};
var Fo = new RegExp(`^color\\(\\s*xyz-d65\\s+(?<x>${N})(?<xp>%?)\\s+(?<y>${N})(?<yp>%?)\\s+(?<z>${N})(?<zp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var Ho = new RegExp(`^color\\(\\s*xyz-d50\\s+(?<x>${N})(?<xp>%?)\\s+(?<y>${N})(?<yp>%?)\\s+(?<z>${N})(?<zp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var Ko = 0.3127 / 0.329 * 100;
var Vo = (1 - 0.3127 - 0.329) / 0.329 * 100;
var S2 = 216 / 24389;
var z2 = 24389 / 27;
var Lo = (n2, o3, t3) => {
  let s4 = (n2 + 16) / 116, r = o3 / 500 + s4, l = s4 - t3 / 200;
  return [(r ** 3 > S2 ? r ** 3 : (116 * r - 16) / z2) * L, (n2 > 8 ? s4 ** 3 : n2 / z2) * O2, (l ** 3 > S2 ? l ** 3 : (116 * l - 16) / z2) * w2];
};
var Qo = ({ l: n2, a: o3, b: t3, alpha: s4 }) => {
  let [r, l, a4] = Lo(n2, o3, t3);
  return { x: r, y: l, z: a4, alpha: s4 };
};
var on2 = new RegExp(`^lab\\(\\s*(?<l>${N})(?<lp>%?)\\s+(?<a>${N})(?<ap>%?)\\s+(?<b>${N})(?<bp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");

// node_modules/@colordx/core/dist/chunk-3LS3HCHH.mjs
var Fr = 1.2249401762805598;
var vr = -0.22494017628055996;
var Br = -0.04205695470968816;
var Er = 1.042056954709688;
var $r = -0.019637554590334432;
var Dr = -0.07863604555063189;
var Or = 1.0982736001409663;
var z3 = (e, r, n2) => [Fr * e + vr * r, Br * e + Er * r, $r * e + Dr * r + Or * n2];
var jr = new RegExp(`^color\\(\\s*display-p3\\s+(?<r>${N})(?<rp>%?)\\s+(?<g>${N})(?<gp>%?)\\s+(?<b>${N})(?<bp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var Xr = 1.6604910021084345;
var Ur = -0.5876411387885495;
var Kr = -0.07284986331988488;
var qr = -0.12455047452159074;
var Hr = 1.1328998971259603;
var Vr = -0.008349422604369477;
var Yr = -0.018150763354905303;
var Zr = -0.10057889800800739;
var Jr = 1.1187296613629127;
var F2 = (e, r, n2) => [Xr * e + Ur * r + Kr * n2, qr * e + Hr * r + Vr * n2, Yr * e + Zr * r + Jr * n2];
var Qr = new RegExp(`^color\\(\\s*rec2020\\s+(?<r>${N})(?<rp>%?)\\s+(?<g>${N})(?<gp>%?)\\s+(?<b>${N})(?<bp>%?)\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var Wr = /^oklch\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var rn2 = /^oklab\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var nn2 = /^lab\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var en2 = /^lch\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var on3 = /^color\(\s*display-p3\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var bn = /^color\(\s*rec2020\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)(%?)\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var tn2 = /^color\(\s*xyz-d50\s+([+-]?\d*\.?\d+)%?\s+([+-]?\d*\.?\d+)%?\s+([+-]?\d*\.?\d+)%?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var an = /^color\(\s*xyz-d65\s+([+-]?\d*\.?\d+)%?\s+([+-]?\d*\.?\d+)%?\s+([+-]?\d*\.?\d+)%?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var A3 = (e, r, n2) => {
  let { x: o3, y: b3, z: t3 } = Qo({ l: e, a: r, b: n2, alpha: 1, colorSpace: "lab" }), [u2, s4, l] = M(o3, b3, t3);
  return cn(u2, s4, l);
};
var Tr = (e, r, n2) => {
  let [o3, b3, t3] = z3(s3(e), s3(r), s3(n2));
  return cn(o3, b3, t3);
};
var Cr = (e, r, n2) => {
  let [o3, b3, t3] = F2(b(e), b(r), b(n2));
  return cn(o3, b3, t3);
};
var Lr = (e, r, n2) => {
  let [o3, b3, t3] = M(e, r, n2);
  return cn(o3, b3, t3);
};
var Nr = (e, r, n2) => {
  let [o3, b3, t3] = Uo(e, r, n2);
  return cn(o3, b3, t3);
};
var G3 = (e) => {
  if (typeof e == "object" && e !== null) {
    let r = e;
    if ("l" in r && "a" in r && "b" in r && r.colorSpace !== "lab" && !("c" in r) && !("r" in r)) {
      let n2 = e;
      if (typeof n2.l == "number" && typeof n2.a == "number" && typeof n2.b == "number" && typeof n2.alpha == "number")
        return { l: n2.l, a: n2.a, b: n2.b, alpha: n2.alpha };
    }
    if ("l" in r && "c" in r && "h" in r && r.colorSpace !== "lch" && !("a" in r) && !("r" in r)) {
      let n2 = e;
      if (typeof n2.l == "number" && typeof n2.c == "number" && typeof n2.h == "number") {
        let o3 = n2.h * Math.PI / 180;
        return { l: n2.l, a: n2.c * Math.cos(o3), b: n2.c * Math.sin(o3), alpha: n2.alpha };
      }
    }
    if (r.colorSpace === "lab") {
      let n2 = e;
      if (typeof n2.l != "number" || typeof n2.a != "number" || typeof n2.b != "number")
        return null;
      let [o3, b3, t3] = A3(n2.l, n2.a, n2.b);
      return { l: o3, a: b3, b: t3, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    if (r.colorSpace === "lch") {
      let n2 = e;
      if (typeof n2.l != "number" || typeof n2.c != "number" || typeof n2.h != "number")
        return null;
      let o3 = n2.h * Math.PI / 180, [b3, t3, u2] = A3(n2.l, n2.c * Math.cos(o3), n2.c * Math.sin(o3));
      return { l: b3, a: t3, b: u2, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    if (r.colorSpace === "display-p3") {
      let n2 = e;
      if (typeof n2.r != "number" || typeof n2.g != "number" || typeof n2.b != "number")
        return null;
      let [o3, b3, t3] = Tr(n2.r, n2.g, n2.b);
      return { l: o3, a: b3, b: t3, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    if (r.colorSpace === "rec2020") {
      let n2 = e;
      if (typeof n2.r != "number" || typeof n2.g != "number" || typeof n2.b != "number")
        return null;
      let [o3, b3, t3] = Cr(n2.r, n2.g, n2.b);
      return { l: o3, a: b3, b: t3, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    if (r.colorSpace === "xyz-d65") {
      let n2 = e;
      if (typeof n2.x != "number" || typeof n2.y != "number" || typeof n2.z != "number")
        return null;
      let [o3, b3, t3] = Nr(n2.x, n2.y, n2.z);
      return { l: o3, a: b3, b: t3, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    if ("x" in r && "y" in r && "z" in r) {
      let n2 = e;
      if (typeof n2.x != "number" || typeof n2.y != "number" || typeof n2.z != "number")
        return null;
      let [o3, b3, t3] = Lr(n2.x, n2.y, n2.z);
      return { l: o3, a: b3, b: t3, alpha: typeof n2.alpha == "number" ? n2.alpha : 1 };
    }
    return null;
  }
  if (typeof e == "string") {
    let r = Wr.exec(e);
    if (r) {
      let n2 = r[2] ? Number(r[1]) / 100 : Number(r[1]), o3 = r[4] ? Number(r[3]) * 0.004 : Number(r[3]), b3 = r[6]?.toLowerCase() ?? "deg", u2 = Number(r[5]) * (m[b3] ?? 1) * Math.PI / 180, s4 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1);
      return { l: n2, a: o3 * Math.cos(u2), b: o3 * Math.sin(u2), alpha: s4 };
    }
    if (r = rn2.exec(e), r) {
      let n2 = r[2] ? Number(r[1]) / 100 : Number(r[1]), o3 = r[4] ? Number(r[3]) * 0.004 : Number(r[3]), b3 = r[6] ? Number(r[5]) * 0.004 : Number(r[5]), t3 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1);
      return { l: n2, a: o3, b: b3, alpha: t3 };
    }
    if (r = nn2.exec(e), r) {
      let n2 = Number(r[1]), o3 = r[4] ? Number(r[3]) * 1.25 : Number(r[3]), b3 = r[6] ? Number(r[5]) * 1.25 : Number(r[5]), t3 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1), [u2, s4, l] = A3(n2, o3, b3);
      return { l: u2, a: s4, b: l, alpha: t3 };
    }
    if (r = en2.exec(e), r) {
      let n2 = Number(r[1]), o3 = r[4] ? Number(r[3]) * 1.5 : Number(r[3]), b3 = r[6]?.toLowerCase() ?? "deg", u2 = Number(r[5]) * (m[b3] ?? 1) * Math.PI / 180, s4 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1), [l, x5, T2] = A3(n2, o3 * Math.cos(u2), o3 * Math.sin(u2));
      return { l, a: x5, b: T2, alpha: s4 };
    }
    if (r = on3.exec(e), r) {
      let n2 = r[2] ? Number(r[1]) / 100 : Number(r[1]), o3 = r[4] ? Number(r[3]) / 100 : Number(r[3]), b3 = r[6] ? Number(r[5]) / 100 : Number(r[5]), t3 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1), [u2, s4, l] = Tr(n2, o3, b3);
      return { l: u2, a: s4, b: l, alpha: t3 };
    }
    if (r = bn.exec(e), r) {
      let n2 = r[2] ? Number(r[1]) / 100 : Number(r[1]), o3 = r[4] ? Number(r[3]) / 100 : Number(r[3]), b3 = r[6] ? Number(r[5]) / 100 : Number(r[5]), t3 = r[7] === undefined ? 1 : Number(r[7]) / (r[8] ? 100 : 1), [u2, s4, l] = Cr(n2, o3, b3);
      return { l: u2, a: s4, b: l, alpha: t3 };
    }
    if (r = tn2.exec(e), r) {
      let n2 = Number(r[1]), o3 = Number(r[2]), b3 = Number(r[3]), t3 = r[4] === undefined ? 1 : Number(r[4]) / (r[5] ? 100 : 1), [u2, s4, l] = Lr(n2, o3, b3);
      return { l: u2, a: s4, b: l, alpha: t3 };
    }
    if (r = an.exec(e), r) {
      let n2 = Number(r[1]), o3 = Number(r[2]), b3 = Number(r[3]), t3 = r[4] === undefined ? 1 : Number(r[4]) / (r[5] ? 100 : 1), [u2, s4, l] = Nr(n2, o3, b3);
      return { l: u2, a: s4, b: l, alpha: t3 };
    }
    return null;
  }
  return null;
};
var _r = (e, r, n2) => e >= 0 && e <= 1 && r >= 0 && r <= 1 && n2 >= 0 && n2 <= 1;
var kr = 0.02;
var un2 = 0.0001;
var Mr = (e, r) => {
  let n2 = e[0] - r[0], o3 = e[1] - r[1], b3 = e[2] - r[2];
  return Math.sqrt(n2 * n2 + o3 * o3 + b3 * b3);
};
var Ar = (e, r, n2, o3, b3) => {
  if (e >= 1)
    return [1, 1, 1];
  if (e <= 0)
    return [0, 0, 0];
  let [t3, u2, s4] = o3(e, r, n2);
  if (_r(t3, u2, s4))
    return [t3, u2, s4];
  let l = t(t3, 0, 1), x5 = t(u2, 0, 1), T2 = t(s4, 0, 1);
  if (Mr(b3(l, x5, T2), [e, r, n2]) <= kr)
    return [l, x5, T2];
  let E = Math.atan2(n2, r), wr = Math.sqrt(r * r + n2 * n2), N4 = 0, I3 = wr, $3 = true, D2 = l, O3 = x5, j2 = T2;
  for (;I3 - N4 > un2; ) {
    let C2 = (N4 + I3) / 2, X2 = C2 * Math.cos(E), U3 = C2 * Math.sin(E), [K2, q2, H3] = o3(e, X2, U3);
    if ($3 && _r(K2, q2, H3)) {
      N4 = C2;
      continue;
    }
    let V2 = t(K2, 0, 1), Y2 = t(q2, 0, 1), Z2 = t(H3, 0, 1);
    D2 = V2, O3 = Y2, j2 = Z2, Mr(b3(V2, Y2, Z2), [e, X2, U3]) <= kr ? (N4 = C2, $3 = false) : I3 = C2;
  }
  return [D2, O3, j2];
};
var Dn = (e) => {
  let r = G3(e);
  return r === null ? null : { linear: Ar(r.l, r.a, r.b, en, cn), alpha: r.alpha };
};
var f2 = Math.PI / 180;

// node_modules/@colordx/core/dist/index.mjs
var X2 = (n2) => ({ h: u(n2.h), s: t(n2.s, 0, 100), l: t(n2.l, 0, 100), alpha: t(s(n2.alpha, 3), 0, 1) });
var y3 = { h: 0, s: 0, l: 0, alpha: 0 };
var O3 = ({ r: n2, g: r, b: o3, alpha: t3 }) => {
  let e = n2 / 255, l = r / 255, s4 = o3 / 255, a$1 = Math.max(e, l, s4), c3 = Math.min(e, l, s4), m2 = (a$1 + c3) / 2, d2 = 0, f3 = 0;
  if (a$1 !== c3) {
    let R = a$1 - c3;
    switch (f3 = m2 > 0.5 ? R / (2 - a$1 - c3) : R / (a$1 + c3), a$1) {
      case e:
        d2 = ((l - s4) / R + (l < s4 ? 6 : 0)) / 6;
        break;
      case l:
        d2 = ((s4 - e) / R + 2) / 6;
        break;
      case s4:
        d2 = ((e - l) / R + 4) / 6;
        break;
    }
  }
  let k = d2 * 360;
  return y3.h = k >= 0 && k < 360 ? k : (k % 360 + 360) % 360, y3.s = t(f3 * 100, 0, 100), y3.l = t(m2 * 100, 0, 100), y3.alpha = t(s(t3, 3), 0, 1), y3;
};
var v = (n2, r, o3) => (o3 < 0 && (o3 += 1), o3 > 1 && (o3 -= 1), o3 < 1 / 6 ? n2 + (r - n2) * 6 * o3 : o3 < 1 / 2 ? r : o3 < 2 / 3 ? n2 + (r - n2) * (2 / 3 - o3) * 6 : n2);
var _ = ({ h: n2, s: r, l: o3, alpha: t3 }) => {
  let e = r / 100, l = o3 / 100, s4 = l < 0.5 ? l * (1 + e) : l + e - l * e, a4 = 2 * l - s4, c3 = (n2 % 360 + 360) % 360 / 360;
  return { r: v(a4, s4, c3 + 1 / 3) * 255, g: v(a4, s4, c3) * 255, b: v(a4, s4, c3 - 1 / 3) * 255, alpha: t3 };
};
var V2 = (n2) => {
  if (!p(n2) || !a(n2, ["h", "s", "l"]))
    return null;
  let { h: r, s: o3, l: t3, alpha: e = 1 } = n2;
  return !i(r) || !i(o3) || !i(t3) || !i(e) ? null : _(X2({ h: c(r), s: c(o3), l: c(t3), alpha: c(e) }));
};
var Lr2 = new RegExp(`^hsla?\\(\\s*(?<h>${N})(?<hu>deg|rad|grad|turn)?\\s*(?:,\\s*(?<s_c>${o})%\\s*,\\s*(?<l_c>${o})%(?:\\s*,\\s*(?<al_c>${o})(?<alp_c>%?)?\\s*)?|\\s+(?<s_s>${N})(?<sp_s>%?)\\s+(?<l_s>${N})(?<lp_s>%?)(?:\\s*/\\s*(?<al_s>${N})(?<alp_s>%?)?\\s*)?)\\)$`, "i");
var J2 = (n2) => {
  if (typeof n2 != "string")
    return null;
  let r = Lr2.exec(n2.trim())?.groups;
  if (!r)
    return null;
  let o3 = r.s_c !== undefined;
  if (o3 && /^none$/i.test(r.h))
    return null;
  let t3 = r.hu?.toLowerCase() ?? "deg", e = x(r.h) * (m[t3] ?? 1), l$1 = x(r.s_c ?? r.s_s), s4 = x(r.l_c ?? r.l_s), a4 = r.al_c ?? r.al_s, c3 = !!(r.alp_c ?? r.alp_s);
  if (o3 && a4 !== undefined && /^none$/i.test(a4))
    return null;
  let m2 = a4 === undefined ? 1 : x(a4) / (c3 ? 100 : 1);
  return _(X2({ h: e, s: l$1, l: s4, alpha: m2 }));
};
var Q2 = ({ l: n2, c: r, h: o3, alpha: t3 }) => ({ l: n2, a: r * Math.cos(o3 * Math.PI / 180), b: r * Math.sin(o3 * Math.PI / 180), alpha: t3 });
var W2 = (n2) => {
  let { l: r, a: o3, b: t3, alpha: e } = Mn(n2), l = Math.sqrt(o3 * o3 + t3 * t3), s4 = Math.atan2(t3, o3) * 180 / Math.PI;
  return { l: r, c: l, h: l < 0.000004 ? 0 : u(s4), alpha: e };
};
var M2 = (n2) => un(Q2(n2));
var Y2 = (n2) => j(Q2(n2));
var Z2 = (n2) => {
  if (!p(n2) || n2.colorSpace === "lch" || !a(n2, ["l", "c", "h"]))
    return null;
  let { l: r, c: o3, h: t3, alpha: e = 1 } = n2;
  return !i(r) || !i(o3) || !i(t3) || !i(e) || c(r) > 1 ? null : Y2({ l: c(r), c: Math.max(0, c(o3)), h: u(c(t3)), alpha: t(c(e), 0, 1) });
};
var Ir = new RegExp(`^oklch\\(\\s*(?<l>${N})(?<lp>%?)\\s+(?<c>${N})(?<cp>%?)\\s+(?<h>${N})(?<hu>deg|rad|grad|turn)?\\s*(?:/\\s*(?<al>${N})(?<alp>%?)\\s*)?\\)$`, "i");
var rr = (n2) => {
  if (typeof n2 != "string")
    return null;
  let r = Ir.exec(n2.trim())?.groups;
  if (!r)
    return null;
  let o3 = r.lp ? x(r.l) / 100 : x(r.l), t3 = Math.max(0, r.cp ? x(r.c) * 0.004 : x(r.c)), e = r.hu?.toLowerCase() ?? "deg", l$1 = x(r.h) * (m[e] ?? 1), s4 = r.al === undefined ? 1 : x(r.al) / (r.alp ? 100 : 1);
  return Y2({ l: o3, c: t3, h: u(l$1), alpha: t(s4, 0, 1) });
};
var or = [[p2, "hex"], [N2, "rgb"], [J2, "hsl"], [rr, "oklch"], [vn, "oklab"]];
var tr = [[x3, "rgb"], [V2, "hsl"], [pn, "oklab"], [Z2, "oklch"]];
var nr = or.map(([n2]) => n2);
var lr = tr.map(([n2]) => n2);
var er = [...nr, ...lr];
var P3 = [...er];
var N4 = [];
var sr = (n2) => {
  if (n2 === "transparent")
    return { r: 0, g: 0, b: 0, alpha: 0 };
  let r = typeof n2 == "string" ? nr : lr;
  for (let o3 of r) {
    let t3 = o3(n2);
    if (t3)
      return t3;
  }
  for (let o3 = er.length;o3 < P3.length; o3++) {
    let t3 = P3[o3](n2);
    if (t3)
      return t3;
  }
  return null;
};
var ar = Symbol();
var u2 = class n2 {
  _rgb;
  _valid;
  constructor(r, o3) {
    if (r === ar)
      this._valid = true, this._rgb = o3;
    else if (r instanceof n2) {
      this._valid = r._valid, this._rgb = r._rgb;
      return;
    } else {
      let t3 = sr(r);
      this._valid = t3 !== null, this._rgb = t3 ?? { r: 0, g: 0, b: 0, alpha: 1 };
    }
    this._rgb.alpha = t(s(this._rgb.alpha, 3), 0, 1);
  }
  static _make(r) {
    return new n2(ar, r);
  }
  static _makeFromLinearSrgb(r, o3, t3, e) {
    let l = a3(r) * 255, s4 = a3(o3) * 255, a4 = a3(t3) * 255;
    return n2._make({ r: l >= 0 && l < 0.5 ? 0 : l > 254.5 && l <= 255 ? 255 : l, g: s4 >= 0 && s4 < 0.5 ? 0 : s4 > 254.5 && s4 <= 255 ? 255 : s4, b: a4 >= 0 && a4 < 0.5 ? 0 : a4 > 254.5 && a4 <= 255 ? 255 : a4, alpha: e });
  }
  isValid() {
    return this._valid;
  }
  toRgb() {
    let { r, g: o3, b: t3, alpha: e } = this._rgb;
    return { r: t(s(r), 0, 255), g: t(s(o3), 0, 255), b: t(s(t3), 0, 255), alpha: e };
  }
  _rawRgb() {
    return this._rgb;
  }
  toRgbString(r) {
    let { r: o3, g: t3, b: e, alpha: l } = this._rgb, s4 = t(s(o3), 0, 255), a$1 = t(s(t3), 0, 255), c3 = t(s(e), 0, 255);
    return r?.legacy ? l < 1 ? `rgba(${s4}, ${a$1}, ${c3}, ${l})` : `rgb(${s4}, ${a$1}, ${c3})` : l < 1 ? `rgb(${s4} ${a$1} ${c3} / ${l})` : `rgb(${s4} ${a$1} ${c3})`;
  }
  toHex() {
    return x2(this._rgb);
  }
  toHex8() {
    return f(this._rgb);
  }
  toNumber() {
    let { r, g: o3, b: t3 } = this._rgb;
    return t(s(r), 0, 255) << 16 | t(s(o3), 0, 255) << 8 | t(s(t3), 0, 255);
  }
  toHsl(r = 2) {
    let { h: o3, s: t3, l: e, alpha: l } = O3(this._rgb), s4 = s(o3, r);
    return { h: s4 >= 360 ? 0 : s4, s: s(t3, r), l: s(e, r), alpha: l };
  }
  toHslString(r = 2) {
    let { h: o3, s: t3, l: e, alpha: l } = this.toHsl(r);
    return l < 1 ? `hsl(${o3} ${t3}% ${e}% / ${l})` : `hsl(${o3} ${t3}% ${e}%)`;
  }
  toOklab(r = 5) {
    let { l: o3, a: t3, b: e, alpha: l } = Mn(this._rgb);
    return { l: s(o3, r), a: s(t3, r), b: s(e, r), alpha: l };
  }
  toOklabString(r = 5) {
    let { l: o3, a: t3, b: e, alpha: l } = this.toOklab(r);
    return l < 1 ? `oklab(${o3} ${t3} ${e} / ${l})` : `oklab(${o3} ${t3} ${e})`;
  }
  toOklch(r = 5) {
    let { l: o3, c: t3, h: e, alpha: l } = W2(this._rgb);
    return { l: s(o3, r), c: s(t3, r), h: s(e, r), alpha: l };
  }
  toOklchString(r = 5) {
    let { l: o3, c: t3, h: e, alpha: l } = this.toOklch(r), s4 = t3 === 0 ? "none" : e;
    return l < 1 ? `oklch(${o3} ${t3} ${s4} / ${l})` : `oklch(${o3} ${t3} ${s4})`;
  }
  brightness() {
    let { r, g: o3, b: t3 } = this._rgb;
    return s((r * 299 + o3 * 587 + t3 * 114) / 255000, 2);
  }
  isDark() {
    return this.brightness() < 0.5;
  }
  isLight() {
    return this.brightness() >= 0.5;
  }
  alpha(r) {
    return r === undefined ? this._rgb.alpha : n2._make({ ...this._rgb, alpha: s(t(r, 0, 1), 3) });
  }
  hue(r) {
    let { h: o3, s: t3, l: e, alpha: l } = O3(this._rgb);
    if (r === undefined) {
      let s4 = s(o3, 2);
      return s4 >= 360 ? 0 : s4;
    }
    return n2._make(_({ h: r, s: t3, l: e, alpha: l }));
  }
  lightness(r) {
    let o3 = this.toOklch();
    return r === undefined ? o3.l : n2._make(M2({ ...o3, l: t(r, 0, 1) }));
  }
  chroma(r) {
    let o3 = this.toOklch();
    return r === undefined ? o3.c : n2._make(M2({ ...o3, c: t(r, 0, 0.4) }));
  }
  lighten(r = 0.1, o3) {
    let { h: t3, s: e, l, alpha: s4 } = O3(this._rgb), a$1 = o3?.relative ? l * (1 + r) : l + r * 100;
    return n2._make(_({ h: t3, s: e, l: t(a$1, 0, 100), alpha: s4 }));
  }
  darken(r = 0.1, o3) {
    return this.lighten(-r, o3);
  }
  saturate(r = 0.1, o3) {
    let { h: t3, s: e, l, alpha: s4 } = O3(this._rgb), a$1 = o3?.relative ? e * (1 + r) : e + r * 100;
    return n2._make(_({ h: t3, s: t(a$1, 0, 100), l, alpha: s4 }));
  }
  desaturate(r = 0.1, o3) {
    return this.saturate(-r, o3);
  }
  grayscale() {
    return this.desaturate(1);
  }
  invert() {
    let { r, g: o3, b: t3, alpha: e } = this._rgb;
    return n2._make({ r: 255 - r, g: 255 - o3, b: 255 - t3, alpha: e });
  }
  rotate(r = 15) {
    return this.hue(this.hue() + r);
  }
  isEqual(r) {
    let o3 = new n2(r).toRgb(), t3 = this.toRgb();
    return t3.r === o3.r && t3.g === o3.g && t3.b === o3.b && t3.alpha === o3.alpha;
  }
  toString() {
    return this.toHex();
  }
  clampSrgb() {
    let { r, g: o3, b: t3, alpha: e } = this._rgb;
    return r >= 0 && r <= 255 && o3 >= 0 && o3 <= 255 && t3 >= 0 && t3 <= 255 ? this : n2._make({ r: t(r, 0, 255), g: t(o3, 0, 255), b: t(t3, 0, 255), alpha: e });
  }
  mapSrgb() {
    let { r, g: o3, b: t3, alpha: e } = this._rgb;
    if (r >= 0 && r <= 255 && o3 >= 0 && o3 <= 255 && t3 >= 0 && t3 <= 255)
      return this;
    let [l, s4, a4] = cn(s3(r / 255), s3(o3 / 255), s3(t3 / 255)), c3 = l > 1 - 0.0000001 ? 1 : l < 0.0000001 ? 0 : l, m2 = Dn({ l: c3, a: s4, b: a4, alpha: e });
    if (m2 === null)
      return this;
    let [d2, f3, k] = m2.linear;
    return n2._makeFromLinearSrgb(d2, f3, k, m2.alpha);
  }
  static toGamutSrgb;
};
var Ar2 = (n3) => new u2(n3);
var Mr2 = (n3) => {
  n3.forEach((r) => r(u2, P3, N4));
};
u2.toGamutSrgb = (n3) => {
  let r = Dn(n3);
  if (r === null)
    return new u2(n3);
  let [o3, t3, e] = r.linear;
  return u2._makeFromLinearSrgb(o3, t3, e, r.alpha);
};

// node_modules/@colordx/core/dist/plugins/a11y.mjs
var f3 = { Rsco: 0.2126729, Gsco: 0.7151522, Bsco: 0.072175 };
var a4 = { normBG: 0.56, normTXT: 0.57, revBG: 0.65, revTXT: 0.62, scale: 1.14, loClip: 0.1, offset: 0.027, blkThrs: 0.022, blkClmp: 1.414, deltaYmin: 0.0005 };
function A4(e, t3, n3) {
  let o3 = (l) => (l / 255) ** 2.4, r = f3.Rsco * o3(e) + f3.Gsco * o3(t3) + f3.Bsco * o3(n3);
  return r > a4.blkThrs ? r : r + (a4.blkThrs - r) ** a4.blkClmp;
}
function p3(e, t3) {
  let n3 = A4(e.r, e.g, e.b), o3 = A4(t3.r, t3.g, t3.b);
  if (Math.abs(o3 - n3) < a4.deltaYmin)
    return 0;
  if (o3 > n3) {
    let r = (o3 ** a4.normBG - n3 ** a4.normTXT) * a4.scale;
    return r < a4.loClip ? 0 : (r - a4.offset) * 100;
  } else {
    let r = (o3 ** a4.revBG - n3 ** a4.revTXT) * a4.scale;
    return r > -0.1 ? 0 : (r + a4.offset) * 100;
  }
}
var h3 = (e) => {
  e.prototype.luminance = function() {
    let { r: t3, g: n3, b: o3 } = this._rawRgb();
    return s(0.2126 * s3(t3 / 255) + 0.7152 * s3(n3 / 255) + 0.0722 * s3(o3 / 255), 4);
  }, e.prototype.contrast = function(t3 = "#fff") {
    let n3 = new e(t3), o3 = n3._rawRgb(), r = this._rawRgb(), s4 = (r.alpha < 1 ? new e({ r: r.alpha * r.r + (1 - r.alpha) * o3.r, g: r.alpha * r.g + (1 - r.alpha) * o3.g, b: r.alpha * r.b + (1 - r.alpha) * o3.b, alpha: 1 }) : this).luminance(), c3 = n3.luminance(), i3 = Math.max(s4, c3), m2 = Math.min(s4, c3);
    return s((i3 + 0.05) / (m2 + 0.05), 2);
  }, e.prototype.apcaContrast = function(t3 = "#fff") {
    let n3 = new e(t3).toRgb(), o3 = this.toRgb(), r = o3.alpha < 1 ? { r: o3.alpha * o3.r + (1 - o3.alpha) * n3.r, g: o3.alpha * o3.g + (1 - o3.alpha) * n3.g, b: o3.alpha * o3.b + (1 - o3.alpha) * n3.b } : o3;
    return Math.round(p3(r, n3) * 10) / 10;
  }, e.prototype.isReadableApca = function(t3 = "#fff", n3 = {}) {
    let { size: o3 = "normal" } = n3, r = Math.abs(this.apcaContrast(t3));
    return o3 === "large" ? r >= 60 : r >= 75;
  }, e.prototype.readableScore = function(t3 = "#fff") {
    let n3 = this.contrast(t3);
    return n3 >= 7 ? "AAA" : n3 >= 4.5 ? "AA" : n3 >= 3 ? "AA large" : "fail";
  }, e.prototype.isReadable = function(t3 = "#fff", n3 = {}) {
    let { level: o3 = "AA", size: r = "normal" } = n3, l = this.contrast(t3);
    return o3 === "AAA" ? r === "large" ? l >= 4.5 : l >= 7 : r === "large" ? l >= 3 : l >= 4.5;
  }, e.prototype.minReadable = function(t3 = "#fff") {
    let n3 = new e(t3).luminance(), o3 = (n3 + 0.05) / 0.05, r = 1.05 / (n3 + 0.05), l = o3 >= r, s4 = (i3) => l ? i3.darken(0.01) : i3.lighten(0.01);
    if (this.contrast(t3) >= 4.5)
      return this;
    let c3 = s4(this);
    for (let i3 = 1;i3 < 100 && !(c3.contrast(t3) >= 4.5); i3++)
      c3 = s4(c3);
    return c3;
  };
};
var y4 = h3;

// vendor/colordx-entry.js
Mr2([y4]);
globalThis.colordx = Ar2;
