$(function() {
	$("title").html("[WXS]\u4ee3\u7801\u56fe\u7247\u4e92\u8f6c\u5de5\u5177");
	$("#runjs").click(function() {
		eval($("#js").val())
	});
	$("#topng").click(function() {
		toPng($("#js").val())
	});
	$("#tojs").click(function() {
		tojs("png")
	});
	$("#canvastoimg").click(function() {
		c2img("png", "pngImg")
	});
	$("#clear").click(function() {
		$("#js").val("")
	})
});

function toPng(a) {
	var b = document.getElementById("png").getContext("2d"),
		c = Math.ceil(Math.sqrt(a.length / 3));
	$("#png").attr("width", c).attr("height", c);
	$("#png").width(c).height(c);
	var e = b.createImageData(c, c);
	a = stringToHex(a).split(",");
	for (var f = 0, d = 0; d < c * c * 4; f++, d++) 0 == (d + 1) % 4 && (e.data[d] = 255, d++), f < a.length && (e.data[d] = a[f]);
	b.putImageData(e, 0, 0)
}
function tojs(a) {
	var b = document.getElementById(a).getContext("2d"),
		c = $("#" + a).width();
	a = $("#" + a).height();
	b = b.getImageData(0, 0, c, a);
	c = "";
	for (a = 0; a < b.data.length; a++) 0 != (a + 1) % 4 && (c += 0 != b.data[a] ? hexToString(b.data[a]) : "");
	$("#js").val(c)
}
function c2img(a, b) {
	var c = document.getElementById(a).toDataURL("image/png", 1);
	$("#" + b).attr("src", c)
}
function stringToHex(a) {
	for (var b = "", c = 0; c < a.length; c++) b = "" == b ? a.charCodeAt(c).toString(10) : b + ("," + a.charCodeAt(c).toString(10));
	return b
}
function hexToString(a) {
	return String.fromCharCode(parseInt(a, 10))
}

function onPngFileChange(a) {
	a = a.files[0];
	if (window.FileReader) {
		var b = new FileReader;
		b.onloadend = function(a) {
			var b = new Image;
			b.src = a.target.result;
			b.onload = function() {
				var a = document.getElementById("png").getContext("2d");
				$("#png").attr("width", this.width).attr("height", this.height);
				$("#png").width(this.width).height(this.height);
				a.drawImage(this, 0, 0)
			}
		};
		b.readAsDataURL(a)
	}
};