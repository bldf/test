(function(m,w){
	/**
	 * 此js封装了 1:基于easyui-datagrid底部的增加，修改，删除。的事件的绑定。2:当我们只是需要点击一个按钮弹出一个dialog然后做点事情就关闭。
	 * 弹出框中的输入框添加属性， ： crud-nd1 : // 在增加的时候使用不可编辑，
	 *     					crud-nd : // 在修改的时候使用不可编辑，
	 *     					crud-nd3 : // 在增加和修改的时候不可编辑
	 * demo:
	 		var cd = new CD({
				delurl:'',//type:[string]删除数据的url . 默认undefined
				addurl:'/part/addPartMsg.do',// type:[string]添加数据的url . 默认undefined
				upurl:'/part/updatePartMsg.do',//type:[string]修改数据的url . 默认undefined
				dg : '#dg', //type:[string]绑定datagrid的一个选择器。 默认值为：'#dg'. 
				context :$('body'),//type:[object] datagrid底部点击事件的委托父元素。 默认 .sd-footer 或者   body 如果引入的是，上边查询，下边列表。 searchModdle.css 。用默认的即可
				dgbtn : '#footer>button[data-curd]' , //type:[string] datagrid中底部的增删改的按钮元素选择器 。 默认  '#footer>button[data-curd]'
				saveBtn:'.curd-save',//type:[string] . 弹窗确定点击事件的选择器。默认值为 '.curd-save'
				dialog : '#dialogInfo',//type:[string]弹窗dialog选择器 。 默认值为：'#dialogInfo',
				});
		如果大部分都用默认配置，请使用：
			var cd = new CD({
				delurl:'',//type:[string]删除数据的url . 默认undefined
				addurl:'/part/addPartMsg.do',// type:[string]添加数据的url . 默认undefined
				upurl:'/part/updatePartMsg.do',//type:[string]修改数据的url . 默认undefined
				});
			var cdFns = cd.crud.con ; //返回一个json对象， 拥有三个方法。 add, update , del 。 调用传入如下对应的参数即可。
			 cdFns.add('dialog',{bFn:function(){开始打开的时候触发},setD:{设置初始值},eFn:function(){打开结束执行的方法}});
			 cdFns.update('dialog',{bFn:function(){开始打开的时候触发},setD:{设置初始值},eFn:function(){打开结束执行的方法}});
			 cdFns.del($btn,arr,url);
			 console.log(cd.crud.con );
	  
	 */
	w.CD = m.Class.extend({
		init:function(options){//相当于构造函数,初始化就执行。
			this.crud = {con:''};
			this.$dg = options.dg?$(options.dg):$('#dg');
			this.options=$.extend({context:$('.sd-footer').length?$('.sd-footer'):$('body'),dgbtn:'#footer>button[data-curd]',saveBtn:'.curd-save'},options); 
			Object.defineProperty(this.crud,'con',{get:(function(){
				var self = this ;
				// 在弹出dialog的时候的公共方法
				function pubop(type,opt){//这里的this指向弹出的dialog的对象。
					/**** Begin  解决修改或增加的时候某些禁止输入  ***********/
					var crudUp = 'input[crud-nd1],input[crud-nd3]',crudUp2 = 'input[crud-nd]';//crudUp:不可编辑。 crudUp2：可编辑
					type=='up' && (crudUp = 'input[crud-nd],input[crud-nd3]',crudUp2 = 'input[crud-nd1]');
	 				for(var a = 0,ar=this.find(crudUp),d,$d;d=ar[a] ;a++){
	 					$d =$(d); 
	 					if($d.hasClass('easyui-combobox')){
	 						$d.combobox('disable');
	 					}else{
	 						$d.attr('readonly','readonly').addClass('no-click');
	 					}
	 				};
	 				for(var a = 0,ar=this.find(crudUp2),d,$d;d=ar[a] ;a++){
	 					$d =$(d); 
	 					if($d.hasClass('easyui-combobox')){
	 						$d.combobox('enable');
	 					}else{
	 						$d.removeAttr('readonly').removeClass('no-click'); 
	 					}
	 				};
	 				/**** 解决修改或增加的时候某些禁止输入  End***********/
	 				/****  Begin 控制在弹出的时候哪些元素显示，哪些元素隐藏   ***********/
	 				if(opt){
	 					opt.show&&this.find(opt.show).removeClass('crud-hidden');
	 					opt.hide&&this.find(opt.hide).addClass('crud-hidden');
	 				}
	 				/****   控制在弹出的时候哪些元素显示，哪些元素隐藏   End  ***********/
	 				this.find('button.curd-reset').data('ts','true').click().removeData('ts') ;	//清空所有的值
				}
				 var ret = {
					 add:function(dialog,Da){//dialog  : 弹出框的选择器
						 Da=Da||{};
						 Da.bFn&&Da.bFn.call(self);//打开dialog之前执行的操作。 
						 self.go($.extend({content:$(dialog)},Da.dialog));
						 pubop.call($(dialog),'add',Da) ;//执行公共的方法，比如清空值、添加禁止输入样式
						 Da.setD && self.setVal($(dialog).find('input[name]'),Da.setD)//如果有修改的时候的赋值操作。
						 Da.eFn&&Da.eFn.call(self);//dialog打开之后执行的操作。 
					 },
					 update:function(dialog,Da){//dialog  : 弹出框的选择器
						 Da=Da||{};
						 Da.bFn&&Da.bFn.call(self);//打开dialog之前执行的操作。 
						 self.go($.extend({content:$(dialog)},Da.dialog));
						 pubop.call($(dialog),'up',Da) ;//执行公共的方法，比如清空值，添加禁止
						 self.setVal($(dialog).find('input[name]'),Da.setD)//如果有修改的时候的赋值操作。
						 Da.eFn&&Da.eFn.call(self);//dialog打开之后执行的操作。 
					 },
					 del:function($btn,arr,url){//$btn执行删除按钮 , arr 选中的数据
						 if(arr.length==0){
			 					layer.msg('请选择后再删除',$.noop);
			 				}else if($btn.hasClass('no-click')){
			 					layer.msg('不能一次删除【'+arr.length+'】条，请重新选择！',$.noop);
			 				}else{
			 					$.SDcon({title:'删除确认',info:'确定要删除吗？共 '+arr.length+'条',fn:function(){
			 						$.sendAjax.send(url,self.delData(arr),function(data){
			 						if(data.fail){
			 								$.SDal({title: '操作失败',info: data.fail});     
			 							}else{
			 								layer.closeAll() ;
			 								layer.msg('删除成功！') ;
			 								self.$dg.size()&&self.$dg.datagrid('reload',{sdmsg:1}) ;
			 							}
			 					});						
			 					}});	
			 				}
					 }
				 };
				return ret ;
			}).bind(this)});
			//封装事件
			//
			this.initEvent();
		},
		initEvent:function(){
			var self = this ; 
			this.options.context.on('click',this.options.dgbtn,function(){//添加标准datagrid底部点击事件
				self.e_dgbtn.call(self,$(this));
			});
			this.options.context.on('click',this.options.saveBtn,function(){//添加dialog点击确定的事件。
				self.e_savebtn.call(self,$(this));
			});
		},
		e_savebtn:function($b){//弹窗确定点击事件。 $b弹窗确定按钮 , 这里的this指向整体的大json.
			// 1: 验证输入框是否都有值 
			var ck = ($b.attr('data-options')+'').tojson(),o,self=this,type=this.cache.bUpData?'up':'add';
			if(PW.location.href.indexOf('localhost') || LL.crud){//添加开发状态下的提示
			     if(!ck.checkPre)console.warn('弹窗确定按钮中的data-options未添加checkPre验证规则，默认验证当前dialog中的table中的input,如果符合请忽略此信息');
			     if(!ck.pre)console.warn('弹窗确定按钮中的data-options未添加获取值pre，默认获取当前dialog中的table中的input,如果符合请忽略此信息');
			}
			ck.pre = ck.pre || $b.parents('table').find('td>input') ;//如果没有
			o = $.checkInputs(ck.checkPre || ck.pre );
			if(o.re){//如果验证规则符合
				o=this.sendDataUp.call(this,type,$.getValues(ck.pre));
				if(o){//返回的不是false，就可以走后台了
					$.sendAjax.send(this.options[type+'url'],o,function(data){ //如果提示有不一样的请给 按钮添加。 demodata-options="ts:'修改库存'"
						var ts = ck.ts?ck.ts:type=='add'?'添加':'修改',cl; 
						if(data.fail){
							$.SDal({title:ts+'失败',info: data.fail});     
						}else{
							self.$dg&&self.$dg.size()&&self.$dg.datagrid('reload',{sdmsg:1});
							layer.msg(ts+'成功！') ;
							cl =$('.layui-layer-close'); 
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
			}else{//验证规则不符合
				o.reobj && layer.tips('缺少信息：'+o.info, o.reobj.hasClass('layui-upload-file')?o.reobj.prev():o.reobj);
			}
		},
		e_dgbtn:function($d){//$d给footer中的button按钮点击事件, 这里的this指向整体的大json.
			switch($d.attr('data-curd')){
				case 'add':
					this.cache.doStatus='add' ; 
					this.crud.con.add(this.options.dialog||'#dialogInfo',{dialog:{title:[$d.attr('title'),'text-align:center;font-size:2em;color:#000;']}});
				break;
				case 'update':
					var arr = this.$dg.datagrid('getSelections') ;
					if(arr.length==1){
						this.cache.bUpData = arr[0] ;
						this.cache.doStatus='up' ; 
						this.crud.con.update(this.options.dialog||'#dialogInfo',{setD:arr,dialog:{title:[$d.attr('title'),'text-align:center;font-size:2em;color:#000;']}});
					}else{
						this.cache.bUpData= null ; 
						layer.msg('请选择后再修改',$.noop);
					}
					break; 
				case 'del':
					this.crud.con.del($d,this.$dg.datagrid('getSelections'),this.options.delurl);
					break ; 
				default:
					console.warn('请给按钮添加 data-curd属性,值为add/update/del.否则不会弹出dialog,如果不需要用到curd的弹出框请忽略') ;
					break;
			}
		},
		go:function(obj){
			var o = {
					type: 1,//默认为1弹出dialog。
					title: ['','text-align:center;font-size:2em;color:#000;'],
					area : [600, 600],
					shadeClose: true, //点击遮罩关闭层
					content: $('#dialogInfo'),//默认弹出#dialogInfo这个dialog
					success: function(layero, index){
						
					}
					};
			layer.open($.extend(o,obj));
		},
		setVal:function(pre,obj){//赋值显示数据
			$.setValues(pre,$.type(obj)==='array'?obj[0]:obj);
		},
		delData:function(arr){//注意： arr是datagrid选中的数据的数组
			var id = [] ; 
     		for(var a = 0,d;d=arr[a] ;a++){
     			id.push(d.id);
     		}
     		return {id:id.join(',')};
		},
		cache:{//用于缓存数据使用,比如在修改的时候，要用到修改之前的数据，就在这里去取。
			bUpData:null,//修改dialog之前存放的数据。
			doStatus:'add',//操作当前的dialog属于那种类型， 默认为添加， 修改则为 'update'  
		},
		/**
		 * type: 'up', 'add' 
		 */
		sendDataUp:function(type,data){//发送ajax之前对数据进行修改 。 在修改和添加的时候使用到了。这里的this。指向整体大json
			if(this.cache.doStatus=='up'&&this.cache.bUpData.id){
				data.id = this.cache.bUpData.id
			}
			return data ; 
		}
	});
})(M,window);