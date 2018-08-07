/**
 * js转换为图片
 * @param {Object} str
 * @param {Object} canvas
 * @param {Object} img
 */
function jsToImg(str,canvas,img){
	var ctx = canvas.getContext("2d"),
		c = Math.ceil(Math.sqrt(str.length / 3));
		img&&img.setAttribute('width',c) ;
		img&&img.setAttribute('height',c) ;
	var e = ctx.createImageData(c, c);
	str = stringToHex(str).split(",");
	for (var f = 0, d = 0; d < c * c * 4; f++, d++) 0 == (d + 1) % 4 && (e.data[d] = 255, d++), f < str.length && (e.data[d] = str[f]);
	ctx.putImageData(e, 0, 0)
}
/**
 * 将字符串转换为16进制
 * @param {Object} a
 */
function stringToHex(a) {
	for (var b = "", c = 0; c < a.length; c++)b = "" == b ? a.charCodeAt(c).toString(10) : b + ("," + a.charCodeAt(c).toString(10));
	return b
}
/**
 * 将16进制转换为字符串
 * @param {Object} a
 */
function hexToString(a) {
	return String.fromCharCode(parseInt(a, 10))
}
/**
 * 将图片转换为js
 * @param {Object} canvas
 */
function imgToJs(canvas) {
	var b = canvas.getContext("2d"),
		w = canvas.offsetWidth;
		h = canvas.offsetHeight;
		b = b.getImageData(0, 0, w, h);
		w = "";
	for (h = 0; h < b.data.length; h++) 0 != (h + 1) % 4 && (w += 0 != b.data[h] ? hexToString(b.data[h]) : "");
	return w ;
}
/**
 * 讲canvas转换为图片
 * @param {Object} canvas
 * @param {Object} img
 */
function c2img(canvas,img){
	var c = canvas.toDataURL("image/png", 1);
	img.setAttribute('src',c) ;
}
