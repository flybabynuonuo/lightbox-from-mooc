;(function($){
	var Lightbox = function(settings){
		var self = this;
		this.settings = {
			speed:500
		}
		$.extend(this.settings,settings || {});
		//创建遮罩和弹出框
		this.popupMask= $('<div id="lightbox-mask">');
		this.popupWin = $('<div id="lightbox-popup">');

		//保存body
		this.bodyNode = $(document.body);

		// 渲染剩余的DOM，并且插入到BODY

		this.renderDOM();
		this.picViewArea = this.popupWin.find("div.lightbox-pic-view");
		this.popupPic = this.popupWin.find("img.lightbox-image");
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption");
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");
		this.captionText = this.popupWin.find("p.lightbox-pic-desc");
		this.currentIndex = this.popupWin.find("span.lightbox-of-index");
		this.closeBtn = this.popupWin.find("span.lightbox-close-btn");
		// 准备开发事件委托，获取组数
		this.groupName = null;
		this.groupData = [];
		this.bodyNode.delegate('.js-lightbox','click',function(e){
		   //阻止事件冒泡,不影响其它事件
		   	e.stopPropagation();
			var currentGroupName = $(this).attr("data-group");
			if(currentGroupName != self.groupName){
				self.groupName = currentGroupName;
				//根据当前组名获取同一组数据
				self.getGroup();
			};
			// 初始化弹框
			self.initPopup($(this));
		   
		});
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});
		this.closeBtn.click(function(){
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});

		this.flag=true;
		this.nextBtn.hover(function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).addClass("lightbox-next-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).removeClass("lightbox-next-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("next");
			}
		});
		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).addClass("lightbox-prev-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).removeClass("lightbox-prev-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			}
		});

			// ie6
		this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent);

		var timer = null;
		this.clear = false;
		$(window).resize(function(){
			if(self.clear){
				window.clearTimeout(timer);
				timer = window.setTimeout(function(){
					self.loadPicSize(self.groupData[self.index].src);
				},500)

				if(self.isIE6){
					self.popupMask.css({
						width:$(window).width(),
						height:$(window).height()
					})
				}
			}
		}).keyup(function(e){
			var keyValue = e.which;
			if(self.clear){
				if(keyValue== 38 || keyValue == 37){
					self.prevBtn.click();
				}else if(keyValue== 40 || keyValue == 39){
					self.nextBtn.click();
				}				
			}
		})

		// 如果是ie6s
		// if(this.isIE6){
		// 	$(window).scroll(function(){
		// 		self.popupMask.css({"top":$(window).scrollTop()});
		// 	})
		// }
	};
	
	Lightbox.prototype = {
		goto:function(dir){
			if(dir === "next"){	
				this.index++;
				if(this.index >= this.groupData.length - 1){
					this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
				};
				if(this.index != 0){
					this.prevBtn.removeClass("disabled").addClass("lightbox-prev-btn-show");	
				}

				
			}else if(dir === "prev"){
				this.index--;
				if(this.index <= 0){
					this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
				};
				if(this.index !=this.groupData.length - 1){
					this.nextBtn.removeClass("disabled").addClass("lightbox-next-btn-show");
				};
			}
			var src = this.groupData[this.index].src;
			this.loadPicSize(src);
		},
		showMaskAndPopup:function(sourceSrc,currentId){
			var self = this;
			this.popupPic.hide();
			this.picCaptionArea.hide();
			
			var winWidth = $(window).width(),
			winHeight = $(window).height();
			this.picViewArea.css({
				width:winWidth/2,
				height:winHeight/2
			})

			if(this.isIE6){
				var scrollTop = $(window).scrollTop();
				this.popupMask.css({
					width:winWidth,
					height:winHeight,
					top:scrollTop
				});
			}
			
			this.popupMask.fadeIn();
			this.popupWin.fadeIn();

			var viewHeight = winHeight/2 + 10;
			var topAnimate = (winHeight-viewHeight)/2;

			this.popupWin.css({
				width:winWidth/2 + 10,
				height:winHeight/2 +10,
				marginLeft:-(winWidth/2 + 10)/2,
				top:(this.isIE6?-(viewHeight + scrollTop):-viewHeight)
			}).animate({
				top:(this.isIE6?(topAnimate+scrollTop):topAnimate)
			},self.settings.speed,function(){
				self.loadPicSize(sourceSrc);
			});

			this.index = this.getIndexOf(currentId);

			var groupDataLength = this.groupData.length;
			if(groupDataLength > 1){
				if(this.index === 0){
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				}else if(this.index === groupDataLength - 1){
					this.nextBtn.addClass("disabled");
					this.prevBtn.removeClass("disabled");
				}else{
					this.nextBtn.removeClass("disabled");
					this.prevBtn.removeClass("disabled");
				}
			}else if(groupDataLength == 1){
					this.prevBtn.addClass("disabled");
					this.nextBtn.addClass("disabled");
			}
		},
		loadPicSize:function(sourceSrc){
			// 加载图片
			var self = this;
			self.popupPic.css({
				width:"auto",height:"auto"
			}).hide();
			this.picCaptionArea.hide();

			this.preLoadImg(sourceSrc,function(){
				self.popupPic.attr("src",sourceSrc);
				var picWidth = self.popupPic.width(),
				picHeight = self.popupPic.height();
				self.changePic(picWidth,picHeight);
			});
		},
		changePic:function(width,height){
			var self = this,
			winWidth = $(window).width(),
			winHeight = $(window).height();

			// 过滤宽高
			var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
			width = width * scale;
			height = height * scale;
			this.picViewArea.animate({
				width:width-10,
				height:height-10
			},self.settings.speed);

			var top = (winHeight-height)/2;
			if(this.isIE6){
				top += $(window).scrollTop();
			}
			this.popupWin.animate({
				width:width,
				height:height,
				marginLeft:-(width/2),
				top:top
			},self.settings.speed,function(){
				self.popupPic.css({
					width:width-10,
					height:height-10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag = true;
				self.clear = true;
			});

			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text("当前索引： " + (this.index +1) + " of " + this.groupData.length) ;
		},
		preLoadImg:function(src,callback){
			var img = new Image();
			if(!!window.ActiveXObkect){
				img.onreadystatechange = function(){
					if(this.readyState == "complete"){
						callback();

					}
				}
			}else{
				img.onload = function(){
					callback();
				}
			};
			img.src = src;
		},
		getIndexOf:function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				index = i;
				if(this.id === currentId){
					return false;
				}
			});
			return index;
		},
		initPopup:function(currentObj){
			var self = this,
			sourceSrc = currentObj.attr("data-source"),
			currentId = currentObj.attr("data-id");
			this.showMaskAndPopup(sourceSrc,currentId);
		},
		getGroup:function(){
			var self = this;
			//根据当前的组别获取页面中所有相同组名的对象
			var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]");
			// 清空数组数据
			this.groupData = [];
			groupList.each(function(){
				self.groupData.push({
					src:$(this).attr("data-source"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				});
				
			})
		},
		renderDOM:function(){
			var strDOM = '<div class="lightbox-pic-view">'+
						'<span class="lightbox-btn lightbox-prev-btn"></span>'+
						'<img src="images/2-2.jpg" alt="" class="lightbox-image">'+
						'<span class="lightbox-btn lightbox-next-btn"></span>'+
					'</div>'+
					'<div class="lightbox-pic-caption">'+
						'<div class="lightbox-caption-area">'+
							'<p class="lightbox-pic-desc">图片标题</p>'+
							'<span class="lightbox-of-index">当前索引</span>'+
						'</div>'+
						'<span class="lightbox-close-btn"></span>'+
					'</div>';
			// 插入到this.popupWin
			this.popupWin.html(strDOM);
			// 把遮罩和弹出框插入到body里
			this.bodyNode.append(this.popupMask , this.popupWin);
		}
	};
	window["Lightbox"] = Lightbox;
})(jQuery);