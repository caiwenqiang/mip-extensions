/**
 * @file mip-mmtpk 组件
 * @author cwqiangne@163.com
 */

define(function (require) {
	var $ = require('zepto');
    var customElement = require('customElement').create();
    
	var themeApp = {
		backToTop: function() {
			$(window).scroll(function(){
				if ($(this).scrollTop() > 200) {
					$('#back-to-top').css("display","inline");
				} else {
					$('#back-to-top').css("display","none");
				}
			});
			$('#back-to-top').on('click', function(e){
				e.preventDefault();
				$('html, body').scrollTop(0);
				return false;
			});
		},
		voting: function() {
			$('.picture-like').on('click', function(){
				var a = $(this),
				aid = a.attr("id").replace("like_picture_", "");
				if (a.attr("disabled")!="disabled") {
					$.post(phpurl+"/digg_ajax.php", "action=good&id="+aid);
					var n1 = a.find(".num"), n2 = a.parent().prev().find(".num"), num = n1.length == 0 ? n2 : n1;
					num.text(parseInt(num.html()) + 1),a.attr("disabled","disabled"),$("#like").text(num.html());
					VoteHistory.voteState(aid, 1);
				}
			});
		},
		init: function() {
			themeApp.voting();
			themeApp.backToTop();
		}
	},
	VoteHistory = {
		_Historys: null,
		_IsValid: null,
		voteState: function (a, b) {
		 	return this.isValid() ? null == b ? this._Historys[a] : (this._Historys[a] = b, void this.saveHistory()) : 0;
		},
		isValid: function () {
			if (this._IsValid == null) {
				this._IsValid = window.localStorage ? true : false;
			}
			return this._IsValid;
		},
		readHistory: function () {
			this._Historys = window.localStorage.getItem("vote_history"),
			this._Historys = JSON.parse(this._Historys),
			null == this._Historys && (this._Historys = {});
		},
		saveHistory: function () {
			if (null != this._Historys) {
				var a = 500,
				b = function (m) {
					var n = [];
					for (var j in m) n.push(j);
					return n;
				},
				c = b(this._Historys);
				if (c.length > a) {
					var d = c.length - a;
					for (i = 0; d > i; i++) delete this._Historys[c[i]]
				}
				var e = JSON.stringify(this._Historys);
				window.localStorage.setItem("vote_history", e);
			}
		},
		_init: function () {
		 	this.isValid() && this.readHistory();
		},
		updateArticleStates: function () {
			if (this.isValid()) {
				articles = [];
				$.each($("button[id^=like_picture_]"),
				function () {
					articles.push(+this.id.replace("like_picture_", ""));
				});
				$.each(articles,
				function (a) {
					var b = articles[a],
					c = VoteHistory.voteState(b);
					if (void 0 != c) {
						var d = $("#like_picture_" + b);
						var n1 = d.find(".num"), n2 = d.parent().prev().find(".num"), num = n1.length == 0 ? n2 : n1;
						num.text(parseInt(num.html()) + 1),d.attr("disabled","disabled"),$("#like").text(num.html());
					}
				});
			}
		}
	};
	
    customElement.prototype.build = function () {
    	var ele = this.element;
        window.phpurl = ele.getAttribute('phpurl');
        
        var aid = ele.getAttribute('aid');
        if (aid) {
        	var now = ele.getAttribute('now');
        	if (now == 1) $.post(phpurl+"/count.php", "aid="+aid);
        }
        
        themeApp.init();
		VoteHistory._init();
		VoteHistory.updateArticleStates();
    };
    
    return customElement;
});
