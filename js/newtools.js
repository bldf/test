/**
 * 支持IE9及以上
 * @param {Object} wrap 图片要存放的容器的选择器。 
 * @param {Object} pre  图片的选择器 || 或图片对象。图片的地址为data-src
 * fn:执行成功后的回调 。
 */
function setImgWidth(wrap,pre,fn){//设置图片等比例缩放。
		var H = $(wrap).height(),W=$(wrap).width(); 
		function setSize(){//原理： 最大的要放到最小的里边去。
			var d=this,si,w,h,o = {
					h:d.naturalHeight ,
					w:d.naturalWidth ,
			};
			o[d.naturalHeight] = 'h' ; 
			o[d.naturalWidth] = 'w' ;
			si=Number(Math.min((W/o.w),H/o.h).toFixed(3));
			w=Number((o.w*si).toFixed(3));
			h=Number((o.h*si).toFixed(3));
			$(d).attr('width',w+'px').attr('height',h+'px');
			fn&&fn(wrap,w,h); 
		};
		for(var a = 0,d,arr=$.type(pre)==='string'?$(pre):pre;d=arr[a];a++){
			$(d).attr('src',$(d).attr('data-src')).load(setSize);
		}
}