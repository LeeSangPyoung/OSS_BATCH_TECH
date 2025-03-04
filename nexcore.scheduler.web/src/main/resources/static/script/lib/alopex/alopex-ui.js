/*! Alopex UI - v2.3.1.16 - 2016-03-30
* http://ui.alopex.io
* Copyright (c) 2016 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */

var __ALOPEX_DEBUG = false;
var __ALOG = function() {};
if(__ALOPEX_DEBUG) { // TODO  IE에서 에러나지 않게 수정. (console.log 사용시)
	try{
		__ALOG = Function.prototype.bind ? console.log.bind(console) : function(){console.log(jQuery.makeArray(arguments).join(' '));};
	}catch(e){}
}

(function($) {
	
	$.alopex = $.extend($.alopex, {
		configMethods: {},
		widget : {},
		util: {},
		
		config: {
			pressedClassName: 'af-pressed',
			hoveredClassName: 'af-hover',
			selectedClassName: 'af-selected Selected',
			disabledClassName: 'af-disabled Disabled',
			themeName: 'af-default',
			classLoader: true,
			defaultComponentClass: {
				accordion: 'Accordion',
				button: 'Button',
				carousel: 'Carousel',
				checkbox: 'Checkbox',
				dateinput: 'Dateinput',
//				datepicker: 'Datepicker',
				daterange: 'Daterange',
				dialog: 'Dialog',
				divselect: 'Divselect',
				dropdown: 'Dropdown',
				dropdownbutton: 'Dropdownbutton',
				group: 'Group',
				groupbutton: 'Groupbutton',
				icon: 'Icon',
				list: 'List',
				navmenu: 'Navmenu',
				overlay: 'Overlay',
				paging: 'Paging',
				panel: 'Panel',
				progressbar: 'Progressbar',
				radio: 'Radio',
				scrollview: 'Scrollview',
				select: 'Select',
				slider: 'Slider',
				spinner: 'Spinner',
				table: 'Table',
				tabs: 'Tabs',
				textarea: 'Textarea',
				textinput: 'Textinput',
				togglebutton: 'Toggle',
				tooltip: 'Tooltip',
				tree: 'Tree'
			},
			componentSelector: { /* 키로 사용되는 게 클래스명, 그 클래스 명에 사용되는 컴퍼넌트가 값으로 입력. 이 상태로 입력되어야 여러 다양한 클래스명이 컴퍼넌트로 활용되며, 클래스가 충돌되지 않는다. */
				'.Paging > .link': 'button'
			}
			
		},
		
		
		inherit: function(parent, child) {
			var obj = $.extend({}, parent, child);
			obj.eventHandlers = $.extend({}, parent.eventHandlers, child.eventHandlers);
			parent.getters = parent.getters || []; 
			parent.setters = parent.setters || [];
			child.getters = child.getters || [];
			child.setters = child.setters || [];
			obj.getters = parent.getters.concat(child.getters);
			obj.setters = parent.setters.concat(child.setters);
			obj.properties = $.extend({}, parent.properties, child.properties);
			obj.parent = parent;
			obj.markup = child.markup;
			obj.style = child.style;
			obj.event = child.event;
			obj.init = child.init;
			obj.defer = child.defer;
			return obj;
		},
		
		/**
		 * widget의 property를 등록하는 함수. 
		 * load 시점 이전에 호출하여야 한다.
		 */
		setup: function(widgetname, option) {
			if(typeof widgetname == 'string') { // 
				if ($.alopex.widget[widgetname]) { // Alopex UI Component
					$.extend($.alopex.widget[widgetname].properties, option);
				} else if ($.isFunction($.alopex.configMethods[widgetname])) {
					var args = $.makeArray(arguments).slice(1);
					$.alopex.configMethods[widgetname].apply(null, args);
				}
			} else { // alopex 공통 setup으로 사용되는 경우
				option = widgetname;
				$.extend(true, $.alopex.config, option);
			}
		},
		
		registerSetup: function(name, handler) {
			$.alopex.configMethods[name] = handler;
		},
		
		convert: function(root) {
			var startup = {
				markup: [],
				style: [],
				event: [],
				init: [],
				defer: []
			};
			if(!$.alopex.util.isValid(root)) {
				root = 'body';
			}

			// Class Loader Logic
			if($.alopex.config.classLoader) {
				for(var i in $.alopex.config.defaultComponentClass) {
					$(root).findAll('.'+ $.alopex.config.defaultComponentClass[i]).each(function(idx, element) {
						$(element).attr({
							'data-type': i,
							'data-classinit': 'true'
						});
					});
				}
				for(var i in $.alopex.config.componentSelector) { /* 컴퍼넌트화 할 셀렉터  */
					$(root).findAll(i).each(function(idx, element) {
						if($.alopex.widget[$.alopex.config.componentSelector[i]]) {
							$(element).attr({
								'data-type': $.alopex.config.componentSelector[i],
								'data-classinit': 'true'
							});
						}
					});
				}
			}
			
			// Converting Order : markup -> style -> event -> init -> defer 
			$(root).findAll('[data-type]').each(function() {
				var inits = $.alopex.widget.object._getInitHandlers(this);
				startup.markup = startup.markup.concat(inits.markup);
				startup.style = startup.style.concat(inits.style);
				startup.event = startup.event.concat(inits.event);
				startup.init = startup.init.concat(inits.init);
				startup.defer = startup.defer.concat(inits.defer);
			});

			for ( var i = 0; i < startup.markup.length; i++) {
				var object = startup.markup[i];
				if(!$.alopex.util.isConverted(object.element)) { // checkup of pre-generated element
					object.constructor.call(object.widget, object.element, $.alopex.util.getOptions(object.element));
				}
			}
			for ( var i = 0; i < startup.style.length; i++) {
				var object = startup.style[i];
				if(!$.alopex.util.isConverted(object.element)) {
					object.constructor.call(object.widget, object.element, $.alopex.util.getOptions(object.element));				
				}
			}
			for ( var i = 0; i < startup.init.length; i++) {
				var object = startup.init[i];
				if(!$.alopex.util.isConverted(object.element)) {
					object.constructor.call(object.widget, object.element, $.alopex.util.getOptions(object.element));
				}
			}
			for ( var i = 0; i < startup.event.length; i++) {
				var object = startup.event[i];
				if(!$.alopex.util.isConverted(object.element)) {
					object.constructor.call(object.widget, object.element, $.alopex.util.getOptions(object.element));
				}
			}
			for ( var i = 0; i < startup.defer.length; i++) {
				var object = startup.defer[i];
				if(!$.alopex.util.isConverted(object.element)) {
					object.constructor.call(object.widget, object.element, $.alopex.util.getOptions(object.element));
				}
			}
			
			//$(document).trigger('alopexuiready');
			// alopexuiready 이벤트는 alopexready가 발생하지 않는 상황(tabs 컨텐트 로딩 등)에서
			// init 함수가 호출되는 기준이 됨. 그러나, 시점 차이로 인해 로딩 시 발생하는 것 보다 
			// 특정 케이스에서 강제로 처리.(탭 로딩 이후 컨버트까지 처리한 이후에 발생하는 등)
		},
		
		checkBrowser: function() {
			window.browser = $.alopex.util.getBrowserName();
		},
		
		_getter: function(methodname, args) {
			if (this.length < 1) {
				return this;
			}
			var el = this[0];
			var dataType = (this.prop('alopextype'))?this.prop('alopextype'): [];
			if($.alopex.util.isValid(el.getAttribute('data-type'))) {
				dataType = $.alopex.util.arrayjoin(new Array(el.getAttribute('data-type')), dataType);
			}
			if ($.alopex.util.isValid(dataType)) {
				for(var i=0; i<dataType.length; i++) {
					var component = $.alopex.widget[dataType[i]];
					var method = component[methodname];
					if(method && typeof method == 'function'){
						if ($.alopex.util.isValid(component)) {
							var newArg = [el];
							for ( var i = 0; i < args.length; i++) {
								newArg.push(args[i]);
							}
							if(!$.alopex.util.isValid(el.alopex)) { // init process not started
								component._constructor.apply(component, [this, $.extend($.alopex.util.getOptions(this), args.length>0?args[0]:undefined)]);
							} else if(!$.alopex.util.isConverted(this)) {
								// in case the component is not converted
								//component._constructor.apply(component, [this, $.extend($.alopex.util.getOptions(this), args.length>0?args[0]:undefined)]);
								var __comp = component;
								var __args = newArg;
								$(el).one('initcomplete.alopexui', function() {
									return __comp[methodname].apply(__comp, __args);
								});
							}
							return component[methodname].apply(component, newArg);
						}
					}
				}
			}
		},
		
		_setter: function(methodname, args) {
			return this.each(function() {
				var dataType = ($(this).prop('alopextype'))?$(this).prop('alopextype'): [];
				if($.alopex.util.isValid(this.getAttribute('data-type'))) {
					dataType = $.alopex.util.arrayjoin(new Array(this.getAttribute('data-type')), dataType);
				}
				if (dataType.length > 0) {
					var newArg = [this];
					for ( var i = 0; i < args.length; i++) {
						newArg.push(args[i]);
					}
					for(var i=0; i<dataType.length; i++) {
						var component = $.alopex.widget[dataType[i]];
						var method = component[methodname];
						if(dataType[i] == methodname) { // init method
							if(component && component._constructor) { 
								component._constructor.apply(component, [this, $.extend($.alopex.util.getOptions(this), args.length>0?args[0]:undefined)]);
								break;
							}
						} else if(method && typeof method == 'function'){
							if ($.alopex.util.isValid(component)) {
								if(!$.alopex.util.isValid(this.alopex)) { // init process not started 
									component._constructor.apply(component, [this, $.extend($.alopex.util.getOptions(this), args.length>0?args[0]:undefined)]);
									component[methodname].apply(component, newArg);
								} else if(!$.alopex.util.isConverted(this)) { // init started, but not finished.
									// in case the componenet is not converted
									var __comp = component;
									var __args = newArg;
									$(this).one('initcomplete.alopexui', function() {
										__comp[methodname].apply(__comp, __args);
									});
								} else { // converted
									component[methodname].apply(component, newArg);
								}
								
								break;
							}
						}
					}
				} else if($.alopex.widget[methodname]) { // CASE : no data-type attribute, but constructor method called
					var component = $.alopex.widget[methodname];
					if(component.pre) {
						component.pre.apply(component, [this]);
					}
				}
			});
		}
	});
	
	$.fn.convert = function() {
		return this.each(function(){
			$.alopex.convert(this);
		});
	};
	
	$.fn.setEnabledAll = function(flag) {
		var $el = this;
		$el.find('input[data-type], select[data-type], button[data-type], textarea[data-type]').each(function() {
			$(this).setEnabled(flag);
		});
	};

})(jQuery);

(function($) {
	window.didKeyupHandler = "Y";
	var builtInRegexp = {
			digits: '0-9',
			lowercase: 'a-z',
			uppercase: 'A-Z',
			english: 'a-zA-Z',
			korean: '\u3131-\u3163\uac00-\ud7a3', // in IE, set value and type keyboard cause everything gone
			singlespace: ' ',
			decimal: '0-9.-'
	};

	var builtInKeyCode = {
			digits: '0-9',
			lowercase: 'A-Z',
			uppercase: 'A-Z',
			english: 'A-Z',
			korean: 'å',
			singlespace: ' ',
			decimal: '0-9.-'
	};

	var FnKeyCode = {
			8 : 'backspace',
			9 : 'tab',
			13 : 'enter',
			16 : 'shift',
			17 : 'ctrl',
			18 : 'alt',
			19 : 'pausebreak',
			20 : 'capslock',
			21 : 'han/young',
			25 : 'chinese',
			27 : 'esc',
			//32 : 'space', // space는 function키에서 제외.
			33 : 'pageup',
			34 : 'pagedown',
			35 : 'end',
			36 : 'home',
			37 : 'left',
			38 : 'up',
			39 : 'right',
			40 : 'down',
			45 : 'insert',
			46 : 'delete',
			91 : 'win-left',
			92 : 'win-right',
			93 : 'function',
			112 : 'f1',
			113 : 'f2',
			114 : 'f3',
			115 : 'f4',
			116 : 'f5',
			117 : 'f6',
			118 : 'f7',
			119 : 'f8',
			120 : 'f9',
			121 : 'f10',
			122 : 'f11',
			123 : 'f12',
			144 : 'numlock',
			145 : 'scrolllock'
	};
	

	var _to_ascii = {
			'188': '44',
			'109': '45',
			'190': '46', //period(.)
			'191': '47', //forward slash(/)
			'192': '96',
			'220': '92',
			'222': '39',
			'221': '93',
			'219': '91',
			'173': '45',
			'187': '61', //equal sign(=+) IE Key codes
			'186': '59', // IE Key codes
			'189': '45', //dash(-) IE Key codes
			'96': '48', //numpad 0
			'97': '49', //numpad 1
			'98': '50', //numpad 2
			'99': '51', //numpad 3
			'100': '52', //numpad 4
			'101': '53', //numpad 5
			'102': '54', //numpad 6
			'103': '55', //numpad 7
			'104': '56', //numpad 8
			'105': '57', //numpad 9
			'109': '45', //numpad subtract(-)
			'110': '46', //numpad decimal point(.)
			'111': '47' //numpad device(/)
	};
  

	var shiftUps = {
			'96': '~',
			'49': '!',
			'50': '@',
			'51': '#',
			'52': '$',
			'53': '%',
			'54': '^',
			'55': '&',
			'56': '*',
			'57': '(',
			'48': ')',
			'45': '_',
			'61': '+',
			'91': '{',
			'93': '}',
			'92': '|',
			'59': ':',
			'39': '\'',
			'44': '<',
			'46': '>',
			'47': '?'
	};
	
	var ATTRIBUTE = 'keyfilter';
	
	function checkWord(text, regexp) {
		var result = text.match(regexp);
		if(text == '' || result != null && result[0] == text) {
			return true;
		}
		return false;
	}
	
	function checkElement(element, regexp) {
		if(regexp) {
			var text, inputvalue;
			text = inputvalue =  $(element).val();
			var str = '';
			var strend = '';
			while(!checkWord(text, regexp)) {
				str = text;
				text = str.substr(0, str.length-1);
				var lastch = str.substr(str.length-1);
				if(checkWord(lastch, regexp)) {
					strend = lastch + strend;
				}
			}
			if(text + strend != inputvalue) {
				// IE 버그(.val()로 마지막 문자 지웠는데, blur 하면 지워진 문자가 기존 value를 덮어씀. 기존 value 다 지워짐)로 인한 [blur > .val() > 커서 제일 끝으로] 수행
				var newvalue = text + strend;
				$(element).blur();
				$(element).val(newvalue);
			    if (typeof element.selectionStart == "number") {
			    	element.selectionStart = element.selectionEnd = element.value.length;
			    } else if (typeof element.createTextRange != "undefined") {
			    	element.focus();
			        var range = element.createTextRange();
			        range.collapse(false);
			        range.select();
			    }
			}
			
		}
	}
	
	// builtin룰, custom룰, user add 룰 모두 검색하여 최종 룰을 array 형태로 return
	function concatRules(strRule, eventType){
		  var rule = '';
		  // keydown은 keyCode로 체크, keyup은 입력된 value로 체크
		  var definedRules = eventType.toLowerCase() === 'keydown' ? builtInKeyCode : builtInRegexp;

	      // 가이드에 "korean 타입에는 singlespace 포함됨." 이라고 나와있는데 기능 안되서 일단 부활시킴. (but, 왜 korean은 singlespace를 포함해야하는지는 의문..)
		  strRule = addSinglespaceAboutKorean(strRule);

	      var oneRule = strRule.split('|');
	      
	      for ( var i = 0; i < oneRule.length; i++) {
	          var name = oneRule[i];
	          if (definedRules[name]) {
	            rule += definedRules[name];
	          }
	        }
	      
		return rule;
	}
	
	function addSinglespaceAboutKorean(userInputRule){
		 // 가이드에 "korean 타입에는 singlespace 포함됨." 이라고 나와있는데 기능 안되서 일단 부활시킴. (but, 왜 korean은 singlespace를 포함해야하는지는 의문..)
	      // korean은 있는데, singlespace가 없으면 ... singlespace 추가
	      if(userInputRule.indexOf("korean") !== -1 && userInputRule.indexOf("singlespace") === -1) return userInputRule + "|singlespace";
	      
	      return userInputRule;
	}
  
	$(document).on('keydown.datafilter', '[data-' + ATTRIBUTE + '-rule],[data-' + ATTRIBUTE+']', function(e) {

    var key = e.which || e.charCode || e.keyCode;

    // allow copy&paste c = 67, v = 86
    if ((e.ctrlKey || e.metaKey) && (key === 67 || key === 86)) {
      return;
    }

    if (FnKeyCode[key])
      return;
    
    if(key === 229) { // 한글 IE key입력 오작동 수정
    	window.didKeyupHandler = "N";
  	   $(e.currentTarget).bind('blur.datafilter', e.currentTarget , ie_keyupHandler);
     }
    
    var builtinRule = $(e.currentTarget).attr('data-' + ATTRIBUTE + '-rule');
    if (typeof builtinRule == 'string') {

      var rule = concatRules(builtinRule, e.type);

      if (rule !== '') {

    	rule = new RegExp('[' + rule + ']', 'g');
    	
        // normalize keyCode
        if (_to_ascii.hasOwnProperty(key)) {
          key = _to_ascii[key];
        }

        var ch = String.fromCharCode(key);

        var isUp = (key >= 65 && key <= 90) ? true : false; // uppercase
        var isLow = (key >= 97 && key <= 122) ? true : false; // lowercase
        var isShift = ( e.shiftKey ) ? e.shiftKey : ( (key == 16) ? true : false ); // shift is pressed

        // CAPSLOCK is on 무조건 대문자
        if ((ch.toUpperCase() === ch && ch.toLowerCase() !== ch && !isShift)|| //caps is on
            (ch.toUpperCase() !== ch && ch.toLowerCase() === ch && isShift)) {
          //ch = String.fromCharCode(key);
        } else if ((ch.toLowerCase() === ch && ch.toUpperCase() !== ch && !isShift)||
            (ch.toLowerCase() !== ch && ch.toUpperCase() === ch && isShift)){
          if (isUp && !isShift) {
            ch = String.fromCharCode(key + 32);
          } else if (isShift && shiftUps.hasOwnProperty(key)) {
            // get shifted keyCode value
            ch = shiftUps[key];
          }
        }
        else if (isShift && shiftUps.hasOwnProperty(key)) { // digits 에서 shift + 2 = @  하면 숫자 2로 인식. @ 로 인식하도록 수정
            // get shifted keyCode value
            ch = shiftUps[key];
        }

        if(!$(e.currentTarget).attr('data-' + ATTRIBUTE) && !checkWord(ch,rule)){
            	e.preventDefault();
                return false;
        }
        
      }
    }
  });

	var ie_keyupHandler = function (e){
		$(e.currentTarget).unbind('blur.datafilter', ie_keyupHandler);
		if(window.didKeyupHandler === "N") keyupDatafilterHandler(e);
	}

	var keyupDatafilterHandler = function (e){
		window.didKeyupHandler = "Y";
		if(FnKeyCode[e.which]) return;
		
		var rule = '';

		var $el = $(e.currentTarget);
		var builtinRule = $el.attr('data-' + ATTRIBUTE + '-rule');
		if (typeof builtinRule == 'string') {
			rule = concatRules(builtinRule, e.type);
		}
		
		var customRule = $el.attr('data-' + ATTRIBUTE)
		if(typeof customRule == 'string') {
			rule += customRule;
		}

		if(rule !== '') {
			rule = new RegExp('[' + rule + ']', 'g');
			checkElement(e.currentTarget, rule);
		}
	};
	
	$(document).on('keyup.datafilter', '[data-' + ATTRIBUTE + '-rule],[data-' + ATTRIBUTE+']', keyupDatafilterHandler);
	
	if(!$.alopex) {
		$.alopex = {};
	}
	$.alopex.keyfilter = {
		add: function(name, keycode, regexp) { // 과거방식 (keycode를 동시에 왜 저장하는지 모르겠음)\
			if(name) {
				if(keycode) {
					builtInKeyCode[name] = keycode;
				}
				if(regexp){
					builtInRegexp[name] = regexp;
				}
			}
		},
		addKeyUpRegexpRule: function(name, regexp) { // add 함수에서 regexp 와 keycode 분리하여 addRegexpRule과 addKeycodeRule 함수 만듬
			if(typeof arguments[0] === 'string' && arguments[0] !== '') {
				if(typeof arguments[1] === 'string' && arguments[1] !== ''){
					builtInRegexp[arguments[0]] = arguments[1]; // keyup에서 처리함
				}
			}
		},
		addKeyDownKeycodeRule: function(name, keycode) { // add 함수에서 regexp 와 keycode 분리하여 addRegexpRule과 addKeycodeRule 함수 만듬
			if(typeof arguments[0] === 'string' && arguments[0] !== '') {
				if(typeof arguments[1] === 'string' && arguments[1] !== ''){
					builtInKeyCode[arguments[0]] = arguments[1]; // keyup에서 처리함
				}
			}
		}
	};
})(jQuery);
(function($) {
	/*********************************************************************************************************
	 * object
	 *********************************************************************************************************/
	$.alopex.widget.object = {

		widgetName: 'object',
		/**
		 * reference to parent class
		 * this.parent.setEnabled()
		 */
		parent: null, // parent class pointing

		/**
		 * default properties and value
		 */
		defaultClassName: 'af-object',

		/**
		 * getter & setter api
		 */
		getters: ['getEnabled'],
		setters: ['addPressHighlight', 'addHoverHighlight', 'setEnabled', 'refresh'],

		/**
		 * default properties of component class
		 */
		properties: {
			// element-based properties.
			enabled: true,
			_markup: null, // orignal markup
			_wrapper: null // root of component after converting
		},

		/**
		 * when the user want to add event handler like the following
		 */
		eventHandlers: {
//		        key: {event: 'dragstart selectstart', selector: '', data: {}, handler: '_cancelEventHandler'}
		},

		refresh: function(el) {
			var wrapper = this._getProperty(el, '_wrapper');
			var markup = this._getProperty(el, '_markup');
			if (wrapper && markup) {
				markup = $(markup)[0];
				$(wrapper).replaceWith(markup);
				$(markup)[this.widgetName]();
			}
		},

		/**
		 * in the case the markup should be changed 
		 */
		markup: function(el, options) {
			el.alopex = $.extend({}, this.properties, options);
			if(!el.alopexoptions) {
				el.alopexoptions = {};
			}
			el.alopexoptions = $.extend(el.alopexoptions, this.properties, options);
			this._setProperty(el, '_markup', el.outerHTML); 

			var render = this.renderTo(el, options);
			if (render) {
				var $template = $(render);
				var wrapper = this._generateMarkup($template[0], el);
				this._setProperty(el, '_wrapper', wrapper);
			}
		},

		/**
		 * To add default style of component
		 */
		style: function(el, options) {
			this._addDefaultClass(el);
		},

		event: function(el, options) {
			this._addEventListener(el);
		},

		init: function(el, options) {
			var datatype = ($(el).prop('alopextype'))?$(el).prop('alopextype'): [];
			datatype.push($(el).attr('data-type'));
			$(el).prop('alopextype', datatype);
		},

		defer: function(el, option) {
			if(this.setEnabled) {
				this.setEnabled(el, $.alopex.util.parseBoolean(el.alopexoptions.enabled));
				if($.alopex.util.isValid(el.alopexoptions.disabled)) {
					this.setEnabled(el, !$.alopex.util.parseBoolean(el.alopexoptions.disabled));
				}
			}
			$(el).attr('data-converted', 'true');
			$(el).trigger('initcomplete.alopexui');
//			for ( var attr in el.dataset) {
//				var functionName = 'set' + attr[0].toUpperCase() + attr.substring(1, attr.length);
//				if ($.alopex.util.isValid(this[functionName])) {
//					$(el)[functionName](el.dataset[attr]);
//				}
//			}
		},

		_getInitHandlers: function(el) {
			function __constructor(element, widget, constructor) {
				this.element = element;
				this.widget = widget;
				this.constructor = constructor;
			}

			var markups = [];
			var styles = [];
			var events = [];
			var inits = [];
			var defers = [];
			var type = $(el).attr('data-type');
			var widget = $.alopex.widget[type];
			if (widget) {
				var parent = widget;
				while (parent) {
					if (parent['markup']) {
						markups.unshift(new __constructor(el, widget, parent['markup']));
					}
					if (parent['style']) {
						styles.unshift(new __constructor(el, widget, parent['style']));
					}
					if (parent['event']) {
						events.unshift(new __constructor(el, widget, parent['event']));
					}
					if (parent['init']) {
						inits.unshift(new __constructor(el, widget, parent['init']));
					}
					if (parent['defer']) {
						// defer 함수는 조상 함수가 가장 나중에 호출된다.
						defers.push(new __constructor(el, widget, parent['defer']));
					}
					parent = parent.parent;
				}
			}

			return {
				markup: markups,
				style: styles,
				event: events,
				init: inits,
				defer: defers
			};
		},

		_constructor: function(el, option) {
			if(el) {
				var inits = $.alopex.widget.object._getInitHandlers(el);
				var argsTemplate = [];
				for ( var i = 1; i < arguments.length; i++) {
					argsTemplate[i] = arguments[i];
				}
				for ( var i = 0; i < inits.markup.length; i++) {
					argsTemplate[0] = inits.markup[i].element;
					inits.markup[i].constructor.apply(inits.markup[i].widget, argsTemplate);
				}
				for ( var i = 0; i < inits.style.length; i++) {
					argsTemplate[0] = inits.style[i].element;
					inits.style[i].constructor.apply(inits.style[i].widget, argsTemplate);
				}
				for ( var i = 0; i < inits.init.length; i++) {
					argsTemplate[0] = inits.init[i].element;
					inits.init[i].constructor.apply(inits.init[i].widget, argsTemplate);
				}
				for ( var i = 0; i < inits.event.length; i++) {
					argsTemplate[0] = inits.event[i].element;
					inits.event[i].constructor.apply(inits.event[i].widget, argsTemplate);
				}
				for ( var i = 0; i < inits.defer.length; i++) {
					argsTemplate[0] = inits.defer[i].element;
					inits.defer[i].constructor.apply(inits.defer[i].widget, argsTemplate);
				}
			}
			
		},

		/**
		 * function with '_' keyword must be the inner function 
		 * add the handler registered in eventHandlers
		 */
		_addEventListener: function(el) {
			var $el = $(el);
			// widget constructor 이벤트 처리.
			for ( var i in this.eventHandlers) {
				var args = [this.eventHandlers[i].event];
				if (this.eventHandlers[i].selector) {
					args.push(this.eventHandlers[i].selector);
				}
				if (this.eventHandlers[i].data) {
					args.push(this.eventHandlers[i].data);
				}
				args.push(this[this.eventHandlers[i].handler]);

				$el.on.apply($el, args);
			}
		},

		/**
		 * default classname assign
		 */
		_addDefaultClass: function(el) {
			var classname;
			var theme = ' ' + $.alopex.config.themeName;
			if (el.getAttribute('data-theme')) {
				theme = ' ' + el.getAttribute('data-theme');
			}			
			if(el.getAttribute('data-classinit')) {
			} else {
				// 
				if (el.className !== undefined && el.className !== '') {
					// class name define
					if (theme !== ' af-default') {
						classname = el.className + theme;
					} else {
						classname = el.className;
					}
				} else { // no class
					classname = this.defaultClassName + theme;
				}
				if ($.alopex.util.isValid(el.getAttribute('data-style')) || $.alopex.util.isValid(el.getAttribute('data-addclass'))) { // CustomStyle apply.
					var addclass = el.getAttribute('data-addclass') || el.getAttribute('data-style');
					classname += ' ' + addclass;
				}
				$(el).addClass(classname);
			}
			
		},

		/**
		 * add event handler for press event 
		 */
		addPressHighlight: function(el, selector) {
			if (selector) {
				$(el).on('move', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
				$(el).on('pressed', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._addClassName);
				$(el).on('unpressed', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
			} else {
				$(el).on('move', {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
				$(el).on('pressed', {
					classname: $.alopex.config.pressedClassName
				}, this._addClassName);
				$(el).on('unpressed', {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
			}
		},

		addHoverHighlight: function(el, selector) {
			if (selector) {
				$(el).on('mouseenter focusin', selector, {
					classname: $.alopex.config.hoveredClassName
				}, this._addClassName);
				$(el).on('mouseleave focusout', selector, {
					classname: $.alopex.config.hoveredClassName
				}, this._removeClassName);
			} else {
				$(el).on('mouseenter focusin', {
					classname: $.alopex.config.hoveredClassName
				}, this._addClassName);
				$(el).on('mouseleave focusout', {
					classname: $.alopex.config.hoveredClassName
				}, this._removeClassName);
			}
		},
		
		/**
		 * remove 
		 */
		removePressHighlight: function(el, selector) {
			if (selector) {
				$(el).off('move', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
				$(el).off('pressed', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._addClassName);
				$(el).off('unpressed', selector, {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
			} else {
				$(el).off('move', {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
				$(el).off('pressed', {
					classname: $.alopex.config.pressedClassName
				}, this._addClassName);
				$(el).off('unpressed', {
					classname: $.alopex.config.pressedClassName
				}, this._removeClassName);
			}
		},

		removeHoverHighlight: function(el, selector) {
			if (selector) {
				$(el).off('mouseenter focusin', selector, {
					classname: $.alopex.config.hoveredClassName
				}, this._addClassName);
				$(el).off('mouseleave focusout', selector, {
					classname: $.alopex.config.hoveredClassName
				}, this._removeClassName);
			} else {
				$(el).off('mouseenter focusin', {
					classname: $.alopex.config.hoveredClassName
				}, this._addClassName);
				$(el).off('mouseleave focusout', {
					classname: $.alopex.config.hoveredClassName
				}, this._removeClassName);
			}
		},

		_eventBlockHandler: function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		},

		_setProperty: function(el, key, value) {
			if (el.alopex) {
				el.alopex[key] = value;
				//          el.setAttribute('data-'+key, value);
			}

		},

		_getProperty: function(el, key) {
			return el.alopex[key];
		},

		setEnabled: function(el, boolEnabled) {
			var $el = $(el);
			if (typeof boolEnabled !== 'boolean') {
				boolEnabled = $.alopex.util.parseBoolean(boolEnabled);
			}
			if (boolEnabled) {
				this._setProperty(el, 'enabled', true);
				this._removeDisabledStyle(el);
				el.removeAttribute('disabled');
				if (el.attributes['tabindex']) {
					if($el.attr('tabindex') == -1) {
						if(el.originalTabIndex) {
							el.setAttribute('tabindex', el.originalTabIndex);
						} else {
							el.setAttribute('tabindex', '0');
						}
					}
				}
			} else {
				this._setProperty(el, 'enabled', false);
				this._addDisabledStyle(el);
				el.setAttribute('disabled', 'disabled');
				if (el.attributes['tabindex']) {
					if($el.attr('tabindex') != -1) {
						el.originalTabIndex = $el.attr('tabindex'); 
						el.setAttribute('tabindex', '-1');
					}
				}
			}
		},

		getEnabled: function(el) {
			return this._getProperty(el, 'enabled');
		},

		_addClassName: function(e) {
			var el = e.currentTarget;
			switch (el.getAttribute('data-type')) {
			case 'select' | 'textinput' | 'textarea':
				break;
			default:
				$(el).addClass(e.data.classname);
				break;
			}
		},

		_removeClassName: function(e) {
			var el = e.currentTarget;
			switch (el.getAttribute('data-type')) {
			case 'select' | 'input':
				break;
			default:
				$(el).removeClass(e.data.classname);
			}
		},

		_addDisabledStyle: function(el) {
			$(el).addClass($.alopex.config.disabledClassName);
		},

		_removeDisabledStyle: function(el) {
			$(el).removeClass($.alopex.config.disabledClassName);
		},

		_cancelEventHandler: function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		},

		/**
		 * componenet markup
		 * if a component's HTML markup is equal to the markup developer need to write, don't need this property
		 * idea : Component's tobe markup and put 'markupIdentifier' attribute on dynamically added element
		 */
		//*
		renderTo: function() {
			return null;
		},
		markupIdentifier: 'af-dynamic',
		_generateMarkup: function(template, el) {
			var wrapper;
			if (template.attributes[this.markupIdentifier]) {

				wrapper = template.cloneNode(true);
				wrapper.innerHTML = "";
				template.removeAttribute(this.markupIdentifier);
				$(el).wrap(wrapper);
				el = el.parentNode;
			}

			for ( var i = 0; i < template.children.length; i++) {
				var child = template.children[i];
				if (child.attributes[this.markupIdentifier]) {

					if (i > 0) {
						var newChild = child.cloneNode(true);
						$(newChild).insertAfter(el.children[i - 1]);
					} else {
						if (template.children.length === 1) {
							break;
						}
						var newChild = child.cloneNode(true);
						$(el).prepend(newChild);
					}

					child.removeAttribute(this.markupIdentifier);
				}
			}

			for ( var i = 0; i < template.children.length; i++) {
				this._generateMarkup(template.children[i], el.children[i]);
			}

			return (wrapper) ? wrapper : el;
		}
	// */
	};

})(jQuery);

(function($) {
	if ($.alopex.util.regexp) {
		return;
	}
	var regexp = {
		number: /^[0-9]+$/,
		float: /\d+(\.\d+)?/gi,
		date: /(^\d{1,2}(\-|\/|\.)\d{1,2}(\-|\/|\.)\d{4}$)|(^\d{4}(\-|\/|\.)\d{1,2}(\-|\/|\.)\d{1,2}$)/,
		divider: /^\-|\/|\./
	};
	
	// delayFunction(func, wait, [a, b, c, ...]);
	// wait 시간 뒤에 func 수행. 이 때 func 에 a, b, c, ... 가 인자가 됨
	function delayFunction(func, wait) {
		var args = Array.prototype.slice.call(arguments, 2);	
		return setTimeout(function(){ 
			return func.apply(null, args); 
		}, wait);
	}

	function isValid(variables) {
		if (variables === null || variables === undefined || variables === '' || variables === 'undefined') {
			return false;
		} else {
			return true;
		}
	}
	
	function arrayjoin(a, b) {
		var compound = $.extend([], a);
		for(var i=0; i<b.length; i++) {
			var found = false;
			for(var j=0; j<a.length; j++) {
				if(a[i] == b[j]) {
					found = true;
					break;
				}
			}
			if(!found) {
				compound.push(b[i]);
			} 
		}
		return compound;
	}

	function parseBoolean(string) {
		switch (String(string).toLowerCase()) {
		case 'true':
		case '1':
		case 'yes':
		case 'y':
			return true;
		case 'false':
		case '0':
		case 'no':
		case 'n':
			return false;
		default:
			return false;
		}
	}

	function hasClass(ele, cls) {
		return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	function addClass(ele, cls) {
		if (!$.alopex.util.hasClass(ele, cls)) {
			ele.className += ' ' + cls;
		}
	}

	function removeClass(ele, cls) {
		if ($.alopex.utilhasClass(ele, cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			ele.className = ele.className.replace(reg, ' ');
		}
	}

	function getWindowHeight() {
		return $(window).height();
	}

	function getWindowWidth() {
		return $(window).width();
	}

	function getDocumentHeight() {
		return $(document).height();
	}

	function getDocumentWidth() {
		return $(document).width();
	}

	function getPagePosition(el) {
		var result = {};
		var leftPosition = 0, topPosition = 0;
		if (el.offsetParent) {
			topPosition = el.offsetTop;
			leftPosition = el.offsetLeft;
			while (el = el.offsetParent) {
				// body가 position fixed or absolute일 경우, top 계산.
				if(el.style.position == 'fixed' && el.tagName.toLowerCase() == 'body') {
					topPosition += el.style.top? parseInt(el.style.top) : 0;
					leftPosition += el.style.left? parseInt(el.style.left) : 0;
					break;
				}
				topPosition += el.offsetTop;
				leftPosition += el.offsetLeft;
			}
		}
		result.top = topPosition;
		result.left = leftPosition;
		return result;
	}

	function getRelativePosition(el) {
		var result = {};
		var leftPosition = 0, topPosition = 0;
		if (el && el.offsetParent) {
			topPosition = el.offsetTop;
			leftPosition = el.offsetLeft;
			el = el.offsetParent;
			while (el) {
				topPosition += el.offsetTop;
				leftPosition += el.offsetLeft;
				el = el.offsetParent;
			}
		}
		result.top = topPosition;
		result.left = leftPosition;
		return result;
	}

	function getScrolledPosition(el) {
		var result = {};
		var leftPosition = 0, topPosition = 0;
		if (el.offsetParent) {
			topPosition = el.offsetTop - el.scrollTop;
			leftPosition = el.offsetLeft - el.scrollLeft;
			while (el = el.offsetParent) {
				topPosition += el.offsetTop - el.scrollTop;
				leftPosition += el.offsetLeft - el.scrollLeft;
			}
		}
		result.top = topPosition;
		result.left = leftPosition;
		return result;
	}

	function getScrollbarWidth() {
		var parent, child, width;
		if (width === undefined) {
			parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
			child = parent.children();
			width = child.innerWidth() - child.height(99).innerWidth();
			parent.remove();
		}
		return width;
	}

	function isNumberType(data) {
		return $.alopex.util.regexp.number.test(data);
	}

	function isDateType(data) {
		return $.alopex.util.regexp.date.test(data);
	}
	
	function isConverted(el) {
		return ($(el).attr('data-converted') === 'true');
	}
	
	function getDateString(date, format) {
		if(!(date instanceof Date)) {
			return ;
		}
		var fullyear = date.getFullYear();
		var month = date.getMonth() + 1;
		var dateObj = date.getDate();
		month = ((month < 10)? '0' : '') + month;
		dateObj = ((dateObj < 10)? '0' : '') + dateObj;
		return format.replace('yyyy', fullyear).replace('MM', month).replace('dd', dateObj);
	}

	/**
	 *
	 * @param array {array type} array of date string
	 * @return array {array} array of 'DDMMYYYY' string
	 */
	function formatDate(array) {
		var type = 'ddmm';
		var divider, data;

		// ddmm or mmdd 판단.
		for ( var i = 0; i < array.length; i++) {
			divider = array[i].match($.alopex.util.regexp.divider);
			data = array[i].split(divider);

			if (data[0].length === 4) { // 이 부분에서 YYYY 뒤로 이동.
				data.push(data[0]);
				data.shift();
				array[i] = data.join('/');
			}

			if (parseInt(data[0], 10) > 12) {
				type = 'mmdd';
				break;
			}
		}

		if (type === 'mmdd') {
			for (i = 0; i < array.lengh; i++) {
				divider = array[i].match($.alopex.util.regexp.divider);
				data = array[i].split(divider);
				var temp = data[0];
				data[0] = data[1];
				data[1] = temp;
				array[i] = data.join('/');
			}
		}

		return array;
	}

	/**
	 * create new HTML node, copy the attribute of original element
	 * @param {string} tagName tagname of new html node.
	 */
	function copyNode(oldNode, tagName) {
		if (tagName === undefined) {
			tagName = oldNode.tagName;
		}
		var newNode = document.createElement(tagName);
		for ( var i = 0; i < oldNode.attributes.length; i++) {
			var attr = oldNode.attributes[i];
			$(newNode).attr(attr.name, attr.value);
		}
		return newNode;
	}

	// used in sorting in table widget
	function insertSort(array, comparison, ascending, begin, end) {
		if (!array || !array.length) {
			return array;
		}
		if (array.length < 2) {
			return array;
		}
		begin = begin || 0;
		end = end || array.length;
		var size = end - begin;
		if (size < 2)
			return array;

		var subArray = array.slice(begin, end);
		var i, j, newValue;
		for (i = 1; i < subArray.length; i++) {
			newValue = subArray[i];
			j = i;

			if (ascending) {
				while (j > 0 && comparison(subArray[j - 1], newValue) > 0) {
					subArray[j] = subArray[j - 1];
					j--;
				}
			} else {
				while (j > 0 && comparison(subArray[j - 1], newValue) < 0) {
					subArray[j] = subArray[j - 1];
					j--;
				}
			}
			subArray[j] = newValue;
		}
		for ( var i = 0; i < subArray.length; i++) {
			array[begin + i] = subArray[i];
		}
		return array;
	}

	function mergeSort(array, comparison, ascending, begin, end) {
		if (!array || !array.length) {
			return array;
		}
		if (array.length < 2) {
			return array;
		}
		begin = begin || 0;
		end = end || array.length;
		var size = end - begin;
		if (size < 2)
			return array;
		var middle = begin + Math.floor(size / 2);
		var merged = _merge(mergeSort(array.slice(begin, middle), comparison, ascending), mergeSort(array.slice(middle, end), comparison, ascending), comparison, ascending);
		merged.unshift(begin, merged.length);
		array.splice.apply(array, merged);
		//array.splice(begin, merged.length, )
		return array;
	}
	function _merge(left, right, comparison, ascending) {
		var result = new Array();
		while ((left.length > 0) && (right.length > 0)) {
			if (comparison(left[0], right[0]) <= 0 && ascending)
				result.push(left.shift());
			else
				result.push(right.shift());
		}
		while (left.length > 0)
			result.push(left.shift());
		while (right.length > 0)
			result.push(right.shift());
		return result;
	}

	function sort_default(a, b) {
		if (a > b) {
			return 1;
		}
		if (a < b) {
			return -1;
		}
		return 0;
	}
	
	function addFloat(a, b) {
		var splitA = (''+a).split('.');
		var splitB = (''+b).split('.');
		var multiplier = 0;
		if(splitA[1]) {
			multiplier = splitA[1].length;
		}
		if(splitB[1] && splitB[1].length > multiplier) {
			multiplier = splitB[1].length;
		}
		var multiplier = Math.pow(10, multiplier);
		var result = multiplier==0?a+b:parseFloat(Math.round(a*multiplier + b*multiplier))/multiplier;
		return result;
	}

	function sort_numeric(a, b) {
		var num1 = parseFloat(a[0].replace(/[^0-9.-]/g, ''));
		if (isNaN(num1)) {
			num1 = 0;
		}
		var num2 = parseFloat(b[0].replace(/[^0-9.-]/g, ''));
		if (isNaN(num2)) {
			num2 = 0;
		}
		return num1 - num2;
	}

	function sort_date(a, b) { // MM/DD/YYYY
		var date1 = $.alopex.util.getDate(a[0]);
		var date2 = $.alopex.util.getDate(b[0]);

		if (date1 > date2) {
			return 1;
		} else if (date1 === date2) {
			return 0;
		} else {
			return -1;
		}
	}

	/**
	 *
	 * @param {string} date string type.
	 * @return {Date Object} Javascript Date Object.
	 */
	function getDate(date, option) {
		var year, month, day;
		if (option === undefined) {
			option = 'mmdd';
		}

		var divider = '/';
		divider = date.match(/\-|\/|\./);
		var dateArr = date.split(divider);
		year = dateArr[2];
		if (option === 'ddmm') {
			month = dateArr[1];
			day = dateArr[0];
		} else {
			month = dateArr[0];
			day = dateArr[1];
		}
		return new Date(year, month, day);
	}

	function trim(str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function erase() {
		var erased = [];
		$(document).find(':hidden').each(function() {
			if (this.parentNode) {
				var tagname = this.tagName.toLowerCase();
				switch (tagname) {
				case "head":
				case "meta":
				case "link":
				case "script":
				case "option":
				case "style":
					return;
				}
				erased.push({
					node: this,
					parent: this.parentNode
				});
				this.parentNode.removeChild(this);
			}

		});
		return erased;
	}

	function restore(obj) {
		for ( var i = 0; i < obj.length; i++) {
			if (obj[i].parent) {
				obj[i].parent.appendChild(obj[i].node);
			}
		}

	}
	
	function getOptions(el) {
		var option = {};
		for ( var i = 0; i < el.attributes.length; i++) {
			if (el.attributes[i].name.indexOf('data-') === 0) {
				var key = el.attributes[i].name.replace('data-', '').replace('-', '');
				if (key === 'type') {
					continue;
				} // ie7, 8 predefined property
				var value = el.attributes[i].value;
				option[key] = value;
			}
		}
		
		for ( var i in option) {
			if (option[i] === 'true' || option[i] === 'false') { // false
				option[i] = $.alopex.util.parseBoolean(option[i]);
			}
			if ($.alopex.util.isNumberType(option[i])) {
				option[i] = parseInt(option[i], 10);
			}
		}
		
		return option;
	}
	
	function arrayremove(array, removeItem) {
		if(!(array instanceof Array)) {
			return ;
		}
		
		for(var i=0; i<array.length; i++) {
			if(array[i] == removeItem) {
				array.splice(i, 1);
			}
		}
	}
	
	var re = /([^&=]+)=?([^&]*)/g;
	var decode = function(str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	};
	function parseQuerystring(query) {
		var params = {}, e;
		if (query) {
			if (query.substr(0, 1) == '?') {
				query = query.substr(1);
			}

			while (e = re.exec(query)) {
				var k = decode(e[1]);
				var v = decode(e[2]);
				if (params[k] !== undefined) {
					if (!$.isArray(params[k])) {
						params[k] = [ params[k] ];
					}
					params[k].push(v);
				} else {
					params[k] = v;
				}
			}
		}
		return params;
	}
	
	function getOSName() {
		var osArray = {
			'Windows NT 6.3' : 'Windows 8.1',
			'Windows NT 6.2' : 'Windows 8',
			'Windows NT 6.1' : 'Windows 7',
			'Windows NT 6.0' : 'Windows Vista',
			'Windows NT 5.2' : 'Windows Server 2003; Windows XP x64 Edition',
			'Windows NT 5.1' : 'Windows XP',
			'Windows NT 5.01' : 'Windows 2000, Service Pack 1 (SP1)',
			'Windows NT 5.0' : 'Windows 2000',
			'Windows NT 4.0' : 'Microsoft Windows NT 4.0',
			'Windows 98; Win 9x 4.90' : 'Windows Millennium Edition (Windows Me)',
			'Windows 98' : 'Windows 98',
			'Windows 95' : 'Windows 95',
			'Windows CE' : 'Windows CE',
			'Open BSD' : 'OpenBSD',
			'Sun OS' : 'SunOS',
			'Linux' : 'Linux',
			'x11' : 'Linux',
			'Mac_PowerPC' : 'Mac OS',
			'Macintosh' : 'Mac OS',
			'QNX' : 'QNX',
			'BeOS' : 'BeOS',
			'OS/2' : 'OS/2',
			'Search' : 'Search Bot',
			'nuhk' : 'Search Bot',
			'Googlebot' : 'Search Bot',
			'Yammybot' : 'Search Bot',
			'Openbot' : 'Search Bot',
			'Slurp' : 'Search Bot',
			'MSNBot' : 'Search Bot',
			'Ask Jeeves/Teoma' : 'Search Bot',
			'ia_archiver' : 'Search Bot'
		};
		for ( var i in osArray) {
			if (navigator.userAgent.indexOf(i) != -1) {
				return osArray[i];
			}
		}
		return 'Others';
	}
	
	function getBrowserName() {
		var browserName, fullVersion, verOffset;
		var nAgt = navigator.userAgent;
		
		if ("ontouchstart" in document.documentElement || 'ontouchstart' in window) {
			window.browser = 'mobile';
		} 
		// In Opera, the true version is after "Opera" or after "Version"
		else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
			browserName = "Opera";
			fullVersion = nAgt.substring(verOffset + 6);
			if ((verOffset = nAgt.indexOf("Version")) != -1)
				fullVersion = nAgt.substring(verOffset + 8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
			browserName = "Microsoft Internet Explorer";
			fullVersion = nAgt.substring(verOffset + 5);
		}
		// In Chrome, the true version is after "Chrome"
		else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
			browserName = "Chrome";
			fullVersion = nAgt.substring(verOffset + 7);
		}
		// In Safari, the true version is after "Safari" or after "Version"
		else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
			browserName = "Safari";
			fullVersion = nAgt.substring(verOffset + 7);
			if ((verOffset = nAgt.indexOf("Version")) != -1)
				fullVersion = nAgt.substring(verOffset + 8);
		}
		// In Firefox, the true version is after "Firefox"
		else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
			browserName = "Firefox";
			fullVersion = nAgt.substring(verOffset + 8);
		}
		// In most other browsers, "name/version" is at the end of userAgent
		else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
			browserName = nAgt.substring(nameOffset, verOffset);
			fullVersion = nAgt.substring(verOffset + 1);
			if (browserName.toLowerCase() == browserName.toUpperCase()) {
				browserName = navigator.appName;
			}
		}
		return browserName + ' ' + fullVersion;
	}
	

	/**
	 * 오브젝트에 정해진 위치에 데이터를 셋한다.
	 * @param object 데이터를 저장할 대상.
	 * @param path dot notation으로 구분된 경로. reference key
	 * @param value 저장할 데이터.
	 * @returns {boolean} 성공적으로 값을 셋했는지 여부
	 */
	function setValueOnObject(object, path, value) {
		var path_directory = path.split('.');
		var currentRef = object;
		if(path_directory.length < 1) {return false;}
		for(var i=0; i<path_directory.length-1; i++) { /* iterate from 0 to length-1 */
			var dir = path_directory[i];
			if(!currentRef[dir]) {
				currentRef[dir] = {};
			}
			currentRef = currentRef[dir];
		}
		if(value != null && value != undefined) { // found value on data. 
			// TODO 이부분 다른 처리 필요?
			// 데이터를 읽어 올때는 다른 attribute를 사용하여야 되는가?
			// data-bind="value: text" & data-bind="text: text" 이렇게 두개가 존재할떄 나중에 빈값이 덮어 쓸수도 있다. 
			currentRef[path_directory[path_directory.length-1]] = value;
		}
		return true;
	}
	
	/**
	 * 오브젝트에 정해진 위치에 데이터를 가져온다.
	 * @param object 데이터를 저장할 대상.
	 * @param path dot notation으로 구분된 경로.
	 * @returns {boolean} 성공적으로 값을 셋했는지 여부
	 */
	function getValueOnObject(object, path) {
		if(path == '') { // root를 선택하는 경우, path가 ''인 케이스가 생김.
			return object;
		}
		var path_directory = path.split('.');
		var currentRef = object;
		if(path_directory.length < 1) {return ;}
		for(var i=0; i<path_directory.length-1; i++) { /* iterate from 0 to length-1 */
			var dir = path_directory[i];
			if(!currentRef[dir]) {return ;}
			currentRef = currentRef[dir];
		}
		return currentRef[path_directory[path_directory.length-1]];
	}
	
	function getElementSelector(element) {
		var selector = element.tagName.toLowerCase();
		if(element.id) {
			selector += '#' + element.id;
		} else {
			if(!element.getAttribute('data-id')) { // element별로 구분이 필요한 경우, data-id 속성에 id 지정해서 셀렉터로 사용한다. ide에서 필요 시 지정하고, 사람이 직접 작업할 경우는 id로 사용하면 됨.  
				element.setAttribute('data-id', this.generateRandomName());
			}
			selector += '[data-id="'+element.getAttribute('data-id')+'"]';
		}
		if(element.className && element.className.replace) {
			selector += ('.' + element.className.replace(/ /gi, '.'));
		}
		return selector;
	};
	
	/**
	 * [Hong-HyunMin 2016.01.21] Theme css의 사용여부를 판단하기 위한 처리.
	 */
	function isAlopexTheme() {
		var stylesheetCss = $("link[rel=stylesheet]");
		var isTheme = false;
		$.each(stylesheetCss, function() {
			var targetCss = $(this).attr('href');
			var targetCssSplit = [];
			targetCssSplit = $(this).attr('href').split('/');
			
			var cssFileName = targetCssSplit[targetCssSplit.length - 1];
			
			if('alopex-ui-dark.css' == cssFileName
		    || 'alopex-ui-dark-gradation.css' == cssFileName
		    || 'alopex-ui-default.css' == cssFileName
		    || 'alopex-ui-mustard.css' == cssFileName
		    || 'alopex-ui-sk.css' == cssFileName
		    || 'alopex-ui-white.css' == cssFileName
		    || 'alopex-ui-white-gradation.css'== cssFileName){
				isTheme = true;
			}
		});
		
		return isTheme;
	};

	$.extend($.alopex.util, {
		regexp: regexp,
		delayFunction: delayFunction,
		isValid: isValid,
		parseBoolean: parseBoolean,
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		getWindowHeight: getWindowHeight,
		getWindowWidth: getWindowWidth,
		getDocumentHeight: getDocumentHeight,
		getDocumentWidth: getDocumentWidth,
		getPagePosition: getPagePosition,
		getRelativePosition: getRelativePosition,
		getScrolledPosition: getScrolledPosition,
		getScrollbarWidth: getScrollbarWidth,
		isNumberType: isNumberType,
		isDateType: isDateType,
		formatDate: formatDate,
		copyNode: copyNode,
		insertSort: insertSort,
		mergeSort: mergeSort,
		sort_default: sort_default,
		sort_numeric: sort_numeric,
		sort_date: sort_date,
		getDate: getDate,
		trim: trim,
		erase: erase,
		restore: restore,
		getOptions: getOptions,
		isConverted: isConverted,
		addFloat: addFloat,
		arrayjoin: arrayjoin,
		arrayremove: arrayremove,
		parseQuerystring: parseQuerystring,
		getDateString: getDateString,
		getOSName: getOSName,
		getBrowserName: getBrowserName,
		setValueOnObject: setValueOnObject,
		getValueOnObject: getValueOnObject,
		getElementSelector: getElementSelector,
		isAlopexTheme: isAlopexTheme
	});

	$.fn.hasEventHandler = function(event, handler) {
		var registeredEventList = $._data(window, 'events');
		if (registeredEventList !== undefined && registeredEventList[event] !== undefined) {
			var handlerList = registeredEventList[event];
			for ( var i = 0; i < handlerList.length; i++) {
				if (handlerList[i].handler === handler) {
					return true;
				}
			}
		}
		return false;
	};

})(jQuery);

function isAlopexWindowPopup(){
	// 현재 window가 alopex window popup 인지 확인
	try{
		if(!$.alopex.util.isValid(window.opener)){
			return false;
		}
		
		if(window.opener.closed){
			return false;
		}
		
		if(!$.alopex.util.isValid(window.opener.$)){
			return false;
		}
		
		if(!$.alopex.util.isValid(window.opener.$.alopex)){
			return false;
		}
		
		return true;
		
	}catch(err){
		return false;
	}
}

function checkAlopexWindowParent(){
	try{
		
		if(!$.alopex.util.isValid(window.parent)
				|| !$.alopex.util.isValid(window.parent.$)
				|| !$.alopex.util.isValid(window.parent.$.alopex)
				){
			// cross-domain 처리 되었지만, parent 가 alopex 가 아닐 때
			window.parent = window;
			return false;
			
		}	
		
		// cross-domain 과 상관 없고, parent 가 alopex 일 때 (보통의 경우)
		return true;

	}catch(e){
		// cross-domain 처리 안되었을 때
		// cross-domain object access denied
		// DOMException: Blocked a frame with origin "http://175.193.38.20:9000" from accessing a cross-origin frame.(…)
		return false;
	}
}

function isAlopexIframeChild(iframeWindow){
	try{
		if(!$.alopex.util.isValid(iframeWindow)){
			return false;
		}

		if(!$.alopex.util.isValid(iframeWindow.$)){
			return false;
		}
		
		if(!$.alopex.util.isValid(iframeWindow.$.alopex)){
			return false;
		}
		
		return true;
		
	}catch(e){
		return false;
	}
}
// TODO : animation, trigger-to-open event, collapse other content when one open. 

(function($) {

	$.alopex.widget.accordion = $.alopex.inherit($.alopex.widget.object, {

		widgetName: 'accordion',
		defaultClassName: 'af-accordion Accordion',

		setters: ['accordion', 'expandAll', 'collapseAll', 'setDataSource', 'expand', 'collapse'],
		getters: [],

		eventHandlers: {
//			cancel: {
//				event: 'dragstart selectstart',
//				handler: '_cancelEventHandler'
//			}
		},

		init: function(el, options) {
			var $el = $(el);
			var that = this;
			$.extend(el, this.options, options); 
			$el.find('li').each(function() {
				var li = this;
				for ( var i = 0; i < li.children.length; i++) {
					if (li.children[i].tagName.toLowerCase() === 'a' && li.children.length > 1) {
						$(li).addClass('af-expandable Expandable');
						break;
					}
				}
			});
			$el.find('li > a').each(function() {
				that.addHoverHighlight(this);
				that.addPressHighlight(this);
				$(this).next().addClass('af-accordion-sub');
			});

			// 최초 상태는 not Expended,  display:none 으로 해준다
			$el.find('.af-accordion-sub').each(function() { // ul
				$(this).css("display", "none");
				var $li = $(this).parent("li.af-expandable.Expandable");
				$li.removeClass('af-accordion-expand Expanded');
			});
			
			// 어코디언 클릭 이벤트 핸들러 바인딩
			$el.find('li > a').bind('click', function(e) {
				var $a = $(e.target); // a
				var $enpandable = $a.next(".af-accordion-sub");
				var $li = $a.parent("li.af-expandable.Expandable");
				
				if ($li.is('li.af-expandable.Expandable')) { // li 가 펼침가능 클래스를 가지면
					$li.toggleClass('af-accordion-expand Expanded'); // 펼쳐짐 클래스 토글
					if ($li.hasClass('af-accordion-expand Expanded')) { // 토글 후 펼쳐짐 클래스 추가된 경우	
						$enpandable.css('display', ''); // >> block
						$el.trigger('open', [$a[0]]);
					} else { // 토글 후 펼쳐짐 클래스 제거된 경우
						$enpandable.css('display', 'none'); // >> none
						$el.trigger('close', [$a[0]]);
					}
				}
			});
		},
		
		_changeStatus: function(el, enpandable, doExpand){ // target == ul
			var $el = $(el);
			var $enpandable = $(enpandable);
			var $a = $enpandable.prev("a");
			var $li = $a.parent("li.af-expandable.Expandable");

			if(doExpand){ // true이면 펼치기
				$enpandable.css('display', ''); // >> block
				$el.trigger('open', [$a[0]]);
				$li.addClass('af-accordion-expand Expanded');
			}else{ // false이면 닫기
				$enpandable.css('display', 'none'); // >> none
				$el.trigger('close', [$a[0]]);
				$li.removeClass('af-accordion-expand Expanded');
			}
		},
		
		expand: function(el, index) { // index는 ul.af-accordion-sub 마크업 순서 (위에서부터 0 1 2 3)
			$(el).find('.af-accordion-sub').eq(index).each(function() {
				var target = this; // ul
				$.alopex.widget.accordion._changeStatus(el, target, true);
			});
		},
		
		expandAll: function(el) {
			$(el).find('.af-accordion-sub').each(function() {
				var target = this;
				$.alopex.widget.accordion._changeStatus(el, target, true);
			});
		},
		
		collapse: function(el, index) {
			$(el).find('.af-accordion-sub').eq(index).each(function() {
				var target = this;
				$.alopex.widget.accordion._changeStatus(el, target, false);
			});
		},
		
		collapseAll: function(el) {
			$(el).find('.af-accordion-sub').each(function() {
				var target = this;
				$.alopex.widget.accordion._changeStatus(el, target, false);
			});
		},

		setDataSource: function(el, jsonArray) {
			$(el).empty();
			this._createNode(el, jsonArray);
			el.phase = undefined;
			$(el).accordion();
		},

		_createNode: function(el, jsonArray) {
			for ( var i = 0; i < jsonArray.length; i++) {
				var item = jsonArray[i];
				var li = $('<li></li>').appendTo(el)[0];
				if ($.alopex.util.isValid(item.id)) {
					$(li).attr('data-id', item.id);
				}
				var a = $('<a></a>').appendTo(li)[0];
				if ($.alopex.util.isValid(item.linkUrl)) {
					$(a).attr('href', item.linkUrl);
				}
				if ($.alopex.util.isValid(item.iconUrl)) {
					$('<img/>').attr('src', item.iconUrl).appendTo(li);
				}
				//        $('<span></span>').html(item.text).appendTo(a);
				$(a).text(item.text);

				if ($.alopex.util.isValid(item.items)) {
					var subul = $('<ul></ul>').appendTo(li)[0];
					this._createNode(subul, item.items);
				}
			}
		}
		
	});

})(jQuery);

// constructor : markup, style, init, event, defer: timing issue에 사용.


(function($) {
	// MessageBox 호출
	var imagepath = '/Resources/www/build/css/images/';

	function messagebox(type, option) {
		if($('.af-dialog-mask:hidden').length != 0)
			$('.af-dialog-mask:hidden').remove();
		if ($(document).find('.messagebox').length != 0)
			return;
		var icon;
		var msg = '';
		if (typeof (option) == 'object') {
			msg = option.msg
		} else {
			msg = option
		}
		var markup = '<div id="dialog_messagebox" data-type="dialog" class="messagebox container">' + '<div class="messageWrap clearfix">'
			+ '<div class="msg_icon ' + type + '"></div>' + '<div class="msg_txt" id="text"></div>' + '</div>' + '<div class="msgBtnWrap">'
			+ '<button id="msgBtn" data-type="button"><span class="btn_icon"></span><span class="btn_txt">OK</span></button>' + '</div>'
			+ '</div>';
		var $dialog = $(markup).appendTo(document.body).convert().open({
			modal : true
		});
		var $label = $dialog.find('#text');
		$label.html(msg.replace('\n', '<br>'));
		//$label.css('margin-top', (($label.height() - 10) * -1 / 2) + 'px');

		$('#msgBtn').on('click', function(e) {
			$dialog.close().remove();
		}).focus();
		
		$('#dialog_messagebox').close(function() {
			$('#dialog_messagebox').remove();
			if(option.ok)
				option.ok();
		});
	};

	function confirmbox(option) {
		if($('.af-dialog-mask:hidden').length != 0)
			$('.af-dialog-mask:hidden').remove();
		
		if ($(document).find('.messagebox').length != 0)
			return;
		
		var icon;
		var msg;

		var markup = '<div id="dialog_messagebox" data-type="dialog" class="messagebox container">' + '<div class="messageWrap clearfix">'
			+ '<div class="msg_icon confirm"></div>' + '<div class="msg_txt" id="text"></div>' + '</div>' + '<div class="msgBtnWrap">'
			+ '<button id="msgBoxOk" class="btn_common black noicon"><span class="btn_icon"></span><span class="btn_txt">OK</span></button>'
			+ '<button id="msgBoxCancel" class="btn_common black noicon"><span class="btn_icon"></span><span class="btn_txt">Cancel</span></button>' + '</div>'
			+ '</div>';

		if (option.id != undefined) {
			$a.service("SKENS.CM.Biz.MsgMgmtBiz#GetMsgDetail", {
				MESSAGEID : option.id
			}, function(ds) {
				if (ds.recordSets.table1.nc_list.length != 0) {
					msg = ds.recordSets.table1.nc_list[0].MESSAGEBODY;

					var $dialog = $(markup).appendTo(document.body).convert().open({
						modal : true
					});;
					var $label = $dialog.find('#text');
					$label.html(msg.replace('\n', '<br>'));
					
					var cancelCallback;
					if (option.cancel) {
						cancelCallback = option.cancel;
					}
					// ok버튼
					$('#msgBoxOk').on('click', function(e) {
						if (option.ok) {
						    $('#dialog_messagebox').close().remove();
						    option.ok();
						} else {
							$('#dialog_messagebox').close().remove();
						}
					}).focus();
					
					
					// 취소버튼
					$('#msgBoxCancel').on('click', function() {
					    $('#dialog_messagebox').close().remove();
					});
					
					$('#dialog_messagebox').close(function() { // close 시 콜백함수 등록.
						$('#dialog_messagebox').remove();
						if (cancelCallback) {
							cancelCallback();
						}
					});
					
				} else {
					messagebox('error', '잘못된 Message ID를 입력했습니다.');
				}
			});
		} else if (option.msg != undefined) {
			msg = option.msg

			var $dialog = $(markup).appendTo(document.body).convert().open({
				modal : true
			});;
			var $label = $dialog.find('#text');
			$label.html(msg.replace('\n', '<br>'));
			
			var cancelCallback;
			if (option.cancel) {
				cancelCallback = option.cancel;
			}
			
			// ok버튼
			$('#msgBoxOk').on('click', function(e) {
				if (option.ok) {
				    $('#dialog_messagebox').close(function(){
				    	option.ok();
				    });
				    $('#dialog_messagebox').close().remove();
				} else {
					$('#dialog_messagebox').close().remove();
				}
			}).focus();
			
			// 취소버튼
			$('#msgBoxCancel').on('click', function() {
			    $('#dialog_messagebox').close().remove();
			});
			
			$('#dialog_messagebox').close(function() { // close 시 콜백함수 등록.
				$('#dialog_messagebox').remove();
				if (cancelCallback) {
					cancelCallback();
				}
			});
		} else {
			messagebox('error', '잘못된 Parameter 입니다.');
		}
	};

	$.extend($.alopex, {
		info: function(msg) {
			return messagebox('error', msg);
		},
		
		error : function(msg) {
			messagebox('error', msg);
		},
		confirm: function(option) {
			confirmbox(option);
		}
		
	})
	
})(jQuery);
(function($) {

	/*********************************************************************************************************
	 * button
	 *********************************************************************************************************/
	$.alopex.widget.basebutton = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'basebutton',
		/**
		 * property 
		 */
		// class property
		defaultClassName: 'af-basebutton',

		setters: ['basebutton'],
		getters: [],
		
		properties: {
			
		},

		eventHandlers: {
			cancel: {
				event: 'dragstart selectstart',
				handler: '_cancelEventHandler'
			}
		},

		event: function(el) {
			this.addHoverHighlight(el);
			this.addPressHighlight(el);
		},

		init: function(el) {
			if (el.tagName.toLowerCase() === 'a') {
				el.setAttribute('tabindex', '0');
			}
			if (!el.getAttribute('type')) {
				el.setAttribute('type', 'button');
			}
		}
	});

})(jQuery);

// constructor : markup, style, init, event, defer: used in timing issue
$.alopex.widget.baseinput = $.alopex.inherit($.alopex.widget.object, {
	widgetName: 'baseinput',
	eventHandlers: {
	//      focus: {event: 'focus', handler: '_focusHandler'},
	//      blur: {event: 'blur', handler: '_blurHandler'}
	},

	event: function(el) {
		this.addHoverHighlight(el);
	},

	init: function(el) {
//		if (!$.alopex.util.isValid(el.getAttribute('type'))) {
//			var datatype = el.getAttribute('data-type');
//			el.setAttribute('type', datatype);
//		}
	},

	properties: {

	}

});
(function($) {

	/*********************************************************************************************************
	 * select
	 *********************************************************************************************************/
	$.alopex.widget.baseselect = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'baseselect',
		defaultClassName: 'af-baseselect',
		getters: ['getValues', 'getTexts'],
		setters: ['baseselect', 'setPlaceholder', 'setSelected', 'clear', 'refresh', 'selectionInitialization'],

		init: function(el, option) {
			var placeholder = this._getProperty(el, 'placeholder');
			if(placeholder) {
				this.setPlaceholder(el, placeholder);
			}
		},
		
		setPlaceholder: function(el, text) {
			var $el = $(el);
			if($el.find('[data-placeholder]').length == 0) {
				$el.prepend('<option value="" selected="selected" data-placeholder="true" disabled>' + text + '</option>');
				$el[0].options[0].selected = true;
			}
		},
		
		selectionInitialization: function(el) {
			var $el = $(el);
				if($el[0].options != undefined){
					if($el[0].options[0].disabled && $el[0].options[0].getAttribute("data-placeholder") == "true"){
						$el[0].options[0].disabled = false; // 잠시 false 로 하고, 강제 선택할 수 있게 한 후, 선택되면 다시 disabled 해준다
					}
					$el[0].options[0].selected = true;
					$el[0].options[0].disabled = true;
				}
		},
		
		setSelected: function(el, text) {
			// check null
			if (el.children.length === 0) {
				return;
			}
			var flag = true, i;
			for (i = 0; i < el.children.length; i++) {
				if (el.children[i].text === text) {
					$(el.children[i]).prop('selected', true);
					flag = false;
				}
			}
			if (flag) {
				for (i = 0; i < el.children.length; i++) {
					if (el.children[i].value === text) {
						$(el.children[i]).prop('selected', true);
						//el.textfield.innerHTML = el.children[i].text;
					}
				}
			}
			$(el).trigger('change');
		},

		getValues: function(el) {
			var tmpValuesArr = [];
			if (el.multi) {
				$(el).find('option:selected').each(function() {
					tmpValuesArr.push($(this).val());
				});
				return tmpValuesArr;
			} else {
				var result = [];
				$(el).find('option:selected').each(function() {
					result.push(this.value);
				});
				return result;
			}
		},

		getTexts: function(el) {
			var tmpTextsArr = [];
			if (el.multi) {
				$(el).find('option:selected').each(function() {
					tmpTextsArr.push($(this).text());
				});
				return tmpTextsArr;
			} else {
				var result = [];
				$(el).find('option:selected').each(function() {
					result.push($(this).text());
				});
				return result;
			}
		},

		clear: function(el) {
			$(el).empty();
			//data-placeholder
			if ($.alopex.util.isValid($(el).attr('data-placeholder'))) {
				$(el).prepend('<option value="" selected="selected" disabled>' + $(el).attr('data-placeholder') + '</option>');
				$(el)[0].options[0].selected = true;
				el.originWidth = $(el).width();
			}
		},

		refresh: function(el) { 
			var $el = $(el);

			// el.alopexoptions.wrap -> undefined로 인한 error 발생. isDivselect 추가. Divselect일 경우는 isDivselect로 판단
			var isDivselect = false;
			if($(el.parentNode) && $(el.parentNode).attr('data-type') == 'divselect'){
				isDivselect = true;
			}
			if (isDivselect || $.alopex.util.parseBoolean(el.alopexoptions.wrap)) {
				var text = $el.find(':selected').text() || '';
				$.alopex.widget.divselect._setText(el.parentNode, text);
			}
		}
	});

})(jQuery);
(function($) {

	/*********************************************************************************************************
	 * button
	 *********************************************************************************************************/
	$.alopex.widget.button = $.alopex.inherit($.alopex.widget.basebutton, {
		widgetName: 'button',
		defaultClassName: 'af-button Button',
		setters: ['button'],
		getters: [],

		init: function(el) {
			var $el = $(el);
			if ($el.attr('data-role') == 'toggle') { 
				// basebutton : to keep prev version compatibility 
				$el.attr('data-type', 'togglebutton').togglebutton();
			}
		}
	});

})(jQuery);



(function($) {
	/**
	 * TODO : 
	 * - carousel markup & how to fix the size
	 * 
	 */
	$.alopex.widget.carousel = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'carousel',
		/**
		 * property 
		 */
		// class property
		defaultClassName: 'af-carousel Carousel',

		setters: ['carousel', 'nextSlide', 'prevSlide', 'setIndex','stopAutoSlide', 'startAutoSlide', 'setAutoSlideDuration'],
		getters: [],

		eventHandlers: {
			
		},

		properties: {
			width: 0, // wrapper width
			currentpage: 1, // current page of carousel, start from 1.
			totalpage: 0,
			position: 0, // carousel transform position
			maxPosition: 0,
			pages: null,
			prevButton: null,
			nextButton: null,
			paging: null,
			slidable: null,
			animationDuration: 400,
			autoSlidemode:false,
			autoSlideDuration: 5000
		},
		
		setEnabled: null,

		init: function(el, options) {
			var $el = $(el);
			var $obj = $.alopex.widget.object;

			$el.css({
				'overflow' : 'hidden',
				'position' : 'relative'
			});

			$.extend(el, $.alopex.widget.carousel.properties, options);

			el.pages = $el.find('[data-role="page"], .Page');
			el.pagingHeight = 50;
			el.pageHeight = (el.pages[0].offsetHeight > 0) ? el.pages[0].offsetHeight : el.offsetHeight - el.pagingHeight;
			
			el.width = el.offsetWidth;
			el.totalpage = el.pages.length;
			el.prevButton = $el.find('[data-role="prev"]').addClass('prev');
			el.nextButton = $el.find('[data-role="next"]').addClass('next');
			if(el.prevButton.length == 0) {
				el.prevButton = $el.find('.Prev');
			}
			if(el.nextButton.length == 0) {
				el.nextButton = $el.find('.Next');
			}
			el.paging = $el.find('[data-role="pagination"], .Paging');
			el.maxPosition = -1 * el.width * (el.totalpage - 1);

			el.paging.attr({
				'data-type': 'pagination',
				'data-generatelink': 'mobile',
				'data-maxpage': el.pages.length,
				'data-totalpage': el.pages.length
			}).pagination();

			// slidable initiation
			el.slidable = el.querySelector('.Scroller');
			if(!el.slidable) {
				el.slidable = document.createElement('div');
			}
			el.slidable.element = el;
			el.appendChild(el.slidable);
			$(el.slidable)
				.css({
//					'height': (el.offsetHeight - el.pagingHeight) + 'px',
					'width': el.width * el.pages.length + 'px',
					'transform': 'translate3d(0px, 0px,0px)',
					'-ms-transform': 'translateZtranslate3d(0px, 0px,0px)',
					'padding': '0'
				});

			// page initiation
			if ($.alopex.util.isValid(el.pages)) {
				el.pages
				.css({
					'width': el.width + 'px',
					'position': 'relative',
//					'height': '100%',
					'float': 'left'
				})
				.each(function(index) {
					this.index = index;
				});
				for ( var i = 0; i < el.pages.length; i++) {
					el.slidable.appendChild(el.pages[i]);
				}
			}
			
			if($(el).attr('data-autoSlidemode') === 'true') {
			    el.autoSlidemode = true;
			    if($(el).attr('data-autoSlideDuration') > 0){
				el.autoSlideDuration = $(el).attr('data-autoSlideDuration');
			    }
			    this._evt_autoSlide(el, true);
			}
			
			
		},
		
		event: function(el, options) {
			// event handler binding
			var carousel = $.alopex.widget.carousel;
			el.paging.on('pagechange', carousel._evt_pagechange);
			el.prevButton.on('click', carousel._evt_prev_btn);
			el.nextButton.on('click', carousel._evt_next_btn);
			
			// 20150608 김준범
			// resize event handler 중복 적용 제거
//			$(window).on('resize', {object: el}, this._evt_resize);
			$(el.slidable).on('pressed', carousel._evt_pressed);
			if(window.browser == 'mobile') { // scroll 또는 swipe 이벤트 판단을 위해 필요.
				$(el.slidable).on('touchmove', carousel._evt_move);
			} else {
				$(el.slidable).on('swipemove', carousel._evt_swipemove);
				this._addSwipeEvent(el); // 데스크탑의 경우에만 넣어줌.
			}
			$(window).on('resize', {object: el}, this._evt_resize);
		},
		
		_evt_resize: function(e){
			el = e.data.object;
			el.width = el.offsetWidth;
			$(el.slidable)
//				.css('height', (el.offsetHeight - el.pagingHeight) + 'px')
				.css('width', el.width * el.pages.length + 'px');
			el.pages.css('width', el.width + 'px').css('position', 'relative');
			el.position = -1 * (el.currentpage - 1) * el.width;
			$.alopex.widget.carousel._slide(el, el.position);
		},
		
		_addSwipeEvent: function (el, once) {
			var method = 'on';
			if(once) {
				method = 'one';
			}
			var swipeEventHandler = this._evt_swipe;
			if(el.buttons) { // tabs 엘리먼트가 아닐 경우만 호출.
				swipeEventHandler = $.alopex.widget.tabs._evt_swipe;
			}
			//$(el.slidable)[method]('swipemove', this._evt_swipemove);
			$(el.slidable)[method]('swipecancel', this._evt_swipecancel);
			$(el.slidable)[method]('swipe', {
				distanceX: 60	// 100px 이상 swipe될 경우, 페이지 이동.
			}, swipeEventHandler);
			
		},
		
		_removeSwipeEvent: function(el) {
			$(el.slidable).off('swipemove', this._evt_swipemove);
			$(el.slidable).off('swipecancel', this._evt_swipecancel);
			$(el.slidable).off('swipe', {
				distanceX: 60	// 100px 이상 swipe될 경우, 페이지 이동.
			}, this._evt_swipe);
		},
		
		_slide: function(el, position, duration) {
			if ($.alopex.widget.carousel.transitionSupport) {
				$(el.slidable).css({
					'transition': 'all ' + duration + 'ms ease-in-out',
					'-ms-transition': 'all ' + duration + 'ms ease-in-out'
				});
				
				$(el.slidable).css('transform', 'translate(' + (position) + 'px,0)');
				$(el.slidable).css('transform', 'translate3d(' + (position) + 'px,0,0)');
				
				setTimeout(function() {
					$(el.slidable).css({
						'transition': 'all 0 ms ease-in-out',
						'-ms-transition': 'all 0 ms ease-in-out'
					});
				}, duration);
			} else {
				// 20150608 김준범
				// IE 7, 8에서 element absolute 시 resize 되기 때문에
				// absolute 다음으로 위치 변경
//				var height = $(el).css('height');
				
				$(el.slidable).css({
					position: 'absolute'
				});
				
				var height = $(el).css('height');
				
				$(el.slidable).animate({ 
					left: (position) + 'px' 
				}, duration);
				if(height != undefined) {
					$(el).css('height', height);
				}
			}
		},
		
		
		

		_evt_pagechange: function(e, page) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			var distance = el.currentpage - page;
			el.position = el.position + distance * el.width;
			el.currentpage = page;
			
			$.alopex.widget.carousel._slide(el, el.position, 300);
		},

		_evt_prev_btn: function(e) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			$(el).prevSlide();
		},

		_evt_next_btn: function(e) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			//      $(el.slidable).css('transition', 'all ' + el.animationDuration + ' ease-in-out');
			$(el).nextSlide();
		},
		
		_evt_move: function(e) {
			var el = e.currentTarget.element;
			if(!el.pressed) {
				return false;
			}
			var point;
			var touches = e.touches || e.originalEvent.touches;
			if(touches && touches.length > 0) {
				touches = touches[0];
				point = {
					x: touches.clientX? touches.clientX: 0,
					y: touches.clientY? touches.clientY: 0
				};
			} else {
				point = {
					x: e.clientX,
					y: e.clientY
				}
			}
			if(el.mode == 'vertical') {
				// prevent안하고 내비둔다.
				__ALOG('==== 현재 스크롤 ====== ');
			} else if(el.mode == 'horizontal') {
				e.preventDefault();
				__ALOG('==== 현재 스와이프  ====== ');
				distanceX = point.x - el.presspoint.x;
				if (Math.abs(distanceX) > el.width) {
					distanceX = distanceX / distanceX * el.width;
				}
				e.preventDefault(); // android에서는 e.preventDefault 호출해줘야 계속 touchmove 이벤트 발생.
				$.alopex.widget.carousel._slide(el, el.position+distanceX, 0);
			} else { // 미정.
				//e.preventDefault();
				$.alopex.widget.carousel._removeSwipeEvent(el);
				if(Math.abs(el.presspoint.y - point.y) > 10) {
					el.mode = 'vertical';
					__ALOG('==== 버티컬 모드로 진입 ====== ');
				} else { // swipe event handle
					__ALOG('==== 스와이프  모드로 진입 ====== ');
					el.mode = 'horizontal';
					$.alopex.widget.carousel._addSwipeEvent(el, true);
				}
			}
		},

		/**
		 * the event handler for pressed event
		 * it will attach the slides to the both side of current page slide.
		 */
		_evt_pressed: function(e, c) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			el.mode = null;
			el.pressed = true;
			$(el.slidable).css({
					'transition': 'all 0s ease-in-out',
					'-ms-transition': 'all 0s ease-in-out'
				});
			if(window.browser == 'mobile') {
				var touches = e.touches || e.originalEvent.touches || e.originalEvent.originalEvent.touches;
				if(touches && touches.length > 0) {
					touches = touches[0];
					el.presspoint = {
						x: touches.clientX? touches.clientX: 0,
						y: touches.clientY? touches.clientY: 0
					};
				}
			} else {
				el.presspoint = {
					x: e.clientX,
					y: e.clientY
				};
			}
		},

		_evt_swipemove: function(e, c) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			if(!el.pressed) {
				return ;
			}
			if (Math.abs(c.distanceX) > el.width) {
				c.distanceX = c.distanceX / c.distanceX * el.width;
			}
			e.preventDefault(); // android에서는 e.preventDefault 호출해줘야 계속 touchmove 이벤트 발생.
			$.alopex.widget.carousel._slide(el, el.position+c.distanceX, 0);
		},

		_evt_swipe: function(e, c) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			var duration = (el.width - Math.abs(c.distanceX)) / c.speed * 1000;
			if (duration > 500) {
				duration = 500;
			}
			if (c.distanceX < 0) { // 좌측 이동
				$(el).nextSlide({animationDuration: duration});
			} else { // 우측 이동
				$(el).prevSlide({animationDuration: duration});
			}
			el.press = false;
			$(el).trigger('swipechange', [el.currentpage-1]);
		},

		_evt_swipecancel: function(e, c) {
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			$.alopex.widget.carousel._slide(el, el.position, 200);
			el.pressed = false;
		},

		
		
		_evt_autoSlide: function(el, loop, duration) {
		    var duration = (duration)? duration : el.autoSlideDuration;
		    
		    
		    if(loop){
			    clearInterval(el.autoSlideTime);
			    el.autoSlideTime = setInterval(function() {
        			if (el.currentpage < el.totalpage) {
        			    $(el).nextSlide();
        			}else if (el.currentpage == el.totalpage) {
        			    $(el).setIndex(0);
        			}
        		    }, duration);
		    }else{
			clearInterval(el.autoSlideTime);
		    }
		},
		
		
		stopAutoSlide: function(el) {
		    this._evt_autoSlide(el, false);
		},
		
		
		startAutoSlide: function(el) {
		    this._evt_autoSlide(el, true);
		},
		
		setAutoSlideDuration: function(el, duration) {
		    this._evt_autoSlide(el, true, duration);
		},
		
		
		
		
		
		nextSlide: function(el, options) {
			var duration = (options && options.animationDuration)? options.animationDuration : el.animationDuration;
			if (el.currentpage < el.totalpage) {
				el.position -= el.width;
				el.currentpage++;
				el.paging.setSelectedPage(el.currentpage, true);
			}
			$.alopex.widget.carousel._slide(el, el.position, duration);
		},

		prevSlide: function(el, options) {
			var duration = (options && options.animationDuration)? options.animationDuration : el.animationDuration;
			if (el.currentpage > 1) {
				el.position += el.width;
				el.currentpage--;
				el.paging.setSelectedPage(el.currentpage, true);
			}
			$.alopex.widget.carousel._slide(el, el.position, duration);
		},
		
		setIndex : function(el, index, options) {
			if(index < 0 || index >= el.pages.length) {
				return ;
			}
			var duration = (options && options.animationDuration != undefined)? options.animationDuration : el.animationDuration;
			el.position = el.width*index*-1;
			el.currentpage = index+1;
			el.paging.setSelectedPage(el.currentpage, true);
			$.alopex.widget.carousel._slide(el, el.position, duration);
		},

		transitionSupport: (function() {
			if (navigator.userAgent.indexOf('MSIE') !== -1 && navigator.userAgent.indexOf('MSIE 10') === -1) {
				return false;
			}
			return true;
		})()
	});

})(jQuery);
(function($) {
	$.alopex.widget.checkbox = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'checkbox',
		defaultClassName : 'af-checkbox Checkbox',
		defaultTextClassName : 'af-checkbox-text',
		defaultWrapClassName : 'af-wrapcheckbox',
		defaultWrapSpanClassName : 'af-wrapcheckbox-span',
		getters : [ 'getValues', 'getTexts', 'getCheckedLength' ],
		setters : [ 'checkbox', 'setCheckAll', 'setChecked', 'setValues', 'toggle' ],

		properties : {
			wrap : false
		},

		init : function(el, options) {
			var $el = $(el);
			el.options = $.extend(true, {}, this.properties, options);

			//IE8에서는 input type변경 불가.
			try {
				$el.attr('type', 'checkbox');
			} catch(e) {
			}
			
			if (el.options.wrap || $.alopex.util.parseBoolean(el.alopexoptions.wrap)) {
				// $el.attr('data-type', 'wrapcheckbox').wrapcheckbox();
				if (el.className) {
					if (el.className.indexOf(this.defaultClassName) !== -1) {
						$el.addClass(this.defaultWrapClassName);
					}
					$el.after('<span class="' + el.className + '-span"></span>');
				} else {
					$el.after('<span class="' + this.defaultWrapSpanClassName + '"></span>');
				}
			}
			
			$el.on('change', function(e){
				if(e.currentTarget.checked) {
					$(e.currentTarget).parent('label').addClass('Checked');
				} else {
					$(e.currentTarget).parent('label').removeClass('Checked');
				}
			});
			
			if(el.checked || el.getAttribute('checked') == 'checked') {
				$(el).parent().addClass('Checked');
				$(el).prop('checked', true);
			}
		},

		style : function(el) {
			if (el.id) {
				$('label[for="' + el.id + '"]').addClass(this.defaultTextClassName);
			} else {
				$(el).parent('label').addClass(this.defaultTextClassName);
			}
		},

		properties : {
			quickResponse : false
		},

		setQuickResonse : function(el, bool) {
			// TODO
		},

		setCheckAll : function(el, bool, changeTrigger) {
			if (!$.alopex.util.isValid(bool)) {
				bool = true;
			}
			if (!$.alopex.util.isValid(changeTrigger)) {
				changeTrigger = true;
			}
			var $checkList = $('input[name=' + el.name + ']');
			$checkList.prop('checked', bool);
			$checkList.parent('label').addClass('Checked');

			if (changeTrigger) {
				$checkList.trigger('change');
			}
		},

		setChecked : function(el, bool, changeTrigger) {
			if (!$.alopex.util.isValid(bool)) {
				bool = true;
			}
			if (!$.alopex.util.isValid(changeTrigger)) {
				changeTrigger = true;
			}
			if (el.tagName === 'INPUT') {
				$(el).prop('checked', bool);
				$(el).parent('label').addClass('Checked');
			}
			if (changeTrigger) {
				$(el).trigger('change');
			}
		},

		getValues : function(el) {
			var tmpValuesArr = [];

			var checkList = $('input[name=' + el.name + ']:checked');
			for (var i = 0; i < checkList.length; i++) {
				var obj = checkList[i];
				tmpValuesArr.push($(obj).val());
			}
			return tmpValuesArr;
		},

		setValues : function(el, array, changeTrigger) {
			if (!$.alopex.util.isValid(changeTrigger)) {
				changeTrigger = true;
			}
			var $checkList = $('input[name=' + el.name + ']').prop('checked', false);
			for (var i = 0; i < $checkList.size(); i++) {
				var checkbox = $checkList.get(i);
				for (var j = 0; j < array.length; j++) {
					if (checkbox.value === array[j]) {
						$(checkbox).prop('checked', true);
						array.splice(j, 1);
					}
				}
			}
			if (changeTrigger) {
				$checkList.trigger('change');
			}
		},

		getTexts : function(el) {
			var tmpTextsArr = [];
			var checkList = $('input[name=' + el.name + ']:checked');
			for (var i = 0; i < checkList.length; i++) {
				var obj = checkList[i];
				var elId = $(obj).attr('id');
				var $label = $(document.body).find('label[for=\"' + elId + '\"]');
				if($label.length==0) {
					$label = $(obj).parent('label');
//		        	$label = $(el).parent('label');
		        }
				tmpTextsArr.push($label.text());
			}
			return tmpTextsArr;
		},

		getCheckedLength : function(el) {
			var $checkList = $('input[name=' + el.name + ']:checked');
			return $checkList.size();
		},

		toggle : function(el, changeTrigger) {
			if (!$.alopex.util.isValid(changeTrigger)) {
				changeTrigger = true;
			}
			var $checkList = $('input[name=' + el.name + ']');
			for (var i = 0; i < $checkList.size(); i++) {
				// var obj = checkList[i];
				var obj = $checkList.get(i);
				if ($(obj).prop('checked')) {
					$(obj).prop('checked', false);
				} else {
					$(obj).prop('checked', true);
				}
			}

			if (changeTrigger) {
				$checkList.trigger('change');
			}
		}
	});
})(jQuery);
(function($) {

	$.alopex.widget.dateinput = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'dateinput',
		defaultClassName : 'af-dateinput Dateinput',
		classNames: {
			clearButton: 'Clear',
			calendar: 'Calendar'
		},
		setters : [ 'dateinput', 'setEnabled', 'update', 'clear' ],
		getters : [],

		properties : {
			date : new Date(),
			format : 'yyyy-MM-dd',
			image : false,
			selectyear : false,
			selectmonth : false,
			pickertype : 'daily',
			mindate : null,
			maxdate : null,
			callback : null,
			resetbutton : false,
			blurcallback : null,
			certaindatestxt : {
				unavailabletxt : ''
			},
			placeholder : true
		},

		_generateDate : function(el, value) {
			var format = el.options.format;
			var seperator = format.replace('yyyy', '').replace('MM', '').replace('dd', '').substring(0, 1);
			var date, year, month, day;
			var yearStartIdx = format.indexOf('yyyy');
			var monthStartIdx = format.indexOf('MM');
			var dayStartIdx = format.indexOf('dd');
			if (el.options.pickertype === 'daily' || el.options.pickertype === 'weekly') {
				if (value.indexOf(seperator) == -1 && value.length == 8) { // 숫자만 입력한 경우.
					if (yearStartIdx > 0) {
						value = value.substr(0, 2) + seperator + value.substr(2, 2) + seperator + value.substr(4, 4);
					} else {
						value = value.substr(0, 4) + seperator + value.substr(4, 2) + seperator + value.substr(6, 2);
					}
					$(el).trigger('change');
				}
				if (!$.alopex.util.isValid(value)) {
					return new Date();
				} else if (!$.alopex.util.isValid(seperator)) {
					return new Date(value.substr(yearStartIdx, 4), Number(value.substr(monthStartIdx, 2)) - 1, value.substr(dayStartIdx, 2));
				} else {
					if (yearStartIdx > 0 && yearStartIdx > monthStartIdx) {
						year = value.split(seperator)[2];
						if (monthStartIdx == 0) {
							month = Number(value.split(seperator)[0]) - 1;
							day = value.split(seperator)[1];
						} else {
							month = Number(value.split(seperator)[1]) - 1;
							day = value.split(seperator)[0];
						}
						return new Date(year, month, day);
					} else if (yearStartIdx > 0 && yearStartIdx < monthStartIdx){
						return new Date(value.split(seperator)[1], Number(value.split(seperator)[2]) - 1, value.split(seperator)[0]);
					} else {
						year = value.split(seperator)[0];
						if (monthStartIdx > dayStartIdx) {
							month = Number(value.split(seperator)[2]) - 1;
							day = value.split(seperator)[1];
						} else {
							month = Number(value.split(seperator)[1]) - 1;
							day = value.split(seperator)[2];
						}
						return new Date(year, month, day);
					}
				}
			} else if (el.options.pickertype === 'monthly') {
				if (value.indexOf(seperator) == -1 && value.length == 6) { // 숫자만 입력한 경우.
					if (yearStartIdx > 0) {
						value = value.substr(0, 2) + seperator + value.substr(2, 4);
					} else {
						value = value.substr(0, 4) + seperator + value.substr(4, 2);
					}
					$(el).trigger('change');
				}
				if (!$.alopex.util.isValid(value)) {
					return new Date();
				} else if (!$.alopex.util.isValid(seperator)) {
					return new Date(value.substr(yearStartIdx, 4), Number(value.substr(monthStartIdx, 2)) - 1);
				} else {
					if (yearStartIdx > 0) {
						return new Date(value.split(seperator)[1], Number(value.split(seperator)[0]) - 1);
					} else {
						return new Date(value.split(seperator)[0], Number(value.split(seperator)[1]) - 1);
					}
				}
			}
		},

		init : function(el, options) {
			var isClassLoad = false;
			var wrapper;
			if(el.tagName.toLowerCase() == 'div') {
				wrapper = el;
				el = el.querySelector('input');
				isClassLoad = true;
			}
			var $el = $(el);
			el.options = $.extend(true, {}, this.properties, options);
			
			this.refresh_format(el, options);

			$el.attr('maxlength', el.options.format.length);
			if (el.options.placeholder) {
				$el.attr('placeholder', el.options.format);
			}

			this.addHoverHighlight(el);
			this.addPressHighlight(el);

			if(isClassLoad) {
				var $wrapper = $(wrapper);
				if($wrapper.find('.'+this.classNames.calendar).length>0) {
					el.imagebutton = $wrapper.find('.'+this.classNames.calendar);
				}
				if($wrapper.find('.'+this.classNames.clearButton).length>0) {
					el.resetbutton = $wrapper.find('.'+this.classNames.clearButton);
				}
				
			} else {
				if (el.options.image !== false) { // data-image 속성이 존재하는 경우,
					// var height = parseInt($el.css('height'));
					el.imagebutton = $('<div></div>').insertAfter(el).addClass('af-dateinput-image');
					if (el.options.image !== '') { // data-image 속성에 값이 지정된 경우
						$(el.imagebutton).css('background-image', 'url(' + el.options.image + ')');
					}
					
				}
				if (el.options.resetbutton) {
					el.resetbutton = $('<div>x</div>').insertAfter(el).addClass('af-reset-button');
					
				}
			}
			if(el.imagebutton) {
				el.imagebutton[0].element = el;
			}
			if(el.resetbutton) {
				el.resetbutton[0].element = el;
				el.resetbutton.on('click', function(e) {
					var target = e.currentTarget;
					var $el = $(target.element);
					if (!$el.is('.af-disabled Disabled')) {
						if (target.daterange) {
							$(target.daterange).clear();
						} else {
							$.alopex.widget.dateinput.clear(target.element);
						}
						e.preventDefault();
						e.stopPropagation();
					}
				});
			}
			// $el.attr('readonly', true);
			// IE에서는 type 바꾸는것을 허용하지 않음
			if (!$.alopex.util.isValid($el.attr('type'))) {
				$el.attr('type', 'text');
			}
			this.setEnabled(el, el.options.enabled);
			$el.on('blur', this._blurHandler);
		},

		_blurHandler : function(e) {
			var that = $.alopex.widget.dateinput;
			var el = e.currentTarget;
			var value = $(el).val();
			var format = el.options.format;
			var date = that._generateDate(el, value);
			if (isNaN(date.getTime()) || $.alopex.util.getDateString(date, format) != value) {
				$(el).val('');
				$(el).trigger('change');
				if (el.options.blurcallback) {
					el.options.blurcallback(el, value);
				}
			}
		},

		update : function(el, options) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			$.extend(true, el.options, options);
			
			this.refresh_format(el, options);

		},
		
		refresh_format : function(el, options){
			
			// arg0 : el.options 기존 설정
			// arg1 : options 새로운 설정
			
			// 1. 새로운 설정으로 pickertype만 설정 했을 때, 이에 맞게 기존 설정 format도 변경해준다
			if($.alopex.util.isValid(options.pickertype) && options.format === undefined){
				
				// <div class="Dateinput" data-pickertype="daily">와 같이 적용했는데, 기존 설정에 dd가 없는 경우,
				// data-format을 설정하지 않았기 때문에 default인 'yyyy-MM-dd' 기준으로 수정한다
				if((options.pickertype === 'daily' || options.pickertype === 'weekly') && el.options.format.indexOf('dd') === -1){
						el.options.format = 'yyyy-MM-dd';
						$(el).attr("data-format", el.options.format);
					}
				
				// <div class="Dateinput" data-pickertype="monthly">와 같이 적용했는데, 기존 설정에 dd가 있는 경우, dd를 뺀다
				if(options.pickertype === 'monthly' && el.options.format.indexOf('dd') !== -1){
					
					var format = el.options.format;
					if(format.length === 8){
						format = format.replace("dd", "");
					}else{
						var temp = format.replace('yyyy', '').replace('MM', '').replace('dd', '');
						var seperator;
						seperator = (temp.length === 0 ? "" : temp.substring(0, 1));
						
						var yearStartIdx = format.indexOf('yyyy');
						var monthStartIdx = format.indexOf('MM');
	
						if(yearStartIdx > monthStartIdx){
							format = 'MM' + seperator + 'yyyy';
						}else{
							format = 'yyyy' + seperator + 'MM';
						}
					}
					el.options.format = format;
					$(el).attr("data-format", el.options.format);				
					
				}
				
			}
			
			// 2. format만 설정 했을 때, format에 맞게 pickertype도 변경해준다
			if($.alopex.util.isValid(options.format) && options.pickertype === undefined){
				
				// <div class="Dateinput" data-format="MM/dd/yyyy">와 같이 적용했는데, 기존 설정이 pickertype : "monthly"인 경우,
				// 기존 설정 pickertype을 새로운 설정 format에 맞게 수정해준다
				if(options.format.indexOf('dd') !== -1 && el.options.pickertype === 'monthly'){
					el.options.pickertype = 'daily';
					$(el).attr("data-pickertype", el.options.pickertype);
					}
				
				// <div class="Dateinput" data-format="MM/yyyy">와 같이 적용했는데, 기존 설정이 pickertype : "daily"인 경우,
				// 기존 설정 pickertype을 새로운 설정 format에 맞게 수정해준다
				if(options.format.indexOf('dd') === -1 && el.options.pickertype === 'daily'){
					el.options.pickertype = 'monthly';
					$(el).attr("data-pickertype", el.options.pickertype);
					}
			}
			
			// 3. 둘 다 했는데, format은 일별(MM/dd/yyyy)이고, pickertype을 월별(monthly)로 하는 등 오류 설정을 했을 때는, format에 모든 것을 맞춘다
			if($.alopex.util.isValid(options.format) && $.alopex.util.isValid(options.pickertype)){
				
				if(options.format.indexOf('dd') !== -1 && options.pickertype === 'monthly'){
					el.options.pickertype = 'daily';
					$(el).attr("data-pickertype", el.options.pickertype);
				}
				
				if(options.format.indexOf('dd') === -1 && (options.pickertype === 'daily' || options.pickertype === 'weekly')){
					el.options.pickertype = 'monthly';
					$(el).attr("data-pickertype", el.options.pickertype);
				}
			}
			
		},

		setEnabled : function(el, flag) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			var $el = $(el);
			flag = $.alopex.util.parseBoolean(flag);
			$(el).off('click', this._clickEventHandler);
			$(el.imagebutton).off('click', this._clickEventHandler);
			if (flag) {
				if (el.imagebutton) {
					$(el.imagebutton).on('click', this._clickEventHandler);
				} else {
					$el.on('click', this._clickEventHandler);
				}
				$el.add(el.imagebutton).removeClass('af-disabled Disabled');
				$el.removeAttr('readonly');
			} else {
				$el.add(el.imagebutton).addClass('af-disabled Disabled');
				$el.attr('readonly', true);
			}
		},

		clear : function(el) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			$(el).val('');
			$(el).trigger('change');
		},

		_clickEventHandler : function(e) {
			var that = $.alopex.widget.dateinput;
			var el = e.currentTarget.element || e.currentTarget;
			var value = $(el).val();
			var date = that._generateDate(el, value);
			date = (isNaN(date.getYear())) ? null : date;
			var option = $.extend(true, {}, $.alopex.widget.dateinput.properties, el.options, {
				date : date
			});
			var mindate = $(el).attr('data-mindate');
			if (mindate) {
				option.mindate = that._generateDate(el, mindate);
			}
			var maxdate = $(el).attr('data-maxdate');
			if (maxdate) {
				option.maxdate = that._generateDate(el, maxdate);
			}

			// datepicker click 을 통하지 않고, 동적으로 date가 입력된 경우 체크하여 min/max date에 반영시킨다.
			var dynamicMinMax = null;
			if($(el).parent().parent().attr('data-type') === 'daterange'){
				// 인자로 div.daterange element를 보낸다
				dynamicMinMax = $a.widget.daterange._dynamicBindingCheck($(el).parent().parent()[0]);
			
				// start input 테그를 클릭했고 && maxdate 동적으로 변경된 경우
				if($(el).parent().hasClass('Startdate')){
					// '' 인 경우 null 처리를 통해 disabled를 해제시켜준다
					option.maxdate = dynamicMinMax.maxdate === '' ? null : dynamicMinMax.maxdate;
				}
				// end input 테그를 클릭했고 && mindate 동적으로 변경된 경우
				if($(el).parent().hasClass('Enddate')){
					option.mindate = dynamicMinMax.mindate === '' ? null : dynamicMinMax.mindate;
				}
			}
			
			$(el).showDatePicker(function(date, value, certainDatesName, certainDatesInfo, e) {
				if (certainDatesInfo && !certainDatesInfo.isClickToClose) {
					if ($.alopex.util.isValid(option.certaindatestxt.unavailabletxt)) {
						var text = option.certaindatestxt.unavailabletxt;
						text = text.split('{0}').join(certainDatesName);
						alert(text);
					}
					return;
				}
				if (el.options.pickertype === 'weekly') {
					
					if($(el).parent().parent().attr('data-type') === 'daterange'){
						if ($(el).attr('data-role') === 'startdate') {
							 $(el).val(value['startdate']);
						 } else {
							 $(el).val(value['enddate']);
						 }
					}else{
						$(el).val(value['startdate'] + " ~ " + value['enddate']);
					}
					 
				} else {
					$(el).val(value);
				}
				$(el).trigger('change'); // trigger datamodel set.
				if (el.options.callback) {
					el.options.callback.call(el, date, value, certainDatesName, certainDatesInfo, e);
				}
			}, option);
		}
	});

})(jQuery);
(function($) {
	if ($.alopex.datePickerMap) {
		return;
	}
	//-----------------------DatePicker----------------------//TODO

	/**
	 * 생성된 Datepicker객체들을 보관하며 set, get, remove 메소드 제공.
	 */
	$.alopex.datePickerMap = {

		datePickerObj: {},

		setObject: function(id, obj) {
			this.datePickerObj[id] = obj;
		},

		getObjectByNode: function(node) {
			var temp = $(node);
			while (temp.attr('data-type') !== 'af-datepicker') {
				temp = temp.parent();
			}
			return this.datePickerObj[temp.attr('id')];
		},

		getObjectById: function(id) {
			var objId = '';
			if (id.indexOf('datepicker_') < 0) {
				objId = 'datepicker_' + id;
			} else {
				objId = id;
			}
			return this.datePickerObj[objId];
		},

		removeObjectById: function(id) {
			var objId = '';
			if (id.indexOf('datepicker_') < 0) {
				objId = 'datepicker_' + id;
			} else {
				objId = id;
			}
			delete this.datePickerObj[objId];
		},

		removeObjectByNode: function(node) {
			var temp = $(node);
			while (temp.attr('data-type') !== 'af-datepicker') {
				temp = temp.parent();
			}
			delete this.datePickerObj[temp.attr('id')];
		}
	};

	/**
	 * DatePicker 구성을 위한 Property 및 method
	 */
	$.alopex.datePicker = {

		MONTHS_KO: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
		MONTHS_EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		MONTHS_JA: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
		MONTHS_ZH: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],

		WEEKDAYS_KO: ['일', '월', '화', '수', '목', '금', '토'],
		WEEKDAYS_EN: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		WEEKDAYS_JA: ['日', '月', '火', '水', '木', '金', '土'],
		WEEKDAYS_ZH: ['日', '一', '二', '三', '四', '五', '六'],

		POSTFIX_KO: ['년', '월', '일'],
		POSTFIX_EN: ['', '', ''],
		POSTFIX_JA: ['年', '月', '日'],
		POSTFIX_ZH: ['年', '月', '日'],

		DESC_PREVYEAR_KO: '이전년도',
		DESC_PREVYEAR_EN: 'previous year',
		DESC_PREVYEAR_JA: '前年',
		DESC_PREVYEAR_ZH: '前一年',

		DESC_NEXTYEAR_KO: '다음년도',
		DESC_NEXTYEAR_EN: 'next year',
		DESC_NEXTYEAR_JA: '翌年',
		DESC_NEXTYEAR_ZH: '明年',

		DESC_PREVMONTH_KO: '이전 월',
		DESC_PREVMONTH_EN: 'previous month',
		DESC_PREVMONTH_JA: '先月',
		DESC_PREVMONTH_ZH: '上个月',

		DESC_NEXTMONTH_KO: '다음 월',
		DESC_NEXTMONTH_EN: 'next month',
		DESC_NEXTMONTH_JA: '来月',
		DESC_NEXTMONTH_ZH: '下个月',

		DESC_CLOSE_KO: '닫기',
		DESC_CLOSE_EN: 'close',
		DESC_CLOSE_JA: '終了',
		DESC_CLOSE_ZH: '关闭',
		

		DESC_YEARSELECT_KO : '년도 선택',
		DESC_YEARSELECT_EN : 'year select',
		DESC_YEARSELECT_JA : '年を選択',
		DESC_YEARSELECT_ZH : '年份选择',

		DESC_MONTHSELECT_KO : '월 선택',
		DESC_MONTHSELECT_EN : 'month select',
		DESC_MONTHSELECT_JA : '月選択',
		DESC_MONTHSELECT_ZH : '月份选择',

		DESC_MONTH_SUMMARY_KO : '월을 선택할 수 있는 달력입니다.',
		DESC_MONTH_SUMMARY_EN : 'you can select month.',
		DESC_MONTH_SUMMARY_JA : '月を 選べるカレンダーです.',
		DESC_MONTH_SUMMARY_ZH : '选择月份的日历.',

		DESC_MONTH_CAPTION_KO : '월 달력',
		DESC_MONTH_CAPTION_EN : 'month picker',
		DESC_MONTH_CAPTION_JA : '月カレンダー',
		DESC_MONTH_CAPTION_ZH : '月份日历',

		DESC_DAY_SUMMARY_KO : '날짜를 선택할 수 있는 달력입니다.',
		DESC_DAY_SUMMARY_EN : 'you can select a day.',
		DESC_DAY_SUMMARY_JA : '日にちを選べるカレンダーです.',
		DESC_DAY_SUMMARY_ZH : '选择日期的日历.',

		DESC_DAY_CAPTION_KO : '달력',
		DESC_DAY_CAPTION_EN : 'datepicker',
		DESC_DAY_CAPTION_JA : 'カレンダー',
		DESC_DAY_CAPTION_ZH : '日历',

		DESC_TODAY_BTN_KO : '오늘',
		DESC_TODAY_BTN_EN : 'Today',
		DESC_TODAY_BTN_JA : '今日',
		DESC_TODAY_BTN_ZH : '今天',

		currentDate : null, // today info
		weekdays : [],
		months : [],
		dateFormat : null,
		datePostfix : [],
		localeInfo : null,
		certainDates : [],
		mindate : null,
		maxdate : null,

		descPrevYear : null,
		descNextYear : null,
		descPrevMonth : null,
		descNextMonth : null,
		descClose : null,
		descYearSelect : null,
		descMonthSelect : null,
		descMonthSummary : null,
		descMonthCaption : null,
		descDaySummary : null,
		descDayCaption : null,
		descTodayBtn : null,

		daysInMonth : [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
		calendarBody : null, // '일' 표시 영역(tbody)
		calendarMonth : null, // header의 '월' 라벨 영역
		calendarYear : null, // header의 '연도' 라벨 영역
		prevMonth : null,
		nextMonth : null,
		prevYear : null,
		nextYear : null,
		btn_close : null,
		_renderCache : [],
		targetElem: null, //datePicker의 위치에 기준이 되는 element
		_callback: null,
		closeCallback: null,
		calendarContainer: null,
		datePickerTheme: 'af-default',//default 테마 Class명
		datePickerInlineTheme: 'af-inline Inline',
		currentArea: null,
		inline: false,
		pickertype: 'daily',
		selectyear : false,
		selectmonth : false,
		showothermonth : false,
		showbottom : false,
		bottomdate : null,
		weekperiod : 1,

		/**
		 * @param {json} param : json형의 option 값.
		 */
		setDefaultDate: function(param) {
			try {
				this.currentDate = new Date(); // default : today
				if ($.alopex.util.isValid(param)) {
					if (param.hasOwnProperty('date')) {
						var obj = param.date;
						if (obj instanceof Date) {
							this.currentDate = obj;
						} else {
							if (!$.alopex.util.isValid(obj.year) || !$.alopex.util.isNumberType(obj.year) || obj.year < 1900 || obj.year > 2100 || !$.alopex.util.isValid(obj.month) ||
									!$.alopex.util.isNumberType(obj.month) || obj.month < 1 || obj.month > 12 || !$.alopex.util.isValid(obj.day) || !$.alopex.util.isNumberType(obj.day) || obj.day > 31 ||
									obj.day < 1) {
								throw '[DatePicker Error] Invalid Date => ' + obj.year + '-' + obj.month + '-' + obj.day;
							}
							this.currentDate = new Date(obj.year, (obj.month - 1), obj.day);
						}
					}
				}
			} catch (e) {
				//        __ALOG(e);
			}
		},

		/**
		 * @param {json} param : return 되는 날짜 정보 format의 key, value.
		 * ex) {'format' : 'yyyy-MM-dd'}.
		 */
		setFormat: function(param) {
			var formatStr = 'yyyyMMdd'; //default
			if ($.alopex.util.isValid(param) && param.hasOwnProperty('format') && $.alopex.util.isValid(param.format)) {
				var pattern = /[Y|m|D|e]/g;
				if (!pattern.test(param.format)) {
					formatStr = param.format;
				} else {
					//          __ALOG('[DatePicker Error] Invalid Date Pattern' + '(y, M, d, E only) => ' + param.format);
				}
			}
			this.dateFormat = formatStr;
		},

		/**
		 * @param {json} param : 달력에 표시되는 월, 요일 영역의 Locale 정보.
		 * ex) {'locale' : 'ko | en | ja | zh'}.
		 */
		setLocale: function(param) {

			var localeStr = 'ko'; //default
			this.localeInfo = 'ko'; //default

			if ($.alopex.util.isValid(param)) {
				if (param.hasOwnProperty('locale')) {
					localeStr = param.locale;
				}
			}

			switch (localeStr) {
			case 'en':
				this.weekdays = this.WEEKDAYS_EN;
				this.months = this.MONTHS_EN;
				this.datePostfix = this.POSTFIX_EN;
				this.descPrevYear = this.DESC_PREVYEAR_EN;
				this.descNextYear = this.DESC_NEXTYEAR_EN;
				this.descPrevMonth = this.DESC_PREVMONTH_EN;
				this.descNextMonth = this.DESC_NEXTMONTH_EN;
				this.descClose = this.DESC_CLOSE_EN;
				this.descYearSelect = this.DESC_YEARSELECT_EN;
				this.descMonthSelect = this.DESC_MONTHSELECT_EN;
				this.descMonthSummary = this.DESC_MONTH_SUMMARY_EN;
				this.descMonthCaption = this.DESC_MONTH_CAPTION_EN;
				this.descDaySummary = this.DESC_DAY_SUMMARY_EN;
				this.descDayCaption = this.DESC_DAY_CAPTION_EN;
				this.descTodayBtn = this.DESC_TODAY_BTN_EN;
				this.localeInfo = 'en';
				break;

			case 'ko':
				this.weekdays = this.WEEKDAYS_KO;
				this.months = this.MONTHS_KO;
				this.datePostfix = this.POSTFIX_KO;
				this.descPrevYear = this.DESC_PREVYEAR_KO;
				this.descNextYear = this.DESC_NEXTYEAR_KO;
				this.descPrevMonth = this.DESC_PREVMONTH_KO;
				this.descNextMonth = this.DESC_NEXTMONTH_KO;
				this.descClose = this.DESC_CLOSE_KO;
				this.descYearSelect = this.DESC_YEARSELECT_KO;
				this.descMonthSelect = this.DESC_MONTHSELECT_KO;
				this.descMonthSummary = this.DESC_MONTH_SUMMARY_KO;
				this.descMonthCaption = this.DESC_MONTH_CAPTION_KO;
				this.descDaySummary = this.DESC_DAY_SUMMARY_KO;
				this.descDayCaption = this.DESC_DAY_CAPTION_KO;
				this.descTodayBtn = this.DESC_TODAY_BTN_KO;
				this.localeInfo = 'ko';
				break;

			case 'ja':
				this.weekdays = this.WEEKDAYS_JA;
				this.months = this.MONTHS_JA;
				this.datePostfix = this.POSTFIX_JA;
				this.descPrevYear = this.DESC_PREVYEAR_JA;
				this.descNextYear = this.DESC_NEXTYEAR_JA;
				this.descPrevMonth = this.DESC_PREVMONTH_JA;
				this.descNextMonth = this.DESC_NEXTMONTH_JA;
				this.descClose = this.DESC_CLOSE_JA;
				this.descYearSelect = this.DESC_YEARSELECT_JA;
				this.descMonthSelect = this.DESC_MONTHSELECT_JA;
				this.descMonthSummary = this.DESC_MONTH_SUMMARY_JA;
				this.descMonthCaption = this.DESC_MONTH_CAPTION_JA;
				this.descDaySummary = this.DESC_DAY_SUMMARY_JA;
				this.descDayCaption = this.DESC_DAY_CAPTION_JA;
				this.descTodayBtn = this.DESC_TODAY_BTN_JA;
				this.localeInfo = 'ja';
				break;

			case 'zh':
				this.weekdays = this.WEEKDAYS_ZH;
				this.months = this.MONTHS_ZH;
				this.datePostfix = this.POSTFIX_ZH;
				this.descPrevYear = this.DESC_PREVYEAR_ZH;
				this.descNextYear = this.DESC_NEXTYEAR_ZH;
				this.descPrevMonth = this.DESC_PREVMONTH_ZH;
				this.descNextMonth = this.DESC_NEXTMONTH_ZH;
				this.descClose = this.DESC_CLOSE_ZH;
				this.descYearSelect = this.DESC_YEARSELECT_ZH;
				this.descMonthSelect = this.DESC_MONTHSELECT_ZH;
				this.descMonthSummary = this.DESC_MONTH_SUMMARY_ZH;
				this.descMonthCaption = this.DESC_MONTH_CAPTION_ZH;
				this.descDaySummary = this.DESC_DAY_SUMMARY_ZH;
				this.descDayCaption = this.DESC_DAY_CAPTION_ZH;
				this.descTodayBtn = this.DESC_TODAY_BTN_ZH;
				this.localeInfo = 'zh';
				break;

			default:
				this.weekdays = this.WEEKDAYS_KO;
				this.months = this.MONTHS_KO;
				this.datePostfix = this.POSTFIX_KO;
				this.descPrevYear = this.DESC_PREVYEAR_KO;
				this.descNextYear = this.DESC_NEXTYEAR_KO;
				this.descPrevMonth = this.DESC_PREVMONTH_KO;
				this.descNextMonth = this.DESC_NEXTMONTH_KO;
				this.descClose = this.DESC_CLOSE_KO;
				this.descYearSelect = this.DESC_YEARSELECT_KO;
				this.descMonthSelect = this.DESC_MONTHSELECT_KO;
				this.descMonthSummary = this.DESC_MONTH_SUMMARY_KO;
				this.descMonthCaption = this.DESC_MONTH_CAPTION_KO;
				this.descDaySummary = this.DESC_DAY_SUMMARY_KO;
				this.descDayCaption = this.DESC_DAY_CAPTION_KO;
				this.descTodayBtn = this.DESC_TODAY_BTN_KO;
				this.localeInfo = 'ko';
			}
		},

		/**
		 * 특정 style을 적용하기 위한 날짜들의 정보를 저장.
		 * 
		 * @param {json}
		 *            param : option값, 'certainDates' key에 날짜정보들이 존재.
		 */
		setCertainDates: function(param) {

			if ($.alopex.util.isValid(param) && param.hasOwnProperty('certainDates')) {
				this.certainDates = param.certainDates;
			}
		},

		setThemeClass: function(param) {

			if ($.alopex.util.isValid(param) && param.hasOwnProperty('themeClass')) {
				this.datePickerTheme = param.themeClass;
			}
		},

		setInline: function(param) {
			if ($.alopex.util.isValid(param) && param.hasOwnProperty('inline')) {
				this.inline = param.inline;
			}
		},

		setMenuSelect: function(param) {
			if ($.alopex.util.isValid(param) && 
					(param.hasOwnProperty('selectyear') || param.hasOwnProperty('selectmonth') 
							|| param.hasOwnProperty('selectYear') || param.hasOwnProperty('selectMonth'))) {
				this.selectyear = param.selectyear || param.selectYear;
				this.selectmonth = param.selectmonth || param.selectMonth;
			}
		},

		setPickerType: function(param) {
			if ($.alopex.util.isValid(param) && (param.hasOwnProperty('pickertype') || param.hasOwnProperty('pickerType'))) {
				this.pickertype = param.pickertype || param.pickerType;
			}
		},
		
		setShowOtherMonth: function(param) {
			if ($.alopex.util.isValid(param) && (param.hasOwnProperty('showOtherMonth') || param.hasOwnProperty('showOthermonth') || param.hasOwnProperty('showotherMonth') || param.hasOwnProperty('showothermonth'))) {
				this.showothermonth = param.showOtherMonth || param.showOthermonth || param.showotherMonth || param.showothermonth;
			}
		},
		
		setShowBottom: function(param) {
			if ($.alopex.util.isValid(param) && (param.hasOwnProperty('showBottom') || param.hasOwnProperty('showbottom'))) {
				this.showbottom = param.showBottom || param.showbottom;
			}
		},

		setBottomDate: function(param) {
		  if ($.alopex.util.isValid(param) && (param.hasOwnProperty('bottomDate') || param.hasOwnProperty('bottomdate'))) {
		    this.bottomdate = param.bottomDate || param.bottomdate;
		  }
		},

		setWeekPeriod: function(param) {
		  if ($.alopex.util.isValid(param) && (param.hasOwnProperty('weekPeriod') || param.hasOwnProperty('weekperiod'))) {
		    this.weekperiod = param.weekPeriod || param.weekperiod;
		  }
		},

		setCloseCallback: function(param) {
			if ($.alopex.util.isValid(param) && param.hasOwnProperty('closeCallback')) {
				this.closeCallback = param.closeCallback;
			}
		},

		setMinDate: function(param) {
			var now = new Date();
			if ($.alopex.util.isValid(param) && ($.alopex.util.isValid(param.mindate) || ($.alopex.util.isValid(param.minDate)))) {
				this.mindate = param.mindate || param.minDate;
				this.mindate.setHours(0);
				this.mindate.setMinutes(0);
				this.mindate.setMilliseconds(0);
			} else if (this.selectyear) {
				this.mindate = new Date(now.getFullYear() - 10, 0, 1, 0, 0, 0);
			} else {
				this.mindate = new Date(now.getFullYear() - 100, 0, 1, 0, 0, 0);
			}
			//      if(this.currentDate < this.mindate){
			//        this.currentDate = this.mindate;
			//      }
		},

		setMaxDate: function(param) {
			var now = new Date();
			if ($.alopex.util.isValid(param) && ($.alopex.util.isValid(param.maxdate) || ($.alopex.util.isValid(param.maxDate)))) {
				this.maxdate = param.maxdate || param.maxDate;
				this.maxdate.setHours(0);
				this.maxdate.setMinutes(0);
				this.maxdate.setMilliseconds(0);
			} else if (this.selectyear) {
				this.maxdate = new Date(now.getFullYear() + 10, 11, 31, 0, 0, 0);
			} else {
				this.maxdate = new Date(now.getFullYear() + 100, 11, 31, 0, 0, 0);
			}
			//      if(this.maxdate < this.currentDate){
			//        this.currentDate = this.maxdate;
			//      }

			//mindate가 maxdate 보다 클 경우 둘 다 default로 초기화
			if (this.maxdate < this.mindate) {
				if (this.selectyear) {
					this.mindate = new Date(now.getFullYear() - 10, 0, 1, 0, 0, 0);
					this.maxdate = new Date(now.getFullYear() + 10, 11, 31, 0, 0, 0);
				} else {
					this.mindate = new Date(now.getFullYear() - 100, 0, 1, 0, 0, 0);
					this.maxdate = new Date(now.getFullYear() + 100, 11, 31, 0, 0, 0);
				}
			}
		},

		/**
		 * 전달받은 날짜가 특정 날짜의 정보에 저장된 날짜인지 확인. true이면
		 * 전달받은 type에 따라 해당 값을 return, 저장된 날짜가 아니면 false return.
		 *
		 * @param {number} day : 특정 날짜 정보를 조회 할 날짜일수.
		 * @param {string} type : true일 경우 return할 key 값('name' | 'styleClass').
		 * @return {date | boolean false} 저장된 날짜가 아니면 false return.
		 */
		_isCertainDate: function(day) {
		  for ( var i = 0; i < this.certainDates.length; i++) {
		    var certainDateInfo = this.certainDates[i];
		    for ( var j = 0; j < certainDateInfo.dates.length; j++) {
		      if (this.currentYearView === certainDateInfo.dates[j].getFullYear() && this.currentMonthView === certainDateInfo.dates[j].getMonth() && Number(day) === certainDateInfo.dates[j].getDate()) {
		        return certainDateInfo;
		      }
		    }
		  }

		  return false;
		},

		_isCertainDateOtherMonth: function(day, prev) {
		  if (prev) {
		    for ( var i = 0; i < this.certainDates.length; i++) {
		      var certainDateInfo = this.certainDates[i];
		      for ( var j = 0; j < certainDateInfo.dates.length; j++) {
		        if (this.currentYearView === certainDateInfo.dates[j].getFullYear() && (this.currentMonthView-1) === certainDateInfo.dates[j].getMonth() && Number(day) === certainDateInfo.dates[j].getDate()) {
		          return certainDateInfo;
		        }
		      }
		    }
		  } else {
		    for ( var i = 0; i < this.certainDates.length; i++) {
		      var certainDateInfo = this.certainDates[i];
		      for ( var j = 0; j < certainDateInfo.dates.length; j++) {
		        if (this.currentYearView === certainDateInfo.dates[j].getFullYear() && (this.currentMonthView+1) === certainDateInfo.dates[j].getMonth() && Number(day) === certainDateInfo.dates[j].getDate()) {
		          return certainDateInfo;
		        }
		      }
		    }
		  }

		  return false;
		},

		_isBelowMinDate: function(day) {
		  var currentDate;
		  if (arguments.length === 1) {
		    currentDate = new Date(this.currentYearView, this.currentMonthView, day, 0, 0, 0);
		  } else {
		    currentDate = new Date(this.currentYearView, arguments[0], arguments[1], 0, 0, 0);
		  }
		  if (currentDate < this.mindate) {
		    return true;
		  } else {
		    return false;
		  }
		},

		_isBelowMinDateOtherMonth: function(day, prev) {
		  var currentDate;
		  if (prev) {
		    currentDate = new Date(this.currentYearView, (this.currentMonthView-1), day, 0, 0, 0);
		  } else {
		    currentDate = new Date(this.currentYearView, (this.currentMonthView+1), day, 0, 0, 0);
		  }
		  if (currentDate < this.mindate) {
		    return true;
		  } else {
		    return false;
		  }
		},

		_isAboveMaxDate: function(day) {
		  var currentDate;
		  if (arguments.length === 1) {
		    currentDate = new Date(this.currentYearView, this.currentMonthView, day, 0, 0, 0);
		  } else {
		    currentDate = new Date(this.currentYearView, arguments[0], arguments[1], 0, 0, 0);
		  }
		  if (this.maxdate < currentDate) {
		    return true;
		  } else {
		    return false;
		  }
		},

		_isAboveMaxDateOtherMonth: function(day, prev) {
		  var currentDate;
		  if (prev) {
		    currentDate = new Date(this.currentYearView, (this.currentMonthView-1), day, 0, 0, 0);
		  } else {
		    currentDate = new Date(this.currentYearView, (this.currentMonthView+1), day, 0, 0, 0);
		  }
		  if (this.maxdate < currentDate) {
		    return true;
		  } else {
		    return false;
		  }
		},

		/**
		 * formatStr에 따라 날짜 정보를 적용 한 후 지정된 callback 함수에 return.
		 * @param {json} dateObj : 날짜정보 (year, month, day).
		 * @param {string} formatStr : 날짜 format 문자열.
		 * @param {string} certainDatesName :
		 *  특정 날짜정보들의 집합 중 선택된 정보의 'name' key의 value.
		 */
		getDateByFormat: function(dateObj, formatStr, certainDatesInfo, e) {
			//return 할 (json)date. value는 string 형 임.
			var date = {
				year : dateObj.year + '',
				month : dateObj.month + '',
				day : dateObj.day + ''
			};
			var dateStr = this._getFormattedDate(dateObj, formatStr);

			this._callback(date, dateStr, certainDatesInfo.name, certainDatesInfo, e);
			if ($.alopex.util.isValid(this.closeCallback)) {
				this.closeCallback();
			}
		},
		
		/**
		 * formatStr에 따라 날짜 정보를 적용 한 후 지정된 callback 함수에 return.
		 * @param {array} dateArr : 날짜정보 어레이 (year, month, day).
		 * @param {string} formatStr : 날짜 format 문자열.
		 * @param {string} certainDatesName :
		 *  특정 날짜정보들의 집합 중 선택된 정보의 'name' key의 value.
		 */
		getWeekDateByFormat: function(dateArr, formatStr, certainDatesInfo, e) {
		  //return 할 (json)date. value는 string 형 임.
		  var dateArrObj = {
		      startdate : {
		        year : dateArr[0].year + '',
		        month : dateArr[0].month + '',
		        day : dateArr[0].day + ''
		      },
		      enddate : {
		        year : dateArr[1].year + '',
		        month : dateArr[1].month + '',
		        day : dateArr[1].day + ''
		      }
		  };

		  var dateStr = {
		      startdate : this._getFormattedDate(dateArrObj['startdate'], formatStr),
		      enddate : this._getFormattedDate(dateArrObj['enddate'], formatStr)
		  };

		  this._callback(dateArrObj, dateStr, certainDatesInfo.name, certainDatesInfo, e);
		  if ($.alopex.util.isValid(this.closeCallback)) {
		    this.closeCallback();
		  }
		},
		
		_getFormattedDate: function(dateObj, formatStr) {
			var dateStr = '';

			var param_date = new Date(dateObj.year, (dateObj.month - 1),
					dateObj.day);

			var i = 0;
			var num_y = 0; // the number of 'y'
			var num_M = 0; // the number of 'M'
			var num_d = 0; // the number of 'd'
			var num_E = 0; // the number of 'E'
			var delegator = []; // 구분자 보관
			var value_type = []; // 입력한 Format 순서에 맞게 날짜 타입 보관(년, 월, 일, 요일)
			var resultData = []; // delegator와 join하기 전의 최종 데이터

			// default formatStr 설정.
			if (!$.alopex.util.isValid(formatStr)) {
				formatStr = 'yyyyMMdd';
			}

			var value_split = formatStr.split('');
			var dividerStr = '';

			/**
			 * 해당 캐릭터가 DateFormat에 해당하는 캐릭터인지 여부 확인.
			 * 
			 * @param {string}
			 *            char : 체크할 캐릭터.
			 * @return {Boolean} DateFormat에 해당 하는 캐릭터 인지 여부.
			 */
			function isDateFormat(char) {
				if (char === 'y' || char === 'M' || char === 'd'
						|| char === 'E' || char === undefined || char === null
						|| char === '') {

					return true;
				} else {
					return false;
				}
			}

			// Format 타입 parsing
			while (i < value_split.length) {

				if (value_split[i] === 'y') {
					num_y = (formatStr.split('y').length - 1);
					i += num_y;
					value_type.push('y-' + num_y);

					if (isDateFormat(value_split[i])) {
						delegator.push('');
					}

				} else if (value_split[i] === 'M') {
					num_M = (formatStr.split('M').length - 1);
					i += num_M;
					value_type.push('M-' + num_M);

					if (isDateFormat(value_split[i])) {
						delegator.push('');
					}

				} else if (value_split[i] === 'd') {
					num_d = (formatStr.split('d').length - 1);
					i += num_d;
					value_type.push('d-' + num_d);

					if (isDateFormat(value_split[i])) {
						delegator.push('');
					}

				} else if (value_split[i] === 'E') {
					num_E = (formatStr.split('E').length - 1);
					i += num_E;
					value_type.push('E-' + num_E);

					if (isDateFormat(value_split[i])) {
						delegator.push('');
					}

				} else {
					dividerStr += value_split[i];

					if (isDateFormat(value_split[i + 1])) {
						delegator.push(dividerStr);
						dividerStr = '';
					}
					i++;
				}
			}

			// Format에 따른 Date data setting
			for (i = 0; i < value_type.length; i++) {
				var temp = value_type[i].split('-');

				switch (temp[0]) {

				case 'y': // 연도 data setting
					var temp_year = param_date.getFullYear();

					if (temp[1] === '2') { // yy
						resultData.push(temp_year.toString().substring(2, 4));
					} else if (temp[1] === '4') { // yyyy
						resultData.push(temp_year.toString());
					} else {
						resultData.push(temp_year.toString());
					}
					break;

				case 'M': // 월 data setting
					var temp_month = param_date.getMonth();

					if (temp[1] === '1') { // M
						resultData.push(temp_month + 1);

					} else if (temp[1] === '2') { // MM
						resultData.push((temp_month + 1) < 10 ? '0'
								+ (temp_month + 1) : (temp_month + 1));

					} else if (temp[1] === '3') { // MMM
						resultData.push(this._monthToStr(temp_month, false));

					} else if (temp[1] === '4') { // MMMM
						resultData.push(this._monthToStr(temp_month, true));

					} else {
						resultData.push((temp_month + 1) < 10 ? '0'
								+ (temp_month + 1) : (temp_month + 1));
					}
					break;

				case 'd': // 일 data setting
					if (this.pickertype == 'monthly') {
						break;
					}
					var temp_date = param_date.getDate();
					if (temp[1] === '1') { // d
						resultData.push(temp_date);
					} else if (temp[1] === '2') { // dd
						resultData.push(temp_date < 10 ? '0' + temp_date : temp_date);
					} else {
						resultData.push(temp_date < 10 ? '0' + temp_date : temp_date);
					}
					break;
				case 'E': // 요일 data setting
					var temp_day = param_date.getDay();
					if (temp[1] === '3') {
						resultData.push(this._dayToStr(temp_day, false));
					} else if (temp[1] === '4') {
						resultData.push(this._dayToStr(temp_day, true));
					} else {
						resultData.push(this._dayToStr(temp_day, false));
					}
					break;
				}
			}

			// 구분자와 Date data binding
			for (i = 0; i < resultData.length; i++) {
				dateStr += resultData[i];
				if (delegator.length !== 0) {
					if (i <= delegator.length) {
						dateStr += delegator[i];
					}
				}
			}
			return dateStr;
		},
		
		/**
		 * datepicker 닫기(내부 함수)
		 */
		_close: function(e) {
			var obj = null;

			if (!$.alopex.util.isValid(e)) {
				obj = this;

				if (obj.overlayElement) {
					setTimeout(function() {
						$(obj.overlayElement).remove();
					}, 300);
				}
				if (!obj.inline) {
					$(obj.targetElem).focus();
					$(obj.calendarContainer).remove();
					$.alopex.datePickerMap.removeObjectById(obj.calendarContainerId);
				}

			} else {
				obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);

				if (obj.overlayElement) {
					setTimeout(function() {
						$(obj.overlayElement).remove();
					}, 300);
				}
				if (!obj.inline) {
					$(obj.targetElem).focus();
					$(obj.calendarContainer).remove();
					$.alopex.datePickerMap.removeObjectByNode(e.currentTarget);
				}
			}

			$(window).unbind('hashchange', obj._onHashChange);
			$(window).unbind('resize', obj._resizeHandler);
			$(document.body).unbind('pressed', obj._mouseDownHandler);
			$(document.body).unbind('keydown', obj._addKeyEvent);

		},

		_addKeyEvent: function(e) {

			var that = e.data.obj;
			var currentAreaValue;
			var isCtrl = false;
			var isShift = false;

			that.currentArea = $(document.activeElement);
			currentAreaValue = $(that.currentArea)[0].value;

			//Ctrl 키 press 여부
			if (e.ctrlKey) {
				isCtrl = true;
			}

			//Shift 키 press 여부
			if (e.shiftKey) {
				isShift = true;
			}

			var code = (e.keyCode ? e.keyCode : e.which);
			var resultValue;
			switch (code) {
			case 13: //enter
			case 32: //space
				$(that.currentArea).trigger('click');

				if(!(currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' ||
            currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' ||
            $(that.currentArea).attr('data-type') === 'af-datepicker')){
          $(that.targetElem).focus();
        }

				e.preventDefault();
				e.stopPropagation();
				break;
			case 9: // click

				if (isShift) {
					if ($(that.currentArea).attr('data-type') === 'af-datepicker') {
						$(that.targetElem).focus();
						that._close();
						e.preventDefault();
					}
				} else {
					if ($(that.currentArea)[0].value === 'close') {
						$(that.calendarContainer).focus();
						e.preventDefault();
					}
				}
				break;
			case 37: //left

			  if(currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' ||
            currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' ||
            currentAreaValue === 'close' || $(that.currentArea).attr('data-type') === 'af-datepicker'){

					that.currentArea = $(that.calendarContainer).find('a.af-today');
					if ($(that.currentArea)[0] == undefined) {
            currentAreaValue = 2;
          } else {
            currentAreaValue = $(that.currentArea)[0].value;
          }
				}

				if ((currentAreaValue - 1) <= 0) {
					$(that.prevMonth).trigger('click');
					resultValue = that._getNumDaysOfMonth();
				} else {
					resultValue = currentAreaValue - 1;
				}

				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();

				e.preventDefault();
				break;
			case 39: //right

			  if(currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' ||
            currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' ||
            currentAreaValue === 'close' || $(that.currentArea).attr('data-type') === 'af-datepicker'){
          
					that.currentArea = $(that.calendarContainer).find('a.af-today');
					if ($(that.currentArea)[0] == undefined) {
            currentAreaValue = 0;
          } else {
            currentAreaValue = $(that.currentArea)[0].value;
          }
				}

				if ((currentAreaValue + 1) > that._getNumDaysOfMonth()) {
					$(that.nextMonth).trigger('click');
					resultValue = 1;
				} else {
					resultValue = currentAreaValue + 1;
				}

				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();

				e.preventDefault();
				break;
			case 38: //up

			  if ((e.target.nodeName) === 'SELECT') {
          return;
        }
        
        if(currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' ||
            currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' ||
            currentAreaValue === 'close' || $(that.currentArea).attr('data-type') === 'af-datepicker'){
          
					that.currentArea = $(that.calendarContainer).find('a.af-today');
					if ($(that.currentArea)[0] == undefined) {
            currentAreaValue = 8;
          } else {
            currentAreaValue = $(that.currentArea)[0].value;
          }
				}

				if ((currentAreaValue - 7) <= 0) {
					$(that.prevMonth).trigger('click');
					resultValue = that._getNumDaysOfMonth() + (currentAreaValue - 7);
				} else {
					resultValue = currentAreaValue - 7;
				}

				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();

				e.preventDefault();
				break;
			case 40: //down
			  if ((e.target.nodeName) === 'SELECT') {
          return;
        }
        
        if(currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' ||
            currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' ||
            currentAreaValue === 'close' || $(that.currentArea).attr('data-type') === 'af-datepicker'){
          
					that.currentArea = $(that.calendarContainer).find('a.af-today');
					if ($(that.currentArea)[0] == undefined) {
            currentAreaValue = -6;
          } else {
            currentAreaValue = $(that.currentArea)[0].value;
          }
				}
				if ((currentAreaValue + 7) > that._getNumDaysOfMonth()) {
					resultValue = (currentAreaValue + 7) - that._getNumDaysOfMonth();// should be before trigger
					$(that.nextMonth).trigger('click');
				} else {
					resultValue = currentAreaValue + 7;
				}
				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();
				e.preventDefault();
				break;
			case 27: // escape
				$(that.targetElem).focus();
				that._close();
				e.preventDefault();
				break;
			case 36: // home
				if (isCtrl) {
					that.currentYearView = that._getCurrentYear();// '연도' 라벨의 값
					that.currentMonthView = that._getCurrentMonthToInteger();// '월' 라벨의 값
					//          that.calendarYear.innerHTML = that._addLocalePostfix(that.currentYearView, 'y');
					//          that.calendarMonth.innerHTML = that._addLocalePostfix(that._getMonthToString(true), 'm');
					this.setText(this.calendarYear, this._addLocalePostfix(this.currentYearView, 'y'));
					this.setText(this.calendarMonth, this._addLocalePostfix(this._getMonthToString(true), 'm'));
					while (that.calendarBody.hasChildNodes()) {
						that.calendarBody.removeChild(that.calendarBody.lastChild);
					}
					that.calendarBody.appendChild(that._renderCalendar());
					that.currentArea = $(that.calendarContainer).find('a.af-today');
					$(that.currentArea).focus();
				} else {
					that.currentArea = $(that.calendarContainer).find('[href=#1]');
					$(that.currentArea).focus();
				}
				e.preventDefault();
				break;
			case 35: // end
				that.currentArea = $(that.calendarContainer).find('[href=#' + that._getNumDaysOfMonth() + ']');
				$(that.currentArea).focus();
				e.preventDefault();
				break;
			case 33: //pageUp

				if (currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' || currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' || currentAreaValue === 'close' ||
						$(that.currentArea).attr('data-type') === 'af-datepicker') {

					that.currentArea = $(that.calendarContainer).find('a.af-today');
					currentAreaValue = $(that.currentArea)[0].value;
				}

				if (isShift) {
					$(that.prevYear).trigger('click');

					//윤년처리 - 현재  2월 29일을 선택 중일 경우
					if (that.currentMonthView === 1 && currentAreaValue === 29) {
						resultValue = 28;
					} else {
						resultValue = currentAreaValue;
					}
				} else {
					$(that.prevMonth).trigger('click');

					if (that._getNumDaysOfMonth() < currentAreaValue) {
						resultValue = that._getNumDaysOfMonth();
					} else {
						resultValue = currentAreaValue;
					}
				}

				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();

				e.preventDefault();
				break;
			case 34: //pageDown

				if (currentAreaValue === 'prevYear' || currentAreaValue === 'nextYear' || currentAreaValue === 'prevMonth' || currentAreaValue === 'nextMonth' || currentAreaValue === 'close' ||
						$(that.currentArea).attr('data-type') === 'af-datepicker') {

					that.currentArea = $(that.calendarContainer).find('a.af-today');
					currentAreaValue = $(that.currentArea)[0].value;
				}

				if (isShift) {
					$(that.nextYear).trigger('click');

					//윤년처리 - 현재  2월 29일을 선택 중일 경우
					if (that.currentMonthView === 1 && currentAreaValue === 29) {
						resultValue = 28;
					} else {
						resultValue = currentAreaValue;
					}
				} else {
					$(that.nextMonth).trigger('click');

					if (that._getNumDaysOfMonth() < currentAreaValue) {
						resultValue = that._getNumDaysOfMonth();
					} else {
						resultValue = currentAreaValue;
					}
				}

				that.currentArea = $(that.calendarContainer).find('[href=#' + resultValue + ']');
				$(that.currentArea).focus();

				e.preventDefault();
				break;
			default:
				if (!isCtrl && !isShift) {
					$(that.targetElem).focus();
					that._close();
				}
				break;
			}

		},

		/**
		 * Locale에 따른 년, 월, 일 데이터의 postfix를 add 하여 값을 리턴함.
		 * @param {string} paramStr : postfix를 add할 대상이 되는 string data.
		 * @param {string} type : 년, 월, 일 type 명시 ( 'y' | 'm' | 'd', | 'E').
		 * @return {String} : postfix를 add한 결과 string.
		 */
		_addLocalePostfix: function(paramStr, type) {

			var resultStr = paramStr + '';

			switch (type) {
			case 'y': //year
				resultStr += this.datePostfix[0];
				break;

			case 'm': //month
				resultStr += this.datePostfix[1];
				break;

			case 'd': //day
				resultStr += this.datePostfix[2];
				break;

			}

			return resultStr;

		},

		_getCurrentYear: function() {

			return this.currentDate.getFullYear();
		},

		_getCurrentMonthToInteger: function() {

			return this.currentDate.getMonth();
		},

		_getCurrentMonthToString: function(full) {
			var date = this.currentDate.getMonth();

			return this._monthToStr(date, full);
		},

		_getCurrentDay: function() {
			return this.currentDate.getDate();
		},

		_getMonthToInteger: function() {

			return this.currentMonthView;
		},

		_getMonthToString: function(full) {

			var date = this.currentMonthView;

			return this._monthToStr(date, full);
		},

		/**
		 * 각 월의 일수를 return - 윤년 계산(2월).
		 * @return {number} 각 월의 일수.
		 */
		_getNumDaysOfMonth: function(year, month) {
		  if ($.alopex.util.isValid(year) && $.alopex.util.isValid(month)) {
		    return (month === 1 && !(year & 3) && (year % 1e2 || !(year % 4e2))) ? 29 : this.daysInMonth[month];
		  } else {
		    return (this._getMonthToInteger() === 1 && !(this.currentYearView & 3) && (this.currentYearView % 1e2 || !(this.currentYearView % 4e2))) ? 29 : this.daysInMonth[this._getMonthToInteger()];
		  }
		},

//		_getNumDaysOfMonth: function() {
//		  
//		  return (this._getMonthToInteger() === 1 && !(this.currentYearView & 3) && (this.currentYearView % 1e2 || !(this.currentYearView % 4e2))) ? 29 : this.daysInMonth[this._getMonthToInteger()];
//		},

		/**
		 * html element 동적 rendering
		 *
		 * @param {string} nodeName rendering할 html태그명.
		 * @param {json} attributes html 태그의 속성 : value.
		 * @param {string} content html 태그 내의 내용(innerHTML).
		 * @return {html} rendering된 html.
		 */
		_render: function(nodeName, attributes, content) {
			var element;

			if (!(nodeName in this._renderCache)) {
				this._renderCache[nodeName] = document.createElement(nodeName);
			}

			element = this._renderCache[nodeName].cloneNode(false);

			if (attributes !== null) {
				for ( var attribute in attributes) {
					element[attribute] = attributes[attribute];
				}
			}

			if (content !== null && content !== undefined) {
				if (typeof (content) === 'object') {
					element.appendChild(content);
				} else {
					element.innerHTML = content;
				}
			}

			return element;
		},

		_monthToStr: function(date, full) {
			return ((full === true) ? this.months[date] : ((this.months[date].length > 3) ? this.months[date].substring(0, 3) : this.months[date]));
		},

		_dayToStr: function(date, full) {
			return ((full === true) ? this.weekdays[date] : ((this.weekdays[date].length > 3) ? this.weekdays[date].substring(0, 3) : this.weekdays[date]));
		},

		/**
		 *
		 * 연도 컨트롤 버튼의 click 시
		 * - 1900~2100년의 범위만 허용
		 */
		_clickYear: function() {

			if (this.currentYearView < 1900) {

				//허용 범위 중 Minimum
				this.currentYearView = 1900;
			} else if (this.currentYearView > 2100) {

				//허용 범위 중 Maximum
				this.currentYearView = 2100;
			}

			//min, max date 처리
			if (this.currentYearView === this.mindate.getFullYear() && this.currentMonthView < this.mindate.getMonth()) {
				this.currentMonthView = this.mindate.getMonth();
			}

			if (this.currentYearView === this.maxdate.getFullYear() && this.maxdate.getMonth() < this.currentMonthView) {
				this.currentMonthView = this.maxdate.getMonth();
			}

			//      this.calendarYear.innerHTML = this._addLocalePostfix(
			//          this.currentYearView, 'y');
			//      this.calendarMonth.innerHTML = this._addLocalePostfix(this
			//          ._getMonthToString(true), 'm');
			this.setText(this.calendarYear, this._addLocalePostfix(this.currentYearView, 'y'));
			if (this.calendarMonth) { // not available in month picker
				this.setText(this.calendarMonth, this._addLocalePostfix(this._getMonthToString(true), 'm'));
			}

			while (this.calendarBody.hasChildNodes()) {
				this.calendarBody.removeChild(this.calendarBody.lastChild);
			}
			if (this.pickertype === 'daily' || this.pickertype === 'weekly') {
				// '일' 영역 rendering
				this.calendarBody.appendChild(this._renderCalendar());
			} else if (this.pickertype === 'monthly') {
				// '월' 영역 re-rendering
				this.calendarBody.appendChild(this._renderMonth());
			} else {

			}

			return false;
		},

		setText: function(targetEl, value) {
			if (targetEl.tagName.toLowerCase() === 'input' || targetEl.tagName.toLowerCase() === 'select') {
				$(targetEl).val(value);
			} else {
				$(targetEl).text(value);
			}
		},

		/**
		 * 월 컨트롤 버튼의 click 시
		 */
		_clickMonth: function() {

			if (this.currentMonthView < 0) {
				this.currentYearView--;

				if (this.currentYearView < 1900) {
					this.currentYearView = 1900;
				}

				// '12월' 부터 다시 시작.
				this.currentMonthView = 11;

				this.setText(this.calendarYear, this._addLocalePostfix(this.currentYearView, 'y'));
				this.setText(this.calendarMonth, this._addLocalePostfix(this._getMonthToString(true), 'm'));
				//        this.calendarYear.innerHTML = this._addLocalePostfix(
				//            this.currentYearView, 'y');
				//        this.calendarMonth.innerHTML = this._addLocalePostfix(this
				//            ._getMonthToString(true), 'm');

			} else if (this.currentMonthView > 11) {
				this.currentYearView++;

				if (this.currentYearView > 2100) {
					this.currentYearView = 2100;
				}

				// '1월' 부터 다시 시작.
				this.currentMonthView = 0;

				//        this.calendarYear.innerHTML = this._addLocalePostfix(
				//            this.currentYearView, 'y');
				//        this.calendarMonth.innerHTML = this._addLocalePostfix(this
				//            ._getMonthToString(true), 'm');
				this.setText(this.calendarYear, this._addLocalePostfix(this.currentYearView, 'y'));
				this.setText(this.calendarMonth, this._addLocalePostfix(this._getMonthToString(true), 'm'));

			} else {
				//        this.calendarMonth.innerHTML = this._addLocalePostfix(this
				//            ._getMonthToString(true), 'm');
				this.setText(this.calendarMonth, this._addLocalePostfix(this._getMonthToString(true), 'm'));
			}

			// '일' 영역 re-rendering
			while (this.calendarBody.hasChildNodes()) {
				this.calendarBody.removeChild(this.calendarBody.lastChild);
			}
			this.calendarBody.appendChild(this._renderCalendar());

			return false;
		},

		/**
		 * 연도 컨트롤 버튼의 click handler 설정.
		 */
		_bindYearHandler: function() {
			var that = this;

			$(that.prevYear).unbind('click');
			$(that.nextYear).unbind('click');
			$(that.prevYear).children().unbind('focus');
			$(that.prevYear).children().unbind('focusout');
			$(that.nextYear).children().unbind('focus');
			$(that.nextYear).children().unbind('focusout');

			//mindate의 year가 현재 year와 같을 경우
			if (that.mindate.getFullYear() === that.currentYearView) {
				$.alopex.widget.object._addDisabledStyle($(that.prevYear).children());

			} else {
				$.alopex.widget.object._removeDisabledStyle($(that.prevYear).children());

				$(that.prevYear).bind('click', function(e) {
					var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
					obj.currentYearView--;
					return obj._clickYear();
				});

				$(that.prevYear).children().bind('focus', function(e) {
					$(this).trigger('hoverstart');
				});

				$(that.prevYear).children().bind('focusout', function(e) {
					$(this).trigger('hoverend');
				});

				$.alopex.widget.object.addPressHighlight($(that.prevYear).children()[0]);
				$.alopex.widget.object.addHoverHighlight($(that.prevYear).children()[0]);
			}

			//maxdate의 year가 현재 year와 같을 경우
			if (this.maxdate.getFullYear() === this.currentYearView) {
				$.alopex.widget.object._addDisabledStyle($(that.nextYear).children());

			} else {
				$.alopex.widget.object._removeDisabledStyle($(that.nextYear).children());

				$(that.nextYear).bind('click', function(e) {
					var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
					obj.currentYearView++;
					return obj._clickYear();
				});

				$(that.nextYear).children().bind('focus', function(e) {
					$(this).trigger('hoverstart');
				});

				$(that.nextYear).children().bind('focusout', function(e) {
					$(this).trigger('hoverend');
				});

				$.alopex.widget.object.addPressHighlight($(that.nextYear).children()[0]);
				$.alopex.widget.object.addHoverHighlight($(that.nextYear).children()[0]);
			}

		},

		/**
		 * 월 컨트롤 버튼의 click handler 설정.
		 */
		_bindMonthHandler: function() {
			var that = this;

			if (this.pickertype !== 'daily' && this.pickertype !== 'weekly') {
				return;
			}

			$(that.prevMonth).unbind('click');
			$(that.nextMonth).unbind('click');
			$(that.prevMonth).children().unbind('focus');
			$(that.prevMonth).children().unbind('focusout');
			$(that.nextMonth).children().unbind('focus');
			$(that.nextMonth).children().unbind('focusout');

			//mindate의 month가 현재 month와 같을 경우
			if (this.mindate.getMonth() === this.currentMonthView && this.mindate.getFullYear() === this.currentYearView) {
				$.alopex.widget.object._addDisabledStyle($(that.prevMonth).children());

			} else {
				$.alopex.widget.object._removeDisabledStyle($(that.prevMonth).children());

				$(that.prevMonth).bind('click', function(e) {
					var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
					obj.currentMonthView--;
					return obj._clickMonth();
				});

				$(that.prevMonth).children().bind('focus', function(e) {
					$(this).trigger('hoverstart');
				});

				$(that.prevMonth).children().bind('focusout', function(e) {
					$(this).trigger('hoverend');
				});

				$.alopex.widget.object.addPressHighlight($(that.prevMonth).children()[0]);
				$.alopex.widget.object.addHoverHighlight($(that.prevMonth).children()[0]);
			}

			//maxdate의 month가 현재 month와 같을 경우
			if (this.maxdate.getMonth() === this.currentMonthView && this.maxdate.getFullYear() === this.currentYearView) {
				$.alopex.widget.object._addDisabledStyle($(that.nextMonth).children());

			} else {
				$.alopex.widget.object._removeDisabledStyle($(that.nextMonth).children());

				$(that.nextMonth).bind('click', function(e) {
					var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
					obj.currentMonthView++;
					return obj._clickMonth();
				});

				$(that.nextMonth).children().bind('focus', function(e) {
					$(this).trigger('hoverstart');
				});

				$(that.nextMonth).children().bind('focusout', function(e) {
					$(this).trigger('hoverend');
				});

				$.alopex.widget.object.addPressHighlight($(that.nextMonth).children()[0]);
				$.alopex.widget.object.addHoverHighlight($(that.nextMonth).children()[0]);
			}
		},

		/**
		 * 일 버튼의 click handler 설정.
		 */
		_bindDayHandler: function() {
			var that = this;
			var i, x;

			function isValidAnchor(element) {
				if (element.innerHTML === '') {
					return false;
				}
				if (element.className.indexOf('af-disabled Disabled') !== -1) {
					return false;
				}
				return true;
			}

			function _focusHandler(e) {
				if (!isValidAnchor(e.currentTarget)) {
					return false;
				}
				$(this).trigger('hoverstart');
			}
			function _focusoutHandler(e) {
				if (!isValidAnchor(e.currentTarget)) {
					return false;
				}
				$(this).trigger('hoverend');
			}

			function _clickHandler(e) {
			  if (!isValidAnchor(e.currentTarget)) {
			    e.preventDefault();
			    e.stopPropagation();
			    return false;
			  }
			  var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
			  var date;
			  var dateArr = [];
			  if (obj.pickertype === 'daily') {
			    if ($(e.currentTarget).attr('href').indexOf('next') == 1) {
			      date = {
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView + 2,
			        'day': this.innerHTML
			      };
			    } else if ($(e.currentTarget).attr('href').indexOf('prev') == 1) {
			      date = {
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView,
			        'day': this.innerHTML
			      };
			    } else {
			      date = {
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView + 1,
			        'day': this.innerHTML
			      };
			    }
			  } else if (obj.pickertype === 'monthly') {
			    date = {
			      'year': obj.currentYearView,
			      'month': this.month,
			      'day': 1
			    };
			  } else if (obj.pickertype === 'weekly') {

			    if ($(this).find('a').eq(0).attr('href').indexOf('prev') == 1){
			      dateArr.push({
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView,
			        'day': $(this).find('a').eq(0).text()
			      });
			    } else {
			      dateArr.push({
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView + 1,
			        'day': $(this).find('a').eq(0).text()
			      });
			    }

			    if ($(this).find('a').eq(6).attr('href').indexOf('next') == 1){
			      dateArr.push({
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView + 2,
			        'day': $(this).find('a').eq(6).text()
			      });
			    } else {
			      dateArr.push({
			        'year': obj.currentYearView,
			        'month': obj.currentMonthView + 1,
			        'day': $(this).find('a').eq(6).text()
			      });
			    }
			  }
			  e.preventDefault();
			  e.stopPropagation();

			  var certainDatesInfo = true;
			  if (obj.pickertype === 'weekly') {
			    for(var i=0;i<$(this).find('a').length;i++) {
			      certainDatesInfo = that._isCertainDate($(this).find('a').eq(i).text());
			      if (certainDatesInfo) {
			        break;
			      }
			    }

			    if (certainDatesInfo) {
			      obj.getWeekDateByFormat(dateArr, obj.dateFormat, certainDatesInfo, e);
			    } else {
			      obj.getWeekDateByFormat(dateArr, obj.dateFormat, false, e);
			    }
			  } else {
			    certainDatesInfo = that._isCertainDate(this.innerHTML);

			    if (certainDatesInfo) {
			      obj.getDateByFormat(date, obj.dateFormat, certainDatesInfo, e);
			    } else {
			      obj.getDateByFormat(date, obj.dateFormat, false, e);
			    }
			  }

			  if (!obj.inline) {
			    if (!certainDatesInfo || certainDatesInfo.isClickToClose) {
			      obj._close(e);
			    }
			  }

			  return false;
			}

			if (this.pickertype === 'weekly') {
			  $(this.calendarBody).on('focus', 'tr', _focusHandler);
			  $(this.calendarBody).on('focusout', 'tr', _focusoutHandler);
			  $(this.calendarBody).on('click', 'tr', _clickHandler);
			  $(this.calendarBody).on('click', 'tr', function(e) {
			    return false;
			  });
			  $.alopex.widget.object.addPressHighlight(this.calendarBody, 'tr');
			  $.alopex.widget.object.addHoverHighlight(this.calendarBody, 'tr');
			} else {
			  $(this.calendarBody).on('focus', 'a', _focusHandler);
			  $(this.calendarBody).on('focusout', 'a', _focusoutHandler);
			  $(this.calendarBody).on('click', 'a', _clickHandler);
			  $(this.calendarBody).on('click', 'a', function(e) {
			    return false;
			  });

			  $.alopex.widget.object.addPressHighlight(this.calendarBody, 'a');
			  $.alopex.widget.object.addHoverHighlight(this.calendarBody, 'a');
			}


		},

		/**
		 * 요일 영역 html 생성 및 바인딩
		 * @return {html} 요일 영역의 html element.
		 */
		_renderWeekdays: function() {
			var that = this;
			var html = document.createDocumentFragment();

			for ( var i = 0; i < that.weekdays.length; i++) {

				//일요일(Sun)을 빨간색으로 표시
				if (i === 0) {
					html.appendChild(that._render('th', {
						className: 'af-datepicker-weekdays holiday Weekdays Holiday'
					}, that.weekdays[i].substring(0, 3)));
				} else if (i !== 0 && i % 6 === 0) {
					html.appendChild(that._render('th', {
						className: 'af-datepicker-weekdays saturday Weekdays Sat'
					}, that.weekdays[i].substring(0, 3)));
				} else {
					html.appendChild(that._render('th', {
						className: 'af-datepicker-weekdays Weekdays'
					}, that.weekdays[i].substring(0, 3)));
				}
			}
			return html;
		},

		/**
		 * 분기 영역 구성.
		 * @return {html} '월'영역을 구성한 html element.
		 */
		_renderQtrly: function() {
			return '';
		},

		/**
		 * 월 영역 구성.
		 * @return {html} '월'영역을 구성한 html element.
		 */
		_renderMonth: function() {
			var i = 0, j = 0, rowNum = 3, colNum = 4, thismonth;
			var html = document.createDocumentFragment();
			for (; i < rowNum; i++) {
				var row = this._render('tr', {
					className: 'af-datepicker-tableRow Row'
				}, '');
				for (j = 0; j < colNum; j++) {
					thismonth = i * 4 + j;

					var month = this._render('a', {
						month: thismonth + 1,
						className: 'af-datepicker-month Month' + ((this._getCurrentMonthToInteger() == thismonth) ? ' af-today Today' : ''),
						href: '#' + (i + j + 1)
					}, this._addLocalePostfix(this._monthToStr(thismonth, true), 'm'));
					if (this._isBelowMinDate(thismonth, 1) || this._isAboveMaxDate(thismonth, 1)) {
						$.alopex.widget.object._addDisabledStyle(month);
						$(month).attr('tabindex', '-1');
					}
					row.appendChild(this._render('td', {
						className: 'af-datepicker-tableCell Cell'
					}, month));
				}
				html.appendChild(row);
			}
			
			this._bindYearHandler();
			this._bindMonthHandler();

			return html;
		},

		/**
		 * 일 영역 구성.
		 * @return {html} '일'영역을 구성한 html element.
		 */
		_renderCalendar: function() {

			var firstOfMonth = new Date(this.currentYearView, this.currentMonthView, 1).getDay();
			var numDays = this._getNumDaysOfMonth();
			var dayCount = 0;
			var html = document.createDocumentFragment();
			var row = this._render('tr');
			var element, i;

			//첫번째 일 이전의 이전달 '일' 영역에 대한 공백
			if (this.showothermonth) {
        // 전월 날짜가져오기
			  var year = this.currentYearView;
			  var prevMonth = this.currentMonthView - 1;
			  if (prevMonth === -1) {
			    prevMonth = 11;
			    year = year - 1;
			  }
			  var prevNumDays = this._getNumDaysOfMonth(year, prevMonth);

			  var prevMonthDay = prevNumDays - firstOfMonth + 1;
			  for (i = 1; i <= firstOfMonth; i++) {
			    element = this._render('td', {
			      className : 'af-datepicker-tableCell Cell'
			    }, this._render('a', {
			      className : 'af-datepicker-prev-month-day PrevMonthDay',
			      value : prevMonthDay,
			      href : '#prev' + prevMonthDay
			    }, prevMonthDay));

			    var certainDateInfo = this._isCertainDateOtherMonth(prevMonthDay, true);

			    if (certainDateInfo) {
			      $(element).children().addClass(certainDateInfo.styleClass);
			    }

			    if (this._isBelowMinDateOtherMonth(prevMonthDay, true) || this._isAboveMaxDateOtherMonth(prevMonthDay, true)) {
			      $.alopex.widget.object._addDisabledStyle($(element).children());
			      $(element).children().attr('tabindex', '-1');
			    }

			    row.appendChild(element);
          
          prevMonthDay++;
          dayCount++;
        }
      } else {
        for (i = 1; i <= firstOfMonth; i++) {
          row.appendChild(this._render('td', {
            className : 'af-datepicker-tableCell Cell'
          }, '&nbsp;'));
          dayCount++;
        }
      }

			for (i = 1; i <= numDays; i++) {

				if (dayCount === 7) {
					html.appendChild(row);
					row = this._render('tr');
					dayCount = 0;
				}

				//일요일일때 날짜를 빨간색으로 표시
				if (dayCount === 0) {
					element = this
							._render(
									'td',
									{
										className: 'af-datepicker-tableCell Cell'
									},
									this
											._render(
													'a',
													{
														className: (i === this._getCurrentDay() && this.currentMonthView === this._getCurrentMonthToInteger() && this.currentYearView === this._getCurrentYear()) ? 'af-datepicker-day af-today Day Today'
																: 'af-datepicker-day holiday Day Holiday',
														value: i,
														href: '#' + i
													}, i));
				} else if (dayCount === 6) {
					element = this
							._render(
									'td',
									{
										className: 'af-datepicker-tableCell Cell'
									},
									this
											._render(
													'a',
													{
														className: (i === this._getCurrentDay() && this.currentMonthView === this._getCurrentMonthToInteger() && this.currentYearView === this._getCurrentYear()) ? 'af-datepicker-day af-today Day Today'
																: 'af-datepicker-day saturday Day Sat',
														value: i,
														href: '#' + i
													}, i));
				} else {
					element = this
							._render(
									'td',
									{
										className: 'af-datepicker-tableCell Cell'
									},
									this
											._render(
													'a',
													{
														className: (i === this._getCurrentDay() && this.currentMonthView === this._getCurrentMonthToInteger() && this.currentYearView === this._getCurrentYear()) ? 'af-datepicker-day af-today Day Today'
																: 'af-datepicker-day Day',
														value: i,
														href: '#' + i
													}, i));
				}

				var certainDateInfo = this._isCertainDate(i);

				if (certainDateInfo) {
				  $(element).children().addClass(certainDateInfo.styleClass);
				}

				if (this._isBelowMinDate(i) || this._isAboveMaxDate(i)) {
				  $.alopex.widget.object._addDisabledStyle($(element).children());
				  $(element).children().attr('tabindex', '-1');
				}

				row.appendChild(element);

				dayCount++;
			}

			//마지막 일 이후의 다음달 '일' 영역에 대한 공백
			if (this.showothermonth) {
			  for (i = 1; i <= (7 - dayCount); i++) {
			    element = this._render('td', {
			      className : 'af-datepicker-tableCell Cell'
			    }, this._render('a', {
			      className : 'af-datepicker-next-month-day NextMonthDay',
			      value : i,
			      href : '#next' + i
			    }, i));

			    var certainDateInfo = this._isCertainDateOtherMonth(i, false);

			    if (certainDateInfo) {
			      $(element).children().addClass(certainDateInfo.styleClass);
			    }

			    if (this._isBelowMinDateOtherMonth(i, false) || this._isAboveMaxDateOtherMonth(i, false)) {
			      $.alopex.widget.object._addDisabledStyle($(element).children());
			      $(element).children().attr('tabindex', '-1');
			    }

			    row.appendChild(element);
			  }
			} else {
			  for (i = 1; i <= (7 - dayCount); i++) {
			    row.appendChild(this._render('td', {
			      className : 'af-datepicker-tableCell Cell'
			    }, '&nbsp;'));
			  }
			}

			html.appendChild(row);

			this._bindYearHandler();
			this._bindMonthHandler();

			return html;
		},
		
		/**
     * Bottom 영역 구성.
     * @return {element} Bottom 영역을 구성한 element.
     */
		_renderBottom: function(bottomDate) {
		  var element = this._render('div',{
		    className: 'af-datepicker-bottom Bottom'
		  });

		  var childEl = this._render('div',{
		    className: 'af-datepicker-childbottom ChildBottom'
		  });
		  element.appendChild(childEl);

		  var todayButton = this._render('button',{
		    className: 'af-datepicker-bottom-button BottomButton'
		  }, this.descTodayBtn);
		  childEl.appendChild(todayButton);

		  function _todayButtonTapHandler(e) {
		    var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
		    var date = {};

		    e.preventDefault();
		    e.stopPropagation();

		    if ($.alopex.util.isValid(bottomDate)) {
		      date = {
		          'year': bottomDate.getFullYear(),
		          'month': bottomDate.getMonth() + 1,
		          'day': bottomDate.getDate()
		      };
		    } else {
		      var currentDate = new Date();
		      date = {
		          'year': currentDate.getFullYear(),
		          'month': currentDate.getMonth() + 1,
		          'day': currentDate.getDate()
		      };
		    }
		    obj.getDateByFormat(date, obj.dateFormat, false);

		    if (!obj.inline) {
		      obj._close(e);
		    }
		    return false;
		  }

		  var date = {};
		  if ($.alopex.util.isValid(bottomDate)) {
		    date = {
		        'year': bottomDate.getFullYear(),
		        'month': bottomDate.getMonth() + 1,
		        'day': bottomDate.getDate()
		    };
		  } else {
		    var currentDate = new Date();
		    date = {
		        'year': currentDate.getFullYear(),
		        'month': currentDate.getMonth() + 1,
		        'day': currentDate.getDate()
		    };
		  }
		  var bottomText = this._render('span',{
		    className: 'af-datepicker-bottom-text BottomText'
		  }, this._getFormattedDate(date, this.dateFormat));
		  childEl.appendChild(bottomText);
		  
	    $(todayButton).bind('click', _todayButtonTapHandler);
		  
		  return element;
		},

		/**
		 * DatePicker 초기화
		 *
		 * [Hong-HyunMin 2016.01.29] Datepicker의 위치를 option을 통해 조정 할수 있도록 해달라는 요건 처리.
		 * 해당 기능은, Right기능만을 우선으로 개발 했음.
		 * 
		 * option 에 postionRight를 추가 했음.
		 *
		 */
		_initialise: function(option) {

			var that = this;

			if (this.currentDate < this.mindate) {
				this.currentYearView = this.mindate.getFullYear();
				this.currentMonthView = this.mindate.getMonth();
			} else if (this.currentDate > this.maxdate) {
				this.currentYearView = this.maxdate.getFullYear();
				this.currentMonthView = this.maxdate.getMonth();
			} else {
				this.currentYearView = this._getCurrentYear();// '연도' 라벨의 값
				this.currentMonthView = this._getCurrentMonthToInteger();// '월' 라벨의 값
			}

			this.calendarContainer = this._render('div', {
				className: 'af-datepicker Datepicker'
			});
			if(this.pickertype === 'weekly') {
				$(this.calendarContainer).addClass('Weekly');
			}
			$(this.calendarContainer).attr('data-type', 'af-datepicker');

			if (this.inline) {
				$(this.calendarContainer).attr('data-datepicker-inline', 'true');
				$(this.calendarContainer).addClass(this.datePickerInlineTheme);
			}

			//default 테마 적용.
			$(this.calendarContainer).addClass(this.datePickerTheme);

			//중복 생성 방지를 위해 datepicker_ 를 prefix로 id 부여.
			this.calendarContainer.id = this.calendarContainerId;

			//dstepicker의 head(header) 구성
			var header = this._render('div', {
				className: 'af-datepicker-header Header'
			});

			//연도 영역
			var subheader01 = this._render('div', {
				className: ((this.pickertype === 'daily' || this.pickertype === 'weekly') ? 'af-subHeader-year SubheaderYear' : 'af-subHeader-year-wide SubheaderYearWide')
			});

			//월 영역
			var subheader02 = this._render('div', {
				className: 'af-subHeader-month SubheaderMonth'
			});

			this.prevYear = this._render('span', {
				className: 'af-prev-year PrevYear'
			}, this._render('a', {
				className: 'af-datepicker-control Control',
				value: 'prevYear',
				
				title: this.descPrevYear
			}, ''));
			if (this.selectyear) {
				var content = '';
				var curYear = this.currentYearView;
				//__ALOG(this.mindate, this.maxdate)
				var minYear = (this.mindate === null) ? curYear - 10 : this.mindate.getFullYear();
				var maxYear = (this.maxdate === null) ? curYear + 10 : this.maxdate.getFullYear();
				for ( var i = minYear; i <= maxYear; i++) {
					content += '<option';
					if (i === curYear) {
						content += ' selected';
					}
					content += '>' + this._addLocalePostfix('' + i, 'y') + '</option>';
				}

				this.calendarYear = this._render('select', {
					className: 'af-current-year-select CurrentYearSelect',
					title: this.descYearSelect
				}, '');
				$(this.calendarYear).append(content);

				$(this.calendarYear).bind('change', function(e) {
					var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
					obj.currentYearView = parseInt($(e.currentTarget).val(), 10);
					return obj._clickYear();
				});
			} else {
				this.calendarYear = this._render('span', {
					className: 'af-current-year CurrentYear'
				}, this._addLocalePostfix(this.currentYearView, 'y'));
			}
			this.nextYear = this._render('span', {
				className: 'af-next-year NextYear'
			}, this._render('a', {
				className: 'af-datepicker-control Control',
				value: 'nextYear',
				
				title: this.descNextYear
			}, ''));

			//subheader에 연도 영역 append
			subheader01.appendChild(this.prevYear);
			subheader01.appendChild(this.nextYear);
			subheader01.appendChild(this.calendarYear);
			header.appendChild(subheader01);

			if (this.pickertype === 'daily' || this.pickertype === 'weekly') {
				this.prevMonth = this._render('span', {
					className: 'af-prev-month PrevMonth'
				}, this._render('a', {
					className: 'af-datepicker-control Control',
					value: 'prevMonth',
					title: this.descPrevMonth
				}, ''));
				if (this.selectmonth) {
					var content = '';
					for ( var i = 1; i <= 12; i++) {
						content += '<option';
						if (this.months[i-1] === this._getMonthToString(true)) {
							content += ' selected';
						}
						content += '>' + this._addLocalePostfix('' + this.months[i-1], 'm') + '</option>';
					}
					this.calendarMonth = this._render('select', {
						className: 'af-current-month-select CurrentMonthSelect',
						title: this.descMonthSelect
					}, '');
					$(this.calendarMonth).append(content);
					$(this.calendarMonth).bind('change', function(e) {
						var obj = $.alopex.datePickerMap.getObjectByNode(e.currentTarget);
						if (obj.localeInfo === 'en') {
						  obj.currentMonthView = $.inArray($(e.currentTarget).val(), obj.months);
						} else {
						  obj.currentMonthView = parseInt($(e.currentTarget).val(), 10) - 1;
						}
						return obj._clickMonth();
					});
				} else {
					this.calendarMonth = this._render('span', {
						className: 'af-current-month CurrentMonth'
					}, this._addLocalePostfix(this._getMonthToString(true), 'm'));
				}

				this.nextMonth = this._render('span', {
					className: 'af-next-month NextMonth'
				}, this._render('a', {
					className: 'af-datepicker-control Control',
					value: 'nextMonth',
					
					title: this.descNextMonth
				}, ''));

				//subheader에 월 영역 append
				subheader02.appendChild(this.prevMonth);
				subheader02.appendChild(this.nextMonth);
				subheader02.appendChild(this.calendarMonth);
				header.appendChild(subheader02);
			}

			this.calendarContainer.appendChild(header);

			//inline style
			if (!this.inline) {
				this.btn_close = this._render('span', {
					className: 'af-btn-close BtnClose'
				}, this._render('a', {
					className: 'af-datepicker-control Control',
					value: 'close',
					
					title: this.descClose
				}, ''));
				$(this.btn_close).children().bind('click', function(e) { //TODO
					e.preventDefault();
					e.stopPropagation();

					that._close(e);

					return false;
				});
				$(this.btn_close).children().bind('focus', function(e) {
					$(this).trigger('hoverstart');
				});

				$(this.btn_close).children().bind('focusout', function(e) {
					$(this).trigger('hoverend');
				});

				$.alopex.widget.object.addPressHighlight($(this.btn_close).children()[0]);
				$.alopex.widget.object.addHoverHighlight($(this.btn_close).children()[0]);
			}

			if (this.pickertype === 'monthly') {
				//월 영역 생성
				var calendar = this._render('table', {
				  summary: this.descMonthSummary
				});
				var captionSpan = this._render('span', {} , this.descMonthCaption);
        captionSpan.style.cssText = 'visibility:hidden;overflow:hidden;position:absolute;'
          +'top:0;left:0;width:0;height:0;font-size:0;line-height:0;';
        var caption = this._render('caption', {} , captionSpan);
				calendar.appendChild(caption);
				this.calendarBody = this._render('tbody', {}, '');
				this.calendarBody.appendChild(this._renderMonth());
				calendar.appendChild(this.calendarBody);
				this.calendarContainer.appendChild(calendar);

			} else if (this.pickertype === 'quarterly') {

			} else {
				//일 영역 생성
				var calendar = this._render('table', {
					summary : this.descDaySummary
				});
				var captionSpan = this._render('span', {}, this.descDayCaption);
				captionSpan.style.cssText = 'visibility:hidden;overflow:hidden;position:absolute;'
						+ 'top:0;left:0;width:0;height:0;font-size:0;line-height:0;';
				var caption = this._render('caption', {}, captionSpan);
				calendar.appendChild(caption);
				var calendarHeader = this._render('thead', {}, this._render(
						'tr', {}, this._renderWeekdays()));
				calendar.appendChild(calendarHeader);
				this.calendarBody = this._render('tbody', {}, this._renderCalendar());

				calendar.appendChild(this.calendarBody);
				this.calendarContainer.appendChild(calendar);

				if (this.showbottom) {
				  var bottomElement = this._renderBottom(this.bottomdate);
				  this.calendarContainer.appendChild(bottomElement);
				}
			}

			//inline style
			if (!this.inline) {
				this.calendarContainer.appendChild(this.btn_close);
			}

			//inline style
			if (!this.inline) {
				$('body').append(this.calendarContainer);
			} else {
				$(this.targetElem).append(this.calendarContainer);
			}

			/**
			 * [Hong-HyunMin 2016.01.29] Datepicker의 위치를 option을 통해 조정 할수 있도록 해달라는 요건 처리.
			 * 
			 * option이 존재하는 경우에 
			 * 
			 */
			if($.alopex.util.isValid(option)){
				//option.postionRight 이 유효한경우에만 실행.
				if($.alopex.util.isValid(option.postionRight)){
					//option.postionRight이 true인 경우에만 실행.
					if(option.postionRight == true){
						//달력이 target element의 오른쪽 끝을 limit로 생성 되도록 함.
						this._setPostionRight(this);
					} else{
						//기본 위치.
						this._setPosition(this);
					}
				} else{
					//기본 위치.
					this._setPosition(this);
				}
			} else{
				//기본 위치.
				this._setPosition(this);
			}
		},
		
		/**
		 * [Hong-HyunMin 2016.01.29] Datepicker의 위치를 option을 통해 조정 할수 있도록 해달라는 요건 처리.
		 */
		_setPostionRight : function(obj){
			if (obj.inline) {
				return;
			}

			var dialog = $.alopex.widget.dialog;
			var zIndex = 1200;
			if (dialog !== null && window.afDialogNumber > 0) {
				zIndex = dialog.maxZindex + 1;
			}
			//for mobile phone type
			if (window.browser === 'mobile' && $(window).width() < 768) {

				var centerTop = ($(window).scrollTop()) ? $(window).scrollTop() + ($(window).height() - obj.calendarContainer.offsetHeight) / 2 : document.body.scrollTop +
						($(window).height() - obj.calendarContainer.offsetHeight) / 2;

				var centerLeft = ($(window).scrollLeft()) ? $(window).scrollLeft() + ($(window).width() - obj.calendarContainer.offsetWidth) / 2 : document.body.scrollLeft +
						($(window).width() - obj.calendarContainer.offsetWidth) / 2;

				obj.calendarContainer.style.cssText = 'display: none; position: absolute; z-index: ' + zIndex + '; top: ' + centerTop + 'px; left: ' + centerLeft + 'px;';

				if (!obj.overlayElement) {
					obj.overlayElement = document.createElement('div');
				}

				var overlayHeight = $(document).height();

				obj.overlayElement.style.cssText = 'width:100%; position:absolute;' + 'left:0; margin:0; padding:0; background:#000; opacity:0.5; z-index:1004;' + 'top:0px;' + 'height:' + overlayHeight +
						'px;';
				$('body').append(obj.overlayElement);

			} else {
				var topValue = $(obj.targetElem).offset().top + obj.targetElem.offsetHeight + 5;
				var leftValue = $(obj.targetElem).offset().left;
				
				//Calendar가 표시되어야 할 taget의 넓이, Tooltip position을 응용함.
				var baseWidth = obj.targetElem.offsetWidth;
				var parent = obj.offsetParent;
				while(parent) {
					if(parent == document.body || $(parent).css('position') === 'relative' || $(parent).css('position') === 'absolute') {
						break;
					}
					parent = parent.offsetParent;
				}
				var basePosition = $.alopex.util.getRelativePosition(obj.targetElem); // base엘리먼트의 화면 포지션..
				var coorPosition = $.alopex.util.getRelativePosition(parent); // 엘리먼트 기준.
				var baseLeft = basePosition.left - coorPosition.left;
				
				var calendarWidth = $(obj.calendarContainer).css('width');
				
				leftValue = baseLeft - calendarWidth.split('px')[0] + baseWidth;
				
				if(!$.alopex.util.isNumberType(leftValue)){
					leftValue = $(obj.targetElem).offset().left;
				}
				
				if ($(obj.calendarContainer).width() != $(window).width() &&  // datepicker 스타일이 적용안된 경우.
						(leftValue + $(obj.calendarContainer).width()) > $(window).width()) { //DatePicker가 현재window 너비 밖으로 벗어 날 경우
					leftValue -= (leftValue + $(obj.calendarContainer).width() + 10) - $(window).width();
				}
				
				if(topValue + obj.calendarContainer.offsetHeight >= $(document).height()) {
					//place datepicker upward if its bottom position exceeds document height
					topValue = $(obj.targetElem).offset().top - 5 - obj.calendarContainer.offsetHeight;
				}

				obj.calendarContainer.style.cssText = 'display: none; position: absolute; z-index:' + zIndex + '; top: ' + topValue + 'px; left: ' + leftValue + 'px;';
			}

			$(obj.calendarContainer).css('display', 'block');
		},

		_setPosition: function(obj) {

			if (obj.inline) {
				return;
			}

			var dialog = $.alopex.widget.dialog;
			var zIndex = 1200;
			if (dialog !== null && window.afDialogNumber > 0) {
				zIndex = dialog.maxZindex + 1;
			}
			//for mobile phone type
			if (window.browser === 'mobile' && $(window).width() < 768) {

				var centerTop = ($(window).scrollTop()) ? $(window).scrollTop() + ($(window).height() - obj.calendarContainer.offsetHeight) / 2 : document.body.scrollTop +
						($(window).height() - obj.calendarContainer.offsetHeight) / 2;

				var centerLeft = ($(window).scrollLeft()) ? $(window).scrollLeft() + ($(window).width() - obj.calendarContainer.offsetWidth) / 2 : document.body.scrollLeft +
						($(window).width() - obj.calendarContainer.offsetWidth) / 2;

				obj.calendarContainer.style.cssText = 'display: none; position: absolute; z-index: ' + zIndex + '; top: ' + centerTop + 'px; left: ' + centerLeft + 'px;';

				if (!obj.overlayElement) {
					obj.overlayElement = document.createElement('div');
				}

				var overlayHeight = $(document).height();

				obj.overlayElement.style.cssText = 'width:100%; position:absolute;' + 'left:0; margin:0; padding:0; background:#000; opacity:0.5; z-index:1004;' + 'top:0px;' + 'height:' + overlayHeight +
						'px;';
				$('body').append(obj.overlayElement);

			} else {
				var topValue = $(obj.targetElem).offset().top + obj.targetElem.offsetHeight + 5;
				var leftValue = $(obj.targetElem).offset().left;

				if ($(obj.calendarContainer).width() != $(window).width() &&  // datepicker 스타일이 적용안된 경우.
						(leftValue + $(obj.calendarContainer).width()) > $(window).width()) { //DatePicker가 현재window 너비 밖으로 벗어 날 경우
					leftValue -= (leftValue + $(obj.calendarContainer).width() + 10) - $(window).width();
				}
				if(topValue + obj.calendarContainer.offsetHeight >= $(document).height()) {
					//place datepicker upward if its bottom position exceeds document height
					topValue = $(obj.targetElem).offset().top - 5 - obj.calendarContainer.offsetHeight;
				}

				obj.calendarContainer.style.cssText = 'display: none; position: absolute; z-index:' + zIndex + '; top: ' + topValue + 'px; left: ' + leftValue + 'px;';
			}

			$(obj.calendarContainer).css('display', 'block');
		},

		/**
		 * 같은 DatePicker가 이미 열려있는지 체크
		 * @param {string} id : DatePicker 위치의 기준이 되는 target element의 id.
		 * @return {Boolean} : DatePicker가 현재 열려 있는지 여부.
		 */
		_isOpened: function(id) {

			var objId = 'datepicker_' + id;

			if ($.alopex.datePickerMap.datePickerObj.hasOwnProperty(objId)) {
				return true;
			} else {
				return false;
			}
		},

		_mouseDownHandler: function(e) {

			var isDatePicker = false;
			var temp = $(e.target);

			for ( var i = 0; i < 7; i++) {

				if (temp.attr('data-type') === 'af-datepicker' && temp.attr('data-datepicker-inline') !== 'true') {
					isDatePicker = true;
					break;
				}

				temp = temp.parent();
			}

			if (!isDatePicker) {
				for ( var key in $.alopex.datePickerMap.datePickerObj) {
					$.alopex.datePickerMap.datePickerObj[key]._close();
				}
			} else {
				return;
			}
		},

		_resizeHandler: function(e) {
			for ( var key in $.alopex.datePickerMap.datePickerObj) {
				$.alopex.datePickerMap.datePickerObj[key]._setPosition($.alopex.datePickerMap.datePickerObj[key]);
			}
		},

		_onHashChange: function(e) {
			for ( var key in $.alopex.datePickerMap.datePickerObj) {
				$.alopex.datePickerMap.datePickerObj[key]._close();
			}
		}

	};

	/**
	 * datepicker 열기
	 */
	$.fn.showDatePicker = function(callback, option) {

		if (!$.alopex.util.isValid(callback) || typeof (callback) !== 'function') {
			//      __ALOG('[DatePicker Error] callback is null or' + 'it is not function type');
			return;
		}

		if (!$.alopex.util.isValid(option)) {
			option = {};
		}

		for ( var key in $.alopex.datePickerMap.datePickerObj) {
			if (!option.inline) {
				$.alopex.datePickerMap.datePickerObj[key]._close();
			}
		}

		var that = $.extend(true, {}, $.alopex.datePicker);

		that.targetElem = this[0];
		that._callback = callback;
		that.calendarContainerId = 'datepicker_' + this[0].id;

		that.setDefaultDate(option);
		that.setLocale(option);
		that.setFormat(option);
		that.setCertainDates(option);
		that.setThemeClass(option);
		that.setMenuSelect(option);
		that.setMinDate(option);
		that.setMaxDate(option);
		that.setInline(option);
		that.setPickerType(option);
		if (option.pickertype === 'weekly') {
		  option.showOtherMonth = true;
		  option.showbottom = false;
		}
		that.setShowOtherMonth(option);
		that.setShowBottom(option);
		that.setBottomDate(option);
		that.setWeekPeriod(option);
		
		/**
		 * [Hong-HyunMin 2016.01.29] Datepicker의 위치를 option을 통해 조정 할수 있도록 해달라는 요건 처리.
		 * 해당 기능은, Right기능만을 우선으로 개발 했음.
		 */
		that._initialise(option);
		that._bindYearHandler();
		that._bindMonthHandler();
		that._bindDayHandler();

		//modal style
		if (!that.inline) {
			//for web or tablet type
			if (!(window.browser === 'mobile' && $(window).width() < 768)) {
				$(document.body).bind('pressed', that._mouseDownHandler);
				$(window).bind('hashchange', that._onHashChange);
			}

			$(window).bind('resize', that._resizeHandler);
			$(document.body).bind('keydown', {
				obj: that
			}, that._addKeyEvent);

			$(that.calendarContainer).attr('tabindex', 0);
			$(that.calendarContainer).focus();

			$(that.targetElem).bind('pressed', function(e) {
				e.stopPropagation();
			});
		}

		$(that.calendarContainer).bind('selectstart dragstart', function(e) {
			return false;
		});

		$.alopex.datePickerMap.setObject(that.calendarContainerId, that);
	};

	/**
	 * datepicker 닫기
	 */
	$.fn.closeDatePicker = function() {

		if ($.alopex.datePicker._isOpened(this[0].id)) {
			var obj = $.alopex.datePickerMap.getObjectById(this[0].id);
			obj._close();
		}
	};

	$.alopex.registerSetup('datePicker', function(option) {
		$.extend($.alopex.datePicker, option);
	});

})(jQuery);
(function($) {

	$.alopex.widget.daterange = $.alopex.inherit($.alopex.widget.object, {
	  widgetName: 'daterange',
	  defaultClassName: 'af-daterange Daterange',
	  setters: ['daterange', 'setEnabled', 'clear', 'refresh'],
	  getters: [],
	  
	  classNames: {
		  startdate: 'Startdate',
		  enddate: 'Enddate'
	  },

	  id_startdate: 'startdate',
	  id_enddate: 'enddate',
	  id_widget: 'daterange',

	  properties: {
	    date: new Date(),
	    format: 'yyyy-MM-dd',
	    selectyear: false,
	    selectmonth: false,
	    pickertype: 'daily',
	    autodisable: true,
	    resetbutton: false,
	    callback: null,
	    blurcallback: null,
	    placeholder: true
	  },

	  init: function(el, options) {
		  var $el = $(el);
		  el.options = $.extend(true, {}, this.properties, options);
		  $.alopex.widget.dateinput.refresh_format(el, options);
		  
		  if (el.options.pickertype == 'weekly') {
		    el.options.showothermonth = true;
		  }
		  el._start = $el.find('[data-role="' + this.id_startdate + '"], .' + this.classNames.startdate);
		  el._end = $el.find('[data-role="' + this.id_enddate + '"], .' + this.classNames.enddate);

		  el._start.attr('data-type', 'dateinput').dateinput($.extend(true, {}, el.options, {callback: this._startEventHandler}));
		  el._end.attr('data-type', 'dateinput').dateinput($.extend(true, {}, el.options, {callback: this._endEventHandler}));
//		  el._start.add(el._end).on('blur', {callback: el.options.blurcallback}, function(e) {
//		  var el = $(e.currentTarget).closest('[data-type="daterange"]')[0];
//		  e.data.callback.call(el);
//		  });
		  
		  if(el.options.resetbutton) {
		    if(el._start.length>0 && el._start[0].resetbutton && el._start[0].resetbutton.length > 0) {
		      el._start[0].resetbutton[0].daterange = el;
		    }
		    if(el._end.length>0 && el._end[0].resetbutton && el._end[0].resetbutton.length > 0) {
		      el._end[0].resetbutton[0].daterange = el;
		    }
		  }
		  this.setEnabled(el, el.options.enabled);
		},
		
		_generateDate : function(el, value) {
			var format = el.options.format;
			var seperator = format.replace('yyyy', '').replace('MM', '').replace('dd', '').substring(0, 1);
			var date, year, month, day;
			var yearStartIdx = format.indexOf('yyyy');
			var monthStartIdx = format.indexOf('MM');
			var dayStartIdx = format.indexOf('dd');
			if (el.options.pickertype === 'daily' || el.options.pickertype === 'weekly') {
				if (value.indexOf(seperator) == -1 && value.length == 8) { // 숫자만 입력한 경우.
					if (yearStartIdx > 0) {
						value = value.substr(0, 2) + seperator + value.substr(2, 2) + seperator + value.substr(4, 4);
					} else {
						value = value.substr(0, 4) + seperator + value.substr(4, 2) + seperator + value.substr(6, 2);
					}
				}
				if (!$.alopex.util.isValid(value)) {
					return new Date();
				} else if (!$.alopex.util.isValid(seperator)) {
					return new Date(value.substr(yearStartIdx, 4), Number(value.substr(monthStartIdx, 2)) - 1, value.substr(dayStartIdx, 2));
				} else {
					if (yearStartIdx > 0 && yearStartIdx > monthStartIdx) {
						year = value.split(seperator)[2];
						if (monthStartIdx == 0) {
							month = Number(value.split(seperator)[0]) - 1;
							day = value.split(seperator)[1];
						} else {
							month = Number(value.split(seperator)[1]) - 1;
							day = value.split(seperator)[0];
						}
						return new Date(year, month, day);
					} else if (yearStartIdx > 0 && yearStartIdx < monthStartIdx){
						return new Date(value.split(seperator)[1], Number(value.split(seperator)[2]) - 1, value.split(seperator)[0]);
					} else {
						year = value.split(seperator)[0];
						if (monthStartIdx > dayStartIdx) {
							month = Number(value.split(seperator)[2]) - 1;
							day = value.split(seperator)[1];
						} else {
							month = Number(value.split(seperator)[1]) - 1;
							day = value.split(seperator)[2];
						}
						return new Date(year, month, day);
					}
				}
			} else if (el.options.pickertype === 'monthly') {
				if (value.indexOf(seperator) == -1 && value.length == 6) { // 숫자만 입력한 경우.
					if (yearStartIdx > 0) {
						value = value.substr(0, 2) + seperator + value.substr(2, 4);
					} else {
						value = value.substr(0, 4) + seperator + value.substr(4, 2);
					}
				}
				if (!$.alopex.util.isValid(value)) {
					return new Date();
				} else if (!$.alopex.util.isValid(seperator)) {
					return new Date(value.substr(yearStartIdx, 4), Number(value.substr(monthStartIdx, 2)) - 1);
				} else {
					if (yearStartIdx > 0) {
						return new Date(value.split(seperator)[1], Number(value.split(seperator)[0]) - 1);
					} else {
						return new Date(value.split(seperator)[0], Number(value.split(seperator)[1]) - 1);
					}
				}
			}
		},
		// datepicker click 을 통하지 않고, 동적으로 date가 입력된 경우 체크하여 min/max date에 반영시킨다.
		_dynamicBindingCheck: function(el){
			var startDate = $(el._start).find('input').val();
			var endDate = $(el._end).find('input').val();
			var result = {};
			if ($.alopex.util.isValid(startDate)) {
				$.extend(true, result, {mindate: $a.widget.daterange._generateDate(el, startDate)});
			}else{
				// '' 값도 추가한다. 동적으로 ''값이 된 경우, 이에 맞게 min/max를 없애줘야 한다.
				$.extend(true, result, {mindate: ''});
			}
			
			if ($.alopex.util.isValid(endDate)) {
				$.extend(true, result, {maxdate: $a.widget.daterange._generateDate(el, endDate)});
			}else{
				// '' 값도 추가한다. 동적으로 ''값이 된 경우, 이에 맞게 min/max를 없애줘야 한다.
				$.extend(true, result, {maxdate: ''});
			}
			// result를 넘겨 dateinput에서 min/max를 update 해준다.
			return result;
		},
		refresh: function(el) {
		    var startDate = $(el._start).val();
		    var endDate = $(el._end).val();
		    if ($.alopex.util.isValid(endDate)) {
		      $(el._start).update({
		        'maxdate': $a.widget.daterange._generateDate(el, endDate)
		      });
		    }
		    if ($.alopex.util.isValid(startDate)) {
		      $(el._end).update({
		        'mindate': $a.widget.daterange._generateDate(el, startDate)
		      });
		    }
		},
		
		_startEventHandler: function(date, datestr, certainDatesName, certainDatesInfo, e) {
		  var el = $(this).closest('[data-type="daterange"], .'+$.alopex.config.defaultComponentClass.daterange)[0];
		  // var format = el.options.format;
		  // var seperator = format.replace('yyyy', '').replace('MM', '').replace('dd', '').substring(0,1);

		  if(el.options.autodisable) {
		    if (el.options.pickertype == 'weekly') {
		      $(el._start).findAll('input').val(datestr['startdate']);
		      $(el._end).findAll('input').val(datestr['enddate']);
		    } else {
		      var dateObj = new Date(date.year, Number(date.month)-1, date.day);
		      //var dateObj = $.alopex.widget.daterange._getDate(el, datestr, seperator);
		      el._end.update({mindate: dateObj});
		    }
		  }
		  if(el.options.callback) {
		    el.options.callback.call(el, date, datestr);
		  }
		},

		_endEventHandler: function(date, datestr, certainDatesName, certainDatesInfo, e) {
		  var el = $(this).closest('[data-type="daterange"], .'+$.alopex.config.defaultComponentClass.daterange)[0];
		  // var format = el.options.format;
		  // var seperator = format.replace('yyyy', '').replace('MM', '').replace('dd', '').substring(0,1);

		  if(el.options.autodisable) {
		    if (el.options.pickertype == 'weekly') {
		      $(el._start).findAll('input').val(datestr['startdate']);
		      $(el._end).findAll('input').val(datestr['enddate']);
		    } else {
		      var dateObj = new Date(date.year, Number(date.month)-1, date.day);
		      //var dateObj = $.alopex.widget.daterange._getDate(el, datestr, seperator);
		      el._start.update({maxdate: dateObj});
		    }
		  }

		  if(el.options.callback) {
		    el.options.callback.call(el, date, datestr, certainDatesName, certainDatesInfo, e);
		  }
		},

		setEnabled: function(el, flag) {
			flag = $.alopex.util.parseBoolean(flag);
			el._start.setEnabled(flag);
			el._end.setEnabled(flag);
		},

		clear: function(el) {
		  $(el._start).clear();
		  $(el._end).clear();
		  $(el._start).update({maxdate: ''});
		  $(el._end).update({mindate: ''});
		}
	});
	
//	$.alopex.registerSetup('daterange', function(option) {
//		$.alopex.widget.daterange.properties = option;
//	});

})(jQuery);
(function($) {

	$.alopex.widget.dialog = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'dialog',
		defaultClassName: 'af-dialog Dialog',
		maxZindex: 1001,
		dialoglist: [], // opened dialog

		properties: {
			dialogtype: null,
			animation: 'show',
			animationtime: 500,
			resizable: false,
			dialogmovable: false,
			modal: false,
			modalScroll: false,
			modalscrollhidden: true,
			modalclose: false,
			scroll: false,
			toggle: false
		},

		element: [],
		getters: [],
		setters: ['dialog', 'open', 'close', 'ok', 'cancel', 'confirm', 'reposition'],

		defer: function(el, options) {
			$(el).css('display', 'none');
		},

		init: function(el, options) {
		  var $el = $(el);
		  for ( var i in options) {
		    if (options[i] === 'true' || options[i] === 'false') {
		      options[i] = $.alopex.util.parseBoolean(options[i]);
		    }
		    if ($.alopex.util.isNumberType(options[i])) {
		      options[i] = parseInt(options[i], 10);
		    }
		  }
		  $.extend(el, this.properties, options);
		  // data-* attribute와 open 함수 호출시 parameter의 키가 다름으로 인한 처리.
		  if (el.dialogmovable) {
		    el.movable = el.dialogmovable;
		  }
		  if (el.dialogmodal) {
		    el.modal = el.dialogmodal;
		  }
		  if (el.height) {
		    $el.css('height', el.height);
		  }
		  if (el.width) {
		    $el.css('width', el.width);
		  }
		  // dialog position style은 fixed로 수정.  by YSM 20130702
		  $el.attr('style', ($el.attr('style') ? $el.attr('style') : '') + ';position:fixed;z-index:1001;opacity:0;overflow:hidden;'); 


		  //contents
		  if ($.alopex.util.isValid($el.children()[0])) {
		    el.contents = $el.children();
		  }

		  this._setDialogType(el, el.dialogtype);
		  this._setResizable(el, el.resizable);
		  this._setMovable(el, el.movable);
		  this._setModal(el, el.modal);

		  if(window.browser != 'mobile') {
		    $el.on('pressed focusin', $.alopex.widget.dialog._clickMoveToTop); // 선택된 다이얼로그가 상위로 올라오게 처리.
		    $el.on('keydown', $.alopex.widget.dialog._addKeydownEvent);
		  }

		  //origin size setting
		  el.originWidth = $el.width();
		  el.originHeight = $el.height();


		  // mobile 기기에서 키패드에 의해 다이얼로그가 가려지는 현상으로 인하여 강제 올리기.
		  if(window.browser == 'mobile') { 
		    var __dialog = el;
		    __dialog.lifted = false;
		    var iframeTop = 0;

		    function _dialog_reposition() {
		      var element = document.activeElement;
		      if(element.tagName.toLowerCase() == 'iframe') {
		        iframeTop = $(element).offset().top;
		        element = element.contentWindow.document.activeElement;
		      } else if(element.tagName.toLowerCase() == 'body') {
		        element = $(element).find(':focus');
		        if(element.length>0) {
		          element = element[0];
		        } else {
		          return false;
		        }
		      }
		      var elementTop = $.alopex.util.getPagePosition(element).top + iframeTop;
		      var elementBottom = elementTop + element.offsetHeight;
		      var currentWindowHeight = $(window).height();

		      if(elementBottom >= currentWindowHeight && // 현재 선택된 엘리먼트가 가려질때.
		          __dialog.windowheight > currentWindowHeight) { // 윈도우가 줄어 들었을
		        __dialog.liftedHeight = Math.abs(elementBottom - currentWindowHeight)+50;
		        __dialog.lifted = true;
		        $el.css('top', (parseInt(el.style.top) - __dialog.liftedHeight) + 'px');
		      } else if(__dialog.windowheight < currentWindowHeight && __dialog.lifted) {
		        $el.css('top', (parseInt(el.style.top) + __dialog.liftedHeight) + 'px');
		        __dialog.lifted = false;
		      }
		      __dialog.windowheight = currentWindowHeight;
		    }
		    $(window).on('resize', _dialog_reposition);
//		    $(el).on('focusin', function(e) {
//		    _dialog_reposition();
////	    alert('focusin');
//		    });
		  }
		},

		_addKeydownEvent: function(e) {
		  var el = e.currentTarget;
		  var $el = $(el);
		  var code = e.keyCode !== null ? e.keyCode : e.which;

		  switch (code) {
		  case 27:
		    $el.close();
		    break;
		  case 9:
		    if (el.modal) { // 모달인 경우, 다이얼로그 내의 엘리먼트 만 포커스 가도록 설정.
		      var selectorcondition = 'a[href], area[href], input:not([disabled]), select:not([disabled]), '
		        + 'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
		      if (e.shiftKey) {
		        if (document.activeElement === $(this)[0] || document.activeElement === $(this).find(selectorcondition).first()[0]) {
		          $($el.find(selectorcondition).last()).focus();
		          e.preventDefault();
		        }
		        break;
		      }
		      if (document.activeElement === $(this).find(selectorcondition).last()[0]) {
		        $($el.find(selectorcondition).first()).focus();
		        e.preventDefault();
		      }
		    }
		    break;
		  default:
		    break;
		  }
		},

		_setDialogType: function(el, type) {
		  $(el.header).remove();
		  $(el.button).remove();
		  $(el.closebtn).remove();
		  $(el.confrimbtn).remove();
		  $(el.okbtn).remove();
		  $(el.cancelbtn).remove();

		  if (type === 'blank' || type === 'close' || type === 'confirm' || type === 'okcancel') {
		    // header
		    el.header = document.createElement('div');
		    $(el.header).attr('class', 'dialog_header Header');
		    
		    var isTheme = $.alopex.util.isAlopexTheme();
		    
		    /**
		     * [Hong-HyunMin 2016.01.05] 기존에 동작하지 않았으나 2016.01.05 요청사항에 의해 동작하도록 변경.
		     * DialogToggle class는 현재 theme에만 적용되어 있음. Theme 에서만 동작 함.
		     */
		    if(el.toggle && isTheme) {
		      var togglebtn = document.createElement('button');
		      togglebtn.dialog = el;
		      $(togglebtn).attr('class', 'DialogToggle');
		      
		      /**
		       * [Hong-HyunMin 2016.01.05] toggle btn 이 클릭 되었을시..
		       */
		      $(togglebtn).click(function(e) {
		    	
		    	//펼칠때의 기준이 되는 높이
		    	var standardHeight = $.alopex.widget.dialog._dialogStandardHeight(el);
		    	
		    	//접을때의 기준이 되는 높이.
		    	var headerHeight = $.alopex.widget.dialog._dialogHeaderHeight(el);
		    	
		    	//접혀있을때.
		    	if(e.currentTarget.dialog.folded) {
		    	  //펼치기 이벤트가 완료된 이후에, scroll을 사용하는 옵션인 경우, 스크롤의 위치를 다시 재조정 해줌.
		          $(e.currentTarget.dialog).animate({height: standardHeight +'px'}, 300, function() {
		        	  if (el.scroll || (el.contents && el.contents.attr("data-dialog-scroll")) === "true") {
		        		  $.alopex.widget.dialog._calculateHeight(el);
		        	  }
		          });
		          
		          //folded 의 상태를 false 로 변경(펼쳐짐)
		          e.currentTarget.dialog.folded = false;
		          
		          //버튼의 클래스를 접혀진 클래스를 삭제.
		          $(togglebtn).removeClass('Expanded');
		        } 
		    	//펼쳐있을때
		    	else {
		          e.currentTarget.dialog.defaultHeight = $(e.currentTarget.dialog).height();
		          e.currentTarget.dialog.folded = true;
		          
		          $(e.currentTarget.dialog).animate({height: headerHeight+'px'}, 300);
		          
		          $(togglebtn).addClass('Expanded');
		        }
		       /**
			     * [Hong-HyunMin 2016.02.23] toggle btn 이 클릭 되었을시 이벤트 추가
			     */
		    	$(el).trigger('dialogToggleEnd');
		    	
		      });
		      this.addHoverHighlight(togglebtn);
		      this.addPressHighlight(togglebtn);
		      el.header.appendChild(togglebtn);
		    }

		    var closebtn = document.createElement('button');
		    //closebtn.type = 'button';
		    closebtn.dialog = el;
		    $(closebtn).attr('class', 'dialog_btn DialogBtn');		    
		    $(closebtn).attr('type', 'button');
		    var closeFlag = true;
		    $(closebtn).click(function(e) {
		    	
		    	if($.alopex.util.isValid(el.xButtonClickCallback) && typeof el.xButtonClickCallback === 'function'){
		    		closeFlag = el.xButtonClickCallback(el);
		    	}
		    	
		    	if(closeFlag){
		    		$(e.currentTarget.dialog).close();
		    	}
		      
		    });
		    this.addHoverHighlight(closebtn);
		    this.addPressHighlight(closebtn);
		    el.header.appendChild(closebtn);

		    $(el).prepend(el.header);

		    //contents
		    if ($.alopex.util.isValid(el.contents)) {
		      $.each(el.contents, function(i, elem) {
		        el.appendChild(elem);
		      });
		    }
		    
		    /**
		     * [Hong-HyunMin 2016.01.15] 기존 css와 Theme의 css 차이가 있어 변경.(close, confirm, okcancel)
		     */
		    if (type === 'close') {

		      el.button = document.createElement('div');
		      el.closebtn = document.createElement('button');
		      el.closebtn.dialog = el;
		      $(el.closebtn).text('Close');
		      
		      if(isTheme == false){
		    	  //button
			      $(el.button).attr('class', 'dialog_btn DialogBtn');
			      this.addHoverHighlight(el.button);
			      this.addPressHighlight(el.button);
			      if (!el.resizable) {
			        $(el.button).attr('style', 'padding-bottom:0px ;');
			      }
			      $(el.closebtn).attr('data-type', 'button');
			      $(el.closebtn).attr('style', 'float:right;');
		      }
		      else{
		    	  $(el.button).attr('class', 'Dialog-btnwrap');
		    	  this.addHoverHighlight(el.button);
				  this.addPressHighlight(el.button);
		    	  $(el.closebtn).attr('data-type', 'button');
			      $(el.closebtn).attr('class', 'Button Default');
		      }
		      
		      $(el.closebtn).button();
		      $(el.closebtn).on('click', function(e) {
		    	  var el = e.currentTarget.dialog;
		    	  $(el).close();
		      });

		      el.button.appendChild(el.closebtn);
		      el.appendChild(el.button);
		      
		    } else if (type === 'confirm') {
		    	
		    	el.button = document.createElement('div');
		    	el.confirmbtn = document.createElement('button');
		    	$(el.confirmbtn).text('Confirm');
			  
		    	if (isTheme == false){
		    		$(el.button).attr('class', 'dialog_btn DialogBtn');
		    		this.addHoverHighlight(el.button);
		    		this.addPressHighlight(el.button);
		    		if (!el.resizable) {
		    			$(el.button).attr('style', 'padding-bottom:0px ;');
		    		}
		    		$(el.confirmbtn).attr('data-type', 'button');
		    		$(el.confirmbtn).attr('style', 'float:right;');
		    	}
		    	else{
		    		$(el.button).attr('class', 'Dialog-btnwrap');
		    		this.addHoverHighlight(el.button);
		    		this.addPressHighlight(el.button);
		    		$(el.confirmbtn).attr('data-type', 'button');
		    		$(el.confirmbtn).attr('class', 'Button Default');
		    	}
		    	
		    	$(el.confirmbtn).button();
		    	el.button.appendChild(el.confirmbtn);
		    	el.appendChild(el.button);
		      
		    } else if (type === 'okcancel') {
		    	
		    	el.button = document.createElement('div');
		    	el.okbtn = document.createElement('button');
		    	$(el.okbtn).text('Ok');
		    	el.cancelbtn = document.createElement('button');
		    	$(el.cancelbtn).text('Cancel');
		    	if (isTheme == false){
		    		$(el.button).attr('class', 'dialog_btn DialogBtn');
		    		this.addHoverHighlight(el.button);
				    this.addPressHighlight(el.button);
				    if (!el.resizable) {
				    	$(el.button).attr('style', 'padding-bottom:0px ;');
				    }
				    $(el.okbtn).attr('data-type', 'button');
				    $(el.okbtn).attr('style', 'position: absolute;right: 80px;');
				    
				    $(el.cancelbtn).attr('data-type', 'button');
				    $(el.cancelbtn).attr('style', 'float:right;');
		    	}
		    	else{
		    		$(el.button).attr('class', 'Dialog-btnwrap');
		    		this.addHoverHighlight(el.button);
				    this.addPressHighlight(el.button);
				    $(el.okbtn).attr('data-type', 'button');
				    $(el.okbtn).attr('class', 'Button Default');
				    $(el.cancelbtn).attr('data-type', 'button');
				    $(el.cancelbtn).attr('class', 'Button Default');
		    	}
		      $(el.okbtn).button();
		      $(el.cancelbtn).button();

		      el.button.appendChild(el.okbtn);
		      el.button.appendChild(el.cancelbtn);
		      el.appendChild(el.button);
		    }
		  }
		},

		_setModal: function(el, modal) {
		  // modal 일때만 blocker 생성
		  if (!$.alopex.util.isValid(el.blocker) && modal) {
		    el.blocker = document.createElement('div');
		    el.blocker.dialog = el;
		    // [IE7] 바디영역에 block를 붙히는 경우, HTML markup의 상황에 따라 다이얼로그 z-index가 큼에도 불구하고 다이얼로그가 뒤로 이동됨.
		    // 이에 따라, block를 다이얼로그와 동일 depth에 위치.
		    //          document.body.appendChild(el.blocker);
		    //          el.parentNode.appendChild(el.blocker);
		    el.parentNode.appendChild(el.blocker);
		    $(el.blocker).addClass('af-dialog-mask ' +$.alopex.config.defaultComponentClass.dialog + '-mask');
		    $(el.blocker).css({
		      'opacity': '0.5',
		      'overflow': 'hidden',
		      'display': 'none',
		      'z-index': '999',
		      'position': 'fixed',
		      'left': '0',
		      'top': '0',
		      '-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)',
		      'width': '100%',
		      'height': '100%'
		    });
		    //TODO: blocker에서 이벤트 막아주기 위해 아래와 같이 처리하였으나, 다이얼로그에서 스크롤 이벤트 발생시 영향 있음.
		    // HTML markup 상 현재 구조에서는 어쩔수 없음. 마크업 변경 또는 다른대안 필요.
		    if (el.modalScroll == undefined || el.modalScroll !== 'true') {
		      $(el.blocker).on('touchstart touchmove', function(e) {
		        e.preventDefault();
		        e.stopPropagation();
		        return false;
		      });
		    }

		    if(el.modalclose) {
		      $(el.blocker).on('pressed', function(e) {
		        var el = e.currentTarget.dialog;
		        $(el).close();
		      });					
		    }
		  }
		},

		_setMovable: function(el, movable) {
		  var $el = $(el);
		  var dialog = $.alopex.widget.dialog;
		  if (movable && window.browser !== 'mobile') {
		    var childrenLength = $el.children().length;
		    if (childrenLength > 0) {
		      if ($.alopex.util.isValid(el.header)) {
		        $(el.header).on('pressed', this._preMoveDialog);
		        $(el.header).css('cursor', 'move');
		      } else {
		        $($el.find('[data-dialog-movecursor=true]')[0]).on('pressed', this._preMoveDialog);
		        $($el.find('[data-dialog-movecursor=true]')[0]).css('cursor', 'move');
		      }
		    }
		  } else {
		    if ($.alopex.util.isValid(el.header)) {
		      $(el.header).off('pressed', this._preMoveDialog);
		      $(el.header).css('cursor', '');
		    } else {
		      $($el.find('[data-dialog-movecursor=true]')[0]).off('pressed', this._preMoveDialog);
		      $($el.find('[data-dialog-movecursor=true]')[0]).css('cursor', '');
		    }
		  }
		},

		_setResizable: function(el, resizable) {
		  var dialog = $.alopex.widget.dialog;
		  if (resizable && window.browser !== 'mobile') {
		    //footer
		    el.footer = document.createElement('div');

		    el.resizeHandleLeft = document.createElement('div');
		    $(el.resizeHandleLeft).attr('style', 'position:absolute;top:0px;left:0px;width:2px;' + 'height:100%;cursor:w-resize;');

		    el.resizeHandleRight = document.createElement('div');
		    $(el.resizeHandleRight).attr('style', 'position:absolute;top:0px;right:0px;width:2px;' + 'height:100%;cursor:col-resize;');

		    el.resizeHandleBottom = document.createElement('div');
		    $(el.resizeHandleBottom).attr('style', 'position:absolute;left:0px;bottom:0px;' + 'width:100%;height:2px;cursor:s-resize;');

		    el.resizeHandleBoth = document.createElement('div');
		    $(el.resizeHandleBoth).attr('class', 'resizeBtn ResizeBtn');

		    el.footer.appendChild(el.resizeHandleLeft);
		    el.footer.appendChild(el.resizeHandleRight);
		    el.footer.appendChild(el.resizeHandleBottom);
		    el.footer.appendChild(el.resizeHandleBoth);
		    el.appendChild(el.footer);

		    el.resizeHandleLeft.dialog = el.resizeHandleRight.dialog = el.resizeHandleBottom.dialog = el.resizeHandleBoth.dialog = el;

		    $(el.resizeHandleLeft).on('pressed', this._preResizeDialog);
		    $(el.resizeHandleRight).on('pressed', this._preResizeDialog);
		    $(el.resizeHandleBottom).on('pressed', this._preResizeDialog);
		    $(el.resizeHandleBoth).on('pressed', this._preResizeDialog);
		  } else {
		    $(el.footer).remove();
		  }
		},

		_preMoveDialog: function(e, ae) {
		  document.onselectstart = function() {
		    return false;
		  };

		  var dialog = $.alopex.widget.dialog;
		  var offset = $(this).offset();
		  var data = {};
		  data.x = ae.pageX - offset.left;
		  data.y = ae.pageY - offset.top;
		  data.element = e.currentTarget;
		  $(document).on('move.alopexDialogMove', data, $.alopex.widget.dialog._moveDialog).on('unpressed.alopexDialogMove', data, $.alopex.widget.dialog._postMoveDialog);
		},

		_moveDialog: function(e, ae) {
		  var x = ae.pageX - $(window).scrollLeft();
		  var y = ae.pageY - $(window).scrollTop();
		  if (!e.data.element) {
		    return;
		  }

		  var el = e.data.element;
		  var parent = el.parentElement;

		  $(parent).css('left', x - e.data.x + 'px');
		  if ((parent.offsetLeft) <= 0) {
		    $(parent).css('left', '0px');
		  }
		  if (parent.offsetLeft >= ($(window).width() - $(parent).width())) {
		    $(parent).css('left', ($(window).width() - $(parent).width()) + 'px');
		  }
		  $(parent).css('top', y - e.data.y + 'px');
		  if (parent.offsetTop <= 0) {
		    $(parent).css('top', '0px');
		  }
		  if ($(window).height() <= (parent.offsetTop + $(parent).height())) {
		    $(parent).css('top', ($(window).height() - $(parent).height()) + 'px');
		  }
		},
		
		_postMoveDialog: function(e, ae) {
		  $(document).off('.alopexDialogMove');
		  document.onselectstart = function() {
		    return true;
		  };
		},

		_preResizeDialog: function(e) {
		  var target = e.currentTarget;
		  var el = target.dialog;

		  var dialog = $.alopex.widget.dialog;
		  $(el.resizeHandleLeft).on('swipemove', $.alopex.widget.dialog._resizeLeftDialog).on('unpressed', $.alopex.widget.dialog._postResizeDialog);
		  $(el.resizeHandleRight).on('swipemove', $.alopex.widget.dialog._resizeRightDialog).on('unpressed', $.alopex.widget.dialog._postResizeDialog);
		  $(el.resizeHandleBottom).on('swipemove', $.alopex.widget.dialog._resizeBottomDialog).on('unpressed', $.alopex.widget.dialog._postResizeDialog);
		  $(el.resizeHandleBoth).on('swipemove', $.alopex.widget.dialog._resizeBothDialog).on('unpressed', $.alopex.widget.dialog._postResizeDialog);

		  document.onselectstart = function() {
		    return false;
		  };
		},

		_postResizeDialog: function(e) {
		  var target = e.currentTarget;
		  var el = target.dialog;

		  $(el.resizeHandleLeft).off('swipemove');
		  $(el.resizeHandleRight).off('swipemove');
		  $(el.resizeHandleBottom).off('swipemove');
		  $(el.resizeHandleBoth).off('swipemove');
		  
		  /**
		   * [Hong-HyunMin 2016.02.23] Dialog의 resize가 종료된 시점에 이벤트 실행.
		   */
		  $(el).trigger('dialogResizeEnd');
		  
		  document.onselectstart = function() {
		    return true;
		  };
		},

		_resizeLeftDialog: function(e, ae) {
		  var x = ae.pageX - $(window).scrollLeft();
		  var el = e.currentTarget;
		  var parent = el.parentElement.parentElement;

		  var offsetRight = $(window).width() - (parent.offsetLeft + $(parent).width());
		  var gap = parent.offsetLeft - x;
		  var resizedX = $(parent).width() + gap;
		  
		  /**
		   * [Hong-HyunMin 2016.01.05] Dialog의 Width가 option에 설정한 Width까지 resize 되는 것이 아니라, originWidth resize되기 때문에
		   * oprion 에 widht를 지정한 경우, 해당 값으로 처리하고 그렇지 않은 경우에만 originWidth를 사용하도록 변경함.
		   * parent.originWidth - > standardWidth
		   */
		  var standardWidth = $.alopex.widget.dialog._dialogStandardWidth(parent); 
		  
		  if (resizedX <= standardWidth) {
		    resizedX = standardWidth;
		    $(parent).css('width', resizedX + 'px');
		    $(parent).children().each(function() {
		      if (this.nodeName !== 'BUTTON') {
		        $(this).css('width', resizedX + 'px');
		      }
		    });
		    if ((offsetRight - ae.startX) <= standardWidth) {
		      $(parent).css('left', ae.startX + 'px');
		    }
		  } else {
		    if ((parent.offsetLeft) <= 0) {
		      $(parent).css('left', '3px');
		    } else {
		      $(parent).css('left', x + 'px');
		      $(parent).css('width', resizedX + 'px');
		      $(parent).children().each(function() {
		        if (this.nodeName !== 'BUTTON') {
		          $(this).css('width', resizedX + 'px');
		        }
		      });
		    }
		  }
		},

		_resizeRightDialog: function(e, ae) {
		  document.onselectstart = function() {
		    return false;
		  };

		  var x = ae.pageX - $(window).scrollLeft();
		  var el = e.currentTarget;
		  var parent = el.parentElement.parentElement;

		  var resizedX = x - parent.offsetLeft;
		  
		  /**
		   * [Hong-HyunMin 2016.01.05] Dialog의 Width가 option에 설정한 Width까지 resize 되는 것이 아니라, originWidth resize되기 때문에
		   * option 에 widht를 지정한 경우, 해당 값으로 처리하고 그렇지 않은 경우에만 originWidth를 사용하도록 변경함.
		   * parent.originWidth - > standardWidth
		   */
		  var standardWidth = $.alopex.widget.dialog._dialogStandardWidth(parent); 
		  
		  if (resizedX < standardWidth) {
		    resizedX = standardWidth;
		  }

		  $(parent).css('width', resizedX + 'px');
		  $(parent).children().each(function() {
		    if (this.nodeName !== 'BUTTON') {
		      $(this).css('width', resizedX + 'px');
		    }
		  });
		  if ($(parent).width() >= ($(window).width() - parent.offsetLeft)) {
		    $(parent).css('width', ($(window).width() - parent.offsetLeft - 3) + 'px');
		    $(parent).children().each(function() {
		      if (this.nodeName !== 'BUTTON') {
		        $(this).css('width', ($(window).width() - parent.offsetLeft) + 'px');
		      }
		    });
		  }
		},

		_resizeBottomDialog: function(e, ae) {
		  document.onselectstart = function() {
		    return false;
		  };

		  var y = ae.pageY - $(window).scrollTop();

		  var el = e.currentTarget;
		  var parent = el.parentElement.parentElement;

		  var resizedY = y - parent.offsetTop;

		  /**
		   * [Hong-HyunMin 2016.01.05] Dialog의 스크롤과 resize를 병행하는 경우에, contents class영역의 높이가 조절되지 않는 경우에 대한 개선
		   */
		  var minusHeight = $.alopex.widget.dialog._dialogMinusHeight(parent); 
		  var scrollValid = $.alopex.widget.dialog._dialogScrollValid(parent); 
		  var resizableValid = $.alopex.widget.dialog._dialogResizableValid(parent); 
		  
		  /**
		   * [Hong-HyunMin 2016.01.15] Theme인 경우에, 버튼의 높이를 포함해서 contents 영역의 높이를 조정 하기 위한 처리.
		   */
		  var isTheme = $.alopex.util.isAlopexTheme();
		  var contentsClass = '.contents';
		  var btnDivClass = '.dialog_btn';
		  var btnAreaHeightResult = 0;
		  if(isTheme){
			  contentsClass = '.Dialog-contents';
			  btnDivClass = '.Dialog-btnwrap';
			  
			  if($.alopex.util.isValid(parent.button)){
				  var btnAreaHeight = $(parent.button).css('margin-bottom').replace('px','');
				  var btnAreaHeight2 = $(parent.button).find('.Button').css('line-height').replace('px',''); 
				  btnAreaHeightResult = Number(btnAreaHeight) + Number(btnAreaHeight2);
			  }
			  
			  //[Hong-HyunMin 2016.02.12] toggle인 경우에 _resizeBottomDialog 시에 toggle의 Expanded를 위한 처리.
			  if(true == parent.toggle){
				  e.currentTarget.dialog.folded = false;
				  $(parent).find('.DialogToggle').removeClass('Expanded');
			  }
		  }
		  
		  /**
		   * [Hong-HyunMin 2016.01.05] 옵션이 리사이즈이거나 마크업에 리사이즈 속성을 적용한 경우.
		   */
		  if(resizableValid){
			  
			  //펼칠때의 기준이 되는 높이
			  var standardHeight = $.alopex.widget.dialog._dialogStandardHeight(parent);
		    	
			  //접을때의 기준이 되는 높이.
			  var headerHeight = $.alopex.widget.dialog._dialogHeaderHeight(parent);
			  
			  if(standardHeight == 0 && headerHeight == 0){
				  standardHeight = 270;
			  }
			  
			  //standardHeight 보다 리사이즈 하려는 값이 작은 경우 standardHeight을 기준으로 높이 값 변경.
			  if (resizedY < standardHeight) {
				  $(parent).css('height', standardHeight + 'px');
				  $(parent).find(contentsClass).css('height', standardHeight - headerHeight - btnAreaHeightResult + 'px');
			  }
			  else{
				  $(parent).css('height', resizedY + 'px');
				  $(parent).find(contentsClass).css('height', resizedY - headerHeight - btnAreaHeightResult + 'px');
			  }
			  
			  //standardHeight 보다 리사이즈 하려는 값이 window영역을 넘지 않도록 하기 위한 처리
			  if ($(parent).height() >= ($(window).height() - parent.offsetTop)) {
				  $(parent).css('height', ($(window).height() - parent.offsetTop - 3) + 'px');
			  }
		  }
		},

		_resizeBothDialog: function(e, ae) {
		  $.alopex.widget.dialog._resizeRightDialog(e, ae);
		  $.alopex.widget.dialog._resizeBottomDialog(e, ae);
		},

		_clickMoveToTop: function(e) {
		  //var el = (e) ? e.currentTarget : this.element[this.element.length-1];
		  var dialog = $.alopex.widget.dialog;
		  //var dialogLength = dialog.dialoglist.length;

		  var runMoveToTop = true;
		  $.each(dialog.dialoglist, function(index, value) {
		    if (dialog.dialoglist[index].modal) {
		      runMoveToTop = false;
		      return;
		    }
		  });

		  if (runMoveToTop) {
		    $.alopex.widget.dialog._moveToTop(e);
		  }
		},

		_moveToTop: function(e) {
		  var el = (e) ? e.currentTarget : this.element[this.element.length-1];
		  var $el = $(el);
		  var dialog = $.alopex.widget.dialog;
		  var dialogLength = dialog.dialoglist.length;

		  if (dialogLength <= 1) {
		    $el.css('z-index', dialog.maxZindex);
		    if (el.modal) {
		      $(el.blocker).css('z-index', dialog.maxZindex - 1);
		    }
		    return;
		  }

		  $.each(dialog.dialoglist, function(index, value) {
		    if (dialog.dialoglist[index] === el) {
		      var topEl = dialog.dialoglist.splice(index,1);
		      dialog.maxZindex = 1000 + dialogLength;
		      $el.css('z-index', dialog.maxZindex);
		      if (el.modal) {
		        $(el.blocker).css('z-index', dialog.maxZindex - 1);
		      }

		      dialog.dialoglist = topEl.concat(dialog.dialoglist);
		      var maxZindex = dialog.maxZindex;
		      for(var i=1;i<dialogLength;i++) {
		        maxZindex--;
		        $(dialog.dialoglist[i]).css('z-index', maxZindex);
		        if (dialog.dialoglist[i].modal) {
		          $(dialog.dialoglist[i].blocker).css('z-index', maxZindex - 1);
		        }
		      }
		    }
		  });
		},

		open: function(el, obj, callbck) {
		  var $el = $(el);
		  //open check
		  if ($el.is(':visible') && $el.css('opacity') != '0') {
		    return;
		  }
		  if ($.alopex.util.isValid(obj)) {
			if ($.alopex.util.isValid(obj.height)) {
				$el.css('height', obj.height);
			}
			if ($.alopex.util.isValid(obj.width)) {
			    $el.css('width', obj.width);
			}

		    // 새롭게 옵션에 설정된 값 반영.
		    if (obj.type !== undefined) { // null, ""  허용
//		    	el.dialogtype = obj.type || el.dialogtype;
		      el.dialogtype = obj.type;
		      
		      //[Hong-HyunMin 2016.01.05] Dialog  Toggle 옵션 추가.
		      if ($.alopex.util.isValid(obj.toggle)) {
		    	  el.toggle = obj.toggle;
		      }
		      
		      this._setDialogType(el, el.dialogtype); // 타입 재지정.
		    }
		    if ($.alopex.util.isValid(obj.resizable)) {
		      this._setResizable(el, obj.resizable);
		    }
		    if ($.alopex.util.isValid(obj.movable)) {
		      this._setMovable(el, obj.movable);
		    }
		    if ($.alopex.util.isValid(obj.modal)) {
		      this._setModal(el, obj.modal);
		    }

		    for (i in obj) {
		      if (obj[i] === 'true' || obj[i] === 'false') {
		        obj[i] = $.alopex.util.parseBoolean(obj[i]);
		      }
		      if ($.alopex.util.isNumberType(obj[i])) {
		        obj[i] = parseInt(obj[i], 10);
		      }
		    }
		    $.extend(el, obj);
		  }
		  // set open button
		  if ($.alopex.util.isValid(document.activeElement) && document.activeElement.tagName !== "BODY") {
		    el.target = document.activeElement;
		  } else if ($.alopex.util.isValid(window.event)) {
		    el.target = window.event.srcElement;
		  }

		  if ($el.children().length > 0) {
		    if ($.alopex.util.isValid(el.title)) {
		      for (var i = 0; i < $($el.children()[0]).contents().length; i++) {
		        if ($($el.children()[0]).contents()[i].nodeType === 3) {
		          $el.children()[0].removeChild($($el.children()[0]).contents()[i]);
		        }
		      }
		      
		      if(el.title == false || el.title =='false') {
		    	  $($el.children()[0]).remove();
		      } else {
		    	  $($el.children()[0]).append(el.title);
		      }
		    }
		  }

		  if (el.modal) { 
		    // 20140715 
		    // 이전 다이얼로그 오픈 시 바디 스크롤 막기위해서 처리 히스토리
		    // body 영역의 width & height을 윈도우 영역과 맞추고 overflow:hidden 처리로 스크롤이 안되게 처리.
		    // 이렇게 처리해도 
		    $(el.blocker).css('display', 'block');

		    if (el.modalscrollhidden) {
		      if(document.body.style.position != 'fixed' && document.body.style.position != 'absolute') {
		        this.bodyposition = document.body.style.position;
		        this.bodywidth = document.body.style.width;
		        
		        //var scrollbarWidth =  $.alopex.widget.dialog._scrollbarWidth();
		        
		        if (window.browser === 'ie' || 
						$.alopex.util.isValid(window.browser) && window.browser.indexOf('Microsoft Internet Explorer') !== -1){
		          el.scrollTopValue = $(document.documentElement).scrollTop();
		        } else {
		          el.scrollTopValue = $(document.body).scrollTop();
		        }
		        //$('body').css({
		        //  'top': (el.scrollTopValue * -1) + 'px',
		        //  'position': 'fixed',
		        //  'width': $(window).width()-scrollbarWidth
		        //});
		        
		   	// 20160321 모달창에선  scroll 이벤트를 동작 하지 않도록.
		        $(window).bind('mousewheel touchmove',function (e) { e.preventDefault() });
		        // 20160321 모달창에선  해당 위치에 scroll 고정하도록.
		        var body_scroll = $(window).scrollTop();
		        $(window).bind('scroll', function(){
		            $(document).scrollTop(body_scroll);
		        });
		   
		        
		      }
		    }
		  }

		  $el.css('display', 'block');
		  $el.css('opacity', '1');

		  // -webkit-transform 버그로 fixed position 역할을 제대로 못해줌.
		  // 이 경우, 바디 및에 붙혀줌.
		  if($el.closest('[data-carousel]').length > 0 || $el.closest('[data-carousel]').length > 0) {
		    $el.appendTo('body');
		    $(el.blocker).appendTo('body');
		  }

		  // set dialog position
		  if (!$.alopex.util.isValid(el.top)) {
		    var centerTop = ($(window).height() - el.offsetHeight) / 2;
		    el.top = (centerTop + this.dialoglist.length * 10);
		  }
		  if (!$.alopex.util.isValid(el.left)) {
		    var centerLeft = ($(window).width() - el.offsetWidth) / 2;
		    el.left = (centerLeft + this.dialoglist.length * 10);
		  }
		  $el.css('top', el.top + 'px');
		  $el.css('left', el.left + 'px');

		  if(el.scroll && el.contents) {
		  	el.contents.attr('data-dialog-scroll', true);
		  }

		  // dialog - el.contents 에 data-dialog-scroll를 쓴 경우 동적 스크롤 추가되도록 수정
		  if (el.scroll || (el.contents && el.contents.attr("data-dialog-scroll")) === "true") {
			    this._calculateHeight(el);
			  }
		  // dialog position이 'absolute'일 경우, top & left 계산.

		  switch (el.animation) {
		  case 'slide':
		    $el.css('top', (el.offsetHeight * -1) + 'px');
		    $el.animate({
		      'top': el.top + 'px'
		    }, el.animationtime);
		    break;
		  case 'fade':
		    $el.css('opacity', '0');
		    $el.animate({
		      'opacity': '1'
		    }, el.animationtime);
		    break;
		  default:
		    break;
		  }
		  //	 $(document.body).css('overflow', 'hidden'); // position: fixed 처리로 인해 불필요. 주석처리 20140715

		  this.element.push(el);
		  this.dialoglist.push(el);
		  this._moveToTop();

		  el.windowheight = $(window).height();
		  $(window).on('resize', this._reposition);

		  // 개발자도구 IE7모드에서, tabindex="0" 속성 사용시 focus함수 호출하면 브라우져 뻗음.
		  // 일반 IE7모드에서는 focus이벤트가 계속 발생.
		  //        $el.attr('tabindex', '0');
		  var selectorcondition = 'a[href], area[href], input:not([disabled]), select:not([disabled]), '
		    + 'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
		  $el.find(selectorcondition).eq(0).focus();

		  if (callbck) {
		    callbck.apply();
		  }
		  
		  /**
		   * [Hong-HyunMin 2016.01.27] Dialog를 open할 시에 resize된 경우에 대비해, resize를 원래의 사이즈로 돌려서 open하도록 처리 함.
		   * popup과 같이 사용하기 때문에, popup이 아닌경우에만 동작하도록 처리함.
		   */
		  var isPopUp = /Alopex_Popup_/.test($el.attr('id'));
		  if(false == isPopUp){
			var isTheme = $.alopex.util.isAlopexTheme();
			var contentsClass = '.contents';
			var btnDivClass = '.dialog_btn'
			var minusBtnHeight = 0;
			var btnAreaHeightResult = 0;
			if(isTheme){
			  contentsClass = '.Dialog-contents';
			  btnDivClass = '.Dialog-btnwrap';
			  
			  if($.alopex.util.isValid(el.button)){
				  var btnAreaHeight = $(el.button).css('margin-bottom').replace('px','');
				  var btnAreaHeight2 = $(el.button).find('.Button').css('line-height').replace('px',''); 
				  btnAreaHeightResult = Number(btnAreaHeight) + Number(btnAreaHeight2);
			  }
			}
	
			var originWidth = $.alopex.widget.dialog._dialogStandardWidth(el);
			var originHeight = $.alopex.widget.dialog._dialogStandardHeight(el);
			var headerHeight = $.alopex.widget.dialog._dialogHeaderHeight(el);
			
			$el.find(contentsClass).css('width', originWidth + 'px');
			$el.find('.ResizeBtn').parents('div').eq(0).css('width',originWidth + 'px');
			$(el.header).css('width', originWidth + 'px');
			
			if(btnAreaHeightResult > 0){
				$el.find(contentsClass).css('height', originHeight - headerHeight - btnAreaHeightResult + 'px');
			}
			else{
				$el.find(contentsClass).css('height', originHeight - headerHeight + 'px');
			}
		  }
		  $el.trigger('open');
		},

		ok: function(el, callback) {
		  $(el.okbtn).on('click', function() {
		    callback();
		  });
		},

		cancel: function(el, callback) {
		  $(el.cancelbtn).on('click', function() {
		    callback();
		  });
		},

		confirm: function(el, callback) {
		  $(el.confirmbtn).on('click', function() {
		    callback();
		  });
		},

		close: function(el, callback) {
		  var $el = $(el);
		  try{
		    // close callback 등록.
		    if ($.alopex.util.isValid(callback)) {
		      el.closecallback = callback;
		    } else {
		      el.closecallback = '';
		    }

		    //var dialog = $.alopex.widget.dialog;
		    if ($el.is(':hidden')) {
		      return;
		    }
		    for(var i=0; i<this.element.length; i++) {
		      if(el == this.element[i]) {
		        this.element.splice(i, 1);
		        break;
		      }
		    }

		    $el.css('z-index', 1001);
		    $.alopex.util.arrayremove(this.dialoglist, el);
		    if (this.dialoglist.length == 0) {
		      this.maxZindex = 1001;
		    }
		    if (el.modal && this.dialoglist.length == 0) { 
		      var body = document.body;
		      var scrollTop = Math.abs(parseInt(body.style.top));
		      //$(body).css({
		      //  'top': '',
		      //  'position': this.bodyposition? this.bodyposition: '',
		      //      'width': this.bodywidth? this.bodywidth: ''
		      //});
		      
		      
		      // 20160321 scroll 이벤트를 다시 동작 하도록.
		      $(window).unbind('mousewheel touchmove scroll');
		    
		      // dialog 닫힐때 scrollTop 위치 세팅
		      //if (window.browser === 'ie' || $.alopex.util.isValid(window.browser) && window.browser.indexOf('Microsoft Internet Explorer') !== -1){
		      //  $(document.documentElement).scrollTop(el.scrollTopValue);
		      //} else {
		      //  $(body).scrollTop(scrollTop);
		      //}
		    }
		    
		    if(el.iframe === true){
		    	$(el).find('iframe')[0].src="about: blank";
		    }
		    // 다이얼로그가 닫힐 때 close 이벤트를 발생하고, 이로 인한 처리는 팝업에서 처리하도록...
		    $(el).trigger('close');

		    if(window.browser == 'mobile') {
		      setTimeout(function (){
		        $.alopex.widget.dialog._close(el);
		      }, 400);
		    } else {
		      $.alopex.widget.dialog._close(el);
		    }

		    // modal 사용 경우, 바디에 걸려있는 스크롤 락 해제.
		    $(window).off('resize', this._reposition);
		    $(el.okbtn).off('click');
		    $(el.cancelbtn).off('click');
		    //$(el.closebtn).off('click');
		    $(el.confirmbtn).off('click');

		    if ($.alopex.util.isValid(el.target)) {
		      $(el.target).focus();
		    }
		  }catch(e){

		  }
		},
		
		_close: function(el) {
		  var $el = $(el);
		  switch (el.animation) {
		  case 'slide':
		    $el.animate({
		      'top': (el.offsetHeight * -1) + 'px'
		    }, el.animationtime, function(e) {
		      if (el.modal) {
		        $(el.blocker).css('display', 'none');
		      }
		      $el.css('display', 'none');
		    });
		    break;
		  case 'fade':
		    $el.animate({
		      'opacity': '0'
		    }, el.animationtime, function(e) {
		      if (el.modal) {
		        $(el.blocker).css('display', 'none');
		      }
		      $el.css('display', 'none');
		    });
		    break;
		  default:
		    if (el.modal) {
		      $(el.blocker).css('display', 'none');
		    }
		  $el.css('display', 'none');

		  break;
		  }

		  if($.alopex.util.isValid(el.closecallback)) {
		    el.closecallback();
		  }
		},

		// scroll 영역 height 계산
		_calculateHeight: function(el) {
		  var $el = $(el);
		  var parentHeight = $el.outerHeight(true);
		  var siblingHeight = 0;
		  $el.children().each(function(i, elem) {
		    var arr = ['meta', 'title', 'script', 'link'];
		    if (!$(elem).attr('data-dialog-scroll') && $(elem).css('position') !== 'absolute' 
		      && $.inArray(elem.nodeName.toLowerCase(), arr) === -1) {
		      siblingHeight += $(elem).outerHeight(true);
		    }
		  });
		  
		  /**
		   * [Hong-HyunMin 2016.01.15] 테마와 테마 버튼에 따른 스크롤 위치계산값 변경.
		   */
		  var minusHeight = $.alopex.widget.dialog._dialogMinusHeight(el); 
		  var scrollValid = $.alopex.widget.dialog._dialogScrollValid(el); 
		  
		  var isTheme = $.alopex.util.isAlopexTheme();
			
		  var contentsClass = '.contents';
		  var btnDivClass = '.dialog_btn';
		  var btnAreaHeightResult = 0;
		  if(isTheme){
			  contentsClass = '.Dialog-contents';
			  btnDivClass = '.Dialog-btnwrap';
			  
			  if($.alopex.util.isValid(el.button)){
				  var btnAreaHeight = $(el.button).css('margin-bottom').replace('px','');
				  var btnAreaHeight2 = $(el.button).find('.Button').css('line-height').replace('px',''); 
				  btnAreaHeightResult = Number(btnAreaHeight) + Number(btnAreaHeight2);
			  }
		  }
		  
		  if(scrollValid){
			  $el.find('[data-dialog-scroll=true]').css('height', (parentHeight - siblingHeight - btnAreaHeightResult) + 'px');
		  }
		  else {
			  $el.find('[data-dialog-scroll=true]').css('height', (parentHeight - siblingHeight) + 'px');
		  }
		  
		  $el.find('[data-dialog-scroll=true]').css('overflow-y', 'auto');
		},

		reposition: function(el) {
		  var $el = $(el);
		  if ($.alopex.util.isValid(el)) {
		    var centerTop = ($(window).height() - $el.outerHeight()) / 2;
		    $el.css('top', (centerTop + this.dialoglist.length * 10) + 'px');
		    var centerLeft = ($(window).width() - $el.outerWidth()) / 2;
		    $el.css('left', (centerLeft + this.dialoglist.length * 10) + 'px');
		  }

		  if ($.alopex.util.isValid(el) && el.modal) {
		    $(el.blocker).css('height', $(document).height() + 'px');
		    $(el.blocker).css('width', $(document).width() + 'px');
		  }
		},

		_reposition: function(e) {
//		  alert('screen.height === ' + screen.height + ', window height === ' + $(window).height())
		  e.preventDefault();
		  var el = $.alopex.widget.dialog.element;
		  var $el = $(el);
		  if ($.alopex.util.isValid(el) && !el.resizable && !el.movable) {
		    var centerTop = ($(window).height() - $el.outerHeight()) / 2;
		    $el.css('top', (centerTop + $.alopex.widget.dialog.dialoglist.length * 10) + 'px');
		    var centerLeft = ($(window).width() - $el.outerWidth()) / 2;
		    $el.css('left', (centerLeft + $.alopex.widget.dialog.dialoglist.length * 10) + 'px');
		  }

		  if ($.alopex.util.isValid(el) && el.modal) {
		    $(el.blocker).css('height', $(document).height() + 'px');
		    $(el.blocker).css('width', $(document).width() + 'px');
		  }
		},
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 기본 높이를 return.
		 */
		_dialogStandardHeight: function(el){
			if($.alopex.util.isValid(el)){
				if($.alopex.util.isValid(el.height)){
					return el.height;
				}
				else{
					return el.originHeight;
				}
			}
			else{
				return 0;
			}
		},
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 기본 넓이를 return.
		 */
		_dialogStandardWidth: function(el){
			if($.alopex.util.isValid(el)){
				if($.alopex.util.isValid(el.width)){
					return el.width;
				}
				else{
					return el.originWidth;
				}
			}
			else{
				return 0;
			}
		},
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 Resize시에 css별로 빼줘야 하는 높이 값.
		 */
		_dialogMinusHeight: function(el){
			var minusHeight = 0;
			if($(el.contents).attr('class') == 'contents'){
				minusHeight = 18;
			}
			if($(el.contents).attr('class') == 'Dialog-contents'){
				minusHeight = 14;
			}
			return minusHeight;
		},
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 Header영역의 높이를 return.
		 */
		_dialogHeaderHeight: function(el){
			if($.alopex.util.isValid(el)){
				if($.alopex.util.isValid(el.header)){
					return $(el.header).height();
				}
				else{
					return 0;
				}
			}
			else{
				return 0;
			}
		},
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 option 또는 mark attribute에 의한 scroll여부 확인
		 * ** scroll markup인 data-dialog-scroll는 contents 영역에 선언 한다.
		 */
		_dialogScrollValid: function(el){
			var scrollValid = false;
			if(el.scroll == true){
				scrollValid =  true;
			}
			if($(el.contents).attr('data-dialog-scroll') == true || $(el.contents).attr('data-dialog-scroll') == 'true'){
				scrollValid =  true;
			}
			return scrollValid;
		},
		
		
		
		_scrollbarWidth: function() {
		    var parent, child, width;

		    if(width===undefined) {
			var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
		        widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).width();
			$outer.remove();
			width =  99 - widthWithScroll;
		    }

		   return width;
		},
		
		
		/**
		 * [Hong-HyunMin 2016.01.15] Dialog의 option 또는 mark attribute에 의한 resizable여부 확인
		 * ** resizable markup인 data-resizable는 Dialog 영역에 선언 한다.
		 */
		_dialogResizableValid: function(el){
			var resizableValid = false;
			if(el.resizable == true){
				resizableValid =  true;
			}
			if($(el).attr('data-resizable') == true || $(el).attr('data-resizable') == 'true'){
				resizableValid =  true;
			}
			return resizableValid;
		},

		id: {
		  value: null,
		  enumerable: true,
		  configurable: false,
		  writable: true
		}
	});
})(jQuery);

(function($) {

  /*********************************************************************************************************
   * divselect
   *********************************************************************************************************/
  $.alopex.widget.divselect = $.alopex.inherit($.alopex.widget.object, {
    widgetName: 'divselect',
    defaultClassName: 'af-select Divelect',
    eventHandlers: {
      change: {
        event: 'change',
        handler: '_changeHandler'
      }
    },
    getters: ['getValues', 'getTexts'],
    setters: ['divselect', 'setPlaceholder', 'setSelected', 'clear', 'refresh', 'setEnabled', 'selectionInitialization'],
    properties: {
      select: null
    },

//    renderTo: function(el) {
//      return '<div class="af-select-wrapper ' + el.className + '" af-dynamic data-select-wrapper="true"><select></select></div>';
//    },

    markup: function(el) {
    },

    init: function(el, option) {
    	if(el.tagName.toLowerCase() == 'div') {
    		var div = el;
    		el = $(el).find('>select')[0];
    		
    		// select 에 focus 갈 경우, divselect에서는 div에 focus 표시를 해줘야 한다
    		$(el).on("focus", function(){
    			$(div).addClass("ui-state-focus");
    		});
    		$(el).on("blur", function(){
    			$(div).removeClass("ui-state-focus");
    		});
    		
    	} else {
    		$(el).wrap('<div class="af-select-wrapper ' + el.className + '" af-dynamic data-select-wrapper="true"></div>');
    		$(el.parentNode).append('<span></span>');
    	}
    	if(option.placeholder) {
			this.setPlaceholder(el, option.placeholder);
		}
    	
    	var selectedItem = $(el).find(':selected')[0];
    	//IE8에서 querySelectorAll('option:checked')에러남.
//    	var selectedItem = el.querySelectorAll('option:checked')[0];
    	if ($.alopex.util.isValid(selectedItem)) {
    		var text = $(selectedItem).text();
        	this._setText(el.parentNode, text);
    	}
    },

	selectionInitialization: function(el) {
		var select = null;
    	if(el.tagName.toLowerCase() == 'div') {
    		select = $(el).find('>select')[0];
    	}
    	$.alopex.widget.baseselect.selectionInitialization(select);
    	
    	this.refresh(el);
	},
    _changeHandler: function(e) {
      var wrapper;
      if(e.currentTarget.tagName.toLowerCase() == 'select') {
    	  wrapper = e.currentTarget.parentNode;
      } else {
    	  wrapper = e.currentTarget;
      }
      var selectedItem = $(e.currentTarget).find(':selected')[0];
    //IE8에서 querySelectorAll('option:checked')에러남.
     //var selectedItem = wrapper.querySelectorAll('option:checked')[0];
      if ($.alopex.util.isValid(selectedItem)) {
    	  var text = $(selectedItem).text();
    	  $.alopex.widget.divselect._setText(wrapper, text);
      }
    },

    setPlaceholder: function(el, text) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	$.alopex.widget.baseselect.setPlaceholder(el, text);
    },

    setSelected: function(el, text) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	$.alopex.widget.baseselect.setSelected(el, text);
    },

    refresh: function(el) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	$.alopex.widget.baseselect.refresh(el);
    },

    getValues: function(el) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	return $.alopex.widget.baseselect.getValues(el);
    },

    getTexts: function(el) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	return $.alopex.widget.baseselect.getTexts(el);
    },

    clear: function(el) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
    	$.alopex.widget.baseselect.clear(el);
    },

    setEnabled: function(el, bool) {
    	if(el.tagName.toLowerCase() == 'div') {
    		el = $(el).find('>select')[0];
    	}
		$.alopex.widget.baseselect.setEnabled(el, bool);
		if (bool) {
			$(el.parentNode).removeClass('af-disabled Disabled');
		} else {
			$(el.parentNode).addClass('af-disabled Disabled');
		}
    },

    _setText: function(wrapper, text) {
		text = text || '';
		$(wrapper).find('>span').text(text);
    }
  });

})(jQuery);
(function($) {

	$.alopex.widget.dropdown = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'dropdown',
		defaultClassName: 'af-dropdown Dropdown',
		setters: ['dropdown', 'addHandler', 'setDataSource', 'open', 'close', 'toggle', 'refresh'],
		getters: ['getDataSource'],

		markup: function(el, options) {
			var $el = $(el);
			$.extend(true, el, {
				opentrigger: 'click', // the event which the base element will trigger to OPEN the dropdown menu
				closetrigger: 'click', // the event which the base element will trigger to CLOSE the dropdown menu
				submenutrigger: null,
				base: $(el).prev(),
				curstate: 'closed',
				position: 'bottom',
				cssstyle: {
					'position': 'absolute',
					'top': '0px',
					'left': '0px'
				},
				trigger: 'click',
				margin: 3,
				focusmove: 'false',
				classname: [''],
				callback: []

			}, options);

			var $base = $(el.base);
			if ($base.length === 0) {
				return;
			}
			el.base = $base[0];
			$base.each(function() {
				this.dropdown = el;
			});
			$base.attr('tabindex', '0');
			this.refresh(el);
		},

		init: function(el, options) {
			var $el = $(el);
			var $base = $(el.base);

			// el triggered event
			if (el.opentrigger !== undefined && el.opentrigger === el.closetrigger) {
				$base.on(el.opentrigger, $.alopex.widget.dropdown._toggle);
			} else {
				if (el.opentrigger) {
					$base.on(el.opentrigger, $.alopex.widget.dropdown._open);
				}
				if (el.closetrigger) {
					$base.on(el.closetrigger, $.alopex.widget.dropdown._close);
				}
			}
			$el.on('click', 'li', {
				element: el
			}, $.alopex.widget.dropdown._clickHandler);

			// submenu open을 담당하는 이벤트 명시.
			if (el.submenutrigger === 'click') {
				$el.on('click', 'li', {
					element: el
				}, $.alopex.widget.dropdown._toggleHandler);
			} else { // hover 
				$el.on('mouseenter', 'li', {
					element: el
				}, $.alopex.widget.dropdown._openSubmenu);
				$el.on('mouseleave', 'li', {
					element: el
				}, $.alopex.widget.dropdown._closeSubmenu);
			}

			// blur시 드랍다운 close 처리.
			$base.on('blur', $.alopex.widget.dropdown._blurHandler);
			// hover시 af-focus 표시.
			$el.on('mouseleave mouseenter', 'li.af-menuitem', function(e) {
			  var target = e.currentTarget;

			  var $target = $(target);
			  var $el = $target.closest('[data-type]');
			  $el.find('*').filter('.af-focused.Focused').removeClass('af-focused Focused');

			  var inputEl = $(e.currentTarget).find('input');
			  if (inputEl) {
			    var type = $(e.currentTarget).find('input').attr('type');
			    if (type == 'checkbox' || type == 'text' || type == 'button') {
			      return;
			    }
			  }

			  var selectEl = $(e.currentTarget).find('select');
			  if (selectEl.length > 0) {
			    return;
			  }

			  if (target.className.indexOf('af-disabled Disabled') === -1) {
			    $target.addClass('af-focused Focused');
			  }
			});

			$(el.base).on('keydown', $.alopex.widget.dropdown._inputBaseKeyDownHandler);
			$(el).bind('keydown', $.alopex.widget.dropdown._inputBaseKeyDownHandler);

		},

		refresh: function(el) {
			var $el = $(el);
			$el.find('li').each(function() {
				var row = this;
				if ($(row).attr('data-role') === 'divider') {
					$(row).addClass('af-dropdown-divider');
				} else if ($(row).attr('data-role') === 'header') {
					$(row).addClass('af-dropdown-header');
				} else {
					$(row).addClass('af-menuitem');
				}
			});
			$el.find('ul').addClass('af-submenu');
			$el.find('.af-submenu').parent().addClass('af-expandable');
			$el.find('.af-submenu').parent().addClass('Expandable');
			$el.css(el.cssstyle);
			$el.hide();
		},

		_blurHandler: function(e) {
			var dropdown = e.currentTarget.dropdown;
			//      $(dropdown).close();
		},

		addHandler: function(el, callback) {
			el.callback.push(callback);
		},

		_toggle: function(e) {
			var target = e.currentTarget;
			var el = target.dropdown;
			$(el).toggle();
		},

		_open: function(e) {
			var target = e.currentTarget;
			var el = target.dropdown;
			$(el).open();
		},

		_close: function(e) {
			
			if(e.type !== 'mouseleave'){
				var target = e.currentTarget;
				var el = target.dropdown;
				$(el).close();
				return;
			}
			
			var mouseLeaveEvent = e;			
			var dropdown_closeX;
			var dropdown_closeY;
			
			// button 에서  open된 ul로  마우스 이동하면 button에서 mouseleave 발생하고, ul로 가기도 전에 ul이 close 되어 버림 (button 과 ul의 화면상의 간격 때문)
			// 특정 시간(200ms) 후에 마우스 커서가 ul 위에 있는 경우에는 close 하지 않는 것으로 수정
			
			// 특정 시간(200ms) 후 ul로 마우스 커서 이동 뒤, ul에서 mouseleave 하면 ul 닫히도록 수정
			
			// e.currentTarget가 ul 이면
			if($(e.currentTarget).filter('ul.Dropdown').length > 0){
				var el = e.currentTarget;
				var $el = $(e.currentTarget);
				$el.close();
				$el.off(el.closetrigger, $.alopex.widget.dropdown._close);
				return;
			}
				
			// e.currentTarget가 button 이면
				mouseLeaveEvent.mouseMoveHandler = function(mouseMoveEvent, mouseLeaveEvent){
					dropdown_closeX = mouseMoveEvent.pageX;
					dropdown_closeY = mouseMoveEvent.pageY;
				};
				
				$(document).on("mousemove", mouseLeaveEvent.mouseMoveHandler);

				var func = function(mouseLeaveEvent){
					var target = mouseLeaveEvent.currentTarget;
					var el = target.dropdown;

					var x = dropdown_closeX;
					var y = dropdown_closeY;
					
					var dropdownUlTop = $(el).offset().top;
					var dropdownUlleft = $(el).offset().left;
					var dropdownUlOuterHeight = $(el).outerHeight();
					var dropdownUlOuterWidth = $(el).outerWidth();
					
					if(x >= dropdownUlleft && x <= (dropdownUlleft + dropdownUlOuterWidth)
							&& y >= dropdownUlTop && y <= (dropdownUlTop + dropdownUlOuterHeight)){
						// 일정시간 뒤에 마우스 커서가 ul 위에 있다. close 하지 않는다.
					}else{
						$(el).close();
					}
					
					$(document).off("mousemove", mouseLeaveEvent.mouseMoveHandler);
				};
				
				$.alopex.util.delayFunction(func, 200, mouseLeaveEvent);
		},

		_closeByKey: function(e) {
				var target = e.target;
				var arr = $.alopex.widget.dropdown.activeList;
				for ( var i = 0; i < arr.length; i++) {
					var el = $.alopex.widget.dropdown.activeList.shift();
					if ((el !== target && $(target).closest(el).length === 0) && (el.base !== target && $(target).closest(el.base).length === 0)) {
						// 드랍다운 영역이 아닌 배경화면 및 다른 컴퍼넌트 클릭.
						setTimeout(function(){ // 이벤트 타이밍 이슈로 닫고 다시 열림
							$(el).close();
						}, 200);
						
					} else {
						$.alopex.widget.dropdown.activeList.push(el);
					}
				}
		},

		toggle: function(el) {
			var $el = $(el);
			if (el.curstate === 'closed') {
				$el.open();
			} else {
				$el.close();
			}
		},

		_toggleHandler: function(e) {
			var li = e.currentTarget;
			if (li.className.indexOf('af-expandable') !== -1) {
				$.alopex.widget.dropdown.toggleSubmenu(li);
			}
		},

		_clickHandler: function(e) {
			var li = e.currentTarget;
			var el = e.data.element;
			for ( var i = 0; i < el.callback.length; i++) {
				el.callback[i].apply(el, [e]);
			}

			var subMenuEl = $(li).find('ul');
			if (subMenuEl.length > 0) {
				return;
			}

			var inputEl = $(li).find('input');
			if (inputEl) {
				var type = $(li).find('input').attr('type');
				if (type == 'checkbox' || type == 'text') {
					return;
				}
			}

			var selectEl = $(li).find('select');
			if (selectEl.length > 0) {
				return;
			}

			if (el.base.tagName.toLowerCase() === 'input' || e.which !== undefined) { // 키보드로 클릭한 경우, 가상 이벤트가 발생하기 때문에 e.which 값 undefined.
				$(el).close();
			}

		},

		_openSubmenu: function(e) {
			var li = e.currentTarget;
			$.alopex.widget.dropdown.openSubmenu(li);
		},

		_closeSubmenu: function(e) {
			var li = e.currentTarget;
			$.alopex.widget.dropdown.closeSubmenu(li);
		},

		openSubmenu: function(li) {
			var $li = $(li);
			var inputEl = $(li).find('input');
			if (inputEl) {
				var type = $(li).find('input').attr('type');
				if (type == 'checkbox' || type == 'text' || type == 'button') {
					return;
				}
			}

			var selectEl = $(li).find('select');
			if (selectEl.length > 0) {
				return;
			}

			if ($li.attr('class') && $li.attr('class').indexOf('af-expandable') !== -1) {
				$li.addClass('af-expanded');
				$li.find('> ul').css('display', 'inline-block');
			}
		},

		closeSubmenu: function(li) {
			var $li = $(li);
			var inputEl = $(li).find('input');
			if (inputEl) {
				var type = $(li).find('input').attr('type');
				if (type == 'checkbox' || type == 'text' || type == 'button') {
					return;
				}
			}

			var selectEl = $(li).find('select');
			if (selectEl.length > 0) {
				return;
			}

			if ($li.attr('class') && $li.attr('class').indexOf('af-expandable') !== -1) {
				$li.removeClass('af-expanded');
				$li.find('> ul').css('display', 'none');
			}
		},

		toggleSubmenu: function(li) {
			var $li = $(li);
			if ($li.attr('class').indexOf('af-expanded') !== -1) {
				$.alopex.widget.dropdown.closeSubmenu(li);
			} else {
				$.alopex.widget.dropdown.openSubmenu(li);
			}
		},

		_htmlGenerator: function(data) {
			var markup = '';
			for ( var i = 0; i < data.length; i++) {
				markup += '<li';
				if (data[i].id !== undefined) {
					markup += ' id="' + data[i].id + '"';
				}
				markup += '><a';
				if (data[i].link !== undefined) {
					markup += ' href="' + data[i].link + '"';
				}
				markup += '>';
				if (data[i].text !== undefined) {
					markup += data[i].text;
				}
				if (data[i].items) {
					markup += '</a><ul>';
					markup += $.alopex.widget.dropdown._htmlGenerator(data[i].items);
					markup += '</ul></li>';
				} else {
					markup += '</a></li>';
				}

			}
			return markup;
		},
		getDataSource: function(el) {
			if($.alopex.util.isValid(el.userInputDataSource)) return el.userInputDataSource;
		},
		setDataSource: function(el, data) {
			var $el = $(el);
			switch (typeof data) {
			case 'string':
				$el.html(data);
				break;
			case 'object':
				$el.html($.alopex.widget.dropdown._htmlGenerator(data));
				break;
			default:
				break;
			}
			$(el).refresh();
			el.userInputDataSource = data;
		},
		_inputBaseKeyDownHandler: function(e) {
			var base = this;
			var el = base.dropdown;

			if (typeof el !== 'undefined') {
				if (e.which === 40) {// down
					if (el.curstate === 'closed') {
						$(el).open();
					}
					$.alopex.widget.dropdown._focusNext(el);
					e.preventDefault();
				} else if (e.which === 38) { // up
					$.alopex.widget.dropdown._focusPrev(el);
					e.preventDefault();
				} else if (e.which === 27) { // esc
					$(el).close();
				} else if (e.which === 39) { // right
					$.alopex.widget.dropdown._focusChild(el);
				} else if (e.which === 37) { // left
					$.alopex.widget.dropdown._focusParent(el);
				} else if (e.which === 13) { // enter
					var $focused = $(el).find('.af-focused.Focused');
					if ($focused.length > 0) {
						//            $focused.attr('tabindex', '0')[0].focus();
						$(el).find('.af-focused.Focused').trigger('click');
					}

				}
			}
		},

		_select: function(el) {

		},

		_focus: function(el, li) {
			$(el).find('.af-focused.Focused').removeClass('af-focused Focused');
			$(li).addClass('af-focused Focused');
			if (el.focusmove === 'true') {
				li.focus();
			}
			var ul = li.parentNode; // 스크롤이 존재할 경우, scrollTop을 조정해준다.
		    try{
		    	if(li.offsetTop + li.offsetHeight > ul.offsetHeight) {
			    	ul.scrollTop = li.offsetTop + li.offsetHeight - ul.offsetHeight;
			    }
		    }catch(e){}
		},

		_isValidMenu: function($li) {
			if ($li.length <= 0) {
				return true;
			}
			var li = $li[0];
			if (!li.className) {
				return false;
			}
			if (li.className.indexOf('af-menuitem') === -1) {
				return false;
			}
			if (li.className.indexOf('af-disabled Disabled') !== -1) {
				return false;
			}
			if (li.className.indexOf('af-dropdown-header') !== -1) {
				return false;
			}
			if (li.className.indexOf('af-dropdown-divider') !== -1) {
				return false;
			}
			return true;
		},

		_focusPrev: function(el) {
			if (typeof el === undefined) {
				el = this;
			}
			var $el = $(el);
			var $focused = $el.find('.af-focused.Focused');
			var $prev = $focused.prev('li');
			while (!$.alopex.widget.dropdown._isValidMenu($prev)) {
				$prev = $prev.prev('li');
			}
			if ($focused.length !== 0 && $prev.length > 0) {
				$.alopex.widget.dropdown._focus(el, $prev[0]);
			}
		},

		_focusNext: function(el) {
			if (typeof el === undefined) {
				el = this;
			}
			var $el = $(el);
			var $focused = $el.find('.af-focused.Focused');
			var $next = $focused.next('li');
			while (!$.alopex.widget.dropdown._isValidMenu($next)) {
				$next = $next.next('li');
			}
			if ($focused.length === 0 && $el.find('li').length > 0) {
				$.alopex.widget.dropdown._focus(el, $el.find('li')[0]);
			} else if ($next.length !== 0) {
				$.alopex.widget.dropdown._focus(el, $next[0]);
			}
		},

		_focusChild: function(el) {
			if (typeof el === undefined) {
				el = this;
			}
			var $el = $(el);
			var $focused = $el.find('.af-focused.Focused');
			var $submenu = $focused.find('.af-submenu');
			if ($submenu.length > 0 && $submenu.find('li.af-menuitem').length > 0) {
				$.alopex.widget.dropdown.openSubmenu($focused[0]);
				$.alopex.widget.dropdown._focus(el, $submenu.find('li.af-menuitem')[0]);
			}
		},

		_focusParent: function(el) {
			if (typeof el === undefined) {
				el = this;
			}
			var $el = $(el);
			var $focused = $el.find('.af-focused.Focused');
			var $parent = $focused.parents('.af-expandable').eq(0);

			if ($parent.length > 0) {
				$.alopex.widget.dropdown.closeSubmenu($parent[0]);
				$.alopex.widget.dropdown._focus(el, $parent[0]);
			}
		},

		activeList: [],

		open: function(el) {
			var $el = $(el);

			$el.css({
				'display': 'block'
			});
			var dropdownWidth = el.offsetWidth;
			var dropdownHeight = el.offsetHeight;
			var baseWidth = el.base.offsetWidth;
			var baseHeight = el.base.offsetHeight;

			// 팝업 띄우는 거
			var parent = el.offsetParent;
			while(parent) {
				if(parent === document.body || $(parent).css('position') === 'relative' || $(parent).css('position') === 'absolute') {
					break;
				}
				parent = el.offsetParent;
			}
			var basePosition = $.alopex.util.getRelativePosition(el.base); // base엘리먼트의 화면 포지션..
			var coorPosition = $.alopex.util.getRelativePosition(parent); // 엘리먼트 기준.
			var baseLeft = basePosition.left - coorPosition.left;
			var baseTop = basePosition.top - coorPosition.top;

			var top = 0;
			var left = 0;
			switch (el.position) {
			case 'top':
				left = baseLeft;
				top = baseTop - dropdownHeight - el.margin;
				break;
			case 'left':
				left = baseLeft - dropdownWidth - el.margin;
				top = baseTop;
				break;
			case 'right':
				left = baseLeft + baseWidth + el.margin;
				top = baseTop;
				break;
			case 'bottom':
				/* falls through */
			default:
				left = baseLeft;
			top = baseTop + baseHeight + el.margin;
			break;
			}

			// 드랍다운 위치가 윈도우 사이즈보다 클때 보정해준다.
//			var renderWidth = $.alopex.util.getRelativePosition(el).left + dropdownWidth;
//			var windowWidth = $(window).width();
//			if (renderWidth > windowWidth) {
//				left = left - (renderWidth - windowWidth + el.margin);
//			}
//			var renderHeight = $.alopex.util.getRelativePosition(el).top + dropdownHeight;
//			var windowHeight = $(window).height();
//			if (renderHeight > windowHeight) {
//				top = top - (renderHeight - windowHeight + el.margin);
//			}

			$el.css({
				'left': left + 'px',
				'top': top + 'px'
			});
			$.alopex.widget.dropdown.activeList.push(el);
			el.curstate = 'opened';
			$(document).bind('pressed', $.alopex.widget.dropdown._closeByKey);
		},

		close: function(el) {
			var $el = $(el);
			for ( var i = 0; i < $.alopex.widget.dropdown.activeList.length; i++) {
				if ($.alopex.widget.dropdown.activeList[i] === el) {
					$.alopex.widget.dropdown.activeList.splice(i, 1);
					break;
				}
			}
			el.curstate = 'closed';
			$el.hide();

			$el.find('.af-focused.Focused').removeClass('af-focused Focused');
			$(document).unbind('pressed', $.alopex.widget.dropdown._closeByKey);
		}

	});
})(jQuery);
(function($) {

	$.alopex.widget.dropdownbutton = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'dropdownbutton',
		defaultClassName: 'af-button af-dropdownbutton Dropdownbutton',
		setters: ['dropdownbutton', 'setText', 'addHandler', 'setDataSource'],
		getters: ['getText'],

		properties: {
			dropdown: null,
			update: 'true'
		},

		init: function(el, options) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			var $el = $(el);

			var $menu = $el.next().add($(options.menu));
			if ($menu.length === 0 || $menu[0].tagName.toLowerCase() !== 'ul') {
				return;
			}
			$.extend(el, $.alopex.widget.dropdownbutton.properties, options);
			el.dropdown = $menu[0];
			// 변환
			$(el).button();
			$menu.attr('data-type', 'dropdown').dropdown();

			el.dropdown.base = el;
		},

		defer: function(el, options) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			var $menu = $(el.dropdown);
			$menu.addHandler($.alopex.widget.dropdownbutton._defaultHandler);
		},

		_defaultHandler: function(e) {
			var menu = e.data.element;
			var li = e.currentTarget;
			var text = $(li).text();
			if (menu.base.update !== 'false') {
				$(menu.base).text(text);
			}
		},

		setText: function(el, text) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			$(el).text(text);
		},

		getText: function(el) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			return $(el).text();
		},

		addHandler: function(el, handler) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			$(el.dropdown).addHandler(handler);
		},

		setDataSource: function(el, data) {
			if(el.tagName.toLowerCase() == 'div') {
				el = $(el).find('>button, >a, >input');
			}
			$(el.dropdown).setDataSource(data);
		}


	});

})(jQuery);

(function($) {

	/***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * group
	 **********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	$.alopex.widget.group = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'group',
		defaultClassName : 'af-group af-horizontal',
		setters : [ 'group', 'setOrient' ],
		getters : [],

		init : function(el) {
			var $el = $(el);
			if ($.alopex.util.isValid($el.attr('data-orient'))) {
				el.orient = $el.attr('data-orient');
				if (el.orient === 'vertical') {
					$(el).removeClass('af-horizontal');
					$(el).addClass('af-vertical');
				}
			}
			var $inputs = $el.find('input');
			if ($inputs.length === 0) {
				return;
			} else {
				$el.on('change', this._changeEventHandler);
				$(el).trigger('change');
			}
		},

		_changeEventHandler : function(e) {
			var $inputs = $(e.currentTarget).find('input');
			$inputs.removeClass('af-checked Checked');
			$inputs.filter(':checked').each(function() {
				var $label;
				if (this.id) {
					$label = $('label[for="' + this.id + '"]');
				} else {
					$label = $(this).parent('label');
				}
				$label.addClass('af-checked Checked');
			});
		},

		setOrient : function(el, orientation) {
			$(el).removeClass('af-horizontal');
			$(el).removeClass('af-vertical');
			$(el).addClass('af-' + orientation);
		}
	});
})(jQuery);
(function($) {

	/*********************************************************************************************************
	 * button
	 *********************************************************************************************************/
	$.alopex.widget.groupbutton = $.alopex.inherit($.alopex.widget.group, {
		widgetName: 'groupbutton',
		defaultClassName: 'af-groupbutton Groupbutton',
		defaultThemeName: 'af-default af-horizontal',
		setters: ['groupbutton'],
		getters: [],
		
		init: function(el) {
			var $el = $(el);
			$el.on('change', 'input', function(e) {
				var input = e.currentTarget;
				if($(input).parent('label').length>0) {
					var $inputs = $el.find('input');
					for(var i=0; i<$inputs.length; i++) { // radio가 들어가 있는 경우 고려하여 loop 돌면서 체크 
						if($inputs.eq(i).is(':checked')) {
							$inputs.eq(i).parent('label').addClass('af-checked Checked');
						} else {
							$inputs.eq(i).parent('label').removeClass('af-checked Checked');
						}
					}
				}
				
			});
		}
	});

})(jQuery);


(function($) {

	$.alopex.widget.icon = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'icon',
		defaultClassName: 'af-icon Icon',

		setters: ['icon', 'setIcon'],

		setIcon: function(el, icon) {
			$(el).addClass(icon);
		},

		properties: {
			position: 'default',
			size: 14
		},

		init: function(el, options) {
			var $el = $(el);
			if ($.alopex.util.isValid(el.display)) {
				$(el).css('display', el.display);
			} else {
				$(el).css('display', 'inline-block');
			}
			var $parent = $(el.parentNode);
			if($parent.attr('class') && $parent.attr('class').indexOf('Button') != -1) { // button 클래스 하위에 적용. // alopex component만 적용?? TODO 추후 결정.
				$el.css('position', 'absolute');
				
				var position = this._getProperty(el, 'position');
				var size = this._getProperty(el, 'size');
				switch (position) {
				case 'center':
					$el.css({
						'top': '50%',
						'left': '50%',
						'margin-top': '-' + parseInt(size, 10) / 2 + 'px', // image가 14*14 이므로 size 값을 가지고 top과 left에 모두 사용 가능
						'margin-left': '-' + parseInt(size, 10) / 2 + 'px'
					});
					$parent.prepend($el);
					$parent.addClass('af-icon-center');
					
					break;
				case 'top':
					$el.css({
						'top': '10px',
						'left': '50%',
						'margin-left': '-' + parseInt(size, 10) / 2 + 'px'
					});
					$parent.prepend($el);
					$parent.addClass('af-icon-top');
					$parent.css({
						'padding-top': (parseInt(size, 10) * 5 / 4) + 'px'
					});
					break;
				case 'bottom':
					$el.css({
						'bottom': '10px',
						'left': '50%',
						'margin-left': '-' + parseInt(size, 10) / 2 + 'px'
					});
					$parent.append($el);
					$parent.addClass('af-icon-bottom');
					$parent.css({
						'padding-bottom': (parseInt(size, 10) * 5 / 4) + 'px'
					});
					break;
				case 'right':
					$el.css({
						'right': '10px',
						'top': '50%',
						'margin-top': '-' + parseInt(size, 10) / 2 + 'px'
					});
					$parent.append($el);
					$parent.addClass('af-icon-right');
					$parent.css({
						'padding-right': (20 + parseInt(size, 10) * 5 / 4) + 'px'
					});
					break;
				case 'left':
					/*falls through*/
				default:
					$el.css({
						'left': '10px',
						'top': '50%',
						'margin-top': '-' + parseInt(size, 10) / 2 + 'px'
					});
					$parent.prepend($el);
					$parent.addClass('af-icon-left');
					$parent.css('padding-left', (20 + parseInt(size, 10) * 5 / 4) + 'px');
					break;
				}
			}
		}
	});

})(jQuery);
(function($) {

	$.alopex.widget.list = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'list',
		defaultClassName: 'af-list List',
    setters: ['list', 'refresh'],
    
		eventHandlers: {
			hover: {
				event: 'mouseover',
				handler: ''
			}
		},

		event: function(el) {
			this.addHoverHighlight(el, 'li');
			this.addPressHighlight(el, 'li');
		},

		init: function(el) {
			this.refresh.call(this, el);
		},

		refresh: function(el) {
			var i, j;
			var that = this;
			$(el).find('>li').each(function() {
				var row = this;
				if ($(row).attr('data-converted') === 'true') {
					return;
				}

				$(row).bind('click', function(e) {
					var target = e.currentTarget;
					$(target).siblings('li').removeClass('af-pressed');
					$(target).addClass('af-pressed');
				});

				if (!$.alopex.util.isValid($(row).attr('class'))) {
				  if ($(row).attr('data-role') === 'divider') {
				    $(row).addClass('af-list-divider');
				  } else {
				    $(row).addClass('af-list-row');
				  }
				}

				// 이미지(thumbnail 처리)
				var img;
				if ($(row).find('img').length === 1) {
					img = $(row).find('img')[0];
					$(img).addClass('af-list-thumbnail');
					if ($.alopex.util.parseBoolean($(img).attr('data-icon'))) {
						//						$(img).addClass('af-list-thumbnail-icon');
					} else {

					}
				}

				// Title
				$(row).find('h1, h2, h3').each(function() {
					$(this).addClass('af-list-title');
				});

				//				var icon = $(row).find('[data-icon]');
				//				if (icon.length > 0) {
				//					icon.each(function() {
				//						$(this).addClass('af-list-icon af-list-icon-' + $(this).attr('data-icon'));
				//					});
				//				}

				var btn = $(row).find('a');
				if (btn.length > 0) {
					that.addHoverHighlight(row);
					that.addPressHighlight(row);
				}
				if (btn.length === 1) {
					$(btn[0]).addClass('af-list-btn');
				} else if (btn.length === 2) {
					$(btn[0]).addClass('af-list-btn first');
					$(btn[1]).addClass('af-list-btn split');
					that.addHoverHighlight(btn[1]);
					that.addPressHighlight(btn[1]);
				}

				// accordian code
				if (row.getAttribute('data-id')) {
					row.className += ' af-accordion';
					var accordianId = row.getAttribute('data-id');
					$(el).find('#' + accordianId).css('display', 'none');
					$(row).bind('click', function(e) {
						var row = e.currentTarget;
						that.toggle(row);
					});
				}

				//				var rowHeight = row.offsetHeight;
				//				var textblock = document.createElement('div'); // text 영역 wrapper.
				//				$(textblock).attr('class', 'af-list-text');
				//				var children;
				//				if (img) {
				//					var siblings = img.parentNode.childNodes;
				//					for (j = 0; j < siblings.length;) {
				//						if (siblings[j] === img) {
				//							j++;
				//							return;
				//						}
				//						$(siblings[j]).appendTo(textblock);
				//					}
				//					$(textblock).insertAfter(img);
				//				} else if (btn && btn.length > 0) {
				//					children = btn[0].childNodes;
				//					for (j = 0; j < children.length; j) {
				//						$(children[j]).appendTo(textblock);
				//					}
				//					$(textblock).appendTo(btn[0]);
				//				} else {
				//					children = row.childNodes;
				//					for (j = 0; j < children.length; j) {
				//						$(children[j]).appendTo(textblock);
				//					}
				//					$(textblock).appendTo(row);
				//				}
				$(row).attr('data-converted', 'true');
			});
		}

	});

})(jQuery);
(function($) {

	$.alopex.widget.navmenu = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'navmenu',
		defaultClassName: 'af-navmenu Navmenu',
		setters: ['navmenu'],
		getters: [],
		
		properties: {},

		init: function(el) {
			var that = this;
			el.eventState = 'init';
			$(el).find('ul').addClass('af-navmenu-sub').css('display', 'none');
			$(el).find('li').each(function() {
				var li = this;
				var $li = $(li);
				if ($li.find('>ul').find('>li').length > 0) {
					// li button화 하여 focus가게 하기.
					that.addHoverHighlight(li);
					that.addPressHighlight(li);

					$($li).addClass('af-expandable Expandable');
					$($li).append($(document.createElement('span')).addClass('af-navmenu-icon ArrowIcon')[0]);
				}
			});
			$(el).bind('dragstart selectstart', function(e) {
				return false;
			});
			$.alopex.widget.navmenu.resizeHandler();
			$(window).bind('resize', $.alopex.widget.navmenu.resizeHandler);
		},
		
		

		_setTabIndex: function(el) {
			var i;
			if (el && el.children) {
				var liButtons = el.children;
				for (i = 0; i < liButtons.length; i++) {
					if (i === 0) {
						$(liButtons[i]).attr('tabindex', '0');
					} else {
						$(liButtons[i]).attr('tabindex', '-1');
					}
				}
			}

			if ($(el).children().length > 0) {
				for (i = 0; i < $(el).children().length; i++) {
					$($(el).children()[i]).find('li').attr('tabindex', -1);
				}
			}
		},

		setDataSource: function(el, jsonArray) {
			$(el).empty();
			//var ul = $('<ul></ul>').appendTo(el)[0];
			$.alopex.widget.navmenu._createNode(el, jsonArray);
			el.phase = undefined;
			$(el).navmenu();
		},

		_createNode: function(el, jsonArray) {
			for ( var i = 0; i < jsonArray.length; i++) {
				var item = jsonArray[i];
				var li = $('<li></li>').appendTo(el)[0];
				if ($.alopex.util.isValid(item.id)) {
					$(li).attr('data-id', item.id);
				}
				var a = $('<a></a>').appendTo(li)[0];
				if ($.alopex.util.isValid(item.linkUrl)) {
					$(a).attr('href', item.linkUrl);
				}
				if ($.alopex.util.isValid(item.iconUrl)) {
					$('<img/>').attr('src', item.iconUrl).appendTo(li);
				}
				//        $('<span></span>').html(item.text).appendTo(a);
				$(a).text(item.text);

				if ($.alopex.util.isValid(item.items)) {
					var subul = $('<ul></ul>').appendTo(li)[0];
					$.alopex.widget.navmenu._createNode(subul, item.items);
				}
			}
		},

		resizeHandler: function() {
			var menus = $('ul[data-type="navmenu"]');
			var clientWidth = document.documentElement.clientWidth;
			if (clientWidth <= 600) { // mobile
				menus.removeClass('af-desktop').addClass('af-mobile').each(function() {
					$.alopex.widget.navmenu.removeMobileEvent(this);
					$.alopex.widget.navmenu.removeDesktopEvent(this);
					$.alopex.widget.navmenu.addMobileEvent(this);
				});

			} else {
				menus.addClass('af-desktop').removeClass('af-mobile').each(function() {
					$.alopex.widget.navmenu.removeMobileEvent(this);
					$.alopex.widget.navmenu.removeDesktopEvent(this);
					$.alopex.widget.navmenu.addDesktopEvent(this);
				});
			}
			menus.find('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
		},

		addDesktopEvent: function(el) {
			var tempEl = el;

			$(el).bind('keydown', function(e) {
				var target = e.target;

				var code = (e.keyCode ? e.keyCode : e.which);
				switch (code) {
				case 27: // ESC
					var parentNav = $(target).closest('ul');

					while ($(parentNav).attr('data-type') !== 'navmenu') {
						parentNav.find('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						parentNav = $(parentNav.parent()).closest('ul');
					}
					$(parentNav.find('.af-navmenu-expand.Expanded').find('> a')).focus();
					parentNav.find('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					break;
				default:
					return;
				}
				e.stopPropagation();
				e.preventDefault();
			});

			$(el).bind('focusin', function(e) {
				var target = e.target;
				var parentNav = $(target).closest('ul');
				var li;
				if (parentNav !== undefined && parentNav[0] === tempEl) {
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				} else {
					//$(tempEl).find('li').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				}
			});

			$(el).focusout(function(e) {
				var target = e.target;
				var parentNav = $(target).closest('ul');
				var isParent = false;
				if (target !== undefined && $(parentNav).attr('class') !== undefined && $(parentNav).attr('class').indexOf('af-navmenu') !== -1) {
					isParent = false;
				} else {
					isParent = true;
				}

				if (isParent && parentNav[0] !== tempEl) {
					$(tempEl).find('li').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
				}
			});

			$(el).bind('mouseleave', function(e) { // hoverend to mousemove
				var target = e.target;
				var parentNav = $(target).closest('ul');

				while ($(parentNav).attr('data-type') !== 'navmenu') {
					parentNav.find('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					parentNav = $(parentNav.parent()).closest('ul');
				}
				parentNav.find('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
			});

			$(el).bind('mousemove', function(e) { // hoverend to mousemove
				var target = e.target;
				var parentNav = $(target).closest('ul');
				var li;
				if (parentNav !== undefined && parentNav[0] === tempEl) {
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				} else {
					//$(tempEl).find('li').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				}
			});
		},

		removeDesktopEvent: function(el) {
			$(el).unbind('click').unbind('keydown');
		},

		addMobileEvent: function(el) {
			var tempEl = el;
			$(el).find('li').bind('click', function(e) {
				var target = e.target;
				var parentNav = $(target).closest('ul');
				var li;
				if (parentNav !== undefined && parentNav[0] === tempEl) {
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				} else {
					//$(tempEl).find('li').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					li = $(target).closest('li')[0];
					if ($(li).attr('class') !== undefined && $(li).hasClass('af-expandable Expandable')) {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
						$(li).addClass('af-navmenu-expand Expanded').find('> ul').css('display', 'inline-block');
					} else {
						$(li).siblings('.af-navmenu-expand.Expanded').removeClass('af-navmenu-expand Expanded').find('> ul').css('display', 'none');
					}
				}
			});
		},

		removeMobileEvent: function(el) {
			$(el).find('li').unbind('click');
		}
	});

})(jQuery);



(function($) {
	if (window['AlopexOverlay']) {
		return;
	}
	var defaultOverlayOption = {
		bgColor : '#fff',
		duration : 0,
		durationOff : 200,
		opacity : 0.7,
		progress : false,
		createProgress : null,
		resizeProgress : null,
		removeProgress : null,
		appendIn : false,
		complete : null
	};

	// 해당 element에 맞는 크기의 overlay용 div를 만들어서 리턴한다.
	var AlopexOverlay = function(elem, option) {
		if (!elem) {
			return null;
		}
		this.option = $.extend({}, defaultOverlayOption, option);
		if (elem === document || elem === document.body) {
			this.option.appendIn = true;
		}
		this.target = elem === document ? document.body : elem;
		this.overlay = null;
		this.ptimer = null;
		this.progress = null;
		this.on = false;

		this.init = function(complete) {
			this.remove();
			this.on = true;
			var css = {};
			var jelem = $(this.target);
			if (jQuery.support.opacity) {
				css['opacity'] = this.option.opacity;
			} else {
				css['filter'] = 'Alpha(opacity=' + (this.option.opacity * 100)
						+ ')';
			}
			css['background-color'] = this.option.bgColor;
			css['z-index'] = 99990;
			css['position'] = 'absolute';
			css['border-radius'] = jelem.css('border-radius');
			css = $.extend(css, this.generateSize());

			this.overlay = $('<div></div>').css(css).addClass('alopex_overlay')[0];
			var cfunc = complete || this.option.complete;
			jelem[this.option.appendIn ? 'append' : 'after']($(this.overlay)
					.fadeIn(this.option.duration, function() {
						if (typeof cfunc === 'function') {
							cfunc();
						}
					}));
			if (this.option.progress) {
				if (typeof this.option.createProgress === 'function') {
					// 내부 함수에서는 this.target과 this.overlay를 가지고 제어를 할 수 있게 된다.
					// custom progress는 생성한 progress element의 root를 리턴한다.
					// 타이머 사용시 this.ptimer를 사용하도록 한다.
					// 생성한 프로그레스 element는 alopex_progress클래스를 가지도록 한다.
					this.option.createProgress.call(this);
				}
			}
			return this;
		};
		this.extendOption = function(option) {
			if (option) {
				this.option = $.extend({}, this.option, option);
			}
		};
		this.generateSize = function() {
			var css = {};
			var jelem = $(this.target);
			if (this.target === document || this.target === document.body) {
				this.target = document.body;
				jelem = $(document.body);
				css['width'] = css['height'] = '100%';
				css['top'] = css['left'] = 0;
				css['position'] = 'fixed';
			} else if (jelem.css('position') === 'relative'
					&& this.option.appendIn) {
				css['width'] = css['height'] = '100%';
				css['top'] = css['left'] = 0;
			} else {
				var relparent = false;
				$(this.target).parents().each(function(i, el) {
					if ($(this).css('position') === 'relative') {
						relparent = true;
					}
				});
				if (relparent) {
					var poffset = $(this.target.parentElement).offset();
					css['width'] = jelem.outerWidth();
					css['height'] = jelem.outerHeight();
					css['top'] = jelem.offset().top - poffset.top;
					css['left'] = jelem.offset().left - poffset.left;
				} else {
					css['width'] = jelem.outerWidth();
					css['height'] = jelem.outerHeight();
					css['top'] = jelem.offset().top;
					css['left'] = jelem.offset().left;
				}
			}
			return css;
		};
		this.resize = function() {
			// this.overlay.animate(this.generateSize());
			$(this.overlay).css(this.generateSize());
			if (this.option.progress) {
				if (typeof this.option.resizeProgress === 'function') {
					this.option.resizeProgress.call(this);
				}
			}
			return this;
		};
		this.remove = function(complete) {
			var dur = this.option.durationOff;
			this.on = false;
			if (typeof this.option.removeProgress === 'function') {
				this.option.removeProgress.call(this);
			}
			$(this.target).find('.alopex_progress').remove();
			$(this.target).find('.alopex_overlay').add(this.overlay).fadeOut(
					dur, function() {
						if (typeof complete === 'function') {
							complete();
						}
						$(this).remove();
					});
			return this;
		};
		this.init();
	};

	AlopexOverlay.defaultOption = defaultOverlayOption;

	var defaultOverlayProgress = function() {
		var dur = this.option.duration;
		var pcss = {
			position : 'absolute',
			margin : '0 auto',
			// overflow:'hidden',
			display : 'inline-block',
			'*display' : 'inline',
			zoom : 1,
			'text-align' : 'center',
			'z-index' : 99991
		};
		var bcss = {
			display : 'block',
			float : 'left',
			width : '12px',
			height : '12px',
			margin : '4px',
			'border-radius' : '3px'
		};
		var p = this.progress = $('<div></div>').css(pcss).addClass(
				'alopex_progress');
		var b = [];
		var blocknum = 3;
		for (var i = 0; i < blocknum; i++) {
			b
					.push($('<div></div>').css(bcss).addClass(
							'alopex_progress_block'));
			p.append(b[i]);
		}
		// this.progress.insertAfter(this.overlay);
		this.progress.fadeIn(dur).insertAfter(this.overlay);
		p.css('left', this.generateSize().left + $(this.overlay).innerWidth()
				/ 2 - p.width() / 2);
		p.css('top', this.generateSize().top + $(this.overlay).innerHeight()
				/ 2 + $(this.target).scrollTop() - p.height() / 2);
		var pcolor = [ '#68838B', '#BFEFFF', '#BFEFFF' ];
		var intervalFunc = function() {
			for (var i = 0; i < b.length; i++) {
				b[i].css('background-color', pcolor[i]);
			}
			pcolor.unshift(pcolor.pop());
		};
		intervalFunc();
		this.ptimer = setInterval(intervalFunc, 150);
		return p;
	};
	var defaultOverlayProgressResize = function() {
		var p = this.progress, size = this.generateSize();
		p.css('left', size.left + $(this.overlay).innerWidth() / 2 - p.width()
				/ 2);
		p.css('top', size.top + $(this.overlay).innerHeight() / 2 - p.height()
				/ 2);
	};
	var defaultOverlayProgressRemove = function() {
		var dur = this.option.durationOff;
		var that = this;
		if (this.progress) {
			$(this.progress).fadeOut(dur, function() {
				if (that.ptimer) {
					clearInterval(that.ptimer);
					that.ptimer = null;
				}
				$(that.progress).remove();
				that.progress = null;
			});
		}
	};

	defaultOverlayOption['createProgress'] = defaultOverlayProgress;
	defaultOverlayOption['resizeProgress'] = defaultOverlayProgressResize;
	defaultOverlayOption['removeProgress'] = defaultOverlayProgressRemove;
	defaultOverlayOption['stepProgress'] = null;

	window['AlopexOverlay'] = AlopexOverlay;
	$.each([ 'progress', 'overlay' ], function(i, v) {
		$.fn[v] = function(op) {
			if (!this.length) {
				return;
			}
			var overlay = $(this[0]).data('alopexOverlay');
			var option = $.extend({
				progress : (v === 'progress')
			}, op);
			if (!overlay || !overlay.on) {
				overlay = new AlopexOverlay(this[0], option);
				$(this[0]).removeData('alopexOverlay');
				$(this[0]).data('alopexOverlay', overlay);
			}
			overlay.extendOption(op);
			return overlay;
		};
	});
	
	window.AlopexProgressCount = 0;
	function PlatformUIComponent() {}
	PlatformUIComponent.prototype.showProgressDialog = function(option) {
		var wrapper = document.getElementById('AlopexProgress');
		if(!wrapper) {
			var wrapper = document.createElement('div');
			wrapper.setAttribute('id', 'AlopexProgress');
			var image = document.createElement('div');
//			image.setAttribute('src', '../../build/images/common/loading_1.gif');
//			image.setAttribute('style', ' ');
			image.setAttribute('class', 'af-progress-sample');
			wrapper.appendChild(image);
			document.body.appendChild(wrapper);
		}
		var progressMask = document.getElementById('AlopexProgressMask');
		if(!progressMask) {
			var progressMask = document.createElement('div');
			progressMask.setAttribute('id', 'AlopexProgressMask');
			progressMask.setAttribute('class', 'af-progress-sample-mask');
			document.body.appendChild(progressMask);
		}
		window.AlopexProgressCount ++ ;
	};

	PlatformUIComponent.prototype.dismissProgressDialog = function() {
		window.AlopexProgressCount --;
		if(window.AlopexProgressCount == 0) {
			var wrapper = document.getElementById('AlopexProgress');
			if(wrapper) {
				wrapper.parentNode.removeChild(wrapper);
			}
			var progressMask = document.getElementById('AlopexProgressMask');
			if(progressMask) {
				progressMask.parentNode.removeChild(progressMask);
			}
		}
	};
	platformUIComponent = new PlatformUIComponent();

})(jQuery);

(function($) {

	/*********************************************************************************************************
	 * button
	 *********************************************************************************************************/
	$.alopex.widget.paging =
	$.alopex.widget.pagination = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'pagination',
		/**
		 * property 
		 */
		// class property
		defaultClassName: 'af-paging Paging',
		
		classNames: {
			
		},

		setters: ['pagination', 'paging', 'setTotalPage', 'setMaxPage', 'setSelectedPage', 'setCurrentPage', 'setDataLength', 'setPerPage', 'setPageLink'],
		getters: ['getSelectedPage', 'getCurrentPage', 'getDataLength', 'getPerPage'],

		// button widget common options
		widgetOptions: {

		},
		
		destHandler: {
			'first': {
				classname: 'af-paging-first',
				handler: '_first'
			},
			'previous': {
				classname: 'af-paging-prev',
				handler: '_prev'
			},
			'prev': {
				classname: 'af-paging-prev',
				handler: '_prev'
			},
			'previouspages': {
				classname: 'af-paging-prevgroup',
				handler: '_prevgroup'
			},
			'prev-group': {
				classname: 'af-paging-prevgroup',
				handler: '_prevgroup'
			},
			'next': {
				classname: 'af-paging-next',
				handler: '_next'
			},
			'nextpages': {
				classname: 'af-paging-nextgroup',
				handler: '_nextgroup'
			},
			'next-group': {
				classname: 'af-paging-nextgroup',
				handler: '_nextgroup'
			},
			'last': {
				classname: 'af-paging-last',
				handler: '_last'
			}
		},
		
		buttonHandler: {
			'First': {
				handler: '_first'
			},
			'Prev': {
				handler: '_prev'
			},
			'Prev-group': {
				handler: '_prevgroup'
			},
			'Next': {
				handler: '_next'
			},
			'Next-group': {
				handler: '_nextgroup'
			},
			'Last': {
				handler: '_last'
			}
		},
			
		// element options
		options: {

		},

		// 엘리먼트 내 이벤트 바인딩 해야 되는 부분
		// selector가 없는 경우에는 element에 등록됨.
		eventHandlers: {
		},
		
		properties: {
			maxpage: 10,
			pagelink: 10,
			totalpage: 10,
			startpage: 1, // 현재 그룹의 시작 페이지
			endpage: 10, // 현재 그룹의 마지막 페이지
			perpage: 10,
			datalength: 0,
			selectedPage: 1,
			pagingType: null
		},
		
		getPerPage: function(el) {
			return el.perpage;
		},
		
		getDataLength: function(el) {
			return el.datalength;
		},
		
		setCurrentPage: function(el) {
			return this.setSelectedPage(el);
		},
		
		setDataLength: function(el, datalength) {
			el.datalength = datalength;
			$(el).attr('data-datalength', datalength);
			el.totalpage = Math.ceil(el.datalength / el.perpage);
			this.setTotalPage(el, el.totalpage);
		},
		
		setPerPage: function(el, perpage) {
			el.perpage = perpage;
			$(el).attr('data-perpage', perpage);
			el.totalpage = Math.ceil(el.datalength / el.perpage);
			this.setTotalPage(el, el.totalpage);
		},

		event: function(el) {
//			this.addHoverHighlight(el);
//			this.addPressHighlight(el);
		},
		
		

		init: function(el, options) {
			var $el = $(el);
			var $links = $(el).find('a:not([data-dest], .Prev, .Prev-group, .First, .Next, .Next-group, .Last)');
			$links.each(function(index, el) {
				$links.eq(index).attr('data-page', index+1);
			});
			$.extend(el, {
				pages: null,
				nextbutton: $el.find('[data-dest*="next"], .next').eq(0)
			}, this.properties, options);
			
			el.pagelink = el.maxpage = parseInt($el.attr('data-maxpage'), 10) || parseInt($el.attr('data-pagelink'), 10) || $links.length || el.maxpage;
			$(el).attr('data-maxpage', el.maxpage);
			$(el).attr('data-pagelink', el.pagelink);

			// data-_generateLink : 이 플래그 있을 시 page 링크 자동 추가.
			el.pagingType = $el.attr('data-generateLink');
			this._generateLink(el);
			
			el.datalength = ($el.attr('data-datalength')) ? parseInt($el.attr('data-datalength'), 10) : el.datalength;
			$(el).attr('data-datalength', el.datalength);
			
			el.perpage = ($el.attr('data-perpage')) ? parseInt($el.attr('data-perpage'), 10) : el.perpage;
			$(el).attr('data-perpage', el.perpage);
			
//			el.totalpage = ($el.attr('data-totalpage')) ? parseInt($el.attr('data-totalpage'), 10) : Math.ceil(el.datalength/el.perpage);
			el.totalpage = ($el.attr('data-totalpage')) ? parseInt($el.attr('data-totalpage'), 10) : $links.length;
			
			$(el).attr('data-totalpage', el.totalpage);

			this._addPageEventHandler(el);
			this._addButtonEventHandler(el);
			var selectedPgae = parseInt($el.attr('data-selected'), 10) || parseInt($el.find('.selected').attr('data-page'), 10) || parseInt($el.find('.Selected').attr('data-page'), 10) || 1;
			this.setSelectedPage(el, selectedPgae);
			$el.bind('selectstart', function(e) {
				return false;
			});
		},

		_first : function(e) {
			var el = e.currentTarget.element;
			if (el.selectedPage !== 1) {
				var targetpage = 1;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [ targetpage ]);
			}
		},

		_last : function(e) {
			var el = e.currentTarget.element;
			if (el.selectedPage !== el.totalPage) {
				var targetpage = el.totalpage;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [ targetpage ]);
			}
		},

		_prev: function(e) {
			var el = e.currentTarget.element;
			if (el.selectedPage !== 1) {
				var targetpage = el.selectedPage - 1;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [targetpage]);
			}
		},

		_prevgroup: function(e) {
			var el = e.currentTarget.element;
			var targetpage;
			if (el.startpage !== 1) {
				targetpage = el.startpage - el.maxpage;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [targetpage]);
			} else {
//				targetpage = 1;
			}
			
		},

		_next: function(e) {
			var el = e.currentTarget.element;
			if (el.selectedPage !== el.totalpage) {
				var targetpage = el.selectedPage + 1;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [targetpage]);
			}
		},

		_nextgroup: function(e) {
			var el = e.currentTarget.element;
			var targetpage;
			if (el.endpage !== el.totalpage) {
				targetpage = el.startpage + el.maxpage;
				$.alopex.widget.pagination.setSelectedPage(el, targetpage);
				$(el).trigger('pagechange', [targetpage]);
			} else {
//				targetpage = el.totalpage;
			}
			
		},

		_addPageEventHandler : function(el) {
			__ALOG('pages === ', el.pages);
			var that = this;
			$(el.pages).on('click', function(e) {
				var alink = e.currentTarget;
				that.setSelectedPage(alink.container, alink.page);
				var el = $(alink).closest('[data-type="pagination"]');
				$(el).trigger('pagechange', [ alink.page ]);
			});
		},
		
		
		_addButtonEventHandler : function(el) {
			var $el = $(el);
			// 이동 버튼 관련 코드.
			var buttons = $el.find('[data-dest]');
			if (buttons.length == 0) { // if markup is written with new conversion.
				for ( var i in this.buttonHandler) {
					var $button = $el.find('.' + i).on('click', this[this.buttonHandler[i].handler]);
					if($button.length > 0) {
						$button[0].element = el;
					}
				}
			} else {
				for (var i = 0; i < buttons.length; i++) {
					var dest = $(buttons[i]).attr('data-dest');
					buttons[i].element = el;
					buttons.eq(i).addClass(this.destHandler[dest].classname).attr('data-type', 'button').button().on('click', this[this.destHandler[dest].handler]);
				}
			}
		},

		_removeLink: function(el) {
			for ( var i = 0; i < el.pages.length; i++) {
				if (el.tagName.toLowerCase() === 'ul') { // NH custom
					$(el.pages).parents('li').remove();
				} else {
					$(el.pages).remove();
					break;
				}
			}

		},

		_generateLink: function(el) {
			var i;
			if ($(el).find('a:not([data-dest])').length === 0) {
				for (i = 0; i < el.maxpage; i++) {
					var alink = document.createElement('a');
					if (el.pagingType !== 'mobile') {
						alink.innerHTML = i + 1 + '';
					}

					if (el.tagName.toLowerCase() === 'ul') { // NH custom
						var li = document.createElement('li');
						$(alink).appendTo(li);
						$(li).css('display', 'none');
						if (el.nextbutton.length > 0) {
							$(li).insertBefore($(el.nextbutton).parents('li'));
						} else {
							$(li).appendTo(el);
						}
					} else {
						$(alink).css('display', 'none');
						if (el.nextbutton.length > 0) {
							$(alink).insertBefore(el.nextbutton);
						} else {
							$(alink).appendTo(el);
						}
					}
				}
			}

			el.pages = $(el).find('a:not([data-dest], .Prev, .Prev-group, .First, .Next, .Next-group, .Last)');
			for (i = 0; i < el.pages.length; i++) {
				el.pages[i].page = i + 1;
				el.pages[i].index = i;
				el.pages[i].container = el;
				if (el.pagingType === 'mobile') {
					$(el.pages[i]).addClass('af-paging-mobile');
				} else {
					$(el.pages[i]).addClass('af-paging-number');
				}
			}
		},

		/**
		 * 페이지 indicator 내에 페이지 정보 수정.
		 * @param {integer} page 페이지 그룹 내에 들어갈 특정 페이지.
		 */
		_changePageGroup: function(el, page) {
			el.startpage = 1;
			el.endpage = el.maxpage;
			if (el.maxpage !== 0) {
			  while (page > el.endpage) {
			    el.startpage += el.maxpage;
			    el.endpage += el.maxpage;
			  }
			}
			if (el.endpage > el.totalpage) {
				el.endpage = el.totalpage;
			}
			for ( var i = 0; i < el.pages.length; i++) {
				if (el.startpage + i <= el.totalpage) {
					if (el.tagName.toLowerCase() === 'ul') { // NH custom
						$(el.pages[i]).parents('li').css('display', '');
					} else {
						$(el.pages[i]).css('display', '');
					}

					el.pages[i].page = el.startpage + i;
					if (el.pagingType !== 'mobile') {
						el.pages[i].innerHTML = el.startpage + i;
					}
				} else {
					if (el.tagName.toLowerCase() === 'ul') { // NH custom
						$(el.pages[i]).parents('li').css('display', 'none');
					} else {
						$(el.pages[i]).css('display', 'none');
					}
					el.pages[i].page = NaN;
				}
			}
		},

		_enableAllButton: function(el) {
			$(el).find('[data-dest], .first, .prev, .prev-group, .next, .next-group, .last')
				.setEnabled(true).css('visibility', 'visible');
		},

		_disableButton: function(el, btnType) {
			var $button = $(el).find('[data-dest="' + btnType + '"]');
			if($button.length == 0) { // 새로운 스타일에서는 
				$(el).find('.'+btnType).setEnabled(false);
			} else {
				if ($(el).attr('data-button-behavior') === 'disable') {
					$button.setEnabled(false);
				} else if ($(el).attr('data-button-behavior') === 'show'){
				} else {
					$button.css('visibility', 'hidden');
				}
			}
		},

		getSelectedPage: function(el) {
			return el.selectedPage;
		},
		
		getCurrentPage: function(el) {
			return this.getSelectedPage(el);
		},

		setTotalPage: function(el, totalpage, destpage) {
			totalpage = parseInt(totalpage, 10);
			el.totalpage = totalpage;
			$(el).attr('data-totalpage', totalpage);
			if (el.selectedPage > totalpage) {
			  el.selectedPage = totalpage;
			}
			//this._changePageGroup(el, el.selectedPage);
			if ($.alopex.util.isValid(destpage)) {
				this.setSelectedPage(el, destpage);
			} else {
			  this.setSelectedPage(el, el.selectedPage);
			}
		},

		setSelectedPage: function(el, page) {
			page = parseInt(page, 10);
			this._changePageGroup(el, page);

			var strong = $(el).find('strong');
			if (strong.length !== 0) {
				$(strong[0]).replaceWith(strong[0].children);
			}
			for ( var i = 0; i < el.pages.length; i++) {
				el.pages.eq(i).removeClass('af-paging-selected Selected');
				if (el.startpage + i === page) {
					el.pages.eq(i).addClass('af-paging-selected Selected').children().wrap('<strong></strong>');
				}
			}
			el.selectedPage = page;

			this._enableAllButton(el);
			if (el.selectedPage === 1) { // disable first button
				this._disableButton(el, 'first');
				this._disableButton(el, 'prev');
			}
			if (el.selectedPage === 1) { // disable prev button
				
			}
			if (el.startpage === 1) { // disable prev group button
				this._disableButton(el, 'prev-group');
			}
			if (el.selectedPage === el.totalpage) { // disable next button
				this._disableButton(el, 'next');
			}
			if (el.endpage === el.totalpage) { // disable next group button
				this._disableButton(el, 'next-group');
			}
			if (el.selectedPage === el.totalpage) { // disable last button
				this._disableButton(el, 'last');
			}
		},

		setMaxPage: function(el, page, destpage) {
			page = parseInt(page, 10);
			el.maxpage = page;
			el.pagelink = page;
			$(el).attr('data-pagelink', page);
			$(el).attr('data-maxpage', page);
			
			this._removeLink(el);
			this._generateLink(el);
			this._addPageEventHandler(el);
			if ($.alopex.util.isValid(destpage)) {
				this.setSelectedPage(el, destpage);
			} else {
				this.setSelectedPage(el, el.selectedPage);
			}
		},
		
		setPageLink: function(el, page, destpage) {
			return this.setMaxPage(el, page, destpage);
		}
		
	});

})(jQuery);
(function($) {

	$.alopex.widget.panel = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'panel',
		defaultClassName: 'af-panel Panel',

		setters: ['panel', 'refresh', 'scrollToElement'],
		getters: [],

		properties: {

		},

		eventHandlers: {},

		init: function(el, options) {
			var $el = $(el);
			if (el.getAttribute('data-fill') !== undefined) {
				$.alopex.widget.panel._fill(el);
			}
			if ($.alopex.util.parseBoolean(el.getAttribute('data-scroll'))) {
				this._makeScrollable(el);
			}
			$(window).bind('resize', $.alopex.widget.panel._resize);

			if ($el.attr('data-responsive') !== undefined) {
				$el.css('float', 'left').css('width', '100%');
				$(window).bind('resize', $.alopex.widget.panel._responsive);
				this._responsive();
			}
		},

		_responsive: function() {
			$('[data-responsive]').each(function() {
				var el = this;
				var width = 100;
				var parentWidth = parseFloat($(el).attr('data-responsive').split('-')[0]);
				var panelWidth = parseFloat($(el).attr('data-responsive').split('-')[1]);
				var clientWidth = document.documentElement.clientWidth;

				if (clientWidth <= $.alopex.responsive.threshold) {

				} else if (clientWidth > $.alopex.responsive.threshold && clientWidth <= 900) {
					width = panelWidth / parentWidth * 100;
				} else {
					width = panelWidth / parentWidth * 100;
				}
				$(el).css('width', width + '%');
			});
		},

		_makeScrollable: function(el) {
			try {
				//        var el = this;
				if (window.browser === 'mobile' && typeof iScroll !== 'undefined') {
					var iScrollOption = {};
					if ((/iphone|ipad/gi).test(navigator.appVersion)) {
						iScrollOption.useTransform = true;
					} else {

						if ($(el).find('input').length > 0 || $(el).find('textarea').length > 0) {
							iScrollOption.useTransform = false;
						} else {
							iScrollOption.useTransform = true;
						}
					}
					iScrollOption.onBeforeScrollStart = function(e) {
						var target = e.target;
						while (target.nodeType !== 1) {
							target = target.parentNode;
						}

						if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
							e.preventDefault();
						}
					};
					iScrollOption.checkDOMChanges = true;
					el.style.position = 'relative';
					el.scroll = new iScroll(el, iScrollOption);
					el.scroll.onScrollEnd = function(e) {
						$(el).trigger('scrollend', e);
					};
				} else {
					// For IE7.
					$(el).css('position', 'relative');
					$(el).css('overflow', 'auto');
					if (el.children.length >= 1) {
						if (el.offsetHeight < el.children[0].offsetHeight) {
							$(el).css('overflow-y', 'scroll');
						}
						if (el.offsetWidth < el.children[0].offsetWidth) {
							$(el).css('overflow-x', 'scroll');
						}
					}
				}
			} catch (e) {
				throw new Error('[makeScrollable] ' + e);
			}
		},

		scrollToElement: function(el, selector, time) {
			if (window.browser === 'mobile') {
				el.scroll.scrollToElement(selector, time);
			} else {
				if ($(el).find(selector).length > 0) {
					el.scrollTop = $(el).find(selector)[0].offsetHeight;
				}

			}
		},

		_resize: function(e) {
			$('[data-type="panel"]').refresh();
		},

		refresh: function(el) {
			if (el.getAttribute('data-fill') !== undefined) {
				$.alopex.widget.panel._fill(el);
			}
			if ($.alopex.util.parseBoolean(el.getAttribute('data-scroll'))) {
				$.alopex.widget.panel._scroll_refresh(el);
			}
		},

		_scroll_refresh: function(el) {
			if (el.scroll) {
				el.scroll.refresh();
			} else {
				$(el).css('overflow', 'auto');
				if (el.children.length >= 1) {
					if (el.offsetHeight < el.children[0].offsetHeight) {
						$(el).css('overflow-y', 'scroll');
					}
					if (el.offsetWidth < el.children[0].offsetWidth) {
						$(el).css('overflow-x', 'scroll');
					}
				}
			}
		},

		_fill: function(el) {
			var setting = el.getAttribute('data-fill');
			var tmp = el.style.display;
			el.style.display = 'none';
			switch (setting) {
				case 'vertical':
					this.fillVertical(el);
					break;
				case 'horizontal':
					this.fillHorizontal(el);
					break;
				case 'both':
					this.fillVertical(el);
					this.fillHorizontal(el);
					break;
				default:
					break;
			}
			el.style.display = tmp;
		},

		fillVertical: function(el) {
			var parentHeight = $(el.parentNode).height() - (el.parentNode.offsetHeight - el.parentNode.clientHeight);
			var siblingHeight = 0;
			var children = el.parentNode.children;
			for ( var i = 0; i < children.length; i++) {
				if (children[i] !== el) {
					// check floated element
					if (children[i].style.position !== 'absolute') {
						siblingHeight += $(children[i]).height();
						if (!isNaN(parseInt($(children[i]).css('margin-top'), 10))) {
							siblingHeight += parseInt($(children[i]).css('margin-top'), 10);
						}
						if (!isNaN(parseInt($(children[i]).css('margin-bottom'), 10))) {
							siblingHeight += parseInt($(children[i]).css('margin-bottom'), 10);
						}
					}
				}
			}

			$(el).css('height', (parentHeight - siblingHeight) + 'px');
		},

		fillHorizontal: function(el) {
			var parentWidth = $(el.parentNode).width() - (el.parentNode.offsetWidth - el.parentNode.clientWidth);
			var siblingWidth = 0;
			var children = el.parentNode.children;
			for ( var i = 0; i < children.length; i++) {
				if (children[i] !== el) {
					if (children[i].style.position !== 'absolute') {
						siblingWidth += $(children[i]).width();
						if (!isNaN(parseInt($(children[i]).css('margin-left'), 10))) {
							siblingWidth += parseInt($(children[i]).css('margin-left'), 10);
						}
						if (!isNaN(parseInt($(children[i]).css('margin-right'), 10))) {
							siblingWidth += parseInt($(children[i]).css('margin-right'), 10);
						}
					}
				}
			}
			$(el).css('width', (parentWidth - siblingWidth) + 'px');
		}
	});

})(jQuery);

// constructor : markup, style, init, event, defer: timing issue에 사용.
(function($) {
	
	$.alopex.widget.progressbar= $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'progressbar',
		/**
		 * property 
		 */
		// class property
		defaultClassName: 'af-progressbar Progressbar',

		setters: ['progressbar', 'setValue', 'setOptions'],
		getters: ['getValue'],

		properties: {
			starttext : null,
			endtext : null,
			textColor : null
		},

		eventHandlers: {
		},
		
		init: function(el, option) {
			
			$.extend(el, this.properties, option);
			
			var progEl;
			if(el.progEl){
				progEl = el.progEl 
			}else{
				progEl = document.createElement('div');
			}
			
			progEl.minValue = 0;
			progEl.maxValue = 100;
			progEl.value = 0;
			$(progEl).attr('style', 'position:relative; left:0px;'); // top:0px; width:0px');
			el.appendChild(progEl);
			$(progEl).css('height', $(el).css('height'));
			progEl.maxWidth = $(el).css('width').split('px')[0];

			var defaultVal = $(el).attr('data-default');
			if ($.alopex.util.isValid(defaultVal)) {
				progEl.value = defaultVal;
				$(progEl).css('border', $(el).css('border'));
				$(progEl).css('width', (progEl.maxWidth * (defaultVal / progEl.maxValue)) + 'px');
			}
			else{
				$(progEl).css('width', '0px');
			}
			
			if( $(el).hasClass('Progress-text')){
				
				option.showText = true;
				
				var textEl;
				if(el.textSpan){
					textEl = el.textSpan;
				}else{
					textEl = document.createElement('span');
				}
				
				$(textEl).attr('style', 'position: absolute; ');//top: 0px;
				$(textEl).css('height', ($(el).css('height')));
				$(textEl).css('width', ($(el).css('width')));
				$(textEl).css('left', ($(el).css('width').split('px')[0] / 2 - 35) + 'px');
				
				if (el.starttext) {
					textEl.startProg = el.starttext;
					$(textEl).text(textEl.startProg);
				}else{
					$(textEl).text("0%");
				}
				if (el.endtext){
					textEl.endProg = el.endtext;
				}
				if ($.alopex.util.isValid(el.textColor) && el.textColor) {
					$(textEl).css('color', el.textColor);
				}
				if ($.alopex.util.isValid(defaultVal)) {
					if (defaultVal === "100" && textEl.endProg) {
						$(textEl).text(textEl.endProg);
					} else if (defaultVal === "0" && textEl.startProg) {
						$(textEl).text(textEl.startProg);
					} else {
						$(textEl).text(defaultVal + '%');
					}
				}
				$(progEl).append(textEl);
				$(textEl).appendTo(progEl);
				
				el.textSpan = textEl;
			}

			
//			var overlayEl;
//			if(el.overlayEl){
//				overlayEl = el.overlayEl 
//			}else{
//				overlayEl = document.createElement('div');
//			}
//
//			$(overlayEl).attr('style',
//					'position:relative; ' + 'opacity: 0; filter: progid:DXImageTransform.Microsoft.Alpha(opacity=60); ' + '-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=30)";');
//			$(overlayEl).css('height', $(progEl).css('height'));
//			$(overlayEl).css('background-color', $(progEl).css('height'));
//			progEl.appendChild(overlayEl);
			el.progEl = progEl;
//			el.overlayEl = overlayEl;
		
		},
		
		setOptions: function(el, options) {
			
			var progEl;
			if(el.progEl){
				progEl = el.progEl 
			}else{
				progEl = el.children[0];
			}

//			var overlayEl;
//			if(el.overlayEl){
//				overlayEl = el.overlayEl 
//			}else{
//				overlayEl = progEl.children[0];
//			}

			// background color
			if ($.alopex.util.isValid(options.bgColor)) {
				$(progEl).css('background-color', options.bgColor);
			}
			if ($.alopex.util.isValid(options.bgUrl)) {
				$(progEl).css('background-image', 'url(' + options.bgUrl + ')');
			}
//			if ($.alopex.util.isValid(options.overlayColor)) {
//				$(overlayEl).css('background-color', options.overlayColor);
//			}
			if ($.alopex.util.isValid(options.showText) && options.showText) {
				var textEl;
				if(el.textSpan){
					textEl = el.textSpan;
				}else{
					textEl = document.createElement('span');
				}
				
				$(textEl).attr('style', 'position: absolute;'); //top: 0px;
				$(textEl).css('height', ($(el).css('height')));
				$(textEl).css('left', ($(el).css('width').split('px')[0] / 2 - 35) + 'px');
				if ($.alopex.util.isValid(options.textArray) && options.textArray) {
					textEl.startProg = options.textArray[0];
					textEl.endProg = options.textArray[1];
					//$(textEl).text(textEl.startProg);
					var value = progEl.value;
					
					if (value === 100 && textEl.endProg) {
						$(textEl).text(textEl.endProg);
					} else if (value === 0 && textEl.startProg) {
						$(textEl).text(textEl.startProg);
					}
				}
				//
				$(progEl).append(textEl);
				$(textEl).appendTo(progEl);
				
				el.textSpan = textEl;

			}else if($.alopex.util.isValid(options.showText) && !options.showText){
				if(el.textSpan){
					$(el.textSpan).remove();
				}
			}
			if ($.alopex.util.isValid(options.textColor) && options.textColor) {
				if(el.textSpan){
					$(el.textSpan).css('color', options.textColor);
				}
			}
		},
		setValue: function(el, value) {
			var progEl = el.children[0];
//			var overlayEl = progEl.children[0];

			progEl.value = value;
			$(progEl).css('border', $(el).css('border'));
			$(progEl).css('width', (progEl.maxWidth * (value / progEl.maxValue)) + 'px');

//			$(overlayEl).css('width', $(progEl).css('width'));

			var textEl = $(progEl).children('span')[0];

			if (textEl !== undefined && $(el).hasClass('Progress-text')) {
				if (value === 100 && textEl.endProg) {
					$(textEl).text(textEl.endProg);
				} else if (value === 0 && textEl.startProg) {
					$(textEl).text(textEl.startProg);
				} else {
					$(textEl).text(value + '%');
				}
			}
		},
		getValue: function(el) {
			var progEl = el.children[0];
			var value = progEl.value;
			if (value > progEl.maxValue) {
				value = progEl.maxValue;
			} else if (value < progEl.minValue) {
				value = progEl.minValue;
			}
			return value;
		}
	});

})(jQuery);


(function($) {
	/***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * radio
	 **********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	$.alopex.widget.radio = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'radio',
		defaultClassName : 'af-radio Radio',
		defaultTextClassName : 'af-radio-text',
		defaultWrapClassName : 'af-wrapradio',
		defaultWrapSpanClassName : 'af-wrapradio-span',
		setters : [ 'radio', 'setSelected' ],
		getters : [ 'getValue', 'getText' ],

		properties : {
			wrap : false
		},

		init : function(el, options) {
			var $el = $(el);
			el.options = $.extend(true, {}, this.properties, options);
			//IE8에서 input type변경 불가.
			try {
				$el.attr('type', 'radio');
			} catch(e) {
			}
			
			if (el.options.wrap || $.alopex.util.parseBoolean(el.alopexoptions.wrap)) {
				// $el.attr('data-type', 'wrapradio').wrapradio();
				if (el.className) {
					if (el.className.indexOf(this.defaultClassName) !== -1) {
						$el.addClass(this.defaultWrapClassName);
					}
					$el.after('<span class="' + el.className + '-span"></span>');
				} else {
					$el.after('<span class="' + this.defaultWrapSpanClassName + '"></span>');
				}
			}
			
//			Galaxy S6 Edge (SM-G925, Android 5.1.1) 디폴트 브라우저에서 ImageRadio 버튼 클릭하여도 change 이벤트 trigger되지 않는 버그 발생. 추가적으로 click 이벤트일 때에도 change를 trigger 해주자
//			S6 Edge 5.0.2 SamsungBrowser/3.0 정상
//			Note 4 5.1.1 SamsungBrowser/2.1 정상
//			Note 5 5.1.1 SamsungBrowser/3.4 정상
//			S6 Edge 5.1.1 SamsungBrowser/3.2 문제 발생
			var userInfo = navigator.userAgent;
			if(userInfo.indexOf("SamsungBrowser/3.2") != -1){
				$el.on('click', function(e){
					$(this).trigger('change');
				});
			}
			
			$el.on('change', function(e){
				$(e.currentTarget).parent('label').siblings('label').removeClass('Checked');
				$(e.currentTarget).parent('label').addClass('Checked');
			});
			
			if(el.checked || el.getAttribute('checked') == 'checked') {
				$(el).trigger('change');
			}
		},

		style : function(el) {
			if (el.id) {
				$('label[for="' + el.id + '"]').addClass(this.defaultTextClassName);
			} else {
				$(el).parent('label').addClass(this.defaultTextClassName);
			}
		},

		setSelected : function(el) {
			if (el.tagName === 'INPUT') {
				el.checked = true;
			}
			$(el).parent('label').addClass('Checked');
			$(el).trigger('change');
		},

		getValue : function(el) {
			var radioList = $('input[name=' + el.name + ']:checked');
			if (radioList.length > 0) {
				return $(radioList[0]).val();
			}
			return null;
		},

		getText : function(el) {
			var radioList = $('input[name=' + el.name + ']:checked');
			if (radioList.length > 0) {
				var obj = radioList[0];
				var elId = $(obj).attr('id');
				var $label = $(el).parent().find('label[for="' + elId + '"]');
				if ($label.length == 0) {
					$label = $(el).parent('label');
				}
				return $label.text();
			}
			return null;
		}
	});

})(jQuery);
//(function($) {
//	if ($.alopex.widget.scrollview) {
//		return;
//	}
//	$.alopex.widget.scrollview = {
//		scrollview: function(options) {
//			try {
//				var el = this;
//
//				$.alopex.widget.panel.refresh.apply(el);
//
//				if (window.browser === 'mobile' && typeof iScroll !== 'undefined') {
//
//					var iScrollOption = {};
//					if ((/iphone|ipad/gi).test(navigator.appVersion)) {
//						iScrollOption.useTransform = true;
//					} else {
//
//						if ($(el).find('input').length > 0 || $(el).find('textarea').length > 0) {
//							iScrollOption.useTransform = false;
//						} else {
//							iScrollOption.useTransform = true;
//						}
//					}
//					iScrollOption.onBeforeScrollStart = function(e) {
//						var target = e.target;
//						while (target.nodeType !== 1) {
//							target = target.parentNode;
//						}
//
//						if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
//							e.preventDefault();
//						}
//					};
//					iScrollOption.checkDOMChanges = true;
//					el.style.position = 'relative';
//					el.scroll = new iScroll(el, iScrollOption);
//					$(window).bind('resize', function(e) {
//						try {
//							el.scroll.refresh();
//						} catch (event) {
//							throw new Error(event);
//						}
//					});
//				} else {
//					// TO fix IE7 Bug. Without this statement,
//					// scroll content will be visible.
//					$(el).css('position', 'relative');
//					$(el).css('overflow', 'hidden');
//					if (el.children.length >= 1) {
//						if (el.offsetHeight < el.children[0].offsetHeight) {
//							$(el).css('overflow-y', 'scroll');
//						}
//						if (el.offsetWidth < el.children[0].offsetWidth) {
//							$(el).css('overflow-x', 'scroll');
//						}
//					}
//				}
//			} catch (e) {
//				throw new Error('scroll create ==== ' + e);
//			}
//		},
//
//		refresh: function() {
//			var el = this;
//			if (el.scroll) {
//				el.scroll.refresh();
//			} else {
//				if (el.offsetHeight < el.children[0].offsetHeight) {
//					$(el).css('overflow-y', 'scroll');
//				}
//				if (el.offsetWidth < el.children[0].offsetWidth) {
//					$(el).css('overflow-x', 'scroll');
//				}
//			}
//			$.alopex.widget.panel.refresh.apply(el);
//
//		}
//	};
//
//	$.alopex.chainapi.push('setEnabled');
//
//})(jQuery);

(function($) {

  /*********************************************************************************************************
   * search input
   *********************************************************************************************************/
  $.alopex.widget.searchinput = $.alopex.inherit($.alopex.widget.object, {
    widgetName: 'searchinput',
    defaultClassName: 'af-searchinput',
    defaultClearClassName: 'af-clear-button',
    setters: ['searchinput'],
    
    /**
     * markup은 ui 컴퍼넌트가 
     */
    markup: function() {
      return '<div>' +
              '<span af-dynamic class="af-icon af-default search"></span>' +
              '<input class="af-textinput af-default" />' +
              '<span af-dynamic class="af-icon af-default remove-sign"></span>' +
            '</div>';
    },
    
    properties: {
      clear: null
    },
    
    eventHandlers: {
      keydown: {event: 'keyup', handler: '_keyupHandler'},
      change: {event: 'change', handler: '_changeHandler'},
      clearclick: {event: 'click', selector: '[data-clear]', handler: '_clear'}
    },
    
    _clear: function(e) {
      
    },
    
    
    style: function(el) {
      /**
       * 하위 노드부터 스타일을 변경되어야 하는데, 이부분에서 막힘.
       * 아이콘들은 현재 알로펙스로 변경되지 않은 상태.
       * 
       */
    }
  });

})(jQuery);
(function($) {
  $.alopex.widget.select = $.alopex.inherit($.alopex.widget.baseselect, {
    widgetName: 'select',
    defaultClassName: 'af-select Select',
    getters: ['getValues', 'getTexts'],
    setters: ['select', 'setPlaceholder', 'setSelected', 'clear', 'refresh'],

    properties: {
      wrap : false
    },

    init: function(el, options) {
      var $el = $(el);
      el.alopexoptions = $.extend(true, {}, this.properties, options);

      if (el.alopexoptions.wrap || $.alopex.util.parseBoolean(el.alopexoptions.wrap)) {
        $el.attr('data-type', 'divselect').divselect();
      }
      if ($el.attr('data-select-multiple') == 'true') {
        $el.attr('multiple', 'multiple');
        defaultStyleClass = 'af-multiselect';
        $el.bind('selectstart click', function(e) {
          return false;
        });
      }
    }
  });
})(jQuery);
(function($) {
  
  
})(jQuery);
(function($) {

	$.alopex.widget.spinner = $.alopex.inherit($.alopex.widget.baseinput, {
		widgetName: 'spinner',
		defaultClassName: 'af-spinner Spinner',
		setters: ['spinner', 'setEnabled'],
		getters: [],
		
		properties: {
			min: 'default',
			max: 'default',
			step: 1
		},

		init: function(el, options) {
			var $wrapper, $up, $down, $el = $(el);
			if(el.tagName.toLowerCase() == 'div') {
				$wrapper = $el;
				$up = $(el).find('.Up');
				$down = $(el).find('.Down');
				el = el.querySelector('input');
			} else {
				$el.wrap('<div class="' + el.className + ' af-spinner-wrapper"></div>');
				$wrapper = $(el.parentNode);
				$wrapper.append('<a class="af-spinner-button-up"></a>');
				$wrapper.append('<a class="af-spinner-button-down"></a>');
				$up = $el.siblings('.af-spinner-button-up');
				$down = $el.siblings('.af-spinner-button-down'); 
			}
			
			$el = $(el);
			el.type = 'text'; // type="number" create browser default clear button
			
			$.extend(el, $.alopex.widget.spinner.properties, options);
			$up.on('click', $.alopex.widget.spinner._upHandler);
			$down.on('click', $.alopex.widget.spinner._downHandler);
			$el.on('keydown', $.alopex.widget.spinner._keydownHandler);
//			$el.on('keyup', $.alopex.widget.spinner._keyupHandler);

			
			
			// 테마 작업 시 css를 수정했는데, 아래의 인라인 설정 때문에 적용이 안되고 있음
			// spinner - 아래의 인라인 설정은 alopex-ui.css 에서 처리하고 있기 때문에 동적으로 다시 처리 할 필요 없음. 주석처리
//			$wrapper.css({
//				position: 'relative',
//				display: 'inline-block'
//			});
//			
//			
//			$up.add($down).css({
//				position:'absolute',
//				display:'block',
//				height:'50%',
//				width:'15px',
//				right:'0'
//			});
//			$up.css({
//				top:'0'
//			});
//			$down.css({
//				bottom:'0'
//			});
			
			
			$up.data('element', el);
			$down.data('element', el);
			
			if(el.max != 'default') {
				el.max = parseFloat(el.max);
				if(el.value && el.value>el.max) {
					el.value = el.max;
				}
			}
			if(el.min != 'default') {
				el.min = parseFloat(el.min);
				if(el.value && el.value<el.min) {
					el.value = el.min;
				}
			}
		},
		
		_upHandler: function(e){
			var el = $(e.currentTarget).data('element');
			$.alopex.widget.spinner.valueUp(el);
		},
		
		_downHandler: function(e) {
			var el = $(e.currentTarget).data('element');
			$.alopex.widget.spinner.valueDown(el);
		},
		
		_keydownHandler: function(e){
			var el = e.currentTarget;
			var $wrapper = $(el).closest('.af-spinner-wrapper');
			if($wrapper.hasClass('af-disabled Disabled')) return;
			if(e.which === 38) { // up
				$.alopex.widget.spinner.valueUp(el);
			} else if(e.which === 40) { // down
				$.alopex.widget.spinner.valueDown(el);
//			} else if(e.which >= 48 && e.which <= 57){ // other key
//				el.prevValue = $(el).val();
//				$(el).off('keydown', $.alopex.widget.spinner._keydownHandler);
//			} else if(e.shiftKey == false){
			}
		},
		
//		_keyupHandler: function(e){
//			var el = e.currentTarget;
//			if(e.which >= 48 && e.which <= 57){ // other key
//				var newval = $(el).val();
//				if(newval < parseFloat(el.min) || newval > parseFloat(el.max)) {
//					$(el).val(el.prevValue);
//				}
//				$(el).on('keydown', $.alopex.widget.spinner._keydownHandler);
//				
//			}
//		},
		
		valueUp: function(el) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			var value = parseFloat(el.value);
			var max = 0;
			var min = 0;
			if(!isNaN(value)) { // valid number
				var split = el.value.split('.');
				var result = 0;
				
				if(el.max != 'default') {
					max = parseFloat(el.max);
				}
				if(el.min != 'default') {
					min = parseFloat(el.min);
				}
				if(max && value > max) { // typed-in value is greater than data-max value
					result = max;
				} else if(min && value < min) {
					result = min;
				} else {
					result = $.alopex.util.addFloat(el.value, el.step);
				}
				if(el.max == 'default' || result <= parseFloat(el.max)) {
					el.value = result;
				}
				$(el).trigger('change');
			}
		},
		
		valueDown: function(el) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			var value = parseFloat(el.value);
			var max = 0;
			var min = 0;
			if(!isNaN(value)) { // valid number
				var split = el.value.split('.');
				var result = 0;
				
				if(el.max != 'default') {
					max = parseFloat(el.max);
				}
				if(el.min != 'default') {
					min = parseFloat(el.min);
				}
				if(max && value > max) { // typed-in value is greater than data-max value
					result = max;
				} else if(min && value < min) {
					result = min;
				} else {
					result = $.alopex.util.addFloat(el.value, el.step*-1);
				}
				if(el.min == 'default' || result >= parseFloat(el.min)) {
					el.value = result;
				}
				$(el).trigger('change');
			}
		},
		
		setEnabled: function(el, flag) {
			if(el.tagName.toLowerCase() == 'div') {
				el = el.querySelector('input');
			}
			var $el = $(el);
			var $wrapper = $el.closest('.af-spinner-wrapper');
			var $up = $el.siblings('.af-spinner-button-up');
			var $down = $el.siblings('.af-spinner-button-down');
			$up.off('click', $.alopex.widget.spinner._upHandler);
			$down.off('click', $.alopex.widget.spinner._downHandler);
			if(flag) {
				$up.on('click', $.alopex.widget.spinner._upHandler);
				$down.on('click', $.alopex.widget.spinner._downHandler);
				$el.removeAttr('readonly');
				$wrapper.removeClass('af-disabled Disabled');
			} else {
				$el.attr('readonly', true);
				$wrapper.addClass('af-disabled Disabled');
			}
		}
		
	});
})(jQuery);




(function($) {
	$.alopex.widget.table = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'table',

		defaultClassName: 'af-table Table',
		wrapperClassName: 'af-table-wrapper af-default ' + $.alopex.config.defaultComponentClass.table + '-wrapper',
		scrollerClassName: 'af-table-scroller' + $.alopex.config.defaultComponentClass.table + '-scroller',

		setters: ['table', 'hideColumn', 'showColumn','tableSort'],
		getters: [],
		
//		renderTo: function(el) {
//			alert($(el).parent('div[class*="-scroller"]').length);
//			if($(el).parent('div[class*="-scoller"]').length == 0) {
//				return '<div class="' + this.wrapperClassName + '" af-dynamic>' + 
//					'<div class="' + this.scrollerClassName + '" af-dynamic>' + 
//						'<table></table>' + 
//					'</div>' + 
//				'</div>';	
//			} else {
//				return '<table></table>';
//			}
//		},

		resizeThreshold: 10,
		resizing: false,
		resizeReady: true,

		properties: {},

		style: function(el) {
		},

		event: function(el) {

		},

		tableSort: function(el, header, orderBy) {
		    $.alopex.widget.table.sort(header, orderBy);
		},

		init: function(el) {
			var $el = $(el);
			if($el.parent('div[class*="-scroller"]').length == 0) {
				$el.wrap('<div class="' + this.wrapperClassName + '" af-dynamic>');
				$el.wrap('<div class="' + this.scrollerClassName + '" af-dynamic>');
			}
			$.extend(el, {
				scroller: null,
				hscroller: null,
				resizingHeader: null,
				scrolling: false,
				sorting: false,
				resizing: false,
				editing: false,
				highlighting: false,
				theme: null
			});
			this._addColgroup(el);
			$el.css({
				'table-layout': 'fixed'
			});
			if ($el.css('min-width') === '0px') {
				$el.css({
					'min-width': '100%'
				});
			}
			if (!$.alopex.util.isValid(el.style.width)) {
				$el.css({
					'width': '100%'
				}); // 과연 진짜 답은?
			}

			var $wrapper = $el.closest('.af-table-wrapper, .' + $.alopex.config.defaultComponentClass.table + '-wrapper');
			$wrapper.css({
				'overflow': 'hidden',
				'position': 'relative'
			});
			el.wrapper = ($wrapper.length > 0) ? $wrapper[0] : null;
			el.head = $.alopex.widget.table.getTableHead(el);
			if ($.alopex.util.isValid(el.head)) {
				el.head.table = el; // 헤더가 나눠지더라도 테이블 참조할 수 있도록.
				$(el.head).addClass('af-table-head');
			}
			if ($.alopex.util.isValid($(el).attr('data-height'))) {
				$(el.wrapper).css('height', $(el).attr('data-height')); // data-height 사이즈에 따라 wrapper 결정.
			}
			if ($.alopex.util.isValid($(el).attr('data-width'))) {
				var target = el.hscroller ? el.hscroller : el.wrapper;
				$(target).css('width', $(el).attr('data-width')); // data-width는 너비결정.
			}
			$.alopex.widget.table.refresh(el);
		},

		refresh: function(el) {
			var $el = $(el);
			$.each(el.children, function(){$.alopex.convert(this);});
			
			if (navigator.userAgent.indexOf('MSIE 7') !== -1) {
				$el.removeAttr('data-scroll');
			}

			if (!el.sorting && $el.find('[data-sortable]').length > 0) {
				this._enableSorting(el);
				el.sorting = true;
			}
			if (!el.resizing && $el.find('[data-resizable="true"]').length > 0) {
				this._enableResizing(el);
				el.resizing = true;
			} else if (el.resizing) {
				this._refreshColgroup(el);
			}
			$(el).find('[data-editable="true"]').addClass('af-table-editor Editor');
			if (!el.editing && $el.find('[data-editable="true"]').length > 0) {
				this._enableEditing(el);
				el.editing = true;
			}
			if (!el.highlighting && $el.attr('data-highlight')) {
				var allow = 'td,th';
				if ($el.attr('data-highlight') === 'body') {
					allow = 'tbody td, tbody th';
				}
				$el.find(allow).css('cursor', 'pointer');
				$(el.wrapper).on('click', allow, this._addTableHighlight);
				el.highlighting = true;
			}

			if (!$(el).is(':hidden')) {
				if (!el.scrolling && $el.attr('data-scroll') !== undefined) {
					this._enableScrolling(el);
					el.scrolling = true;
				}
				
				this._refreshTableHead(el);

				if ($(el).attr('data-scroll') !== undefined) {
					// table의 크기는 cell의 내용에 따라 내벼려 두고, 
					// scroll refresh
					this._refreshTableScroll(el);
				}
				
			}
		},

		/**
		 * Add div for scrolling functionality
		 * @param el
		 */
		_enableScrolling: function(el) {
			// 모바일에서는 세로 스크롤, 데스크탑에서는 가로&세로 스크롤로 사용.
			var $el = $(el);
			var $scroller = $el.closest('.' + this.scrollerClassName +  ', .'+$.alopex.config.defaultComponentClass.table+'-scroller');
			el.scroller = ($scroller.length > 0) ? $scroller[0] : null;
			el.scroller.el = el;
			$(el.wrapper).css({
				'overflow': 'hidden'
			}); // 가로 스크롤의 경우, 
			var $colgroup = $(el).find('colgroup').clone(true);

			// body 영역 스크롤의 경우, 헤더부분 absolute으로 띄우기.
			if ($(el).attr('data-scroll') === 'body') {
				if (window.browser === 'mobile') {
					$(el.scroller).css({
						'overflow': 'hidden',
						'overflow-y': 'auto'
					});
					// 헤더 분리.
					if (el.head) {
						var $dummyHeader = $(el.head).clone(true).appendTo(el);
						el.clone = $(el).clone(true).removeAttr('id').removeAttr('data-type').empty()[0];
						$(el.wrapper).prepend(el.clone);
						$(el.head).prepend($colgroup);
						$(el.head).appendTo(el.clone);
						$(el.head).css({
							'z-index': '1',
							'position': 'absolute',
							'display': 'table',
							'table-layout': 'fixed'
						}); // head가 2개이상의 row로 구성된 경우.
						$dummyHeader.remove();
						//              this._refreshTableHead(el);
						//              dummyHeader.css('visibility', 'hidden');
					}

					// 가로 스크롤러 추가. (세로와 가로 스크롤러 분리)
					var $hscroller = $('<div></div>').attr('class', el.theme + ' af-table-hscroller');
					$hscroller.css({
						'overflow': 'hidden',
						'overflow-x': 'auto',
						'-webkit-overflow-scrolling': 'touch'
					});
					$(el.wrapper).wrap($hscroller[0]);
					el.hscroller = el.wrapper.parentNode;
					el.hscroller.el = el;
				} else {
					// 헤더 absolute로 띄우기.
					if (el.head) {
						$(el.head).css({
							'float': 'left',
							'position': 'absolute',
							'top': '0px',
							'display': 'table',
							'table-layout': 'fixed'
						});
						$(el.head).prepend($colgroup);
					}
					$(el.scroller).css({
						'overflow': 'auto'
					});
					$(el).css({
						'overflow': 'hidden'
					});
					$(el.scroller).bind('scroll', function(e) { // 가로 스크롤 시, 헤더 너비 조정.
						var target = e.currentTarget;
						var el = target.children[0];
						$(el.head).css({
							'left': (target.scrollLeft * -1) + 'px'
						});
					});
				}

				$(el.head).find('tr').css('display', 'table-row');

				if (navigator.userAgent.toLowerCase().indexOf('android') !== -1) {
					// 안드로이드 경우, 이벤트 처리.
					$(el.hscroller).bind('touchstart', function(e) {
						var el = e.currentTarget.el;
						el.started = true;
						el.x = e.originalEvent.touches[0].clientX;
						el.y = e.originalEvent.touches[0].clientY;
					});
					$(el.hscroller).bind('touchmove', function(e) {
						var el = e.currentTarget.el;
						if (el.started) {
							el.x = Math.abs(e.originalEvent.touches[0].clientX - el.x);
							el.y = Math.abs(e.originalEvent.touches[0].clientY - el.y);
							if (el.x > el.y) {
								$(el.hscroller).css({
									'overflow': 'hidden',
									'overflow-x': 'auto'
								});
								$(el.scroller).css('overflow', 'hidden');
							} else {
								$(el.hscroller).css('overflow-x', 'hidden');
								$(el.scroller).css({
									'overflow': 'hidden',
									'overflow-y': 'auto'
								});
							}
							el.started = false;
						}
					});
				}
			} else {
				$(el.scroller).css({
					'overflow': 'auto',
					'overflow-scrolling': 'touch'
				});
			}
		},

		_refreshTableHead: function(el) {
			if (!$.alopex.util.isValid(el.head)) {
				return;
			}

			var tbodyrow = $(el).find('tbody > tr');
			var tbody = $(el).find('tbody');
			var twidth = el.offsetWidth;
			if (tbodyrow.length > 0) {
				// in case the databind is used, table row in index 0 is template
				twidth = tbodyrow[tbodyrow.length-1].offsetWidth;  
			} else if (tbody.length > 0) {
				twidth = tbody[0].offsetWidth;
			}

			var $head = $(el.head);
			$head.css({
				'table-layout': '',
				'width': twidth+'px' // 100% cannot be used, scroll in IE take few pixels 
			});
			if(twidth == 0) {
				$head.css({
					'width': '100%'
				});
			}
//			if (el.offsetWidth === el.wrapper.offsetWidth) {
//				$head.css({
//					'width': '100%'
//				});
//			} else {
//				$head.css({
//					'width': twidth + 'px'
//				});
//			}

			var element = el;
			setTimeout(function() { // webkit 버그로 인하여, 'table-layout' 속성이 제대로 적용되지 않음.
				var $el = $(element);
				$head.css({
					'table-layout': 'fixed'
				});

				// table head와 body의 보더 맞추는 코드
				// thead와 tr 너비 크기가 틀린 경우 발견. 테이블내 tr 엘리먼트 너비 값을 조회한 후 틀린경우, 헤더에서 너비 조정.
				//        var prev = null;
				//        var $temprow = null;
				//        var $tr = $el.closest('.af-table-wrapper').find('tr');
				//        if($tr.length < 5) {
				//          var columnCount = $.alopex.table.getColumnCount(element.wrapper);
				//          var str = '<tr>';
				//          for(var i=0; i<columnCount; i++) { str += '<td></td>'; }
				//          str += '</tr>';
				//          $temprow = $(str);
				//          $(el).find('tbody').append($temprow);
				//          $tr = $el.closest('.af-table-wrapper').find('tr');
				//        }
				//        
				//        for ( var i = 0; i < $tr.length; i++) {
				//          if (prev === null) {
				//            prev = $tr[i].offsetWidth;
				//          } else {
				//            if (prev !== $tr[i].offsetWidth) {
				//              $head.css('width', (headerWidth - (prev - $tr[i].offsetWidth)) + 'px');
				//              break;
				//            }
				//          }
				//        }
				//        
				//        if($temprow !== null) {
				//          $temprow.remove();
				//        }

			}, 10);
		},

		/**
		 * todo
		 * 1. header size adjustment
		 * 2. scroller height adjustment
		 */
		_refreshTableScroll: function(el) {
			var $scroller = $(el.scroller);
			var scrollerHeight = el.wrapper.offsetHeight;
			if ($(el).attr('data-scroll') === 'all') {
				$scroller.css('margin-top', '0');

			} else {
				if (window.browser === 'mobile') {
					// 모바일 경우, hscroller가 추가로 생성됨. 이 떄문에 wrapper의 width를 조정해줘야 가로 스크롤이 동작함.
					$(el.wrapper).css('width', el.offsetWidth + 'px');
				}
				// header size adjustment
				if ($.alopex.util.isValid(el.head)) {
					scrollerHeight -= el.head.offsetHeight;
					$scroller.css('margin-top', el.head.offsetHeight + 'px');
				}
			}
			$scroller.css('height', scrollerHeight + 'px');
		},

		hideColumn: function(el, index) {
			$(el).find('col:nth-child(' + (index + 1) + ')').addClass('af-hidden');
		},

		showColumn: function(el, index) {
			$(el).find('col:nth-child(' + (index + 1) + ')').removeClass('af-hidden');
		},

		clear: function(el) {
			$(el).find('tr').each(function() {
				if ($(this).closest('thead').length > 0) {
					return;
				}
				if ($(this).find('th').length > 0) {
					return;
				}
				$(this).remove();
			});
		},

		_addTableHighlight: function(e) {
			var cell = e.target;
			cell = $(cell).closest('tr,td, th')[0];
			var row = $(cell).closest('tr')[0];
			var head = $(cell).closest('th')[0];
			var table = $(cell).closest('table')[0];

			var isHeader = false;
			if (head !== undefined) {
				isHeader = true;
			}

			$(table).find('.af-table-row').removeClass('af-table-row');
			$(table).find('.af-table-cell').removeClass('af-table-cell');
			$(table).find('.af-table-column').removeClass('af-table-column');

			if (isHeader) {
				var index = $.alopex.widget.table.getColumnIndex(cell);
				$(table).find('td:nth-child(' + (index + 1) + '),' + 'th:nth-child(' + (index + 1) + ')').addClass('af-table-column');
			} else {
				$(row).addClass('af-table-row');
				$(cell).addClass('af-table-cell');
			}
		},

		/**
		 * table 헤더 리턴. 밑에 일치가 안된다.
		 *  1. <thead>태그가 존재할 경우, thead리턴. 
		 *  2. <thead> 없을 시, <th>태그의 부모<tr> 리턴.
		 *  3. null 리턴. 
		 * 
		 * @param el
		 * @returns
		 */
		getTableHead: function(el) {
			var thead = null;
			if ($(el).find('thead').length > 0) {
				thead = $(el).find('thead')[0];
			} else if ($(el).find('th').length > 0) {
				thead = $(el).find('th')[0].parentNode;
			}
			return thead;
		},

		getTableBody: function(el) {
			var tbody;
			if ($(el).find('tbody').length > 0) {
				tbody = el.tBody ? el.tBody : $(el).find('tbody')[0];
			} else {
				tbody = el;
			}
			return tbody;
		},

		getRowIndex: function(td) {
			var tr = td.parentNode;
			var table = tr;
			while (table.tagName.toLowerCase() !== 'table') {
				table = table.parentNode;
			}
			var tbody = table.tableBody;
			var cnt = 0;
			for ( var i = 0; i < tbody.rows.length; i++) {
				if (tbody.rows[i] === table.tableHead) {
					continue;
				} else if (tbody.rows[i] === tr) {
					return cnt;
				}
				cnt++;
			}
			return cnt;
		},

		getColumnIndex: function(td) {
			var tr = td.parentNode;
			if ($.alopex.util.isValid(tr.cells)) {
				for ( var i = 0; tr.cells.length; i++) {
					if (tr.cells[i] === td) {
						return i;
					}
				}
			}
			return -1;
		},

		_enableEditing: function(el) {
			$(el.wrapper).on('click', '[data-editable="true"]', $.alopex.widget.table._editHandler);
		},

		_disableEdit: function(el) {
			var thead = el.tableHead;
			var tbody = el.tableBody;

			$(thead).find('[data-editable="true"]').each(function() {
				var th = this;
				var columnIndex = $.alopex.widget.table.getColumnIndex(th);

				for ( var i = 0; i < tbody.rows.length; i++) {
					if (tbody.rows[i] === thead) {
						continue;
					}
					$(tbody.rows[i]).find('td:nth-child(' + (columnIndex + 1) + ')').unbind('click', $.alopex.widget.table._editHandler);
				}
			});
		},

		_editHandler: function(e) {
			var cell = $(e.target).closest('td')[0];
			var table = $(cell).closest('table')[0];

			// td 안에 textnode 말고 다른
			if (cell.children !== undefined && cell.children.length > 0) {
				return;
			}

			var input = document.createElement('input');
			$(input).val(cell.text = $(cell).text());
			$.alopex.widget.table.tmpInput = input;
			$.alopex.widget.table.tmp = cell;
			$(cell).text('').append(input).addClass('af-editing Editing');

			//        var temp = cell.style.height;
			$(input).focus();
			$.alopex.widget.table._disableEdit(table);

			function focusout(e) {
				e.stopImmediatePropagation();
				e.preventDefault();

				var input = $.alopex.widget.table.tmpInput;
				var text = $(input).val();
				if (input.parentNode.text !== text) {
					$(input.parentNode).addClass('af-edited Edited');
					table.edited = true;
				}
				$(input.parentNode).text(text).removeClass('af-editing Editing');
				$(input).remove();
				$.alopex.widget.table._enableEditing(table);
			}

			$(input).bind('focusout', function(e) {
				focusout(e);
			});
			$(input).bind('keydown', function(e) {
				if (e.keyCode !== 13 && e.keyCode !== 27) {
					return;
				}
				focusout(e);
			});
		},

		/**
		 * colgroup 태그가 없을 시 추가한다. (사이즈 조정에 사용됨)
		 * @param el
		 */
		_addColgroup: function(el) {
			// colgroup
			var rowgroups = $(el).find('tr');
			rowgroups = rowgroups[rowgroups.length - 1];
			var colgroup = $(el).find('colgroup');
			if (colgroup.length === 0) {
				colgroup = document.createElement('colgroup');
				for ( var i = 0; i < rowgroups.children.length; i++) {
					var temp = document.createElement('col');
					$(temp).appendTo(colgroup);
				}
				$(colgroup).insertBefore(el.children[0]);
			} else {
				colgroup = colgroup[0];
			}
		},

		_refreshColgroup: function(el) {
			var rowgroups = $(el).find('tr');
			if (rowgroups.length > 0) {
				var maxtd = 0, i;
				rowgroups.each(function(idx, elem) {
					var len = $(elem).children('td').length;
					maxtd = len > maxtd ? len : maxtd;
				});
				var dummytr = $('<tr>').css('height', '0px');
				for (i = 0; i < maxtd; i++) {
					dummytr.append('<td>&nbsp;</td>');
				}
				dummytr.insertAfter(rowgroups.last());
				var colgroup = $(el).find('colgroup');
				var tempArr = [];
				var len;
				for (i = 0, len = maxtd; i < len; i++) {
					var width = (dummytr.children('td').eq(i).offsetWidth);
					tempArr.push(width);
				}
				for (i = 0; i < tempArr.length; i++) {
					$(el).find('col:nth-child(' + (i + 1) + ')').css('width', tempArr[i]);
				}
				dummytr.remove();
			}
		},

		/**
		 * 컬럼이 리사이즈 가능 하도록 한다.
		 * @param el
		 */
		_enableResizing: function(el) {
			if (window.browser !== 'mobile') { // Desktop Only Function
				// register event handler
				$(el.wrapper).on('mousedown', '[data-resizable="true"]', this._resizeStartHandler).on('mousemove', '[data-resizable="true"]', this._checkResizeCondition);
				$(el.wrapper).find('[data-resizable="true"]').each(function() {
					this.table = el;
					var btn = document.createElement('div');
					$(btn).addClass('af-table-resize ResizeIcon').appendTo(this);
				});
				$(el.rows[0].cells).each(function(index) {
					this.index = index;
				});
				$(el).on('selectstart', function(e) {
					return false;
				});
				$(el).on('dragstart', function(e) {
					return false;
				});
			}

		},

		_resizeStartHandler: function(e) {
			var target = e.currentTarget;
			var el = target.table;
			var tableWidth = el.offsetWidth;
			$(el).css({
				'width': tableWidth + 'px',
				'min-width': ''
			});
			if ($.alopex.widget.table.resizeready) {
				$.alopex.widget.table.resizing = true;
				$.alopex.widget.table.resizingEl = target;
				$(document).bind('mousemove', $.alopex.widget.table._resizeMoveHandler);
				$(document).bind('mouseup', $.alopex.widget.table._resizeEndHandler);
				if ($.alopex.util.isValid($('body').css('cursor'))) {
					$('body').data('cursor', $('body').css('cursor'));
				}
				$('body').css('cursor', 'col-resize').css('text-overflow', 'ellipsis');
			}
		},

		_resizeMoveHandler: function(e) {
			if ($.alopex.widget.table.resizing) {
				var col = $.alopex.widget.table.resizingEl;
				var el = col.table;
				var pos = $.alopex.util.getScrolledPosition(col);
				var left = pos.left;
				var width = e.pageX - left;

				if (col.width && width < col.width && Math.abs(col.width - col.offsetWidth) > 3) {
					$.alopex.widget.table._resizeColumn(col, col.offsetWidth);
					col.width = col.offsetWidth;
				} else {
					$.alopex.widget.table._resizeColumn(col, width);
					col.width = width;
				}
				$.alopex.widget.table._refreshTableScroll(el);
			}
		},

		_resizeEndHandler: function(e) {
			if ($.alopex.widget.table.resizing) {
				var target = $.alopex.widget.table.resizingEl;
				$.alopex.widget.table.resizing = false;
				$.alopex.widget.table.resizingEl = null;
				$(document).unbind('mousemove', $.alopex.widget.table._resizeMoveHandler);
				$(document).unbind('mouseup', $.alopex.widget.table._resizeEndHandler);
				if ($.alopex.util.isValid($('body').data('cursor'))) {
					$('body').css('cursor', $('body').data('cursor'));
				} else {
					$('body').css('cursor', '').css('background', '');
				}
			}
		},

		_checkResizeCondition: function(e) {
			var el = $(e.target).closest('[data-resizable="true"]')[0];
			var pos = $.alopex.util.getScrolledPosition(el);
			var curright = pos.left + el.offsetWidth;
			if ($(el).css('cursor') !== 'col-resize') {
				$(el).data('cursor', '');
			}
			if (e.pageX >= curright - $.alopex.widget.table.resizeThreshold) {
				$(el).css('cursor', 'col-resize');
				$.alopex.widget.table.resizeready = true;
			} else {
				$(el).css('cursor', $(el).data('cursor'));
				$.alopex.widget.table.resizeready = false;
			}
		},

		/**
		 * @param {HTMLCellElement} th target header td element.
		 * @param {integer} width width of td element;
		 */
		_resizeColumn: function(th, width) {
			var table = th.table;
			var $table = $(table);
			var head = table.head;
			$(th).css('width', width + 'px');
			//        $(th.table.wrapper).css({'display':'inline-block', 'width':''})
			$($table).find('colgroup > col:nth-child(' + (th.index + 1) + ')').each(function() {
				var colWidth = $($table).find('tr:first-child').find('td,th')[th.index].offsetWidth;
				var oldColWidth = this.width ? this.width : colWidth;
				var oldTableWidth = this.tableWidth ? this.tableWidth : parseInt($table.css('width').replace('px', ''), 10);
				var diff = width - oldColWidth;
				this.width = width;
				this.style.width = width + 'px'; // for ie7
				$(this).css('width', width + 'px'); // for ie8, ie9
				this.tableWidth = (oldTableWidth + diff);
				$table.css('width', this.tableWidth + 'px');
				$(head).css('width', this.tableWidth + 'px');
			});
		},

		// 
		_enableSorting: function(el) {
			var rows = el.head;
			$(rows).find('th, td').each(function(index) {
				if ($(this).attr('data-sortable') === undefined && $(this).attr('data-sort-function') === undefined) {
					return;
				}
				this.columnIndex = index;
				this.table = el;
				var icon = document.createElement('span');
				$(icon).addClass('af-icon Icon');
				$(this).append(icon).css('cursor', 'pointer');
			});
			$(el.wrapper).on('click', '[data-sortable], [data-sort-function]', $.alopex.widget.table._sort);
		},

		_sort: function(e) {
			var headColumn = e.currentTarget;
			$.alopex.widget.table.sort(headColumn);
		},

		sort: function(target, orderBy) {
			if (target === undefined) {
				target = this;
			}

			var table = target.table;
			if (table) {
				var index = target.columnIndex;
				var tbody = table.tBodies[0];
				var array = [];
				var valArr = [];
				for ( var i = 0; i < tbody.rows.length; i++) {
					if (tbody.rows[i].cells.length > 0 && tbody.rows[i].cells[0].tagName.toLowerCase() === 'th') {
						continue;
					}
					array.push([this._getInnerText(tbody.rows[i].cells[index]), tbody.rows[i]]);
				}
				var sort_function;
				if ($(target).attr('data-sort-function') !== undefined) {
					sort_function = window[$(target).attr('data-sort-function')];
				} else {
					var type = $(target).attr('data-sortable');
					switch (type) {
					case 'number':
						sort_function = $.alopex.util.sort_numeric;
						break;
					case 'date':
						valArr = $.alopex.util.formatDate(valArr);
						sort_function = $.alopex.util.sort_date;
						break;
					default:
						sort_function = $.alopex.util.sort_default;
						break;
					}
				}
				$(target).siblings().removeClass('af-table-ascending AscendingOrder').removeClass('af-table-descending DescendingOrder');
				//   orderBy  여부 확인하여 정렬. 2016.01.25 ys.park 
				if(orderBy!== undefined) {
				    if (orderBy.toLowerCase() === 'desc') {
					$(target).removeClass('af-table-ascending AscendingOrder');
					$(target).addClass('af-table-descending DescendingOrder');
					array = $.alopex.util.mergeSort(array, sort_function, false);
				    } else {
					$(target).removeClass('af-table-descending DescendingOrder');
					$(target).addClass('af-table-ascending AscendingOrder');
					array = $.alopex.util.mergeSort(array, sort_function, true);
				    }
				}else{
    				    if (target.className.indexOf('af-table-ascending AscendingOrder') !== -1) {
    					$(target).removeClass('af-table-ascending AscendingOrder');
    					$(target).addClass('af-table-descending DescendingOrder');
    					array = $.alopex.util.mergeSort(array, sort_function, false);
    				    } else {
    					$(target).removeClass('af-table-descending DescendingOrder');
    					$(target).addClass('af-table-ascending AscendingOrder');
    					array = $.alopex.util.mergeSort(array, sort_function, true);
    				    }
				}
				for (i = 0; i < array.length; i++) {
					tbody.appendChild(array[i][1]);
				}
			}

		},

		_getInnerText: function(node) {
			// 현재 alopex UI Framework componenet value를 가져와야 함.
			// node가 정의되지 않앗거나, 복합 구조일 경우 빈 스트링 리턴.
			if (!node) {
				return '';
			}

			return node.innerHTML;
		},

		getColumnCount: function(el) {
			var $el = $(el);
			var count = 0;

			var $tr = $el.find('tr');
			for ( var i = 0; i < $tr.length; i++) {
				var colCount = $tr.find('td, th').length;
				if (colCount > count) {
					count = colCount;
				}
			}
			return count;
		}
	});

})(jQuery);
(function($) {
	$.alopex.widget.tabs = $.alopex.inherit($.alopex.widget.object, {
		widgetName: 'tabs',
		defaultClassName: 'af-tabs Tabs',
		setters: ['tabs', 'setTabIndex','setTabByContent', 'setEnabled', 'setEnabledByContent', 'reload', 'clear', 'removeTab', 'setBeforeunload', 'addTab', '_refeshButtonGroup', 'setDraggable'],
		getters: ['getCurrentTabIndex', 'getCurrentTabContent', 'getButtonsGroup', 'getButtons', 'getContent', 'getActiveButtons', 'getLength', 'isEnabled'],

		requestButton: null,

		properties: {
			buttons: null,
			buttonGroup: null,
			tabstrigger: 'click',
			eventState: 'init',
			carousel: false, // indicate if carousel function is used.
			wrapper: null, // tab content wrapper: necessary for carousel
			removebutton: false,
			initfocus: false,
			beforeunload: {},
			buttonScroller: false, // 스크롤을 좌우버튼으로 할 경우 true
			useremoveall: false, // 전체 탭 제거 버튼 사용할 경우 true  (data-use-removeall="false")
			draggable: false // tab 버튼을 Drag & Drop 하여 위치 변경 가능하게 할 경우 true
		},
		
		classNames: {
			removebutton: 'RemoveButton'
		},
		getLength: function(el) {
			if(el.buttons) {
				return el.buttons.length;
			}
			return 0;
		},
		getButtonsGroup: function(el) {
			return el.buttonGroup;
		},
		getButtons: function(el) {
			return el.buttons;
		},
		getContent: function(el, index) {
			if(el.buttons && el.buttons[index]) {
				return el.buttons[index].content;
			}
		},
//		isEnabled: function(el, index) {
//		if(el.buttons[index].className.indexOf('af-disabled Disabled') == -1) {
//		return false;
//		}
//		return true;
//		},

		reload: function(el, index, callback) {
			if(el.buttons && el.buttons[index]) {
				// 현재 페이지에 구성된 탭이 아닌경우에만 적용.
				// local tab content는 제외.
				if($(el.buttons[index]).attr('data-content').indexOf('#') != 0) { 
					this._loadHTML(el.buttons[index], el, callback);
				}

			}
		},

		setBeforeunload: function(el, index, beforeunload){
			var $el = $(el);
			if(!el.options.beforeunload) {
				el.options.beforeunload = {};
			}
			el.options.beforeunload[index] = beforeunload;
		},

		init: function(el, options) {
			var $el = $(el);
			el.options = $.extend(true, {}, this.properties, options);
			el._currentTabIndex = -1;
			
			if($(el).find(".ButtonScroller").length > 0){ // false 이면 일반 Scroll 사용한다는 의미
				el.options.buttonScroller = true;
				
				$(el).prepend('<button class="Button ScrollerbuttonL"><span class="Icon Chevron-left" data-position="center"></span></button>').find(".ScrollerbuttonL").convert();
				$(el).prepend('<button class="Button ScrollerbuttonR"><span class="Icon Chevron-right" data-position="center"></span></button>').find(".ScrollerbuttonR").convert();
			}
			
			if(el.options.useremoveall){
				$(el).prepend('<button class="Button RemoveAllTabs"><span class="Icon Remove" data-position="center"></span></button>').find(".RemoveAllTabs").convert();
			}
			
			// lazy loading : data-lazy-load 속성이 들어간 경우, 선택된 탭 이외의 탭 컨텐트는 나중에 converting 한다. 
			// loading 시간 단축.
			if (el.options.lazyload === 'true') {
				$el.find('[data-type]').each(function() {
					this.options.phase = 'pending';
				});
			}

			var eventAttr = this._getProperty(el, 'tabstrigger');
			if (eventAttr === 'hover' || eventAttr === 'hovering') {
				el.options.tabstrigger = 'hoverstart';
			}

			var removeBtnAttr = this._getProperty(el, 'removebutton');
			if (removeBtnAttr) {
				el.options.removebutton = removeBtnAttr;
			}

			el.buttonGroup = $el.find('> ul, >div.Scroller>ul');
			
			
			if (el.buttonGroup.length === 0) {
				el.buttonGroup = $el.find('.af-tabs-button-group');
				el.buttons = el.buttonGroup.find('> li');
			} else {
				el.buttonGroup.addClass('af-tabs-button-group');
				el.buttons = el.buttonGroup.find('> li');
				this._setButtongroupWidth(el);
			}
			
			el.removebuttons = [];
			
			if (el.buttons.length > 0) {
				el.buttons.on('click', function(e) { // default 이벤트 무시.
					e.preventDefault(); // stop navigating to 'ajax loding page'
				});
				
				var buttonWidth = -1;
				
				if(this._getProperty(el,'contentsdisplay') == 'flex') {
					buttonWidth = el.buttonGroup.innerWidth() / el.buttons.length; // innerWidth : Get the current computed inner width (including padding but not border)
				}
				
				for ( var i = 0; i < el.buttons.length; i++) {
					this._makeTabButton(el, el.buttons[i], i, buttonWidth);
				}

				$.alopex.widget.tabs.setTabIndex(el, 0, el.options.initfocus);
				$(el).on('keydown', $.alopex.widget.tabs._keyEventHandler);
			}
			this._setTabWidth(el);
			this._unbindEvent(el);
			this._bindEvent(el);
			
			$(window).resize(function(e) {
	        	  if($el.is(":visible")){
	        		  $.alopex.widget.tabs._setButtongroupWidth(el);
	        	  }
	        	  
	        	  $.alopex.widget.tabs._moveScrollToShowTabButton(el);
	        });

			// init 시점에서 draggable=false이면 아무것도 안한다
			if(el.options.draggable){
				var i;
				for ( i = 0 ; i < el.buttons.length ; i++) {
					$(el.buttons[i]).attr("draggable", true);
					$(el.buttons[i]).on("dragstart", this._tabDrag);
					$(el.buttons[i]).on("drop", this._tabDrop);
					$(el.buttons[i]).on("dragover", this._allowTabDrop);
				}
			}
		},
		setDraggable: function(el, flag) {
			var i;
			var button;
			var events;
			
			if(flag) {
				el.options.draggable = true;
			}else{
				el.options.draggable = false;
			}
			
			for ( i = 0 ; i < el.buttons.length ; i++) {
				button = el.buttons[i];
				events = $._data(button, "events");
				
				if(flag){ // Draggable 이벤트 추가
					var draggable = $(button).attr("draggable");
					if(draggable == undefined || draggable == false || draggable == "false") {
						$(button).attr("draggable", true);
					}
					// 이벤트 핸들러 없으면 추가
					if(!events.dragstart) 	$(button).on("dragstart", this._tabDrag);
					if(!events.drop) 		$(button).on("drop", this._tabDrop);
					if(!events.dragover) 	$(button).on("dragover", this._allowTabDrop);
				}else{  // Draggable 이벤트 제거
					var draggable = $(button).attr("draggable");
					if(draggable == true || draggable == "true") {
						$(button).attr("draggable", false);
					}
					// 이벤트 핸들러 있으면 제거
					if(events.dragstart) 							$(button).off("dragstart", this._tabDrag);
					if(events.drop) 								$(button).off("drop", this._tabDrop);
					if(events.dragover) 							$(button).off("dragover", this._allowTabDrop);
				}
			}
		},
		_tabDrag: function(e) {
			var el = e.target;
			var $el = $(el);
			var index = $el.parent('ul').children('li').index(el)
		    var $tabEl = $el.closest('div.Tabs');
		    $tabEl.prop("dragging_index", index);
		},
		_tabDrop: function(e) {
			var el = e.target;
			var $el = $(el);
			var $tabEl = $(el).closest('div.Tabs');
			var dragging_index = $tabEl.prop("dragging_index");
			
			if(dragging_index == undefined) return;
			
			var draggingTab = $el.parent('ul').children('li').get(dragging_index);
			var liWidth = $el.width();
			var leftEnd = $el.offset().left;

			var mouse_clientX;
			if(!e || !e.clientX) {
				mouse_clientX = window.event.clientX;
			}else{
				mouse_clientX = e.clientX;
			}

			if(mouse_clientX > leftEnd + (liWidth/2)){	
				$(draggingTab).insertAfter($el);
			}else{
				$(draggingTab).insertBefore($el);
			}
			$.alopex.widget.tabs._refeshButtonGroup($tabEl[0]);
			
			//drop 한 탭 선택 및 포커스 주기
			var newIndex = $el.parent('ul').children('li').index(draggingTab);
			$tabEl.setTabIndex(newIndex, true);
			
			e.preventDefault();
		},
		_allowTabDrop: function(e) {
		    e.preventDefault();
		},
		defer: function(el, options){
			
			// var that = this;
//			if(false) {
////			if(el.carousel) {
//			if (el.buttonGroup.length > 0) { // request for Content HTML
//			var buttons = el.buttonGroup.children();
//			$(buttons).each(function(i, v) {
//			if (v.loadType === 'ajax') {
//			that._loadHTML(v, el);
//			}
//			});
//			}
//			}
			if(el.options.carousel) {
				var timer = setInterval(function() { // waiting for all contents rendered
					if(!$(el).is(':hidden')) {
						clearInterval(timer);
						if(el.options.carousel) {
							$(el).find('> .af-tabs-content, >div:not(.Scroller)').attr('data-role', 'page');
							$(el).attr('data-type', 'carousel').carousel();
						}
					}
				}, 200);
			}
		},

		_evt_swipe: function(e, c) {
			__ALOG('swipe');
			var el = $(e.currentTarget).parent('[data-type="carousel"]')[0];
			var duration = (el.width - Math.abs(c.distanceX)) / c.speed * 1000;
			if (duration > 500) {
				duration = 500;
			}
			var destindex = el._currentTabIndex;
			if (c.distanceX < 0) { // 좌측 이동
				do {
					destindex ++;
				}while(!$.alopex.widget.tabs.isEnabled(el, destindex) && destindex < el.buttons.length);
			} else { // 우측 이동
				do {
					destindex --;
				}while(!$.alopex.widget.tabs.isEnabled(el, destindex) && destindex >= 0);
			}
			if(destindex == -1 || destindex >= el.buttons.length) {
				$.alopex.widget.tabs.setTabIndex(el, el._currentTabIndex);
			} else {
				$.alopex.widget.tabs.setTabIndex(el, destindex);
			}
			el.press = false;
			$(el).trigger('swipechange', [el._currentTabIndex]);
		},

		_keyEventHandler: function(e) {
			var target = e.target;
			var originalTarget = target;
			var el = e.currentTarget;
			if ($(el.buttons).filter(target).length <= 0) {
				return;
			}
			var found = false;

			while ($.alopex.util.isValid(target) && !found) {
				var code = e.keyCode !== null ? e.keyCode : e.which;
				switch (code) {
				case 9: // tab
					return;
				case 37: // left
				case 38: // up
					if ($(target).prev().length !== 0) {
						target = $(target).prev()[0];
					} else {
						target = $(target).siblings().last()[0];
					}
					e.preventDefault();
					break;
				case 39: // right
				case 40: // down
					if ($(target).next().length !== 0) {
						target = $(target).next()[0];
					} else {
						target = $(target).siblings().first()[0];
					}
					e.preventDefault();
					break;
				default:
					return;
				}
				var that = $.alopex.widget.tabs;
				if(that.isEnabled(el, target.index) || target == originalTarget ) {
					found = true;
				}
			}

			$.alopex.widget.tabs.setTabIndex(target.element, target.index, true);
			e.preventDefault();
		},

		
		refreshButtons: function(el, index, setFocus) {
			el.buttonGroup.children().attr('aria-selected', 'false').attr('tabindex', '-1').removeClass('af-selected Selected');
			if (setFocus == true) {
				el.buttonGroup.children().eq(index).attr('aria-selected', 'true').attr('tabindex', '0').addClass('af-selected Selected').focus();
			} else {
				el.buttonGroup.children().eq(index).attr('aria-selected', 'true').attr('tabindex', '0').addClass('af-selected Selected');
			}
		},

		_loadHTML: function(button, el, callback) {
			// var tmpContent = button.content;
			this.requestButton = button;
			var useIframe = $(button).attr('data-content-iframe');
			
			$.alopex.loading = true;
			if(useIframe) {
				var iframe = $('<iframe></iframe>')
				.attr('src', $(button).attr('data-content'))
				.on({
					load : function() {
						button.loadType = 'local';
						$(el).trigger('tabchange', [
							button.index
						]);
						if(callback) {
							callback();
						}
					}
				});
				
				$(button.content).html(iframe);
			} else {
				$.ajax({
					url : $(button).attr('data-content'),
					cache : false,
					async : false,
					complete : function(xhr, status) {
						var button = $.alopex.widget.tabs.requestButton;
						if(status === 'error') {
							var msg = '<p>해당 웹페이지를 사용할 수 없음</p>' + '<p style="color:red;">' + xhr.statusText + '</p>';
							$(button.content).html(msg);
						} else {
							button.loadType = 'local';
							$(button.content).html(xhr.responseText).convert();
							$(el).trigger('tabchange', [
								button.index
							]);
							$(document).trigger('alopexuiready'); // -> init
							if(callback) {
								callback(); // tabchange
							}
						}
					}
				});
			}
		},

		getCurrentTabIndex: function(el) {
			return el._currentTabIndex;
		},

		getCurrentTabContent: function(el) {
			return el._currentTabContent;
		},

		setTabByContent: function(el, conName) {
			if (el.buttonGroup.length > 0) {
				var index = el.buttonGroup.find('[data-content=' + conName + ']').index();
				if(!this.isEnabled(el, index)) {
					return;
				}
				this.setTabIndex(el, index);
			}
		},

		setTabIndex: function(el, index, setFocus) {
			if(!this.isEnabled(el, index)) {
				return;
			}

			if(el.options.beforeunload && el.options.beforeunload[el._currentTabIndex]) {
				if(el.options.beforeunload[el._currentTabIndex]() === false) {
					return;
				}
			}
			el._currentTabIndex = index; // 탭 변경에 따른 현재 탭인덱스 갱신
			var that = this;
			var contents = [];
			// var isAjax = false;
			if (el.buttonGroup.length > 0) {
				var buttons = el.buttonGroup.children();
				el._currentTabContent = $(buttons[index]).attr('data-content');
				$(buttons).each(function(i, v) {
					var button = v;
					// 이전 E&S에서 선택되지 않은 콘텐트  5px로 지정해 주었다, 나중에 풀어주는 형태로 짰는데, 왜 그런지 까먹음.
					// 이전에 탭에 캐러셀 적용 시 스타일 문제가 있었던 거로 기억하는데 자세한건 모름.
					// 우선 제외. IDE쪽이랑 문제생김. 나중에 문제되면 저한테 알려주세요.
//					$(button.content).css('height', '5px'); // unselected content must not affect the height of the tabs
					if (i === index) {
						if ($(el).attr('data-flexbox') === 'true') {
							$(button.content).css({
								'display': '-webkit-box'
							});
						} else {
							$(button.content).css('display', 'block');
						}
//						$(button.content).css('height', ''); // 위의 5px 삭제와 짝.

						if (button.loadType === 'ajax') {
							isAjax = true;
							that._loadHTML(button, el);
						} else {
							// 탭이 바뀔때 tabchange 이벤트 발생. 인자로는 index 넘겨줌.
							// $.alopex.convert(button.content, true); // 강제 변환. //콘텐츠가 한화면에 있기 때문에 이미 컨버팅 된 상태.
							$(el).trigger('tabchange', [index]);						
						}
					} else {
						contents.push(button.content);
					}
				});
				if(el.options.carousel) {
					$(el).setIndex(index, {animationDuration: 0}); // carousel 인덱스 선택.
//					for(var i=0; i<contents.length; i++) {
//					$(contents[i]).css('height', '10px');
//					}
				} else {
					for(var i=0; i<contents.length; i++) {
						$(contents[i]).css('display', 'none');
					}
				}
				this.refreshButtons(el, index, setFocus);
				
				if(el.options.buttonScroller){
					this._moveScrollToShowTabButton(el);
					this._toggleButtonScrollDisabled(el);
				}
			}
		},

		clear: function(el, index) {
			var $content = $(this.getContent(el, index));
			if($.alopex && $.alopex.page) {
				for(var i in $.alopex.page) {
					if($.alopex.page.hasOwnProperty(i) && i.indexOf('#') == 0 && $content.find(i).length > 0) {
						delete $.alopex.page[i];
					}
				}
			}
			$content.empty();
			if(this.getButtons(el) && this.getButtons(el)[index]) {
				this.getButtons(el)[index].loadType = 'ajax';
			}
		},

		setEnabledByContent: function(el, flag, conName) {
			if (el.buttonGroup.length > 0) {
				var index = el.buttonGroup.find('[data-content=' + conName + ']').index();

				if(flag != this.isEnabled(el, index)) {
					this.setEnabled(el, flag, index);
				}
			}
		},

		// index가 있을 경우, 
		setEnabled: function(el, flag, index) {
			if(index != undefined) {
				if(index instanceof Array) { // 
					for(var i=0; i<index.length; i++) {
						this._setEnabled(el, flag, index[i]);
					}
				} else {
					this._setEnabled(el, flag, index);
				}
			} else { // index가 존재 하지 않는 경우, 전체 탭버튼이 다 적용.
				for(var i=0; i<el.buttons.length; i++) {
					this._setEnabled(el, flag, i);
				}
			}
		},

		_addDisabledStyle: function(el, index) {
			var $button = $(el.buttons).eq(index).addClass('af-disabled Disabled');
			if (el.options.removebutton) {
				$(el.removebuttons).eq(index).addClass('af-disabled Disabled');
			} else if($(el.buttons).eq(index).find('.'+this.classNames.removebutton).length > 0) {
				$button.find('.'+this.classNames.removebutton).addClass('af-disabled Disabled');
			}
		},

		_removeDisabledStyle: function(el, index) {
			var $button = $(el.buttons).eq(index).removeClass('af-disabled Disabled');
			if (el.options.removebutton) {
				$(el.removebuttons).eq(index).removeClass('af-disabled Disabled');
			} else if($(el.buttons).eq(index).find('.'+this.classNames.removebutton).length > 0) {
				$button.find('.'+this.classNames.removebutton).removeClass('af-disabled Disabled');
			}
		},

		isEnabled: function(el, index) {
			if (index < 0 || el.buttons.length <= index) {
				return false;
			}
			return !$(el.buttons).eq(index).hasClass('af-disabled Disabled');
		},

		_setEnabled: function(el, flag, index) {
			if(flag) {
				if(!this.isEnabled(el, index)) {
					this._bindEvent(el, index);
					this._removeDisabledStyle(el, index);
				}
			} else {
				this._unbindEvent(el, index);
				this._addDisabledStyle(el, index);
			}
		},

		_selectCallback: function(e) {
			var that = $.alopex.widget.tabs;
			var tabBtn = e.currentTarget;
			var el = tabBtn.element;

			while (tabBtn.index === undefined) {
				tabBtn = tabBtn.parentNode;
			}
			var index = $.inArray(tabBtn, el.buttons);
			tabBtn.defaultStyleClass = $(tabBtn).attr('class');
			that.setTabIndex(el, index);
			el.options.eventState = 'focused';
		},

		removeTab: function(el, index) {
			var originIndex = index;
			if (!el.buttons || el.buttons.length == 0) {
				el.buttons = el.buttonGroup.find('> li');
			}
			if(el.buttons[index]) {
				$(el.buttons[index].content).remove();
				$(el.buttons[index]).remove();
				el.buttons.splice(index, 1);
				el.removebuttons.splice(index, 1);
			}

			$.alopex.widget.tabs._resetTabIndex(el);
			$.alopex.widget.tabs._setButtongroupWidth(el);
			$.alopex.widget.tabs._setTabWidth(el);
			$(el).trigger('removetab', [index]);
			
			if(el.buttons.length > 0){
				
				// index 리무브 버튼 누른 탭
				// el._currentTabIndex 현재 열려있는 탭
				// 탭 삭제된 이 후에 포커스 될 탭을 지정해준다.
				if(index === el._currentTabIndex){
					var length_remaining = $.alopex.widget.tabs.getLength(el);
					if(length_remaining - 1 >= index){
						$.alopex.widget.tabs.setTabIndex(el, index, true);
					}else if(length_remaining - 1 < index){
						$.alopex.widget.tabs.setTabIndex(el, index - 1, true);
					}
				}
			}
		},
		_resetTabIndex: function(el) { // (탭 삭제 등의 이유로) 현재 active 탭을 기준으로 el._currentTabIndex 현재 인덱스로 갱신해준다
			$.each(el.buttons, function( index, value ) {
				value.index = index;
				
				if($(value).hasClass("Selected")
						|| $(value).hasClass("af-selected")
						|| $(value).attr("aria-selected") === "true"
						|| $(value).attr("tabindex") === "0"){
					
					el._currentTabIndex = index;
				}
			});
		},
		_setRemoveBtnEvent: function(e) {
			var removeBtn = e.currentTarget;
			var el = removeBtn.parentElement.element;
			var index = $.inArray(this.parentElement, el.buttons);
			
			$.alopex.widget.tabs.removeTab(el, index);
		},

		_bindEvent: function(el, index) {
			var that = this;
			var $button;
			if(index) {
				$button = $(el.buttons).eq(index);
			} else {
				$button = $(el.buttons);
			}

			if ($button.length == 0) {
				return;
			}

			$button.each(function() {
				that.addHoverHighlight(this);
				that.addPressHighlight(this);
			});

			// add event handler for tab change
			$button.on(el.options.tabstrigger, this._selectCallback);
			
			/* removebutton event */
			var $removeBtn;
			if (el.options.removebutton) {
				if(index) {
					$removeBtn = $(el.removebuttons).eq(index);
				} else {
					$removeBtn = $(el.removebuttons);
				}
			} else {
				$removeBtn = $button.find('.'+$.alopex.widget.tabs.classNames.removebutton);
			}
			
			if($removeBtn && $removeBtn.length>0) {
				$removeBtn.each(function() {
					that.addHoverHighlight(this);
					that.addPressHighlight(this);
				});
				$removeBtn.on('click', this._setRemoveBtnEvent);
			}
		},
		
		_unbindEvent: function(el, index) {
			var that = this;
			var $button;
			if (index != undefined) {
				$button = $(el.buttons).eq(index);
			} else {
				$button = $(el.buttons);
			}

			if ($button.length == 0) {
				return;
			}

			$button.each(function() {
				that.removeHoverHighlight(this);
				that.removePressHighlight(this);
			});

			// add event handler for tab change
			$button.off(el.options.tabstrigger, this._selectCallback);
			
			if (el.options.removebutton) {
				var $removeBtn;
				if(index) {
					$removeBtn = $(el.removebuttons).eq(index);
				} else {
					$removeBtn = $(el.removebuttons);
				}

				if ($removeBtn.length == 0) {
					return;
				}

				$removeBtn.each(function() {
					that.removeHoverHighlight(this);
					that.removePressHighlight(this);
				});

				$removeBtn.off('click', this._setRemoveBtnEvent);
			}
		},
		_showButtonScrollerPosition : function(el, isScrollbuttonShow) {
		
			var added_buttons = $(el).find(".ScrollerbuttonL, .ScrollerbuttonR, .RemoveAllTabs");
			
			$(added_buttons).each(function(){
				el[$(this).attr('class')] = $(this).attr('class');
				this.el = el; // 나중에 참조하기 위해 (_clickScrollbutton 에서)
				
				// 탭 크기에 맞게 버튼의 높이를 조정해준다
				if(el.buttons && el.buttons.length > 0){		
					var margin = $(this).css('margin').split('px')[0];
					$(this).css('min-height', $(el.buttons[0]).height() - (Number(margin) *  2));
				}
			});
			
			// 사용자 정의한 것 사용 가능 $.alopex.widget.tabs.scrollButtonClickCallback = function(e) { ... }
			var userClickCallback = this._clickScrollbutton;
			if($.alopex.util.isValid($.alopex.widget.tabs.scrollButtonClickCallback) && typeof $.alopex.widget.tabs.scrollButtonClickCallback === 'function'){
				userClickCallback = $.alopex.widget.tabs.scrollButtonClickCallback;
			}

			if(isScrollbuttonShow){
				this._toggleButtonScrollDisabled(el);
				// 스크롤 버튼 보여주기
				added_buttons.show();
				added_buttons.off("mouseup", userClickCallback); // 혹시 바인딩 되어 있는데 또 하게 될 수 있으니 일단 off 해주고 나서 on 해주자
				added_buttons.on("mouseup", userClickCallback);
			}else{
				// 스크롤 버튼 없애기
				added_buttons.hide();
				added_buttons.off("mouseup", userClickCallback);
			}
			// G-proQ 구매자재 재정의 내용
/*				$.alopex.widget.tabs.scrollButtonClickCallback = function(e) {
			
						var btn = e.currentTarget;
						var el = btn.el; // tabs element
						
						if($(btn).hasClass("ScrollerbuttonL")){
							
							//$.alopex.widget.tabs.setTabIndex(el, el._currentTabIndex - 1); // 한 칸 왼쪽으로
							$.alopex.widget.tabs.setTabIndex(el, 0); // 왼쪽 끝으로 이동
							$.alopex.widget.tabs._moveScrollToShowTabButton(el);
							
						}else if($(btn).hasClass("ScrollerbuttonR")){
							
							//$.alopex.widget.tabs.setTabIndex(el, el._currentTabIndex + 1); // 한 칸 오른쪽으로
							$.alopex.widget.tabs.setTabIndex(el, el.buttons.length - 1); // 오른쪽 끝으로 이동
							$.alopex.widget.tabs._moveScrollToShowTabButton(el);
							
						}else if($(btn).hasClass("RemoveAllTabs")){
							// tab index 0 부터 끝까지 삭제
							//while(el.buttons.length > 0){
							//	$.alopex.widget.tabs.removeTab(el, 0);
							//}
							
							// tab index 1 부터 끝까지 삭제
							while(el.buttons.length > 1){
								$.alopex.widget.tabs.removeTab(el, 1);
							}
			
							$.alopex.widget.tabs._setButtongroupWidth(el);
						}
						return false;
					};	*/
			
		},
		// 좌우측에 탭이 가려져서 안보일 경우, 내부적으로 브라우저 가로 스크롤을 이동시켜서 활성화된 탭이 화면에 보이도록 함
		_moveScrollToShowTabButton : function(el) {
			
			var $buttonScroller = $(el).find(".ButtonScroller");	
			if($buttonScroller.length === 0) return; // .ButtonScroller 없으면 아래의 내용 수행할 필요 없음
			
			var $currentTabButton = $( this._getButtonByTabIndex(el) );
			
				// 우측 1칸 이동의 경우
				var tabLeft = $currentTabButton.offset().left + $currentTabButton.outerWidth(); // 포커스탭 우상단 위치
				var wapperLeft = $buttonScroller.offset().left + $buttonScroller.innerWidth(); // 탭그룹 우상단 위치
				if(tabLeft > wapperLeft){
					if(this._isfirstTabSelected(el)){
						$buttonScroller.scrollLeft(10000); // 끝으로
					}else{
						var scrollPosition = $buttonScroller.scrollLeft();
						$buttonScroller.scrollLeft( scrollPosition + ( tabLeft - wapperLeft ) ); // 탭 우측 끝에 가려서 안보이는 부분 만큼만 스크롤 우측으로 이동
					}
					
				}

				var tabLeft = $currentTabButton.offset().left // 포커스탭 좌상단 위치
				var wapperLeft = $buttonScroller.offset().left // 탭그룹 좌상단 위치
				if(tabLeft < wapperLeft){
					if(0 === el._currentTabIndex){
						$buttonScroller.scrollLeft(0); // 처음으로
					}else{
						var scrollPosition = $buttonScroller.scrollLeft();
						$buttonScroller.scrollLeft( scrollPosition - ( wapperLeft - tabLeft ) ); // 탭 좌측 끝에 가려서 안보이는 부분 만큼만 스크롤 좌측으로 이동
					}
					
				}
		},
		_toggleButtonScrollDisabled : function(el) {
			if(this._isfirstTabSelected(el)) {
				$(el).find('.ScrollerbuttonL').setEnabled (false);
				$(el).find('.ScrollerbuttonR').setEnabled (true);
			}else if(this._isLastTabSelected(el)){
				$(el).find('.ScrollerbuttonL').setEnabled (true);
				$(el).find('.ScrollerbuttonR').setEnabled (false);
			}else{
				$(el).find('.ScrollerbuttonL').setEnabled (true);
				$(el).find('.ScrollerbuttonR').setEnabled (true);
			}
			
			if(el.options.useremoveall){ // 전체 탭 삭제 버튼 사용하는 경우 (data-use-removeall 속성 true 인 경우)
				$(el).find('.RemoveAllTabs').setEnabled (true);
				// 구매자재 pjt RemoveAllTabs 기능 사이트 커스터마이징에서, mousedown 이벤트에서 커스텀 전체탭 삭제(메인탭 이외 탭 모두 삭제) 수행되도록 했고, setEnabled false가 되도록 해줬기 때문에,  이 부분의 소스에서 안전하게 setEnabled true를 해주었다.   
			}
		},
		_isfirstTabSelected : function(el) {
			return (el._currentTabIndex === 0);
		},
		_isLastTabSelected : function(el) {
			return (el._currentTabIndex === this._getLastIndex(el));
		},
		_getLastIndex : function(el) {
			return el.buttons.length - 1;
		},
		_getButtonByTabIndex : function(el) {
			return el.buttons[el._currentTabIndex];
		},
		_clickScrollbutton : function(e) {

			var btn = e.currentTarget;
			var el = btn.el; // tabs element
			
			if($(btn).hasClass("ScrollerbuttonL")){
				
				$.alopex.widget.tabs.setTabIndex(el, el._currentTabIndex - 1); // 한 칸 왼쪽으로
//				$.alopex.widget.tabs.setTabIndex(el, 0); // 왼쪽 끝으로 이동
				$.alopex.widget.tabs._moveScrollToShowTabButton(el);
				
			}else if($(btn).hasClass("ScrollerbuttonR")){
				
				$.alopex.widget.tabs.setTabIndex(el, el._currentTabIndex + 1); // 한 칸 오른쪽으로
//				$.alopex.widget.tabs.setTabIndex(el, el.buttons.length - 1); // 오른쪽 끝으로 이동
				$.alopex.widget.tabs._moveScrollToShowTabButton(el);
				
			}else if($(btn).hasClass("RemoveAllTabs")){

				while(el.buttons.length > 0){
					$.alopex.widget.tabs.removeTab(el, 0);
				}

				$.alopex.widget.tabs._setButtongroupWidth(el);
			}
			return false;
		},
		_setButtongroupWidth : function(el) {
			//scroll사용할 경우
			if($(el).find('.Scroller').length > 0) {
				var totalWidth = 0;
				
				$(el.buttonGroup[0]).find('> li').each(function() {
					totalWidth += $.alopex.widget.tabs._getCouputedWidth(this);
				});
				
				if(el.options.buttonScroller){ // .ButtonScroller 사용했을 경우에만 동작
					if(totalWidth > $(el).innerWidth()){
						this._showButtonScrollerPosition(el, true);
					}else{
						this._showButtonScrollerPosition(el, false);
					}
				}

				$(el.buttonGroup).css('width', totalWidth + 'px');
			}
		},
		
		// el은 하나의 li element 이다
		_getCouputedWidth : function(el) {
			var style = window.getComputedStyle(el); // all the CSS properties of an element after applying the active stylesheets
			var outerWidth = $(el).outerWidth(); // padding, border 포함 너비
			var width = Number(style.width.replace("px", ""));
			var paddingLeft = Number(style.paddingLeft.replace("px", ""));
			var paddingRight = Number(style.paddingRight.replace("px", ""));
			var borderLeft = Number(style.borderLeftWidth.replace("px", ""));
			var borderRight = Number(style.borderLeftWidth.replace("px", ""));
			
			width = width - parseInt(width);
			paddingLeft = paddingLeft - parseInt(paddingLeft);
			paddingRight = paddingRight - parseInt(paddingRight);
			borderLeft = borderLeft - parseInt(borderLeft);
			borderRight = borderRight - parseInt(borderRight);
			
			return width + outerWidth + paddingLeft + paddingRight + borderLeft + borderRight;
		},
		
		// div를 가져와서 ul>li 형태의 탭버튼으로 만들어준다.
		// this._makeTabButton(tabs, li[0], -1, -1);
		_makeTabButton: function(el, tabButton, index, buttonWidth) {
			var prevContent = el.buttonGroup; // ul
			var $tabButton = $(tabButton); // li
			var $el = $(el); // div
			tabButton.element = el;
			tabButton.index = index;
			
			if(el.options.removebutton) {
				// 버튼을 만들어서 붙여준다.
				if (!tabButton.removeBtn) {
					tabButton.removeBtn = document.createElement('button');
					$(tabButton.removeBtn).attr('type', 'button').addClass('af-tabs-removebutton').appendTo(tabButton); // li 에 append 해준다
					// init 에서 el.removebuttons = []; 초기화함
					el.removebuttons.push(tabButton.removeBtn);
				}
			} else {
				// remove 버튼 배열로 가져와서 저장한다
				el.removebuttons = $el.find('.'+this.classNames.removebutton);
			}

			$tabButton.appendTo(el.buttonGroup);
			if (!$.alopex.util.isValid($tabButton.attr('class'))) {
				$tabButton.addClass('af-tabs-button');
			}
			if (!$.alopex.util.isValid($tabButton.find('img').attr('class'))) {
				$tabButton.find('img').addClass('af-tabs-button-icon');
			}
			
			if(buttonWidth != -1) {
				$tabButton.outerWidth(buttonWidth);
			}
			
			var linktabButton = (tabButton.tagName.toLowerCase() === 'li') ? $tabButton : $tabButton.find('li');
			var address = linktabButton.attr('data-content').split('#');
			
			if (address.length === 1) { // data-content="tabs-targetpath.html" >> ["tabs-targetpath.html"]
				tabButton.loadType = 'ajax';
			} else if (address.length === 2) { // data-content="#tab1" >> ["", "tab1"]
				if (address[0] === '' || address[0] === document.URL.split('#')[0]) {
					tabButton.loadType = 'local';
					tabButton.hashAddr = address[1]; // # 제외한 것
				} else {
					tabButton.loadType = 'ajax';
				}
			}

			switch (tabButton.loadType) {
			case 'local':
				var $content = $(el).find('#' + tabButton.hashAddr);
				if ($content.length > 0) {
					tabButton.content = $content[0];
				} else {
					// #aaa.bbb 이런 아이디 경우 jquery selector 작업시 오류 발생.  .bbb 를 class 로 인식하는 듯..
					var content = document.getElementById(tabButton.hashAddr);
					if($.alopex.util.isValid(content)){
						tabButton.content = content;
					} else {
						tabButton.content = document.createElement('div');
						var $scrolldiv = $(el).find(".Scroller");
						if($scrolldiv.length > 0){
							$(tabButton.content).insertAfter($scrolldiv); // scroller 있으면 스크롤러 div 뒤에
						}else{
							$(tabButton.content).insertAfter(prevContent); // scroller 없으면 ul 뒤에
						}
					}
				}
				break;
			case 'ajax': // ajax 요청으로 지정 시 동적으로 content 영역 insert.
				tabButton.content = document.createElement('div');
				var $scrolldiv = $(el).find(".Scroller");
				if($scrolldiv.length > 0){
					$(tabButton.content).insertAfter($scrolldiv); // scroller 있으면 스크롤러 div 뒤에
				}else{
					$(tabButton.content).insertAfter(prevContent); // scroller 없으면 ul 뒤에
				}
				break;
			default:
				break;
			}
			prevContent = tabButton.content;
			if (!$.alopex.util.isValid($(tabButton.content).attr('class'))) {
				$(tabButton.content).addClass('af-tabs-content');
			}
		},
		addTab: function() {
			var li;
			var tabs = arguments[0]; // tabs === el
			if(arguments.length == 2) {
				// arguments[0] - tabs element
				// arguments[1] - html
				li = $(arguments[1]);
			} else {
				// arguments[0] - tabs element
				// arguments[1] - title
				// arguments[2] - content
				li = $('<li></li>');
				li.attr('data-content', arguments[2]);
				li.html(arguments[1]);
			}
			
			this._setTabWidth(tabs); // .Scroll 사용 시에만 로직 수행됨
			this._makeTabButton(tabs, li[0], this._getLastIndex(tabs) + 1, -1);
			tabs.buttons = tabs.buttonGroup.find('> li');
			
			this._setTabWidth(tabs);  // .Scroll 사용 시에만 로직 수행됨
			this._unbindEvent(tabs, tabs.buttons.length -1);
			this._bindEvent(tabs, tabs.buttons.length -1);
			
			// addTab 시 변경된 너비의 합산 또한 변경해서 ul에 inline style width가 정상 변경되도록 한다.
			this._setButtongroupWidth(tabs);
			
			$.alopex.widget.tabs.setTabIndex(tabs, $.alopex.widget.tabs._getLastIndex(tabs));
			$(tabs).find(".ButtonScroller").scrollLeft(10000); // 끝으로
			
			// draggable true 일 경우, 새 탭에 대하여 drag & drop 이벤트 핸들러 추가 해준다
			if(tabs.options.draggable){
				this.setDraggable(tabs, true);
			}
		},
		_refeshButtonGroup: function(el) {
			var $el = $(el);
			el.buttonGroup = $el.find('> ul, >div.Scroller>ul');

			if (el.buttonGroup.length === 0) {
				el.buttonGroup = $el.find('.af-tabs-button-group');
				el.buttons = el.buttonGroup.find('> li');
			} else {
				el.buttonGroup.addClass('af-tabs-button-group');
				el.buttons = el.buttonGroup.find('> li');
			}
			
			// remove 버튼 배열로 가져와서 저장한다
			el.removebuttons = $el.find('.'+this.classNames.removebutton);
		},
		_setTabWidth: function(el) {
			if(this._getProperty(el,'contentsdisplay') == 'flex'  || $(el).attr('data-display-flex') == "true") {
				var buttons = el.buttonGroup.find('li.af-tabs-button');
				var buttonWidth = el.buttonGroup.innerWidth() / buttons.length;
				
				for ( var i = 0; i < buttons.length; i++) {
					$(buttons[i]).outerWidth(buttonWidth);
				}
			}
		}
	});
})(jQuery);
(function($) {

	$.alopex.widget.textarea = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'textarea',
		defaultClassName : 'af-textarea Textarea',
		setters : ['textarea'],

		init : function(el, options) {

		}
	});

})(jQuery);
(function($) {

	/***************************************************************************
	 * textinput
	 **************************************************************************/
	$.alopex.widget.textinput = $.alopex.inherit($.alopex.widget.baseinput, {
		widgetName : 'textinput',
		defaultClassName : 'af-textinput Textinput',
		setters : ['textinput']
	});

})(jQuery);
(function($) {
	/***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * togglebutton
	 **********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	$.alopex.widget.togglebutton = $.alopex.inherit($.alopex.widget.basebutton, {
		widgetName: 'togglebutton',
		eventHandlers : {
			toggle: {
				event : 'click',
				handler : '_toggleHandler'
			}
		},

		triggerEvent : {},

		properties: {
			checked : false
		},

		getters: [ 'isChecked' ],
		setters : [ 'togglebutton', 'setChecked', 'toggleChecked' ],

		init: function(el) {
			var $el = $(el);
			if($el.attr('data-on')) {
				el.on = $el.attr('data-on');
			} 
			if($el.attr('data-off')) {
				el.off = $el.attr('data-off');
			}
			this.setChecked(el, false);
		},

		_toggleHandler: function(e) {
			$.alopex.widget.togglebutton.toggleChecked(this);
		},

		isChecked : function(el) {
			return this._getProperty(el, 'checked');
		},

		setChecked : function(el, checked) {
			var $el = $(el);
			if (checked) {
				this._setProperty(el, 'checked', true);
				$el.addClass('af-checked Checked');
				$el.text(el.on);
			} else {
				this._setProperty(el, 'checked', false);
				$el.removeClass('af-checked Checked');
				$el.text(el.off);
			}
		},

		toggleChecked : function(el) {
			if (this.isChecked(el)) {
				this.setChecked(el, false);
			} else {
				this.setChecked(el, true);
			}
		}

	});
})(jQuery);
(function($) {

	$.alopex.widget.tooltip = $.alopex.inherit($.alopex.widget.object, {

		defaultClassName: 'af-tooltip Tooltip',

		getters: [],
		setters: ['tooltip', 'open', 'close', 'toggle'],

		properties: {
			tooltiptrigger: 'default',
			opentrigger: 'mouseenter',
			closetrigger: 'mouseleave',
			animation: 'none',
			animationtime: '300',
			track: 'false',
			position: 'auto',
			cssstyle: {
				'position': 'absolute',
				'top': '0px',
				'left': '0px'
			},
			currentstate: 'closed',
			opencallback: null,
			closecallback: null,
			margin: 10
		},

		style: function(el, options) {
			var $el = $(el);
			if ($el.attr('data-type') !== 'tooltip') {
				var tooltip = document.createElement('div');
				var $tooltip = $(tooltip);
				$tooltip.attr({
					'data-type': 'tooltip'
				});
				$tooltip.html($el.attr('title'));
				$tooltip.insertAfter(el);
				$tooltip.tooltip();
				return;
			}

			// default property
			this.properties.base = $(el).prev();
			__ALOG('properties', this.properties);
			$.extend(el, this.properties, options);
			$el.css(el.cssstyle);
			$el.css('display', 'none');
		},

		pre: function(el, options) {
			var title = $(el).attr('title');
			var $tooltip = $('<div data-type="tooltip">' + title + '</div>').insertAfter(el);
			$tooltip.tooltip();
		},

		init: function(el, options) {
			var $base = $(el.base);
			if ($base.length === 0) {
				return;
			}
			el.base = $base[0];
			$base.each(function() {
				this.tooltip = el;
			});
			if (el.tooltiptrigger === 'default') {
				$base.off('.alopexuitooltip');
				$base.on(el.opentrigger+'.alopexuitooltip', $.alopex.widget.tooltip._show);
				$base.on(el.closetrigger+'.alopexuitooltip', $.alopex.widget.tooltip._hide);
			} else if(el.tooltiptrigger) {
				$base.off('.alopexuitooltip');
				el.opentrigger = el.closetrigger = el.tooltiptrigger;
				$base.on(el.opentrigger+'.alopexuitooltip', $.alopex.widget.tooltip._toggle);
			}
		},

		_show: function(e) {
			var el = e.currentTarget.tooltip;
			$(el).open(el.opencallback);
		},

		_hide: function(e) {
			var el = e.currentTarget.tooltip;
			$(el).close(el.closecallback);
		},

		_toggle: function(e) {
			var el = e.currentTarget.tooltip;
			$(el).toggle();
		},

		open: function(el, callback) {
			var rop = $.alopex.util.getOptions(el);
			if($(rop.base).length) {
				el.base = rop.base;
				this.init(el, rop);
			}
			if(rop.position && rop.position !== el.position) {
				el.position = rop.position;
			}
			var $el = $(el);

			$el.css({
				'display': 'block'
			});
			var tooltipWidth = el.offsetWidth;
			var tooltipHeight = el.offsetHeight;
			var baseWidth = el.base.offsetWidth;
			var baseHeight = el.base.offsetHeight;
			var parent = el.offsetParent;
			while(parent) {
				if(parent == document.body || $(parent).css('position') === 'relative' || $(parent).css('position') === 'absolute') {
					break;
				}
				parent = parent.offsetParent;
			}
			var basePosition = $.alopex.util.getRelativePosition(el.base); // base엘리먼트의 화면 포지션..
			var coorPosition = $.alopex.util.getRelativePosition(parent); // 엘리먼트 기준.
			var baseLeft = basePosition.left - coorPosition.left;
			var baseTop = basePosition.top - coorPosition.top;

			var top = 0;
			var left = 0;
			switch (el.position) {
			case 'top':
				left = baseLeft + (baseWidth / 2) - (tooltipWidth / 2);
				top = baseTop - tooltipHeight - el.margin;
				$el.addClass('top Top');
				break;
			case 'bottom':
				left = baseLeft + (baseWidth / 2) - (tooltipWidth / 2);
				top = baseTop + baseHeight + el.margin;
				$el.addClass('bottom Bottom');
				break;
			case 'left':
				left = baseLeft - tooltipWidth - el.margin;
				top = baseTop + (baseHeight / 2) - (tooltipHeight / 2);
				$el.addClass('left Left');
				break;
			case 'right':
				left = baseLeft + baseWidth + el.margin;
				top = baseTop + (baseHeight / 2) - (tooltipHeight / 2);
				$el.addClass('right Right');
				break;
			default:
				//bottom
				left = baseLeft + (baseWidth / 2) - (tooltipWidth / 2);
			top = baseTop + baseHeight + el.margin;
			if (left < 0) {
				// right
				left = baseLeft + baseWidth + el.margin;
				top = baseTop + (baseHeight / 2) - (tooltipHeight / 2);
				$el.addClass('right Right');
			} else if (top + tooltipHeight > screen.Height) {
				left = baseLeft + (baseWidth / 2) - (tooltipWidth / 2);
				top = baseTop - tooltipHeight - el.margin;
				$el.addClass('top Top');
			} else if (left + tooltipWidth > screen.width) {
				left = baseLeft - tooltipWidth - el.margin;
				top = baseTop + (baseHeight / 2) - (tooltipHeight / 2);
				$el.addClass('left Left');
			} else {
				$el.addClass('bottom Bottom');
			}
			}
			$el.css({
				'left': left + 'px',
				'top': top + 'px'
			});

			switch (el.animation) {
			case 'slide':
				var height = el.offsetHeight;
				$(el).css('height', '0px');
				$(el).animate({
					'height': height + 'px'
				}, parseInt(el.animationtime, 10));
				$(el).css('height', 'auto');
				break;
			case 'fade':
				$(el).css('opacity', '0');
				$(el).animate({
					'opacity': '1'
				}, parseInt(el.animationtime, 10));
				break;
			default:
				$(el).css('display', 'block');
			break;
			}

			el.currentstate = 'opened';

			if ($.alopex.util.isValid(callback)) {
				if (typeof callback === 'string') {
					window[callback].apply();
				} else {
					callback.apply();
				}
			}
		},

		close: function(el, callback) {
			var $el = $(el);
			var $base = $(el.base);

			$el.removeClass('top bottom left right Top Bottom Left Right');
			switch (el.animation) {
			case 'slide':
				$(el).animate({
					'height': '0px'
				}, parseInt(el.animationtime, 10), function() {
					$(el).css({
						'height': 'auto',
						'display': 'none'
					});
				});
				break;
			case 'fade':
				$(el).fadeOut(el.animationtime, function(e) {
					$(el).css('display', 'none');
				});
				break;
			default:
				$(el).css('display', 'none');
			break;
			}
			el.currentstate = 'closed';

			if ($.alopex.util.isValid(callback)) {
				if (typeof callback === 'string') {
					window[callback].apply();
				} else {
					callback.apply();
				}
			}
		},

		toggle: function(el, callback) {
			if (el.currentstate === 'opened') {
				$(el).close(callback);
			} else {
				$(el).open(callback);
			}
		}

	});

})(jQuery);
(function($) {

	$.alopex.widget.tree = $.alopex.inherit($.alopex.widget.object, {
		widgetName : 'tree',
		defaultClassName : 'af-tree Tree',
		eventHandlers : {
			cancelEvent : {
				event : 'selectstart',
				handler : '_cancelEventHandler'
			}
		},
		classNames: {
			arrow: 'Arrow',
			checkbox: 'Checkbox'
		},
		setters : [ 'tree', 'createNode', 'expand', 'collapse', 'expandAll', 'collapseAll', 'deleteNode', 'editNode', 'setSelected', 'toggleCheckbox', 'showCheckbox', 'hideCheckbox', 'toggleExpand', 'setDataSource' ],
		getters : [ 'getNode', 'getSelectedNode', 'getCheckedNodes' ],

		init : function(el, options) {
			this.refresh(el);
		},

		toggleExpand : function(el, node) {
			if (node === undefined) {
				node = el;
			} else {
				node = node.node;
			}
			$.alopex.widget.tree._toggle(node);
		},

		_toggle : function(li) {
			if (!$.alopex.util.parseBoolean($(li).attr('data-expand'))) {
				if ($(li).find('ul').length > 0) {
					$.alopex.widget.tree._expand(li);
				}
			} else {
				$.alopex.widget.tree._collapse(li);
			}
		},

		toggleCheckbox : function(el) {
			if ($(el).attr('data-checkbox') !== 'visible') {
				this.showCheckbox(el);
			} else {
				this.hideCheckbox(el);
			}
		},
		
		showCheckbox: function(el) {
			$(el).attr('data-checkbox', 'visible');
			$(el).find('input[type="checkbox"]').css('display', 'inline-block');
		},
		
		hideCheckbox: function(el) {
			$(el).removeAttr('data-checkbox');
			$(el).find('input[type="checkbox"]').css('display', 'none');
		},
		
		expand : function(el, node) {
			if (node === undefined) {
				node = el;
			}
			var li = node.node;
			$.alopex.widget.tree._expand(li);
		},

		_expand : function(li) {
			var $li = $(li);
			var el = $li.closest('ul');
			$li.attr('data-expand', 'true').addClass('af-tree-expanded Expanded');
			var $ul = $li.find('> ul');
			if($ul.length === 0){
				$li.attr('data-expand', 'false').removeClass('af-tree-expanded Expanded');
			}
			$ul.css('display', 'block');
			$.alopex.widget.tree._triggerEvent(el, li, 'expand');
		},

		collapse : function(el, node) {
			if (node === undefined) {
				node = el;
			}
			var li = node.node;
			$.alopex.widget.tree._collapse(li);
		},

		_collapse : function(li) {
			if (li === undefined) {
				li = this;
			}
			var el = $(li).closest('ul');
			$(li).attr('data-expand', 'false').removeClass('af-tree-expanded Expanded');
			$(li).find('> ul').css('display', 'none');
			$.alopex.widget.tree._triggerEvent(el, li, 'collapse');
		},

		setSelected : function(el, node) {
			var selectedNode = node.node;
			$(selectedNode).closest('[data-type="tree"]').find('.af-pressed, .Selected').removeClass('af-pressed Selected');
			$(selectedNode).parents('li').each(function() {
				$.alopex.widget.tree._expand(this);
			});
			$(selectedNode).find('> a').addClass('af-pressed Selected');
		},

		expandAll : function(el) {
			$(el).find('li').each(function() {
				$.alopex.widget.tree._expand(this);
			});
		},

		collapseAll : function(el) {
			$(el).find('li').each(function() {
				$.alopex.widget.tree._collapse(this);
			});
		},

		createNode : function(el, node, data) {
			var ul = null;
			if (!$.alopex.util.isValid(node)) {
				ul = node = el;
			} else {
				node = node.node;

				ul = $(node).find('ul');
				if (ul.length > 0) {
					ul = ul[0];
				} else {
					ul = $('<ul></ul>').appendTo(node)[0];
				}
			}
			var jsonArray = [ data ];
			$.alopex.widget.tree._createNode(ul, jsonArray); // same structure

			$.alopex.widget.tree.refresh($(node).closest('ul')[0]);
		},

		deleteNode : function(el, node) {
			node = node.node;
			var $checkbox = $(node).find('input[type="checkbox"]');
			$checkbox.removeAttr('checked');
			$.alopex.widget.tree._traverseUp($checkbox[0]);
			$(node).remove();
		},

		editNode : function(el, node, data) {
			node = node.node;
			$(node).find('> a').text(data.text);
			$(node).find('> a > img.af-tree-img').attr('src', data.iconUrl);
			$(node).attr('id', data.id);
		},

		getNode : function(el, text, type) {
			if (text !== undefined) {
				text = $.alopex.util.trim(text);
			}
			var node = null;
			if (type === 'id') {
				node = $(el).find('[id="' + text + '"]')[0];
			} else {
				$(el).find('a').each(function() {
					if ($.alopex.util.trim($(this).text()) === text) {
						node = $(this).closest('li')[0];
					}
				});
			}
			return $.alopex.widget.tree._getTreeNodeObj(node);
		},

		getSelectedNode : function(el) {
			var node = $(el).find('.af-pressed').closest('li')[0];
			return $.alopex.widget.tree._getTreeNodeObj(node);
		},

		getCheckedNodes : function(el, options) {
			var array = [];
			$(el).find('input[type="checkbox"]:checked').each(function() {
				var node = $(this).closest('li')[0];
				array.push($.alopex.widget.tree._getTreeNodeObj(node));
			});
			
			if(options && options.indeterminate) {
				$(el).find('.Checkbox:indeterminate').each(function() {
					var node = $(this).closest('li')[0];
					array.push($.alopex.widget.tree._getTreeNodeObj(node));
				});
			}
			
			return array;
		},

		setDataSource : function(el, data) {
			$(el).empty();
			$.alopex.widget.tree._createNode(el, data); // same structure
			$(el).refresh(data);
		},

		_getTreeNodeObj : function(node) {
			return {
				text : $.alopex.util.trim($(node).find('> a').text()),
				iconUrl : $(node).find('> a > img.af-tree-img').attr('src'),
				id : $(node).attr('id'),
				node : node
			};
		},

		_createNode : function(ul, jsonArray) {
			$(ul).html($(ul).html() + _createNodeText(jsonArray));
			
			function _createNodeText(dataList) {
				var html = "";
				var item;
				for (var i = 0; i < dataList.length; i++) {
					item = dataList[i];
					html += '<li'

					if ($.alopex.util.isValid(item.id)) {
						html += ' id="'+ item.id + '"';
					}
					html += '>'
					html += '<span class="Arrow"></span>'
					html += '<input type="checkbox" class="Checkbox af-checkbox"/>'
					html += '<a'

					if ($.alopex.util.isValid(item.linkUrl)) {
						html += ' href="' + item.linkUrl + '"';

					}
					html += '>';

					if($.alopex.util.isValid(item.iconUrl)) {
						html += '<img src="' + item.iconUrl + '" />';
					}

					html += item.text + '</a>';

					if ($.alopex.util.isValid(item.items)) {
						html += '<ul>' + _createNodeText(item.items) + '</ul>';
					}

					html += '</li>'
				}

				return html;
			}
		},

		refresh : function(el, data) {
			$.alopex.widget.tree._structure(el);
			$.alopex.widget.tree._removeEvent(el);
      		$.alopex.widget.tree._addBasicEvent(el);
			$.alopex.widget.tree._addKeydownEvent(el);
			$.alopex.widget.tree._addCheckbox(el);
      		$.alopex.widget.tree._checkCheckbox(el, data);
		},

		_structure : function(ul) {
			var i;
			if ($(ul).attr('data-type') !== undefined && $(ul).attr('data-type').indexOf('tree') !== -1) {
				if ($(ul).children().length > 0) {
					for (i = 0; i < $(ul).children().length; i++) {
						if (i === 0) {
							$($(ul).children()[i]).find('> a').attr('tabindex', 0);
						} else {
							$($(ul).children()[i]).find('> a').attr('tabindex', -1);
						}
					}
				}
			} else {
				if ($(ul).children().length > 0) {
					for (i = 0; i < $(ul).children().length; i++) {
						$($(ul).children()[i]).find('> a').attr('tabindex', -1);
					}
				}
			}
			$(ul).find('> li')./*addClass('af-tree-node').*/each(function() {
				var $link = $(this).find('> a').addClass('af-tree-link');
				$link.find('> img').addClass('af-tree-img');

				var children = $(this).find('> ul').addClass('af-tree-group');
				var isExpandable = (children.find('li').length > 0);
				if (isExpandable) {
					$(this).addClass('expandable');
					var $span = $link.siblings('span');
					if ($span.length === 0) {
						$('<span></span>').attr('class', 'af-tree-icon Arrow').attr('data-expand', 'false').insertBefore($(this).children()[0]);
					}
					$span.attr('data-expand', 'false');
					$.alopex.widget.tree._structure(children[0]);
					$span.css('visibility', 'visible');
				} else {
					$(this.querySelectorAll('span.Arrow')).css('visibility', 'hidden');
				}

				if (!$.alopex.util.parseBoolean($(this).attr('data-expand'))) {
					$(this).attr('data-expand', 'false').removeClass('af-tree-expanded Expanded');
					$(this).find('> ul').css('display', 'none');
				}

				if($(this).find('>ul')) {
					$(this).css('list-style', 'none');
				}
			});
		},

		_removeEvent : function(el) {
			$(el).find('.af-tree-icon, li>span').unbind('click');
			$(el).find('.af-tree-link, li>a').unbind('click').unbind('dbclick').unbind('hoverstart').unbind('focusin');
		},

		_triggerEvent : function(el, link, event) {
			var _id = $(link).closest('li').attr('id');
			var _text = $.alopex.widget.tree._getNodeText(link);
			var _path = $.alopex.widget.tree._getNodePath(link);
			var target = $(link).closest('li')[0];
			
			var param = {
				id : _id,
				text : _text,
				path : _path,
				node : target
			};

			$(el).trigger(event, [ param ]);
		},

		_addBasicEvent : function(el) {
			$(el).find('.af-tree-icon, li>span').bind('click', function(e) {
				var li = e.target.parentNode;
				$.alopex.widget.tree._toggle(li);
			});
			$(el).find('.af-tree-link, li>a').bind('dbclick', function(e) {
				var leaf = e.target;
				$.alopex.widget.tree._triggerEvent(el, leaf, 'doubleselect');
				$.alopex.widget.tree._triggerEvent(el, leaf, 'dbclick');
			});
			$(el).find('.af-tree-link, li>a').bind('click', function(e) {
				var target = e.currentTarget;
				$(el).find('[class~=af-pressed]').removeClass('af-pressed');
				$(target).addClass('af-pressed');
				$(el).find('[class~=Selected]').removeClass('Selected');
				$(target).addClass('Selected');
				$.alopex.widget.tree._triggerEvent(el, target, 'select');
			});
			$(el).find('.af-tree-link, li>a').bind('hoverstart', function(e) {
				var target = e.currentTarget;
				$(el).find('[class~=af-hover]').removeClass('af-hover');
				$(target).addClass('af-hover');
				$.alopex.widget.tree._triggerEvent(el, target, 'hover');
			});
			$(el).find('.af-tree-link, li>a').bind('hoverend', function(e) {
				var target = e.currentTarget;
				$(target).removeClass('af-hover');
			});

			// $(el).find('.af-tree-link, li>a').bind('focusin', function(e) {
			// var target = e.target;
			// __ALOG('focusin select');
			// $.alopex.widget.tree._triggerEvent(el, target, 'select');
			// });
		},

		_getNodeText : function(leaf) {
			return $.alopex.util.trim($(leaf).text());
		},

		_getNodePath : function(leaf) {
			var path = '/' + $.alopex.widget.tree._getNodeText(leaf);
			try {
				while ($(leaf).closest('ul').siblings('a').length > 0) {
					leaf = $(leaf).closest('ul').siblings('a')[0];
					path = '/' + $.alopex.widget.tree._getNodeText(leaf) + path;
				}
				return path;
			} catch (e) {
				return path;
			}

		},

		/**
		 * Key Event Handler for Accessibility
		 */
		_addKeydownEvent : function(el) {
			var i, parent, pass;
			$(el).find('.af-tree-link, li>a').bind('focusin click', function(e) {
				$.alopex.widget.tree.currentTree = el;
				$(window).bind('mousedown', function(e) {
					var target = e.target;
					var ul = $(target).closest('ul');
					if (ul.length === 0 || ul[0] !== el) {
						$(document.body).unbind('keydown');
						$(window).unbind('mousedown');
					}
				});
				$(el).unbind('keydown');
				$(el).bind('keydown', function(e) {
					var target = e.target;
					var $selecttarget = $(target), $ul, $leaves;
					var code = e.keyCode !== null ? e.keyCode : e.which;
					switch (code) {
					case 36: // home
						$selecttarget.removeClass('af-pressed');
						$selecttarget = $($.alopex.widget.tree.currentTree).find('[class~="af-tree-link"]')[0];
						$selecttarget.focus();
						break;
					case 35: // end
						$selecttarget.removeClass('af-pressed');
						target = $($.alopex.widget.tree.currentTree).children('li').last();
						while ($(target).attr('data-expand') === 'true') {
							target = $(target).children('ul').children('li').last();
						}
						$selecttarget = target.find('> [class="af-tree-link"]').focus();
						break;
					case 37: // Left
						if ($selecttarget.parent().attr('data-expand') !== 'true') {
							var $parent = $selecttarget.closest('ul').siblings('[class~="af-tree-link"]');
							if ($parent.length > 0) {
								$selecttarget.removeClass('af-pressed');
								$parent.focus();
							}
						} else {
							$.alopex.widget.tree._toggle($selecttarget.parent()[0]);
						}
						break;
					case 38: // Up
						$ul = $selecttarget.closest('ul');
						$leaves = $ul.find('[class~="af-tree-link"]');

						if ($($selecttarget.parent().prev()).attr('data-expand') === 'false') {
							if ($selecttarget.parent().prev().length !== 0) {
								$($selecttarget.parent().prev().find('[class~="af-tree-link"]')[0]).focus();
								break;
							}
						}

						if ($selecttarget[0] === $leaves.first()[0]) {
							$($ul.siblings('a')).focus();
						} else if ($selecttarget[0] === $leaves.last()[0] && $($selecttarget.parent().siblings()[0]).attr('data-expand') === 'false') {
							$($selecttarget.parent().prev().find('[class~="af-tree-link"]')[0]).focus();
						} else {
							pass = false;
							i = $leaves.length - 1;
							for (; i >= 0; i--) {
								if (!pass) {
									if ($leaves[i] === $selecttarget[0]) {
										pass = true;
									}
								} else {
									if ($($leaves[i]).closest('ul').css('display') !== 'none') {
										break;
									}
								}
							}
							if (i >= 0) {
								$leaves.removeClass('af-pressed');
								$($leaves[i]).focus();
							}
						}
						break;
					case 39: // Right
						if ($selecttarget.parent().attr('data-expand') !== 'true') {
							$.alopex.widget.tree._toggle($selecttarget.parent()[0]);
						} else {
							if ($selecttarget.siblings('ul').find('[class~="af-tree-link"]').length > 0) {
								$selecttarget.removeClass('af-pressed');
								$($selecttarget.siblings('ul').find('[class~="af-tree-link"]').first()).focus();
							}
						}
						break;
					case 40: // Down
						$ul = $selecttarget.closest('ul');
						$leaves = $ul.find('[class~="af-tree-link"]');

						if ($($selecttarget.parent()).attr('data-expand') === 'false') {
							if ($selecttarget.parent().next().length !== 0) {
								$($selecttarget.parent().next().find('[class~="af-tree-link"]')[0]).focus();
								break;
							}
						}

						if ($selecttarget[0] === $leaves.last()[0]) {
							parent = $ul.parent();
							while (parent.next().length === 0) {
								parent = parent.closest('ul').parent();
								if (parent[0] === undefined) {
									return;
								}
							}
							$(parent.next().find('[class~="af-tree-link"]')[0]).focus();
						} else if ($selecttarget[0] === $leaves.first()[0] && $($leaves.first().parent()).attr('data-expand') === 'false' && $leaves.first().siblings('span').length > 0 && $selecttarget.parent().siblings().length === 0) {
							if ($($ul).attr('data-type') !== 'tree') {
								parent = $ul.parent();
								while (parent.next().length === 0) {
									parent = parent.closest('ul').parent();
								}
								$(parent.next().find('[class~="af-tree-link"]')[0]).focus();
							} else {
								if ($selecttarget.parent().next().length > 0) {
									$($selecttarget.parent().next().find('[class~="af-tree-link"]')[0]).focus();
								}
							}
						} else {
							pass = false;
							i = 0;
							for (; i < $leaves.length; i++) {
								if (!pass) {
									if ($leaves[i] === $selecttarget[0]) {
										pass = true;
									}
								} else {
									if ($($leaves[i]).closest('ul').css('display') !== 'none') {
										break;
									}
								}
							}
							if (i < $leaves.length) {
								$leaves.removeClass('af-pressed');
								$($leaves[i]).focus();
							}
						}
						break;
					default:
						return;
					}
					e.stopPropagation();
					e.preventDefault();
				});
			});
		},

		/**
		 * insert checkbox if there isn't checkbox
		 */
		_addCheckbox : function(el) {
			var checkboxVisible = $(el).closest('.Tree').attr('data-checkbox') === 'visible';

			$(el).find('input.Checkbox').each(function() {
				$this = $(this);
				$this.attr('data-type', 'checkbox').checkbox().bind('change click', $.alopex.widget.tree._checkboxHandler);
				$this.attr('style', $this.attr('style') + ';');

				if(checkboxVisible) {
					$this.css('display', 'inline-block');
				} else {
					$this.css('display', 'none')
				};
			});
		},

		/**
		 * Event Handler called when checkbox value is changed
		 */
		_checkboxHandler : function(e) {
			var checkbox = e.currentTarget;
			// 이전 버전에서는 change 이벤트로 처리하였으나, 오페라 브라우져에서 checked attribute 조작시 change 이벤트가 발생안하는 버그로
			// click 이벤트 사용. setTimeout 사용은 디폴트 액션(상태값 변화) 이후 처리하기 위해서.
			// setTimeout(function() {
				if ($(checkbox).is(':checked')) {
					$(checkbox.parentNode).find('input[type="checkbox"]').each(function() {
						this.indeterminate = false;
						this.setAttribute('checked', true);
						this.checked = true;
					});
				} else {
					$(checkbox.parentNode).find('input[type="checkbox"]').removeAttr('checked').each(function() {
						this.indeterminate = false;
						this.removeAttribute('checked');
					});
				}
				$.alopex.widget.tree._traverseUp(checkbox.parentNode);
			// }, 100);
		},

		/**
		 * Checkbox Logic
		 */
		_traverseUp : function(checkbox) {
			var numCheckbox = $(checkbox).closest('ul').find('> li > input').length;
			var numChecked = 0;
			var numIndeterminate = 0;
			$(checkbox).closest('ul').find('> li > input').each(function() {
				if (this.indeterminate) {
					numIndeterminate++;
				} else if ($(this).is(':checked')) {
					numChecked++;
				}
			});
			var parentCheckbox = $(checkbox).closest('ul').siblings('input[type="checkbox"]');
			if (parentCheckbox.length > 0) {
				if (numChecked === 0 && numIndeterminate === 0) {
					parentCheckbox.prop('indeterminate', false);
					parentCheckbox.removeAttr('checked');
					parentCheckbox.each(function() {
						this.indeterminate = false;
						this.removeAttribute('checked');
					});
				} else if (numChecked === numCheckbox) {
					parentCheckbox.prop('indeterminate', false);
					parentCheckbox.attr('checked', 'true');
					parentCheckbox.each(function() {
						this.indeterminate = false;
						this.setAttribute('checked', 'true');
						this.checked = true;
					});

				} else { // indeterminate
					parentCheckbox.prop('indeterminate', true);
					parentCheckbox.removeAttr('checked');
					parentCheckbox.each(function() {
						this.indeterminate = true;
						this.removeAttribute('checked');
					});
				}
				$.alopex.widget.tree._traverseUp(parentCheckbox[0]);
			}
		},
		
		_checkCheckbox: function(el, data) {
			var sortedData = {};
			if(data) {
				for(var i = 0 ; i < data.length ; i++) {
					sort(data[i]);
				}
			}

			function sort(data) {
				var childCheckCount = 0;
				if(data.id) {
					sortedData.type = "ID";
					sortedData[data.id] = data.checked;
				} else {
					sortedData[data.text] = data.checked;
				}
				if(data.items && (data.items instanceof Array) && (data.items.length > 0)) {
					for(var i = 0 ; i < data.items.length ; i++) {
						if(sort(data.items[i])) {
							childCheckCount++;
						}
					}
					
					if(childCheckCount == data.items.length) {
						sortedData[data.id] = true;
					} else if(childCheckCount > 0) {
						sortedData[data.id] = {};
						sortedData[data.id].ime = true;
					}

					if(sortedData[data.id] == true)
						return true;
					else 
						return false;
				}

				return data.checked;
			}

			var $this;
			if(sortedData.type == "ID") {
				$(el).find('li').each(function() {
					$this = $(this);
					checkbox = $this.find('>.af-checkbox')[0];
					$checkbox = $(checkbox);

					if(sortedData[this.id] == true) {
						$checkbox.attr('checked', true);
						checkbox.checked = true;
					} else if(sortedData[this.id] && sortedData[this.id]['ime']) {
						$checkbox.prop('indeterminate', true);
						$checkbox.removeAttr('checked');
						checkbox.indeterminate = true;
						checkbox.removeAttribute('checked');
					}
				});
			} 
			else {
				$(el).find('.af-tree-link').each(function() {
					$this = $(this);
					checkbox = $this.find('>.af-checkbox')[0];
					$checkbox = $(checkbox);
					if(sortedData[$this.text()]) {
						$checkbox.attr('checked', true);
						checkbox.checked = true;
					} else if(sortedData[$this.text()] && sortedData[$this.text()]['ime']) {
						$checkbox.prop('indeterminate', true);
						$checkbox.removeAttr('checked');
						checkbox.indeterminate = true;
						checkbox.removeAttribute('checked');
					}
				});
			}
		}
	});

})(jQuery);
/*!
* Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex UI Javascript Event Module.
*
* Date : 20140212
*/
(function($) {
  var useClickFallback = true;
  var eventns = '.alopexUiEventModel';
  function _dbg(msg) {
	  $('.alopex-event-debug').text(msg)
  }
  //__ALOG('loaded');
  var state = {}, currentState = {}, istouch, statecount = 0, trigger = {},
  timeoutTrigger = [], threshold = {}, event = {}, eventCancelPair = {},
  allEvent = [], movingEvent = [], processor = {},
  startevent, moveevent, endevent, name;

  function createState() {
    var obj = {};
    obj.id = statecount++;
    obj.entry = obj.doing = obj.exit = null;
    obj.transition = [];
    return obj;
  }

  function createTransition(to, trigger, guard, effect) {
    var obj = {};
    obj.to = to || null;
    obj.trigger = trigger || null;
    obj.guard = guard || null;
    obj.effect = effect || null;
    return obj;
  }

  //system base setup
  istouch = 'ontouchstart' in window;
  if(istouch) {
	  useClickFallback = false;
  }
  if(false) {
    startevent = (istouch ? 'touchstart' : 'mousedown')+eventns;
    moveevent = (istouch ? 'touchmove' : 'mousemove')+eventns;
    endevent = istouch ? 'touchend'+eventns+' touchcancel'+eventns : 'mouseup'+eventns;
  } else {
    startevent = istouch ? 'touchstart' : 'mousedown';
    startevent += eventns;
    startevent += ' keydown' + eventns;
    moveevent = istouch ? 'touchmove' : 'mousemove';
    moveevent += eventns;
    endevent = istouch ? 'touchend'+eventns+' touchcancel'+eventns : 'mouseup'+eventns;
    endevent += ' keyup' + eventns;
  }
  //define state transition trigger
  trigger.down = null;
  trigger.move = null;
  trigger.up = null;
  trigger.timeout = null;

  for (name in trigger) {
    trigger[name] = name;
  }

  //define supported event
  event.pressed = null;
  event.unpressed = null;
  event.move = null;
  //hover event
  event.hoverstart = null;
  event.hoverend = null;
  event.hovering = null;
  //tap event
  event.tap = null;
  event.singletap = null;
  event.doubletap = null;
  event.tripletap = null;
  event.longtap = null;
  //drag event(based on HTML5 drag&drop api behavior)
  event.drag = null;
  event.dragend = null;
  event.dragstart = null;
  event.dragenter = null;
  event.dragleave = null;
  event.dragover = null;
  event.drop = null;
  //swipe event
  event.swipe = null;
  event.swipemove = null;
  event.swipecancel = null;
  event.swipeleft = null;
  event.swiperight = null;
  event.swipedown = null;
  event.swipeup = null;
  //transform event
  event.pinch = null;
  event.rotate = null;
  event.transform = null;
  event.transformmove = null;
  //general gesture event
  event.gesturestart = null;
  event.gesturechange = null;
  event.gestureend = null;

  for (name in event) {
    event[name] = name;
  }

  //20121108 tap과 singletap에 대한 개발자 가이드의 문제 ->
  //tap의 이름을 singletap으로 하고, singletap을 onetimetap이름으로 정의한다.
  event.tap = 'singletap';
  event.singletap = 'onetimetap';

  for (name in event) {
    allEvent.push(event[name]);
  }
  //tap-singletap 이벤트 처리 관련 문제.
  allEvent.push('tap');

  movingEvent = [event.drag, event.dragenter, event.dragleave, event.dragover,
      event.dragstart, event.dragend, event.drop, event.swipe, event.swipemove,
      event.swipecancel, event.pinch, event.rotate, event.transform,
      event.transformmove, event.gesturestart, event.gesturechange,
      event.gestureend];

  //이벤트 비정상 종료시, 이벤트 시작-종료 처리를 위해 사용.
  eventCancelPair[event.swipe] = event.swipecancel;
  eventCancelPair[event.swipemove] = event.swipecancel;
  eventCancelPair[event.swiperight] = event.swipecancel;
  eventCancelPair[event.swipeleft] = event.swipecancel;
  eventCancelPair[event.swipedown] = event.swipecancel;
  eventCancelPair[event.swipeup] = event.swipecancel;
  eventCancelPair[event.pressed] = event.unpressed;
  eventCancelPair[event.hoverstart] = event.hoverend;
  eventCancelPair[event.hovering] = event.hoverend;

  threshold.move_d = 5; // 단위 : px
  threshold.swipe_d = 100; // 단위 : px
  threshold.swipe_v = 100; // 단위 : px/sec
  threshold.longtap_t = 750; // 단위 : ms
  threshold.ntap_t = 250; // 단위 : ms.
  threshold.hover_v = 100;// 단위 : px/sec

  /****************************************************
   * 엘리먼트에 직접 가해지는 raw 이벤트 및 해당 엘리먼트 처리에 대한 low-level함수
   ***************************************************/
  //특정 element로 부터 data-event 값을 이용하여 이벤트 핸들러를 생성한다.
  var attrEventHandler = function(elem, name) {
    if(!elem || !name) {
      return null;
    }
    if(!$(elem).attr('data-'+name)) {
      return null;
    }
    var func = new Function('event, aevent', ''+ $(elem).attr('data-'+name) + ';');
    return func;
  };
  
  var downHandler = function(e) {
    var returnValue = true;
    var actualtrigger = trigger.down;

    if (e.which && !(e.which === 1 || e.which === 13 || e.which === 32)) {
      return;
    }
    
//    if(e.type == 'keydown' && e.target.tagName == "A") {
//      $(e.target).one('click', function(ev){ev.preventDefault();});
//    }
    
    if (e.type === 'touchstart' && e.originalEvent.touches.length > 1) {
      //touch 손가락 증가에 대해서 move로 처리.
      actualtrigger = trigger.move;
    }
    advanceState(actualtrigger, e);
    return returnValue;
  };
  var lp = null; 
  var moveHandler = function(e) {
    //IE7-8에서 mousemove가 무한히 발생.
	if(!istouch) {
	    if(!lp) {
	      lp = {};
	      lp.x = e.pageX;
	      lp.y = e.pageY;
	    } else {
	      if(lp.x === e.pageX && lp.y === e.pageY) {
	        return;
	      }
	      lp.x = e.pageX;
	      lp.y = e.pageY;
	    }
	}
    advanceState(trigger.move, e);
  };

  var upHandler = function(e) {
    var actualtrigger = trigger.up;
    if (e.which && !(e.which === 1 || e.which === 13 || e.which === 32)) {
      //__ALOG(e.which);
      return;
    }
    if (e.type === 'touchend' && e.originalEvent.touches.length > 0) {
      //touch 손가락 감소에 대해서 move로 처리.
      actualtrigger = trigger.move;
    }
    advanceState(actualtrigger, e);
  };

  var isStayingStill = function(e) {
    if ($(currentState.pressedElement)[0] === $(e.target)[0]) {
      return true;
    }
    return false;
  };

  var isMovedOverElement = function(e) {
    if (!currentState.currentElement) {
      return false;
    }
    if (currentState.currentElement !== currentState.previousElement) {
      return true;
    }
    return false;
  };
  
  var _preventDefault = function (e){
    e.preventDefault();
  };

  var extendEventObject = function(eobj, origin) {
    $.each(['target','pageX','pageY','which','metakey',
            'relatedTarget', 'clientX', 'clientY','offsetX','offsetY'], 
      function(idx, val) {
        eobj[val] = origin[val];
      }
    );
    eobj.originalEvent = origin;
    eobj.isOriginalDefaultPrevented = function() {
      return !!this.originalDefaultPrevented;
    };
    eobj.preventOriginalDefault = function() {
      this.originalDefaultPrevented = true;
    };
    eobj.isOriginalPropagationStopped = function() {
      return !!this.originalPropagationStopped;
    };
    eobj.stopOriginalPropagation = function() {
      this.originalPropagationStopped = true;
    };
  };

  //마우스/키보드 외의 수단에서 인위적으로 .click()을 실행하는 경우에 대한 우회책 구현. 
  //data-tap attribute를 가진 엘리먼트에 대한 click에서 이를 처리. 
  $(function(){
    if(!useClickFallback) return;
    $(document.body)
      .off('.alopexworkaround')
      .on('click.alopexworkaround', '[data-tap]', function(e) {
        //label과 input[type="checkbox|radio"] 에 대해서는 우회책을 적용하지 않는다.
        var tagName = String(this.tagName).toUpperCase();
        if(tagName === "LABEL") return;
        if(tagName === "INPUT") {
          var type = String(this.type).toLowerCase();
          if(type === "checkbox" || type === "radio") return;
        }
        //data-tap에 의해 이벤트가 발생했을경우에는 실행할 필요가 없다.
        var $this = $(this);
        var tapped = $this.data('alopex-ui-data-tap');
        $this.data('alopex-ui-data-tap',null);
        if(tapped) { 
          return;
        }
        $this.data('alopex-ui-data-tap-keyup', true);
        var attrEvent = attrEventHandler(this, event.tap);
        if($.isFunction(attrEvent)) {
          e.type = event.tap;
          return attrEvent.call(this, e);
        }
        if(event.tap !== "tap") {
          attrEvent = attrEventHandler(this, "tap");
          if($.isFunction(attrEvent)) {
            e.type = "tap";
            return attrEvent.call(this, e);
          }
        }
      });
  });
  
  var triggerEvent = function(e, elem, eventname) {
    var arg = Array.prototype.slice.call(arguments, 3),
        el = $(elem), eobj = $.Event(eventname);
    if (arg.length && typeof arg[0] === typeof [] && arg[0].length > 0) {
      arg = arg[0];
    }
    //touchcancel이 호출된 경우 무조건 현재 이벤트의 cancelpair를 호출하도록 한다.
    if(e.type==='touchcancel') {
      triggerCancel(e);
      return;
    }
    //data attribute event handler를 생성하고, 일회용으로 bind 함.
    var attrEvent = attrEventHandler(elem, eventname);
    if(attrEvent && $ === window['jQuery']) { //20130323 attribute custom event의 이중실행 방지
      el.one(eventname, attrEvent);
      if(useClickFallback && eventname === "tap") {
        el.data('alopex-ui-data-tap', true);
        if(e.type === "keyup" && el.data('alopex-ui-data-tap-keyup')) {
          el.off(eventname, attrEvent);
          el.data('alopex-ui-data-tap-keyup', null);
          el.data('alopex-ui-data-tap', null);
        }
      }
    }
    
    //singletap-tap 구분에 대한 문제 처리 위한 임시 코드.
    //event.tap이 singletap으로 정의되어 있을 경우 tap이벤트도 같이 발생시키도록 한다.
    if(eventname === event.tap && event.tap === 'singletap') {
      var targ = $.makeArray(arguments);//Array.prototype.slice.call(arguments, 0);
      targ[2] = 'tap';
      triggerEvent.apply(null, targ);
    }
    extendEventObject(eobj, e);
    //event extension에서 우회처리하기 위한 이벤트발생시점의 original type 정보 지정
    if(eventname === "tap" || eventname === "singletap") {
      eobj.origType = e.type;
    }
    el.trigger(eobj, arg);

    if (eobj.isOriginalDefaultPrevented()) {
      try {
        e.preventDefault();
      } catch (err) {
      }
    }
    if (eobj.isDefaultPrevented()) {
      //anchor에 대해서 preventDefault가 지정된 경우,
      //click핸들러에 일회용 preventDefault핸들러를 연결한다.
      for (var i = 0; i < el.length; i++) {
        if (el[i].tagName === 'A' ||
            (el[i].tagName === 'BUTTON' && el[i].type === 'submit')) {
          $(el[i]).one('click', _preventDefault);
        }
      }
    }
    if (eobj.isOriginalPropagationStopped()) {
      try { //originalEvent가 invalidated된 경우 IE에서 Exception 발생
        e.stopPropagation();
      } catch (err) {
      }
    }

    if (eventCancelPair[eventname]) {
      var c = eventCancelPair[eventname];
      arg[0] = c;
      currentState.needCancel[c] = {
        elem: elem,
        arg: arg
      };
    }
  };

  var triggerCancel = function(e) {
    for (var prop in currentState.needCancel) {
      var c = currentState.needCancel[prop];
      var eobj = $.Event(c.arg[0]);
      extendEventObject(eobj, e);
      $(c.elem).trigger(eobj, c.arg.slice(1));
    }
    delete currentState.needCancel;
    currentState.needCancel = {};
  };

  /****************************************************
   * Timeout Trigger와 관련된 함수.
   ***************************************************/
  var registerTimeoutFromState = function(st, e) {
    for (var i = 0; i < st.transition.length; i++) {
      var item = st.transition[i];
      if (item.trigger && item.trigger.indexOf(trigger.timeout) !== -1) {
        registerTimeout(item, e);
      }
    }
  };

  var registerTimeout = function(tran, e) {
    var t = tran.trigger.split(trigger.timeout)[1], tvar = null;

    tvar = setTimeout(function() {
      advanceState(tran.trigger, e);
    }, t);
    timeoutTrigger.push(tvar);
  };

  var unregisterTimeout = function() {
    if (timeoutTrigger.length > 0) {
      for (var i = 0; i < timeoutTrigger.length; i++) {
        clearTimeout(timeoutTrigger[i]);
      }
//      delete timeoutTrigger; // commented out by jsHinit
    }
    timeoutTrigger = [];
  };

  /****************************************************
   * 좌표계와 관련된 함수
   ***************************************************/
  var isMoved = function(e) {
    var x = getPageX(e), y = getPageY(e), //XXX multitouch에 대응되지 않음
    dx = currentState.startX - x, dy = currentState.startY - y;

    if (Math.sqrt(dx * dx + dy * dy) >= threshold.move_d) {
      return true;
    }
    return false;
  };

  var getPageX = function(e, trace) {
    var eobj = e;
    trace = trace || currentState.trace;
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
      eobj = e.originalEvent;
    }

    if (istouch && eobj.touches && eobj.touches.length > 0) {
      return eobj.touches[0].pageX;
    } else if (eobj.pageX !== undefined && eobj.pageX !== null) {
      return eobj.pageX;
    } else {
      var idx = trace.length - 1;
      if (idx < 0) {
        return 0;
      }
      return trace[idx].x;
    }
  };

  var getPageY = function(e, trace) {
    var eobj = e;
    trace = trace || currentState.trace;
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
      eobj = e.originalEvent;
    }

    if (istouch && eobj.touches && eobj.touches.length > 0) {
      return eobj.touches[0].pageY;
    } else if (eobj.pageY !== undefined && eobj.pageY !== null) {
      return eobj.pageY;
    } else {
      var idx = trace.length - 1;
      if (idx < 0) {
        return 0;
      }
      return trace[idx].y;
    }
  };

  var getDistance = function(x1, y1, x2, y2) {
    var dx = x1 - x2, dy = y1 - y2;
    return Math.floor(Math.sqrt(dx * dx + dy * dy));
  };

  var getCurrentSpeed = function(e, trace) {
    trace = trace || currentState.trace;
    var obj = {
      value: 0,
      valueX: 0,
      valueY: 0
    };
    if (trace.length > 2) {
      var tr1 = trace.length - 2, tr2 = trace.length - 1, d, dt;

      //마지막과 차마지막 엘리먼트의 좌표값이 완전 동일할 경우 move후 up일 수 있으므로
      //바로 앞의 trace와 비교하도록 한다.
      if (trace[tr1].x === trace[tr2].x && trace[tr1].y === trace[tr2].y) {
        tr1 = trace.length - 3;
      }
      //500ms이내에 기록된 다른 trace가 있을 경우 기록에 사용한다.
      if (trace[tr1 - 1] && (trace[tr1].time - trace[tr1 - 1].time) < 500) {
        tr1--;
      }

      d = getDistance(trace[tr2].x, trace[tr2].y, trace[tr1].x, trace[tr1].y);
      dt = trace[tr2].time - trace[tr1].time;

      var dx = trace[tr2].x - trace[tr1].x, dy = trace[tr2].y - trace[tr1].y;

      obj.value = Math.floor((d / dt) * 1000);
      obj.valueX = Math.floor((dx / dt) * 1000);
      obj.valueY = Math.floor((dy / dt) * 1000);
    } else {

    }
    $.each(['value', 'valueX', 'valueY'], function(i, v) {
      if (obj[v] === Infinity || isNaN(obj[v])) {
        obj[v] = 0;
      }
    });

    return obj;
  };

  var getCurrentMilli = function(t) {
    return new Date().getTime();
  };

  var getCoordinate = function(e, trace) {
    var obj = {}, speed;
    trace = trace || currentState.trace;
    obj.startX = currentState.startX;
    obj.startY = currentState.startY;

    // XXX multitouch에 대응하지 못함.
    obj.pageX = getPageX(e, trace);
    obj.pageY = getPageY(e, trace);

    obj.distance = getDistance(obj.startX, obj.startY, obj.pageX, obj.pageY);
    obj.distanceX = obj.pageX - obj.startX;
    obj.distanceY = obj.pageY - obj.startY;

    speed = getCurrentSpeed(e, trace);
    obj.speed = speed.value;
    obj.speedX = speed.valueX;
    obj.speedY = speed.valueY;

    obj.alignment = '';
    obj.direction = '';

    if (obj.distance < threshold.move_d) {
      obj.alignment = 'stay';
      obj.direction = 'none';
    } else {
      var sin = obj.distanceY / obj.distance;
      if (-0.5 <= sin && sin <= 0.5) {
        //-30~30도, 150~210도
        obj.alignment = 'horizontal';
      } else if (0.866 <= sin || sin <= -0.866) {
        //60~120도, 240~300도
        obj.alignment = 'vertical';
      } else {
        obj.alignment = 'diagonal';
      }

      if (sin <= -0.5 || sin >= 0.5) { //30~150도, 210~330도. down or up
        if (obj.distanceY > 0) {
          obj.direction += 'down';
        } else {
          obj.direction += 'up';
        }
      }
      if (-0.866 <= sin && sin <= 0.866) { //-60~60, 120~240도. right or left
        if (obj.distanceX > 0) {
          obj.direction += 'right';
        } else {
          obj.direction += 'left';
        }
      }
    }

    return obj;
  };

  /****************************************************
   * 이벤트 핸들러 존재여부와 관련된 함수.
   ***************************************************/
  var hasAnyHandler = function(elem, list) {
    var result = false, arr = list || allEvent;
    $.each(arr, function(index, value) {
      if (hasHandler(elem, value)) {
        result = true;
        return false;
      }
    });
    //data-attribute
    var dataevents = ['tap', event.singletap, event.doubletap, event.tripletap,
                      event.longtap];
    $.each(dataevents, function(i,name) {
      if($(elem).attr('data-'+name)) {
        //__ALOG(name);
        result = true;
      }
    });
    return result;
  };

  var hasHandler = function(elem, eventname,toparent) {
    var handler = null;

    if (!elem) {
      return false;
    }
    var $elem = elem.jquery ? elem : $(elem);

    elem = elem.jquery ? $elem[0] : elem;

    if ($._data) {
      handler = $._data($elem[0], 'events');
    } else {
      handler = $elem.data('events');
    }
    //data attribute
    var attr = $elem.attr('data-' + eventname);
    if(attr) {
      handler = {};
      handler[eventname] = attr;
    }
    if (handler && handler[eventname]) {
      return true;
    }
    if(toparent===true) {
	    var $parent = $elem.parent();
	    if($parent.length && $elem.prop('tagName') !== 'BODY') {
	    	return hasHandler($parent, eventname,true);
	    }
    }
    return false;
  };

  var getHandlerOwner = function(e, eventname) {
    var owner = e.target, name = (typeof eventname === typeof '') ?
        [eventname] : eventname,
    hasit = hasAnyHandler(owner, name);
    while (!hasit && !!owner.parentElement) {
      owner = owner.parentElement;
      hasit = hasAnyHandler(owner, name);
    }
    if (eventname && !hasit) {
      return null;
    }
    return owner;
  };

  /****************************************************
   * 이벤트의 실제 판별 및 트리거링 로직을 담은 함수
   ***************************************************/
  processor.swipe = function(e) {
    var coor = getCoordinate(e);
    var el = getHandlerOwner(e, [event.swipe, event.swipeleft,
        event.swiperight, event.swipeup, event.swipedown, event.swipemove,
        event.swipecancel]);
    var condition = $(el).data('swipecondition');

    var currentDistance, conditionDistance;
    var currentSpeed, conditionSpeed;

    if (condition && (condition.direction || condition.alignment)) {
      if (condition.alignment &&
          condition.alignment.indexOf(coor.alignment) === -1) {
        currentDistance = -1;
        currentSpeed = -1;
      } else if (condition.alignment &&
                 condition.alignment.indexOf(coor.alignment) !== -1) {
        if (coor.alignment === 'vertical') {
          currentDistance = Math.abs(coor.distanceY);
          currentSpeed = Math.abs(coor.speedY);
        } else if (coor.alignment === 'horizontal') {
          currentDistance = Math.abs(coor.distanceX);
          currentSpeed = Math.abs(coor.speedX);
        } else {
          currentDistance = Math.abs(coor.distance);
          currentSpeed = Math.abs(coor.speed);
        }
      } else if (condition.direction &&
          condition.direction.indexOf(coor.direction) !== -1) {
        if (coor.direction === 'up') {
          currentDistance = -coor.distanceY;
          currentSpeed = -coor.speedY;
        } else if (coor.direction === 'down') {
          currentDistance = coor.distanceY;
          currentSpeed = coor.speedY;
        } else if (coor.direction === 'left') {
          currentDistance = -coor.distanceX;
          currentSpeed = -coor.speedX;
        } else if (coor.direction === 'right') {
          currentDistance = coor.distanceX;
          currentSpeed = coor.speedX;
        } else {
          currentDistance = -1;
          currentSpeed = -1;
        }
      } else {
        currentDistance = -1;
        currentSpeed = -1;
      }
    } else {
      currentDistance = coor.distance;
      currentSpeed = coor.speed;
    }

    conditionDistance = (condition && condition.distance) ?
        condition.distance : threshold.swipe_d;
    conditionSpeed = (condition && condition.speed) ?
        condition.speed : threshold.swipe_v;

    if (condition && condition.distance && !condition.speed) {
      currentSpeed = -1;
    }
    if (condition && condition.speed && !condition.distance) {
      currentDistance = -1;
    } //조건이 둘다 제시되거나 default를 하는 경우에는 or조건으로 적용하기 위함.

    //distanceX/Y조건 우선.
    if (condition && condition.distanceX) {
      currentDistance = Math.abs(coor.distanceX);
      currentSpeed = -1;
      conditionDistance = Math.abs(condition.distanceX);
      conditionSpeed = 0;
    }
    if (condition && condition.distanceY) {
      currentDistance = Math.abs(coor.distanceY);
      currentSpeed = -1;
      conditionDistance = Math.abs(condition.distanceY);
      conditionSpeed = 0;
    }

    if (currentDistance >= conditionDistance ||
        currentSpeed >= conditionSpeed) {
      $.each(['up', 'down', 'left', 'right'], function(i, v) {
        if (coor.direction === v) {
          triggerEvent(e, currentState.pressedElement,
              'swipe' + coor.direction, coor);
        }
      });
      triggerEvent(e, currentState.pressedElement, event.swipe, coor);
    } else {
      triggerEvent(e, currentState.pressedElement, event.swipecancel, coor);
    }
  };

  processor.ntap = function(e) {
    var ntapevent = [event.tap, event.singletap, event.doubletap,
        event.tripletap], tapcount = currentState.tapcount;
    if (tapcount > 3) {
      tapcount = 3;
    }
    triggerEvent(e, currentState.pressedElement, ntapevent[tapcount]);
    currentState.tapcount = 0;
  };

  //TODO Drag&Drop
  processor.dragstart = function(e) {};
  processor.dragmove = function(e) {};
  processor.dragend = function(e) {};

  /****************************************************
   * State전진을 위한 함수들
   ***************************************************/
  var initCurrentState = function() {
    for(var prop in currentState) {
      if(currentState.hasOwnProperty(prop) &&
          (prop !== 'pointer' && prop !== 'tapcount')) {
        delete currentState[prop];
      }
    }
    currentState.pressedElement = null;
    currentState.currentElement = null;
    currentState.previousElement = null;
    currentState.startX = null;
    currentState.startY = null;
    currentState.trace = [];
    //currentState.tapcount = 0;
    currentState.needCancel = {};
  };

  var enterState = function(st, e) {
    if (!st) { return false; }
    if (st.entry) { st.entry(e); }
    if (st.doing) { st.doing(e); }
  };

  var hasNullTransition = function() {
    var curr = currentState.pointer;
    for (var i = 0; i < curr.transition.length; i++) {
      if (!curr.transition[i].trigger) {
        return true;
      }
    }
    return false;
  };

  var advanceState = function(inputtrigger, e) {
    function _triggerCancel() {
      triggerCancel(e);
    }
    do {
      var curr = currentState.pointer, appliedTransition = null;

      currentState.previousElement = currentState.currentElement;
      currentState.currentElement = e.target;

      var tmptrace = {};
      tmptrace.time = getCurrentMilli();
      tmptrace.x = getPageX(e);
      tmptrace.y = getPageY(e);
      if( currentState.trace.length === 0 ||
          (tmptrace.x !== currentState.trace[currentState.trace.length-1].x ||
          tmptrace.y !== currentState.trace[currentState.trace.length-1].y) ) {
        currentState.trace.push(tmptrace);
      }
      //__ALOG(inputtrigger + ','+currentState.pointer.name+','+currentState.trace.length);
      
      for (var i = 0; i < curr.transition.length; i++) {
        var item = curr.transition[i];

        if (item.trigger !== inputtrigger && item.trigger !== null) {
          continue;
        }

        if (item.guard === null || (typeof item.guard === 'function' && item.guard(e))) {
          appliedTransition = item;
          break;
        }
      }

      if (!appliedTransition) {
        //현재 state에서 적용가능한 state transition이 없는데 down 이 일어났다면
        //state 진행의 에러로 간주하고 최초 state로 이동하도록 한다.
        if (inputtrigger === trigger.down) {
          appliedTransition = {
            to: state.pressedinitial,
            effect: _triggerCancel
          };
        } else if (inputtrigger.indexOf(trigger.timeout) !== -1) {
          //timeout이벤트에 의해서 들어오긴 했는데 가드조건을 통과하지 못할 경우.
          unregisterTimeout();
          registerTimeoutFromState(curr, e);
          return false;
        } else {
          return false;
        }
      }

      unregisterTimeout();
      if (curr.exit) {
        curr.exit(e);
      }

      if ((!!appliedTransition) && appliedTransition.effect) {
        appliedTransition.effect(e);
      }

      currentState.pointer = appliedTransition.to;
      curr = currentState.pointer;

      enterState(curr, e);
      registerTimeoutFromState(curr, e);
      inputtrigger = null;
    } while (hasNullTransition());
  };

  /*************************************************************
   * State정의
   *************************************************************/
  state.idle = createState();
  state.hover = createState();
  state.pressedinitial = createState();
  state.unpressed = createState();
  state.pressedinter = createState();
  state.moving = createState();
  state.endmove = createState();

  //iOS6에서 unpressed handler가 alert창 띄운뒤 승인 누를시 down trigger 발생.
  //이를 막기 위해 unpressed로 진입 전 약간의 딜레이를 준다.
  state.unpressedwait = createState();

  state.idle.entry = function(e) {
    initCurrentState();
    $(document).unbind(eventns);
    $(document).bind(startevent, downHandler);
    $(document).bind(moveevent, moveHandler);
    //20130617 tap과 연계한 event state machine관리 문제로 hover를 
    //기본 state machine에서 분리하여 별도 state machine으로 구성한다.
    //handleIdleHover();
  };
  var detectDisabled = function(e) {
    var el = getHandlerOwner(e);
    if ($(el).attr('disabled')) {
      return true;
    }
    return false;
  };
  state.idle.transition.push({
    to: state.pressedinitial,
    trigger: trigger.down,
    guard: function(e) {
      return !detectDisabled(e);
    },
    effect: function(e) {
    }
  });
  var handleIdleHover = function(e) {
    if(!e || !e.target) {
      return;
    }
    var hel = getHandlerOwner(e, [event.hoverstart, event.hovering,
                                  event.hoverend]);
    if(hel && !istouch) {
      addTohover(state.idle.transition);
    } else {
      removeTohover(state.idle.transition);
    }
  };
  var addTohover = function(transition) {
    removeTohover(transition);
    transition.push({
      to: state.hover,
      trigger: trigger.timeout + '25',//과도한 overhead 방지.
      guard: function(e) {
        var el = getHandlerOwner(e, [event.hoverstart, event.hovering,
            event.hoverend]);
        if (el) {
          var cond = $(el).data('hovercondition');
          if (cond && cond.delay) {
            var dt = getCurrentMilli() - currentState.lastHoverTime;
            if (dt > cond.delay) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        }
        return false;
      },
      effect: function(e) {
        currentState.pressedElement = getHandlerOwner(e, [event.hoverstart,
            event.hovering, event.hoverend]);
        currentState.currentElement = getHandlerOwner(e);
        triggerEvent(e, currentState.pressedElement, event.hoverstart,
            getCoordinate(e));
      }
    });
  };
  var removeTohover = function(transition) {
    for(var i=transition.length-1; i >=0; i--) {
      if(transition[i].to === state.hover) {
        transition.splice(i,1);
      }
    }
  };
  state.idle.transition.push({
    to: state.idle,
    trigger: trigger.move,
    guard: function(e) {
      var coor = getCoordinate(e);
      currentState.lastHoverTime = getCurrentMilli();
      //state.idle.entry 항목 참조.
      //handleIdleHover(e);
      if (coor.speed > threshold.hover_v || isMovedOverElement(e)) {
        return true;
      }
      return false;
    },
    effect: function(e) {
    }
  });

  //IE 더블클릭 처리 버그로 인해 idle state에서 down 없이 up 만 발생하는 경우,
  //pressedinitial의 entry와 do를 수행하도록 한다.
  state.idle.transition.push({
    to: state.unpressed,
    trigger: trigger.up,
    guard: function(e) {
      //down없이 keyup이 일어나는 경우에 대해서는 처리하지 않음.
      return !detectDisabled(e) && !(e.which === 13 || e.which === 32);
    },
    effect: function(e) {
      state.pressedinitial.entry(e);
      state.pressedinitial.doing(e);
    }
  });

  state.hover.transition.push({
    to: state.hover,
    trigger: trigger.move,
    guard: function(e) {
      var elem = getHandlerOwner(e, [event.hoverstart, event.hovering,
          event.hoverend]);
      if (currentState.pressedElement !== elem) {
        return false;
      }
      return true;
    },
    effect: function(e) {
      triggerEvent(e, currentState.pressedElement, event.hovering,
          getCoordinate(e));
    }
  });
  state.hover.transition.push({
    to: state.idle,
    trigger: trigger.move,
    guard: function(e) {
      var elem = getHandlerOwner(e, [event.hoverstart, event.hovering,
          event.hoverend]);
      if (currentState.pressedElement !== elem) {
        return true;
      }
      return false;
    },
    effect: function(e) {
      triggerEvent(e, currentState.pressedElement, event.hoverend,
          getCoordinate(e));
    }
  });
  state.hover.transition.push({
    to: state.pressedinitial,
    trigger: trigger.down,
    guard: function(e) {
      return !detectDisabled(e);
    },
    effect: function(e) {
      triggerEvent(e, currentState.pressedElement, event.hoverend,
          getCoordinate(e));
    }
  });

  state.pressedinitial.entry = function(e) {
    //__ALOG('pressedinitial'+e.type+','+currentState.tapcount);
    initCurrentState();
    currentState.tapcount = 0;
    currentState.pressedElement = e.target;//getHandlerOwner(e);
    currentState.currentElement = getHandlerOwner(e);
    currentState.startX = getPageX(e);
    currentState.startY = getPageY(e);//XXX multitouch에 대응하지 못함.

    $(document).unbind(moveevent);
    $(document).unbind(endevent);
    $(document).bind(moveevent, moveHandler);
    $(document).bind(endevent, upHandler);
  };
  state.pressedinitial.doing = function(e) {
    triggerEvent(e, currentState.pressedElement, event.pressed,
        getCoordinate(e));
  };
  state.pressedinitial.transition.push({
    to: state.moving,
    trigger: trigger.move,
    guard: function(e) {
      var result = isMoved(e);
      return result;
    },
    effect: function(e) {

    }
  });
  state.pressedinitial.transition.push({
    //to : state.unpressed,
    to: state.unpressedwait,
    trigger: trigger.up,
    guard: function(e) {
      return !detectDisabled(e);
    },
    effect: function(e) {
    }
  });
  state.pressedinitial.transition.push({
    to: state.idle,
    trigger: trigger.timeout + threshold.longtap_t,
    guard: function(e) {
      return hasHandler(currentState.pressedElement, event.longtap,true);
    },
    effect: function(e) {
      triggerEvent(e, currentState.pressedElement, event.longtap,
          getCoordinate(e));
      triggerEvent(e, currentState.pressedElement, event.unpressed,
          getCoordinate(e));
    }
  });

  var unpressedwait_tr = {
    to: state.unpressed,
    trigger: null,
    guard: null,
    effect: null
  };
  if (istouch) {
    unpressedwait_tr.trigger = trigger.timeout + 50;
  }

  state.unpressedwait.transition.push(unpressedwait_tr);

  state.unpressed.entry = function(e) {
    triggerEvent(e, currentState.pressedElement, event.unpressed,
        getCoordinate(e));
  };
  state.unpressed.doing = function(e) {
    currentState.tapcount++;
    triggerEvent(e, currentState.pressedElement, event.tap);
  };
  state.unpressed.transition.push({
    to: state.idle,
    trigger: trigger.timeout + threshold.ntap_t,
    guard: null,
    effect: function(e) {
      processor.ntap(e);
    }
  });
  state.unpressed.transition.push({
    to: state.pressedinter,
    trigger: trigger.down,
    guard: function(e) {
      return isStayingStill(e) && !isMoved(e);
    },
    effect: null
  });
  state.unpressed.transition.push({
    to: state.pressedinitial,
    trigger: trigger.down,
    guard: function(e) {
      return !isStayingStill(e) || isMoved(e);
    },
    effect: null
  });
  //IE7~9 호환성 문제 - 더블클릭시 mousedown과 click이 생략되는 문제.
  //webbugtrack.blogspot.kr/2008/01/bug-263-beware-of-doubleclick-in-ie.html
  state.unpressed.transition.push({
    to: state.unpressed,
    trigger: trigger.up,
    guard: function(e) {
      //down 없이 keyup 발생시 처리하지 않음. 
      return !(e.which === 13 || e.which === 32);
    },
    effect: function(e) {}
  });

  state.pressedinter.entry = function(e) {
    triggerEvent(e, currentState.pressedElement, event.pressed,
        getCoordinate(e));
  };
  state.pressedinter.transition.push({
    //to : state.unpressed,
    to: state.unpressedwait,
    trigger: trigger.up,
    guard: function(e) {
      return true;
    },
    effect: null
  });
  state.pressedinter.transition.push({
    to: state.pressedinitial,
    trigger: trigger.timeout + threshold.ntap_t,
    guard: null,
    effect: function(e) {
      processor.ntap(e);
    }
  });
  state.pressedinter.transition.push({
    to: state.moving,
    trigger: trigger.move,
    guard: function(e) {
      var result = isMoved(e);
      return result;
    },
    effect: function(e) {
      processor.ntap(e);
    }
  });

  state.moving.doing = function(e) {
    var coor = getCoordinate(e);
    triggerEvent(e, currentState.pressedElement, event.move, coor);
    triggerEvent(e, currentState.pressedElement, event.swipemove, coor);
  };
  state.moving.transition.push({
    to: state.endmove,
    trigger: trigger.up,
    guard: null,
    effect: null
  });
  state.moving.transition.push({
    to: state.moving,
    trigger: trigger.move,
    guard: null,
    effect: null
  });

  state.endmove.doing = function(e) {
    triggerEvent(e, currentState.pressedElement, event.unpressed,
        getCoordinate(e));
    processor.swipe(e);
  };
  state.endmove.transition.push({
    to: state.idle,
    trigger: null,
    guard: null,
    effect: function(e) {}
  });

  for (name in state) {
    state[name].name = name;
  }

  /**************************************************
   * special event 정의 영역. event parameter등을 처리한다.
   *************************************************/

  var specialEventsRegister = function() {
    var specialswipe = ['', 'left', 'right', 'up', 'down'];
    $.each(specialswipe, function(i, v) {
      $.event.special['swipe' + v] = {
        setup: function(data, namespaces, eventHandle) {
          if (!!data) {
            $(this).data('swipecondition', data);
          }
        },
        teardown: function(namespaces) {
          $(this).removeData('swipecondition');
        }
      };
    });

    if(!istouch) {
    var specialhover = [event.hoverend, event.hovering, event.hoverstart];
    var hovertrace = [];
    var hoverhandler = function(e) {
      var ct = {};
      ct.time = getCurrentMilli();
      ct.x = getPageX(e, hovertrace);
      ct.y = getPageY(e, hovertrace);
      hovertrace.push(ct);
      if(hovertrace.length > 5) {
        hovertrace.shift();
      }
      var coor = getCoordinate(e, hovertrace);
      var el = this;
      var data = $(el).data('hovercondition');
      if(e.type === 'mousedown' || e.type === 'mouseout') {
        $(el).trigger('hoverend', coor);//__ALOG('end1');
      } else if(e.type === 'mouseup' || e.type === 'mouseover') {
        $(el).trigger('hoverstart', coor);//__ALOG('start2');
      } else if(e.type === 'mousemove' && e.which === 0) {
        $(el).trigger('hovering', coor);//__ALOG('ing');
      }
    };
    //$(document).on('mousedown mouseup mouseover mousemove mouseout', hoverhandler);
    var rawhover = ['mousedown','mouseup','mouseover','mousemove','mouseout',''];
    $.each(specialhover, function(i, v) {
      $.event.special[v] = {
        setup: function(data, namespaces, eventHandle) {
          if (!!data) {
            $(this).data('hovercondition', data);
          }
        },
        add : function(handleObj) {
          if(handleObj.data) {
            $(this).data('hovercondition', handleObj.data);
          }
          $(this).on(rawhover.join('.alopexeventhover'+v+' '), handleObj.selector || null, hoverhandler);
        },
        teardown: function(namespaces) {
          $(this).removeData('hovercondition');
          $(this).off(rawhover.join('.alopexeventhover'+v+' '), hoverhandler);
        }
      };
    });
    }
    
    //tap계열 이벤트에 대한 jQuery Plugin 구현
    var taps = ['tap', 'singletap'];
    $.each(taps, function(i,v) {
      $.fn[v] = function(handler) {
        if(handler) {
          return this.bind(v, handler);
        } else {
          //tap과 singletap은 동일. 향후 singletap은 제거한다.
          return this.trigger('tap').trigger('singletap');
        }
      };
    });
    if(useClickFallback) {
      //마우스/키보드 외의 수단에서 인위적으로 .click()을 실행하는 경우에 대한 우회책을 
      //jQuery event extension 으로 구현. 
      var f = ["tap","singletap"];
      var fpos = {x:null,y:null};
      $.each(f, function(idx,eventname) {
        $.event.special[eventname] = {
            setup : function(data, eventHandle) {
              //label과 input[type="checkbox|radio"] 에 대해서는 우회책을 적용하지 않는다.
              var tagName = String(this.tagName).toUpperCase();
              if(tagName === "LABEL") return;
              if(tagName === "INPUT") {
                var type = String(this.type).toLowerCase();
                if(type === "checkbox" || type === "radio") return;
              }
              var $this = $(this);
              $this.on('click.alopexuitapworkaround'+eventname, function(e) {
                var tapped = $this.data('alopex-ui-tap-wtapped'+eventname);
                $this.data('alopex-ui-tap-wtapped'+eventname,null);
                if(tapped) {
                  return; 
                }
                var prevd = false;
                var stopp = false;
                
                var eobj = $.Event(eventname);
                //eobj.stopPropagation();
                $this.each(function(){
                  $(this).triggerHandler(eobj,[true]);
                });
                prevd = prevd || eobj.isDefaultPrevented();
                //stopp = stopp || eobj.isPropagationStopped();
                
                $this.data('alopex-ui-tap-wtapped-keyup'+eventname,true);
              })
              .on('mousedown.alopexuitapworkaround'+eventname, function(e) {
                fpos.x = e.pageX;
                fpos.y = e.pageY;
              })
              .on('mouseup.alopexuitapworkaround'+eventname, function(e) {
                var thr = threshold.move_d;
                if(Math.abs(fpos.x - e.pageX) > thr || Math.abs(fpos.y - e.pageY) > thr) {
                	$(this).data('alopex-ui-tap-wtapped'+eventname,true);
                }
              });
            },
            teardown : function() {
              var $this = $(this);
              $this.off('.alopexuitapworkaround'+eventname);
            },
            _default : function(event, data) {
              $(this).data('alopex-ui-tap-wtapped-keyup'+eventname,null);
            },
            handle : function(event,noinc) {
              var $this = $(this);
              var handleObj = event.handleObj;
              var targetData = jQuery.data( event.target );
              var ret = null;
              event.type = handleObj.origType;
              if(!(event.origType === "keyup" && $this.data('alopex-ui-tap-wtapped-keyup'+eventname))) {
                ret = handleObj.handler.apply(this, arguments);
                if(noinc !== true) {
                  $this.data('alopex-ui-tap-wtapped'+eventname, true);
                }
              }
              event.type = handleObj.type;
              return ret;
            }
        };
      });
      
    }
    var tapevents = [event.singletap, event.doubletap, event.tripletap,
                     event.longtap];
    $.each(tapevents, function(i,v) {
      $.fn[v] = function(handler,realHandler) {
        if($.isFunction(handler)) {
          this.on(v, handler);
        } else if($.isPlainObject(handler) && $.isFunction(realHandler)) {
          this.on(v, handler, realHandler);
        } else {
          this.trigger(v);
        }
      };
    });
  };

  //drag & drop 구현.
  // http://api.jquery.com/category/events/event-object/
  //$.event.props.push('dataTransfer');

  /**************************************************
   * 이벤트모듈 초기화
   *************************************************/
  var unbindme = function() {
    $(document).unbind(eventns);
    $(document).unbind(startevent);
    $(document).unbind(moveevent);
    $(document).unbind(endevent);
  };

  function init() {
    unbindme();
    initCurrentState();
    currentState.tapcount = 0;
    currentState.pointer = state.idle;
    enterState(currentState.pointer, {});
  }

  specialEventsRegister();
  init();
})(jQuery);

+(function($){
    //initial convert worker. should run after alopex object has properly constructed.
    $(function() {
        // add jQuery Plugin
        var apis = {};
        for ( var name in $.alopex.widget) {
            for ( var i = 0; i < $.alopex.widget[name].getters.length; i++) {
                var api = $.alopex.widget[name].getters[i];
                apis[api] = null;
            }
        }

        for ( var name in apis) {// Register Alopex UI Getter API
            $.fn[name] = new Function('return $.alopex._getter.call(this, "' + name + '", arguments)');
        }

        apis = {};
        for ( var name in $.alopex.widget) {
            for ( var i = 0; i < $.alopex.widget[name].setters.length; i++) {
                var api = $.alopex.widget[name].setters[i]
                apis[api] = null;
            }
        }

        for ( var name in apis) { // Register Alopex UI Setter API
            $.fn[name] = new Function('return $.alopex._setter.call(this, "' + name + '", arguments)');
        }
        $.alopex.checkBrowser();
        $.alopex.convert('body');

    });
})(jQuery);

/*! Alopex UI - v2.3.1.16 - 2016-03-30
* http://ui.alopex.io
* Copyright (c) 2016 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */
!function($) {
	var eventname = 'ready';
	window.isAlopexReady = false;
	
	if(window.alopexController) {
		eventname = 'alopexready';
	}
	$(document).on(eventname, function() {
		window.isAlopexReady = true;
	});
	
	
}(jQuery);



!function($) {
	$.extend($.alopex, {
		session: function() {
			
			if (isAlopexWindowPopup()) {
				var $parent = window.opener.$a;
				return $parent.session.apply(this, arguments);
			} else if (checkAlopexWindowParent() && window.parent && window.parent != window && window.parent.$a) {
				var $parent = window.parent.$a;
				return $parent.session.apply(this, arguments);
			} else {
				if (arguments.length == 1) {
					return memoryPreference.get(arguments[0]);
				} else if (arguments.length > 1) {
					memoryPreference.put.apply(memoryPreference, arguments);
				}
			}
		},
		
		cookie: function() {
			if (arguments.length == 1) {
				return preference.get(arguments[0]);
			} else if (arguments.length > 1) {
				preference.put.apply(preference, arguments);
			}
		}
	});
	$.alopex.session.clear = function() {
		memoryPreference.removeAll();
	};
	$.alopex.cookie.clear = function() {
		preference.removeAll();
	};
}(jQuery);

!function($) {
	$.alopex.validator = window.Validator,
	window.$a = $.alopex;
}(jQuery);


!function($) {
	if(!window.alopexController) { // alopex_controller polyfill
		function isValid(arg) {
			if (arg == undefined || arg == null) {
//				var caller = arguments.callee;
//				while (true) {
//					caller = caller.caller;
//					if (caller == null) {
//						break;
//					}
//					if (caller.name != "") {
//						console.log("Caller : " + caller.name);
//					}
//				}

				return false;
			} else {
				return true;
			}
		}
		function MemoryPreference() {
			this.data;
			if(!sessionStorage.alopex) {
				sessionStorage.alopex = "";
			}
			this.data = sessionStorage.alopex;
		}

		MemoryPreference.prototype.setData = function(data) {
			this.data = data;
			sessionStorage.alopex = data;
		}
		MemoryPreference.prototype.contains = function(key) {
			if (isValid(key)) {
				if (this.data.indexOf("ù") != -1) {
					var keys = this.data.split("ù")[0];
					var keyArray = keys.split("♠");

					for ( var i = 0; i < keyArray.length; i++) {
						if (keyArray[i] == "mp-" + key) {
							return true;
						}
					}
				}
				return false;
			}
		};
		MemoryPreference.prototype.get = function(key) {
			if (isValid(key)) {
				if (this.data.indexOf("ù") != -1) {
					var keys = this.data.split("ù")[0];
					var values = this.data.split("ù")[1];
					var keyArray = keys.split("♠");
					var valueArray = values.split("♠");

					for ( var i = 0; i < keyArray.length; i++) {
						if (keyArray[i] == "mp-" + key) {
							return valueArray[i];
						}
					}
				}
				return "undefined";
			} else {
				return "undefined";
			}
		};
		MemoryPreference.prototype.put = function(key, value) {
			if (isValid(key) && isValid(value)) {

				if (this.data.indexOf("ù") != -1) {
					var keys = this.data.split("ù")[0];
					var values = this.data.split("ù")[1];
					var keyArray = keys.split("♠");
					var valueArray = values.split("♠");

					for ( var i = 0; i < keyArray.length; i++) {
						if (keyArray[i] == "mp-" + key) {
							valueArray[i] = value;
							this.setData(keyArray.join("♠") + "ù" +	valueArray.join("♠"));
							return;
						}
					}
					keyArray.push("mp-" + key);
					valueArray.push(value);

					this.setData(keyArray.join("♠") + "ù" +	valueArray.join("♠"));
				} else {
					this.setData("mp-" + key + "ù" + value);
				}
			}
		};

		MemoryPreference.prototype.remove = function(key) {
			if (isValid(key)) {

				var keys = this.data.split("ù")[0];
				var values = this.data.split("ù")[1];

				if (keys != null && values != null) {
					var keyArray = keys.split("♠");
					var valueArray = values.split("♠");

					for ( var i = 0; i < keyArray.length; i++) {
						if (keyArray[i] == "mp-" + key) {
							keyArray.splice(i, 1);
							valueArray.splice(i, 1);
							this.setData(keyArray.join("♠") + "ù" + valueArray.join("♠"));
							return;
						}
					}
				}
			}
		};

		MemoryPreference.prototype.removeAll = function() {
			var keys = this.data.split("ù")[0];
			var values = this.data.split("ù")[1];

			if (keys != null && values != null) {
				var keyArray = keys.split("♠");
				var valueArray = values.split("♠");

				var len = keyArray.length;
				for ( var i = 0; i < len; i++) {
					if (keyArray[i] != null) {
						if (keyArray[i].substring(0, 3) == "mp-") {
							keyArray.splice(i, 1);
							valueArray.splice(i, 1);
							i--;
							len--;
						}
					}
				}
				this.setData(keyArray.join("♠") + "ù" + valueArray.join("♠"));
			}
		};
		if(!window.memoryPreference) {
			window.memoryPreference = new MemoryPreference();
		}
		

		function Preference() {
		}

		Preference.prototype.contains = function(key) {
			if (isValid(key)) {
				return (preference.get(key) !== undefined && preference.get(key) !== 'undefined');
			}
			return false;
		};

		/*
		 * source from jQuery Cookie Plugin v1.3(MIT)
		 * https://github.com/carhartl/jquery-cookie
		 */

		Preference.prototype.get = function(key) {

			if (isValid(key)) {

				var decode = function(s) {
					return decodeURIComponent(s.replace(/\+/g, ' '));
				}

				var cookies = document.cookie.split('; ');
				for ( var i = 0, l = cookies.length; i < l; i++) {
					var parts = cookies[i].split('=');
					var part = parts.shift();
					if (decode(part) === key) {
						var cookie = decode(parts.join('='));
						return cookie;
					}
				}

				return undefined;
			}
		};

		Preference.prototype.put = function(key, value, expires) {

			if (isValid(key)) {
				if (typeof expires === 'number') {
					var days = expires, t = expires = new Date();
					t.setDate(t.getDate() + days);
				}
				document.cookie = [encodeURIComponent(key), '=',
						encodeURIComponent(value),
						expires ? '; expires=' + expires.toUTCString() : '' // use expires attribute, max-age is not supported by IE
				].join('');

			}
		};

		Preference.prototype.remove = function(key) {
//			console.log("[Preference/remove]");
			if (isValid(key)) {
				if (preference.get(key) !== undefined) {
					preference.put(key, undefined);
				}
			}
		};

		Preference.prototype.removeAll = function() {
//			console.log("[Preference/removeAll]");
			notSupported("Preference.removeAll");
		};
		
		if(!window.preference) {
			window.preference = new Preference();
		}
	}
	
}(jQuery);

!function($) {
	$.alopex.decorator = function(config) {
		this.process = function() {
			config.template = this.template;
			var decorator = $('script[type="text/alopex-decorator"]').attr('data-decorator');
			var metas = config.options.metas;
			for (i in metas) {
				var tag = '<meta';
				for (j in metas[i]) {
					var metaAttr = metas[i][j];
					tag += ' ' + metaAttr.prop + '="' + metaAttr.value + '"';
				}
				tag += '/>'
				$('head').prepend(tag);
			}
			if(config[decorator || config.options.defaultDecorator]){
				config[decorator || config.options.defaultDecorator]();
			}

			//깜빡임 현상을 방지하기 위하여 HTML을 display:none했다가 show
			$('html').show();
		}
		return this;
	};

	$.alopex.view = function(name, view) {
		var inst = $.alopex.viewConfig.views[name];
		if (inst == undefined && view !== undefined) {
			inst = new $.alopex._view(name, view);
			$.alopex.viewConfig.views[name] = inst;
		}
		return inst;
	}

	$.alopex.viewSetup = function(options) {
		$.extend($.alopex.viewConfig.settings, options);
	};

	$.alopex.viewConfig = {
		views: {},
		settings: {
			templateBasePath: 'source/templates',
			templateFileExtension: '.html'
		}
	}

	$.alopex._view = function(name, view) {
		this.name = name;
		$.extend(this, view);
	}
	
	$.alopex._view.prototype = {
		template: function(model) {
			var templateName = this.templateName || (this.name + $.alopex.viewConfig.settings.templateFileExtension);
			var method = AlopexWebApp.Templates[$.alopex.viewConfig.settings.templateBasePath + '/' + templateName];
			if(method && typeof method == 'function') {
				return method(model);
			}
			return '';
		},
		render: function(model) {
			var outlet = this.outlet || this.name;
			model = model || this.model;
			model = (model && typeof model === 'function') ? model() : model;
			var $outlet = $('[data-outlet="' + outlet + '"]');
			
			$outlet.html(this.template(model));
			$outlet.convert(); //alopex ui convert
		}
	};
}(jQuery);
(function($) {
	
	
	// 변경되는 부분. 
	/**
	 * 변경되는 부분
	 * 
	 * fileupload 관련된 최소 기능 제공.
	 * 
	 * 서버에서 오는 response가 다를 수 있다.  --> parsing 하는 룰이 달라져야 한다.
	 * progress 처리는 ? 따로 구현해야 되나? 서버랑 맞춰야 되나?
	 * cancel은 가능한가?
	 * ajax로 보낼수 있는지 (FormData)
	 * 
	 * 
	 */

	function FileSelector(options) {
		this.form;
		this.input;
		this.files;
		this.add;
		this.iframe;
		this.selected = [];
		this.options = options; // file options : multiple , success
	}

	FileSelector.prototype.addForm = function(element) {
		var iframe_id = '_iframe_' + Math.random();
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute('id', iframe_id);
		this.iframe.setAttribute('name', iframe_id);
		this.form = document.createElement('form');
		this.form.setAttribute('method', 'post');
		this.form.setAttribute('enctype', 'multipart/form-data');
		this.form.setAttribute('target', iframe_id);

		$(this.iframe).appendTo('body')//.hide();
		$(this.form).appendTo(element);
		$(element).css('overflow', 'hidden');
	};

	FileSelector.prototype.addInput = function() {
		// 기존 input이 있을 경우,
		if (this.input) {
			this.selected.push(this.input);
			$(this.input).hide();
		}
		

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'file');
		this.input.setAttribute('name', 'file');

		if (this.options.multiple) {
			this.input.setAttribute('multiple', true);
		}
		$(this.input).css({
			display : 'block',
			top : 0,
			right : 0,
			height : '100%',
			width : '100%',
			'font-size' : '1000px'
		});
		$(this.input).css({
			position : 'absolute',
			right : '0px',
			top : '0px',
			height : '40px',
			width : '200px',
			opacity : 0
		});

		var that = this;
		$(this.input).on('change', function(e) {
			if (e.target.files) { // file api가 있는경우, IE는 10+
				that.files = e.target.files;
			} else {
				that.files = [ {
					name : e.target.value
				} ];
			}
			if (that.options.success) {
				that.options.success.apply(this, [ that.files ]);
			}
		});
		$(this.input).appendTo(this.form);
	};

	FileSelector.prototype.upload = function(options) {
		this.form.action = options.url;

		var $inputs = $(this.form).find('input[type="file"]');
		if ($inputs.length > 2)
			$inputs.eq(0).remove();

		var that = this;
		window.aa = this.iframe
		$(this.iframe).one('load', function(e) {
			var result;
			var error;
			try {
				error = {
					code: 'E001',
					message: 'Cross-Domain'
				};
				result = $(that.iframe.contentDocument.body).find('pre').html();
				error = {
					code: 'E002',
					message: 'JSON Parse Error'
				};
				result = JSON.parse(result);
			} catch (e) {}
			
			if(result && ((options.isSuccess && options.isSuccess(result)) || (!options.isSuccess))) {
				options.success(result);
			} else {
				options.error(error);
			}
			
//			e.preventDefault();
		});

		if (options.success) {
			window._uploadSuccessCallback = options.success;
		}
		if (options.error) {
			window._uploadErrorCallback = options.error;
		}
		$(this.form).trigger('submit');
	};

	FileSelector.prototype.removeSelected = function(filename) {
		for (var i = 0; i < this.selected.length; i++) {
			if (this.selected[i].value == filename) {
				$(this.selected[i]).remove();
				this.selected.splice(i, 1);
				break;
			}
		}
	};

	$.fn.fileselect = function(options) {
		var element = this[0];
		var file = new FileSelector(options);
		file.addForm(element);
		file.addInput();
		return file;
	};

})(jQuery);

// constructor : markup, style, init, event, defer: timing issue에 사용.

(function($) {

	/**
	 * fileupload (TBD)
	 * 서버에서 오는 response가 다를 수 있다.  --> parsing 하는 룰이 달라져야 한다.
	 * progress 처리는 ? 따로 구현해야 되나? 서버랑 맞춰야 되나?
	 * cancel은 가능한가?
	 * ajax로 보낼수 있는지 (FormData)
	 * 
	 */

})(jQuery);


/*!
* Copyright (c) 2014 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex Javascript Framework
* alopex-page
*
*/
!function($) {
	
	$.extend($.alopex, {
		fragment: function(entry) {
			var event;
			if(typeof entry !== 'function') {
				return ;
			}
			
			if(isAlopexReady) { // Alopex Runtime을 사용하고, 해당 페이지가 나중에 로드된 케이스.
				event = 'alopexuiready';
			} else {
				if (window.alopexController) {
					event = 'alopexready';
				} else {
					event = 'ready';
				}
			}
			
			var entrycode = entry.toString();
			entrycode = entrycode.replace(/function\s*\(\s*\)\s*\{/i, '');
			entrycode = entrycode.substr(0, entrycode.length-1);
			var _entrycode = ''
				+ 'var exports = {};'
				+ entrycode
				+ '$(document).one("' + event + '", function() {'
				+ ';init($a.parameters);'
				+ '});'
				+ ';return exports;';
			var _entry = new Function(_entrycode);
			return _entry();
		}
	});
	
}(jQuery);

//
///**
// * 페이지 코드.
// */
//var page = $a.fragment(function() {       
//	// this area code is executed when `$a.fragment` function is called.       
//	
//	// private variable    
//	var privateVariable = '';       
//	// public variable    
//	var publicVariable = '';       
//	function privateFunction() {     }       
//	function publicFunction() {     }       
//	
//	/**
//	 * this function is executed when the page resource is loaded & alopex module is ready to run
//	 */
//	function init(param) { // 
//		// tab 함수 접근.
//		$('#tab').on('loaded', function() {
//			tab.tabPublicFunction(); 
//		});
//	} 
//		
//	// public property of fragment should be exported by `exports` keyword.    
//	exports.publicVariable = publicVariable;     
//	exports.publicFunction = publicFunction;     
//});
//
//
///**
// * 탭 페이지 내부 코드.
// * 이 부분은 탭 페이지 로직을 구현하는 부분입니다.
// */
//var tab = $a.fragment(function() {
//	
//	function init(param) {
//		// 탭의 초기화 코드.
//		$('#tab').trigger('loaded');
//	}
//	
//	exports.tabPublicFunction = function() {}; 
//});


!function($){
  var _legacyHttpObjects = [];
  function _legacyHttp() {
    this.error = -1;
    this.errorMessage = null;
    this.response = null;
    this.responseHeader = null;
    _legacyHttpObjects = _legacyHttpObjects || [];
    _legacyHttpObjects.push(this);
    this.index = _legacyHttpObjects.length - 1;
    this.httpRequestHeaders = {};
    //this.httpRequestKeys = [];
    //this.httpRequestValues = [];
    this.httpObject;
  }
  function _httpIsValid(d) {
    if (d === undefined || d === null)
      return false;
    return true;
  }

  _legacyHttp.prototype.cancelDownload = function() {
    if (this.httpObject != null)
      this.httpObject.abort();
  };

  _legacyHttp.prototype.cancelRequest = function() {
    if (this.httpObject != null)
      this.httpObject.abort();
  };

  _legacyHttp.prototype.cancelUpload = function() {
    if (this.httpObject != null)
      this.httpObject.abort();
  };

  _legacyHttp.prototype.download = function(entity, successCallback,
      errorCallback, progressCallback, cancelCallback) {
  };

  _legacyHttp.prototype.getResponseHeader = function(header) {
    if (this.httpObject != null) {
      return this.httpObject.getResponseHeader(header);
    } else {
      return null;
    }
  };

  _legacyHttp.prototype.request = function(entity, successCallback, errorCallback) {

    if (_httpIsValid(entity) && _httpIsValid(successCallback)
        || _httpIsValid(errorCallback)) {
      entity.index = this.index;
      var http = {};
      
      // SKT 전송망, Access망 프로젝트용
      if($.alopex.util.isValid(entity["paramType"])){
    	  http.paramType = entity["paramType"];
      }
      
      var paramString = "";

      if (entity["parameters"] != null) {
        paramString = "?";
        for ( var j in entity["parameters"])
          paramString = paramString + "&" + j + "="
          + entity["parameters"][j];
        paramString = paramString.substring(0, 1)
        + paramString.substring(2);
      }

      this.httpObject = new XMLHttpRequest();

      this.httpObject.onreadystatechange = function() {
        if (this.readyState == 4) {
          http.status = this.status;
          http.statusText = this.statusText;
          var headerStr = this.getAllResponseHeaders();
          if (headerStr) {
            http.responseHeader = {};
            var headerPairs = headerStr.split('\u000d\u000a');
            for (var i = 0, ilen = headerPairs.length; i < ilen; i++) {
              var headerPair = headerPairs[i];
              var index = headerPair.indexOf('\u003a\u0020');
              if (index > 0) {
                http.responseHeader[headerPair.substring(0,
                    index)] = headerPair
                    .substring(index + 2);
              }
            }
          }
          if (this.status == 200) {
//            http.response = this.responseText;
          	  try{
          		http.response = JSON.parse(this.responseText);
          	  }catch(err){
          		http.errorInfo = "JSON.parse() error : responseText = " + this.responseText;
          		if($.alopex.util.isValid(err.message)) http.errorMessage = err.message;
          		if($.alopex.util.isValid(err.name)) http.errorName = err.name;
          		if($.alopex.util.isValid(err.stack)) http.errorStack = err.stack;

                errorCallback(http, this);
                
          	  }finally{
          		  
          		  // JSON.parse() error  errorInfo를 생성하지 않으면 성공으로 본다
          		  if(!$.alopex.util.isValid(http.errorInfo)) successCallback(http, this);
          		  
          		  delete this.responseText;
                    delete http.response;
                    delete http;
                    
                    // 20150727
        	        // XMLHttpRequest 객체에서 this.responseText 자원을 사용중이기에 null 포함 어떤 임의의 값으로 변경할 수 없음
        	        try{
        	            this.responseText = null;
        	        }catch(e){}
                    http.response = null;
                    http = null;
          	  }

            } else {
            http.error = this.status;
            http.errorMessage = this.statusText;
            errorCallback(http, this);    
            
            delete this.responseText;
            delete http.response;
            delete http;
            
	        // 20150727
	        // XMLHttpRequest 객체에서 this.responseText 자원을 사용중이기에 null 포함 어떤 임의의 값으로 변경할 수 없음
	        try{
	            this.responseText = null;
	        }catch(e){}
            http.response = null;
            http = null;
          }
        }
      };

      if (entity["method"].toLowerCase() == "get") {
        this.httpObject.open(entity["method"], entity["url"] + paramString, entity["async"]);
      } else {
        this.httpObject.open(entity["method"], entity["url"], entity["async"]);
      }

      // SKT 전송망, Access망 프로젝트용
      if(!this.httpRequestHeaders['Content-Type']) {
          if (entity["onBody"]) {
          	if($.alopex.util.isValid(http.paramType)){
        		  if(http.paramType === 'queryString'){
        			this.httpObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        		  }else{
        			this.httpObject.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        		  }
        	  }else{
        		this.httpObject.setRequestHeader("Content-Type", "application/json; charset=UTF-8");  
        	  }
          } else {
            this.httpObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
          }
        }

      for (var key in this.httpRequestHeaders) {
        this.httpObject.setRequestHeader(key, this.httpRequestHeaders[key]);
      }

      if(entity["async"] && this.timeout) {
        this.httpObject.timeout = this.timeout;
      }

      try {
          if (entity["method"].toLowerCase() == "post") {
              if (entity["onBody"]) {
            	  
                  //SKT전송망
            	  if($.alopex.util.isValid(http.paramType)){
              		if(http.paramType === "queryString"){
      	        		if(typeof entity["content"] === 'string') {
      	        			entity["content"] = JSON.parse(entity["content"]);
      	        		}
      	        		
      	        		// $.param 으로 json To query string 만들 때, 모든 key, value를 인코딩(GET 방식에서 % + & 등을 escape해야 하는 문제 때문)
      	        		entity["content"] = $.param(entity["content"]);
      	        		if($.alopex.util.isValid(entity["gridData"])){
      	        			entity["content"] += "&" + encodeURIComponent('gridData');
      	        			entity["content"] += "=";
      	        			entity["content"] += encodeURIComponent(JSON.stringify(entity["gridData"]));
      	        		}
              		}
            	  }
            	  
            	  
                this.httpObject.send(entity["content"]);
              } else {
                this.httpObject.send(paramString);
              }
            } else {
              this.httpObject.send();
            }
      } catch (e) {
        var result = {};
        result.error = e.code;
        result.errorMessage = e.message;

        errorCallback(result, this.httpObject);

        return;
      } finally{
    	  delete this.httpObject;
    	  this.httpObject = null;
      }

      this.httpRequestHeaders = {};
      //this.httpRequestKeys = [];
      //this.httpRequestValues = [];
    }
  };

  _legacyHttp.prototype.setRequestHeader = function(header, value) {
    if (_httpIsValid(header) && _httpIsValid(value)) {
      this.httpRequestHeaders[header] = value;
      //this.httpRequestKeys.push(header);
      //this.httpRequestValues.push(value);
    }
  };

  _legacyHttp.prototype.setTimeout = function(timeout) {
    this.timeout = timeout;
  };

  _legacyHttp.prototype.upload = function(entity, successCallback, errorCallback,
      progressCallback, cancelCallback) {
  };

  window._legacyHttp = _legacyHttp;
}(jQuery);
!function($) {
	$.extend($.alopex, {
		
		alopex_blockTargetParent: null,
		/**
		 * 화면에 모달뷰 띄우는 함수.
		 */
		block: function(targetParent) {
			var $html, $body;
			
			var targetParentScrollTop = 0;
			
			if ($.alopex.util.isValid(targetParent.document)) {
				$.alopex.alopex_blockTargetParent = targetParent.document;
				$html = $(targetParent.document).find('html');
				$body = $(targetParent.document).find('body');
				
				/**
				 * [Hong-HyunMin 2016.01.28] window modal기능을 사용시에 block위치가 이상한 경우에 대한 처리.
				 * document.body.scrollTop 은 스크롤시에 페이지의 상단의 위치값을 반환하거나 부여한다.
				 * 하지만 HTML 코드 상단에 DTD 가 선언되어 있다면 scrollTop이 재구실을 못해버리는 문제가 발생된다.
				 * document.documentElement.scrollTop을 사용하려 하나, documentElement는 크롬에서 문제 발생으로 인한 분기 처리.
				 */
				var ua = window.navigator.userAgent;
				if(ua.indexOf('Chrome') != -1) {
					targetParentScrollTop = $body[0].scrollTop;
				}
				else {
					targetParentScrollTop = targetParent.document.documentElement.scrollTop;
				}
			} else {
				$html = $('html');
				$body = $('body');
			}

			var $modalview = $('<div></div>').attr('data-alopexmodal', 'true').appendTo($body);
			
			$modalview.css({
				"position": "absolute",
				"top": targetParentScrollTop,
				"left": "0",
//				"width": $(targetParent).width() + "px",
//				"height": $(targetParent).height() + "px",
				"width": "100%",
				"height": "100%",
				"z-index": "9999",
				"opacity": "0.7",
				"background-color": "#111"
			});

			$.alopex.__htmlHeight = $html[0].style.height;
			$.alopex.__htmlWidth = $html[0].style.width;
			$.alopex.__bodyHeight = $body[0].style.height;
			$.alopex.__bodyWidth = $body[0].style.width;
			$html.css({
				height: '100%',
				width: '100%'
			});
			$body.css({
				height: '100%',
				width: '100%',
				overflow: 'hidden'
			});

			$modalview.on('mousedown.alopexbloack mouseup.alopexblock scroll.alopexblock', function(e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		},

		/**
		 * 화면에 있는 모달뷰 제거하는 함수.
		 */
		unblock: function() {
			var $html, $body;
			if ($.alopex.util.isValid($.alopex.alopex_blockTargetParent)) {
				$html = $($.alopex.alopex_blockTargetParent).find('html');
				$body = $($.alopex.alopex_blockTargetParent).find('body');
			} else {
				$html = $('html');
				$body = $('body');
			}

			$html[0].style.height = ($.alopex.__htmlHeight) ? $.alopex.__htmlHeight : '';
			$html[0].style.width = ($.alopex.__htmlWidth) ? $.alopex.__htmlWidth : '';
			$body[0].style.height = ($.alopex.__bodyHeight) ? $.alopex.__bodyHeight : '';
			$body[0].style.width = ($.alopex.__bodyWidth) ? $.alopex.__bodyWidth : '';
			$body.css({overflow: ''});
			$($.alopex.alopex_blockTargetParent).find('[data-alopexmodal]').remove();
		}
	});
}(jQuery);


/*!
* Copyright (c) 2014 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex Javascript Framework
* alopex-page
*
*/
!function($) {
	
	var popupparam, navparam, queryparam, results;
	var re = /([^&=]+)=?([^&]*)/g;
	var decode = function(str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	};
	function decodeQuery(query) {
		var params = {};
		while (e = re.exec(query)) {
			var k = decode(e[1]);
			var v = decode(e[2]);
			if (params[k] !== undefined) {
				if (!$.isArray(params[k])) {
					params[k] = [params[k]];
				}
				params[k].push(v);
			} else {
				params[k] = v;
			}
		}
		return params;
	}
	
//	function init() {
//		$(document).on('screenback', function() {
//			if($a.page.screenback) {
//				var args = $.makeArray(arguments);
//				$a.page.screenback.apply(this, args);
//			}
//		});
//		$(document).on('pause', function() {
//			if($a.page.screenpause) {
//				var args = $.makeArray(arguments);
//				$a.page.screenpause.apply(this, args);
//			}
//		});
//		$(document).on('resume', function() {
//			if($a.page.screenresume) {
//				var args = $.makeArray(arguments);
//				$a.page.screenresume.apply(this, args);
//			}
//		});
//	}
	$.extend($.alopex, {
		
		/**
		 * 화면 이동과 관련된 설정.
		 * $a.navigate.setup() 함수로 변경가능.
		 */
		_navigationCofig: {
			url: function(url, options) {
				return url;
			},
			
			querystring: false
		}
	});
	

	$.extend($.alopex, {
		//$.alopex.page(Object pageObject)
		//$.alopex.page(Function initFunc)
		//$.alopex.page(Function initFunc, Object pageObject)
		parameters: (function() {
			var session, query;
			if (window.alopexController) { // alopexController 사용
				if(window.browser === 'mobile') {
					$.alopex._navigationCofig.querystring = true;
				}
				
				if($.alopex._navigationCofig.querystring) {
					$(document).on('alopexready', function() {
						$.alopex.parameters = navigation.parameters;
					});
					return ;
						
				} else { // web + no querystring
					// session 에서 뺴기
				}
			} else {
				if($.alopex._navigationCofig.querystring) {
					query = String(window.location.search);
					if (query.substr(0, 1) == '?') {
						query = query.substr(1);
					}
					return decodeQuery(query);
				} else {
					// session 에서 뺴기 
				}
			}
			try{
				if($a.session('frome_navigate') === "true") {
					$a.session('alopex_parameters' + window.location.href, $a.session('alopex_parameters'));
				}

				$a.session('alopex_parameters', '');
				$a.session('frome_navigate', false);
				session = JSON.parse($a.session('alopex_parameters' + window.location.href));

				//navigate할때 parameter를 지우지 않는다.
				//$a.session('alopex_parameters', '');
			} catch(e){}
			
			return session;
		})(),
		
		results: (function() {
			var results;
			if (window.alopexController) { // alopexController 사용
				$(document).on('alopexready', function() {
					$.alopex.results = navigation.results;
				});
			} else {
				try{
					results = JSON.parse($a.session('alopex_results'));
					$a.session('alopex_results', '');
				} catch(e) {}
				return results;
			}
		})(),
		
		pageId: (function() {
			if (window.alopexController) {
				$(document).on('alopexready', function(){
					$.alopex.pageId = navigation.pageId;
				});
			} else {
				return window.location.pathname;
			}
		})(),
		
		/**
		 * 기
		 * 1. 모바일, Alopex UI 사용 시의 로직 초기점 제공
		 * 2. 소스 컨벤션.
		 * 3. navigate 함수 parameter 전달.
		 * 
		 */
		page: function() {
			var module = {}; /* $a.page 함수의 리턴 모듈. */
			var args = $.makeArray(arguments); /* 현재 표준은 $a.page 함수는 파라미터 한개만 허용. */
			var inits = [];
			
			$.each(args, function(idx, arg) {
				if ($.isFunction(arg)) {
					
					// iframe에서 다중 popup의 경우, $a.popup()와 $a.page() 간 시점 차 발생
					// iframe 내부 content 부분에서 window.name이 iframe popup 유니크 ID 이다
					// 이것을 가지고 맞는 데이터를 찾아서 page this.init 의 param에 넣어주자
//					if($(parent.document).find("iframe").length > 0){
//						console.log(window.name);
//						var popup_data = $(parent.document).find("#" + window.name).prop('alopexPopupSetting').data;
//						if(popup_data !== $a.popupdata) $a.popupdata = JSON.parse(popup_data);
//					}
					
					$.extend(module, arg.call(module, $a.pageId, $.extend(true, $a.parameters, $a.results, $a.popupdata)));
					if(typeof module.init == 'function') {
						inits.push(module.init);
					} 
				} else if ($.isPlainObject(arg)) { /* old method : the parameter of $a.page is literal object */
					$.alopex.page = $.extend($.alopex.page, arg);
					if (arg.init) {
						inits.push(arg.init);
					}
				}
			});
			
			$.each(inits, function(idx, arg) {
				
				function runArg() {
					arg.call(module, $a.pageId, $.extend(true, $a.parameters, $a.results, $a.popupdata, $a.dialogdata));
					$a.dialogdata = null;
				}
				
				if(isAlopexReady) { // Alopex Runtime을 사용하고, 해당 페이지가 나중에 로드된 케이스.
					if($.alopex.loading) { // Alopex에서 로드 시킨 경우.
						$.alopex.loading = false;
						$(document).one('alopexuiready', function() {
							$(runArg);
						});
					} else { // Alopex에서 로드된 경우 외에는 바로 실행.
						$(runArg);
					}
					
				} else {
					if (window._useAlopexController) {
						$(document).one('alopexready', function() {
							$(runArg);
						});
					} else {
						$(document).ready(function(){
							$(runArg);
						});
					}
					
				}
			});
			return module;
		},
		
		/**
		 * $a.navigate 함수 호출 시 기준되는 위치는 /html/폴더 하위입니다.
		 * $a.navigate('DS/DS0001') or $a.navigate('DS/DS0001.html')
		 */
		navigate: function(url, param) {
			if (typeof url !== "string")
				return;
			
			var targetUrl = $.alopex._navigationCofig.url(url, param);
			var options = {pageId: targetUrl};
			if (window.alopexController) { // alopexController 사용
				if(window.browser === 'mobile') {
					$.alopex._navigationCofig.querystring = true;
				}
				if($.alopex._navigationCofig.querystring) {
					options.parameters = param;	
				} else {
					$.alopex.session('alopex_parameters', JSON.stringify(param));
					$.alopex.session('frome_navigate', true);
				}
				navigation.backToOrNavigate(options);
			} else {
				if($.alopex._navigationCofig.querystring) {
					if(targetUrl.indexOf('?') == -1) {
						targetUrl += ('?' + $.param(param)); 
					} else {
 						targetUrl += ('&' + $.param(param));
					}
				} else {
					$.alopex.session('alopex_parameters', JSON.stringify(param));
					$.alopex.session('frome_navigate', true);
				}
				window.location.href = targetUrl;
			}
		},
		
		back: function(results) {
			if (window.alopexController) {
				navigation.back(results);
			} else {
				$.alopex.session('alopex_results', JSON.stringify(results));
				history.back();
			}
		},
		
		backTo: function(id, params) {
			navigation.backTo({
				"pageId": _url,
				"parameters" : params
			});
		}, 
		
		backToOrNavigate: function(id, params) {
			navigation.backToOrNavigate({
				"pageId": _url,
				"parameters" : params
			});
		},
		
		exit: function() {
			navigation.exit();
		}, 
		
		/**
		 * Used with Alopex Runtime
		 */
		goHome: function() {
			navigation.goHome();
		}
	});
	
	/**
	 * $a.navigate.setup({
	 * 	url: function(url, param) {
	 * 		return '실제 URL';
	 * 	},
	 * 	querystring: true
	 * });
	 */
	$.extend($.alopex.navigate, {
		setup: function(config) {
			$.extend($.alopex._navigationCofig, config); 
		}
	});
}(jQuery);
!function($) {
	
	// popup API를 사용해 팝업을 띄울 경우, window.name으로 아이디 전달.
	var _id = window.name;
	var _config = null;
	var _data = null;

	/**
	 * window.open으로 팝업을 연 경우, 호출됩니다.
	 * 기능 1. 부모 창의 모달뷰 없애
	 * 기능 2. 콜백함수 호출.
	 */
	function closeOpenerBlocker() {
		_config = window.opener.$.alopex.popup.config[_id]; // 설정 다시 받아옴.
		if (_config) {
			if (_config.modal) {
				window.opener.$a.unblock();
			}
			if(_config.callback) {
				try{ // IE의 경우 window.opener를 통해 접근할 경우, 제대로 된 타입이 전달 안됨.. 우선 실행.
					_config.callback.call(window.opener, $.alopex.popup.result);	
				} catch(e){}
			}
		}
		
		var index = $.inArray(_id, window.opener.$.alopex.popup.names);
		if (index !== -1) {
			window.opener.$.alopex.popup.names.splice(index, 1);
		}
	}
	
	/**
	 * 자신이 종료될 경우, 자신 연 팝업들도 같이 종료. 
	 */
	function closeChildren(childrenPopup) {
		var $childrenPopup;
		if ($.alopex.util.isValid(childrenPopup)) {
			$childrenPopup = childrenPopup;
		} else if ($.alopex.util.isValid($.alopex.popup)){
			$childrenPopup = $.alopex.popup.children;
		}
		
		if ($childrenPopup && $childrenPopup.length > 0) {
			for (var i = 0; i < $childrenPopup.length; i++) {
				if ($childrenPopup[i] && $childrenPopup[i].close) {
					$childrenPopup[i].close();
				}
			}
			$childrenPopup = [];
		}
	}

	/**
	 * 팝업 id를 생성하여 리턴
	 */
	function _GenerateId(popid) {
		var length = $.alopex.popup.names.length;
		var suffix = $.alopex.util.isValid(popid) ? popid : parseInt(Math.random()*10E3);
		var id = 'Alopex_Popup_' + suffix;
		$.alopex.popup.names.push(id);
		return id;
	}

	/**
	 * dialog 띄우는 함수. setting에 따라 다르게 세팅.
	 */
	function _DialogOpen(setting, base) {
		var dialog = document.getElementById(setting.id);
		var $dialog = $(dialog);
		if ($dialog.length == 0) {
			var markup = '<div id="' + setting.id + '" data-type="dialog"';
			if (setting.modalclose) {
				markup += 'data-modalclose="true" ';
			}
			if (setting.toggle) {
				markup += 'data-toggle="true" ';
			}
			markup += '>';
			if (setting.iframe) {
				markup += '<iframe data-type="panel" data-fill="vertical" style="width:100%;overflow:auto;border:0"></iframe>';
			} else if(setting.scroll){ //scroll을 위한 div
				markup += '<div></div>'
			}
			markup += '</div>';
			if(base) {
				$dialog = $(markup).appendTo(base).dialog(); // 다이얼로그 생성.
			} else {
				$dialog = $(markup).appendTo('body').dialog(); // 다이얼로그 생성.
			}
			
			dialog = document.getElementById(setting.id);
		}

		if (setting.center === true) {
			setting.top = ($(window).height() - setting.height) / 2;
			setting.left = ($(window).width() - setting.width) / 2;
		} else {
			//setting에 left, top가 없는 경우 값을 0으로 처리.
			if(false === $.alopex.util.isValid(setting.left)){
				setting.left = 0;
			}
			if(false === $.alopex.util.isValid(setting.top)){
				setting.top = 0;
			}
		}

		// 콜백 옵션이 있을 경우, 오픈 시 close 이벤트 핸들러로 등록.
		// 이부분이 dialog.js 내에서 처리되고 있었으나, 팝업의 dependent한 코드는 이쪽에서 처리.
		// 팝업으로 오픈한 dialog는 DOM에서 제거.
		$dialog.one('close', function(e) {
			var dialog = e.currentTarget;
			var $dialog = $(dialog);
			var index = $.inArray(dialog.id, $.alopex.popup.names);
			if (dialog && index !== -1) {
				$.alopex.popup.names.splice(index, 1);
				if(dialog.blocker) {
					$(dialog.blocker).remove();
				}
				
				$dialog.remove();

				if(setting.callback) {
					setting.callback($.alopex.popup.result);
				}
				$.alopex.popup.result = null;
			}
		});

		$dialog.prop('alopexPopupSetting', setting);
		if (setting.iframe) {
			// var url = setting.url + '?'; // querystring으로 parameter전달.
			// if(setting.data) {
			// url += 'parameters=' + encodeURIComponent(JSON.stringify((setting.data)));
			// }

			if(!setting.preLoading) {
				$dialog.open(setting);
			}

			$dialog.find('iframe').on('load', function() {
				// setting.modal = false;
				if(setting.preLoading) {
					$dialog.open(setting);
				}
				
				var $iframe = $dialog.find('iframe');
				$iframe.refresh();
				
				// parent > child access 의 경우, cross-domain 으로 막힐 때 예외처리
				if(isAlopexIframeChild($iframe[0].contentWindow)) $iframe[0].contentWindow.alopexready = true;
//				$dialog.find('iframe')[0].contentWindow.alopexready = true;
			});
			
			var $iframe = $dialog.find('iframe');
			// parent > child access 의 경우, cross-domain 으로 막힐 때 예외처리
			if(isAlopexIframeChild($iframe[0].contentWindow)) $iframe[0].contentWindow.name = setting.id;
//			$dialog.find('iframe')[0].contentWindow.name = setting.id;
			
			setTimeout(function() { 
				/**************** 
				 * windowpopup 콜백에서 다이얼로그 팝업을 띄울 경우 setTimeout 없으면 load 이벤트가 발생하지 않음.
				 * resource 요청을 window 팝업 쪽에서 수행하는 것으로 판단. 
				 **/
				$dialog.find('iframe').attr('src', setting.url);
			}, 0);
		} else {
			// dialog without iframe has the same context. undo stringify.
			// JSON.parse(setting.data)에서 setting.data가 undefined일 경우 JSON.parse 에러남.
			if(setting.data){
				$a.dialogdata = JSON.parse(setting.data);
			}else{
				$a.dialogdata = null;
			}
			
			$.alopex.loading = true;
			
			(setting.scroll ? $dialog.find('div') : $dialog).load(setting.url, function() {//scroll을 사용한 경우에는 child div에 컨텐츠 로드
				$dialog.open(setting);
				$.alopex.convert(dialog);
				$(document).trigger('alopexuiready');
			});
		}
		return dialog;
	}

	function _WindowOpen(setting, base) {
		var param = '';
		if (setting.width) {
			param += 'width=' + setting.width + ',';
		}
		if (setting.height) {
			param += 'height=' + setting.height + ',';
		}
		if (setting.center === true) {
			var topPositon = Math.max((window.screen.height - parseInt(setting.height)) / 2 - 50, 0) - $('body')[0].scrollTop;
			param += 'top=' + topPositon + ',';
			param += 'left=' + (window.screen.width - parseInt(setting.width)) / 2 + ',';
		} else {
			param += 'top=0,';
			param += 'left=0,';
		}
		if (setting.scroll === true) {
			param += 'scrollbars=yes,';
		}
		if (setting.other) {
			param += setting.other;
		}
		if (setting.modal === true) {
			// parent 창에 blocking이 되도록 수정.
			if(checkAlopexWindowParent()) {
				$a.block(window.parent);
			}
		}
		if (!$.alopex.util.isValid(base)) {
			base = window;
		}
		/**
		 * 윈도우 띄우는데 타이밍 이슈 해결.
		 * 이 코드 없으면 IE9에서 $a.popup(다이얼로그) 콜백에서 $a.popup(윈도우)를 띄울 때 새로 뜬 윈도우가 뒤로 이동됨.
		 */
		setTimeout(function() {
			var popup = base.open(setting.url, setting.id, param);
			$.alopex.popup.children.push(popup);
		}, 0);
	}
	
	
	/********************************************
	 * 열린 popup context에서 필요한 코드.
	 ********************************************/
	// window popup PopupData setting
	try{
		if (isAlopexWindowPopup()) {
			// 팝업 종료 시 처리 : 팝업 창 닫힐 때 메인화면 modal unblock 함수 실행.
			$(window).on('beforeunload', closeOpenerBlocker);
			if(window.opener.$.alopex && window.opener.$.alopex.popup.config && window.opener.$.alopex.popup.config[_id]) {
				_config = window.opener.$.alopex.popup.config[_id];
				if ($.alopex.util.isValid(_config) && $.alopex.util.isValid(_config.data)) {
					_data = JSON.parse(_config.data); // windowpopup data 전달.
				}
			}
		} else if(checkAlopexWindowParent()) {
			// dialog popup PopupData setting
			$(window.parent.document).find('[data-type="dialog"]').each(function(i, elem) {
				_config = $(elem).prop('alopexPopupSetting');
				if ($.alopex.util.isValid(_config) && $.alopex.util.isValid(_config.data) && elem.id === _config.id) {
					_data = JSON.parse(_config.data);
				}
			});
		}
	}catch(e){}
	
	/********************************************/
	
	
	// 메인화면이 닫힐 경우, 자신이 띄운 팝업들 닫기.
	// TODO 메인화면이 닫혀도 window 하위창들이 닫히지 않음.
//	$(window).on('beforeunload', closeChildren(null));

	$.extend($.alopex, {
		popupdata : _data,
		/**
		 * 윈도우 팝업, 다이얼로그 팝업(with/without iframe) 
		 * 
		 * @args option {
		 * 	scroll: '',
		 *  modal: '',
		 *  heigth: '',
		 *  center: ''
		 *  url: '',
		 *  callback: ''
		 *  iframe: '',
		 * }
		 */
		popup : function(option, base) {
			// options
			// scroll, modal, width, height, center, scroll, modal, url, callback,
			// popup id 지정 : 이 아이디를 가지고 부모창에서 인자를 가져감.
			// default setting.
			
			// 사용자가 임의 입력한 name이 있고, name을 이용해 생성한 id를 가진 팝업이 있다면 팝업 생성을 막는다.
			// 팝업 생성하는 버튼을 빠르게 2번 이상 클릭하면 같은 팝업이 2개 이상 생성되는 이슈 방지용 
			if($.alopex.util.isValid(option.popid)){
				if($.inArray("Alopex_Popup_" + option.popid, $.alopex.popup.names) !== -1) return;
//				if($("div").filter("[id=Alopex_Popup_" + option.popid + "]").length > 0) return;
			}
					
			var setting = {
				id : _GenerateId(option.popid),
				title : (option.title || option.url)
			};
			$.extend(setting, $.alopex.popup.defaultOptions, option);
			var _urlFixer = ($.alopex.popup.defaultOptions.url) ? $.alopex.popup.defaultOptions.url : $.alopex._navigationCofig.url;
			setting.url = _urlFixer(setting.url, setting.data); // $a.navigate.setup으로 정의된 url정보를 같이 사용.

			// IE9 에서 array JSON 데이터 전송시 이상현상 발생하므로 data는 stringify 해서 넘긴다.
			if (setting.data) {
				setting.data = JSON.stringify(setting.data);
			}
			$.alopex.popup.config[setting.id] = setting;
			if (setting.windowpopup) { // window open으로 띄우기
				_WindowOpen(setting, base);
			} else {
				return _DialogOpen(setting, base);
			}
		},

		/**
		 * 현재 팝업창을 종료하는 함수. (popup 윈도우 내 스크립트 에서 실행)
		 * window popup과 iframe이 감싸줘 있는 경우, open 함수 실행 시점과 close 함수 호출 시점의 context가 달라진다.
		 * 
		 * @param data
		 *            popup창을 띄운 윈도우의 콜백함수의 인자로 전달됩니다.
		 */
		close: function(data) { 	
			var config;
			// opener가 있을때 window 팝업창 닫기
			if (isAlopexWindowPopup() && window.opener.$.alopex.popup.children.length != 0) {

				// window popup & iframe내에서
				config = window.opener.$.alopex.popup.config[_id]; // callback 함수 찾기 위해.
//				if (config && $.isFunction(config.callback)) {
//					config.callback(data); // TODO 이 부분도 x 버튼으로 닫힐 때 호출되도록 처리. 
//				}
				$.alopex.popup.result = data; //TODO
				//closeChildren(window.opener.$.alopex.popup.children);
				window.close();
			} else {
				if(checkAlopexWindowParent()){
					// 다이얼로그를 찾아서 닫기
					if(window !== window.parent) {
						$ = window.parent.$; // close 할때도 부모에 붙어잇는 jquery를 참조하여야지 dialog 로직이 정상적으로 동작.
						window.parent.$.alopex.popup.result = data;
					} else {
						$.alopex.popup.result = data;
					}
					
					var $activeDialogEl = null;
					
					$.each($(window.parent.document).find('[id*="Alopex_Popup_"]'), function(i, ele) {
						ele = $(ele);
						if($activeDialogEl == null) {
							$activeDialogEl = ele;
						} else{
							if(ele.css('z-index') > $activeDialogEl.css('z-index')) {
								$activeDialogEl = ele;
							}
						}
					});
					
					config = $activeDialogEl.prop('alopexPopupSetting');
					if ($.alopex.util.isValid(config)) {
						
						if(config.beforeCloseHandler && typeof config.beforeCloseHandler === 'function'){
							config.beforeCloseHandler($activeDialogEl[0]);
						}
						
						// dialoglist에서 close 하는 다이얼로그 제거
						if ($.alopex.util.isValid(window.parent.$.alopex.widget.dialog.dialoglist)) {
							var arr = window.parent.$.alopex.widget.dialog.dialoglist;
							for (var i = 0; i < window.parent.$.alopex.widget.dialog.dialoglist.length; i++) {
								if (arr[i] == $activeDialogEl[0]) {
									arr.splice(i, 1);
								}
							}
						}
						
						// jquery-1.11.2.js, jquery-1.11.3.js의 dispatch 부분 if ( ret !== undefined ) {
						// 'undefined'이(가) 정의되지 않았습니다  IE 에러 메시지 발생
						// close 이벤트에 딜레이 주고, element remove 타이밍을 늦춘다
						setTimeout(function(){
							$activeDialogEl.close();
						},0);
						
						// dialog 닫힐때 scrollTop 위치 세팅
						var scrollTop = $activeDialogEl[0].scrollTopValue;
						$(window.parent.document.body).css({
							'top' : '',
							'position' : '',
							'width' : ''
						});
						if (window.browser === 'ie' || 
							$.alopex.util.isValid(window.browser) && window.browser.indexOf('Microsoft Internet Explorer') !== -1){
							$(window.parent.document.documentElement).scrollTop(scrollTop);
						} else {
							$(window.parent.document.body).scrollTop(scrollTop);
						}

						// HESS project Bug Fix. (IE9, IE10에서 iframe 팝업창에서 인풋 텍스트 포커스 간 이후 부모창에 커서 안가는 문제때문에 주석 처리.)
						// $activeDialogEl.remove();
					}
				}
			}
		}
	});

	$.extend($.alopex.popup, {
		setup : function(option) {
			$.extend($.alopex.popup.defaultOptions, option);
		},
		
		/* 팝업 아이디 저장 */
		names : [],
		/* 윈도우 팝업으로 띄울 경우, 자신이 띄운 popup을 저장. 자신이 닫힐 경우, 자신 오픈한 팝업은 같이 종료. */
		children : [],
		/* 팝업 정보 저장소. */
		config: {},
		
		result: null,
		
		/* 팝업 관련된 */
		defaultOptions : {
			/* 팝업 너비 */
			width : parseInt(window.innerWidth * 0.9),
			/* 팝업 높이 */
			height : parseInt(window.innerHeight * 0.9),
			/* 팝업 타입 */
			type : 'blank',
			/* 팝업 가운데 위치 */
			center : true,
			/* 팝업 스크롤 유무 */
			scroll : true,
			/* 팝업 모달뷰 유무 */
			modal : true,
			/* 팝업 창이 접히는 토글 버튼 존재 유무 */
			modalclose : false,
			/* iframe 유무 */
			iframe : true,
			/* 윈도우 팝업으로 띄울 지 여부 */
			windowpopup : false,
			/* 팝업 창이 접히는 토글 버튼 존재 유무 */
			toggle : false,
			/* iframe사용 시 화면 로딩 후 팝업 오픈 or 팝업 오픈 후 화면 로딩*/
			preLoading :  true,
			/* dialog close 전에 수행될 로직*/
			beforeCloseHandler : null
		}
	});
}(jQuery);


/*!
* Copyright (c) 2014 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex Javascript Framework
* alopex-service
*
*/
!function($) {
	
	function getGridKey(grid) {
		var $target = grid.jquery ? grid : $(grid);
		var key;
		if($target.attr('data-bind')) {
			key = $.trim($target.attr('data-bind').replace('grid', '').replace(':', ''));
		} else {
			key = $target.attr('id');
		}
		return key;
	}

	var requestCount = 0;
	function _showProgress(callback) {
		if (requestCount === 0) {
			callback();
		}
		requestCount++;
	}

	/**
	 * @args callback callback이 존재하지 않는 경우, 콜백 호출은 안 하고, count만 처리.
	 */
	function _dismissProgress(callback) {
		requestCount--;
		if (requestCount === 0 && callback) {
			callback();
		}
	}

	var setupConfig = {
		// platform: 'default',
		async : true,
		method: 'POST',
		platform: 'default',
		data : {},
		requestHeaders : {},
		responseHeaders : {},
		showProgress : function() {
			var progress_option = {
				// "message" : "Loading",
				"cancelable" : false,
				"color" : "grey"
			};
			window.platformUIComponent ? platformUIComponent.showProgressDialog(progress_option) : null;
		},
		dismissProgress : function() {
			window.platformUIComponent ? platformUIComponent.dismissProgressDialog() : null;
		}
	}; // setup함수로 등록된 공통 및 플랫폼 설정 정보를 가지고 있음.
	/**
	 * Service API
	 */
	$.alopex.request = function(id, option) {

		// param 은 개발자 코드단에서만 제공.
		// 공통 및 플랫폼에서 변경하고 싶으면, before 활용.
		if(!option) { option = {};}
		var request = $.extend(true, {id : id}, setupConfig, option);
		request.data = request.interface; 
		if($.alopex.util.isValid(request.platform)) { // platform data setup
			request.data = $.extend(true, request.data, request[request.platform].interface); 
		}
	
		var ServiceHttp;
		if(typeof Http !== "function" && typeof _legacyHttp === "function") {
			ServiceHttp = _legacyHttp;
		} else {
			ServiceHttp = Http;
		}
		var http = new ServiceHttp();
		  
		// data 추출.
		// data key는 service함수 option에만 정의.
		if(option.data) {
						
			var selectors = $.makeArray(option.data);
			var formRef;
			var gridRef;
			// platform 이 설정되어 있을땐 platform 데이터 처리를 따른다.
			if ($.alopex.util.isValid(request.platform)) {
				formRef = request[request.platform].object;
				gridRef = request[request.platform].grid;
			} else {
				// platform 이 없을땐 global 설정을 따른다.
				formRef = request.object;
				gridRef = request.grid;
			}

			for(var i=0; i<selectors.length; i++) {
				if(typeof selectors[i] == 'function') {
					$.extend(true, request.data, selectors[i].call(request, option));
				} else if(typeof selectors[i] == 'object') {
					$.extend(true, request.data, option.data);
				} else {
					var $el = $(selectors[i]);
					if($el.length <= 0) { continue; }
					var el = $el[0];
					if($el.attr('data-alopexgrid')) {
						var griddata = $.alopex.request.getGridData(el);
						if(griddata.key && griddata.list) {
							var reference = gridRef(griddata, request.data);
							reference.setList(griddata.list);
							
							if($.alopex.util.isValid(griddata.paging)) {
								reference.setCurrentPage(griddata.paging.currentPage);
								reference.setperPage(griddata.list.currentLength);
								reference.setcurrentLength(griddata.paging.perPage);
								reference.settotalLength(griddata.paging.totalLength);
							}
						}
					} else {
						var reference = formRef(el, request.data);
						$.extend(true, reference, $(el).getData());
					}
				}
			}
		}
		
		

		// BEFORE!!!!!!!!!!!!!!!!!!!!!!!!!
		// 순서 : 공통 + 사용자 -> 플랫폼. before 처리.
		if (typeof setupConfig.before == 'function') { // 공통 before
			setupConfig.before.call(request, id, option);
		}
		if (setupConfig.before !== request.before && typeof request.before == 'function') { // 사용자 before
			request.before.call(request, id, option);
		}
		// 플랫폼 before 호출 (어댑터 역할만 수행)
		if (request.platform && request[request.platform] && typeof request[request.platform].before == 'function') {
			request[request.platform].before.call(request, id, option);
		}
		// parameter들이 변환된 이후에 처리.
		if (request.showProgress) {
			_showProgress(request.showProgress);
		}
		
		if(option.array) {
			request.data = option.array;
		}

		if ($.isPlainObject(request.requestHeaders)) {
			$.each(request.requestHeaders, function(header, value) {
				http.setRequestHeader(header, value);
			});
		}

		var entity = {};
		
		// SKT 전송망, Access망 프로젝트용
		// request : querystring / response : json
		// gridData는 querystring으로 만들때 문제가 있어서 일반 스트링으로 보냄
		if($.alopex.util.isValid(request.paramType)){ entity["paramType"] = request.paramType; }
		if($.alopex.util.isValid(request.paramType)){ entity["gridData"] = request.gridData; }
		
		entity["url"] = $.isFunction(request.url) ? request.url.call(request, id, option):request.url;
		entity["method"] = $.isFunction(request.method) ? request.method.call(request, id, option) : request.method;
		entity["onBody"] = ((String(request.method).toUpperCase() === "POST") ? true : false);
		entity["async"] = request.async;
		
		// parameter들이 변환된 이후에 처리.
		entity["content"] = (typeof request.data == 'object') ? JSON.stringify(request.data) : String(request.data);
		if (String(request.method).toUpperCase() === "GET" && $.isPlainObject(request.data) && !$.isEmptyObject(request.data)) {
			entity["url"] += "?" + $.param(request.data);
		}
		if (entity["async"]) {
			http.setTimeout(request.timeout || 30000);
		}
		if (window.deviceJSNI) {
			http.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		}
		http.request(entity, 
		    (function(option, req){ // 이 부분은 멀티 서비스 호출 시 option 값 보존을 위해 필요.
					return function(res) {
//          req.responseText = res.response;//original data. parsing은 platform before processor의 처리내용.
            req.response = res.response;
            req.responseHeaders = res.responseHeader;
//            try{ 
//              req.response = JSON.parse(req.responseText); // response : json object 
//            }catch(e) {
//              req.isSuccess = false;
//              res.errorCode = 'E01';
//              res.errorText = '유효하지 않은 JSON파일입니다.';
//            }
						
						// platform after 호출. (변환)
						if(req.platform && req[req.platform] && typeof req[req.platform].after == 'function') {
							req[req.platform].after.call(req, req.response);
						}
						if(req.isSuccess !== false && typeof setupConfig.after == 'function') {
							setupConfig.after.call(req, req.response);
						}
						if(req.isSuccess !== false && setupConfig.after !== req.after && typeof req.after == 'function') {
							req.after.call(req, req.response);
						}
						
						if(req.showProgress) {// showPrgoress가 호출된 경우에만, dismiss 처리.
							var callback = req.dismissProgress;
							_dismissProgress(callback);
						}
						
						if (req.isSuccess === false) {	// fail
							if(req.platform && req[req.platform] && typeof req[req.platform].fail == 'function') {
								req[req.platform].fail.call(req, req.response);
							}
							if(typeof setupConfig.fail == 'function') {
								setupConfig.fail.call(req, req.response);
							}
							if(setupConfig.fail !== req.fail && typeof req.fail == 'function') {
								req.fail.call(req, req.response);
							}
						} else {	// success
							function setData(req, success) {
								var selectors = $.makeArray(success);
								var formRef;
								var gridRef;
								// platform 이 설정되어 있을땐 platform 데이터 처리를 따른다.
								if($.alopex.util.isValid(request.platform)) { 
								  formRef = req[req.platform].object;
								  gridRef = req[req.platform].grid;
								} else {
								  // platform 이 없을땐 global 설정을 따른다.
								  formRef = req.object;
								  gridRef = req.grid;
								}
								
								for(var i=0; i<selectors.length; i++) {
									if(typeof selectors[i] == 'function') {
										selectors[i].call(req, req.response);
									} else {
										var $el = $(selectors[i]);
										if($el.length <= 0) {continue;}
										var el = $el[0];
										if($el.attr('data-alopexgrid')) {
											var reference = gridRef(el, req.response);
											$(el).alopexGrid('dataSet', reference.list, (reference.list && reference.list.length > 0 && $.alopex.util.isValid(reference.currentPage) && reference.currentPage > 0)? {
											  current: reference.currentPage,
												perPage: reference.perPage,
												dataLength: reference.totalLength
											} : undefined);
										} else {
											var reference = formRef(el, req.response);
											$el.setData(reference);
										}
									}
									
								}
							}
							if(req.platform && req[req.platform] && req[req.platform].success) {
								setData(req, req[req.platform].success);
							}
							if(setupConfig.success) {
							  setData(req, setupConfig.success);
							}
							if(setupConfig.success !== req.success && req.success) {
							  setData(req, req.success);
							}
						}

						delete req.response;
						delete res.response;
						delete req;
						delete res;
						
						req = null;
						res = null;
					};
				})(option, request),
				(function(option, req) {
          return function(res) {
            
            // erroCallback 호출.
//            req.originalResponse = res.responseText;
            
						req.responseHeaders = res.responseHeader;
						req.data = res.status;
						req.status = res.status;
						req.statusText = res.statusText;
						if(req.showProgress) {// showPrgoress가 호출된 경우에만, dismiss 처리.
							var callback = req.dismissProgress;
							_dismissProgress(callback);
						}
						if(req.platform && req[req.platform] && typeof req[req.platform].error == 'function') {
						  req[req.platform].error.call(req, res);
						}
						if(typeof setupConfig.error == 'function') {
						  setupConfig.error.call(req, res);
						}
						if(setupConfig.error !== req.error && typeof req.error == 'function') {
						  req.error.call(req, res);
						}

						delete req.response;
						delete res.response;
						delete req;
						delete res;
						
						req = null;
						res = null;
					};
				})(option, request));
	};

	// setup API 
	$.extend($.alopex.request, {
		setup: function() {
			if(typeof arguments[0] == 'string') { // platform setup
				if(setupConfig[arguments[0]]) {
					$.extend(true, setupConfig[arguments[0]], arguments[1]);
				} else {
					setupConfig[arguments[0]] = arguments[1];
				}
				
			} else {
				$.extend(true, setupConfig, arguments[0]);
			}
		},
		setupConfig: setupConfig,
		register: (($.alopex.services)? $.alopex.services: undefined),
		sendRegistered: (($.alopex.services)? $.alopex.services.send: undefined),
		
		prototype: {},
		
		getGridData: function (grid) {
			var key = getGridKey(grid);
			var $target = grid.jquery ? grid : $(grid);
			var list = AlopexGrid.trimData($target.alopexGrid('dataGet', {_state: {deleted: true}}, {_state: {edited: true}}, {_state: {added: true}}));
			var pageinfo = $target.alopexGrid('pageInfo');
			return {
				key: key,
				list: list,
				paging: {
					currentPage: pageinfo.current,
					currentLength: list.length,
					perPage: pageinfo.perPage,
					totalLength: pageinfo.dataLength
				}
			};
		},
		setGridData: function(grid, data) {
    }
	});
	
	/**
	 * 메타 처리하는 부분은 service core 부분으로 처리.
	 * 사용자가 커스터마이징 할 부분이 별로 없음.
	 */

	/**
	 * platform : 어댑터 정의. 
	 * 이 영역에는 설정 정보 없음.
	 * 어댑터 형태의 전환만 설정.
	 */
	$.alopex.request.setup('default', { // platform
		interface : {},
		grid : function(elem, data) {
			var key;
			if ($.alopex.util.isValid(elem.key)) {
				key = elem.key;
			} else {
				key = getGridKey(elem);
			}
			if (!$.alopex.util.isValid(data[key])) {
				data[key] = {};
			}
			return {
				list : data[key].list,
				currentPage : data[key].currentPage,
				perPage : data[key].perPage,
				currentLength : data[key].currentLength,
				totalLength : data[key].totalLength,
				
				setList: function(list) {
					data[key].list = list;
				},
				setCurrentPage: function(page) {
					data[key].currentPage = page;
				},
				setperPage: function(page) {
					data[key].perPage = page;
				},
				setcurrentLength: function(length) {
					data[key].currentLength = length;
				},
				settotalLength: function(length) {
					data[key].totalLength = length;
				},
			};
		},
		object : function(elem, data) {
			return data;
		},
		before : function(id, option) {
			this.data.serviceId = id;
		},
		after : function(res) {
		}
	});
	/**
	 * 메타 처리하는 부분은 service core 부분으로 처리. 사용자가 커스터마이징 할 부분이 별로 없음.
	 */
	/**
	 * platform : 어댑터 정의. 
	 * 이 영역에는 설정 정보 없음.
	 * 어댑터 형태의 전환만 설정.
	 */
	$.alopex.request.setup('NEXCORE.J2EE', { // platform
		interface : {
			dataSet : {
				message : {},
				fields : {},
				recordSets : {}
			},
			transaction : {},
			attributes : {}
		},
		object : function(elem, data) {
			return data.dataSet.fields;
		},
		grid : function(elem, data) {
			var key;
			if ($.alopex.util.isValid(elem.key)) {
				key = elem.key;
			} else {
				var bindkey = $(elem).attr('data-bind') ? ($.trim($(elem).attr('data-bind').replace(/\s*grid\s*:/gi, ''))) : undefined;
				key = bindkey || elem.id;
			}
			if (!$.alopex.util.isValid(data.dataSet.recordSets[key])) {
				data.dataSet.recordSets[key] = {};
			}
			return {
				list : data.dataSet.recordSets[key].nc_list,
				currentPage : data.dataSet.recordSets[key].nc_pageNo,
				perPage : data.dataSet.recordSets[key].nc_recordCountPerPage,
				currentLength : data.dataSet.recordSets[key].nc_recordCount,
				totalLength : data.dataSet.recordSets[key].nc_totalRecordCount,
				
				setList: function(list) {
					data.dataSet.recordSets[key].nc_list = list;
				},
				setCurrentPage: function(page) {
					data.dataSet.recordSets[key].nc_pageNo = page;
				},
				setperPage: function(page) {
					data.dataSet.recordSets[key].nc_recordCountPerPage = page;
				},
				setcurrentLength: function(length) {
					data.dataSet.recordSets[key].nc_recordCount = length;
				},
				settotalLength: function(length) {
					data.dataSet.recordSets[key].nc_totalRecordCount = length;
				},
			};
		},
		before : function(id, option) {
			// 헤더 추가.
			this.requestHeaders["Content-Type"] = "application/json; charset=UTF-8";
			this.data.transaction.id = id;
		},
		after : function(res) {
			// J2EE 프레임워크를 사용해도, 성공/실패 로직은 프로젝트마다 다름.
			// 공통 after 쪽에서 처리.
			//			try{
			//				if(res.dataSet.message.result == 'OK') { // 실패 체크.
			//					this.isSuccess = true;
			//				} else {
			//					this.isSuccess = false;
			//				}
			//			} catch(e) {
			//				this.isSuccess = false;
			//			} 
		}
	});
}(jQuery);
//
//!function($) {
//
//	/**
//	 * 공통 설정 부분.
//	 * before : 전처리, 
//	 * after : success 판단 여부 처리 
//	 * success : 성공 시 공통으로 처리해주는 후처리. 
//	 * url : "" or function() {return "http://localhost:9000";}
//	 * method : "GET" or "POST" or function() { return "GET";}
//	 */
//	$.alopex.request.setup({
//		platform: 'NEXCORE.J2EE',
//		//url : "http://150.28.65.2:7001/web/stand.jmd",
//		/* 조건에 따라 다른 url에 지정이 가능하다. */
//		url: function() {
//			if(true){
//				return "http://150.28.65.2:7001/web/stand.jmd";
//			}
//			return 'dddd'
//		},
//		//*/
//		method : "POST",
//		timeout: 3000,
//		before : function(id, option) { // before
//			// 전처리기.
//			$('body').progress(); //progress bar 시작
//		},
//		after : function() {
//			// response 받아서 여기서 성공판단.
//			log('after ==== ');
//			$('body').progress().remove();  //progress 종료
//		},
//		success : function() {
//			
//		},
//		fail: function(res) {
//			$('body').progress().remove();  //progress 종료
//			log('errorcode = ', res);
//			alert( ' FAIL! ' ); 
//		},
//		error  : function() {
//			$('body').progress().remove();  //progress 종료
//			log('errorcode = ' + this.status + ' message = ' + this.statusText);
//			alert( ' Error! ' ); 
//			
//		}
//	});
//}(jQuery);

/*!
* Copyright (c) 2014 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex Javascript Framework
* alopex-service
*
*/
!function($) {
	
	function extendProperty(to, from) {
		$.each(from, function(key, value) {
			if (!$.isFunction(value) && from.hasOwnProperty(key)) {
				to[key] = $.isPlainObject(value) ? $.extend(true, {}, value) : value;
			}
		});
	}
	var rcallbackKey = /^(?:before|after|success|fail|error)/i;
	var __id = (Math.random() * 100) | 0;
	function randstr() {
		return "alopexservice" + (__id++);
	}
	function populatePrototype() {
		$.each($.alopex.service, function(prop, val) {
			//TODO fix logic
			if ($.alopex.service.hasOwnProperty(prop) && $.isFunction(val)) {
				$.alopex.service[prop] = $.alopex.service.prototype[prop] = val;
				//$.alopex.service.plugin(prop, val);
			}
		});
	}
	function processorKeyword(value) {
		return value === true || value === "pre" || value === "meta" || value === "post";
	}
	function doChaining(context, chain, args) {
		if (!$.isArray(chain))
			return;
		var metaProcessor = [];
		var preProcessor = [];
		var postProcessor = [];
		var proceed = true;
		$.each(chain, function(idx, item) {
			if ($.isArray(item) && processorKeyword(item[0]) && $.isFunction(item[1])) {
				if (item[0] === true || item[0] === "meta") {
					metaProcessor.push(item[1]);
				} else if (item[0] === "pre") {
					preProcessor.push(item[1]);
				} else if (item[0] === "post") {
					postProcessor.push(item[1]);
				}
			}
		});
		proceed && $.each(preProcessor, function(idx, p) {
			if (p.apply(context, $.isFunction(args) ? args(context) : args) === false) {
				proceed = false;
				return false;
			}
		});
		proceed && $.each(chain, function(idx, item) { // 이전 버전에서 chain & metaProcessor를 분리하였으나, 다시 E&S버전으로 롤백.
			if ($.isFunction(item)) {
				if (item.apply(context, $.isFunction(args) ? args(context) : args) === false) {
					proceed = false;
					return false;
				}
			} else if ($.isArray(item) && item[0] !== true) {
				for ( var i = 0, l = metaProcessor.length; i < l; i++) {
					if (metaProcessor[i].apply(context, item) === false) {
						proceed = false;
						return false;
					}
				}
			}
		});
		proceed && $.each(postProcessor, function(idx, p) {
			if (p.apply(context, $.isFunction(args) ? args(context) : args) === false) {
				procees = false;
				return false;
			}
		});
		return proceed;
	}

	function addToChain(chain, value, forcePriority) {
		//value의 가능한 형태
		//function
		//[function]
		//[true,function]
		//[[function,function..],[true,function]]
		if ($.isFunction(value)) {
			chain.push(value);
		} else if ($.isArray(value)) {
			if (processorKeyword(value[0]) && $.isFunction(value[1])) {
				chain.push(value);
			} else if (typeof value[0] === "string") {
				chain.push(value);
			} else {
				for ( var i = 0, l = value.length; i < l; i++) {
					addToChain(chain, value[i]);
				}
			}
		} else if ($.isPlainObject(value)) {
			chain.push(value);
		}
		return;
	}
	/**
	 * Star Alopex Service Constructor
	 * 
	 * var newservice = new $a.service();
	 * newservice.service(id, data, success, fail, error);
	 * 
	 * $a.service(id, data, success, fail, error);
	 */
	$.alopex.service = function(copy) {
		var self = this;
		if (self instanceof $.alopex.service && !self.alopexservice) { //new로 호출됨.
			self.alopexservice = randstr();
			self.settings = {
				success: [],
				fail: [],
				error: []
			};
			self.request = {};//before영역. before함수들의 this가 된다.
			self.response = {};//after영역. after함수들의 this가 된다.
			//.service()가 호출되는 시점에 $.alopex.service의 property를 가져와야 한다. 
			//extendProperty(self.request, $.alopex.service);
			self.request.chain = [];//before chain. 플랫폼 기본체인 호출 후 적용이 된다.
			self.response.chain = [];//after chain

			if (copy && copy.alopexservice) {
				extendProperty(self.settings, copy.settings);
			}
			if (copy && copy.request && $.isArray(copy.request.chain)) {
				self.request.chain = self.request.chain.concat(copy.request.chain);
			}
			if (copy && copy.response && $.isArray(copy.response.chain)) {
				self.response.chain = self.response.chain.concat(copy.response.chain);
			}

		} else { //일반 함수로 호출 
			self = new $.alopex.service();
			if (arguments[0] !== $.alopex && arguments.length) {
				self.service.apply(self, arguments);
			}
		}
		populatePrototype();
		return self;
	};
	$.extend($.alopex.service, {
		settings: {
			platform: "GENERIC",
			url: "",
			method: "GET",
			async:true,
			before: [],
			after: [],
			success: [],
			fail: [],
			error: []
		},
		fix: function(inst) {
			//prototype exposure
			populatePrototype();
			//instance fix
			return (inst && inst.alopexservice) ? inst : new $.alopex.service();
		},
		clone: function() {
			if (this.alopexservice) {
				return new $.alopex.service(this);
			} else {
				return new $.alopex.service();
			}
		},
		/**
		 * Star Alopex Service Setup
		 * 
		 * $a.service.setup({
		 *   platform : "NEXCORE.J2EE",
		 *   url : "/service",
		 *   ...
		 * });
		 * $a.service.setup({
		 *   "PlatformName" : {
		 *     platform : true,
		 *     setting1 : "value1",
		 *     setting2 : "value2",
		 *     before : [],
		 *     after : []
		 *   }
		 * });
		 */
		setup: function(o) {
			var self = this;
			if ($.isPlainObject(o)) {
				self.settings = self.settings || {};
				$.each(o, function(key, value) {
					if (value === undefined || value === null) {
						delete self.settings[key];
						if(rcallbackKey.test(key)) {
							self.settings[key] = [];
						}
					} else if (rcallbackKey.test(key)) {
						addToChain(self.settings[key], value);//to global or to instance
					} else if ($.isPlainObject(value) && (value.platform === true)) {
						if (!$.alopex.service[key] || !$.alopex.service[key].alopexservice) {
							$.alopex.service[key] = new $.alopex.service();
						}
						//before : function
						//before : [true, function]
						//before : [function, [], function, []]
						$.each(value, function(k, v) {
							if (k !== "before" && k !== "after" && k !== "platform" && k !== "success" && k !== "fail" && k !== "error") {
								$.alopex.service[key].settings[k] = v;
							}
						});
						$.each(["after", "before", "success", "fail", "error"], function(idx, f) {
							value[f] ? $.alopex.service[key][f](value[f]) : "";
						});
					} else {
						self.settings[key] = value;
					}
				});
			}
			return self;
		},
		/**
		 * 사용자가 .service()를 호출하기전 실행하고자 하는 콜백함수 등록
		 * function callback(id, data, success, fail, error) {
		 *   var request = this;
		 *   request.data = data
		 *   ...
		 * }
		 */
		before: function(callback) {
			var self = $.alopex.service.fix(this);
			addToChain(self.request.chain, $.makeArray(arguments));
			return self;
		},
		/**
		 * 사용자가 .service()를 호출하고 데이터가 수신되었을 때 실행하고자 하는 콜백함수 등록
		 * function callback(data, headers) {
		 *  var response = this;
		 *  response.data = JSON.parse(response.responseText);
		 *  response.success = true;//설정여부에 따라 success/fail callback 호출.
		 * }
		 */
		after: function(callback) {
			var self = $.alopex.service.fix(this);
			addToChain(self.response.chain, $.makeArray(arguments));
			return self;
		},
		/**
		 * 
		 */
		success: function(callback) {
			var self = $.alopex.service.fix(this);
			addToChain(self.settings.success, $.makeArray(arguments));
			return self;
		},
		/**
		 * 
		 */
		fail: function(callback) {
			var self = $.alopex.service.fix(this);
			addToChain(self.settings.fail, $.makeArray(arguments));
			return self;
		},
		/**
		 * 
		 */
		error: function(callback) {
			var self = $.alopex.service.fix(this);
			addToChain(self.settings.error, $.makeArray(arguments));
			return self;
		},
		/**
		 * service 호출
		 */
		service: function(id, data, success, fail, error) {
			var self = $.alopex.service.fix(this);
			var args = $.makeArray(arguments);
			//self.request for before
			//self.response for after
			//platform chain
			var request = {
				data: null,
				headers: {}
			};
			var response = {
				data: null,
				headers: {}
			};
			//글로벌설정 가져옴
			extendProperty(request, $.alopex.service.settings);
			//플랫폼설정을 가져옴
			var platform = request.platform;
			extendProperty(request, self.settings);
			//글로벌 설정에 의거한($.alopex.service.platform)플랫폼 설정 가져옴
			//인스턴스 설정 가져옴
			extendProperty(request, self.request);
			request.chain = [];
			//Before Chaining Order : "[GlobalSetup -> UserChain] -> PlatformBefore" per every priority 
			request.chain = request.chain
				.concat(request.before || [])
				.concat(self.request.chain || [])
				.concat($.alopex.service[request.platform].request.chain || []);
			if (doChaining(request, request.chain, args) === false) {
				return false;
			}

			//platform = request.platform;
			response.request = request;
			response.chain = [];
			//After Chaining Order : "PlatformAfter -> [GlobalSetup -> UserChain]" per every priority
			response.chain = response.chain
				.concat($.alopex.service[platform].response.chain || [])
				.concat(request.after || [])
				.concat(self.response.chain || []);
			var ServiceHttp;
			if(typeof Http !== "function" && typeof _legacyHttp === "function") {
				ServiceHttp = _legacyHttp;
			} else {
				ServiceHttp = Http;
			}
			var http = new ServiceHttp();
			var entity = {};
			entity["url"] = $.isFunction(request.url) ? request.url.apply(request, args):request.url;
			entity["method"] = $.isFunction(request.method) ? request.method.apply(request, args) : request.method;
			entity["onBody"] = ((String(request.method).toUpperCase() === "POST") ? true : false);
			entity["content"] = $.isPlainObject(request.data) ? JSON.stringify(request.data) : String(request.data);
			entity["async"] = request.async;
			
			if(String(request.method).toUpperCase() === "GET" && $.isPlainObject(request.data) && !$.isEmptyObject(request.data)) {
				entity["url"] += "?" + $.param(request.data);
			}
			if ($.isPlainObject(request.headers)) {
				$.each(request.headers, function(header, value) {
					http.setRequestHeader(header, value);
				});
			}
			if (entity["async"]) {
			  http.setTimeout(request.timeout || 30000);
			}
			var progress_option = {
				//"message" : "Loading",
				"cancelable": false,
				"color": "grey"
			};
			window.platformUIComponent ? platformUIComponent.showProgressDialog(progress_option) : null;
			if(window.deviceJSNI) {
				http.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
			}
			http.request(entity, 
				(function(self, response, success, fail, error){
					return function(res) {
						var platform = response.request.platform;
//          response.responseText = res.response;//original data. parsing은 platform before processor의 처리내용.
            response.response = res.response;
            
						response.headers = res.responseHeader;
						if ($.isArray(response.chain)) {
							doChaining(response, response.chain, function(res) {
								return [res.data, res.headers];
							});
						}
						window.platformUIComponent ? platformUIComponent.dismissProgressDialog() : null; // callback 호출되기 이전에 progress 없애기. callback에서 또다른 서비스 호출 존재 시 문제됨.
						if (response.success === false) {
							//var fails = [].concat(response.callback.fail).push(fail);
							//플랫폼공통 -> [글로벌공통 -> 사용자지정] 순서.
							doChaining(response, [].concat($.alopex.service[platform].settings.fail).concat($.alopex.service.settings.fail).concat(self.settings.fail), [response.data, response.headers]);
							$.isFunction(fail) ? fail.call(response, response.data, response.headers) : "";
						} else {
							doChaining(response, [].concat($.alopex.service[platform].settings.success).concat($.alopex.service.settings.success).concat(self.settings.success), [response.data, response.headers]);
							$.isFunction(success) ? success.call(response, response.data, response.headers) : "";
						}
					};
				})(self, response, success, fail, error), 
				(function(self, response, success, fail, error){
					return function(res) {
						var platform = response.request.platform;
						response.originalResponse = response.responseText;
						response.data = res.status;
						response.status = res.status;
						response.statusText = res.statusText;
						doChaining(response, [].concat($.alopex.service[platform].settings.error).concat($.alopex.service.settings.error).concat(self.settings.error), [response.data, response.headers]);
						$.isFunction(error) ? error.call(response, response.data, response.headers) : "";
						if (!error) {
							doChaining(response, [].concat($.alopex.service[platform].settings.fail).concat($.alopex.service.settings.fail).concat(self.settings.fail), [response.data, response.headers]);
							$.isFunction(fail) ? fail.call(response, response.data, response.headers) : "";
						}
						window.platformUIComponent ? platformUIComponent.dismissProgressDialog() : null;
					};
				})(self, response, success, fail, error));
			return self;
		},
		prototype: {}
	});
}(jQuery);

(function($) {
	/**
	 * GENERIC 기본 설정.
	 */
	$.alopex.service.setup({
		"GENERIC" : {
			platform:true,
			before:[
				function(id,data,success,fail,error){
					var request = this;
					request["data"] = $.extend(true, {}, request["data"] , data);
					request["url"] = request["url"] || id;
				},
				[true, function(metas){
					var request = this;
					if(!metas) return;
					if(!$.isArray(metas)) {
						metas = $.makeArray(arguments);
					}
					$.each(metas,function(idx,meta) {
						var $target = $(meta);
						if(!$target.length) return;
						var model = $.alopex.datamodel(meta, true).get();
						request["data"] = $.extend(true, {}, request["data"], model);
					});
				}]
			],
			after:[function(data,headers){
				var response = this;
				try {
					response["data"] = JSON.parse(response.responseText);
				} catch (e1) {
					try {
						if (window.DOMParser) {
							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(response.reponseText, "text/xml");
						} else { // Internet Explorer
							var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
							xmlDoc.async = false;
							xmlDoc.loadXML(response.reponseText);
						}
						response["data"] = response.responseText;
					} catch (e2) {
						response["data"] = response.responseText;
						response["success"] = false;
					}
				}
			}],
			success:[
			[true, function(metas){
				var response = this;
				if(!response.data || !metas) return;
				if(!$.isArray(metas)) {
					metas = $.makeArray(metas);
				}
				$.each(metas, function(idx, meta) {
					var $target = $(meta);
					if(!$target.length) return;
					$.alopex.databind(response.data, meta);
				});
			}]
			]
		}
	});
})(jQuery);
	
(function($) {	
	/**
	 * J2EE 설정.
	 */
	$.alopex.service.setup({
		"NEXCORE.J2EE" : {
			platform : true,
			before : [function(id, data, success, fail, error) { // data
				// parameter 생성.
				this.data["transaction"] = {
					"id" : id
				};
				this.headers = {
					"Content-Type" : "application/json; charset=UTF-8"
				};
			}],
			after : [function(data, headers) { // 플랫폼 별로 다른 형태 타입이 올떄 처리.
				var response = this;
				var data = {};
				try {
					data = JSON.parse(response.responseText);
					if (data) {
						response.originalResponse = data;
					}
					if (data && data.dataSet) {
						response.data = data.dataSet;
					}
				} catch (e) {
					response.success = false;
				}
			}, function(data, headers) { // J2EE 에러 처리.
				var response = this;
				if (response.data && response.data.message) {
					if (response.data.message.result !== "OK") {
						response.success = false;
					}
				}
			}]
		}
	});
})(jQuery);


(function($) {
	/**
	 * .NET 서비스호출 설정 $a.service('skcc.net.type#serviceName', {key:value,
	 * key:value}, success,fail,error) dataset(table)전송은?
	 * $a.service.before({"table1":[{},{},{},{}],"tablemeta":10,...})
	 * .before('#grid1') .before({"table2":'#grid2'})
	 * .service('skcc.net.type#serviceName', {key:value, key:value}, ...)?
	 */
	$.alopex.service.setup({
		"NEXCORE.NET" : {
			platform : true,
			before : [function(id, data, success, fail, error) {
				// 클라이언트 레벨에서 J2EE 스펙 기준으로 작업한 부분이
				// 나중에 변경.
				var _comm_param = $.extend(true, {}, this.data.dataSet);
				var _net_param = {
					DataSet : {
						DataSetName : "DataSetName",
						Tables : []
					},
					Hashtable : {}
				};

				this.data = {};
				this.data.request = {};
				// .NET 플랫폼에서 id를 사용하여,
				// id = svcAdapter[id] || id;
				if (id.indexOf('#') == -1) { // ServiceId 사용
					this.data.request["ServiceId"] = id;
				} else if (id.split('#').length == 2) {
					this.data.request["ServiceType"] = String(id.split('#')[0]);
					this.data.request["ServiceName"] = String(id.split('#')[1]);
				} else {
					alert('Service 함수의 TransactionId 값이 유효하지 않습니다.')
					return false;
				}
				// recordSets -> dataset
				for ( var i in _comm_param.recordSets) {
					if (_comm_param.recordSets.hasOwnProperty(i)) {
						// var rs = _comm_param.recordSets[i];
						recordSetsToDataSet(i, _comm_param.recordSets, _net_param);
					}
				}

				// fields -> hashtable
				$.extend(_net_param.Hashtable, _comm_param.fields);

				// .NET 용으로 _ENCODE 해준다.
				this.data.request.ServiceData = _net_param;
				this.data.request = _ENCODE(this.data.request);

			}],
			after : [function(data, headers) {
				// 하는 역할: decode 데이터 및 InvokeSer, success 여부 판단,
				var response = this;
				var data = {};
				try {
					data = JSON.parse(response.responseText);
					data["InvokeServiceResult"] = _DECODE(data["InvokeServiceResult"]);
					//
					// 사용.
					response.originalResponse = data;
					// response.success =
					// isSuccess(data["InvokeServiceResult"]);
				} catch (e) {
					response.success = false;
				}
			}, function(data, headers) {
				var response = this;
				if (response.success !== false) {
					var data = {
						"fields" : {},
						"recordSets" : {}
					};
					var orgdata = response.originalResponse["InvokeServiceResult"];
					// Key-value성 데이터 처리
					$.extend(true, data["fields"], orgdata["Hashtable"]);

					// page 정보가 hashtable에 저장됨.
					orgdata["Object"] ? (data["fields"]["Object"] = orgdata["Object"]) : 0;
					// list성 데이터 처리
					if (orgdata["DataTable"] && !$.isEmptyObject(orgdata["DataTable"])) {
						addTableToRecordSets(orgdata["DataTable"], data);
					}
					if (orgdata["DataSet"] && $.isArray(orgdata["DataSet"]["Tables"])) {
						$.each(orgdata["DataSet"]["Tables"], function(idx, tableObject) {
							addTableToRecordSets(tableObject, data);
						});
					}
					// 최종데이터기록
					response.data = data;
				} else {
					response.data = response.originalResponse["InvokeServiceResult"];
				}

			}]
		}
	});
	
	// .NET의 datatable의 데이터를 dataset 내의 recordsets에 저장.
	// 
	function addTableToRecordSets(tableObject, dataset) {
		if (!$.isPlainObject(tableObject) || $.isEmptyObject(tableObject) || !$.isPlainObject(dataset) || !$.isPlainObject(dataset["recordSets"])) {
			return;
		}
		var name = tableObject["TableName"];
		var list = tableObject["Rows"];
		if (!name || !$.isArray(list)) {
			return;
		}
		var recordCoun
		dataset["recordSets"][name] = {
			"nc_list" : list
		};
		if (dataset["fields"]["nc_rowCount_" + name]) { // paging 관련 정보가 존재하는
		// 경우.
		// TODO 이름 수정 필요.(이진우 과장님한테 이름 픽스필요).
			var recordset = dataset["recordSets"][name];
			if(dataset["fields"]["nc_rowCount_" + name] > 0) {
				recordset["nc_recordCount"] = list.length;
				recordset["nc_pageNo"] = dataset["fields"]["nc_pageNum_" + name];
				recordset["nc_recordCountPerPage"] = dataset["fields"]["nc_rowCount_" + name];
				recordset["nc_totalRecordCount"] = dataset["fields"]["nc_totalRowCount_" + name];
			}
		}
	}
	function recordSetsToDataSet(key, recordSets, dataSets) {
		var rs = recordSets[key];
		dataSets.DataSet.Tables.push({
			TableName : key,
			Rows : rs.nc_list
		});

		dataSets.Hashtable["nc_pageNum_" + key] = rs.nc_pageNo;
		dataSets.Hashtable["nc_???_" + key] = rs.nc_recordCount;
		dataSets.Hashtable["nc_rowCount_" + key] = rs.nc_recordCountPerPage;
		dataSets.Hashtable["nc_totalRowCount_" + key] = rs.nc_totalRecordCount;
	}
	// .NET 프레임워크와 통신 스펙 맞추기 위해 URI encoding 처리.
	function _ENCODE(obj) {
		return encodeURIComponent(JSON.stringify(obj));
	}
	/**
	 * .NET 플래폼에서 인코딩된 패킷을 디코드하고, 오브젝트로 리턴.
	 */
	function _DECODE(str) {
		return JSON.parse(decodeURIComponent(str));
	}
	
})(jQuery);


(function($) {
	// 모든 플랫폼이 공통으로 사용하는 로직.
	// 비즈니스 단에서는 해당 로직이 공통으로 사용됨.
	$.alopex.service.setup({
		before : [function(id, data, success, fail, error) { // data
			// parameter 생성.
			this.data = {};
			this.data["attributes"] = {};
			this.data["dataSet"] = {
				"fields" : $.extend(true, {}, data),
				"recordSets" : {}
			};
		}, 
		[true, function(metas){
			var request = this;
			if(!metas) return;
			if(!$.isArray(metas)) {
				metas = $.makeArray(arguments);
			}
			// 서비스 전송 전에 추가 바인딩하는 데이터가 있을 경우 data를 조립
			var dataSet = this.data["dataSet"];

			$.each(metas, function(idx, meta) {
				if (typeof meta === "string" || (meta && meta.jquery && meta.prop('nodeType'))) {
					// 일반 form selector이거나 또는 grid selector. grid selector일땐 id를 자동추출한다 또는 일반 엘리먼트이거나 그리드 엘리먼트 이거나
					var $elem = $(meta);
					if (!$elem.length || !$elem.prop('nodeType'))
						return;
					if (!$elem.prop('id')) {
						// 엘리먼트 ID가 없을때엔 향후 bind-extract를 위해 임의의 id를 배정한다.
						$elem.prop(id, randomId());
					}
					if ($elem.attr('data-alopexgrid')) {
						// 그리드일때의 바인딩은 recordSets에서 추출
						dataSet.recordSets = $.extend(true, dataSet.recordSets, {});
						var recordSets = dataSet.recordSets;
						recordSets[$elem.prop('id')] = gridToRecordSet($elem);
					} else {
						// 일반엘리먼트일 때의 바인딩은 fields에서 추출
						dataSet.fields = $.extend(true, dataSet.fields, {});
						elementToFields($elem, dataSet.fields);
					}
				}
				if ($.isPlainObject(meta)) {
					// id가 지정된 grid
					// selector
					var recordSets = response.data.recordSets;
					if (!recordSets) {
						return;
					}
					$.each(meta, function(id, selector) {
						if ($(selector).attr('data-alopexgrid')) {
							dataSet.recordSets = $.extend(true, dataSet.recordSets, {});
							dataSet.recordSets[$elem.prop('id')] = gridToRecordSet($elem);
						}
					});
				}
			});
		}]],
		after : [],
		success : [
			[true, function(metas){
			if(!metas) return;
			if(!$.isArray(metas)) {
				metas = $.makeArray(arguments);
			}
		
			// sample implementation
			var response = this;

			$.each(metas, function(idx, meta) {
				if (typeof meta === "string" || (meta && meta.jquery && meta.prop('nodeType'))) {
					// 일반 form selector이거나 또는
					// grid selector. grid
					// selector일땐 id를 자동추출한다
					// 또는 일반 엘리먼트이거나 그리드 엘리먼트
					// 이거나
					var $elem = $(meta);
					if (!$elem.length || !$elem.prop('nodeType'))
						return;
					if (!$elem.prop('id')) {
						// 엘리먼트 ID가 없을때엔 향후
						// bind-extract를 위해 임의의
						// id를 배정한다.
						$elem.prop(id, randomId());
					}
					if ($elem.attr('data-alopexgrid')) {
						// 그리드일때의 바인딩은
						// recordSets에서 추출
						var recordSets = response.data.recordSets;
						if (!recordSets) {
							return;
						}
						if (recordSets.hasOwnProperty($elem.prop('id'))) {
							recordSetToGrid(recordSets[$elem.prop('id')], $elem);
						}
					} else {
						// 일반엘리먼트일 때의 바인딩은
						// fields에서 추출
						var id = $elem.attr('id');
						fieldsToElement(formDataFromData(response.data, id), $elem);
					}
				}
				if ($.isPlainObject(meta)) {
					// id가 지정된 grid selector
					var recordSets = response.data.recordSets;
					if (!recordSets) {
						return;
					}
					$.each(meta, function(id, selector) {
						if (recordSets.hasOwnProperty(id) && $(selector).attr('data-alopexgrid')) {
							recordSetToGrid(recordSets[id], $(selector));
						}
					});
				}
			});
		}]]
	});
	
	// 메타 프로세스에서 사용하는 함수들.
	// 클라이언트에서 작업 시 J2EE와 동일한 데이터 형식으로 작업하는 것을 표준으로 함.

	var seed = (Math.random() * 1000) | 0;
	function randomId() {
		return "J2EE" + seed++;
	}
	// 수신된 recordSet을 grid에 매핑시킨다
	function recordSetToGrid(rs, $elem) {
		var $target = $elem.jquery ? $elem : $($elem);
		if (!isValidElem($elem))
			return;
		if (!rs || !$elem)
			return;
		//
		$elem = $elem || $('#' + tableObject["TableName"]);
		if (!$elem.prop('nodeType'))
			return;
		if (!$elem.attr('data-alopexgrid'))
			return;
		var pobj = rs;
		// DOTO dataSet을 하면서 pagingObject를 넘기게 되면 이후에는 동적 페이징으로 작동한다.
		// 만일 동적 페이징을 사용하지 않고 한번에 모든 데이터를 로드하여 사용한다면
		// dataSet의 두번째 파라메터로 pagingObject를 넘기지 않는다.
		var dynamicpaging = pobj.hasOwnProperty('nc_pageNo') && (pobj['nc_pageNo'] > 0) && pobj.hasOwnProperty('nc_totalRecordCount') && pobj.hasOwnProperty('nc_recordCountPerPage');

		$target.alopexGrid('dataSet', $.isArray(pobj.nc_list) ? pobj.nc_list : [], dynamicpaging ? {
			current : pobj.nc_pageNo,
			total : Math.ceil(1.0 * pobj.nc_totalRecordCount / pobj.nc_recordCountPerPage) | 0,
			perPage : pobj.nc_recordCountPerPage,
			dataLength : pobj.nc_totalRecordCount
		} : null);
	}
	// 그리드로부터 recordSet을 추출한다.
	function recordSetToRecordSets(id, rs, rss) {
		if ($.isPlainObject(rss) && $.isPlainObject(rs) && typeof id === "string") {
			rss[id] = rs;
			return rss;
		}
	}
	function recordSetFromRecordSets(id, rss) {
		if ($.isPlainObject(rss) && typeof id === "string" && rss.hasOwnProperty(id)) {
			return rss[id];
		}
	}
	function gridToRecordSet(grid, rs) {
		var $target = grid.jquery ? grid : $(grid);
		var m_rs = {};
		var nc_list = $target.alopexGrid('dataGet');
		for ( var i = 0, l = nc_list.length; i < l; i++) {
			nc_list[i] = AlopexGrid.trimData(nc_list[i]);
		}
		var pageinfo = $target.alopexGrid('pageInfo');
		m_rs["nc_recordCount"] = nc_list.length;
		m_rs["nc_pageNo"] = pageinfo.current;
		m_rs["nc_recordCountPerPage"] = pageinfo.perPage;
		m_rs["nc_totalRecordCount"] = pageinfo.dataLength;
		m_rs["nc_list"] = nc_list;
		if ($.isPlainObject(rs)) {
			$.extend(true, rs, m_rs);
			return rs;
		}
		return m_rs;
	}

	// recordset을 grid외의 요소에 매핑시킬때의 규칙
	function recordSetToElement(rs, elem) {

	}
	function elementToRecordSet(elem, rs) {

	}

	// dataSet.fields의 값을 일반 databind로 적용
	function fieldsToElement(fields, elem) {
		// $.alopex.page[idselector] = $.alopex.databind(response.data.fields,
		// $target[0]);
		var $elem = (elem && elem.jquery) ? elem : $(elem);
		if (!$elem.length || !$elem.prop('nodeType')) {
			return;
		}
		if($.alopex.page['#' + $elem.prop('id')]) { // 이미 model이 생성된 경우.
			$.alopex.page['#' + $elem.prop('id')].set(fields);
		} else {
			$.alopex.page['#' + $elem.prop('id')] = $.alopex.datamodel($elem, true);
		    $.alopex.page['#' + $elem.prop('id')].set(fields);
		}
		
	}
	function elementToFields(elem, fields) {
		var $elem = (elem && elem.jquery) ? elem : $(elem);
		if (!$elem.length || !$elem.prop('nodeType'))
			return;
		if (!$.alopex.page['#' + $elem.prop('id')]) {
			$.alopex.page['#' + $elem.prop('id')] = $.alopex.datamodel('#' + $elem.prop('id'));
		}
		var model = $.alopex.page['#' + $elem.prop('id')].get();
		if ($.isPlainObject(fields)) {
			$.extend(true, fields, model);
		}
		return model;
	}
	// .NET에서 formdata를 DataSet에 넣는 케이스 고려.
	function formDataFromData(data, id) {
		var fields = $.extend(true, {}, data.fields);
		if (!id) {
			id = 'Table';
		}
		// .NET의 경우, form data의 경우도 datatable로 넘기는 경우가 다수 발생.
		if (data["recordSets"] && data["recordSets"][id] && $.isArray(data["recordSets"][id]["nc_list"])) {
			$.extend(true, fields, data["recordSets"][id]["nc_list"][0]);
		}
		return fields;
	}
	function isValidElem($elem) {
		if (!$elem || !$elem.prop('nodeType'))
			return false;
		return true;
	}
	
})(jQuery);
!function($, window, document) {
	
	var commonModule = 'common';
	var pageModule = 'page';

	$.alopex.services = function(svcList) {
		$.alopex.services.list = $.extend(true, $.alopex.services.list, svcList);

		for (var id in svcList) {
			if (!svcList.hasOwnProperty(id)) {return;}
			// 서비스에 trigger되는 엘리먼트 찾아서 등록.
			var elements = document.querySelectorAll('[data-trigger*="@'+id+'"]');
			if(elements) {
				var regexp = new RegExp('\\w+\\s*\@\\s*'+id+'\(\?\!\[\\d\\w\]\)', 'gi');
				for(var i=0; i<elements.length; i++) {
					var event, element = elements[i];
					var attr = element.getAttribute('data-trigger');
					var match = attr.match(regexp);
					if(match) {
						for(var j=0; j<match.length; j++) {
							event = $.trim(match[j].split('@')[0]);
							if(event) {
								if(event == 'load') {
									sendRequest(id);
								} else {
									$(element).on(event, (function(_id) {
										return function() {
											sendRequest(_id);
										};
									})(id));
								}
							}
						}
					}
				}
			}
			
			var setting = svcList[id];
			if(setting.trigger && setting.trigger instanceof Array) {
				for(var i=0; i<setting.trigger.length; i++) {
					var prerequisite = setting.trigger[i];
					if(!$.alopex.services.dependency[prerequisite]) {
						$.alopex.services.dependency[prerequisite] = [];
					}
					$.alopex.services.dependency[prerequisite].push(id);
				}
			}
		}
	};
	$.alopex.services.dependency = {};
	
	function Response(jqXHR) {
		this.responseText = jqXHR.responseText;
		this.response = jqXHR.responseJSON;
		if(!this.response) {
			try{
				this.response = JSON.parse(this.responseText);
			}catch(e){}
		}
		this.status = jqXHR.status;
		this.errorCode = jqXHR.status;
		this.errorText = jqXHR.statusText;
	}
	
	function Request(id, setup, request) {
		this.id = id;
		this.headers;
		this.method;
		this.timeout;
		this.url;
		this.data;
		this.context; // callback에 전달될.
		
		this.setup;
		this.request;
		
		setup = (setup)? setup: {};
		this.setup = setup;
		this.request = request;
		var setting = $.extend(true, setting, setup, request);
		setting.method = setup.method || request.method;
		setting.url = request.url || setup.url;
		var Func;
		if(typeof setting.url == 'function') {
			Func = setting.url 
		} else if( setting.url.indexOf('function') != -1) {
			Func = eval('(' +setting.url + ')' );
		}
		if(Func) {
			setting.url = Func(id, request)
		}
		setting.data = setting.parameter;
		if(setting.variables) {
			for(var i in setting.variables) {
				$.alopex.util.setValueOnObject(setting.data, i, setting.variables[i]);
			}
		}
		setting.dataType = 'json';
		if(setting.requeestHeaders) {
			setting.header = setting.requeestHeaders;
		}
		setting.context = this;
		this.success = successCallback;
		this.error = errorCallback;
		this.method = setting.method;
		this.url = setting.url;
		this.data = setting.data;
		this.response = null;
		this.proceed = new Proceed(this);
	}
	
	function Proceed(req) {
		this.id = Math.random();
		this.status;
		this.canProceed = false;
		this.request = req;
	}
	Proceed.prototype.next = function() {
		this.canProceed = false;
		return (function(that) {
			return function (status) {
				that.canProceed = true;
				if(status) that.status = status;
			};
		})(this);
	};
	Proceed.prototype.checkProceed = function() {
		if(this.canProceed) {
			return true;
		} else {
			return false;
		}
	};
	

	function sendRequest(id) {
		var service = $.alopex.services.list[id];
		var defaultSetting = $.alopex.request.setupConfig;
		var req = new Request(id, defaultSetting, service);
		req.setting = service; // TODO temp.. fix it.
		
		// parameter
		for(var i in service.parameter) {
			$.alopex.util.setValueOnObject(req.data, i, service.parameter[i]);
		}
		
		if(service.parambind) {
			for(var i in service.parambind) {
				var bindmap = service.parambind[i];
				$.alopex.util.setValueOnObject(req.data, i, $a.getDataByService(bindmap, 'data-bind'));
			}
		}
		
		// handle pre-processes
		if(defaultSetting.before) {
			try{
				var before = window[commonModule][defaultSetting.before];
				if(before) {
					before(req, req.proceed.next());
					if(!req.proceed.checkProceed()) {
						return;
					}
				}
			}catch(e){}
		}
		if(service.before && service.before.length) {
			for(var i=0; i<service.before.length; i++) {
				try{
					var before = window[pageModule][service.before[i]];
					if(before) {
						before(req, req.proceed.next());
						if(!req.proceed.checkProceed()) {
							return;
						}
					}
				}catch(e){}
			}
		}
		
		var ServiceHttp;
		if(typeof Http !== "function" && typeof _legacyHttp === "function") {
			ServiceHttp = _legacyHttp;
		} else {
			ServiceHttp = Http;
		}
		var http = new ServiceHttp();
		req["onBody"] = ((String(req.method).toUpperCase() === "POST") ? true : false);
		// parameter들이 변환된 이후에 처리.
		req["content"] = (typeof req.data == 'object') ? JSON.stringify(req.data) : String(req.data);
		if (String(req.method).toUpperCase() === "GET" && $.isPlainObject(req.data) && !$.isEmptyObject(req.data)) {
			entity["url"] += "?" + $.param(req.data);
		}
		if (req["async"]) {
			http.setTimeout(req.timeout || 30000);
		}
		if (window.deviceJSNI) {
			http.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		}
		http.request(req, __successCallback(req), __errorCallback(req));
	}
	
	function successCallback(data, textStatus, jqXHR) {
		var req = this;
		var id = req.id;
		req.response = new Response(jqXHR);
		var service = $.alopex.services.list[id];
		var defaultSetting = $.alopex.request.setupConfig;
		
		// handle post-processes
		if(defaultSetting.after) {
			try{
				var after = window[commonModule][defaultSetting.after];
				if(after) {
					after(req, req.response, req.proceed.next());
					if(!req.proceed.checkProceed()) {
						return;
					}
				}
			}catch(e){}
		}
		if(service.after && service.after.length) {
			for(var i=0; i<service.after.length; i++) {
				try{
					var after = window[pageModule][service.after[i]];
					if(after) {
						after(req, req.response, req.proceed.next());
						if(!req.proceed.checkProceed()) {
							return;
						}
					}
				}catch(e){}
			}
		}
		
		if(req.proceed.status == 'fail') {
			failCallback.call(req);
			return ;
		} else if(req.proceed.status == 'error') {
			errorCallback.call(req, jqXHR, req.response.status)
			return ;
		}
		
		// 공통 success callback
		if(window[commonModule]) {
			if(defaultSetting.success && typeof window[commonModule][defaultSetting.success] == 'function') {
				window[commonModule][defaultSetting.success](data, req, req.response);
			}
		}
		
		// 페이지 지정 success callback
		if(window[pageModule]) {
			if(service.success && typeof window[pageModule][service.success] == 'function') { 
				window[pageModule][service.success](data, req, req.response);
			}
		}
		
		// 데이타 바인딩 처리.
		// databind 처리는 html에 작성된 'data-bind' 속성값에 따라 처리.
		if(req.setting.databind && req.response.response) {
			for(var i in req.setting.databind) {
				// 'path.path2 : 'bindmap-id''
				var data = $.alopex.util.getValueOnObject(req.response.response, i);
				$.alopex.setDataByService(req.setting.databind[i], data, 'data-bind');
			}
		}
		
		// call the service which is required to
		if($.alopex.services.dependency[id]) {
			for(var i=0; i<$.alopex.services.dependency[id].length; i++) {
				sendRequest($.alopex.services.dependency[id][i]);
			}
		}
	}
	
	
	function failCallback() {
		var req = this;
		var id = req.id;
		var service = $.alopex.services.list[id];
		var defaultSetting = $.alopex.request.setupConfig;
		if(window[commonModule]) {
			if(defaultSetting && defaultSetting.fail && typeof window[commonModule][defaultSetting.fail] == 'function') {
				window[commonModule][defaultSetting.fail](req.response.errorCode, req.response.errorText);
			}
		}
		if(window[pageModule]) {
			if(service && service.fail && service.fail && typeof window[pageModule][service.fail] == 'function') {
				window[pageModule][service.fail](req.response.errorCode, req.response.errorText);
			}
		}
		
	}
	
	function errorCallback(jqXHR, textStatus, errorThrown) {
		var req = this;
		var id = req.id;
		var service = $.alopex.services.list[id];
		var defaultSetting = $.alopex.request.setupConfig;
		if(!req.response) {
			req.response = new Response(jqXHR);
		}
		if(window[commonModule]) {
			if(defaultSetting && defaultSetting.error && typeof window[commonModule][defaultSetting.error] == 'function') {
				window[commonModule][defaultSetting.error](req.response.errorCode, req.response.errorText);
			}
		}
		if(window[pageModule]) {
			if(service && service.error && service.error && typeof window[pageModule][service.error] == 'function') {
				window[pageModule][service.error](req.response.errorCode, req.response.errorText);
			}
		}
	}
	
	function __successCallback(req) {
		return function(res, jqXHR) {
			successCallback.call(req, res.response, res.status, jqXHR);
		};
	}
	
	function __errorCallback(request) {
		return function(res, jqXHR) {
			errorCallback.call(request, jqXHR, res.status);
		};
	}

	$.alopex.services.defaultSetting = {
		request : {
			url : "",
			method : "POST",
			async : "true",
			timeout : "1000",
			parameter : {}
		},
		after: {},
		before : {},
		response : {
			failCondition : [],
			response : {}
		},
		success : {
			callback : undefined,
			bindMapping: {
//					'path.path2': 'div.classname[data-bind]'				
			}
		},
		error : {
			callback : undefined
		},
		fail : {
			callback : undefined
		}
	};
	$.alopex.services.send = sendRequest;
	$.alopex.services.list = {};
	$.alopex.registerSetup('request', function(option) {
		$.alopex.services.defaultSetting = option;
	});
	
	
	// if $.alopex.request is defined, attach IDE function to the property.
	if($.alopex.request && typeof $.alopex.request == 'function') {
		$.alopex.request.register = $.alopex.services;
		$.alopex.request.sendRegistered = sendRequest;
	}

}(jQuery, this, this.document, undefined);
!function($) {
	/**
	 * 공통 설정 부분.
	 * before : 전처리, 
	 * after : success 판단 여부 처리 
	 * success : 성공 시 공통으로 처리해주는 후처리. 
	 * url : "" or function() {return "http://localhost:9000";}
	 * method : "GET" or "POST" or function() { return "GET";}
	 */
	$.alopex.request.setup({
//		platform: 'NEXCORE.J2EE',
//		//url : "http://150.28.65.2:7001/web/stand.jmd",
//		/* 조건에 따라 다른 url에 지정이 가능하다. */
//		url: function() {
//			if(true){
//				return "http://150.28.65.2:7001/web/stand.jmd";
//			}
//			return 'dddd'
//		},
//		//*/
//		method : "POST",
//		timeout: 3000,
//		before : function(id, option) { // before
//			// 전처리기.
//			$('body').progress(); //progress bar 시작
//		},
//		after : function(res) {
//			this.isSuccess = true | false;
//		},
//		success : function(res) {
//		},
//		fail: function(res) {
//		},
//		error  : function(err) {
//		}
	});
	
	
	$.alopex.navigate.setup({
		/**
		 * 이 함수를 통해 navigate 함수의 경로가 바뀌는 것을 조정할 수 있습니다.
		 */
		url: function(url, param) {
			var targetUrl = url;
//			var baseDirectory = '/html/';
//			var semanticUrl = window.location.href.split('?')[0];
//			semanticUrl = semanticUrl.replace('//', '');
//			semanticUrl = semanticUrl.substring(semanticUrl.indexOf('/') + 1); // protocol & domain 부분 제외. 절대 경로. '/FM/dd/
//			var currentUrlPath = semanticUrl.split('/');
//			var urlPath = targetUrl.split('/');
//			if(!$.alopex.util.isValid(currentUrlPath[currentUrlPath.length-1])) {
//				currentUrlPath.pop();
//			}
//			if(!$.alopex.util.isValid(urlPath[urlPath.length-1])) {
//				urlPath.pop();
//			}
//			var extension = '';
//			var path = currentUrlPath[currentUrlPath.length-1];
//			if(path.split('.').length>1) {
//				extension = path.split('.')[path.split('.').length-1].toLowerCase().trim();
//			}
//			var hasHTMLExtension = (extension == 'html');
//			
//			if(url.indexOf('/') == 0) { // 절대 경로.
//				if(currentUrlPath.length == urlPath.length) { // 절대 경로로 navigate함수 호출하고, 그에 따라 이동.
//					// do Nothing!
//				} else { // 모바일 프레임워크와 같이 /html/ 디렉토리가 기준이 되어 이동하는 케이스.
//					targetUrl = (baseDirectory + targetUrl);
//					if(hasHTMLExtension) { 
//						// Controller 사용 시 html확장자를 가지고 있는 경우, 
//						// 이동 기준이 되는 디렉토리가 html 폴더 기준으로 이동하는 것이 표준.
//						targetUrl += (targetUrl.lastIndexOf('.html') + 5 == targetUrl.length? '': '.html');
//					}
//				}
//			} else {
//				
//			}
			
			
			return targetUrl;
		}
	});
}(jQuery);




/*! Alopex UI - v2.3.1.16 - 2016-03-30
* http://ui.alopex.io
* Copyright (c) 2016 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */
!function($) {
	
	var PARAMETER_ATTRIBUTE = 'data-parameter';
	var SERVICE_ATTRIBUTE = 'data-service';
	var FORMATTER_ATTRIBUTE = 'data-bind-format';
	var BIND_ATTRIBUTE = 'data-bind';
	var SERVICE_DELIMETER = '@';
	var BINDRULE_DELIMETER = ':';
	
	
	$.fn.findAll = function(selector) {
		return this.find(selector).addBack(selector);
	};

	
	/********************************************************************************************************************************
	 * 
	 * Parser 
	 * 
	 *********************************************************************************************************************************/
	
	function Parser() {;}
	/**
	 *  segment1@segment2:segment3
	 */
	Parser.prototype.toObject = function(text) {
		var result = {}, 
			ruleChunk, 
			ruletext = text;
		ruleChunk = ruletext.split(SERVICE_DELIMETER);
		if(ruletext.indexOf(SERVICE_DELIMETER) !== -1 && ruleChunk.length === 2) { // with service
			result.firstSegment= $.trim(ruleChunk[1]);
			ruletext = $.trim(ruleChunk[0]);
		}
		ruleChunk = ruletext.split(BINDRULE_DELIMETER);
		if(ruleChunk.length < 2) {
			result.thirdSegment = ruletext;
		} else {
			result.secondSegment = $.trim(ruleChunk[0]);
			ruleChunk.shift();
			result.thirdSegment = $.trim(ruleChunk.join(BINDRULE_DELIMETER));
		}
		return result;
	};
	/**
	 * data-bind 속성값을 파싱하여 아래와 같은 형태로 리턴.
	 * {
	 * 		datakey: {
	 * 			serviceName: '',
	 * 			controlName: '',
	 * 			subcontrolName: ''
	 * 		}
	 * 	
	 * }
	 */
	Parser.prototype.parseByKey = function(text) {
		var result=[], ruleList = this.splitRules(text);
		for(var i=0; i<ruleList.length; i++) {
			var temp = ruleList[i].match(this.regexp);
			if(temp.length === 1 && temp[0] == ruleList[i]) { // rule is valid
				var ruleObject = this.toObject(ruleList[i]);
				if(ruleObject && ruleObject.thirdSegment && ruleObject.thirdSegment.indexOf('{') !== -1) {
					var subruleText = ruleObject.thirdSegment.replace(/[\{\}]/gi, '');
					var subruleList = this.splitRules(subruleText);
					for(var j=0; j<subruleList.length; j++) {
						var subruleObject = this.toObject(subruleList[j]);
						if(subruleObject) {
							result.push({
								serviceName: ruleObject.firstSegment,
								controlName: ruleObject.secondSegment,
								subcontrolName: subruleObject.secondSegment,
								key: subruleObject.thirdSegment
							});
						}
					}
				} else {
					result.push({
						serviceName: ruleObject.firstSegment,
						controlName: ruleObject.secondSegment,
						key: ruleObject.thirdSegment
					});
				}
			}
			
		}
		return result;
	};
	/**
	 * 
	 * {
	 * 		html: {
	 * 			key: 
	 * 		},
	 * 		template: {
	 * 			name: treeElement, foreach: treedata
	 * 		}
	 * }
	 */
	
	Parser.prototype.parseByControl = function(text) {
		var ruleText, wordList, i, j,
			ruleObject={}, 
			ruleList = this.splitRules(text);
		for(i=0; i<ruleList.length; i++) {
			ruleText = ruleList[i];
			wordList = ruleText.match(/[^\{\,\:\s\{\}]+/gi);
			
			for(j=0; j<wordList.length; j++) {
				ruleText = ruleText.replace(wordList[j], '"'+wordList[j]+'"');
			}
			ruleText = '{' + ruleText + '}';
			try{
				$.extend(ruleObject, JSON.parse(ruleText));
			} catch(e) {}
		}
		return ruleObject;
	};
	Parser.prototype.regexp = /[^\s,{}]+\s*:\s*(\{(\s*[^\s,{}]+\s*:\s*[^\s,{}]+\s*,?)+}|[^\s,{}]+)(\s*\@\s*[^\s,{}]+)?/gi;
	Parser.prototype.splitRules = function(text) {
		if(text && text.match) {
			return text.match(this.regexp) || [];
		}
		return [];
	};
	Parser.prototype.isValidServiceData = function(text, servicekey) {
		var splitted = text.split(SERVICE_DELIMETER);
		if(splitted.length > 1 && $.trim(splitted[1]) === servicekey) {
			return true;
		} 
		return false;
	};
	var parser = $.alopex.BindParser = new Parser();

	
	
	/********************************************************************************************************************************
	 * 
	 * Private Functions 
	 * 
	 *********************************************************************************************************************************/
	
	
	/**
	 * 인자로 주어진 리스트에 
	 * @param elementList
	 * @param data
	 * @param attributeName
	 */
	$.alopex.setDataOnElements = function (elementList, data, attributeName, serviceName) {
		if(!data) {return ;}
		attributeName = attributeName || BIND_ATTRIBUTE;
		$.each(elementList, function(idx, element) {
			var controlName, value;
			var attributeValue = $(element).attr(attributeName);
			// parse bindrule from element
			
			var rule = $.alopex.BindParser.parseByKey(attributeValue);
			for(var i=0; i<rule.length; i++) {
				if(serviceName && serviceName!=rule[i].serviceName) {
					continue;
				}
				value = $.alopex.util.getValueOnObject(data, rule[i].key);
				if(value != null && value != undefined) { // found value on data.
					// call the proper render function by bindrule
					controlName = rule[i].controlName;
					
					if($.alopex.DataBinder[controlName] && $.alopex.DataBinder[controlName].render) {
						var formatter = $(element).attr(FORMATTER_ATTRIBUTE);
						if($.alopex.util.isValid(formatter)) {
							value = $.alopex.format(value, $(element).attr(FORMATTER_ATTRIBUTE));
						}
						$.alopex.DataBinder[controlName].render(element, rule[i].key, value, data, rule[i]);
					}
				}
			}
		});
	};
	
	$.alopex.getDataFromElements = function (elementList, attributeName) {
		var data = {};
		attributeName = attributeName || BIND_ATTRIBUTE;
		$.each(elementList, function(idx, element) {
			var $el = $(element);
			// foreach 컨트롤 처리하는게 아닌데, foreach 내에 위치한 값은 무시.
			var controlName, value;
			var attributeValue = $(element).attr(attributeName);
			// parse bindrule from element
			var rule = $.alopex.BindParser.parseByKey(attributeValue);
			
			if(typeof element !== 'object') { // element must be HTMLElement
				if($el.length === 0) {
					return ;
				}
				element = $el[0];
			}
			
			for(var i=0; i<rule.length; i++) {
				controlName = rule[i].controlName;
				if(controlName && $.alopex.DataBinder[controlName] && $.alopex.DataBinder[controlName].data) {
					var formatter = $(element).attr(FORMATTER_ATTRIBUTE);
					value = $.alopex.DataBinder[controlName].data(element, rule[i].key, undefined, data, rule[i]);
					if(value != undefined && value != null) { // undefined나 null 인 경우가 아니면 그냥  키 생성.
						if($.alopex.util.isValid(value) && $.alopex.util.isValid(formatter)) {
							value = $.alopex.unformat(value, $(element).attr(FORMATTER_ATTRIBUTE));
						}
						$.alopex.util.setValueOnObject(data, rule[i].key, value);
					}
				}
			}
		});
		return data;
	};
	
	function _getParsableElementInScope(rootEl, attributeName) {
		var $root = $(rootEl);
		attributeName = attributeName || BIND_ATTRIBUTE;
		return _getParsableElement($root.findAll('[' + attributeName + ']').toArray(), rootEl, attributeName);
	}
	
	function _getParsableElement(list, rootEl, attributeName) {
		var candidates = [], $root = $(rootEl);
		$(list).each(function(idx, bindEl) {
			// foreach, with 컨트롤 하위 엘리먼트는 해당 컨트롤에서 처리하기 위해서 candidates에서 제거되어야 함.
			var parents = $(bindEl).parents('['+attributeName+'*=foreach], ['+attributeName+'*=with]').eq(0);  
			if(parents.length == 0) {
				candidates.push(bindEl);
			} else {
				parents.each(function(idx, iterEl) {
					if($root.findAll(iterEl).length == 0) {
						candidates.push(bindEl);
					}
				});
			}
		});
		return candidates;
	}
	
	
	/**
	 * root 하위에 해당 attributeName 속성을 가지고 serviceKey에 매핑된 엘리먼트를 찾아준다.
	 */
	$.alopex.getCandidates = function _getSettableElement(servicekey, attributeName, root) {
		var candidates = [];
		if(!root) {root = document.body;}
		attributeName = attributeName || BIND_ATTRIBUTE;
		// setData 시점에는 가능한 candidate를 모두 입력해도 상관없다.
//		$(root).findAll('[' + SERVICE_ATTRIBUTE +'="'+servicekey+ '"]').find('['+attributeName+']').each(function(idx, el) {
//			if($(el).parents('[data-bind*="foreach"]').length>0) {
//				return;
//			}
//			candidates.push(el);
//		});
		$(root).findAll('[' + attributeName +'*="'+SERVICE_DELIMETER+servicekey+ '"]').each(function(idx, el) {
//			if($(el).parents('[data-bind*="foreach"]').length>0) {
//				return;
//			}
			candidates.push(el);
		});
		return candidates;
	};
	
	$.alopex.getBindMapping = function (element, servicekey, attributeName) {
		attributeName = attributeName || BIND_ATTRIBUTE;
		var mapping = [];
		var attr = element.getAttribute(attributeName);
		
		var rules = $.alopex.BindParser.parseByKey(attr);
		var excludeList = [];
		for(var i=0; i<rules.length; i++) {
			if(rules[i].serviceName != servicekey) {
				rules.splice(i--, 1);
			}
		}
		return rules;
	};
	
	function generateObject(object, path, value) {
		var path_directory = path.split('.');
		var currentRef = object;
		if(path_directory.length < 1) {return false;}
		for(var i=0; i<path_directory.length-1; i++) { /* iterate from 0 to length-1 */
			var dir = path_directory[i];
			if(currentRef instanceof Array) {
				if(currentRef.length==0) {
					currentRef.push({});
				} 
				currentRef = currentRef[0];
			} else {
				if(!currentRef[dir]) {
					currentRef[dir] = {};
				}
				currentRef = currentRef[dir];
			}
		}
		
		if(typeof currentRef[path_directory[path_directory.length-1]] != typeof value) {
			currentRef[path_directory[path_directory.length-1]] = value;
		}
	}
	
	/**
	 * root 엘리먼트와 서비스 키를 주면, 
	 * root 하위의 서비스 키에 매핑된 정보를 object로 리턴해준다.
	 */
	$.alopex.getBindObject = function (servicekey, attributeName, root) {
		var object = {};
		var elements = $.alopex.getCandidates(servicekey, attributeName, root);
		for(var i=0; i<elements.length; i++) {
			var bindmap = $.alopex.getBindMapping(elements[i], servicekey);
			for(var j=0; j<bindmap.length; j++) {
				if(bindmap[j].controlName == 'foreach' || bindmap[j].controlName == 'options') {
					generateObject(object, bindmap[j].key, []); // 이 경우에 []가 존재.
				} else {
					generateObject(object, bindmap[j].key, ''); // 이 경우에 []가 존재.
				}
			}
		}
		return object;
	};
	
	$.alopex.getBindMappingList = function(servicekey, attributeName, root) {
		var object = {};
		var elements = $.alopex.getCandidates(servicekey, attributeName, root);
		for(var i=0; i<elements.length; i++) {
			var bindmap = $.alopex.getBindMapping(elements[i], servicekey);
			for(var j=0; j<bindmap.length; j++) {
				object[bindmap[j].key] = {
					element: '<__ALOPEX_ELEMENT_>' + $.alopex.util.getElementSelector(elements[i]),
					control: bindmap[j].controlName,
					service: bindmap[j].serviceName
				};
			}
		}
		return object;
	}
	
	
	/**
	 * serivce key를 주고, 그 서비스에서 parameter로 사용되는 데이터를 가져온다.
	 */
	$.alopex.getDataByService = function(servicekey, attributeName) {
		var candidates = $.alopex.getCandidates(servicekey, attributeName);
		return $.alopex.getDataFromElements(candidates, attributeName);
	};
	
	$.alopex.setDataByService = function(servicekey, data, attributeName) {
		var candidates = $.alopex.getCandidates(servicekey, attributeName);
		$.alopex.setDataOnElements(candidates, data, attributeName, servicekey);
	}
	
	// NEW API!
	$.fn.setData = function(data, serviceName, attributeName) {
		var candidates;
		attributeName = attributeName || BIND_ATTRIBUTE;
		candidates = this.findAll('[' + attributeName + ']').toArray();
		$.alopex.setDataOnElements(candidates, data, attributeName, serviceName);
		return this;
	};
	$.fn.getData = function(options, attributeName) {
		var scope = this;
		attributeName = attributeName || BIND_ATTRIBUTE;
		if(options && options.selectOptions) {
			DataBinder["options"].setting.selectOption = options.selectOptions;
		} else {
			DataBinder["options"].setting.selectOption = false;
		}
		return $.alopex.getDataFromElements(_getParsableElementInScope(scope, attributeName), attributeName);
	};
	

	/********************************************************************************************************************************
	 * 
	 * Control Functions 
	 * 
	 *********************************************************************************************************************************/
	
	var DataBinder = {};
	DataBinder["html"] = {
		data: function(element, key, value, data, rule) {
			return ($(element).html());
		},
		render: function(element, key, value, data, rule) {
			element.innerHTML = value;
		}
	};
	DataBinder["text"] = {
		data: function(element, key, value, data, rule) {
			return ($(element).text());
		},
		render: function(element, key, value, data, rule) {
			if(typeof value == 'object') {
				try{
					value = JSON.stringify(value);
				} catch(e){}
			}
			element.innerText = value;
		}
	};
	DataBinder["value"] = {
		data: function(element, key, value, data, rule) {
			return ($(element).val());
		},
		render: function(element, key, value, data, rule) {
			if(typeof value != 'undefined' && value !=null && element.value != value) {
				element.value = value;
			}
		}
	};
	DataBinder["checked"] = {
		availableValueList: {
			'y': {'true': 'y', 'false': 'n'},
			'n': {'true': 'y', 'false': 'n'},
			'yes': {'true': 'yes', 'false': 'no'},
			'no': {'true': 'yes', 'false': 'no'},
			'Y': {'true': 'Y', 'false': 'N'},
			'N': {'true': 'Y', 'false': 'N'},
			'YES': {'true': 'YES', 'false': 'NO'},
			'NO': {'true': 'YES', 'false': 'NO'},
			'0': {'true': '1', 'false': '0'},
			'1': {'true': '1', 'false': '0'},
			'true': {'true': true, 'false': false},
			'false': {'true': true, 'false': false},
			'TRUE': {'true': 'TRUE', 'false': 'FALSE'},
			'FALSE': {'true': 'TRUE', 'false': 'FALSE'}
		},
		
		data: function(element, key, value, data, rule) {
			var result;
			var valueList = DataBinder.checked.availableValueList;
			var type = $(element).attr('data-type') || element.type;
			var valueAttr = $(element).attr('value');
			var nameAttr = $(element).attr('name');
			if (type === 'checkbox') { // check 박스의 데이터
				if (nameAttr) { // 여러 체크박스가 사용되는 경우,
					//var list = document.getElementsByName(nameAttr);
					var list = $('[name="' + (nameAttr) + '"]');
					var array = [];
					for ( var i=0; i<list.length; i++) {
						if (list[i].checked) {
							array.push(list[i].value);
						}
					}
					result = array;
				} else { // 한 체크박스만 사용.
					var model = $(element).prop('data-checked-model');
					var format;
					if(valueAttr) { // 데이터가 있을 경우, input의 value를 확인.
						format = valueAttr;
					} else if(model && model[0] && model[0].get) { // 우선 현재 가지고 있는 데이틀 확인.
						format = model[0].get();
					} 
					if(format != undefined && valueList[format]) {
						result = valueList[format][element.checked];
					} else {
						// 없으면 true / false
						result = element.checked;
					}
				}
			} else { // radio case
				if(element.name) { // radio button은 name이 필수적으로 필요하지만, 없을 경우 발생하는 에러 방지.
					var radioList = $('input[name=' + element.name + ']:checked');
					if (radioList.length > 0) {
						result = $(radioList[0]).val();
					}
				}
			}
			return (result);
		},
		render: function(element, key, value, data, rule) {
			var valueList = DataBinder.checked.availableValueList;
			var truecheck = false;
			var type = $(element).attr('data-type') || element.type;
			var valueAttr = $(element).attr('value');
			if (type === 'checkbox') { // check 박스의 데이터
				if (value instanceof Array) {
					for ( var i = 0; i < value.length; i++) {
						if (element.value === value[i]) {
							truecheck = true;
							break;
						} else {
							// false
						}
					}
				} else if (typeof value === 'boolean') {
					if (value) {
						truecheck = true;
					} else {
						// false
					}
				} else if (valueAttr){ // value는 array가 아닌데, elemen
					if (valueAttr === value) {
						truecheck = true;
					} else {
						// false
					}
				} else {
					if(valueList[value] && value == valueList[value]['true']) {
						truecheck = true;
					} else {
						// false
					}
				}
			} else { // radio case
				if (element.value === value) {
					truecheck = true;
				} else {
					// false
				}
			}
			
			var parent = $(element).parent();
			
			if(truecheck) {
				element.checked = true;
				element.setAttribute('checked', true);
				
				if(parent.hasClass('ImageCheckbox') || parent.hasClass('ImageRadio')) {
					parent.addClass('Checked');
				}
			} else {
				element.checked = false;
				element.removeAttribute('checked');
				
				if(parent.hasClass('ImageCheckbox') || parent.hasClass('ImageRadio')) {
					parent.removeClass('Checked');
				}
			}
		}
	};
	DataBinder["options"] = {
		setting: {
			valueKey : undefined, // setting 변경으로 키 지정.
			textKey: undefined,
			selectOption: false
		},	
		data: function(element, key, value, data, rule) {
			var ret = [];
			if(DataBinder["options"].setting.selectOption != true) {
				return undefined;
			}
			var optionAttr;
			var valueKey = DataBinder["options"].setting.valueKey || 'value';
			var textKey = DataBinder["options"].setting.textKey || 'text';
			if(optionAttr = element.getAttribute('data-bind-option')) {
				var options = optionAttr.split(':');
				valueKey = $.trim(options[0]);
				textKey = $.trim(options[1]);
			}
			
			$(element).find('option').each(function() {
				if(!$(this).attr('data-placeholder')) {
					var obj = {};
					obj[valueKey] = $(this).attr('value');
					obj[textKey] = $(this).text();
					ret.push(obj);
				}
			});
			return ret;
		},
		render: function(element, key, value, data, rule) {
			var originElement = element; // $el.empty(); 하기 전에 기존 상태 저장
			var $el = $(element);
			var optionAttr;
			var valueKey = DataBinder["options"].setting.valueKey;
			var textKey = DataBinder["options"].setting.textKey;
			if(optionAttr = element.getAttribute('data-bind-option')) {
				var options = optionAttr.split(':');
				valueKey = $.trim(options[0]);
				textKey = $.trim(options[1]);
			}
			var prevVal = $el.val();
			$el.empty();
			if (($el.attr('data-type') == 'select' || $el.attr('data-type') == 'divselect' || $el.attr('data-type') == 'mselect') && $el.attr('data-placeholder')) {
				var text = $el.attr('data-placeholder');
				$el.setPlaceholder(text);
			}
			
			if (value != undefined) {
				for ( var i = 0; i < value.length; i++) {
					var item = value[i];
					var option = document.createElement('option');
					if (typeof item == 'string') {
						option.setAttribute('value', item);
						option.innerHTML = item;
					} else {
						// lowercase and uppercase supported.
						var _value = '';
						if(valueKey) {
							_value = item[valueKey];
						} else if(item.value) {
							_value = item.value;
						} else if(item.VALUE) {
							_value = item.VALUE;
						} else {
							
						}
						var _text = '';
						if(textKey) {
							_text = item[textKey];
						} else if(item.text) {
							_text = item.text;
						} else if(item.TEXT) {
							_text = item.TEXT;
						} 
						option.setAttribute('value', _value);
						option.innerHTML = _text;
					}
					element.appendChild(option);
				}
			}
			// "opitons 리프레쉬 이후 selectedOptions 다시 호출." [수정]
			if(originElement._waiting){
				originElement._selectedOptionsRefresh = true;
				if($.alopex.DataBinder["selectedOptions"] && $.alopex.DataBinder["selectedOptions"].render) { 
					$.alopex.DataBinder["selectedOptions"].render(originElement, key, originElement._value, data, rule);
				}
			}
			if($.fn.multiselect && $(element).is('[data-type="mselect"]')) {
				if($.alopex.util.isConverted(element)) {
					$(element).multiselect('refresh');
				}
			} else {
				// $(element).refresh(); >>>  undefined 나서 valid 추가
				if($.alopex.util.isValid($(element).refresh)) {
					$(element).refresh();
				}
			}
		}
	};
	DataBinder["selectedOptions"] = {
		data: function(element, key, value, data, rule) {
			return ($(element).val() || '');
		},
		render: function(element, key, value, data, rule) {
			if (value instanceof Array) {
				$(element).find("option").prop("selected", false);
				$.each(value, function(i, e) {
					$(element).find("option[value='" + e + "']").prop("selected", true);
				});
			} else {
				// 사용자가 임의로 getData( selectedOptions ) 하면 수행 안함
				// _waiting 중 option이 변경되면 수행됨
				if(element._waiting && !!element._selectedOptionsRefresh) {		
					element._waiting = false; // 대기중 해제
					value = element._value; // 대기중 리프래쉬 수행됨. 기선택값 있으면 선택
				}
				
				var hasValue = false;
				$(element).find("option").each(function(){
					if($(this).val() == value) {
						hasValue = true; // 옵션에 선택할 값이 있음
					}
				});

				if(hasValue){ // 있으면
					$(element).val(value);
					element._value = value;
				}else{ // 없으면
					
					// 대기중 && 리프래쉬 되었으면 대기중 아닌 상태(false)로 해준다.
					element._waiting = true; // 대기중 설정
					// option 바뀌어 selectedOptions 리프리쉬 호출 직전 true로 바꿔준다.
					element._selectedOptionsRefresh = false; // 대기중 리프래쉬 미수행됨
					element._value = value; // 리프래쉬 후 기선택값 저장
				}
				
				var $parent = $(element).parent();
				if($parent.attr('class') && $parent.attr('class').indexOf('Divselect') != -1) {
					$parent.find('span').html($(element).find("option[value='" + value + "']").text());
				}
			}
			
			if($.fn.multiselect && $(element).is('[data-type="mselect"]')) {
				if($.alopex.util.isConverted(element)) {
					$(element).multiselect('refresh');
				}
			} else {
				// $(element).refresh(); >>>  undefined 나서 valid 추가
				if($.alopex.util.isValid($(element).refresh)) {
					$(element).refresh();
				}
			}
		}
	};
	DataBinder["attr"] = {
		data: function(element, key, value, data, rule) {
			return $(element).attr(rule.subcontrolName);
		},
		render: function(element, key, value, data, rule) {
			$(element).attr(rule.subcontrolName, value);
		}
	};
	DataBinder["css"] = {
		render: function(element, key, value, data, rule) {
			$(element).css(rule.subcontrolName, value);
		},
		data: function(element, key, value, data, rule) {
			return $(element).css(rule.subcontrolName);
		}
	};
	DataBinder["visible"] = {
		render: function(element, key, value, data, rule) {
			if (value) {
				$(element).show();
			} else {
				$(element).hide();
			}
		},
		data: function(element, key, value, data, rule) {
			return (element.style.display != 'none');
		}
	};
	DataBinder["with"] = {
		render: function(element, key, value, data, rule) {
			$(element).setData(value);
		},
		data: function(element, key, value, data, rule) {
			var obj = {};
			$(element).find('> *').each(function(idx, element){
				$.extend(obj, $(element).getData());
			});
			return obj;
		}
	};
	DataBinder["foreach"] = {
		data: function(element, key, value, data, rule) {
			var child, 
				children = $(element).children(),
				list = [];
			for(var i=0; i<children.length; i++) {
				child = children[i];
				if($(child).attr('alopex-databind-template')) {
					continue;
				}
				list.push($(child).getData());
			}
			return list;
		},
		render: function(element, key, value, data, rule) {
			if(!(value instanceof Array)) {
				return ;
			}
			$(element).find('[alopex-databind-created=true]').remove();
			var template = $(element).data('databind-template');
			if (!template) {
				var controlRule = $.alopex.BindParser.parseByControl($(element).attr(BIND_ATTRIBUTE));
				if(controlRule && controlRule.template && controlRule.template.id) {
					template = $('#' + controlRule.template.id).html();
				} else {
					template = element.innerHTML;
					$(element).find('> *').attr('alopex-databind-template', 'true').hide();
				}
				$(element).data('databind-template', template);
			}
			for(var i=0; i<value.length; i++) {
				var newrow = $(template).clone()
								.attr('alopex-databind-created', 'true')
								.appendTo(element);
				newrow.find('[data-bind]').each(function() {
					var attr = this.getAttribute('data-bind');
					this.setAttribute('data-bind', attr.replace(new RegExp('\:'+key+'\.\\d+\.', 'gi'), ':'));
				});
				$(newrow).setData(value[i], rule.serviceName, BIND_ATTRIBUTE);
			}
			
			var eventObj;
			if(document.createEvent) {
				eventObj = document.createEvent('Event');
				eventObj.initEvent('dataupdate', true, true);
				eventObj.datalength = value.length;
				eventObj.perpage = 0;
				eventObj.totallength = 0;
				element.dispatchEvent(eventObj);
			} else {
				$(element).trigger('dataupdate', {
					datalength: value.length,
					perpage: 0,
					totallength: 0
				});
			}
			
		}
	};
	
	DataBinder["template"] = {
		getTemplate: function(element) {
			var $templateScript;
			var rule;
			var template = $(element).data('databind-template');
			if (!template) { // bindtemplate 넣기
				rule = $.alopex.BindParser.parseByControl($(element).attr(BIND_ATTRIBUTE));
				if(rule && rule.template) {
					$templateScript = $('#' + rule.template.name);
					if ($templateScript.length > 0) {
						template = $templateScript.html();
						$(element).data('databind-template', template);
					}
				}
			}
			return template;
		},
		render: function(element, key, value, data, rule) {
			var template = DataBinder.template.getTemplate(element);
			$(element).empty();			
			if($.alopex.util.isValid(value) && $.alopex.util.isValid(template)) {
				if (value instanceof Array) {
					if(value.length == 0) {
						;
					} else {
						for ( var i = 0; i < value.length; i++) {
							var $each = $(template).appendTo(element);
							$each.setData(value[i]);
						}
					}
				} else {
					var $each = $(template).clone().appendTo(element);
					$each.setData(value);
				}
			}
		},
		
		data: function(element, key, value, data, rule) {
			if(rule.subcontrolName != 'foreach') {
				return;
			}
			var template = DataBinder.template.getTemplate(element);
			rule = $.alopex.BindParser.parseByControl($(element).attr(BIND_ATTRIBUTE));
			if($.alopex.util.isValid(template) && rule && rule.template) {
				if (rule.template.foreach) { // return type is array
					var list = [];
					var children = element.children;
					for(var i=0; i<children.length; i++) {
						list.push($(children[i]).getData());
					}
					return list;
				} else if(rule.template){
					
				}
			}
		}
	};
	
	
	DataBinder["binder"] = {
			data: function(element, key, value, data, rule) {
				if(element && element.binder && element.binder.getBindElement) {
					var bindElement = element.binder.getBindElement();
					if(bindElement && bindElement.tagName) {
//						return $.alopex.util.getElementSelector(bindElement);
						return (bindElement);
					}
				}
				return '';
			},
			render: function(element, key, value, data, rule) {
				if(element && element.binder && element.binder.setBindElement) {
					var stage = document.body.querySelector('iframe').contentDocument;
//					if(value && stage.querySelector(value)) {
//						element.binder.setBindElement(stage.querySelector(value));
					if(value) {
						element.binder.setBindElement((value));
					} else {
						element.binder.removeBindElement();
					}
				}
			}
		};
	
	DataBinder["grid"] = {
		render: function(element, key, value, data, rule) {
			var $el = element.jquery? element: $(element);
			if (!$.alopex.util.isValid($(element).attr('data-alopexgrid')) || 
				!$.alopex.util.isValid($.fn.alopexGrid)) {
				return ;
			}
			if($.isPlainObject(value)) {
				// DOTO dataSet을 하면서 pagingObject를 넘기게 되면 이후에는 동적 페이징으로 작동한다.
				// 만일 동적 페이징을 사용하지 않고 한번에 모든 데이터를 로드하여 사용한다면
				// dataSet의 두번째 파라메터로 pagingObject를 넘기지 않는다.
				$el.alopexGrid('dataSet', 
					$.isArray(value.list) ? value.list : [], 
						$el.alopexGrid('readOption').pager? {
						current: value.currentPage,
						perPage: value.perPage,
						dataLength: value.totalLength
					}:undefined);
			} else if($.isArray(value)) {
				$el.alopexGrid('dataSet', value);
			}
		},
		
		data: function(element, key, value, data, rule) {
			// grid 체크
			var $el, list, pageinfo, griddata;
			$el = element.jquery? element: $(element);
			if (!$el.attr('data-alopexgrid')) {
				return ;
			}
			list = AlopexGrid.trimData($el.alopexGrid('dataGet'));
			if($el.alopexGrid('readOption').pager) {
				griddata = {list: list};
				pageinfo = $el.alopexGrid('pageInfo');
				if(pageinfo) {
					$.extend(griddata, {
						currentLength: list.length,
						currentPage: pageinfo.current,
						perPage: pageinfo.perPage,
						totalLength: pageinfo.dataLength
					});
				}
				griddata._griddata = true;
				return griddata; 
			} else {
				return list;
			}
			
		}
	};
	
	DataBinder.addBinder = function(name, newBinder) {
		// $a.data.control('xxx',{ ... }); 로 newBinder add 시 DataBinder[name]이 undefined이면 $.extend로 합쳐지지 않아서, 빈 객체 생성 먼저 해준다
		DataBinder[name] = {};
		$.extend(DataBinder[name], newBinder);
	};
	$.alopex.DataBinder = DataBinder;
	

	$.alopex.registerSetup('databind', function(option) {
		if(option.optionsValueKey) {
			DataBinder["options"].setting.valueKey = option.optionsValueKey;
		}
		if(option.optionsTextKey) {
			DataBinder["options"].setting.textKey = option.optionsTextKey;
		}
	});
	

}(jQuery);



/********************************************************************************************************************************
 * 
 * Compatible 
 * 
 *********************************************************************************************************************************/

!function($) {
	
	function ModelItem(key, parent) {
		this._parent = parent;
		this._key = key;
	}
	ModelItem.prototype.get = function() {
		try{
			return $(this._parent._scope).getData()[this._key];
		} catch(e) {
			return ;
		}
	};
	
	ModelItem.prototype.set = function(data) {
		var object = {};
		object[this._key] = data;
		try{
			return $(this._parent._scope).setData(object);
		} catch(e) {
		}
	};
	
	function Model(scope, data) {
		this._scope = scope;
		this._data = data;
		for(var i in data) {
			if(data.hasOwnProperty(i)) {
				this[i] = new ModelItem(i, this);
			}
		}
	}
	Model.prototype.get = function() {
		return $(this._scope).getData();
	};
	
	Model.prototype.set = function(data) {
		return $(this._scope).setData(data);
	};
	
	
	// 하위 호환성 유지를 위해 필요한 함수.
	$.alopex.databind = function(data, scope){
		scope = scope || document.body;
		$(scope).setData(data);
		return new Model(scope, data);
	};
	$.alopex.datamodel = function(){
		var scope = 'body';
		if(typeof arguments[0] == 'undefined') {
			// 아무 인자도 없을 떄.
		} else if(typeof arguments[0] == 'boolean') {
			// reset만 넣는다.
		} else {
			scope = arguments[0];
		}
		var data = $(scope).getData;
		$(scope).setData(data);
		return new Model(scope, data);
	};
	
	$.fn.alopex = function(method, value) {
		if(method === 'dataSet' || method === 'setData') {
			return $(this).setData(value);
		} else if(method === 'dataGet' || method === 'getData') {
			return $(this).getData();
		}
	};
	
	$.alopex.data = {
		bind: $.alopex.databind,
		model: $.alopex.datamodel,
		control: $.alopex.DataBinder.addBinder
	};
	
	
}(jQuery);
!function($) {
	
	var FORMATTER_ATTRIBUTE = 'data-bind-format';
	$(document).ready(function(){
		$(document.body).on('focus', '['+FORMATTER_ATTRIBUTE+']', function(e) {
			var element = e.currentTarget;
			var unformatted = $.alopex.unformat(element.value, $(element).attr(FORMATTER_ATTRIBUTE));
			element.value = unformatted;
		});
		
		$(document.body).on('blur', '['+FORMATTER_ATTRIBUTE+']', function(e) {
			var element = e.currentTarget;
			var formatted = $.alopex.format(element.value, $(element).attr(FORMATTER_ATTRIBUTE));
			element.value = formatted;
		});
	});
	
	$.alopex.format = function(text, formatterName) {
		if($.alopex.Formatter[formatterName]) {
			return $.alopex.Formatter[formatterName].toFormat(text);
		} else {
			return text;
		}
	};
	
	$.alopex.unformat = function(text, formatterName) {
//		if($.alopex.Formatter[formatterName] && $.alopex.Formatter[formatterName].validate()) {
		if($.alopex.Formatter[formatterName]) {
			return $.alopex.Formatter[formatterName].toValue(text);
		} else {
			return text;
		}
	};
	
	$.alopex.Formatter = {};
	
	/**
	 * 10000000 <-> 10,000,000
	 */
	$.alopex.Formatter.currency = {
		toFormat: function(text) {
			var splitted,
				charArray,
				i, formatted, filtered;
			filtered = text.toString().replace(/[^0-9\.]/gi, '');
			if(filtered === text.toString() && (filtered.match(/\./gi) === null || filtered.match(/\./gi).length===1)) { //
				splitted = text.toString().split('.');
				charArray = splitted[0].split('');
			} else {
				return text;
			}
			
			for(i=charArray.length-3;i>0;i-=3) {
				charArray.splice(i, 0, ',');
			}
			formatted = charArray.join('');
			if(splitted.length == 2) {
				formatted += formatted[1];
			}
			return formatted;
		},
		toValue: function(formatted) {
			return formatted.replace(new RegExp(',', 'g'), '');
		},
		validate: function(ch) {
			if (ch < 32 || ch >= 48 && ch <= 57 || ch === 127) {
				return true;
			}
			return false;
		}
	};

	/**
	 * 10000000 <-> $10,000,000
	 */
	$.alopex.Formatter.dollar = {
		toFormat: function(str) {
			if (isNaN(parseInt($.alopex.Formatter.currency.toFormat(str)))) {
				return str;
			} else {
				return '$' + $.alopex.Formatter.currency.toFormat(str);
			}
		},
		toValue: function(formatted) {
			return $.alopex.Formatter.currency.toValue(formatted.replace('$', ''));
		},
		validate: function(ch) {
			return $.alopex.Formatter.currency.validate(ch);
		}
	};
	
	$.alopex.Formatter.date = {
		normalize: function() {
			return 'yyyy/MM/dd';
		},
		toFormat: function(str) {
			if (isNaN(parseInt($.alopex.Formatter.currency.toFormat(str)))) {
				return '';
			} else {
				return '$' + $.alopex.Formatter.currency.toFormat(str);
			}
		},
		toValue: function(formatted) {
			return $.alopex.Formatter.currency.toValue(formatted.replace('$', ''));
		},
		validate: function(ch) {
			return $.alopex.Formatter.currency.validate(ch);
		}
	};
	
	$.alopex.Formatter.time = {
			toFormat: function(str) {
				if (isNaN(parseInt($.alopex.Formatter.currency.toFormat(str)))) {
					return '';
				} else {
					return '$' + $.alopex.Formatter.currency.toFormat(str);
				}
			},
			toValue: function(formatted) {
				return $.alopex.Formatter.currency.toValue(formatted.replace('$', ''));
			},
			validate: function(ch) {
				return $.alopex.Formatter.currency.validate(ch);
			}
		};
	
	
	$.alopex.addFormatter = function(formatter) {
		$.extend(true, $.alopex.Formatter, formatter);
	};
	
}(jQuery);
+function($) {
	
	function getParams(serviceId) {
		return $.alopex.datamodel('body').get();
	}

	/**
	 * data source 관련 스펙은 
	 * 
	 * request
	 * 
	 * $.alopex.databind({})
	 * 
	 * $.alopex.datasource.read(serviceId, options)  return response data
	 * $.alopex.datasource.bind(serviceId, options)  return viewmodel object
	 * $.alopex.datasource.update(serviceId, options)
	 * $.alopex.datasource.autosync(serviceId, options)    
	 * 
	 *   
	 */

	// 화면 로딩 시 서비스 로딩 정보를 읽어와서 JS 오브젝트로 들고 있다고 가정.
	//  function Service(obj) {
	//    this.successCallback = obj.success;
	//    this.errorCallback;
	//  
	//    this.requestOption;
	//    this.response; // last response string
	//    this.responseJson; // last response json object
	//  }

	function DataSource() {

		//    this.servicelist = {
		//        key1 : {
		//          "name": "request-name",
		//          "description": "",
		//          "url": "http://localhost:8080/services?id=test&name=test",
		//          "method": "GET",
		//          "headers": "",
		//          "data": "",
		//          "dataMode": "params"
		//        }
		//    };
		//  this.requestlist = {
		//  servicekey: {
		//    data: null,
		//    response : null,
		//    responseObj : null,
		//    datamodel : null
		//  }
		//};

		this.servicelist = {}; // 애는 그냥 설정정보에 있는 내용 다 가져온 것.
		this.requestlist = {}; // already requested.
	}

	DataSource.prototype.loadServiceInfo = function(path, callback) {
		// re-init
		this.servicelist = {};
		this.requestlist = {};

		var that = this;
		$.get(path, function(response) {
			var list = {};
			if (typeof response === 'string') {
				list = JSON.parse(response);
			} else if (typeof response === 'object') {
				list = (response);
			}
			$.extend(that.servicelist, list);
			if(callback && typeof callback == 'function') {
				callback();
			}
			
		});
	};

	DataSource.prototype.isCached = function(serviceId, options) {
		if (!options) {
			return false;
		}
		return (this.requestlist[serviceId] && // requestlist에 해당 서비스 id가 존재함. 
				this.requestlist[serviceId].data === options.data); // 해당 서비스 id의 param data와 동일.
	}

	/**
	 * 추후 filter & sorting 추가 기능 떄문에 제공.
	 * @params options 
	 *  {
	 *  	sucess: function type,
	 *  	error: function type,
	 *  	callback : function type
	 *  } 
	 */
	DataSource.prototype.bind = function(serviceId, options) {
		if(!options) {
			options = {};
		}
		this.successCallback = options.success;
		this.errorCallback = options.error;
		this.callback = options.complete;
		if (this.isCached(serviceId, options)) {
			var responseObj = this.requestlist[serviceId].responseObj;
			this.databinding(serviceId);
		} else {
			// 이전ㅇ
			var serviceInfo = this.servicelist[serviceId];
			if(serviceInfo) {
				
				$.extend(serviceInfo, options, {
					type: serviceInfo.method,
					complete: this._requestCallback,
					error: this._requestErrorCallback,
					success: this._requestSuccessCallback
				});
				if(serviceInfo.staticSchema) {
					serviceInfo.data = $.extend({}, serviceInfo.data, getParams(serviceId));
				}
				
				this.requestlist[serviceId] = {
					data: serviceInfo.data,
					responseText: '',
					responseObject: null
				};
				$.ajax(serviceInfo);
				$.alopex.datasource.object = this;
			}
		}
	};

	DataSource.prototype._requestSuccessCallback = function() {
		// 임시 : 수정할 것...... ㅠ
		var that = $.alopex.datasource.object;
		that.successArguments = arguments;
	};

	DataSource.prototype._requestErrorCallback = function() {
		var that = $.alopex.datasource.object;
		that.errorArguments = arguments;
	};

	DataSource.prototype._requestCallback = function(response, status) {
		var servicekey;
		for ( var i in $.alopex.datasource.servicelist) {
			var url = this.url.split('?')[0].trim();
			if ($.alopex.datasource.servicelist[i].url === url) {
				servicekey = i;
				break;
			}
		}
		var that = $.alopex.datasource.object;

		// response 받아서 this.requestlist 추가 보충.
		try {
			that.requestlist[servicekey].responseText = response.responseText;
			that.requestlist[servicekey].responseObject = JSON.parse(response.responseText);
			var list = that.databinding(servicekey);

			if (status === 'success' && that.successCallback) {
				that.successCallback.apply(this, that.successArguments);
			} else if (status != 'success' && that.errorCallback) {
				that.errorCallback.apply(this, that.errorArguments);
			}

			if (that.callback) {
				that.callback.call(this, arguments[0], arguments[1], list);
			}
		} catch (e) {
		}

	};

	/**
	 * 나중에 data-provider영역 따로 찾는걸로 바꾸기.
	 */
	DataSource.prototype.databinding = function(serviceId) {
		var that = this;
		var viewmodel;
		$candidate = $('[data-provider*="' + serviceId + '"]');
		$candidate.each(function() {
			var providerInfo = this.getAttribute('data-provider');
			var serviceKey = providerInfo.split(':')[0];
			if (serviceId === serviceKey) {
				var datamodel;
				var data;
				if (providerInfo.split(':').length === 1) {
					data = that.requestlist[serviceId].responseObject;
				} else {
					var path = providerInfo.split(':')[1];
					var paths = path.split('.');
					var data = that.requestlist[serviceId].responseObject;

					for ( var i = 0; i < paths.length; i++) {
						data = data[paths[i]];
					}
				}
				viewmodel = $.alopex.databind(data);
				$.alopex.data.servicemodel[serviceId] = viewmodel;
				if(document.createElement) {
					var e = document.createEvent('Events');
					e.initEvent('databind', true, true);
					document.dispatchEvent(e);
				} else {
					$(document).trigger('databind');
				}
				
//				
				//        viewmodels.push(datamodel);
			}
		});

		return viewmodel;
	};

	DataSource.prototype.update = function(serviceId, options, viewmodel) {
		var data = viewmodel.get();
		options.data = data;
		if (options.type) {
			options.method = options.type;
		}

		var serviceInfo = this.servicelist[serviceId];
		$.extend(serviceInfo, options);

		serviceInfo.method = "post";
		$.ajax(serviceInfo);
		$.alopex.datasource.object = this;
	};
	
	/**
	 * data-trigger 속성 정의.
	 */
	DataSource.prototype.search = function(scope) {
		if(!scope) {
			scope = 'body';
		}
		var that = this;
		$(scope).find('[data-trigger]').addBack('[data-trigger]').each(function() {
			var $this = $(this);
			var attr = $this.attr('data-trigger');
			var rule = new $.alopex.datarule(attr);
			
			for(var i in rule.object) {
				if(rule.object[i] == 'load') { // load일 경우 바로 호출.
					that.bind(i);
				} else {
					if(!$this.data('_data_trigger_' + i)) {
						$this.on(rule.object[i], function(e){
							that.bind(i);
						});
						$this.data('_data_trigger_' + i, rule.object[i]);
					}
				}
				
			}
		});
	}
	
	$.alopex.datasource = new DataSource();
//	$.alopex.datasource.loadServiceInfo('/service.json', function() {
//		$.alopex.datasource.search('body');
//	});
	
}(jQuery);
/*! Alopex UI - v2.3.1.16 - 2016-03-30
* http://ui.alopex.io
* Copyright (c) 2016 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */
/*!
* Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved.
*
* This software is the confidential and proprietary information of SK C&C.
* You shall not disclose such confidential information and shall use it
* only in accordance with the terms of the license agreement you entered into
* with SK C&C.
*
* Alopex UI Javascript Validation Plugin
*
*/
(function($, window) {
	var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i, manipulation_rcheckableType = /^(?:checkbox|radio)$/i, rCRLF = /\r?\n/g;

	function idFilterValue(param) {
		if (typeof param === "string" && param.indexOf("#") === 0){
			var $selected = $(param);
			return $selected.length ? $selected.val() : param;
		}
		return param;
	}
	var Validator = {
		defaultOption: {},
		addMethod: function(name, handler) {
			//handler : function(elem, value, param) for legacy support
			this.method[name] = function(value, param, elem) {
				return handler(elem, value, param);
			}
		},
		defineMethod: function(name, handler) {
			//handler : function(value, param, elem)
			this.method[name] = handler;
		},
		test: function(methodName, value, param) {
			var method = this.method[methodName];
			if (!$.isFunction(method)) {
				return "No such method : " + methodName;
			}
			return method(value, param);
		},
		method: { //function(extractedValue, param, elem) to support Validator.test('email', 'test@skcc.com') or something like that.
			required: function(value, param, elem) {
				if (typeof param === "string") {
					var $dep = $(param);
					var type = $dep.attr('type') || "";
					if (manipulation_rcheckableType.test(type)) {
						var name = $dep.attr('name');
						var $form = $(locateForm($dep));
						$dep = $dep.add($form.find('[name="' + name + '"]'));
					}
					var valueLength = getValueLength(extractValueFromArray(name, serializeInputs($dep)));
					if (valueLength === 0) {
						return "optional";
					}
				}
				if (isNullValue(value)) {
					if (param !== false) {
						return false;
					}
				}
				return true;
			},
			checkOnlySpace : function(value, param, elem) {
				var blank_pattern = /^\s+|\s+$/g;
				if( value.replace( blank_pattern, '' ) == "" ){
					return false;
				}else{
					return true;
				}
			},
			equalTo: function(value, param, elem) {
				return ((typeof param === "string" && param.indexOf("#") === 0) ? $(param).val() : param) === value;
			},
			minlength: function(value, param, elem) {
				return getValueLength(value) >= param;
			},
			maxlength: function(value, param, elem) {
				return getValueLength(value) <= param;
			},
			rangelength: function(value, param, elem) {
				if (!$.isArray(param)) {
					return false;
				}
				var len = getValueLength(value);
				return param[0] <= len && len <= param[1];
			},
			minblength: function(value, param, elem) {
				return getByteLength(value) >= param;
			},
			maxblength: function(value, param, elem) {
				return getByteLength(value) <= param;
			},
			rangeblength: function(value, param, elem) {
				if (!$.isArray(param)) {
					return false;
				}
				var len = getByteLength(value);
				return param[0] <= len && len <= param[1];
			},

			min: function(value, param, elem) {
				return Number(value) >= Number(param);
			},
			max: function(value, param, elem) {
				return Number(value) <= Number(param);
			},
			range: function(value, param, elem) {
				if (!$.isArray(param)) {
					return false;
				}
				return Number(param[0]) <= Number(value) && Number(value) <= Number(param[1]);
			},

			digits: function(value, param, elem) {
				return /^\s*\d+\s*$/.test(value);
			},
			number: function(value, param, elem) {
				return !isNaN(Number(value));
			},
			integer : function(value, param, elem) {
				return /^\s*(\+|-)?\d+\s*$/.test(value);
			},
			alphabet: function(value, param, elem) {
				return /^[a-zA-Z]*$/.test(value);
			},
			numalpha: function(value, param, elem) {
				return /^[0-9a-zA-Z]*$/.test(value);
			},
			nospace: function(value, param, elem) {
				return !/\s/g.test(value);
			},
			hangul: function(value, param, elem) {
				return /^[ㄱ-힣]*$/.test(value);
			},
			numhan: function(value, param, elem) {
				return /^[0-9ㄱ-힣]*$/.test(value);
			},
			email: function(value, param, elem) {
				return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value);
			},
			url: function(value, param, elem) {
				var urlreg = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
				return urlreg.test(value);
			},
			date: function(value, param, elem) {
				return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
			},
			mindate: function(value, param, elem) {
				var date = (new Date(value)).getTime();
				var from = (new Date(idFilterValue(param))).getTime();
				if (isNaN(date) || isNaN(from))
					return false;
				return from <= date;
			},
			maxdate: function(value, param, elem) {
				var date = (new Date(value)).getTime();
				var to = (new Date(idFilterValue(param))).getTime();
				if (isNaN(date) || isNaN(to))
					return false;
				return date <= to;
			},
			daterange: function(value, param, elem) {
				var isdate = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
				if (!isdate || !$.isArray(param))
					return false;
				var from = (new Date(idFilterValue(param[0]))).getTime();
				var to = (new Date(idFilterValue(param[1]))).getTime();
				var date = (new Date(value)).getTime();
				if (isNaN(from) || isNaN(to) || isNaN(date))
					return false;
				return ((from <= date) && (date <= to));
			},
			oneof: function(value, param, elem) {
				if ($.isArray(param)) {
					for (var i = 0, l = param.length; i < l; i++) {
						if (value === param[i])
							return true;
					}
				}
				return false;
			},
			phone : function(value, param, elem) {
				var regExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})?-?[0-9]{3,4}-?[0-9]{4}$/;
				return regExp.test(value);
			},
			mobile : function(value, param, elem) {
				var regExp = /^(01[016789]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
				return regExp.test(value);
			},
			decimal : function(value, param, elem) {
				var v = String(value).split(',').join('');
				if(!(!isNaN(parseFloat(v)) && isFinite(v))) {
					return false;
				}
				var trimmedval = String(v).replace(/[+\-,]/g, "");
				var llen = param[0];
				var rlen = param[1] || 0;
				var lval = trimmedval.split('.')[0];
				var rval = trimmedval.split('.')[1];
				if(llen && lval && (lval.length > (llen-rlen))) return false;
				if(rval && rval.length > rlen) return false;
				return true;
			}
		},
		defaultOption: {
			onsubmit: true,

			oninit: false,

			onkeyup: true,
			onchange: true,
			onblur: true,

			messageToLabel: false, //<label for="id" ...
			messageToDataFor: true, //<span data-for="id" ...

			validClass: null,
			invalidClass: null,
			validMessageClass: 'valid',
			invalidMessageClass: 'invalid'
		},
		message: {
			required: '반드시 입력해야 하는 항목입니다.',
			checkOnlySpace: '공백만을 입력할 수 없습니다.',
			required_select: '반드시 선택해야 하는 항목입니다.',
			minlength: '최소 {0}글자 이상 입력하십시오.',
			maxlength: '최대 {0}글자 까지 입력 가능합니다.',
			rangelength: '{0}에서 {1} 글자 사이로 입력하십시오.',
			minblength: '최소 {0}바이트 이상 입력하십시오.',
			maxblength: '최대 {0}바이트 까지 입력 가능합니다.',
			rangeblength: '{0}에서 {1} 바이트 사이로 입력하십시오.',
			min: '최소 입력가능 값은 {0}입니다.',
			max: '최대 입력가능 값은 {0}입니다.',
			range: '{0}에서 {1} 사이의 값을 입력해 주십시오.',
			email: '이메일 형식에 맞게 입력해 주십시오.',
			url: 'url 형식에 맞게 입력해 주십시오.',
			date: '날짜를 YYYY/MM/DD 또는 YYYY-MM-DD 형식에 맞게 입력해 주십시오.',
			mindate: '{0} 또는 {0} 이후의 날짜를 입력해 주십시오.',
			maxdate: '{0} 또는 {0} 이전의 날짜를 입력해 주십시오.',
			daterange: '{0}에서 {1} 사이의 날짜를 입력해 주십시오.',
			oneof: '다음중 하나의 값을 입력해 주십시오 : {param}.',
			number: '실수를 입력해 주십시오.',
			integer: '정수를 입력해 주십시오.',
			digits: '숫자만 입력 가능합니다.',
			alphabet: '알파벳만 입력 가능합니다.',
			equalTo: '{0} 값만 가능합니다.',
			numalpha: '숫자 또는 영문자만 입력 가능합니다.',
			nospace: '스페이스는 입력할 수 없습니다.',
			hangul: '한글만 입력 가능합니다.',
			numhan: '숫자 또는 한글만 입력 가능합니다.',
			phone:'대시(-)가 들어간 전화번호 형태를 입력해 주십시오.',
			mobile:'대시(-)가 들어간 휴대전화번호 형태를 입력해 주십시오.',
			decimal:'최대 {0}자리 정수, 소숫점 {1}자리까지 허용됩니다.'
		},
		setMessage: function(name, message) {
			this.message[name] = message;
		},
		mergeErrorMessage: function(messages, name) {
			function mergeArray(messageArray, name) {
				var result = "";
				name = name || messageArray.name;
				if ($.isArray(messageArray)) {
					result = name ? (name + " : ") : "";
					$.each(messageArray, function(idx, msg) {
						result += msg + " ";
					});
				}
				return result;
			}
			function mergeObject(messageObject) {
				var result = "";
				if ($.isPlainObject(messageObject)) {
					$.each(messageObject, function(name, messageArray) {
						result += mergeArray(messageArray, null) + '\n';
					});
				}
				return result;
			}
			if ($.isArray(messages)) {
				return mergeArray(messages, name);
			}
			return mergeObject(messages);
		}
	};
	var uniqueidbase = new Date().getTime() % 100;
	function generateUniqueId() {
		return "alopexvalidator" + (uniqueidbase++);
	}
	function stringify(obj, stringquote) {
		var str = "";
		if ($.isPlainObject(obj)) {
			str += "{";
			var started = false;
			for ( var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (started) {
						str += ',';
					} else {
						started = true;
					}
					str += (prop + ':');
					str += stringify(obj[prop], stringquote);
				}
			}
			str += "}";
		} else if ($.isArray(obj)) {
			var newarr = [];
			for (var i = 0; i < obj.length; i++) {
				newarr[i] = stringify(obj[i], stringquote);
			}
			str += "[" + newarr.join(',') + "]";
		} else if (typeof obj === "string") {
			var q = typeof stringquote === "string" ? stringquote : "'";
			str += q + obj + q;
		} else {
			str += obj;
		}
		return str;
	}
	function evalObjectString(str) {
		if (typeof str !== "string" || str === "" || !str)
			return null;
		var result = eval('(' + str + ')');
		return $.isPlainObject(result) ? result : null;
	}
	function getObjectProperty() {
		var args = $.makeArray(arguments);
		if (args.length <= 1 || !$.isPlainObject(args[0])) {
			return args[0];
		}
		args[1] = args[0][args[1]];
		return getObjectProperty.apply(null, args.slice(1));
	}
	function hasClass(el, name) {
		return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
	}
	function addClass(el, name) {
		if (!hasClass(el, name)) {
			el.className = el.className + (el.className ? ' ' : '') + name;
		}
	}
	function removeClass(el, name) {
		if (hasClass(el, name)) {
			el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
		}
	}

	function serializeInputs($inputs) {
		return $inputs.filter(function() {
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && /*!jQuery(this).is(":disabled") && */ rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !manipulation_rcheckableType.test(type));
		}).map(function(i, elem) {
			var val = jQuery(this).val();
			return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
				return {
					name: elem.name,
					value: val.replace(rCRLF, "\r\n")
				};
			}) : {
				name: elem.name,
				value: val.replace(rCRLF, "\r\n")
			};
		}).get();
	}
	function extractValueFromArray(name, serializedArray) {
		var value = null;
		$.each(serializedArray, function(idx, entity) {
			if (entity.name === name) {
				if (value === null) {
					value = entity.value;
				} else {
					value = $.isArray(value) ? value : [value];
					value.push(entity.value);
				}
			}
		});
		return value;
	}
	function isNullValue(value) {
		if (value === null || value === undefined || value === "") {
			return true;
		}
		return false;
	}
	function getByteLength(value) {
		if (isNullValue(value)) {
			return 0;
		}
		if (value.hasOwnProperty('length')) {
			var len = 0,ch;
			for(var i=0;ch = value.charCodeAt(i++); len += ch>>11?3:ch>>7?2:1);
			return len;
		}
		return 0;
	}
	function getValueLength(value) {
		if (isNullValue(value)) {
			return 0;
		}
		if (value.hasOwnProperty('length')) {
			return value.length || 0;
		}
		return 0;
	}
	function validate($form, $inputs, $messages, serializedArray, continueAfterFirstInvalid, returnErrorMessage) {
		var result = true;
		var errorMessage = {};

		$inputs.filter('[data-validate-rule],[data-validation-rule]').each(function(idx) {
			var input = this;
			var type = input.attributes['type'];
			var name = input.attributes['name'];
			var rule = $.extend({},
					//$.data(input,'data-validation-rule'),
					evalObjectString(input.attributes['data-validation-rule'] ? input.attributes['data-validation-rule'].value:null),
					evalObjectString(input.attributes['data-validate-rule'] ? input.attributes['data-validate-rule'].value:null));
			if($.isEmptyObject(rule)) return;
			var option = $.extend({},
					Validator.defaultOption,
					$.data(input,'data-validation-option'),
					evalObjectString(input.attributes['data-validation-option'] ? input.attributes['data-validation-option'].value:null),
					evalObjectString(input.attributes['data-validate-option'] ? input.attributes['data-validate-option'].value:null));
			var message = $.extend({},
					Validator.message,
					$.data(input,'data-validation-message'),
					evalObjectString(input.attributes['data-validation-message'] ? input.attributes['data-validation-message'].value:null),
					evalObjectString(input.attributes['data-validate-message'] ? input.attributes['data-validate-message'].value:null));
			var vname = input.attributes['data-validate-name'] || input.attributes['data-validation-name'];
			var judge = true;
			var id = input.id;

			type = type ? type.value : 'text';
			name = name ? name.value : '';

			var value = extractValueFromArray(name, serializedArray);

			for ( var methodName in rule) {
				var method = Validator.method[methodName];
				var param = rule[methodName];
				//method 자체가 없을 경우 에러메세지는 다른 양상으로 생성이 되어야 함.
				var methodTest = $.isFunction(method) ? method(value, param, input) : false;
				if (methodTest === "optional") {
					delete errorMessage[name];
					judge = true;
					break;
				}
				if (!methodTest && name && !errorMessage[name]) {
					errorMessage[name] = [];
				}

				if (!methodTest) {
					var resultMessage = message[methodName] || "";
					if ($.isFunction(resultMessage)) {
						resultMessage = resultMessage.call(input, input, param);
					} else {
						var ruleParam = $.isArray(param) ? param : [param];
						for (var i = 0; i < ruleParam.length; i++) {
							//resultMessage = resultMessage.replace('{' + i + '}', ruleParam[i]);
							resultMessage = resultMessage.split('{'+i+'}').join(idFilterValue(ruleParam[i]));
						}
						resultMessage = resultMessage.replace(/{param}/g, $.isArray(param) ? ('"' + param.join('", "') + '"') : idFilterValue(param));
						resultMessage = resultMessage.replace(/{attr:([^}]*)}/g, function(a0, a1, a2, a3) {
							return input.getAttribute(a1);
						});

					}
					resultMessage = option.title ? resultMessage.replace('{title}', option.title) : resultMessage;
					if (vname && vname.value) {
						errorMessage[name] ? (errorMessage[name].name = vname.value) : "";
					}
					errorMessage[name] ? errorMessage[name].push(resultMessage) : "";
				}
				if (methodTest === false) {
					judge = false;
					if (continueAfterFirstInvalid !== true) {
						break;
					}
				}
			}

			if (isNullValue(value)) { //값이 없는데 required가 아닌 경우 테스트결과를 반영하지 않는다.
				if (rule.required !== true && typeof rule.required !== "string") {
					judge = true;
					delete errorMessage[name];
				}
			}

			if (returnErrorMessage !== true) { //에러메세지 취합이 아닌, DOM에 결과를 반영하는 경우.
				$messages ? $messages.each(function() {
					var doit = false;
					if (option.messageToLabel && this.tagName === "LABEL" && this.attributes["for"] && this.attributes["for"].value === id) {
						doit = true;
					}
					if (option.messageToDataFor && this.attributes["data-for"] && this.attributes["data-for"].value === id) {
						doit = true;
					}
					if (doit) {
						this.innerText = continueAfterFirstInvalid === true ? (errorMessage[name] || []).join(' ') : (getObjectProperty(errorMessage, name, 0) || "");
						option.validMessageClass ? (judge ? addClass : removeClass)(this, option.validMessageClass) : "";
						option.invalidMessageClass ? (!judge ? addClass : removeClass)(this, option.invalidMessageClass) : "";
					}
				}) : "";
				if (option.validClass || option.invalidClass) {
					option.validClass ? (judge ? addClass : removeClass)(input, option.validClass) : "";
					option.invalidClass ? (!judge ? addClass : removeClass)(input, option.invalidClass) : "";
				}
			}

			if (judge === false) {
				result = false;
			}
		});
		return (returnErrorMessage === true) ? errorMessage : result;
	}
	function locateForm(elem) {
		if (elem.jquery && elem.length>0) {
			elem = elem[0];
		}
		var tagName = elem.tagName;
		while (tagName !== "FORM" && tagName !== "BODY" && tagName !== "HEAD") {
			elem = elem.parentNode;
			if (!elem) {
				return document.body;
			}
			tagName = elem.tagName;
		}
		if (tagName === "BODY" || tagName === "HEAD") {
			return document.body;
		}
		return elem;
	}
	function createNameForInputs($inputs) {
		$inputs.filter(
				function() {//name이 없는 input들에 대해서 name이 필요한지 판별하고, name을 임의로 생성하여 넣는다.
					var type = this.type;
					return !this.name && (this.attributes['data-validate-rule'] || this.attributes['data-validation-rule']) 
						&& rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) 
						&& (((this.checked || manipulation_rcheckableType.test(type)) && (this.value || this.value.length)) 
								|| !manipulation_rcheckableType.test(type) //checkable인데 값이 있거나, 아님 아예 checkable이 아니거나.
							);
				}).each(function() {
			if (!this.name) {
				this.name = generateUniqueId();
			}
		});
	}
	function addGroupInputs($form, $inputs) {
		$inputs.each(function(idx, input){
			var type = input.type;
			if (manipulation_rcheckableType.test(type)) {
				$inputs = $inputs.add($form.find('[name="' + input.name + '"]'));
			}
		});
		return $inputs;
	}

	//Validate Plugin
	$.fn.validate = function() {
		var $elem = this.eq(0);
		var $form = null;
		var $inputs = null;
		var $messages = null;
		var serializedArray = null;
		var validatePlainObject = false;
		var updateConfig = false;
		var _argc = 0;
		if ($.isPlainObject(arguments[0])) {
			updateConfig = arguments[_argc++];
		}
		var _continueAfterFirstInvalid = arguments[_argc++];
		var _returnErrorMessage = arguments[_argc++];

		if ($.isPlainObject($elem[0])) {
			validatePlainObject = $elem[0];
		}
		$form = $(locateForm($elem));

		if (validatePlainObject) {
			var vconf = validatePlainObject;
			var $inputs = $();
			$.each($elem[0], function(key, value) {
				var $input = $('<input type="hidden">');
				$input.attr('name', key).attr('value', value);
				$inputs = $inputs.add($input);
			});
		} else {
			if ($elem.prop('tagName') === "FORM") {
				$inputs = $form.map(function() {
					var elements = jQuery.prop(this, "elements");
					return jQuery.makeArray(elements);
				});
			} else if(rsubmittable.test(($elem.prop('tagName')+"").toLowerCase())){
				//form이 아닐경우, 다중선택지(input[type="checkbox"] 등)가 존재하는 요소에 대해 이들을 추가로 선택하여 더해야 한다.
				$inputs = this;
//				var type = $inputs.prop('type');
//				if (manipulation_rcheckableType.test(type)) {
//					$inputs = $inputs.add($form.find('[name="' + $inputs.attr('name') + '"]'));
//				}
			} else {
				$form = this;
				$inputs = $form.find('[data-validate-rule],[data-validation-rule]');
			}
		}
		if (updateConfig) {
			$inputs.validator(updateConfig);
		}
		$inputs = addGroupInputs($form,$inputs);
		createNameForInputs($inputs);//name이 없는 input들에 대해서 name이 필요한지 판별하고, name을 임의로 생성하여 넣는다.
		serializedArray = serializeInputs($inputs);
		$messages = $form.find('[for], [data-for]');
		var returnValue = validate($form, $inputs, $messages, serializedArray, _continueAfterFirstInvalid, _returnErrorMessage);
		if (_returnErrorMessage === true && $elem.prop('tagName') !== 'FORM' && $elem.prop('name')) {
			returnValue = returnValue[$elem.prop('name')] || null;
		}
		return returnValue;
	};

	//Validator Plugin
	$.fn.validator = function(config) {
		var $targets = this;
		var $form = locateForm(this);
		var isFormConfig = false;
		if (this.prop('tagName') === 'FORM') {
			$targets = $targets.add($($.makeArray(this.prop("elements"))));
			isFormConfig = true;
		}
		$targets.each(function() {
			var $this = $(this);
			var isForm = (this.tagName === "FORM");
			var type = $this.attr('type');
			var name = $this.attr('name');

			if ($.isPlainObject(config) && !$.isEmptyObject(config)) {//configuration update
				if (!isForm) {
					var updatedRule = $.extend({}, 
							evalObjectString($this.attr('data-validation-rule')),
							evalObjectString($this.attr('data-validate-rule')),
							getObjectProperty(config, 'rule'), 
							getObjectProperty(config, 'elements', name, 'rule')
							);
					var updatedMessage = $.extend({}, 
							$this.data('data-validation-message'),
							evalObjectString($this.attr('data-validation-message')),
							evalObjectString($this.attr('data-validate-message')),
							getObjectProperty(config, 'message'), 
							getObjectProperty(config, 'elements', name,'message')
							);
					if(!$.isEmptyObject(updatedRule)){
						$this.attr('data-validation-rule', stringify(updatedRule)).removeAttr('data-validate-rule');
					}
					if(!$.isEmptyObject(updatedMessage)) {
						//$this.attr('data-validation-message', stringify(updatedMessage)).removeAttr('data-validate-message');
						$this.data('data-validation-message', updatedMessage).removeAttr('data-validate-message').removeAttr('data-validation-message');
					}
				}
				var updatedOption = $.extend({}, 
						$this.data('data-validation-option'),
						evalObjectString($this.attr('data-validation-option')),
						evalObjectString($this.attr('data-validate-option')), 
						!isForm && isFormConfig ? null : getObjectProperty(config, 'option'), 
						getObjectProperty(config, 'elements', name, 'option')
						);
				if(!$.isEmptyObject(updatedOption)) { 
					//$this.attr('data-validation-option', stringify(updatedOption)).removeAttr('data-validate-option');
					$this.data('data-validation-option', updatedOption).removeAttr('data-validate-option').removeAttr('data-validation-option');
				}
			}

			var rule = $.extend({}, 
					$this.data('data-validation-rule'),
					evalObjectString($this.attr('data-validation-rule')), 
					evalObjectString($this.attr('data-validate-rule'))
					);
			var option = $.extend({},
					Validator.defaultOption,
					$this.data('data-validation-option'),
					evalObjectString($this.attr('data-validation-option')),
					evalObjectString($this.attr('data-validate-option'))
					);
			var message = $.extend({},
					Validator.message,
					$this.data('data-validation-message'),
					evalObjectString($this.attr('data-validation-message')),
					evalObjectString($this.attr('data-validate-message'))
					);
			//config.rule, config.message, config.option
			//isForm ? config.elements, config.option
			if (isForm) {
				$this.off('.alopexvalidatorFormSubmit')
				if (option.onsubmit) {
					$this.on('submit.alopexvalidatorFormSubmit', option.submitHandler || function(e) {
						if (!$(this).validate()) {
							e.preventDefault();
						}
					});
				}
			} else {
				if (typeof rule.required === "string" && rule.required.indexOf('#') === 0) {
					//ID selector required로 되어있던 input의 rule.required값을 변경할 경우 의존하고 있는 엘리먼트가 변경될 때
					//의존중인 엘리먼트의 rule.required값을 확인하여 계속 의존하고 있지 않을경우 데이터를 삭제하도록 한다.
					var $requiredElem = $(rule.required);
					$requiredElem.data('alopexvalidatorDependency', $this.add($requiredElem.data('alopexvalidatorDependency')));
				}

				$this.off('.alopexvalidatorInputChange');
				var events = [];
				if (option['onkeyup']) {
					option['onclick'] = true;
				}
				$.each(['onkeyup', 'onchange', 'onblur', 'onclick'], function(idx, eventname) {
					if (option[eventname]) {
						events.push(eventname.split('on')[1] + '.alopexvalidatorInputChange');
					}
				});
				if (events.length) {
					$this.on(events.join(' '), function(e) {
						var $eventthis = $(this);
						setTimeout(function() {
							//check의 경우 포커스를 잃기 전까지 값이 바뀌지 않는다.
							//http://stackoverflow.com/questions/4471401/getting-value-of-html-checkbox-from-onclick-onchange-events
							$eventthis.validate();
							//다른 input이 이 input을 required로 지정했을때의 처리
							var $dep = $eventthis.data('alopexvalidatorDependency');
							if ($dep) {
								var dependencyRule = $.extend({},
										evalObjectString($dep.attr('data-validation-rule')),
										evalObjectString($dep.attr('data-validate-rule')));
								var dependencyValid = $.isPlainObject(dependencyRule) && (dependencyRule.required === ('#' + $eventthis.prop('id')));
								if (dependencyValid) {
									$dep.validate();
								} else {
									var $data = $requiredElem.data('alopexvalidatorDependency');
									if ($data && $data.jquery) {
										$data = $data.remove('#' + $eventthis.prop('id'));
									}
									if (!$data || !$data.length) {
										$eventthis.removeData('alopexvalidatorDependency');
									}
								}
							}
						}, 0);
					});
				}
			}

			if (option.oninit || getObjectProperty(config, 'oninit')) {
				setTimeout(function() {
					$this.validate();
				}, 0);
			}
			//TODO javascript config를 checkbox 등에 적용하는 경우 attribute가 동일 name input에 모두 생성이 된다.
			//이에 대한 대책은?
		});
		return this;
	};
	var _getErrorMessageConflict = $.fn.getErrorMessage;
	$.fn.getErrorMessage = function() {
		if (_getErrorMessageConflict) {
			var _runPrev = true;
			var $targets = this;
			if ($targets.prop('elements')) {
				$targets = $targets.add($($.makeArray($targets.prop('elements'))));
			}
			$targets.each(function() {
				if (this.attributes['data-validate-rule'] || this.attributes['data-validation-rule']) {
					_runPrev = false;
					return false;
				}
			});
			if (_runPrev) {
				return _getErrorMessageConflict.apply(this, arguments);
			}
		}
		return this.validate(true, true);
	};
	//  $(function() {
	//    $('[data-validate-option]').validator();
	//  })
	window.Validator = Validator;
})(jQuery, window);