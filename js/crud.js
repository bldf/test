/**
 * 此js封装了对datagrid表格基本的增删改查，依赖easyui，JQuery
 * 1：弹出框的 确定按钮需要添加class curd-save 
 * 2: 弹出框的 重置按钮需要添加class curd-reset
 * 3: datagrid下边的添加修改都添加title标签属性， 因为是作为标题来显示 的
 * 4: 清空和重置这个js没有做封装，自行通过添加class，写好选择器就可以了，这里不做封装。 请前往tool.js查看清空和重置的说明
 * 5: 弹出框的按钮有配置属性如下： 
 * 				checkPre ： 弹框中点击确定的时候验证是否为空一个选择器， 不写默认验证保存的选择器
 *               pre : 保存的时候的选择器
 * 6: 如果增加或者修改弹出的dialog不一样， 则增加和删除的标签都必须添加属性。 diaPre：'选择器'
 * 7:如果打开的弹窗有什么其他的属性请添加，请给按钮添加data-options="pre:'#dif',width:600,height:600,sendData:function(){}",宽和高， 要打开的选择器sendData:验证发送的ajax，必须要有返回值
 * 																					  inintCrud.sendData,同上一样，优先级没有上一级高而已	
 * 8: 弹窗确定点击事件请添加class:.sd-form-save
 * 9：ck.clickfn点击增加的时候执行
 * 10: ck.parseFn : 在解析data-options的时候执行，目的是为了修改data-options的参数， 解析完之后重新解析  // //如果返回false ,不再触发弹出框事件 
 * 		inintObj.parseFn 同上一样， ck.parseFn 的优先级更高
 * 		如果同一页面调用多次这个inintCrud这个方法时注意： 在点击弹出按钮的时候  和  弹出按钮中的确定按钮时候   都会执行这个方法。请注意添加标识区分一下。比如通过按钮的文字区分等等。。。
 * 11: ck.yesFn : 确定中，操作成功的时候的回调。 
 * 	   inintObj.yesFn . 同上一样不过优先级低一点
 * 12 : inintObj.formsavepre  .默认值为：'.sd-form-save' 弹窗底部确定点击事件 。formsavepre 如果为false则不绑定弹窗确定点击事件，一般在多个点击事件同时弹出一个弹出的时候使用，为了避免事件重复绑定。
 *     弹出框中的输入框添加属性， ： crud-nd1 : // 在增加的时候使用不可编辑，
 *     						crud-nd : // 在修改的时候使用不可编辑，
 *     						crud-nd3 : // 在增加和修改的时候不可编辑
 * 13:inintObj.saveInfo [function(str){//在弹出框中的确定的时候按钮的成功和失败后的提示。
 *    if(str){
 *       return  '成功' ; 
 *    }else{
 *    return '失败' ;
 *    }
 * }]
 * 14:inintObj.dataFn(type){。应用场景在没有datagrid的时候弹出弹出框的时候需要初始化赋值。这时就可配置这个方法。必须返回一个数组，数组里边是一个json ([{str:'sdf',sdd:12}])
 *   // this = $(this) ; 
 *   // type = 'add || update'
 * }
 * 15：inintObj.noClickInfo(type){//当标签含有no-click的时候添加的提示.默认提示为：   请选择后再修改||删除。应用场景datagrid列表中的按钮或其他。       
 *   // this = $(this) ; 
 *   // type = 'add || update'   
 * }
 * i6:inintObj.layerOpen [object] //当弹出弹出框的时候方式的初始化。：demo: {inintObj.layerOpen={shadeClose:false}//不允许点击遮罩层关闭弹窗
 */
function inintCrud(inintObj){
	 var $dg = inintObj.dg , // 需要增删改的datagrid 的选择器或对象
	 $dialogInfo =inintObj.dialogInfo || '', // 需要增删改的弹出框的选择器或对象
	 $dgbtn = inintObj.dgbtn,// 需要绑定增删改的选择器或对象
	 up=inintObj.up || {}, // 修改时候的操作{up.upReset} // 如果需要重新定义点击修改重置和原始数据的定义，如果不传，则使用默认
     del = inintObj.del  || {}, // 删除保存的操作{del.delData}, del.delData ,就是删除的时候要给后台发送的数据。 默认发送当前选中的数据
     width = inintObj.width || 600 ,
     height = inintObj.height || 600,
     add = inintObj.add || {} ,// 点击保存的时候的配置参数
     upBeginO = {},// 点击修改前的原始数据。内部使用不是传递的参数
     ifOnClick=inintObj.ifOnClick;//判断是否为body委托添加事件。
     formsavepre = inintObj.formsavepre || '.sd-form-save';//formsavepre 如果为false则不绑定弹窗确定点击事件，一般在多个点击事件同时弹出一个弹出的时候使用，为了避免事件重复绑定。
     if($.type($dg)==='string'){
     	$dg = $($dg); 
     }
     if($.type($dialogInfo)==='string'){
     	$dialogInfo = $($dialogInfo); 
     }
     if(!inintObj.ifOnClick && $.type($dgbtn)==='string'){
     	$dgbtn = $($dgbtn) ;
     }
     if(!up.upReset){
     	up.upReset = function (obj){ // 修改重置的时候的回调 , 返回原始数据 ， 就是修改的时候的初始化复制和保存初始化的值 。
     		$(this).setValues($dialogInfo.find('input:not(.no-re)'),obj);
     		return obj ; 
     	}
     }
     if(!up.sendData){ // 如果使用的是默认的取值方式
     	up.sendData = function (obj){// obj , 已经获取到的值。默认修改要用到上原始修改留下的id
     		obj.id = upBeginO.id ;
     		return  obj ;
     	}
     }
     if(!add.sendData){//添加给后台发送数据到时候如果有不同在重新组合；
     	add.sendData = function (obj){// obj , 已经获取到的值。
     		return  obj ;
     	}
     }
     if(!del.delData){
     	del.delData = function(arr){ // 删除的时候的对象。这是传统的写法， 传递id拼接起来然后删除。
     		var id = [] ; 
     		if(arr.length==1){
     			return {id:arr[0].id} ;
     		}
     		for(var a = 0,d;d=arr[a] ;a++){
     			id.push(d.id);
     		}
     			return {id:id.join(',')} ;
     	}
     };
     function CLICKFN(){
    	//$o = 点击事件的特殊处理
 		var $t = $(this) ,arr = $dg?$dg.datagrid('getSelections'):inintObj.dataFn?inintObj.dataFn.call($t,$t.data('curd')):[],
 			crudUp = 'input[crud-nd1],input[crud-nd3]',crudUp2 = 'input[crud-nd]',//crudUp:不可编辑。 crudUp2：可编辑
 			title='',ck= $t.attr('data-options') || '',$o,tsf=function($O){
 			!$O.find('button.curd-save').length&&(console.error('未找到弹出确定点击事件,无法区分是要添加还是修改还删除,请给弹窗确定button按钮添加class："curd-save"'));
 		};
 		if($.type(ck)==='string'){
 			ck = ck.tojson()|| {};
 			ck.parseFn = ck.parseFn || inintObj.parseFn ||false ;
 			if(ck.parseFn){
 				var reFn = ck.parseFn.call($t,arr,$t.data('curd')) ;
 				if($.type(reFn)==='boolean' && reFn===false){//如果返回false ,不再触发弹出框事件 。
 					return ;
 				}
 				ck= $t.attr('data-options');	
 			}
 		}
 		ck ?ck = ($t.attr('data-options')+'').tojson():ck={};
 		ck.pre && ($o=$(ck.pre));
 		if(ck.diaPre){$dialogInfo=$(ck.diaPre)};
 		switch ($t.data('curd')){
 			case 'add'://如果是增加
 			title='添加' ;
 			ck.clickfn&&ck.clickfn();//点击增加的时候执行， 
 			add.beginFn?add.beginFn():$.noop();
 			case 'update'://如果是修改
 				/**** Begin  解决修改或增加的时候某些值不清空  ***********/
 				title=='' && (crudUp = 'input[crud-nd],input[crud-nd3]',crudUp2 = 'input[crud-nd1]') ;
 				for(var a = 0,ar=$dialogInfo.find(crudUp),d,$d;d=ar[a] ;a++){
 					$d =$(d); 
 					if($d.hasClass('easyui-combobox')){
 						$d.combobox('disable') ;
 					}else{
 						$d.attr('readonly','readonly').addClass('no-click');
 					}
 				};
 				for(var a = 0,ar=$dialogInfo.find(crudUp2),d,$d;d=ar[a] ;a++){
 					$d =$(d); 
 					if($d.hasClass('easyui-combobox')){
 						$d.combobox('enable');
 					}else{
 						$d.removeAttr('readonly').removeClass('no-click'); 
 					}
 				};
 				/**** 解决修改或增加的时候某些值不清空  End***********/
 			if($o){
 				$o.find('button.curd-reset').data('ts','true').click().removeData('ts') ;	
 			}else{
 				$dialogInfo.find('button.curd-reset').data('ts','true').click().removeData('ts') ;
 			}
 			if(title==''){
 				if(arr.length!=1){
 					layer.alert('请选择一条后在修改，当前已选择'+arr.length+'条',{shadeClose:true});
 					return ;
 				}
 				title="修改";
 				if($o){
 					$o.find('button.curd-save').removeData('add') ;
 					
 				}else{
 					$dialogInfo.find('button.curd-save').removeData('add') ;//当前已经切换到了添加模式。	
 				}
 				upBeginO = ck.upReset?ck.upReset.call($t,arr[0]):up.upReset.call($t,arr[0]); // 修改的时候初始化赋值。 
 			}else{
 				if($o){
 					$o.find('button.curd-save').data('add',true) ;//当前已经切换到了添加模式。
 				}else{
 					$dialogInfo.find('button.curd-save').data('add',true) ;//当前已经切换到了添加模式。
 				}
 			}
 			if($t.hasClass('no-click')){
 				inintObj.noClickInfo ? inintObj.noClickInfo.call($t,$t.data('curd')):layer.msg('请选择后再'+title,$.noop); 
 				return ;
 			}
 				layer.open($.extend({
 							type: 1,
 							title: [$t.attr('title'),'text-align:center;font-size:2em;color:#000;'],
 							area : [ck.width || width, ck.height || height],
 							shadeClose: true, //点击遮罩关闭层
 							content: $o||$dialogInfo,
 							success: function(layero, index){
 								($o||$dialogInfo).find('td>input:not(input[disabled],.no-click):eq(0)').focus();
 							}
 							},inintObj.layerOpen));
 			break;
 			case 'del'://如果是删除
 				if(arr.length==0){
 					layer.msg('请选择后再删除',$.noop);
 				}else if($t.hasClass('no-click')){
 					layer.msg('不能一次删除【'+arr.length+'】条，请重新选择！',$.noop);
 				}else{
 					$.SDcon({title:'删除确认',info:'确定要删除吗？共 '+arr.length+'条',fn:function(){
 						$.sendAjax.send(ck.url || del.url,del.delData(arr),function(data){
 						if(data.fail){
 							$.SDal({title: '操作失败',info: data.fail});     
 							}else{
 								layer.closeAll() ;
 								layer.msg('删除成功！') ;
 								$dg&&$dg.size()&&$dg.datagrid('reload',{sdmsg:1}) ;
 							}
 					});						
 					}});	
 				}
 			break;
 			default :
 				~PW.location.href.indexOf('localhost')&&console.error('请给按钮添加 data-curd 属性,值为add/update/del.否则不会弹出dialog,如果不需要用到crud的弹出框请忽略');
 			break ;
 		}
 		tsf($dialogInfo);
 	};
     ifOnClick===true ? $('body').on('click',$dgbtn,CLICKFN):$dgbtn.click(CLICKFN);
    // 弹窗确定点击事件
     inintObj.formsavepre!==false && $(formsavepre).click(function(){
		var $t = $(this) ,o,info="添加",url=add.url,ck= $t.attr('data-options');//ck验证和保存的选择器
		if(ck){
			ck = ck.tojson()|| {};
			ck.parseFn = ck.parseFn ||  inintObj.parseFn ;
			if(ck.parseFn){
				ck.parseFn.call($t,$t.data('add')?'add':'update') ;
				ck= $t.attr('data-options');	
			}
		}
		ck ?ck = ($t.attr('data-options')+'').tojson():ck = {};
		ck.pre = ck.pre || $dialogInfo.find('td>input') ;
		if($t.data('add')){// 如果是添加
			o = $.checkInputs(ck.checkPre || ck.pre ) ;
		}else{
			o = $.checkInputs(ck.checkPre || ck.pre ) ;
		}
		if(o.re){
			if(!$t.data('add')){
				url=up.url ;
				info="修改" ;
				if(ck.sendData){
					o = ck.sendData.call($t,$.getValues(ck.pre),upBeginO,'update') ;//如果是修改的话会传递回去原始数据 。	
				}else if(inintObj.sendData){
					o = inintObj.sendData.call($t,$.getValues(ck.pre),upBeginO,'update') ;//如果是修改的话会传递回去原始数据 。
				}else{
					o = up.sendData.call($t,$.getValues(ck.pre),upBeginO,'update') ;//如果是修改的话会传递回去原始数据 。
				}
			}else{
				if(ck.sendData){
					o = ck.sendData.call($t,$.getValues(ck.pre ),'add') ;	
				}else if(inintObj.sendData){
					o = inintObj.sendData.call($t,$.getValues(ck.pre),upBeginO,'add') ;//如果是修改的话会传递回去原始数据 。
				}else{
					o = add.sendData.call($t,$.getValues(ck.pre ),'add') ;
				}
			}
			if(o){//如果返回的是不是false就说明可以走后台了
				$.sendAjax.send(ck.url || url,o,function(data){
					if(data.fail){
						$.SDal({title: inintObj.saveInfo?inintObj.saveInfo():info+'失败',info: data.fail});     
					}else{
						$dg&&$dg.size()&&$dg.datagrid('reload',{sdmsg:1});
						layer.msg(inintObj.saveInfo?inintObj.saveInfo(true):info+'成功！') ;
						var cl =$('.layui-layer-close'); 
						if(ck.yesFn){
							ck.yesFn(info)	
						}else if(inintObj.yesFn){
							inintObj.yesFn(info);
						}
						if(cl.size()==1){//如果有一个弹出层
							cl.click() ;
						}else if(cl.size()>1){
							$t.parents('div.layui-layer.layui-layer-page').find('>span>a.layui-layer-close').click();
						}else{
							layer.closeAll('page'); 
						}
					}
				}) ;	
			}
		}else{
			o.reobj && layer.tips('缺少信息：'+o.info, o.reobj.hasClass('layui-upload-file')?o.reobj.prev():o.reobj);
		}
	});
}


