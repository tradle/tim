(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("prop-types"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "prop-types"], factory);
	else if(typeof exports === 'object')
		exports["VictorySunburst"] = factory(require("react"), require("prop-types"));
	else
		root["VictorySunburst"] = factory(root["React"], root["PropTypes"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_48__, __WEBPACK_EXTERNAL_MODULE_49__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports,"__esModule",{value:true});exports.VictorySunburst=undefined;var _victorySunburst=__webpack_require__(1);var _victorySunburst2=_interopRequireDefault(_victorySunburst);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}exports.

	VictorySunburst=_victorySunburst2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports,"__esModule",{value:true});var _partialRight2=__webpack_require__(2);var _partialRight3=_interopRequireDefault(_partialRight2);var _jsxFileName="/Users/Ellen/victory-sunburst/src/components/victory-sunburst.js";var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();
	var _react=__webpack_require__(48);var _react2=_interopRequireDefault(_react);
	var _propTypes=__webpack_require__(49);var _propTypes2=_interopRequireDefault(_propTypes);

	var _victoryCore=__webpack_require__(50);



	var _helperMethods=__webpack_require__(269);var _helperMethods2=_interopRequireDefault(_helperMethods);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

	var fallbackProps={
	colorScale:[
	"#ffffff",
	"#f0f0f0",
	"#d9d9d9",
	"#bdbdbd",
	"#969696",
	"#737373",
	"#525252",
	"#252525",
	"#000000"],

	height:400,
	padding:20,
	style:{
	data:{cursor:"pointer",stroke:"white"},
	labels:{fill:"white",textAnchor:"middle",verticalAnchor:"middle"}},

	width:400};


	var animationWhitelist=[
	"data","height","padding","colorScale","style","width"];var


	VictorySunburst=function(_React$Component){_inherits(VictorySunburst,_React$Component);function VictorySunburst(){_classCallCheck(this,VictorySunburst);return _possibleConstructorReturn(this,(VictorySunburst.__proto__||Object.getPrototypeOf(VictorySunburst)).apply(this,arguments));}_createClass(VictorySunburst,[{key:"renderSunburstData",value:function renderSunburstData(














































































































































	props){var
	displayRoot=props.displayRoot,dataComponent=props.dataComponent,labelComponent=props.labelComponent;
	var dataComponents=[];
	var labelComponents=[];

	for(var index=0,len=this.dataKeys.length;index<len;index++){
	var dataProps=this.getComponentProps(dataComponent,"data",index);
	dataComponents[index]=_react2.default.cloneElement(dataComponent,dataProps);

	var labelProps=this.getComponentProps(labelComponent,"labels",index);
	if(labelProps&&labelProps.text!==undefined&&labelProps.text!==null){
	labelComponents[index]=_react2.default.cloneElement(
	labelComponent,_extends({},labelProps,{renderInPortal:false}));

	}
	}

	if(!displayRoot){
	dataComponents[0]=_react2.default.cloneElement(dataComponents[0],{
	style:{visibility:"hidden"}});

	}

	var children=[].concat(dataComponents,labelComponents);
	return this.renderGroup(props,children);
	}},{key:"renderGroup",value:function renderGroup(

	props,children){
	var offset=this.getOffset(props);
	var transform="translate("+offset.x+", "+offset.y+")";
	var groupComponent=_react2.default.cloneElement(props.groupComponent,{transform:transform});
	return this.renderContainer(groupComponent,children);
	}},{key:"getOffset",value:function getOffset(

	props){var
	height=props.height,width=props.width;var _baseProps$parent=
	this.baseProps.parent,padding=_baseProps$parent.padding,radius=_baseProps$parent.radius;
	var offsetWidth=width/2+padding.left-padding.right;
	var offsetHeight=height/2+padding.top-padding.bottom;
	return{
	x:offsetWidth+radius>width?radius+padding.left-padding.right:offsetWidth,
	y:offsetHeight+radius>height?radius+padding.top-padding.bottom:offsetHeight};

	}},{key:"shouldAnimate",value:function shouldAnimate()

	{
	return Boolean(this.props.animate);
	}},{key:"render",value:function render()

	{var
	role=this.constructor.role;
	var props=_helperMethods2.default.modifyProps(this.props,fallbackProps,role);

	if(this.shouldAnimate()){
	return this.animateComponent(props,animationWhitelist);
	}

	var children=this.renderSunburstData(props);
	return props.standalone?this.renderContainer(props.containerComponent,children):children;
	}}]);return VictorySunburst;}(_react2.default.Component);VictorySunburst.displayName="VictorySunburst";VictorySunburst.role="sunburst";VictorySunburst.defaultTransitions={onExit:{duration:500,before:function before(){}},onEnter:{duration:500,before:function before(){},after:function after(){}}};VictorySunburst.propTypes={animate:_propTypes2.default.object,colorScale:_propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.string),_propTypes2.default.oneOf(["grayscale","qualitative","heatmap","warm","cool","red","green","blue"])]),containerComponent:_propTypes2.default.element,data:_propTypes2.default.object,dataComponent:_propTypes2.default.element,displayRoot:_propTypes2.default.bool,eventKey:_propTypes2.default.oneOfType([_propTypes2.default.func,_victoryCore.PropTypes.allOfType([_victoryCore.PropTypes.integer,_victoryCore.PropTypes.nonNegative]),_propTypes2.default.string]),events:_propTypes2.default.arrayOf(_propTypes2.default.shape({target:_propTypes2.default.oneOf(["data","labels","parent"]),eventKey:_propTypes2.default.oneOfType([_propTypes2.default.func,_victoryCore.PropTypes.allOfType([_victoryCore.PropTypes.integer,_victoryCore.PropTypes.nonNegative]),_propTypes2.default.string]),eventHandlers:_propTypes2.default.object})),groupComponent:_propTypes2.default.element,height:_victoryCore.PropTypes.nonNegative,labelComponent:_propTypes2.default.element,labels:_propTypes2.default.oneOfType([_propTypes2.default.func,_propTypes2.default.array]),minRadians:_victoryCore.PropTypes.nonNegative,name:_propTypes2.default.string,padding:_propTypes2.default.oneOfType([_propTypes2.default.number,_propTypes2.default.shape({top:_propTypes2.default.number,bottom:_propTypes2.default.number,left:_propTypes2.default.number,right:_propTypes2.default.number})]),sharedEvents:_propTypes2.default.shape({events:_propTypes2.default.array,getEventState:_propTypes2.default.func}),sortData:_propTypes2.default.oneOfType([_propTypes2.default.bool,_propTypes2.default.func]),standalone:_propTypes2.default.bool,style:_propTypes2.default.shape({parent:_propTypes2.default.object,data:_propTypes2.default.object,labels:_propTypes2.default.object}),sumBy:_propTypes2.default.oneOf(["count","size"]),theme:_propTypes2.default.object,width:_victoryCore.PropTypes.nonNegative,x:_propTypes2.default.number,y:_propTypes2.default.number};VictorySunburst.defaultProps={colorScale:"grayscale",containerComponent:_react2.default.createElement(_victoryCore.VictoryContainer,{__source:{fileName:_jsxFileName,lineNumber:110}}),data:{name:"A",children:[{name:"A1",size:5},{name:"A2",children:[{name:"A2a",size:4},{name:"A2b",children:[{name:"A2b1",size:4},{name:"A2b2",size:4}]}]},{name:"A3",children:[{name:"A3a",size:3},{name:"A3b",size:5}]},{name:"A4",children:[{name:"A4a",children:[{name:"A44a",size:3},{name:"A44b",size:3},{name:"A44c",size:3},{name:"A44d",size:3},{name:"A44e",children:[{name:"A54a",size:3},{name:"A54b",size:3},{name:"A54c",size:3},{name:"A54d",size:3}]}]}]},{name:"A4b",size:5}]},dataComponent:_react2.default.createElement(_victoryCore.Slice,{__source:{fileName:_jsxFileName,lineNumber:159}}),displayRoot:false,groupComponent:_react2.default.createElement("g",{__source:{fileName:_jsxFileName,lineNumber:161}}),labelComponent:_react2.default.createElement(_victoryCore.VictoryLabel,{__source:{fileName:_jsxFileName,lineNumber:162}}),minRadians:0.01,sortData:false,standalone:true,sumBy:"size",x:0,y:0};VictorySunburst.getBaseProps=(0,_partialRight3.default)(_helperMethods2.default.getBaseProps.bind(_helperMethods2.default),fallbackProps);VictorySunburst.expectedComponents=["containerComponent","dataComponent","groupComponent","labelComponent"];exports.default=


	(0,_victoryCore.addEvents)(VictorySunburst);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(3),
	    createWrap = __webpack_require__(13),
	    getHolder = __webpack_require__(39),
	    replaceHolders = __webpack_require__(43);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_PARTIAL_RIGHT_FLAG = 64;

	/**
	 * This method is like `_.partial` except that partially applied arguments
	 * are appended to the arguments it receives.
	 *
	 * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
	 * builds, may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** This method doesn't set the "length" property of partially
	 * applied functions.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.0.0
	 * @category Function
	 * @param {Function} func The function to partially apply arguments to.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new partially applied function.
	 * @example
	 *
	 * function greet(greeting, name) {
	 *   return greeting + ' ' + name;
	 * }
	 *
	 * var greetFred = _.partialRight(greet, 'fred');
	 * greetFred('hi');
	 * // => 'hi fred'
	 *
	 * // Partially applied with placeholders.
	 * var sayHelloTo = _.partialRight(greet, 'hello', _);
	 * sayHelloTo('fred');
	 * // => 'hello fred'
	 */
	var partialRight = baseRest(function(func, partials) {
	  var holders = replaceHolders(partials, getHolder(partialRight));
	  return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
	});

	// Assign default placeholders.
	partialRight.placeholder = {};

	module.exports = partialRight;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(4),
	    overRest = __webpack_require__(5),
	    setToString = __webpack_require__(7);

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}

	module.exports = baseRest;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(6);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}

	module.exports = overRest;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	module.exports = apply;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var baseSetToString = __webpack_require__(8),
	    shortOut = __webpack_require__(12);

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = shortOut(baseSetToString);

	module.exports = setToString;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var constant = __webpack_require__(9),
	    defineProperty = __webpack_require__(10),
	    identity = __webpack_require__(4);

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString = !defineProperty ? identity : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};

	module.exports = baseSetToString;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function() {
	    return value;
	  };
	}

	module.exports = constant;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11);

	var defineProperty = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	module.exports = defineProperty;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	module.exports = getValue;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	    HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut(func) {
	  var count = 0,
	      lastCalled = 0;

	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);

	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}

	module.exports = shortOut;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(14),
	    createBind = __webpack_require__(15),
	    createCurry = __webpack_require__(21),
	    createHybrid = __webpack_require__(22),
	    createPartial = __webpack_require__(44),
	    getData = __webpack_require__(45),
	    mergeData = __webpack_require__(46),
	    setData = __webpack_require__(28),
	    setWrapToString = __webpack_require__(29),
	    toInteger = __webpack_require__(47);

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that either curries or invokes `func` with optional
	 * `this` binding and partially applied arguments.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to wrap.
	 * @param {number} bitmask The bitmask flags.
	 *    1 - `_.bind`
	 *    2 - `_.bindKey`
	 *    4 - `_.curry` or `_.curryRight` of a bound function
	 *    8 - `_.curry`
	 *   16 - `_.curryRight`
	 *   32 - `_.partial`
	 *   64 - `_.partialRight`
	 *  128 - `_.rearg`
	 *  256 - `_.ary`
	 *  512 - `_.flip`
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to be partially applied.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	  var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
	  if (!isBindKey && typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var length = partials ? partials.length : 0;
	  if (!length) {
	    bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
	    partials = holders = undefined;
	  }
	  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
	  arity = arity === undefined ? arity : toInteger(arity);
	  length -= holders ? holders.length : 0;

	  if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
	    var partialsRight = partials,
	        holdersRight = holders;

	    partials = holders = undefined;
	  }
	  var data = isBindKey ? undefined : getData(func);

	  var newData = [
	    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
	    argPos, ary, arity
	  ];

	  if (data) {
	    mergeData(newData, data);
	  }
	  func = newData[0];
	  bitmask = newData[1];
	  thisArg = newData[2];
	  partials = newData[3];
	  holders = newData[4];
	  arity = newData[9] = newData[9] === undefined
	    ? (isBindKey ? 0 : func.length)
	    : nativeMax(newData[9] - length, 0);

	  if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
	    bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
	  }
	  if (!bitmask || bitmask == WRAP_BIND_FLAG) {
	    var result = createBind(func, bitmask, thisArg);
	  } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
	    result = createCurry(func, bitmask, arity);
	  } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
	    result = createPartial(func, bitmask, thisArg, partials);
	  } else {
	    result = createHybrid.apply(undefined, newData);
	  }
	  var setter = data ? baseSetData : setData;
	  return setWrapToString(setter(result, newData), func, bitmask);
	}

	module.exports = createWrap;


/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var createCtor = __webpack_require__(16),
	    root = __webpack_require__(19);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1;

	/**
	 * Creates a function that wraps `func` to invoke it with the optional `this`
	 * binding of `thisArg`.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createBind(func, bitmask, thisArg) {
	  var isBind = bitmask & WRAP_BIND_FLAG,
	      Ctor = createCtor(func);

	  function wrapper() {
	    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	    return fn.apply(isBind ? thisArg : this, arguments);
	  }
	  return wrapper;
	}

	module.exports = createBind;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(17),
	    isObject = __webpack_require__(18);

	/**
	 * Creates a function that produces an instance of `Ctor` regardless of
	 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	 *
	 * @private
	 * @param {Function} Ctor The constructor to wrap.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createCtor(Ctor) {
	  return function() {
	    // Use a `switch` statement to work with class constructors. See
	    // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
	    // for more details.
	    var args = arguments;
	    switch (args.length) {
	      case 0: return new Ctor;
	      case 1: return new Ctor(args[0]);
	      case 2: return new Ctor(args[0], args[1]);
	      case 3: return new Ctor(args[0], args[1], args[2]);
	      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
	      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
	      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
	      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	    }
	    var thisBinding = baseCreate(Ctor.prototype),
	        result = Ctor.apply(thisBinding, args);

	    // Mimic the constructor's `return` behavior.
	    // See https://es5.github.io/#x13.2.2 for more details.
	    return isObject(result) ? result : thisBinding;
	  };
	}

	module.exports = createCtor;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18);

	/** Built-in value references. */
	var objectCreate = Object.create;

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} proto The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function object() {}
	  return function(proto) {
	    if (!isObject(proto)) {
	      return {};
	    }
	    if (objectCreate) {
	      return objectCreate(proto);
	    }
	    object.prototype = proto;
	    var result = new object;
	    object.prototype = undefined;
	    return result;
	  };
	}());

	module.exports = baseCreate;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(20);

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	module.exports = root;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	module.exports = freeGlobal;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(6),
	    createCtor = __webpack_require__(16),
	    createHybrid = __webpack_require__(22),
	    createRecurry = __webpack_require__(26),
	    getHolder = __webpack_require__(39),
	    replaceHolders = __webpack_require__(43),
	    root = __webpack_require__(19);

	/**
	 * Creates a function that wraps `func` to enable currying.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {number} arity The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createCurry(func, bitmask, arity) {
	  var Ctor = createCtor(func);

	  function wrapper() {
	    var length = arguments.length,
	        args = Array(length),
	        index = length,
	        placeholder = getHolder(wrapper);

	    while (index--) {
	      args[index] = arguments[index];
	    }
	    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
	      ? []
	      : replaceHolders(args, placeholder);

	    length -= holders.length;
	    if (length < arity) {
	      return createRecurry(
	        func, bitmask, createHybrid, wrapper.placeholder, undefined,
	        args, holders, undefined, undefined, arity - length);
	    }
	    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	    return apply(fn, this, args);
	  }
	  return wrapper;
	}

	module.exports = createCurry;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var composeArgs = __webpack_require__(23),
	    composeArgsRight = __webpack_require__(24),
	    countHolders = __webpack_require__(25),
	    createCtor = __webpack_require__(16),
	    createRecurry = __webpack_require__(26),
	    getHolder = __webpack_require__(39),
	    reorder = __webpack_require__(40),
	    replaceHolders = __webpack_require__(43),
	    root = __webpack_require__(19);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_ARY_FLAG = 128,
	    WRAP_FLIP_FLAG = 512;

	/**
	 * Creates a function that wraps `func` to invoke it with optional `this`
	 * binding of `thisArg`, partial application, and currying.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to prepend to those provided to
	 *  the new function.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [partialsRight] The arguments to append to those provided
	 *  to the new function.
	 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	  var isAry = bitmask & WRAP_ARY_FLAG,
	      isBind = bitmask & WRAP_BIND_FLAG,
	      isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
	      isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
	      isFlip = bitmask & WRAP_FLIP_FLAG,
	      Ctor = isBindKey ? undefined : createCtor(func);

	  function wrapper() {
	    var length = arguments.length,
	        args = Array(length),
	        index = length;

	    while (index--) {
	      args[index] = arguments[index];
	    }
	    if (isCurried) {
	      var placeholder = getHolder(wrapper),
	          holdersCount = countHolders(args, placeholder);
	    }
	    if (partials) {
	      args = composeArgs(args, partials, holders, isCurried);
	    }
	    if (partialsRight) {
	      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
	    }
	    length -= holdersCount;
	    if (isCurried && length < arity) {
	      var newHolders = replaceHolders(args, placeholder);
	      return createRecurry(
	        func, bitmask, createHybrid, wrapper.placeholder, thisArg,
	        args, newHolders, argPos, ary, arity - length
	      );
	    }
	    var thisBinding = isBind ? thisArg : this,
	        fn = isBindKey ? thisBinding[func] : func;

	    length = args.length;
	    if (argPos) {
	      args = reorder(args, argPos);
	    } else if (isFlip && length > 1) {
	      args.reverse();
	    }
	    if (isAry && ary < length) {
	      args.length = ary;
	    }
	    if (this && this !== root && this instanceof wrapper) {
	      fn = Ctor || createCtor(fn);
	    }
	    return fn.apply(thisBinding, args);
	  }
	  return wrapper;
	}

	module.exports = createHybrid;


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates an array that is the composition of partially applied arguments,
	 * placeholders, and provided arguments into a single array of arguments.
	 *
	 * @private
	 * @param {Array} args The provided arguments.
	 * @param {Array} partials The arguments to prepend to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @params {boolean} [isCurried] Specify composing for a curried function.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgs(args, partials, holders, isCurried) {
	  var argsIndex = -1,
	      argsLength = args.length,
	      holdersLength = holders.length,
	      leftIndex = -1,
	      leftLength = partials.length,
	      rangeLength = nativeMax(argsLength - holdersLength, 0),
	      result = Array(leftLength + rangeLength),
	      isUncurried = !isCurried;

	  while (++leftIndex < leftLength) {
	    result[leftIndex] = partials[leftIndex];
	  }
	  while (++argsIndex < holdersLength) {
	    if (isUncurried || argsIndex < argsLength) {
	      result[holders[argsIndex]] = args[argsIndex];
	    }
	  }
	  while (rangeLength--) {
	    result[leftIndex++] = args[argsIndex++];
	  }
	  return result;
	}

	module.exports = composeArgs;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * This function is like `composeArgs` except that the arguments composition
	 * is tailored for `_.partialRight`.
	 *
	 * @private
	 * @param {Array} args The provided arguments.
	 * @param {Array} partials The arguments to append to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @params {boolean} [isCurried] Specify composing for a curried function.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgsRight(args, partials, holders, isCurried) {
	  var argsIndex = -1,
	      argsLength = args.length,
	      holdersIndex = -1,
	      holdersLength = holders.length,
	      rightIndex = -1,
	      rightLength = partials.length,
	      rangeLength = nativeMax(argsLength - holdersLength, 0),
	      result = Array(rangeLength + rightLength),
	      isUncurried = !isCurried;

	  while (++argsIndex < rangeLength) {
	    result[argsIndex] = args[argsIndex];
	  }
	  var offset = argsIndex;
	  while (++rightIndex < rightLength) {
	    result[offset + rightIndex] = partials[rightIndex];
	  }
	  while (++holdersIndex < holdersLength) {
	    if (isUncurried || argsIndex < argsLength) {
	      result[offset + holders[holdersIndex]] = args[argsIndex++];
	    }
	  }
	  return result;
	}

	module.exports = composeArgsRight;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	/**
	 * Gets the number of `placeholder` occurrences in `array`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} placeholder The placeholder to search for.
	 * @returns {number} Returns the placeholder count.
	 */
	function countHolders(array, placeholder) {
	  var length = array.length,
	      result = 0;

	  while (length--) {
	    if (array[length] === placeholder) {
	      ++result;
	    }
	  }
	  return result;
	}

	module.exports = countHolders;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var isLaziable = __webpack_require__(27),
	    setData = __webpack_require__(28),
	    setWrapToString = __webpack_require__(29);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_BOUND_FLAG = 4,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64;

	/**
	 * Creates a function that wraps `func` to continue currying.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {Function} wrapFunc The function to create the `func` wrapper.
	 * @param {*} placeholder The placeholder value.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to prepend to those provided to
	 *  the new function.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
	  var isCurry = bitmask & WRAP_CURRY_FLAG,
	      newHolders = isCurry ? holders : undefined,
	      newHoldersRight = isCurry ? undefined : holders,
	      newPartials = isCurry ? partials : undefined,
	      newPartialsRight = isCurry ? undefined : partials;

	  bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
	  bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

	  if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
	    bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
	  }
	  var newData = [
	    func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
	    newHoldersRight, argPos, ary, arity
	  ];

	  var result = wrapFunc.apply(undefined, newData);
	  if (isLaziable(func)) {
	    setData(result, newData);
	  }
	  result.placeholder = placeholder;
	  return setWrapToString(result, func, bitmask);
	}

	module.exports = createRecurry;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 28 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	var getWrapDetails = __webpack_require__(30),
	    insertWrapDetails = __webpack_require__(31),
	    setToString = __webpack_require__(7),
	    updateWrapDetails = __webpack_require__(32);

	/**
	 * Sets the `toString` method of `wrapper` to mimic the source of `reference`
	 * with wrapper details in a comment at the top of the source body.
	 *
	 * @private
	 * @param {Function} wrapper The function to modify.
	 * @param {Function} reference The reference function.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @returns {Function} Returns `wrapper`.
	 */
	function setWrapToString(wrapper, reference, bitmask) {
	  var source = (reference + '');
	  return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
	}

	module.exports = setWrapToString;


/***/ }),
/* 30 */
/***/ (function(module, exports) {

	/** Used to match wrap detail comments. */
	var reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
	    reSplitDetails = /,? & /;

	/**
	 * Extracts wrapper details from the `source` body comment.
	 *
	 * @private
	 * @param {string} source The source to inspect.
	 * @returns {Array} Returns the wrapper details.
	 */
	function getWrapDetails(source) {
	  var match = source.match(reWrapDetails);
	  return match ? match[1].split(reSplitDetails) : [];
	}

	module.exports = getWrapDetails;


/***/ }),
/* 31 */
/***/ (function(module, exports) {

	/** Used to match wrap detail comments. */
	var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;

	/**
	 * Inserts wrapper `details` in a comment at the top of the `source` body.
	 *
	 * @private
	 * @param {string} source The source to modify.
	 * @returns {Array} details The details to insert.
	 * @returns {string} Returns the modified source.
	 */
	function insertWrapDetails(source, details) {
	  var length = details.length;
	  if (!length) {
	    return source;
	  }
	  var lastIndex = length - 1;
	  details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
	  details = details.join(length > 2 ? ', ' : ' ');
	  return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
	}

	module.exports = insertWrapDetails;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(33),
	    arrayIncludes = __webpack_require__(34);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64,
	    WRAP_ARY_FLAG = 128,
	    WRAP_REARG_FLAG = 256,
	    WRAP_FLIP_FLAG = 512;

	/** Used to associate wrap methods with their bit flags. */
	var wrapFlags = [
	  ['ary', WRAP_ARY_FLAG],
	  ['bind', WRAP_BIND_FLAG],
	  ['bindKey', WRAP_BIND_KEY_FLAG],
	  ['curry', WRAP_CURRY_FLAG],
	  ['curryRight', WRAP_CURRY_RIGHT_FLAG],
	  ['flip', WRAP_FLIP_FLAG],
	  ['partial', WRAP_PARTIAL_FLAG],
	  ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
	  ['rearg', WRAP_REARG_FLAG]
	];

	/**
	 * Updates wrapper `details` based on `bitmask` flags.
	 *
	 * @private
	 * @returns {Array} details The details to modify.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @returns {Array} Returns `details`.
	 */
	function updateWrapDetails(details, bitmask) {
	  arrayEach(wrapFlags, function(pair) {
	    var value = '_.' + pair[0];
	    if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
	      details.push(value);
	    }
	  });
	  return details.sort();
	}

	module.exports = updateWrapDetails;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(35);

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	module.exports = arrayIncludes;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(36),
	    baseIsNaN = __webpack_require__(37),
	    strictIndexOf = __webpack_require__(38);

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  return value === value
	    ? strictIndexOf(array, value, fromIndex)
	    : baseFindIndex(array, baseIsNaN, fromIndex);
	}

	module.exports = baseIndexOf;


/***/ }),
/* 36 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = baseFindIndex;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}

	module.exports = baseIsNaN;


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = strictIndexOf;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

	/**
	 * Gets the argument placeholder value for `func`.
	 *
	 * @private
	 * @param {Function} func The function to inspect.
	 * @returns {*} Returns the placeholder value.
	 */
	function getHolder(func) {
	  var object = func;
	  return object.placeholder;
	}

	module.exports = getHolder;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var copyArray = __webpack_require__(41),
	    isIndex = __webpack_require__(42);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;

	/**
	 * Reorder `array` according to the specified indexes where the element at
	 * the first index is assigned as the first element, the element at
	 * the second index is assigned as the second element, and so on.
	 *
	 * @private
	 * @param {Array} array The array to reorder.
	 * @param {Array} indexes The arranged array indexes.
	 * @returns {Array} Returns `array`.
	 */
	function reorder(array, indexes) {
	  var arrLength = array.length,
	      length = nativeMin(indexes.length, arrLength),
	      oldArray = copyArray(array);

	  while (length--) {
	    var index = indexes[length];
	    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
	  }
	  return array;
	}

	module.exports = reorder;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	module.exports = copyArray;


/***/ }),
/* 42 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	module.exports = isIndex;


/***/ }),
/* 43 */
/***/ (function(module, exports) {

	/** Used as the internal argument placeholder. */
	var PLACEHOLDER = '__lodash_placeholder__';

	/**
	 * Replaces all `placeholder` elements in `array` with an internal placeholder
	 * and returns an array of their indexes.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {*} placeholder The placeholder to replace.
	 * @returns {Array} Returns the new array of placeholder indexes.
	 */
	function replaceHolders(array, placeholder) {
	  var index = -1,
	      length = array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (value === placeholder || value === PLACEHOLDER) {
	      array[index] = PLACEHOLDER;
	      result[resIndex++] = index;
	    }
	  }
	  return result;
	}

	module.exports = replaceHolders;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(6),
	    createCtor = __webpack_require__(16),
	    root = __webpack_require__(19);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1;

	/**
	 * Creates a function that wraps `func` to invoke it with the `this` binding
	 * of `thisArg` and `partials` prepended to the arguments it receives.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} partials The arguments to prepend to those provided to
	 *  the new function.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createPartial(func, bitmask, thisArg, partials) {
	  var isBind = bitmask & WRAP_BIND_FLAG,
	      Ctor = createCtor(func);

	  function wrapper() {
	    var argsIndex = -1,
	        argsLength = arguments.length,
	        leftIndex = -1,
	        leftLength = partials.length,
	        args = Array(leftLength + argsLength),
	        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

	    while (++leftIndex < leftLength) {
	      args[leftIndex] = partials[leftIndex];
	    }
	    while (argsLength--) {
	      args[leftIndex++] = arguments[++argsIndex];
	    }
	    return apply(fn, isBind ? thisArg : this, args);
	  }
	  return wrapper;
	}

	module.exports = createPartial;


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}

	module.exports = noop;


/***/ }),
/* 46 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 47 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 48 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_48__;

/***/ }),
/* 49 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_49__;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _victoryAnimation = __webpack_require__(51);

	Object.defineProperty(exports, "VictoryAnimation", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryAnimation).default;
	  }
	});

	var _victoryContainer = __webpack_require__(66);

	Object.defineProperty(exports, "VictoryContainer", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryContainer).default;
	  }
	});

	var _victoryLabel = __webpack_require__(125);

	Object.defineProperty(exports, "VictoryLabel", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryLabel).default;
	  }
	});

	var _victoryTransition = __webpack_require__(195);

	Object.defineProperty(exports, "VictoryTransition", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryTransition).default;
	  }
	});

	var _victorySharedEvents = __webpack_require__(201);

	Object.defineProperty(exports, "VictorySharedEvents", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victorySharedEvents).default;
	  }
	});

	var _victoryClipContainer = __webpack_require__(212);

	Object.defineProperty(exports, "VictoryClipContainer", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryClipContainer).default;
	  }
	});

	var _victoryTheme = __webpack_require__(214);

	Object.defineProperty(exports, "VictoryTheme", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryTheme).default;
	  }
	});

	var _victoryLegend = __webpack_require__(217);

	Object.defineProperty(exports, "VictoryLegend", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryLegend).default;
	  }
	});

	var _victoryTooltip = __webpack_require__(231);

	Object.defineProperty(exports, "VictoryTooltip", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryTooltip).default;
	  }
	});

	var _victoryPortal = __webpack_require__(147);

	Object.defineProperty(exports, "VictoryPortal", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_victoryPortal).default;
	  }
	});

	var _portal = __webpack_require__(124);

	Object.defineProperty(exports, "Portal", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_portal).default;
	  }
	});

	var _arc = __webpack_require__(233);

	Object.defineProperty(exports, "Arc", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_arc).default;
	  }
	});

	var _area = __webpack_require__(234);

	Object.defineProperty(exports, "Area", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_area).default;
	  }
	});

	var _bar = __webpack_require__(238);

	Object.defineProperty(exports, "Bar", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_bar).default;
	  }
	});

	var _candle = __webpack_require__(239);

	Object.defineProperty(exports, "Candle", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_candle).default;
	  }
	});

	var _clipPath = __webpack_require__(213);

	Object.defineProperty(exports, "ClipPath", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_clipPath).default;
	  }
	});

	var _curve = __webpack_require__(240);

	Object.defineProperty(exports, "Curve", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_curve).default;
	  }
	});

	var _errorBar = __webpack_require__(241);

	Object.defineProperty(exports, "ErrorBar", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_errorBar).default;
	  }
	});

	var _line = __webpack_require__(242);

	Object.defineProperty(exports, "Line", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_line).default;
	  }
	});

	var _point = __webpack_require__(224);

	Object.defineProperty(exports, "Point", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_point).default;
	  }
	});

	var _slice = __webpack_require__(243);

	Object.defineProperty(exports, "Slice", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_slice).default;
	  }
	});

	var _voronoi = __webpack_require__(244);

	Object.defineProperty(exports, "Voronoi", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_voronoi).default;
	  }
	});

	var _flyout = __webpack_require__(232);

	Object.defineProperty(exports, "Flyout", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_flyout).default;
	  }
	});

	var _addEvents = __webpack_require__(245);

	Object.defineProperty(exports, "addEvents", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_addEvents).default;
	  }
	});

	var _collection = __webpack_require__(189);

	Object.defineProperty(exports, "Collection", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_collection).default;
	  }
	});

	var _data = __webpack_require__(246);

	Object.defineProperty(exports, "Data", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_data).default;
	  }
	});

	var _defaultTransitions = __webpack_require__(264);

	Object.defineProperty(exports, "DefaultTransitions", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_defaultTransitions).default;
	  }
	});

	var _domain = __webpack_require__(265);

	Object.defineProperty(exports, "Domain", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_domain).default;
	  }
	});

	var _events = __webpack_require__(203);

	Object.defineProperty(exports, "Events", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_events).default;
	  }
	});

	var _helpers = __webpack_require__(191);

	Object.defineProperty(exports, "Helpers", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_helpers).default;
	  }
	});

	var _labelHelpers = __webpack_require__(193);

	Object.defineProperty(exports, "LabelHelpers", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_labelHelpers).default;
	  }
	});

	var _log = __webpack_require__(148);

	Object.defineProperty(exports, "Log", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_log).default;
	  }
	});

	var _propTypes = __webpack_require__(150);

	Object.defineProperty(exports, "PropTypes", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_propTypes).default;
	  }
	});

	var _scale = __webpack_require__(256);

	Object.defineProperty(exports, "Scale", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_scale).default;
	  }
	});

	var _selection = __webpack_require__(268);

	Object.defineProperty(exports, "Selection", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_selection).default;
	  }
	});

	var _style = __webpack_require__(194);

	Object.defineProperty(exports, "Style", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_style).default;
	  }
	});

	var _textsize = __webpack_require__(223);

	Object.defineProperty(exports, "TextSize", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_textsize).default;
	  }
	});

	var _timer = __webpack_require__(64);

	Object.defineProperty(exports, "Timer", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_timer).default;
	  }
	});

	var _transitions = __webpack_require__(200);

	Object.defineProperty(exports, "Transitions", {
	  enumerable: true,
	  get: function () {
	    return _interopRequireDefault(_transitions).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _d3Ease = __webpack_require__(52);

	var d3Ease = _interopRequireWildcard(_d3Ease);

	var _util = __webpack_require__(53);

	var _timer = __webpack_require__(64);

	var _timer2 = _interopRequireDefault(_timer);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*global setTimeout:false */


	var VictoryAnimation = function (_React$Component) {
	  _inherits(VictoryAnimation, _React$Component);

	  function VictoryAnimation(props) {
	    _classCallCheck(this, VictoryAnimation);

	    /* defaults */
	    var _this = _possibleConstructorReturn(this, (VictoryAnimation.__proto__ || Object.getPrototypeOf(VictoryAnimation)).call(this, props));

	    _this.state = {
	      data: Array.isArray(_this.props.data) ? _this.props.data[0] : _this.props.data,
	      animationInfo: {
	        progress: 0,
	        animating: false
	      }
	    };
	    _this.interpolator = null;
	    _this.queue = Array.isArray(_this.props.data) ? _this.props.data.slice(1) : [];
	    /* build easing function */
	    _this.ease = d3Ease[_this.toNewName(_this.props.easing)];
	    /*
	      There is no autobinding of this in ES6 classes
	      so we bind functionToBeRunEachFrame to current instance of victory animation class
	    */
	    _this.functionToBeRunEachFrame = _this.functionToBeRunEachFrame.bind(_this);
	    _this.getTimer = _this.getTimer.bind(_this);
	    return _this;
	  }

	  _createClass(VictoryAnimation, [{
	    key: "componentDidMount",
	    value: function componentDidMount() {
	      // Length check prevents us from triggering `onEnd` in `traverseQueue`.
	      if (this.queue.length) {
	        this.traverseQueue();
	      }
	    }

	    /* lifecycle */

	  }, {
	    key: "componentWillReceiveProps",
	    value: function componentWillReceiveProps(nextProps) {
	      /* cancel existing loop if it exists */
	      this.getTimer().unsubscribe(this.loopID);

	      /* If an object was supplied */
	      if (!Array.isArray(nextProps.data)) {
	        // Replace the tween queue. Could set `this.queue = [nextProps.data]`,
	        // but let's reuse the same array.
	        this.queue.length = 0;
	        this.queue.push(nextProps.data);
	        /* If an array was supplied */
	      } else {
	        var _queue;

	        /* Extend the tween queue */
	        (_queue = this.queue).push.apply(_queue, _toConsumableArray(nextProps.data));
	      }
	      /* Start traversing the tween queue */
	      this.traverseQueue();
	    }
	  }, {
	    key: "componentWillUnmount",
	    value: function componentWillUnmount() {
	      if (this.loopID) {
	        this.getTimer().unsubscribe(this.loopID);
	      } else {
	        this.getTimer().stop();
	      }
	    }
	  }, {
	    key: "getTimer",
	    value: function getTimer() {
	      if (this.context.getTimer) {
	        return this.context.getTimer();
	      }
	      if (!this.timer) {
	        this.timer = new _timer2.default();
	      }
	      return this.timer;
	    }
	  }, {
	    key: "toNewName",
	    value: function toNewName(ease) {
	      // d3-ease changed the naming scheme for ease from "linear" -> "easeLinear" etc.
	      var capitalize = function (s) {
	        return s && s[0].toUpperCase() + s.slice(1);
	      };
	      return "ease" + capitalize(ease);
	    }

	    /* Traverse the tween queue */

	  }, {
	    key: "traverseQueue",
	    value: function traverseQueue() {
	      var _this2 = this;

	      if (this.queue.length) {
	        /* Get the next index */
	        var data = this.queue[0];
	        /* compare cached version to next props */
	        this.interpolator = (0, _util.victoryInterpolator)(this.state.data, data);
	        /* reset step to zero */
	        if (this.props.delay) {
	          setTimeout(function () {
	            _this2.loopID = _this2.getTimer().subscribe(_this2.functionToBeRunEachFrame, _this2.props.duration);
	          }, this.props.delay);
	        } else {
	          this.loopID = this.getTimer().subscribe(this.functionToBeRunEachFrame, this.props.duration);
	        }
	      } else if (this.props.onEnd) {
	        this.props.onEnd();
	      }
	    }
	    /* every frame we... */

	  }, {
	    key: "functionToBeRunEachFrame",
	    value: function functionToBeRunEachFrame(elapsed, duration) {
	      /*
	        step can generate imprecise values, sometimes greater than 1
	        if this happens set the state to 1 and return, cancelling the timer
	      */
	      duration = duration !== undefined ? duration : this.props.duration;
	      var step = duration ? elapsed / duration : 1;
	      if (step >= 1) {
	        this.setState({
	          data: this.interpolator(1),
	          animationInfo: {
	            progress: 1,
	            animating: false
	          }
	        });
	        if (this.loopID) {
	          this.getTimer().unsubscribe(this.loopID);
	        }
	        this.queue.shift();
	        this.traverseQueue();
	        return;
	      }
	      /*
	        if we're not at the end of the timer, set the state by passing
	        current step value that's transformed by the ease function to the
	        interpolator, which is cached for performance whenever props are received
	      */
	      this.setState({
	        data: this.interpolator(this.ease(step)),
	        animationInfo: {
	          progress: step,
	          animating: step < 1
	        }
	      });
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.props.children(this.state.data, this.state.animationInfo);
	    }
	  }]);

	  return VictoryAnimation;
	}(_react2.default.Component);

	VictoryAnimation.displayName = "VictoryAnimation";
	VictoryAnimation.propTypes = {
	  children: _propTypes2.default.func,
	  data: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
	  delay: _propTypes2.default.number,
	  duration: _propTypes2.default.number,
	  easing: _propTypes2.default.oneOf(["back", "backIn", "backOut", "backInOut", "bounce", "bounceIn", "bounceOut", "bounceInOut", "circle", "circleIn", "circleOut", "circleInOut", "linear", "linearIn", "linearOut", "linearInOut", "cubic", "cubicIn", "cubicOut", "cubicInOut", "elastic", "elasticIn", "elasticOut", "elasticInOut", "exp", "expIn", "expOut", "expInOut", "poly", "polyIn", "polyOut", "polyInOut", "quad", "quadIn", "quadOut", "quadInOut", "sin", "sinIn", "sinOut", "sinInOut"]),
	  onEnd: _propTypes2.default.func
	};
	VictoryAnimation.defaultProps = {
	  data: {},
	  delay: 0,
	  duration: 1000,
	  easing: "quadInOut"
	};
	VictoryAnimation.contextTypes = {
	  getTimer: _propTypes2.default.func
	};
	exports.default = VictoryAnimation;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-ease/ v1.0.6 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	function linear(t) {
	  return +t;
	}

	function quadIn(t) {
	  return t * t;
	}

	function quadOut(t) {
	  return t * (2 - t);
	}

	function quadInOut(t) {
	  return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
	}

	function cubicIn(t) {
	  return t * t * t;
	}

	function cubicOut(t) {
	  return --t * t * t + 1;
	}

	function cubicInOut(t) {
	  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
	}

	var exponent = 3;

	var polyIn = (function custom(e) {
	  e = +e;

	  function polyIn(t) {
	    return Math.pow(t, e);
	  }

	  polyIn.exponent = custom;

	  return polyIn;
	})(exponent);

	var polyOut = (function custom(e) {
	  e = +e;

	  function polyOut(t) {
	    return 1 - Math.pow(1 - t, e);
	  }

	  polyOut.exponent = custom;

	  return polyOut;
	})(exponent);

	var polyInOut = (function custom(e) {
	  e = +e;

	  function polyInOut(t) {
	    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
	  }

	  polyInOut.exponent = custom;

	  return polyInOut;
	})(exponent);

	var pi = Math.PI,
	    halfPi = pi / 2;

	function sinIn(t) {
	  return 1 - Math.cos(t * halfPi);
	}

	function sinOut(t) {
	  return Math.sin(t * halfPi);
	}

	function sinInOut(t) {
	  return (1 - Math.cos(pi * t)) / 2;
	}

	function expIn(t) {
	  return Math.pow(2, 10 * t - 10);
	}

	function expOut(t) {
	  return 1 - Math.pow(2, -10 * t);
	}

	function expInOut(t) {
	  return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;
	}

	function circleIn(t) {
	  return 1 - Math.sqrt(1 - t * t);
	}

	function circleOut(t) {
	  return Math.sqrt(1 - --t * t);
	}

	function circleInOut(t) {
	  return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
	}

	var b1 = 4 / 11,
	    b2 = 6 / 11,
	    b3 = 8 / 11,
	    b4 = 3 / 4,
	    b5 = 9 / 11,
	    b6 = 10 / 11,
	    b7 = 15 / 16,
	    b8 = 21 / 22,
	    b9 = 63 / 64,
	    b0 = 1 / b1 / b1;

	function bounceIn(t) {
	  return 1 - bounceOut(1 - t);
	}

	function bounceOut(t) {
	  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
	}

	function bounceInOut(t) {
	  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
	}

	var overshoot = 1.70158;

	var backIn = (function custom(s) {
	  s = +s;

	  function backIn(t) {
	    return t * t * ((s + 1) * t - s);
	  }

	  backIn.overshoot = custom;

	  return backIn;
	})(overshoot);

	var backOut = (function custom(s) {
	  s = +s;

	  function backOut(t) {
	    return --t * t * ((s + 1) * t + s) + 1;
	  }

	  backOut.overshoot = custom;

	  return backOut;
	})(overshoot);

	var backInOut = (function custom(s) {
	  s = +s;

	  function backInOut(t) {
	    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
	  }

	  backInOut.overshoot = custom;

	  return backInOut;
	})(overshoot);

	var tau = 2 * Math.PI,
	    amplitude = 1,
	    period = 0.3;

	var elasticIn = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticIn(t) {
	    return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p);
	  }

	  elasticIn.amplitude = function(a) { return custom(a, p * tau); };
	  elasticIn.period = function(p) { return custom(a, p); };

	  return elasticIn;
	})(amplitude, period);

	var elasticOut = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticOut(t) {
	    return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
	  }

	  elasticOut.amplitude = function(a) { return custom(a, p * tau); };
	  elasticOut.period = function(p) { return custom(a, p); };

	  return elasticOut;
	})(amplitude, period);

	var elasticInOut = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticInOut(t) {
	    return ((t = t * 2 - 1) < 0
	        ? a * Math.pow(2, 10 * t) * Math.sin((s - t) / p)
	        : 2 - a * Math.pow(2, -10 * t) * Math.sin((s + t) / p)) / 2;
	  }

	  elasticInOut.amplitude = function(a) { return custom(a, p * tau); };
	  elasticInOut.period = function(p) { return custom(a, p); };

	  return elasticInOut;
	})(amplitude, period);

	exports.easeBack = backInOut;
	exports.easeBackIn = backIn;
	exports.easeBackInOut = backInOut;
	exports.easeBackOut = backOut;
	exports.easeBounce = bounceOut;
	exports.easeBounceIn = bounceIn;
	exports.easeBounceInOut = bounceInOut;
	exports.easeBounceOut = bounceOut;
	exports.easeCircle = circleInOut;
	exports.easeCircleIn = circleIn;
	exports.easeCircleInOut = circleInOut;
	exports.easeCircleOut = circleOut;
	exports.easeCubic = cubicInOut;
	exports.easeCubicIn = cubicIn;
	exports.easeCubicInOut = cubicInOut;
	exports.easeCubicOut = cubicOut;
	exports.easeElastic = elasticOut;
	exports.easeElasticIn = elasticIn;
	exports.easeElasticInOut = elasticInOut;
	exports.easeElasticOut = elasticOut;
	exports.easeExp = expInOut;
	exports.easeExpIn = expIn;
	exports.easeExpInOut = expInOut;
	exports.easeExpOut = expOut;
	exports.easeLinear = linear;
	exports.easePoly = polyInOut;
	exports.easePolyIn = polyIn;
	exports.easePolyInOut = polyInOut;
	exports.easePolyOut = polyOut;
	exports.easeQuad = quadInOut;
	exports.easeQuadIn = quadIn;
	exports.easeQuadInOut = quadInOut;
	exports.easeQuadOut = quadOut;
	exports.easeSin = sinInOut;
	exports.easeSinIn = sinIn;
	exports.easeSinInOut = sinInOut;
	exports.easeSinOut = sinOut;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.victoryInterpolator = exports.interpolateString = exports.interpolateObject = exports.interpolateFunction = exports.interpolateImmediate = exports.isInterpolatable = undefined;

	var _isPlainObject2 = __webpack_require__(54);

	var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

	var _d3Interpolate = __webpack_require__(62);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var isInterpolatable = exports.isInterpolatable = function (obj) {
	  // d3 turns null into 0 and undefined into NaN, which we don't want.
	  if (obj !== null) {
	    switch (typeof obj) {
	      case "undefined":
	        return false;
	      case "number":
	        // The standard `isNaN` is fine in this case since we already know the
	        // type is number.
	        return !isNaN(obj) && obj !== Number.POSITIVE_INFINITY && obj !== Number.NEGATIVE_INFINITY;
	      case "string":
	        // d3 might not *actually* be able to interpolate the string, but it
	        // won't cause any issues to let it try.
	        return true;
	      case "boolean":
	        // d3 turns Booleans into integers, which we don't want. Sure, we could
	        // interpolate from 0 -> 1, but we'd be sending a non-Boolean to
	        // something expecting a Boolean.
	        return false;
	      case "object":
	        // Don't try to interpolate class instances (except Date or Array).
	        return obj instanceof Date || Array.isArray(obj) || (0, _isPlainObject3.default)(obj);
	      case "function":
	        // Careful! There may be extra properties on function objects that the
	        // component expects to access - for instance, it may be a `d3.scale()`
	        // function, which has its own methods attached. We don't know if the
	        // component is only going to call the function (in which case it's
	        // safely interpolatable) or if it's going to access special properties
	        // (in which case our function generated from `interpolateFunction` will
	        // most likely cause an error. We could check for enumerable properties
	        // on the function object here to see if it's a "plain" function, but
	        // let's just require that components prevent such function props from
	        // being animated in the first place.
	        return true;
	    }
	  }
	  return false;
	};

	/**
	 * Interpolate immediately to the end value at the given step `when`.
	 * Some nicer default behavior might be to jump at the halfway point or return
	 * `a` if `t` is 0 (instead of always returning `b`). But d3's default
	 * interpolator does not do these things:
	 *
	 *   d3.interpolate('aaa', 'bbb')(0) === 'bbb'
	 *
	 * ...and things might get wonky if we don't replicate that behavior.
	 *
	 * @param {any} a - Start value.
	 * @param {any} b - End value.
	 * @param {Number} when - Step value (0 to 1) at which to jump to `b`.
	 * @returns {Function} An interpolation function.
	 */
	var interpolateImmediate = exports.interpolateImmediate = function (a, b) {
	  var when = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	  return function (t) {
	    return t < when ? a : b;
	  };
	};

	/**
	 * Interpolate to or from a function. The interpolated value will be a function
	 * that calls `a` (if it's a function) and `b` (if it's a function) and calls
	 * `d3.interpolate` on the resulting values. Note that our function won't
	 * necessarily be called (that's up to the component this eventually gets
	 * passed to) - but if it does get called, it will return an appropriately
	 * interpolated value.
	 *
	 * @param {any} a - Start value.
	 * @param {any} b - End value.
	 * @returns {Function} An interpolation function.
	 */
	var interpolateFunction = exports.interpolateFunction = function (a, b) {
	  return function (t) {
	    if (t >= 1) {
	      return b;
	    }
	    return function () {
	      /* eslint-disable no-invalid-this */
	      var aval = typeof a === "function" ? a.apply(this, arguments) : a;
	      var bval = typeof b === "function" ? b.apply(this, arguments) : b;
	      return (0, _d3Interpolate.interpolate)(aval, bval)(t);
	    };
	  };
	};

	/**
	 * Interpolate to or from an object. This method is a modification of the object interpolator in
	 * d3-interpolate https://github.com/d3/d3-interpolate/blob/master/src/object.js. This interpolator
	 * differs in that it uses our custom interpolators when interpolating the value of each property in
	 * an object. This allows the correct interpolation of nested objects, including styles
	 *
	 * @param {any} a - Start value.
	 * @param {any} b - End value.
	 * @returns {Function} An interpolation function.
	 */
	var interpolateObject = exports.interpolateObject = function (a, b) {
	  var interpolateTypes = function (x, y) {
	    if (x === y || !isInterpolatable(x) || !isInterpolatable(y)) {
	      return interpolateImmediate(x, y);
	    }
	    if (typeof x === "function" || typeof y === "function") {
	      return interpolateFunction(x, y);
	    }
	    if (typeof x === "object" && (0, _isPlainObject3.default)(x) || typeof y === "object" && (0, _isPlainObject3.default)(y)) {
	      return interpolateObject(x, y);
	    }
	    return (0, _d3Interpolate.interpolate)(x, y);
	  };

	  var i = {};
	  var c = {};
	  var k = void 0;

	  if (a === null || typeof a !== "object") {
	    a = {};
	  }
	  if (b === null || typeof b !== "object") {
	    b = {};
	  }

	  for (k in b) {
	    if (k in a) {
	      i[k] = interpolateTypes(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function (t) {
	    for (k in i) {
	      c[k] = i[k](t);
	    }
	    return c;
	  };
	};

	var interpolateString = exports.interpolateString = function (a, b) {
	  var format = function (val) {
	    return typeof val === "string" ? val.replace(/,/g, "") : val;
	  };

	  return (0, _d3Interpolate.interpolate)(format(a), format(b));
	};

	/**
	 * By default, the list of interpolators used by `d3.interpolate` has a few
	 * downsides:
	 *
	 * - `null` values get turned into 0.
	 * - `undefined`, `function`, and some other value types get turned into NaN.
	 * - Boolean types get turned into numbers, which probably will be meaningless
	 *   to whatever is consuming them.
	 * - It tries to interpolate between identical start and end values, doing
	 *   unnecessary calculations that sometimes result in floating point rounding
	 *   errors.
	 *
	 * If only the default interpolators are used, `VictoryAnimation` will happily
	 * pass down NaN (and other bad) values as props to the wrapped component.
	 * The component will then either use the incorrect values or complain that it
	 * was passed props of the incorrect type. This custom interpolator is added
	 * using the `d3.interpolators` API, and prevents such cases from happening
	 * for most values.
	 *
	 * @param {any} a - Start value.
	 * @param {any} b - End value.
	 * @returns {Function|undefined} An interpolation function, if necessary.
	 */
	var victoryInterpolator = exports.victoryInterpolator = function (a, b) {
	  // If the values are strictly equal, or either value is not interpolatable,
	  // just use either the start value `a` or end value `b` at every step, as
	  // there is no reasonable in-between value.
	  if (a === b || !isInterpolatable(a) || !isInterpolatable(b)) {
	    return interpolateImmediate(a, b);
	  }
	  if (typeof a === "function" || typeof b === "function") {
	    return interpolateFunction(a, b);
	  }
	  if ((0, _isPlainObject3.default)(a) || (0, _isPlainObject3.default)(b)) {
	    return interpolateObject(a, b);
	  }
	  if (typeof a === "string" || typeof b === "string") {
	    return interpolateString(a, b);
	  }
	  return (0, _d3Interpolate.interpolate)(a, b);
	};

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(55),
	    getPrototype = __webpack_require__(59),
	    isObjectLike = __webpack_require__(61);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
	    funcToString.call(Ctor) == objectCtorString;
	}

	module.exports = isPlainObject;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(56),
	    getRawTag = __webpack_require__(57),
	    objectToString = __webpack_require__(58);

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	module.exports = baseGetTag;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(19);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(56);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	module.exports = getRawTag;


/***/ }),
/* 58 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}

	module.exports = objectToString;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(60);

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	module.exports = getPrototype;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	module.exports = overArg;


/***/ }),
/* 61 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-interpolate/ v1.4.0 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports, __webpack_require__(63)) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
	}(this, function (exports, d3Color) { 'use strict';

	function basis(t1, v0, v1, v2, v3) {
	  var t2 = t1 * t1, t3 = t2 * t1;
	  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
	      + (4 - 6 * t2 + 3 * t3) * v1
	      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
	      + t3 * v3) / 6;
	}

	function basis$1(values) {
	  var n = values.length - 1;
	  return function(t) {
	    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
	        v1 = values[i],
	        v2 = values[i + 1],
	        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
	        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
	    return basis((t - i / n) * n, v0, v1, v2, v3);
	  };
	}

	function basisClosed(values) {
	  var n = values.length;
	  return function(t) {
	    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
	        v0 = values[(i + n - 1) % n],
	        v1 = values[i % n],
	        v2 = values[(i + 1) % n],
	        v3 = values[(i + 2) % n];
	    return basis((t - i / n) * n, v0, v1, v2, v3);
	  };
	}

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	function linear(a, d) {
	  return function(t) {
	    return a + t * d;
	  };
	}

	function exponential(a, b, y) {
	  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	    return Math.pow(a + t * b, y);
	  };
	}

	function hue(a, b) {
	  var d = b - a;
	  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
	}

	function gamma(y) {
	  return (y = +y) === 1 ? nogamma : function(a, b) {
	    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
	  };
	}

	function nogamma(a, b) {
	  var d = b - a;
	  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
	}

	var rgb = (function rgbGamma(y) {
	  var color = gamma(y);

	  function rgb(start, end) {
	    var r = color((start = d3Color.rgb(start)).r, (end = d3Color.rgb(end)).r),
	        g = color(start.g, end.g),
	        b = color(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb.gamma = rgbGamma;

	  return rgb;
	})(1);

	function rgbSpline(spline) {
	  return function(colors) {
	    var n = colors.length,
	        r = new Array(n),
	        g = new Array(n),
	        b = new Array(n),
	        i, color;
	    for (i = 0; i < n; ++i) {
	      color = d3Color.rgb(colors[i]);
	      r[i] = color.r || 0;
	      g[i] = color.g || 0;
	      b[i] = color.b || 0;
	    }
	    r = spline(r);
	    g = spline(g);
	    b = spline(b);
	    color.opacity = 1;
	    return function(t) {
	      color.r = r(t);
	      color.g = g(t);
	      color.b = b(t);
	      return color + "";
	    };
	  };
	}

	var rgbBasis = rgbSpline(basis$1);
	var rgbBasisClosed = rgbSpline(basisClosed);

	function numberArray(a, b) {
	  if (!b) b = [];
	  var n = a ? Math.min(b.length, a.length) : 0,
	      c = b.slice(),
	      i;
	  return function(t) {
	    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
	    return c;
	  };
	}

	function isNumberArray(x) {
	  return ArrayBuffer.isView(x) && !(x instanceof DataView);
	}

	function array(a, b) {
	  return (isNumberArray(b) ? numberArray : genericArray)(a, b);
	}

	function genericArray(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(na),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	}

	function date(a, b) {
	  var d = new Date;
	  return a = +a, b = +b, function(t) {
	    return d.setTime(a * (1 - t) + b * t), d;
	  };
	}

	function number(a, b) {
	  return a = +a, b = +b, function(t) {
	    return a * (1 - t) + b * t;
	  };
	}

	function object(a, b) {
	  var i = {},
	      c = {},
	      k;

	  if (a === null || typeof a !== "object") a = {};
	  if (b === null || typeof b !== "object") b = {};

	  for (k in b) {
	    if (k in a) {
	      i[k] = value(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function(t) {
	    for (k in i) c[k] = i[k](t);
	    return c;
	  };
	}

	var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
	    reB = new RegExp(reA.source, "g");

	function zero(b) {
	  return function() {
	    return b;
	  };
	}

	function one(b) {
	  return function(t) {
	    return b(t) + "";
	  };
	}

	function string(a, b) {
	  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	      am, // current match in a
	      bm, // current match in b
	      bs, // string preceding current number in b, if any
	      i = -1, // index in s
	      s = [], // string constants and placeholders
	      q = []; // number interpolators

	  // Coerce inputs to strings.
	  a = a + "", b = b + "";

	  // Interpolate pairs of numbers in a & b.
	  while ((am = reA.exec(a))
	      && (bm = reB.exec(b))) {
	    if ((bs = bm.index) > bi) { // a string precedes the next number in b
	      bs = b.slice(bi, bs);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }
	    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	      if (s[i]) s[i] += bm; // coalesce with previous string
	      else s[++i] = bm;
	    } else { // interpolate non-matching numbers
	      s[++i] = null;
	      q.push({i: i, x: number(am, bm)});
	    }
	    bi = reB.lastIndex;
	  }

	  // Add remains of b.
	  if (bi < b.length) {
	    bs = b.slice(bi);
	    if (s[i]) s[i] += bs; // coalesce with previous string
	    else s[++i] = bs;
	  }

	  // Special optimization for only a single match.
	  // Otherwise, interpolate each of the numbers and rejoin the string.
	  return s.length < 2 ? (q[0]
	      ? one(q[0].x)
	      : zero(b))
	      : (b = q.length, function(t) {
	          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	          return s.join("");
	        });
	}

	function value(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant(b)
	      : (t === "number" ? number
	      : t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb) : string)
	      : b instanceof d3Color.color ? rgb
	      : b instanceof Date ? date
	      : isNumberArray(b) ? numberArray
	      : Array.isArray(b) ? genericArray
	      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
	      : number)(a, b);
	}

	function discrete(range) {
	  var n = range.length;
	  return function(t) {
	    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
	  };
	}

	function hue$1(a, b) {
	  var i = hue(+a, +b);
	  return function(t) {
	    var x = i(t);
	    return x - 360 * Math.floor(x / 360);
	  };
	}

	function round(a, b) {
	  return a = +a, b = +b, function(t) {
	    return Math.round(a * (1 - t) + b * t);
	  };
	}

	var degrees = 180 / Math.PI;

	var identity = {
	  translateX: 0,
	  translateY: 0,
	  rotate: 0,
	  skewX: 0,
	  scaleX: 1,
	  scaleY: 1
	};

	function decompose(a, b, c, d, e, f) {
	  var scaleX, scaleY, skewX;
	  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	  return {
	    translateX: e,
	    translateY: f,
	    rotate: Math.atan2(b, a) * degrees,
	    skewX: Math.atan(skewX) * degrees,
	    scaleX: scaleX,
	    scaleY: scaleY
	  };
	}

	var cssNode,
	    cssRoot,
	    cssView,
	    svgNode;

	function parseCss(value) {
	  if (value === "none") return identity;
	  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
	  cssNode.style.transform = value;
	  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
	  cssRoot.removeChild(cssNode);
	  value = value.slice(7, -1).split(",");
	  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
	}

	function parseSvg(value) {
	  if (value == null) return identity;
	  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
	  svgNode.setAttribute("transform", value);
	  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
	  value = value.matrix;
	  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
	}

	function interpolateTransform(parse, pxComma, pxParen, degParen) {

	  function pop(s) {
	    return s.length ? s.pop() + " " : "";
	  }

	  function translate(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push("translate(", null, pxComma, null, pxParen);
	      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
	    } else if (xb || yb) {
	      s.push("translate(" + xb + pxComma + yb + pxParen);
	    }
	  }

	  function rotate(a, b, s, q) {
	    if (a !== b) {
	      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
	      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "rotate(" + b + degParen);
	    }
	  }

	  function skewX(a, b, s, q) {
	    if (a !== b) {
	      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "skewX(" + b + degParen);
	    }
	  }

	  function scale(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
	      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
	    } else if (xb !== 1 || yb !== 1) {
	      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
	    }
	  }

	  return function(a, b) {
	    var s = [], // string constants and placeholders
	        q = []; // number interpolators
	    a = parse(a), b = parse(b);
	    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
	    rotate(a.rotate, b.rotate, s, q);
	    skewX(a.skewX, b.skewX, s, q);
	    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
	    a = b = null; // gc
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  };
	}

	var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
	var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

	var rho = Math.SQRT2,
	    rho2 = 2,
	    rho4 = 4,
	    epsilon2 = 1e-12;

	function cosh(x) {
	  return ((x = Math.exp(x)) + 1 / x) / 2;
	}

	function sinh(x) {
	  return ((x = Math.exp(x)) - 1 / x) / 2;
	}

	function tanh(x) {
	  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	}

	// p0 = [ux0, uy0, w0]
	// p1 = [ux1, uy1, w1]
	function zoom(p0, p1) {
	  var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
	      ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
	      dx = ux1 - ux0,
	      dy = uy1 - uy0,
	      d2 = dx * dx + dy * dy,
	      i,
	      S;

	  // Special case for u0 ≅ u1.
	  if (d2 < epsilon2) {
	    S = Math.log(w1 / w0) / rho;
	    i = function(t) {
	      return [
	        ux0 + t * dx,
	        uy0 + t * dy,
	        w0 * Math.exp(rho * t * S)
	      ];
	    };
	  }

	  // General case.
	  else {
	    var d1 = Math.sqrt(d2),
	        b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
	        b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
	        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
	        r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	    S = (r1 - r0) / rho;
	    i = function(t) {
	      var s = t * S,
	          coshr0 = cosh(r0),
	          u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
	      return [
	        ux0 + u * dx,
	        uy0 + u * dy,
	        w0 * coshr0 / cosh(rho * s + r0)
	      ];
	    };
	  }

	  i.duration = S * 1000;

	  return i;
	}

	function hsl(hue) {
	  return function(start, end) {
	    var h = hue((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
	        s = nogamma(start.s, end.s),
	        l = nogamma(start.l, end.l),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.h = h(t);
	      start.s = s(t);
	      start.l = l(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }
	}

	var hsl$1 = hsl(hue);
	var hslLong = hsl(nogamma);

	function lab(start, end) {
	  var l = nogamma((start = d3Color.lab(start)).l, (end = d3Color.lab(end)).l),
	      a = nogamma(start.a, end.a),
	      b = nogamma(start.b, end.b),
	      opacity = nogamma(start.opacity, end.opacity);
	  return function(t) {
	    start.l = l(t);
	    start.a = a(t);
	    start.b = b(t);
	    start.opacity = opacity(t);
	    return start + "";
	  };
	}

	function hcl(hue) {
	  return function(start, end) {
	    var h = hue((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
	        c = nogamma(start.c, end.c),
	        l = nogamma(start.l, end.l),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.h = h(t);
	      start.c = c(t);
	      start.l = l(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }
	}

	var hcl$1 = hcl(hue);
	var hclLong = hcl(nogamma);

	function cubehelix(hue) {
	  return (function cubehelixGamma(y) {
	    y = +y;

	    function cubehelix(start, end) {
	      var h = hue((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
	          s = nogamma(start.s, end.s),
	          l = nogamma(start.l, end.l),
	          opacity = nogamma(start.opacity, end.opacity);
	      return function(t) {
	        start.h = h(t);
	        start.s = s(t);
	        start.l = l(Math.pow(t, y));
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }

	    cubehelix.gamma = cubehelixGamma;

	    return cubehelix;
	  })(1);
	}

	var cubehelix$1 = cubehelix(hue);
	var cubehelixLong = cubehelix(nogamma);

	function piecewise(interpolate, values) {
	  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
	  while (i < n) I[i] = interpolate(v, v = values[++i]);
	  return function(t) {
	    var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
	    return I[i](t - i);
	  };
	}

	function quantize(interpolator, n) {
	  var samples = new Array(n);
	  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
	  return samples;
	}

	exports.interpolate = value;
	exports.interpolateArray = array;
	exports.interpolateBasis = basis$1;
	exports.interpolateBasisClosed = basisClosed;
	exports.interpolateCubehelix = cubehelix$1;
	exports.interpolateCubehelixLong = cubehelixLong;
	exports.interpolateDate = date;
	exports.interpolateDiscrete = discrete;
	exports.interpolateHcl = hcl$1;
	exports.interpolateHclLong = hclLong;
	exports.interpolateHsl = hsl$1;
	exports.interpolateHslLong = hslLong;
	exports.interpolateHue = hue$1;
	exports.interpolateLab = lab;
	exports.interpolateNumber = number;
	exports.interpolateNumberArray = numberArray;
	exports.interpolateObject = object;
	exports.interpolateRgb = rgb;
	exports.interpolateRgbBasis = rgbBasis;
	exports.interpolateRgbBasisClosed = rgbBasisClosed;
	exports.interpolateRound = round;
	exports.interpolateString = string;
	exports.interpolateTransformCss = interpolateTransformCss;
	exports.interpolateTransformSvg = interpolateTransformSvg;
	exports.interpolateZoom = zoom;
	exports.piecewise = piecewise;
	exports.quantize = quantize;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-color/ v1.4.0 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	function define(constructor, factory, prototype) {
	  constructor.prototype = factory.prototype = prototype;
	  prototype.constructor = constructor;
	}

	function extend(parent, definition) {
	  var prototype = Object.create(parent.prototype);
	  for (var key in definition) prototype[key] = definition[key];
	  return prototype;
	}

	function Color() {}

	var darker = 0.7;
	var brighter = 1 / darker;

	var reI = "\\s*([+-]?\\d+)\\s*",
	    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
	    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
	    reHex = /^#([0-9a-f]{3,8})$/,
	    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
	    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
	    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
	    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
	    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
	    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

	var named = {
	  aliceblue: 0xf0f8ff,
	  antiquewhite: 0xfaebd7,
	  aqua: 0x00ffff,
	  aquamarine: 0x7fffd4,
	  azure: 0xf0ffff,
	  beige: 0xf5f5dc,
	  bisque: 0xffe4c4,
	  black: 0x000000,
	  blanchedalmond: 0xffebcd,
	  blue: 0x0000ff,
	  blueviolet: 0x8a2be2,
	  brown: 0xa52a2a,
	  burlywood: 0xdeb887,
	  cadetblue: 0x5f9ea0,
	  chartreuse: 0x7fff00,
	  chocolate: 0xd2691e,
	  coral: 0xff7f50,
	  cornflowerblue: 0x6495ed,
	  cornsilk: 0xfff8dc,
	  crimson: 0xdc143c,
	  cyan: 0x00ffff,
	  darkblue: 0x00008b,
	  darkcyan: 0x008b8b,
	  darkgoldenrod: 0xb8860b,
	  darkgray: 0xa9a9a9,
	  darkgreen: 0x006400,
	  darkgrey: 0xa9a9a9,
	  darkkhaki: 0xbdb76b,
	  darkmagenta: 0x8b008b,
	  darkolivegreen: 0x556b2f,
	  darkorange: 0xff8c00,
	  darkorchid: 0x9932cc,
	  darkred: 0x8b0000,
	  darksalmon: 0xe9967a,
	  darkseagreen: 0x8fbc8f,
	  darkslateblue: 0x483d8b,
	  darkslategray: 0x2f4f4f,
	  darkslategrey: 0x2f4f4f,
	  darkturquoise: 0x00ced1,
	  darkviolet: 0x9400d3,
	  deeppink: 0xff1493,
	  deepskyblue: 0x00bfff,
	  dimgray: 0x696969,
	  dimgrey: 0x696969,
	  dodgerblue: 0x1e90ff,
	  firebrick: 0xb22222,
	  floralwhite: 0xfffaf0,
	  forestgreen: 0x228b22,
	  fuchsia: 0xff00ff,
	  gainsboro: 0xdcdcdc,
	  ghostwhite: 0xf8f8ff,
	  gold: 0xffd700,
	  goldenrod: 0xdaa520,
	  gray: 0x808080,
	  green: 0x008000,
	  greenyellow: 0xadff2f,
	  grey: 0x808080,
	  honeydew: 0xf0fff0,
	  hotpink: 0xff69b4,
	  indianred: 0xcd5c5c,
	  indigo: 0x4b0082,
	  ivory: 0xfffff0,
	  khaki: 0xf0e68c,
	  lavender: 0xe6e6fa,
	  lavenderblush: 0xfff0f5,
	  lawngreen: 0x7cfc00,
	  lemonchiffon: 0xfffacd,
	  lightblue: 0xadd8e6,
	  lightcoral: 0xf08080,
	  lightcyan: 0xe0ffff,
	  lightgoldenrodyellow: 0xfafad2,
	  lightgray: 0xd3d3d3,
	  lightgreen: 0x90ee90,
	  lightgrey: 0xd3d3d3,
	  lightpink: 0xffb6c1,
	  lightsalmon: 0xffa07a,
	  lightseagreen: 0x20b2aa,
	  lightskyblue: 0x87cefa,
	  lightslategray: 0x778899,
	  lightslategrey: 0x778899,
	  lightsteelblue: 0xb0c4de,
	  lightyellow: 0xffffe0,
	  lime: 0x00ff00,
	  limegreen: 0x32cd32,
	  linen: 0xfaf0e6,
	  magenta: 0xff00ff,
	  maroon: 0x800000,
	  mediumaquamarine: 0x66cdaa,
	  mediumblue: 0x0000cd,
	  mediumorchid: 0xba55d3,
	  mediumpurple: 0x9370db,
	  mediumseagreen: 0x3cb371,
	  mediumslateblue: 0x7b68ee,
	  mediumspringgreen: 0x00fa9a,
	  mediumturquoise: 0x48d1cc,
	  mediumvioletred: 0xc71585,
	  midnightblue: 0x191970,
	  mintcream: 0xf5fffa,
	  mistyrose: 0xffe4e1,
	  moccasin: 0xffe4b5,
	  navajowhite: 0xffdead,
	  navy: 0x000080,
	  oldlace: 0xfdf5e6,
	  olive: 0x808000,
	  olivedrab: 0x6b8e23,
	  orange: 0xffa500,
	  orangered: 0xff4500,
	  orchid: 0xda70d6,
	  palegoldenrod: 0xeee8aa,
	  palegreen: 0x98fb98,
	  paleturquoise: 0xafeeee,
	  palevioletred: 0xdb7093,
	  papayawhip: 0xffefd5,
	  peachpuff: 0xffdab9,
	  peru: 0xcd853f,
	  pink: 0xffc0cb,
	  plum: 0xdda0dd,
	  powderblue: 0xb0e0e6,
	  purple: 0x800080,
	  rebeccapurple: 0x663399,
	  red: 0xff0000,
	  rosybrown: 0xbc8f8f,
	  royalblue: 0x4169e1,
	  saddlebrown: 0x8b4513,
	  salmon: 0xfa8072,
	  sandybrown: 0xf4a460,
	  seagreen: 0x2e8b57,
	  seashell: 0xfff5ee,
	  sienna: 0xa0522d,
	  silver: 0xc0c0c0,
	  skyblue: 0x87ceeb,
	  slateblue: 0x6a5acd,
	  slategray: 0x708090,
	  slategrey: 0x708090,
	  snow: 0xfffafa,
	  springgreen: 0x00ff7f,
	  steelblue: 0x4682b4,
	  tan: 0xd2b48c,
	  teal: 0x008080,
	  thistle: 0xd8bfd8,
	  tomato: 0xff6347,
	  turquoise: 0x40e0d0,
	  violet: 0xee82ee,
	  wheat: 0xf5deb3,
	  white: 0xffffff,
	  whitesmoke: 0xf5f5f5,
	  yellow: 0xffff00,
	  yellowgreen: 0x9acd32
	};

	define(Color, color, {
	  copy: function(channels) {
	    return Object.assign(new this.constructor, this, channels);
	  },
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  hex: color_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: color_formatHex,
	  formatHsl: color_formatHsl,
	  formatRgb: color_formatRgb,
	  toString: color_formatRgb
	});

	function color_formatHex() {
	  return this.rgb().formatHex();
	}

	function color_formatHsl() {
	  return hslConvert(this).formatHsl();
	}

	function color_formatRgb() {
	  return this.rgb().formatRgb();
	}

	function color(format) {
	  var m, l;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
	      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
	      : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
	      : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
	      : null) // invalid hex
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
	      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	      : null;
	}

	function rgbn(n) {
	  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	}

	function rgba(r, g, b, a) {
	  if (a <= 0) r = g = b = NaN;
	  return new Rgb(r, g, b, a);
	}

	function rgbConvert(o) {
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Rgb;
	  o = o.rgb();
	  return new Rgb(o.r, o.g, o.b, o.opacity);
	}

	function rgb(r, g, b, opacity) {
	  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	}

	function Rgb(r, g, b, opacity) {
	  this.r = +r;
	  this.g = +g;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Rgb, rgb, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  rgb: function() {
	    return this;
	  },
	  displayable: function() {
	    return (-0.5 <= this.r && this.r < 255.5)
	        && (-0.5 <= this.g && this.g < 255.5)
	        && (-0.5 <= this.b && this.b < 255.5)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: rgb_formatHex,
	  formatRgb: rgb_formatRgb,
	  toString: rgb_formatRgb
	}));

	function rgb_formatHex() {
	  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
	}

	function rgb_formatRgb() {
	  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	  return (a === 1 ? "rgb(" : "rgba(")
	      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	      + (a === 1 ? ")" : ", " + a + ")");
	}

	function hex(value) {
	  value = Math.max(0, Math.min(255, Math.round(value) || 0));
	  return (value < 16 ? "0" : "") + value.toString(16);
	}

	function hsla(h, s, l, a) {
	  if (a <= 0) h = s = l = NaN;
	  else if (l <= 0 || l >= 1) h = s = NaN;
	  else if (s <= 0) h = NaN;
	  return new Hsl(h, s, l, a);
	}

	function hslConvert(o) {
	  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Hsl;
	  if (o instanceof Hsl) return o;
	  o = o.rgb();
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      min = Math.min(r, g, b),
	      max = Math.max(r, g, b),
	      h = NaN,
	      s = max - min,
	      l = (max + min) / 2;
	  if (s) {
	    if (r === max) h = (g - b) / s + (g < b) * 6;
	    else if (g === max) h = (b - r) / s + 2;
	    else h = (r - g) / s + 4;
	    s /= l < 0.5 ? max + min : 2 - max - min;
	    h *= 60;
	  } else {
	    s = l > 0 && l < 1 ? 0 : h;
	  }
	  return new Hsl(h, s, l, o.opacity);
	}

	function hsl(h, s, l, opacity) {
	  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	}

	function Hsl(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hsl, hsl, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = this.h % 360 + (this.h < 0) * 360,
	        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	        l = this.l,
	        m2 = l + (l < 0.5 ? l : 1 - l) * s,
	        m1 = 2 * l - m2;
	    return new Rgb(
	      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	      hsl2rgb(h, m1, m2),
	      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	      this.opacity
	    );
	  },
	  displayable: function() {
	    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	        && (0 <= this.l && this.l <= 1)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  formatHsl: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "hsl(" : "hsla(")
	        + (this.h || 0) + ", "
	        + (this.s || 0) * 100 + "%, "
	        + (this.l || 0) * 100 + "%"
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

	var deg2rad = Math.PI / 180;
	var rad2deg = 180 / Math.PI;

	// https://observablehq.com/@mbostock/lab-and-rgb
	var K = 18,
	    Xn = 0.96422,
	    Yn = 1,
	    Zn = 0.82521,
	    t0 = 4 / 29,
	    t1 = 6 / 29,
	    t2 = 3 * t1 * t1,
	    t3 = t1 * t1 * t1;

	function labConvert(o) {
	  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
	  if (o instanceof Hcl) return hcl2lab(o);
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = rgb2lrgb(o.r),
	      g = rgb2lrgb(o.g),
	      b = rgb2lrgb(o.b),
	      y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
	  if (r === g && g === b) x = z = y; else {
	    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
	    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
	  }
	  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
	}

	function gray(l, opacity) {
	  return new Lab(l, 0, 0, opacity == null ? 1 : opacity);
	}

	function lab(l, a, b, opacity) {
	  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
	}

	function Lab(l, a, b, opacity) {
	  this.l = +l;
	  this.a = +a;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Lab, lab, extend(Color, {
	  brighter: function(k) {
	    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  darker: function(k) {
	    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  rgb: function() {
	    var y = (this.l + 16) / 116,
	        x = isNaN(this.a) ? y : y + this.a / 500,
	        z = isNaN(this.b) ? y : y - this.b / 200;
	    x = Xn * lab2xyz(x);
	    y = Yn * lab2xyz(y);
	    z = Zn * lab2xyz(z);
	    return new Rgb(
	      lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
	      lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
	      lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
	      this.opacity
	    );
	  }
	}));

	function xyz2lab(t) {
	  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
	}

	function lab2xyz(t) {
	  return t > t1 ? t * t * t : t2 * (t - t0);
	}

	function lrgb2rgb(x) {
	  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
	}

	function rgb2lrgb(x) {
	  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	function hclConvert(o) {
	  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
	  if (!(o instanceof Lab)) o = labConvert(o);
	  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
	  var h = Math.atan2(o.b, o.a) * rad2deg;
	  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
	}

	function lch(l, c, h, opacity) {
	  return arguments.length === 1 ? hclConvert(l) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	}

	function hcl(h, c, l, opacity) {
	  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	}

	function Hcl(h, c, l, opacity) {
	  this.h = +h;
	  this.c = +c;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	function hcl2lab(o) {
	  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
	  var h = o.h * deg2rad;
	  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
	}

	define(Hcl, hcl, extend(Color, {
	  brighter: function(k) {
	    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
	  },
	  darker: function(k) {
	    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
	  },
	  rgb: function() {
	    return hcl2lab(this).rgb();
	  }
	}));

	var A = -0.14861,
	    B = +1.78277,
	    C = -0.29227,
	    D = -0.90649,
	    E = +1.97294,
	    ED = E * D,
	    EB = E * B,
	    BC_DA = B * C - D * A;

	function cubehelixConvert(o) {
	  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
	      bl = b - l,
	      k = (E * (g - l) - C * bl) / D,
	      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
	      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
	  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
	}

	function cubehelix(h, s, l, opacity) {
	  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
	}

	function Cubehelix(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Cubehelix, cubehelix, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
	        l = +this.l,
	        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
	        cosh = Math.cos(h),
	        sinh = Math.sin(h);
	    return new Rgb(
	      255 * (l + a * (A * cosh + B * sinh)),
	      255 * (l + a * (C * cosh + D * sinh)),
	      255 * (l + a * (E * cosh)),
	      this.opacity
	    );
	  }
	}));

	exports.color = color;
	exports.cubehelix = cubehelix;
	exports.gray = gray;
	exports.hcl = hcl;
	exports.hsl = hsl;
	exports.lab = lab;
	exports.lch = lch;
	exports.rgb = rgb;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d3Timer = __webpack_require__(65);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Timer = function () {
	  function Timer() {
	    _classCallCheck(this, Timer);

	    this.shouldAnimate = true;
	    this.subscribers = [];
	    this.loop = this.loop.bind(this);
	    this.timer = (0, _d3Timer.timer)(this.loop);
	  }

	  _createClass(Timer, [{
	    key: "bypassAnimation",
	    value: function bypassAnimation() {
	      this.shouldAnimate = false;
	    }
	  }, {
	    key: "resumeAnimation",
	    value: function resumeAnimation() {
	      this.shouldAnimate = true;
	    }
	  }, {
	    key: "loop",
	    value: function loop() {
	      this.subscribers.forEach(function (s) {
	        s.callback((0, _d3Timer.now)() - s.startTime, s.duration);
	      });
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this.timer.start();
	    }
	  }, {
	    key: "stop",
	    value: function stop() {
	      this.timer.stop();
	    }
	  }, {
	    key: "subscribe",
	    value: function subscribe(callback, duration) {
	      duration = this.shouldAnimate ? duration : 0;
	      return this.subscribers.push({
	        startTime: (0, _d3Timer.now)(),
	        callback: callback,
	        duration: duration
	      });
	    }
	  }, {
	    key: "unsubscribe",
	    value: function unsubscribe(id) {
	      if (id !== null) {
	        delete this.subscribers[id - 1];
	      }
	    }
	  }]);

	  return Timer;
	}();

	exports.default = Timer;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-timer/ v1.0.10 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	var frame = 0, // is an animation frame pending?
	    timeout = 0, // is a timeout pending?
	    interval = 0, // are any timers active?
	    pokeDelay = 1000, // how frequently we check for clock skew
	    taskHead,
	    taskTail,
	    clockLast = 0,
	    clockNow = 0,
	    clockSkew = 0,
	    clock = typeof performance === "object" && performance.now ? performance : Date,
	    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

	function now() {
	  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
	}

	function clearNow() {
	  clockNow = 0;
	}

	function Timer() {
	  this._call =
	  this._time =
	  this._next = null;
	}

	Timer.prototype = timer.prototype = {
	  constructor: Timer,
	  restart: function(callback, delay, time) {
	    if (typeof callback !== "function") throw new TypeError("callback is not a function");
	    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
	    if (!this._next && taskTail !== this) {
	      if (taskTail) taskTail._next = this;
	      else taskHead = this;
	      taskTail = this;
	    }
	    this._call = callback;
	    this._time = time;
	    sleep();
	  },
	  stop: function() {
	    if (this._call) {
	      this._call = null;
	      this._time = Infinity;
	      sleep();
	    }
	  }
	};

	function timer(callback, delay, time) {
	  var t = new Timer;
	  t.restart(callback, delay, time);
	  return t;
	}

	function timerFlush() {
	  now(); // Get the current time, if not already set.
	  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
	  var t = taskHead, e;
	  while (t) {
	    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
	    t = t._next;
	  }
	  --frame;
	}

	function wake() {
	  clockNow = (clockLast = clock.now()) + clockSkew;
	  frame = timeout = 0;
	  try {
	    timerFlush();
	  } finally {
	    frame = 0;
	    nap();
	    clockNow = 0;
	  }
	}

	function poke() {
	  var now = clock.now(), delay = now - clockLast;
	  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
	}

	function nap() {
	  var t0, t1 = taskHead, t2, time = Infinity;
	  while (t1) {
	    if (t1._call) {
	      if (time > t1._time) time = t1._time;
	      t0 = t1, t1 = t1._next;
	    } else {
	      t2 = t1._next, t1._next = null;
	      t1 = t0 ? t0._next = t2 : taskHead = t2;
	    }
	  }
	  taskTail = t0;
	  sleep(time);
	}

	function sleep(time) {
	  if (frame) return; // Soonest alarm already set, or will be.
	  if (timeout) timeout = clearTimeout(timeout);
	  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
	  if (delay > 24) {
	    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
	    if (interval) interval = clearInterval(interval);
	  } else {
	    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
	    frame = 1, setFrame(wake);
	  }
	}

	function timeout$1(callback, delay, time) {
	  var t = new Timer;
	  delay = delay == null ? 0 : +delay;
	  t.restart(function(elapsed) {
	    t.stop();
	    callback(elapsed + delay);
	  }, delay, time);
	  return t;
	}

	function interval$1(callback, delay, time) {
	  var t = new Timer, total = delay;
	  if (delay == null) return t.restart(callback, delay, time), t;
	  delay = +delay, time = time == null ? now() : +time;
	  t.restart(function tick(elapsed) {
	    elapsed += total;
	    t.restart(tick, total += delay, time);
	    callback(elapsed);
	  }, delay, time);
	  return t;
	}

	exports.interval = interval$1;
	exports.now = now;
	exports.timeout = timeout$1;
	exports.timer = timer;
	exports.timerFlush = timerFlush;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _uniqueId2 = __webpack_require__(67);

	var _uniqueId3 = _interopRequireDefault(_uniqueId2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _omit2 = __webpack_require__(90);

	var _omit3 = _interopRequireDefault(_omit2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _portal = __webpack_require__(124);

	var _portal2 = _interopRequireDefault(_portal);

	var _timer = __webpack_require__(64);

	var _timer2 = _interopRequireDefault(_timer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VictoryContainer = function (_React$Component) {
	  _inherits(VictoryContainer, _React$Component);

	  function VictoryContainer(props) {
	    _classCallCheck(this, VictoryContainer);

	    var _this = _possibleConstructorReturn(this, (VictoryContainer.__proto__ || Object.getPrototypeOf(VictoryContainer)).call(this, props));

	    _this.getTimer = _this.getTimer.bind(_this);
	    _this.containerId = (0, _uniqueId3.default)("victory-container-");
	    return _this;
	  }

	  _createClass(VictoryContainer, [{
	    key: "getChildContext",
	    value: function getChildContext() {
	      return {
	        portalUpdate: this.portalUpdate,
	        portalRegister: this.portalRegister,
	        portalDeregister: this.portalDeregister,
	        getTimer: this.getTimer
	      };
	    }
	  }, {
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _this2 = this;

	      this.savePortalRef = function (portal) {
	        _this2.portalRef = portal;
	        return portal;
	      };
	      this.portalUpdate = function (key, el) {
	        return _this2.portalRef.portalUpdate(key, el);
	      };
	      this.portalRegister = function () {
	        return _this2.portalRef.portalRegister();
	      };
	      this.portalDeregister = function (key) {
	        return _this2.portalRef.portalDeregister(key);
	      };
	    }
	  }, {
	    key: "componentWillUnmount",
	    value: function componentWillUnmount() {
	      if (!this.context.getTimer) {
	        this.getTimer().stop();
	      }
	    }
	  }, {
	    key: "getTimer",
	    value: function getTimer() {
	      if (this.context.getTimer) {
	        return this.context.getTimer();
	      }
	      if (!this.timer) {
	        this.timer = new _timer2.default();
	      }
	      return this.timer;
	    }
	  }, {
	    key: "getIdForElement",
	    value: function getIdForElement(elementName) {
	      return this.containerId + "-" + elementName;
	    }

	    // overridden in custom containers

	  }, {
	    key: "getChildren",
	    value: function getChildren(props) {
	      return props.children;
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderContainer",
	    value: function renderContainer(props, svgProps, style) {
	      var title = props.title,
	          desc = props.desc,
	          portalComponent = props.portalComponent,
	          className = props.className;

	      var children = this.getChildren(props);
	      var parentProps = (0, _defaults3.default)({ style: style, className: className }, svgProps);
	      return _react2.default.createElement(
	        "svg",
	        _extends({}, parentProps, { overflow: "visible" }),
	        _react2.default.createElement(
	          "svg",
	          parentProps,
	          children
	        ),
	        title ? _react2.default.createElement(
	          "title",
	          { id: this.getIdForElement("title") },
	          title
	        ) : null,
	        desc ? _react2.default.createElement(
	          "desc",
	          { id: this.getIdForElement("desc") },
	          desc
	        ) : null,
	        _react2.default.cloneElement(portalComponent, { ref: this.savePortalRef })
	      );
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _props = this.props,
	          width = _props.width,
	          height = _props.height,
	          responsive = _props.responsive,
	          events = _props.events;

	      var style = responsive ? this.props.style : (0, _omit3.default)(this.props.style, ["height", "width"]);
	      var svgProps = (0, _assign3.default)({
	        width: width, height: height, role: "img",
	        "aria-labelledby": this.getIdForElement("title") + " " + this.getIdForElement("desc"),
	        viewBox: responsive ? "0 0 " + width + " " + height : undefined
	      }, events);
	      return this.renderContainer(this.props, svgProps, style);
	    }
	  }]);

	  return VictoryContainer;
	}(_react2.default.Component);

	VictoryContainer.displayName = "VictoryContainer";
	VictoryContainer.role = "container";
	VictoryContainer.propTypes = {
	  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
	  className: _propTypes2.default.string,
	  desc: _propTypes2.default.string,
	  events: _propTypes2.default.object,
	  height: _propTypes2.default.number,
	  origin: _propTypes2.default.shape({ x: _propTypes2.default.number, y: _propTypes2.default.number }),
	  polar: _propTypes2.default.bool,
	  portalComponent: _propTypes2.default.element,
	  responsive: _propTypes2.default.bool,
	  style: _propTypes2.default.object,
	  theme: _propTypes2.default.object,
	  title: _propTypes2.default.string,
	  width: _propTypes2.default.number
	};
	VictoryContainer.defaultProps = {
	  portalComponent: _react2.default.createElement(_portal2.default, null),
	  responsive: true
	};
	VictoryContainer.contextTypes = {
	  getTimer: _propTypes2.default.func
	};
	VictoryContainer.childContextTypes = {
	  portalUpdate: _propTypes2.default.func,
	  portalRegister: _propTypes2.default.func,
	  portalDeregister: _propTypes2.default.func,
	  getTimer: _propTypes2.default.func
	};
	exports.default = VictoryContainer;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(68);

	/** Used to generate unique IDs. */
	var idCounter = 0;

	/**
	 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {string} [prefix=''] The value to prefix the ID with.
	 * @returns {string} Returns the unique ID.
	 * @example
	 *
	 * _.uniqueId('contact_');
	 * // => 'contact_104'
	 *
	 * _.uniqueId();
	 * // => '105'
	 */
	function uniqueId(prefix) {
	  var id = ++idCounter;
	  return toString(prefix) + id;
	}

	module.exports = uniqueId;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(3),
	    eq = __webpack_require__(70),
	    isIterateeCall = __webpack_require__(71),
	    keysIn = __webpack_require__(72);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Assigns own and inherited enumerable string keyed properties of source
	 * objects to the destination object for all destination properties that
	 * resolve to `undefined`. Source objects are applied from left to right.
	 * Once a property is set, additional values of the same property are ignored.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaultsDeep
	 * @example
	 *
	 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	 * // => { 'a': 1, 'b': 2 }
	 */
	var defaults = baseRest(function(object, sources) {
	  object = Object(object);

	  var index = -1;
	  var length = sources.length;
	  var guard = length > 2 ? sources[2] : undefined;

	  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	    length = 1;
	  }

	  while (++index < length) {
	    var source = sources[index];
	    var props = keysIn(source);
	    var propsIndex = -1;
	    var propsLength = props.length;

	    while (++propsIndex < propsLength) {
	      var key = props[propsIndex];
	      var value = object[key];

	      if (value === undefined ||
	          (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
	        object[key] = source[key];
	      }
	    }
	  }

	  return object;
	});

	module.exports = defaults;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	module.exports = eq;


/***/ }),
/* 71 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(73),
	    baseKeysIn = __webpack_require__(85),
	    isArrayLike = __webpack_require__(88);

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

	module.exports = keysIn;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(74),
	    isArguments = __webpack_require__(75),
	    isArray = __webpack_require__(76),
	    isBuffer = __webpack_require__(77),
	    isIndex = __webpack_require__(42),
	    isTypedArray = __webpack_require__(80);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = arrayLikeKeys;


/***/ }),
/* 74 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	module.exports = baseTimes;


/***/ }),
/* 75 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 76 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = isArray;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(19),
	    stubFalse = __webpack_require__(79);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(78)(module)))

/***/ }),
/* 78 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 79 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsTypedArray = __webpack_require__(81),
	    baseUnary = __webpack_require__(83),
	    nodeUtil = __webpack_require__(84);

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	module.exports = isTypedArray;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(55),
	    isLength = __webpack_require__(82),
	    isObjectLike = __webpack_require__(61);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	module.exports = baseIsTypedArray;


/***/ }),
/* 82 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ }),
/* 83 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	module.exports = baseUnary;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(20);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(78)(module)))

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18),
	    isPrototype = __webpack_require__(86),
	    nativeKeysIn = __webpack_require__(87);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }
	  var isProto = isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeysIn;


/***/ }),
/* 86 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 87 */
/***/ (function(module, exports) {

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn(object) {
	  var result = [];
	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = nativeKeysIn;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(89),
	    isLength = __webpack_require__(82);

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	module.exports = isArrayLike;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(55),
	    isObject = __webpack_require__(18);

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	module.exports = isFunction;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(91),
	    baseClone = __webpack_require__(92),
	    baseUnset = __webpack_require__(93),
	    castPath = __webpack_require__(94),
	    copyObject = __webpack_require__(105),
	    customOmitClone = __webpack_require__(108),
	    flatRest = __webpack_require__(109),
	    getAllKeysIn = __webpack_require__(114);

	/** Used to compose bitmasks for cloning. */
	var CLONE_DEEP_FLAG = 1,
	    CLONE_FLAT_FLAG = 2,
	    CLONE_SYMBOLS_FLAG = 4;

	/**
	 * The opposite of `_.pick`; this method creates an object composed of the
	 * own and inherited enumerable property paths of `object` that are not omitted.
	 *
	 * **Note:** This method is considerably slower than `_.pick`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to omit.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.omit(object, ['a', 'c']);
	 * // => { 'b': '2' }
	 */
	var omit = flatRest(function(object, paths) {
	  var result = {};
	  if (object == null) {
	    return result;
	  }
	  var isDeep = false;
	  paths = arrayMap(paths, function(path) {
	    path = castPath(path, object);
	    isDeep || (isDeep = path.length > 1);
	    return path;
	  });
	  copyObject(object, getAllKeysIn(object), result);
	  if (isDeep) {
	    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
	  }
	  var length = paths.length;
	  while (length--) {
	    baseUnset(result, paths[length]);
	  }
	  return result;
	});

	module.exports = omit;


/***/ }),
/* 91 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;


/***/ }),
/* 92 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(94),
	    last = __webpack_require__(100),
	    parent = __webpack_require__(101),
	    toKey = __webpack_require__(103);

	/**
	 * The base implementation of `_.unset`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The property path to unset.
	 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
	 */
	function baseUnset(object, path) {
	  path = castPath(path, object);
	  object = parent(object, path);
	  return object == null || delete object[toKey(last(path))];
	}

	module.exports = baseUnset;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(76),
	    isKey = __webpack_require__(95),
	    stringToPath = __webpack_require__(97),
	    toString = __webpack_require__(68);

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}

	module.exports = castPath;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(76),
	    isSymbol = __webpack_require__(96);

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	module.exports = isKey;


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(55),
	    isObjectLike = __webpack_require__(61);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && baseGetTag(value) == symbolTag);
	}

	module.exports = isSymbol;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	var memoizeCapped = __webpack_require__(98);

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	module.exports = stringToPath;


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(99);

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	module.exports = memoizeCapped;


/***/ }),
/* 99 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 100 */
/***/ (function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? array[length - 1] : undefined;
	}

	module.exports = last;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(102),
	    baseSlice = __webpack_require__(104);

	/**
	 * Gets the parent value at `path` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path to get the parent value of.
	 * @returns {*} Returns the parent value.
	 */
	function parent(object, path) {
	  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
	}

	module.exports = parent;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(94),
	    toKey = __webpack_require__(103);

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	module.exports = baseGet;


/***/ }),
/* 103 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 104 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;

	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}

	module.exports = baseSlice;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(106),
	    baseAssignValue = __webpack_require__(107);

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  var isNew = !object;
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];

	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : undefined;

	    if (newValue === undefined) {
	      newValue = source[key];
	    }
	    if (isNew) {
	      baseAssignValue(object, key, newValue);
	    } else {
	      assignValue(object, key, newValue);
	    }
	  }
	  return object;
	}

	module.exports = copyObject;


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(107),
	    eq = __webpack_require__(70);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	module.exports = assignValue;


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	var defineProperty = __webpack_require__(10);

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	module.exports = baseAssignValue;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	var isPlainObject = __webpack_require__(54);

	/**
	 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
	 * objects.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {string} key The key of the property to inspect.
	 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
	 */
	function customOmitClone(value) {
	  return isPlainObject(value) ? undefined : value;
	}

	module.exports = customOmitClone;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	var flatten = __webpack_require__(110),
	    overRest = __webpack_require__(5),
	    setToString = __webpack_require__(7);

	/**
	 * A specialized version of `baseRest` which flattens the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @returns {Function} Returns the new function.
	 */
	function flatRest(func) {
	  return setToString(overRest(func, undefined, flatten), func + '');
	}

	module.exports = flatRest;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(111);

	/**
	 * Flattens `array` a single level deep.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flatten([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, [3, [4]], 5]
	 */
	function flatten(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? baseFlatten(array, 1) : [];
	}

	module.exports = flatten;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(112),
	    isFlattenable = __webpack_require__(113);

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;


/***/ }),
/* 112 */
/***/ (function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	module.exports = arrayPush;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(56),
	    isArguments = __webpack_require__(75),
	    isArray = __webpack_require__(76);

	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}

	module.exports = isFlattenable;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(115),
	    getSymbolsIn = __webpack_require__(116),
	    keysIn = __webpack_require__(72);

	/**
	 * Creates an array of own and inherited enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeysIn(object) {
	  return baseGetAllKeys(object, keysIn, getSymbolsIn);
	}

	module.exports = getAllKeysIn;


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(112),
	    isArray = __webpack_require__(76);

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	module.exports = baseGetAllKeys;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(112),
	    getPrototype = __webpack_require__(59),
	    getSymbols = __webpack_require__(117),
	    stubArray = __webpack_require__(119);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own and inherited enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
	  var result = [];
	  while (object) {
	    arrayPush(result, getSymbols(object));
	    object = getPrototype(object);
	  }
	  return result;
	};

	module.exports = getSymbolsIn;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(118),
	    stubArray = __webpack_require__(119);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

	module.exports = getSymbols;


/***/ }),
/* 118 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	module.exports = arrayFilter;


/***/ }),
/* 119 */
/***/ (function(module, exports) {

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	module.exports = stubArray;


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(106),
	    copyObject = __webpack_require__(105),
	    createAssigner = __webpack_require__(121),
	    isArrayLike = __webpack_require__(88),
	    isPrototype = __webpack_require__(86),
	    keys = __webpack_require__(122);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Assigns own enumerable string keyed properties of source objects to the
	 * destination object. Source objects are applied from left to right.
	 * Subsequent sources overwrite property assignments of previous sources.
	 *
	 * **Note:** This method mutates `object` and is loosely based on
	 * [`Object.assign`](https://mdn.io/Object/assign).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.assignIn
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * function Bar() {
	 *   this.c = 3;
	 * }
	 *
	 * Foo.prototype.b = 2;
	 * Bar.prototype.d = 4;
	 *
	 * _.assign({ 'a': 0 }, new Foo, new Bar);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var assign = createAssigner(function(object, source) {
	  if (isPrototype(source) || isArrayLike(source)) {
	    copyObject(source, keys(source), object);
	    return;
	  }
	  for (var key in source) {
	    if (hasOwnProperty.call(source, key)) {
	      assignValue(object, key, source[key]);
	    }
	  }
	});

	module.exports = assign;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(3),
	    isIterateeCall = __webpack_require__(71);

	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return baseRest(function(object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;

	    customizer = (assigner.length > 3 && typeof customizer == 'function')
	      ? (length--, customizer)
	      : undefined;

	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    object = Object(object);
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }
	    return object;
	  });
	}

	module.exports = createAssigner;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(86),
	    nativeKeys = __webpack_require__(123);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeys;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(60);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);

	module.exports = nativeKeys;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Portal = function (_React$Component) {
	  _inherits(Portal, _React$Component);

	  function Portal(props) {
	    _classCallCheck(this, Portal);

	    var _this = _possibleConstructorReturn(this, (Portal.__proto__ || Object.getPrototypeOf(Portal)).call(this, props));

	    _this.map = {};
	    _this.index = 1;
	    _this.portalUpdate = _this.portalUpdate.bind(_this);
	    _this.portalRegister = _this.portalRegister.bind(_this);
	    _this.portalDeregister = _this.portalDeregister.bind(_this);
	    return _this;
	  }

	  _createClass(Portal, [{
	    key: "portalRegister",
	    value: function portalRegister() {
	      return ++this.index;
	    }
	  }, {
	    key: "portalUpdate",
	    value: function portalUpdate(key, element) {
	      this.map[key] = element;
	      this.forceUpdate();
	    }
	  }, {
	    key: "portalDeregister",
	    value: function portalDeregister(key) {
	      delete this.map[key];
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "render",
	    value: function render() {
	      var _this2 = this;

	      return _react2.default.cloneElement(this.props.groupComponent, {}, Object.keys(this.map).map(function (key) {
	        var el = _this2.map[key];
	        return el ? _react2.default.cloneElement(el, { key: key }) : el;
	      }));
	    }
	  }]);

	  return Portal;
	}(_react2.default.Component);

	Portal.displayName = "Portal";
	Portal.propTypes = {
	  groupComponent: _propTypes2.default.element
	};
	Portal.defaultProps = {
	  groupComponent: _react2.default.createElement("g", null)
	};
	exports.default = Portal;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _merge2 = __webpack_require__(126);

	var _merge3 = _interopRequireDefault(_merge2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _victoryPortal = __webpack_require__(147);

	var _victoryPortal2 = _interopRequireDefault(_victoryPortal);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _labelHelpers = __webpack_require__(193);

	var _labelHelpers2 = _interopRequireDefault(_labelHelpers);

	var _style = __webpack_require__(194);

	var _style2 = _interopRequireDefault(_style);

	var _log = __webpack_require__(148);

	var _log2 = _interopRequireDefault(_log);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var defaultStyles = {
	  fill: "#252525",
	  fontSize: 14,
	  fontFamily: "'Gill Sans', 'Gill Sans MT', 'Ser­avek', 'Trebuchet MS', sans-serif",
	  stroke: "transparent"
	};

	var VictoryLabel = function (_React$Component) {
	  _inherits(VictoryLabel, _React$Component);

	  function VictoryLabel() {
	    _classCallCheck(this, VictoryLabel);

	    return _possibleConstructorReturn(this, (VictoryLabel.__proto__ || Object.getPrototypeOf(VictoryLabel)).apply(this, arguments));
	  }

	  _createClass(VictoryLabel, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      this.cacheAttributes(this.calculateAttributes(this.props));
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var attrs = this.calculateAttributes(nextProps);
	      var style = attrs.style,
	          dx = attrs.dx,
	          dy = attrs.dy,
	          content = attrs.content,
	          lineHeight = attrs.lineHeight,
	          textAnchor = attrs.textAnchor,
	          transform = attrs.transform;
	      var _props = this.props,
	          angle = _props.angle,
	          className = _props.className,
	          datum = _props.datum,
	          x = _props.x,
	          y = _props.y;

	      if (!_collection2.default.allSetsEqual([[angle, nextProps.angle], [className, nextProps.className], [x, nextProps.x], [y, nextProps.y], [dx, this.dx], [dy, this.dy], [lineHeight, this.lineHeight], [textAnchor, this.textAnchor], [transform, this.transform], [content, this.content], [style, this.style], [datum, nextProps.datum]])) {
	        this.cacheAttributes(attrs);
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "cacheAttributes",
	    value: function cacheAttributes(attrs) {
	      var style = attrs.style,
	          dx = attrs.dx,
	          dy = attrs.dy,
	          content = attrs.content,
	          textAnchor = attrs.textAnchor,
	          transform = attrs.transform,
	          lineHeight = attrs.lineHeight;

	      this.style = style;
	      this.dx = dx;
	      this.dy = dy;
	      this.content = content;
	      this.textAnchor = textAnchor;
	      this.lineHeight = lineHeight;
	      this.transform = transform;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = this.getStyles(props);
	      var lineHeight = this.getHeight(props, "lineHeight");
	      var textAnchor = props.textAnchor ? _helpers2.default.evaluateProp(props.textAnchor, props.datum) : "start";
	      var content = this.getContent(props);
	      var dx = props.dx ? _helpers2.default.evaluateProp(this.props.dx, props.datum) : 0;
	      var dy = this.getDy(props, style, content, lineHeight);
	      var transform = this.getTransform(props, style);
	      return {
	        style: style, dx: dx, dy: dy, content: content, lineHeight: lineHeight, textAnchor: textAnchor, transform: transform
	      };
	    }
	  }, {
	    key: "getStyle",
	    value: function getStyle(props, style) {
	      style = style ? (0, _merge3.default)({}, defaultStyles, style) : defaultStyles;
	      var datum = props.datum || props.data;
	      var baseStyles = _helpers2.default.evaluateStyle(style, datum, props.active);
	      return (0, _assign3.default)({}, baseStyles, { fontSize: this.getFontSize(baseStyles) });
	    }
	  }, {
	    key: "getStyles",
	    value: function getStyles(props) {
	      var _this2 = this;

	      return Array.isArray(props.style) ? props.style.map(function (style) {
	        return _this2.getStyle(props, style);
	      }) : [this.getStyle(props, props.style)];
	    }
	  }, {
	    key: "getHeight",
	    value: function getHeight(props, type) {
	      var datum = props.datum || props.data;
	      return _helpers2.default.evaluateProp(props[type], datum, props.active);
	    }
	  }, {
	    key: "getContent",
	    value: function getContent(props) {
	      if (props.text === undefined || props.text === null) {
	        return [" "];
	      }
	      var datum = props.datum || props.data;
	      if (Array.isArray(props.text)) {
	        return props.text.map(function (line) {
	          return _helpers2.default.evaluateProp(line, datum, props.active);
	        });
	      }
	      var child = _helpers2.default.evaluateProp(props.text, datum, props.active);
	      return ("" + child).split("\n");
	    }
	  }, {
	    key: "getDy",
	    value: function getDy(props, style, content, lineHeight) {
	      //eslint-disable-line max-params
	      var fontSize = style[0].fontSize;
	      var datum = props.datum || props.data;
	      var dy = props.dy ? _helpers2.default.evaluateProp(props.dy, datum) : 0;
	      var length = content.length;
	      var capHeight = this.getHeight(props, "capHeight");
	      var verticalAnchor = style.verticalAnchor || props.verticalAnchor;
	      var anchor = verticalAnchor ? _helpers2.default.evaluateProp(verticalAnchor, datum) : "middle";
	      switch (anchor) {
	        case "end":
	          return dy + (capHeight / 2 + (0.5 - length) * lineHeight) * fontSize;
	        case "middle":
	          return dy + (capHeight / 2 + (0.5 - length / 2) * lineHeight) * fontSize;
	        default:
	          return dy + (capHeight / 2 + lineHeight / 2) * fontSize;
	      }
	    }
	  }, {
	    key: "getTransform",
	    value: function getTransform(props, style) {
	      var datum = props.datum,
	          x = props.x,
	          y = props.y,
	          polar = props.polar;

	      var defaultAngle = polar ? _labelHelpers2.default.getPolarAngle(props) : 0;
	      var angle = style.angle || props.angle || defaultAngle;
	      var transform = props.transform || style.transform;
	      var transformPart = transform && _helpers2.default.evaluateProp(transform, datum);
	      var rotatePart = angle && { rotate: [angle, x, y] };
	      return transformPart || angle ? _style2.default.toTransformString(transformPart, rotatePart) : undefined;
	    }
	  }, {
	    key: "getFontSize",
	    value: function getFontSize(style) {
	      var baseSize = style && style.fontSize;
	      if (typeof baseSize === "number") {
	        return baseSize;
	      } else if (baseSize === undefined || baseSize === null) {
	        return defaultStyles.fontSize;
	      } else if (typeof baseSize === "string") {
	        var fontSize = +baseSize.replace("px", "");
	        if (!isNaN(fontSize)) {
	          return fontSize;
	        } else {
	          _log2.default.warn("fontSize should be expressed as a number of pixels");
	          return defaultStyles.fontSize;
	        }
	      }
	      return defaultStyles.fontSize;
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderElements",
	    value: function renderElements(props) {
	      var _this3 = this;

	      var textProps = {
	        dx: this.dx, dy: this.dy, x: props.x, y: props.y,
	        transform: this.transform, className: props.className
	      };
	      return _react2.default.createElement(
	        "text",
	        _extends({}, textProps, props.events),
	        this.props.title && _react2.default.createElement(
	          "title",
	          null,
	          this.props.title
	        ),
	        this.props.desc && _react2.default.createElement(
	          "desc",
	          null,
	          this.props.desc
	        ),
	        this.content.map(function (line, i) {
	          var style = _this3.style[i] || _this3.style[0];
	          var lastStyle = _this3.style[i - 1] || _this3.style[0];
	          var fontSize = (style.fontSize + lastStyle.fontSize) / 2;
	          var textAnchor = style.textAnchor || _this3.textAnchor;
	          var dy = i ? _this3.lineHeight * fontSize : undefined;
	          return _react2.default.createElement(
	            "tspan",
	            { key: i, x: props.x, dy: dy, dx: _this3.dx, style: style, textAnchor: textAnchor },
	            line
	          );
	        })
	      );
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var label = this.renderElements(this.props);
	      return this.props.renderInPortal ? _react2.default.createElement(
	        _victoryPortal2.default,
	        null,
	        label
	      ) : label;
	    }
	  }]);

	  return VictoryLabel;
	}(_react2.default.Component);

	VictoryLabel.displayName = "VictoryLabel";
	VictoryLabel.role = "label";
	VictoryLabel.propTypes = {
	  active: _propTypes2.default.bool,
	  angle: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
	  capHeight: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes4.default.nonNegative, _propTypes2.default.func]),
	  className: _propTypes2.default.string,
	  data: _propTypes2.default.array,
	  datum: _propTypes2.default.any,
	  desc: _propTypes2.default.string,
	  dx: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.func]),
	  dy: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.func]),
	  events: _propTypes2.default.object,
	  index: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
	  labelPlacement: _propTypes2.default.oneOf(["parallel", "perpendicular", "vertical"]),
	  lineHeight: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes4.default.nonNegative, _propTypes2.default.func]),
	  origin: _propTypes2.default.shape({ x: _propTypes2.default.number, y: _propTypes2.default.number }),
	  polar: _propTypes2.default.bool,
	  renderInPortal: _propTypes2.default.bool,
	  style: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
	  text: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.func, _propTypes2.default.array]),
	  textAnchor: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(["start", "middle", "end", "inherit"]), _propTypes2.default.func]),
	  title: _propTypes2.default.string,
	  transform: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.func]),
	  verticalAnchor: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(["start", "middle", "end"]), _propTypes2.default.func]),
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	};
	VictoryLabel.defaultProps = {
	  capHeight: 0.71, // Magic number from d3.
	  lineHeight: 1
	};
	exports.default = VictoryLabel;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMerge = __webpack_require__(127),
	    createAssigner = __webpack_require__(121);

	/**
	 * This method is like `_.assign` except that it recursively merges own and
	 * inherited enumerable string keyed properties of source objects into the
	 * destination object. Source properties that resolve to `undefined` are
	 * skipped if a destination value exists. Array and plain object properties
	 * are merged recursively. Other objects and value types are overridden by
	 * assignment. Source objects are applied from left to right. Subsequent
	 * sources overwrite property assignments of previous sources.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.5.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * var object = {
	 *   'a': [{ 'b': 2 }, { 'd': 4 }]
	 * };
	 *
	 * var other = {
	 *   'a': [{ 'c': 3 }, { 'e': 5 }]
	 * };
	 *
	 * _.merge(object, other);
	 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
	 */
	var merge = createAssigner(function(object, source, srcIndex) {
	  baseMerge(object, source, srcIndex);
	});

	module.exports = merge;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(128),
	    assignMergeValue = __webpack_require__(135),
	    baseFor = __webpack_require__(136),
	    baseMergeDeep = __webpack_require__(138),
	    isObject = __webpack_require__(18),
	    keysIn = __webpack_require__(72),
	    safeGet = __webpack_require__(145);

	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMerge(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }
	  baseFor(source, function(srcValue, key) {
	    stack || (stack = new Stack);
	    if (isObject(srcValue)) {
	      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	    }
	    else {
	      var newValue = customizer
	        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
	        : undefined;

	      if (newValue === undefined) {
	        newValue = srcValue;
	      }
	      assignMergeValue(object, key, newValue);
	    }
	  }, keysIn);
	}

	module.exports = baseMerge;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(129),
	    listCacheDelete = __webpack_require__(130),
	    listCacheGet = __webpack_require__(132),
	    listCacheHas = __webpack_require__(133),
	    listCacheSet = __webpack_require__(134);

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;


/***/ }),
/* 129 */
/***/ (function(module, exports) {

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}

	module.exports = listCacheClear;


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(131);

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	module.exports = listCacheDelete;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(70);

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	module.exports = assocIndexOf;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(131);

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	module.exports = listCacheGet;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(131);

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	module.exports = listCacheHas;


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(131);

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	module.exports = listCacheSet;


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(107),
	    eq = __webpack_require__(70);

	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignMergeValue(object, key, value) {
	  if ((value !== undefined && !eq(object[key], value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	module.exports = assignMergeValue;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(137);

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ }),
/* 137 */
/***/ (function(module, exports) {

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

	var assignMergeValue = __webpack_require__(135),
	    cloneBuffer = __webpack_require__(139),
	    cloneTypedArray = __webpack_require__(140),
	    copyArray = __webpack_require__(41),
	    initCloneObject = __webpack_require__(143),
	    isArguments = __webpack_require__(75),
	    isArray = __webpack_require__(76),
	    isArrayLikeObject = __webpack_require__(144),
	    isBuffer = __webpack_require__(77),
	    isFunction = __webpack_require__(89),
	    isObject = __webpack_require__(18),
	    isPlainObject = __webpack_require__(54),
	    isTypedArray = __webpack_require__(80),
	    safeGet = __webpack_require__(145),
	    toPlainObject = __webpack_require__(146);

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = safeGet(object, key),
	      srcValue = safeGet(source, key),
	      stacked = stack.get(srcValue);

	  if (stacked) {
	    assignMergeValue(object, key, stacked);
	    return;
	  }
	  var newValue = customizer
	    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
	    : undefined;

	  var isCommon = newValue === undefined;

	  if (isCommon) {
	    var isArr = isArray(srcValue),
	        isBuff = !isArr && isBuffer(srcValue),
	        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

	    newValue = srcValue;
	    if (isArr || isBuff || isTyped) {
	      if (isArray(objValue)) {
	        newValue = objValue;
	      }
	      else if (isArrayLikeObject(objValue)) {
	        newValue = copyArray(objValue);
	      }
	      else if (isBuff) {
	        isCommon = false;
	        newValue = cloneBuffer(srcValue, true);
	      }
	      else if (isTyped) {
	        isCommon = false;
	        newValue = cloneTypedArray(srcValue, true);
	      }
	      else {
	        newValue = [];
	      }
	    }
	    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      newValue = objValue;
	      if (isArguments(objValue)) {
	        newValue = toPlainObject(objValue);
	      }
	      else if (!isObject(objValue) || isFunction(objValue)) {
	        newValue = initCloneObject(srcValue);
	      }
	    }
	    else {
	      isCommon = false;
	    }
	  }
	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }
	  assignMergeValue(object, key, newValue);
	}

	module.exports = baseMergeDeep;


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(19);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var length = buffer.length,
	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

	  buffer.copy(result);
	  return result;
	}

	module.exports = cloneBuffer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(78)(module)))

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(141);

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	module.exports = cloneTypedArray;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

	var Uint8Array = __webpack_require__(142);

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}

	module.exports = cloneArrayBuffer;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(19);

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

	module.exports = Uint8Array;


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(17),
	    getPrototype = __webpack_require__(59),
	    isPrototype = __webpack_require__(86);

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}

	module.exports = initCloneObject;


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(88),
	    isObjectLike = __webpack_require__(61);

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	module.exports = isArrayLikeObject;


/***/ }),
/* 145 */
/***/ (function(module, exports) {

	/**
	 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function safeGet(object, key) {
	  if (key === 'constructor' && typeof object[key] === 'function') {
	    return;
	  }

	  if (key == '__proto__') {
	    return;
	  }

	  return object[key];
	}

	module.exports = safeGet;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(105),
	    keysIn = __webpack_require__(72);

	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */
	function toPlainObject(value) {
	  return copyObject(value, keysIn(value));
	}

	module.exports = toPlainObject;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _omit2 = __webpack_require__(90);

	var _omit3 = _interopRequireDefault(_omit2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _log = __webpack_require__(148);

	var _log2 = _interopRequireDefault(_log);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VictoryPortal = function (_React$Component) {
	  _inherits(VictoryPortal, _React$Component);

	  function VictoryPortal() {
	    _classCallCheck(this, VictoryPortal);

	    return _possibleConstructorReturn(this, (VictoryPortal.__proto__ || Object.getPrototypeOf(VictoryPortal)).apply(this, arguments));
	  }

	  _createClass(VictoryPortal, [{
	    key: "componentDidMount",
	    value: function componentDidMount() {
	      if (!this.checkedContext) {
	        if (typeof this.context.portalUpdate !== "function") {
	          var msg = "`renderInPortal` is not supported outside of `VictoryContainer`. " + "Component will be rendered in place";
	          _log2.default.warn(msg);
	          this.renderInPlace = true;
	        }
	        this.checkedContext = true;
	      }
	      this.forceUpdate();
	    }
	  }, {
	    key: "componentDidUpdate",
	    value: function componentDidUpdate() {
	      if (!this.renderInPlace) {
	        this.portalKey = this.portalKey || this.context.portalRegister();
	        this.context.portalUpdate(this.portalKey, this.element);
	      }
	    }
	  }, {
	    key: "componentWillUnmount",
	    value: function componentWillUnmount() {
	      if (this.context && this.context.portalDeregister) {
	        this.context.portalDeregister(this.portalKey);
	      }
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderPortal",
	    value: function renderPortal(child) {
	      if (this.renderInPlace) {
	        return child;
	      }
	      this.element = child;
	      return null;
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var children = this.props.children;

	      var childProps = children && children.props || {};
	      var child = children && _react2.default.cloneElement(children, (0, _defaults3.default)({}, childProps, (0, _omit3.default)(this.props, "children")));
	      return this.renderPortal(child);
	    }
	  }]);

	  return VictoryPortal;
	}(_react2.default.Component);

	VictoryPortal.propTypes = {
	  children: _propTypes2.default.node
	};
	VictoryPortal.contextTypes = {
	  portalDeregister: _propTypes2.default.func,
	  portalRegister: _propTypes2.default.func,
	  portalUpdate: _propTypes2.default.func
	};
	exports.default = VictoryPortal;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/* global console */
	/* eslint-disable no-console */

	// TODO: Use "warning" npm module like React is switching to.
	exports.default = {
	  warn: function (message) {
	    if (process.env.NODE_ENV !== "production") {
	      if (console && console.warn) {
	        console.warn(message);
	      }
	    }
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(149)))

/***/ }),
/* 149 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _find2 = __webpack_require__(151);

	var _find3 = _interopRequireDefault(_find2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _log = __webpack_require__(148);

	var _log2 = _interopRequireDefault(_log);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /*eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2] }]*/


	/**
	 * Return a new validator based on `validator` but with the option to chain
	 * `isRequired` onto the validation. This is nearly identical to how React
	 * does it internally, but they don't expose their helper for us to use.
	 * @param {Function} validator Validation function.
	 * @returns {Function} Validator with `isRequired` option.
	 */
	var makeChainable = function (validator) {
	  /* eslint-disable max-params */
	  var _chainable = function (isRequired, props, propName, componentName) {
	    var value = props[propName];
	    if (typeof value === "undefined" || value === null) {
	      if (isRequired) {
	        return new Error("Required `" + propName + "` was not specified in `" + componentName + "`.");
	      }
	      return null;
	    }

	    for (var _len = arguments.length, rest = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
	      rest[_key - 4] = arguments[_key];
	    }

	    return validator.apply(undefined, [props, propName, componentName].concat(rest));
	  };
	  var chainable = _chainable.bind(null, false);
	  chainable.isRequired = _chainable.bind(null, true);
	  return chainable;
	};

	var nullConstructor = function () {
	  return null;
	};
	var undefinedConstructor = function () {
	  return undefined;
	};

	/**
	 * Get the constructor of `value`. If `value` is null or undefined, return the
	 * special singletons `nullConstructor` or `undefinedConstructor`, respectively.
	 * @param {*} value Instance to return the constructor of.
	 * @returns {Function} Constructor of `value`.
	 */
	var getConstructor = function (value) {
	  if (typeof value === "undefined") {
	    return undefinedConstructor;
	  } else if (value === null) {
	    return nullConstructor;
	  } else {
	    return value.constructor;
	  }
	};

	/**
	 * Get the name of the constructor used to create `value`, using
	 * `Object.protoype.toString`. If the value is null or undefined, return
	 * "null" or "undefined", respectively.
	 * @param {*} value Instance to return the constructor name of.
	 * @returns {String} Name of the constructor.
	 */
	var getConstructorName = function (value) {
	  if (typeof value === "undefined") {
	    return "undefined";
	  } else if (value === null) {
	    return "null";
	  }
	  return Object.prototype.toString.call(value).slice(8, -1); // eslint-disable-line no-magic-numbers
	};

	exports.default = {
	  /**
	   * Return a new validator based on `propType` but which logs a `console.error`
	   * with `explanation` if used.
	   * @param {Function} propType The old, deprecated propType.
	   * @param {String} explanation The message to provide the user of the deprecated propType.
	   * @returns {Function} Validator which logs usage of this propType
	   */
	  deprecated: function (propType, explanation) {
	    return function (props, propName, componentName) {
	      var value = props[propName];
	      if (value !== null && value !== undefined) {
	        _log2.default.warn("\"" + propName + "\" property of \"" + componentName + "\" has been deprecated " + explanation);
	      }
	      return _propTypes2.default.checkPropTypes(_defineProperty({}, propName, propType), props, propName, componentName);
	    };
	  },


	  /**
	   * Return a new validator which returns true
	   * if and only if all validators passed as arguments return true.
	   * Like React.propTypes.oneOfType, except "all" instead of "any"
	   * @param {Array} validators Validation functions.
	   * @returns {Function} Combined validator function
	   */
	  allOfType: function (validators) {
	    return makeChainable(function (props, propName, componentName) {
	      for (var _len2 = arguments.length, rest = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
	        rest[_key2 - 3] = arguments[_key2];
	      }

	      return validators.reduce(function (result, validator) {
	        return result || validator.apply(undefined, [props, propName, componentName].concat(rest));
	      }, undefined);
	    });
	  },


	  /**
	   * Check that the value is a non-negative number.
	   */
	  nonNegative: makeChainable(function (props, propName, componentName) {
	    var value = props[propName];
	    if (typeof value !== "number" || value < 0) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be a non-negative number.");
	    }
	    return undefined;
	  }),

	  /**
	   * Check that the value is an integer.
	   */
	  integer: makeChainable(function (props, propName, componentName) {
	    var value = props[propName];
	    if (typeof value !== "number" || value % 1 !== 0) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be an integer.");
	    }
	    return undefined;
	  }),

	  /**
	   * Check that the value is greater than zero.
	   */
	  greaterThanZero: makeChainable(function (props, propName, componentName) {
	    var value = props[propName];
	    if (typeof value !== "number" || value <= 0) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be a number greater than zero.");
	    }
	    return undefined;
	  }),

	  /**
	   * Check that the value is an Array of two unique values.
	   */
	  domain: makeChainable(function (props, propName, componentName) {
	    var value = props[propName];
	    if (!Array.isArray(value) || value.length !== 2 || value[1] === value[0]) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be an array of two unique numeric values.");
	    }
	    return undefined;
	  }),

	  /**
	   * Check that the value looks like a d3 `scale` function.
	   */
	  scale: makeChainable(function (props, propName, componentName) {
	    var supportedScaleStrings = ["linear", "time", "log", "sqrt"];
	    var validScale = function (scl) {
	      if ((0, _isFunction3.default)(scl)) {
	        return (0, _isFunction3.default)(scl.copy) && (0, _isFunction3.default)(scl.domain) && (0, _isFunction3.default)(scl.range);
	      } else if (typeof scl === "string") {
	        return supportedScaleStrings.indexOf(scl) !== -1;
	      }
	      return false;
	    };

	    var value = props[propName];
	    if (!validScale(value)) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be a d3 scale.");
	    }
	    return undefined;
	  }),

	  /**
	   * Check that an array contains items of the same type.
	   */
	  homogeneousArray: makeChainable(function (props, propName, componentName) {
	    var values = props[propName];
	    if (!Array.isArray(values)) {
	      return new Error("`" + propName + "` in `" + componentName + "` must be an array.");
	    }

	    if (values.length < 2) {
	      return undefined;
	    }

	    var comparisonConstructor = getConstructor(values[0]);

	    var typeMismatchedValue = (0, _find3.default)(values, function (value) {
	      return comparisonConstructor !== getConstructor(value);
	    });

	    if (typeMismatchedValue) {
	      var constructorName = getConstructorName(values[0]);
	      var otherConstructorName = getConstructorName(typeMismatchedValue);

	      return new Error("Expected `" + propName + "` in `" + componentName + "` to be a " + ("homogeneous array, but found types `" + constructorName + "` and ") + ("`" + otherConstructorName + "`."));
	    }
	    return undefined;
	  }),

	  /**
	   * Check that array prop length matches props.data.length
	   */
	  matchDataLength: makeChainable(function (props, propName) {
	    if (props[propName] && Array.isArray(props[propName]) && props[propName].length !== props.data.length) {
	      return new Error("Length of data and " + propName + " arrays must match.");
	    }
	    return undefined;
	  })
	};

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

	var createFind = __webpack_require__(152),
	    findIndex = __webpack_require__(188);

	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to inspect.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {*} Returns the matched element, else `undefined`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'age': 36, 'active': true },
	 *   { 'user': 'fred',    'age': 40, 'active': false },
	 *   { 'user': 'pebbles', 'age': 1,  'active': true }
	 * ];
	 *
	 * _.find(users, function(o) { return o.age < 40; });
	 * // => object for 'barney'
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.find(users, { 'age': 1, 'active': true });
	 * // => object for 'pebbles'
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.find(users, ['active', false]);
	 * // => object for 'fred'
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.find(users, 'active');
	 * // => object for 'barney'
	 */
	var find = createFind(findIndex);

	module.exports = find;


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIteratee = __webpack_require__(153),
	    isArrayLike = __webpack_require__(88),
	    keys = __webpack_require__(122);

	/**
	 * Creates a `_.find` or `_.findLast` function.
	 *
	 * @private
	 * @param {Function} findIndexFunc The function to find the collection index.
	 * @returns {Function} Returns the new find function.
	 */
	function createFind(findIndexFunc) {
	  return function(collection, predicate, fromIndex) {
	    var iterable = Object(collection);
	    if (!isArrayLike(collection)) {
	      var iteratee = baseIteratee(predicate, 3);
	      collection = keys(collection);
	      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
	    }
	    var index = findIndexFunc(collection, predicate, fromIndex);
	    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
	  };
	}

	module.exports = createFind;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(154),
	    baseMatchesProperty = __webpack_require__(180),
	    identity = __webpack_require__(4),
	    isArray = __webpack_require__(76),
	    property = __webpack_require__(185);

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	module.exports = baseIteratee;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(155),
	    getMatchData = __webpack_require__(177),
	    matchesStrictComparable = __webpack_require__(179);

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	module.exports = baseMatches;


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(128),
	    baseIsEqual = __webpack_require__(156);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(157),
	    isObjectLike = __webpack_require__(61);

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	module.exports = baseIsEqual;


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(128),
	    equalArrays = __webpack_require__(158),
	    equalByTag = __webpack_require__(165),
	    equalObjects = __webpack_require__(168),
	    getTag = __webpack_require__(170),
	    isArray = __webpack_require__(76),
	    isBuffer = __webpack_require__(77),
	    isTypedArray = __webpack_require__(80);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	module.exports = baseIsEqualDeep;


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(159),
	    arraySome = __webpack_require__(163),
	    cacheHas = __webpack_require__(164);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	module.exports = equalArrays;


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(160),
	    setCacheAdd = __webpack_require__(161),
	    setCacheHas = __webpack_require__(162);

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	module.exports = SetCache;


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(129),
	    listCacheDelete = __webpack_require__(130),
	    listCacheGet = __webpack_require__(132),
	    listCacheHas = __webpack_require__(133),
	    listCacheSet = __webpack_require__(134);

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;


/***/ }),
/* 161 */
/***/ (function(module, exports) {

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	module.exports = setCacheAdd;


/***/ }),
/* 162 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	module.exports = setCacheHas;


/***/ }),
/* 163 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arraySome;


/***/ }),
/* 164 */
/***/ (function(module, exports) {

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	module.exports = cacheHas;


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(56),
	    Uint8Array = __webpack_require__(142),
	    eq = __webpack_require__(70),
	    equalArrays = __webpack_require__(158),
	    mapToArray = __webpack_require__(166),
	    setToArray = __webpack_require__(167);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ }),
/* 166 */
/***/ (function(module, exports) {

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	module.exports = mapToArray;


/***/ }),
/* 167 */
/***/ (function(module, exports) {

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	module.exports = setToArray;


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

	var getAllKeys = __webpack_require__(169);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	module.exports = equalObjects;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(115),
	    getSymbols = __webpack_require__(117),
	    keys = __webpack_require__(122);

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	module.exports = getAllKeys;


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(171),
	    Map = __webpack_require__(172),
	    Promise = __webpack_require__(173),
	    Set = __webpack_require__(174),
	    WeakMap = __webpack_require__(175),
	    baseGetTag = __webpack_require__(55),
	    toSource = __webpack_require__(176);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	module.exports = getTag;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    root = __webpack_require__(19);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	module.exports = DataView;


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    root = __webpack_require__(19);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    root = __webpack_require__(19);

	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');

	module.exports = Promise;


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    root = __webpack_require__(19);

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	module.exports = Set;


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    root = __webpack_require__(19);

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	module.exports = WeakMap;


/***/ }),
/* 176 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var funcProto = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	module.exports = toSource;


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(178),
	    keys = __webpack_require__(122);

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}

	module.exports = getMatchData;


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	module.exports = isStrictComparable;


/***/ }),
/* 179 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	module.exports = matchesStrictComparable;


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(156),
	    get = __webpack_require__(181),
	    hasIn = __webpack_require__(182),
	    isKey = __webpack_require__(95),
	    isStrictComparable = __webpack_require__(178),
	    matchesStrictComparable = __webpack_require__(179),
	    toKey = __webpack_require__(103);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(102);

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	module.exports = get;


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(183),
	    hasPath = __webpack_require__(184);

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	module.exports = hasIn;


/***/ }),
/* 183 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}

	module.exports = baseHasIn;


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(94),
	    isArguments = __webpack_require__(75),
	    isArray = __webpack_require__(76),
	    isIndex = __webpack_require__(42),
	    isLength = __webpack_require__(82),
	    toKey = __webpack_require__(103);

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}

	module.exports = hasPath;


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(186),
	    basePropertyDeep = __webpack_require__(187),
	    isKey = __webpack_require__(95),
	    toKey = __webpack_require__(103);

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}

	module.exports = property;


/***/ }),
/* 186 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(102);

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	module.exports = basePropertyDeep;


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(36),
	    baseIteratee = __webpack_require__(153),
	    toInteger = __webpack_require__(47);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * This method is like `_.find` except that it returns the index of the first
	 * element `predicate` returns truthy for instead of the element itself.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {number} Returns the index of the found element, else `-1`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'active': false },
	 *   { 'user': 'fred',    'active': false },
	 *   { 'user': 'pebbles', 'active': true }
	 * ];
	 *
	 * _.findIndex(users, function(o) { return o.user == 'barney'; });
	 * // => 0
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.findIndex(users, { 'user': 'fred', 'active': false });
	 * // => 1
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.findIndex(users, ['active', false]);
	 * // => 0
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.findIndex(users, 'active');
	 * // => 2
	 */
	function findIndex(array, predicate, fromIndex) {
	  var length = array == null ? 0 : array.length;
	  if (!length) {
	    return -1;
	  }
	  var index = fromIndex == null ? 0 : toInteger(fromIndex);
	  if (index < 0) {
	    index = nativeMax(length + index, 0);
	  }
	  return baseFindIndex(array, baseIteratee(predicate, 3), index);
	}

	module.exports = findIndex;


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _isEqual2 = __webpack_require__(190);

	var _isEqual3 = _interopRequireDefault(_isEqual2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	exports.default = {
	  isNonEmptyArray: function (collection) {
	    return Array.isArray(collection) && collection.length > 0;
	  },
	  containsStrings: function (collection) {
	    return Array.isArray(collection) && collection.some(function (value) {
	      return typeof value === "string";
	    });
	  },
	  containsDates: function (collection) {
	    return Array.isArray(collection) && collection.some(function (value) {
	      return value instanceof Date;
	    });
	  },
	  containsNumbers: function (collection) {
	    return Array.isArray(collection) && collection.some(function (value) {
	      return typeof value === "number";
	    });
	  },
	  containsOnlyStrings: function (collection) {
	    return this.isNonEmptyArray(collection) && collection.every(function (value) {
	      return typeof value === "string";
	    });
	  },
	  isArrayOfArrays: function (collection) {
	    return this.isNonEmptyArray(collection) && collection.every(Array.isArray);
	  },
	  removeUndefined: function (arr) {
	    return arr.filter(function (el) {
	      return el !== undefined;
	    });
	  },
	  getMaxValue: function (arr) {
	    for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      values[_key - 1] = arguments[_key];
	    }

	    var array = arr.concat(values);
	    return this.containsDates(array) ? new Date(Math.max.apply(Math, _toConsumableArray(array))) : Math.max.apply(Math, _toConsumableArray(array));
	  },
	  getMinValue: function (arr) {
	    for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	      values[_key2 - 1] = arguments[_key2];
	    }

	    var array = arr.concat(values);
	    return this.containsDates(array) ? new Date(Math.min.apply(Math, _toConsumableArray(array))) : Math.min.apply(Math, _toConsumableArray(array));
	  },


	  /**
	   * Split array into subarrays using a delimiter function. Items qualifying as
	   * delimiters are excluded from the subarrays. Functions similarly to String.split
	   *
	   * Example:
	   * const array = [1, 2, 3, "omit", 4, 5, "omit", 6]
	   * splitArray(array, (item) => item === "omit");
	   * => [[1, 2, 3], [4, 5], [6]]
	   *
	   * @param {Array}    array        An array of items
	   * @param {Function} delimiterFn  A function indicating values to be used as delimiters
	   * @returns {Object}              Array of subarrays
	   */
	  splitArray: function (array, delimiterFn) {
	    var segmentStartIndex = 0;
	    var segments = array.reduce(function (memo, item, index) {
	      if (delimiterFn(item)) {
	        memo = memo.concat([array.slice(segmentStartIndex, index)]);
	        segmentStartIndex = index + 1;
	      } else if (index === array.length - 1) {
	        memo = memo.concat([array.slice(segmentStartIndex, array.length)]);
	      }
	      return memo;
	    }, []);

	    return segments.filter(function (segment) {
	      return Array.isArray(segment) && segment.length > 0;
	    });
	  },


	  /**
	   * Takes an array of arrays. Returns whether each subarray has equivalent items.
	   * Each subarray should have two items. Used for componentShouldUpdate functions.
	   *
	   * Example:
	   * const propComparisons = [
	   *   [x, nextProps.x],
	   *   [y, nextProps.y],
	   *   [style, this.style]
	   * ];
	   *
	   * allSetsEqual(propComparisons);
	   * => true
	   *
	   * @param {Array}    itemSets     An array of item sets
	   * @returns {Boolean}             Whether all item comparisons are equal
	   */
	  allSetsEqual: function (itemSets) {
	    return itemSets.every(function (comparisonSet) {
	      return (0, _isEqual3.default)(comparisonSet[0], comparisonSet[1]);
	    });
	  }
	};

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(156);

	/**
	 * Performs a deep comparison between two values to determine if they are
	 * equivalent.
	 *
	 * **Note:** This method supports comparing arrays, array buffers, booleans,
	 * date objects, error objects, maps, numbers, `Object` objects, regexes,
	 * sets, strings, symbols, and typed arrays. `Object` objects are compared
	 * by their own, not inherited, enumerable properties. Functions and DOM
	 * nodes are compared by strict equality, i.e. `===`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.isEqual(object, other);
	 * // => true
	 *
	 * object === other;
	 * // => false
	 */
	function isEqual(value, other) {
	  return baseIsEqual(value, other);
	}

	module.exports = isEqual;


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _reduce2 = __webpack_require__(192);

	var _reduce3 = _interopRequireDefault(_reduce2);

	var _omit2 = __webpack_require__(90);

	var _omit3 = _interopRequireDefault(_omit2);

	var _property2 = __webpack_require__(185);

	var _property3 = _interopRequireDefault(_property2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  getPoint: function (datum) {
	    var exists = function (val) {
	      return val !== undefined;
	    };
	    var _x = datum._x,
	        _x1 = datum._x1,
	        _x0 = datum._x0,
	        _voronoiX = datum._voronoiX,
	        _y = datum._y,
	        _y1 = datum._y1,
	        _y0 = datum._y0,
	        _voronoiY = datum._voronoiY;

	    var defaultX = exists(_x1) ? _x1 : _x;
	    var defaultY = exists(_y1) ? _y1 : _y;
	    return {
	      x: exists(_voronoiX) ? _voronoiX : defaultX,
	      x0: exists(_x0) ? _x0 : _x,
	      y: exists(_voronoiY) ? _voronoiY : defaultY,
	      y0: exists(_y0) ? _y0 : _y
	    };
	  },
	  scalePoint: function (props, datum) {
	    var scale = props.scale,
	        polar = props.polar;

	    var d = this.getPoint(datum);
	    var origin = props.origin || { x: 0, y: 0 };
	    var x = scale.x(d.x);
	    var x0 = scale.x(d.x0);
	    var y = scale.y(d.y);
	    var y0 = scale.y(d.y0);
	    return {
	      x: polar ? y * Math.cos(x) + origin.x : x,
	      x0: polar ? y0 * Math.cos(x0) + origin.x : x0,
	      y: polar ? -y * Math.sin(x) + origin.y : y,
	      y0: polar ? -y0 * Math.sin(x0) + origin.x : y0
	    };
	  },
	  getPadding: function (props) {
	    var padding = typeof props.padding === "number" ? props.padding : 0;
	    var paddingObj = typeof props.padding === "object" ? props.padding : {};
	    return {
	      top: paddingObj.top || padding,
	      bottom: paddingObj.bottom || padding,
	      left: paddingObj.left || padding,
	      right: paddingObj.right || padding
	    };
	  },
	  getStyles: function (style, defaultStyles) {
	    var width = "100%";
	    var height = "100%";
	    if (!style) {
	      return (0, _defaults3.default)({ parent: { height: height, width: width } }, defaultStyles);
	    }

	    var data = style.data,
	        labels = style.labels,
	        parent = style.parent;

	    var defaultParent = defaultStyles && defaultStyles.parent || {};
	    var defaultLabels = defaultStyles && defaultStyles.labels || {};
	    var defaultData = defaultStyles && defaultStyles.data || {};
	    return {
	      parent: (0, _defaults3.default)({}, parent, defaultParent, { width: width, height: height }),
	      labels: (0, _defaults3.default)({}, labels, defaultLabels),
	      data: (0, _defaults3.default)({}, data, defaultData)
	    };
	  },
	  evaluateProp: function (prop, data, active) {
	    return (0, _isFunction3.default)(prop) ? prop(data, active) : prop;
	  },
	  evaluateStyle: function (style, data, active) {
	    var _this = this;

	    if (!style || !Object.keys(style).some(function (value) {
	      return (0, _isFunction3.default)(style[value]);
	    })) {
	      return style;
	    }
	    return Object.keys(style).reduce(function (prev, curr) {
	      prev[curr] = _this.evaluateProp(style[curr], data, active);
	      return prev;
	    }, {});
	  },
	  degreesToRadians: function (degrees) {
	    return degrees * (Math.PI / 180);
	  },
	  radiansToDegrees: function (radians) {
	    return radians / (Math.PI / 180);
	  },
	  getRadius: function (props) {
	    var _getPadding = this.getPadding(props),
	        left = _getPadding.left,
	        right = _getPadding.right,
	        top = _getPadding.top,
	        bottom = _getPadding.bottom;

	    var width = props.width,
	        height = props.height;

	    return Math.min(width - left - right, height - top - bottom) / 2;
	  },
	  getPolarOrigin: function (props) {
	    var width = props.width,
	        height = props.height;

	    var _getPadding2 = this.getPadding(props),
	        top = _getPadding2.top,
	        bottom = _getPadding2.bottom,
	        left = _getPadding2.left,
	        right = _getPadding2.right;

	    var radius = Math.min(width - left - right, height - top - bottom) / 2;
	    var offsetWidth = width / 2 + left - right;
	    var offsetHeight = height / 2 + top - bottom;
	    return {
	      x: offsetWidth + radius > width ? radius + left - right : offsetWidth,
	      y: offsetHeight + radius > height ? radius + top - bottom : offsetHeight
	    };
	  },
	  getRange: function (props, axis) {
	    if (props.range && props.range[axis]) {
	      return props.range[axis];
	    } else if (props.range && Array.isArray(props.range)) {
	      return props.range;
	    }
	    return props.polar ? this.getPolarRange(props, axis) : this.getCartesianRange(props, axis);
	  },
	  getCartesianRange: function (props, axis) {
	    // determine how to lay the axis and what direction positive and negative are
	    var isVertical = axis !== "x";
	    var padding = this.getPadding(props);
	    if (isVertical) {
	      return [props.height - padding.bottom, padding.top];
	    }
	    return [padding.left, props.width - padding.right];
	  },
	  getPolarRange: function (props, axis) {
	    if (axis === "x") {
	      var startAngle = this.degreesToRadians(props.startAngle || 0);
	      var endAngle = this.degreesToRadians(props.endAngle || 360);
	      return [startAngle, endAngle];
	    }
	    return [props.innerRadius || 0, this.getRadius(props)];
	  },
	  createAccessor: function (key) {
	    // creates a data accessor function
	    // given a property key, path, array index, or null for identity.
	    if ((0, _isFunction3.default)(key)) {
	      return key;
	    } else if (key === null || typeof key === "undefined") {
	      // null/undefined means "return the data item itself"
	      return function (x) {
	        return x;
	      };
	    }
	    // otherwise, assume it is an array index, property key or path (_.property handles all three)
	    return (0, _property3.default)(key);
	  },
	  modifyProps: function (props, fallbackProps, role) {
	    var theme = props.theme && props.theme[role] ? props.theme[role] : {};
	    var themeProps = (0, _omit3.default)(theme, ["style"]);
	    return (0, _defaults3.default)({}, props, themeProps, fallbackProps);
	  },


	  // Axis helpers

	  /**
	   * Returns the given axis or the opposite axis when horizontal
	   * @param {string} axis: the given axis, either "x" pr "y"
	   * @param {Boolean} horizontal: true when the chart is flipped to the horizontal orientation
	   * @returns {String} the dimension appropriate for the axis given its props "x" or "y"
	   */
	  getCurrentAxis: function (axis, horizontal) {
	    var otherAxis = axis === "x" ? "y" : "x";
	    return horizontal ? otherAxis : axis;
	  },


	  /**
	   * @param {Object} props: axis component props
	   * @returns {Boolean} true when the axis is vertical
	   */
	  isVertical: function (props) {
	    var orientation = props.orientation || (props.dependentAxis ? "left" : "bottom");
	    var vertical = { top: false, bottom: false, left: true, right: true };
	    return vertical[orientation];
	  },


	  /**
	   * @param {Object} props: axis component props
	   * @returns {Boolean} true when tickValues contain strings
	   */
	  stringTicks: function (props) {
	    return props.tickValues !== undefined && _collection2.default.containsStrings(props.tickValues);
	  },


	  /**
	   * @param {Array} children: an array of child components
	   * @param {Function} iteratee: a function with arguments "child", "childName", and "parent"
	   * @returns {Array} returns an array of results from calling the iteratee on all nested children
	   */
	  reduceChildren: function (children, iteratee) {
	    var childIndex = 0;
	    var traverseChildren = function (childArray, parent) {
	      return (0, _reduce3.default)(childArray, function (memo, child) {
	        var childName = child.props.name || childIndex;
	        childIndex++;
	        if (child.props && child.props.children) {
	          var nestedChildren = _react2.default.Children.toArray(child.props.children);
	          var nestedResults = traverseChildren(nestedChildren, child);
	          memo = memo.concat(nestedResults);
	        } else {
	          var result = iteratee(child, childName, parent);
	          memo = result ? memo.concat(result) : memo;
	        }
	        return memo;
	      }, []);
	    };
	    return traverseChildren(children);
	  }
	};

/***/ }),
/* 192 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	module.exports = arrayReduce;


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  getText: function (props, datum, index) {
	    if (datum.label !== undefined) {
	      return datum.label;
	    }
	    return Array.isArray(props.labels) ? props.labels[index] : props.labels;
	  },
	  getVerticalAnchor: function (props, datum) {
	    var sign = datum._y >= 0 ? 1 : -1;
	    var labelStyle = props.style && props.style.labels || {};
	    if (datum.getVerticalAnchor || labelStyle.verticalAnchor) {
	      return datum.getVerticalAnchor || labelStyle.verticalAnchor;
	    } else if (!props.horizontal) {
	      return sign >= 0 ? "end" : "start";
	    } else {
	      return "middle";
	    }
	  },
	  getTextAnchor: function (props, datum) {
	    var style = props.style,
	        horizontal = props.horizontal;

	    var sign = datum._y >= 0 ? 1 : -1;
	    var labelStyle = style && style.labels || {};
	    if (datum.getVerticalAnchor || labelStyle.verticalAnchor) {
	      return datum.getVerticalAnchor || labelStyle.verticalAnchor;
	    } else if (!horizontal) {
	      return "middle";
	    } else {
	      return sign >= 0 ? "start" : "end";
	    }
	  },
	  getAngle: function (props, datum) {
	    var labelStyle = props.style && props.style.labels || {};
	    return datum.angle || labelStyle.angle;
	  },
	  getPadding: function (props, datum) {
	    var horizontal = props.horizontal,
	        style = props.style;

	    var labelStyle = style.labels || {};
	    var defaultPadding = labelStyle.padding || 0;
	    var sign = datum._y < 0 ? -1 : 1;
	    return {
	      x: horizontal ? sign * defaultPadding : 0,
	      y: horizontal ? 0 : sign * defaultPadding
	    };
	  },
	  getPosition: function (props, datum) {
	    var horizontal = props.horizontal,
	        polar = props.polar;

	    var _Helpers$scalePoint = _helpers2.default.scalePoint(props, datum),
	        x = _Helpers$scalePoint.x,
	        y = _Helpers$scalePoint.y;

	    var padding = this.getPadding(props, datum);
	    if (!polar) {
	      return {
	        x: horizontal ? y + padding.x : x + padding.x,
	        y: horizontal ? x + padding.y : y - padding.y
	      };
	    } else {
	      var degrees = this.getDegrees(props, datum);
	      var polarPadding = this.getPolarPadding(props, degrees);
	      return {
	        x: x + polarPadding.x,
	        y: y + polarPadding.y
	      };
	    }
	  },
	  getPolarPadding: function (props, degrees) {
	    var labelStyle = props.style.labels || {};
	    var padding = labelStyle.padding || 0;
	    var angle = _helpers2.default.degreesToRadians(degrees);
	    return {
	      x: padding * Math.cos(angle), y: -padding * Math.sin(angle)
	    };
	  },
	  getLabelPlacement: function (props) {
	    var labelComponent = props.labelComponent,
	        labelPlacement = props.labelPlacement,
	        polar = props.polar;

	    var defaultLabelPlacement = polar ? "perpendicular" : "vertical";
	    return labelPlacement ? labelPlacement : labelComponent.props && labelComponent.props.labelPlacement || defaultLabelPlacement;
	  },
	  getPolarOrientation: function (degrees) {
	    if (degrees < 45 || degrees > 315) {
	      // eslint-disable-line no-magic-numbers
	      return "right";
	    } else if (degrees >= 45 && degrees <= 135) {
	      // eslint-disable-line no-magic-numbers
	      return "top";
	    } else if (degrees > 135 && degrees < 225) {
	      // eslint-disable-line no-magic-numbers
	      return "left";
	    } else {
	      return "bottom";
	    }
	  },
	  getPolarTextAnchor: function (props, degrees) {
	    var labelPlacement = this.getLabelPlacement(props);
	    if (labelPlacement === "perpendicular" || labelPlacement === "vertical" && (degrees === 90 || degrees === 270)) {
	      return "middle";
	    }
	    return degrees <= 90 || degrees > 270 ? "start" : "end";
	  },
	  getPolarVerticalAnchor: function (props, degrees) {
	    var labelPlacement = this.getLabelPlacement(props);
	    var orientation = this.getPolarOrientation(degrees);
	    if (labelPlacement === "parallel" || orientation === "left" || orientation === "right") {
	      return "middle";
	    }
	    return orientation === "top" ? "end" : "start";
	  },
	  getPolarAngle: function (props, baseAngle) {
	    var labelPlacement = props.labelPlacement,
	        datum = props.datum;

	    if (!labelPlacement || labelPlacement === "vertical") {
	      return 0;
	    }
	    var degrees = baseAngle !== undefined ? baseAngle : this.getDegrees(props, datum);
	    var sign = degrees > 90 && degrees < 180 || degrees > 270 ? 1 : -1;
	    var angle = void 0;
	    if (degrees === 0 || degrees === 180) {
	      angle = 90;
	    } else if (degrees > 0 && degrees < 180) {
	      angle = 90 - degrees;
	    } else if (degrees > 180 && degrees < 360) {
	      angle = 270 - degrees;
	    }
	    var labelRotation = labelPlacement === "perpendicular" ? 0 : 90;
	    return angle + sign * labelRotation;
	  },
	  getDegrees: function (props, datum) {
	    var _Helpers$getPoint = _helpers2.default.getPoint(datum),
	        x = _Helpers$getPoint.x;

	    return _helpers2.default.radiansToDegrees(props.scale.x(x));
	  },
	  getProps: function (props, index) {
	    var scale = props.scale,
	        data = props.data,
	        style = props.style,
	        horizontal = props.horizontal,
	        polar = props.polar;

	    var datum = data[index];
	    var degrees = this.getDegrees(props, datum);
	    var textAnchor = polar ? this.getPolarTextAnchor(props, degrees) : this.getTextAnchor(props, datum);
	    var verticalAnchor = polar ? this.getPolarVerticalAnchor(props, degrees) : this.getVerticalAnchor(props, datum);
	    var angle = this.getAngle(props, datum);
	    var text = this.getText(props, datum, index);
	    var labelPlacement = this.getLabelPlacement(props);

	    var _getPosition = this.getPosition(props, datum),
	        x = _getPosition.x,
	        y = _getPosition.y;

	    return {
	      angle: angle, data: data, datum: datum, horizontal: horizontal, index: index, polar: polar, scale: scale, labelPlacement: labelPlacement,
	      text: text, textAnchor: textAnchor, verticalAnchor: verticalAnchor, x: x, y: y, style: style.labels
	    };
	  }
	};

/***/ }),
/* 194 */
/***/ (function(module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Given an object with CSS/SVG transform definitions, return the string value
	 * for use with the `transform` CSS property or SVG attribute. Note that we
	 * can't always guarantee the order will match the author's intended order, so
	 * authors should only use the object notation if they know that their transform
	 * is commutative or that there is only one.
	 * @param {Object} obj An object of transform definitions.
	 * @returns {String} The generated transform string.
	 */
	var toTransformString = function (obj) {
	  for (var _len = arguments.length, more = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    more[_key - 1] = arguments[_key];
	  }

	  if (more.length > 0) {
	    return more.reduce(function (memo, currentObj) {
	      return [memo, toTransformString(currentObj)].join(" ");
	    }, toTransformString(obj));
	  } else {
	    if (!obj || typeof obj === "string") {
	      return obj;
	    }
	    var transforms = [];
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        var value = obj[key];
	        transforms.push(key + "(" + value + ")");
	      }
	    }
	    return transforms.join(" ");
	  }
	};

	exports.default = {

	  toTransformString: toTransformString,

	  /**
	   * Given the name of a color scale, getColorScale will return an array
	   * of 5 hex string values in that color scale. If no 'name' parameter
	   * is given, it will return the Victory default grayscale.
	   * @param {String} name The name of the color scale to return (optional).
	   * @returns {Array} An array of 5 hex string values composing a color scale.
	   */
	  getColorScale: function (name) {
	    var scales = {
	      grayscale: ["#cccccc", "#969696", "#636363", "#252525"],
	      qualitative: ["#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "#DF5A49", "#4F7DA1", "#55DBC1", "#EFDA97", "#E2A37F", "#DF948A"],
	      heatmap: ["#428517", "#77D200", "#D6D305", "#EC8E19", "#C92B05"],
	      warm: ["#940031", "#C43343", "#DC5429", "#FF821D", "#FFAF55"],
	      cool: ["#2746B9", "#0B69D4", "#2794DB", "#31BB76", "#60E83B"],
	      red: ["#FCAE91", "#FB6A4A", "#DE2D26", "#A50F15", "#750B0E"],
	      blue: ["#002C61", "#004B8F", "#006BC9", "#3795E5", "#65B4F4"],
	      green: ["#354722", "#466631", "#649146", "#8AB25C", "#A9C97E"]
	    };
	    return name ? scales[name] : scales.grayscale;
	  }
	};

/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _pick2 = __webpack_require__(196);

	var _pick3 = _interopRequireDefault(_pick2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _victoryAnimation = __webpack_require__(51);

	var _victoryAnimation2 = _interopRequireDefault(_victoryAnimation);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _timer = __webpack_require__(64);

	var _timer2 = _interopRequireDefault(_timer);

	var _transitions = __webpack_require__(200);

	var _transitions2 = _interopRequireDefault(_transitions);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VictoryTransition = function (_React$Component) {
	  _inherits(VictoryTransition, _React$Component);

	  function VictoryTransition(props) {
	    _classCallCheck(this, VictoryTransition);

	    var _this = _possibleConstructorReturn(this, (VictoryTransition.__proto__ || Object.getPrototypeOf(VictoryTransition)).call(this, props));

	    _this.state = {
	      nodesShouldLoad: false,
	      nodesDoneLoad: false
	    };
	    var child = _this.props.children;
	    var polar = child.props.polar;
	    _this.continuous = !polar && child.type && child.type.continuous === true;
	    _this.getTransitionState = _this.getTransitionState.bind(_this);
	    _this.getTimer = _this.getTimer.bind(_this);
	    return _this;
	  }

	  _createClass(VictoryTransition, [{
	    key: "componentDidMount",
	    value: function componentDidMount() {
	      this.setState({ nodesShouldLoad: true }); //eslint-disable-line react/no-did-mount-set-state
	    }
	  }, {
	    key: "componentWillReceiveProps",
	    value: function componentWillReceiveProps(nextProps) {
	      var _this2 = this;

	      this.getTimer().bypassAnimation();
	      this.setState(this.getTransitionState(this.props, nextProps), function () {
	        return _this2.getTimer().resumeAnimation();
	      });
	    }
	  }, {
	    key: "componentWillUnmount",
	    value: function componentWillUnmount() {
	      this.getTimer().stop();
	    }
	  }, {
	    key: "getTimer",
	    value: function getTimer() {
	      if (this.context.getTimer) {
	        return this.context.getTimer();
	      }
	      if (!this.timer) {
	        this.timer = new _timer2.default();
	      }
	      return this.timer;
	    }
	  }, {
	    key: "getTransitionState",
	    value: function getTransitionState(props, nextProps) {
	      var animate = props.animate;

	      if (!animate) {
	        return {};
	      } else if (animate.parentState) {
	        var state = animate.parentState;
	        var oldProps = state.nodesWillExit ? props : null;
	        return { oldProps: oldProps, nextProps: nextProps };
	      } else {
	        var oldChildren = _react2.default.Children.toArray(props.children);
	        var nextChildren = _react2.default.Children.toArray(nextProps.children);

	        var _Transitions$getIniti = _transitions2.default.getInitialTransitionState(oldChildren, nextChildren),
	            nodesWillExit = _Transitions$getIniti.nodesWillExit,
	            nodesWillEnter = _Transitions$getIniti.nodesWillEnter,
	            childrenTransitions = _Transitions$getIniti.childrenTransitions,
	            nodesShouldEnter = _Transitions$getIniti.nodesShouldEnter;

	        return {
	          nodesWillExit: nodesWillExit,
	          nodesWillEnter: nodesWillEnter,
	          childrenTransitions: childrenTransitions,
	          nodesShouldEnter: nodesShouldEnter,
	          oldProps: nodesWillExit ? props : null,
	          nextProps: nextProps
	        };
	      }
	    }
	  }, {
	    key: "getDomainFromChildren",
	    value: function getDomainFromChildren(props, axis) {
	      var getChildDomains = function (children) {
	        return children.reduce(function (memo, child) {
	          if (child.type && (0, _isFunction3.default)(child.type.getDomain)) {
	            var childDomain = child.props && child.type.getDomain(child.props, axis);
	            return childDomain ? memo.concat(childDomain) : memo;
	          } else if (child.props && child.props.children) {
	            return memo.concat(getChildDomains(_react2.default.Children.toArray(child.props.children)));
	          }
	          return memo;
	        }, []);
	      };

	      var child = _react2.default.Children.toArray(props.children)[0];
	      var childProps = child.props || {};
	      var domain = Array.isArray(childProps.domain) ? childProps.domain : childProps.domain && childProps.domain[axis];
	      if (!childProps.children && domain) {
	        return domain;
	      } else {
	        var childDomains = getChildDomains([child]);
	        return childDomains.length === 0 ? [0, 1] : [_collection2.default.getMinValue(childDomains), _collection2.default.getMaxValue(childDomains)];
	      }
	    }
	  }, {
	    key: "pickProps",
	    value: function pickProps() {
	      if (!this.state) {
	        return this.props;
	      }
	      return this.state.nodesWillExit ? this.state.oldProps || this.props : this.props;
	    }
	  }, {
	    key: "pickDomainProps",
	    value: function pickDomainProps(props) {
	      var parentState = props.animate && props.animate.parentState;
	      if (parentState && parentState.nodesWillExit) {
	        return this.continous || parentState.continuous ? parentState.nextProps || this.state.nextProps || props : props;
	      }
	      return this.continuous && this.state.nodesWillExit ? this.state.nextProps || props : props;
	    }
	  }, {
	    key: "getClipWidth",
	    value: function getClipWidth(props, child) {
	      var getDefaultClipWidth = function () {
	        var range = _helpers2.default.getRange(child.props, "x");
	        return range ? Math.abs(range[1] - range[0]) : props.width;
	      };
	      var clipWidth = this.transitionProps ? this.transitionProps.clipWidth : undefined;
	      return clipWidth !== undefined ? clipWidth : getDefaultClipWidth();
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _this3 = this;

	      var props = this.pickProps();
	      var getTransitionProps = this.props.animate && this.props.animate.getTransitions ? this.props.animate.getTransitions : _transitions2.default.getTransitionPropsFactory(props, this.state, function (newState) {
	        return _this3.setState(newState);
	      });
	      var child = _react2.default.Children.toArray(props.children)[0];
	      var transitionProps = getTransitionProps(child);
	      this.transitionProps = transitionProps;
	      var domain = {
	        x: this.getDomainFromChildren(this.pickDomainProps(props), "x"),
	        y: this.getDomainFromChildren(props, "y")
	      };
	      var clipWidth = this.getClipWidth(props, child);
	      var combinedProps = (0, _defaults3.default)({ domain: domain, clipWidth: clipWidth }, transitionProps, child.props);
	      var animationWhitelist = props.animationWhitelist || [];
	      var whitelist = animationWhitelist.concat(["clipWidth"]);
	      var propsToAnimate = whitelist.length ? (0, _pick3.default)(combinedProps, whitelist) : combinedProps;
	      return _react2.default.createElement(
	        _victoryAnimation2.default,
	        _extends({}, combinedProps.animate, { data: propsToAnimate }),
	        function (newProps) {
	          if (child.props.groupComponent) {
	            var groupComponent = _this3.continuous ? _react2.default.cloneElement(child.props.groupComponent, { clipWidth: newProps.clipWidth || 0 }) : child.props.groupComponent;
	            return _react2.default.cloneElement(child, (0, _defaults3.default)({ animate: null, groupComponent: groupComponent }, newProps, combinedProps));
	          }
	          return _react2.default.cloneElement(child, (0, _defaults3.default)({ animate: null }, newProps, combinedProps));
	        }
	      );
	    }
	  }]);

	  return VictoryTransition;
	}(_react2.default.Component);

	VictoryTransition.displayName = "VictoryTransition";
	VictoryTransition.propTypes = {
	  animate: _propTypes2.default.object,
	  animationWhitelist: _propTypes2.default.array,
	  children: _propTypes2.default.node
	};
	exports.default = VictoryTransition;

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

	var basePick = __webpack_require__(197),
	    flatRest = __webpack_require__(109);

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to pick.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = flatRest(function(object, paths) {
	  return object == null ? {} : basePick(object, paths);
	});

	module.exports = pick;


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

	var basePickBy = __webpack_require__(198),
	    hasIn = __webpack_require__(182);

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property identifiers.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick(object, paths) {
	  return basePickBy(object, paths, function(value, path) {
	    return hasIn(object, path);
	  });
	}

	module.exports = basePick;


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(102),
	    baseSet = __webpack_require__(199),
	    castPath = __webpack_require__(94);

	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy(object, paths, predicate) {
	  var index = -1,
	      length = paths.length,
	      result = {};

	  while (++index < length) {
	    var path = paths[index],
	        value = baseGet(object, path);

	    if (predicate(value, path)) {
	      baseSet(result, castPath(path, object), value);
	    }
	  }
	  return result;
	}

	module.exports = basePickBy;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(106),
	    castPath = __webpack_require__(94),
	    isIndex = __webpack_require__(42),
	    isObject = __webpack_require__(18),
	    toKey = __webpack_require__(103);

	/**
	 * The base implementation of `_.set`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The path of the property to set.
	 * @param {*} value The value to set.
	 * @param {Function} [customizer] The function to customize path creation.
	 * @returns {Object} Returns `object`.
	 */
	function baseSet(object, path, value, customizer) {
	  if (!isObject(object)) {
	    return object;
	  }
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      lastIndex = length - 1,
	      nested = object;

	  while (nested != null && ++index < length) {
	    var key = toKey(path[index]),
	        newValue = value;

	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject(objValue)
	          ? objValue
	          : (isIndex(path[index + 1]) ? [] : {});
	      }
	    }
	    assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}

	module.exports = baseSet;


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _identity2 = __webpack_require__(4);

	var _identity3 = _interopRequireDefault(_identity2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getDatumKey(datum, idx) {
	  return (datum.key || idx).toString();
	} /* eslint-disable func-style */


	function getKeyedData(data) {
	  return data.children.reduce(function (keyedData, datum, idx) {
	    var key = getDatumKey(datum, idx);
	    keyedData[key] = datum;
	    return keyedData;
	  }, {});
	}

	function getKeyedDataDifference(a, b) {
	  var hasDifference = false;
	  var difference = Object.keys(a).reduce(function (_difference, key) {
	    if (!(key in b)) {
	      hasDifference = true;
	      _difference[key] = true;
	    }
	    return _difference;
	  }, {});
	  return hasDifference && difference;
	}

	/**
	 * Calculate which data-points exist in oldData and not nextData -
	 * these are the `exiting` data-points.  Also calculate which
	 * data-points exist in nextData and not oldData - these are the
	 * `entering` data-points.
	 *
	 * @param  {Array} oldData   this.props.data Array
	 * @param  {Array} nextData  this.props.data Array
	 *
	 * @return {Object}          Object with `entering` and `exiting` properties.
	 *                           entering[datum.key] will be true if the data is
	 *                           entering, and similarly for `exiting`.
	 */
	function getNodeTransitions(oldData, nextData) {
	  var oldDataKeyed = oldData && getKeyedData(oldData);
	  var nextDataKeyed = nextData && getKeyedData(nextData);

	  return {
	    entering: oldDataKeyed && getKeyedDataDifference(nextDataKeyed, oldDataKeyed),
	    exiting: nextDataKeyed && getKeyedDataDifference(oldDataKeyed, nextDataKeyed)
	  };
	}

	function getChildData(child) {
	  if (child.type && child.type.getData) {
	    return child.type.getData(child.props);
	  }
	  return child.props && child.props.data || false;
	}

	/**
	 * If a parent component has animation enabled, calculate the transitions
	 * for any data of any child component that supports data transitions
	 * Data transitions are defined as any two datasets where data nodes exist
	 * in the first set and not the second, in the second and not the first,
	 * or both.
	 *
	 * @param  {Children}  oldChildren   this.props.children from old props
	 * @param  {Children}  nextChildren  this.props.children from next props
	 *
	 * @return {Object}                  Object with the following properties:
	 *                                    - nodesWillExit
	 *                                    - nodesWillEnter
	 *                                    - childrenTransitions
	 *                                    - nodesShouldEnter
	 */
	function getInitialTransitionState(oldChildren, nextChildren) {
	  var nodesWillExit = false;
	  var nodesWillEnter = false;

	  var getTransition = function (oldChild, newChild) {
	    if (!newChild || oldChild.type !== newChild.type) {
	      return {};
	    }

	    var _ref = getNodeTransitions(getChildData(oldChild), getChildData(newChild)) || {},
	        entering = _ref.entering,
	        exiting = _ref.exiting;

	    nodesWillExit = nodesWillExit || !!exiting;
	    nodesWillEnter = nodesWillEnter || !!entering;

	    return { entering: entering || false, exiting: exiting || false };
	  };

	  var getTransitionsFromChildren = function (old, next) {
	    return old.map(function (child, idx) {
	      if (child && child.props && child.props.children) {
	        return getTransitionsFromChildren(_react2.default.Children.toArray(old[idx].props.children), _react2.default.Children.toArray(next[idx].props.children));
	      }
	      // get Transition entering and exiting nodes
	      return getTransition(child, next[idx]);
	    });
	  };

	  var childrenTransitions = getTransitionsFromChildren(_react2.default.Children.toArray(oldChildren), _react2.default.Children.toArray(nextChildren));
	  return {
	    nodesWillExit: nodesWillExit,
	    nodesWillEnter: nodesWillEnter,
	    childrenTransitions: childrenTransitions,
	    // TODO: This may need to be refactored for the following situation.
	    //       The component receives new props, and the data provided
	    //       is a perfect match for the previous data and domain except
	    //       for new nodes. In this case, we wouldn't want a delay before
	    //       the new nodes appear.
	    nodesShouldEnter: false
	  };
	}

	function getInitialChildProps(animate, data) {
	  var after = animate.onEnter && animate.onEnter.after ? animate.onEnter.after : _identity3.default;
	  return {
	    data: data.map(function (datum, idx) {
	      return (0, _assign3.default)({}, datum, after(datum, idx, data));
	    })
	  };
	}

	function getChildBeforeLoad(animate, child, data, cb) {
	  // eslint-disable-line max-params
	  animate = (0, _assign3.default)({}, animate, { onEnd: cb });
	  if (animate && animate.onLoad && !animate.onLoad.duration) {
	    return { animate: animate, data: data };
	  }
	  var before = animate.onLoad && animate.onLoad.before ? animate.onLoad.before : _identity3.default;
	  // If nodes need to exit, transform them with the provided onLoad.before function.
	  data = data.map(function (datum, idx) {
	    return (0, _assign3.default)({}, datum, before(datum, idx, data));
	  });

	  return { animate: animate, data: data, clipWidth: 0 };
	}

	function getChildOnLoad(animate, data, cb) {
	  // eslint-disable-line max-params
	  animate = (0, _assign3.default)({}, animate, { onEnd: cb });
	  if (animate && animate.onLoad && !animate.onLoad.duration) {
	    return { animate: animate, data: data };
	  }
	  var after = animate.onLoad && animate.onLoad.after ? animate.onLoad.after : _identity3.default;
	  // If nodes need to exit, transform them with the provided onLoad.after function.
	  data = data.map(function (datum, idx) {
	    return (0, _assign3.default)({}, datum, after(datum, idx, data));
	  });

	  return { animate: animate, data: data };
	}

	function getChildPropsOnExit(animate, child, data, exitingNodes, cb) {
	  // eslint-disable-line max-params, max-len
	  // Whether or not _this_ child has exiting nodes, we want the exit-
	  // transition for all children to have the same duration, delay, etc.
	  var onExit = animate && animate.onExit;
	  animate = (0, _assign3.default)({}, animate, onExit);

	  if (exitingNodes) {
	    // After the exit transition occurs, trigger the animations for
	    // nodes that are neither exiting or entering.
	    animate.onEnd = cb;
	    var before = animate.onExit && animate.onExit.before ? animate.onExit.before : _identity3.default;
	    // If nodes need to exit, transform them with the provided onExit.before function.
	    data = data.map(function (datum, idx) {
	      var key = (datum.key || idx).toString();
	      return exitingNodes[key] ? (0, _assign3.default)({}, datum, before(datum, idx, data)) : datum;
	    });
	  }

	  return { animate: animate, data: data };
	}

	function getChildPropsBeforeEnter(animate, child, data, enteringNodes, cb) {
	  // eslint-disable-line max-params,max-len
	  if (enteringNodes) {
	    // Perform a normal animation here, except - when it finishes - trigger
	    // the transition for entering nodes.
	    animate = (0, _assign3.default)({}, animate, { onEnd: cb });
	    var before = animate.onEnter && animate.onEnter.before ? animate.onEnter.before : _identity3.default;
	    // We want the entering nodes to be included in the transition target
	    // domain.  However, we may not want these nodes to be displayed initially,
	    // so perform the `onEnter.before` transformation on each node.
	    data = data.map(function (datum, idx) {
	      var key = (datum.key || idx).toString();
	      return enteringNodes[key] ? (0, _assign3.default)({}, datum, before(datum, idx, data)) : datum;
	    });
	  }

	  return { animate: animate, data: data };
	}

	function getChildPropsOnEnter(animate, data, enteringNodes, cb) {
	  // eslint-disable-line max-params, max-len
	  // Whether or not _this_ child has entering nodes, we want the entering-
	  // transition for all children to have the same duration, delay, etc.
	  var onEnter = animate && animate.onEnter;
	  animate = (0, _assign3.default)({}, animate, onEnter);

	  if (enteringNodes) {
	    // Old nodes have been transitioned to their new values, and the
	    // domain should encompass the nodes that will now enter. So perform
	    // the `onEnter.after` transformation on each node.
	    animate.onEnd = cb;
	    var after = animate.onEnter && animate.onEnter.after ? animate.onEnter.after : _identity3.default;
	    data = data.map(function (datum, idx) {
	      var key = getDatumKey(datum, idx);
	      return enteringNodes[key] ? (0, _assign3.default)({}, datum, after(datum, idx, data)) : datum;
	    });
	  }
	  return { animate: animate, data: data };
	}

	/**
	 * getTransitionPropsFactory - putting the Java in JavaScript.  This will return a
	 * function that returns prop transformations for a child, given that child's props
	 * and its index in the parent's children array.
	 *
	 * In particular, this will include an `animate` object that is set appropriately
	 * so that each child will be synchoronized for each stage of a transition
	 * animation.  It will also include a transformed `data` object, where each datum
	 * is transformed by `animate.onExit` and `animate.onEnter` `before` and `after`
	 * functions.
	 *
	 * @param  {Object}  props       `this.props` for the parent component.
	 * @param  {Object} state        `this.state` for the parent component.
	 * @param  {Function} setState    Function that, when called, will `this.setState` on
	 *                                 the parent component with the provided object.
	 *
	 * @return {Function}              Child-prop transformation function.
	 */
	function getTransitionPropsFactory(props, state, setState) {
	  var nodesWillExit = state && state.nodesWillExit;
	  var nodesWillEnter = state && state.nodesWillEnter;
	  var nodesShouldEnter = state && state.nodesShouldEnter;
	  var nodesShouldLoad = state && state.nodesShouldLoad;
	  var nodesDoneLoad = state && state.nodesDoneLoad;
	  var childrenTransitions = state && state.childrenTransitions || [];
	  var transitionDurations = {
	    enter: props.animate && props.animate.onEnter && props.animate.onEnter.duration,
	    exit: props.animate && props.animate.onExit && props.animate.onExit.duration,
	    load: props.animate && props.animate.onLoad && props.animate.onLoad.duration,
	    move: props.animate && props.animate.duration
	  };

	  var onLoad = function (child, data, animate) {
	    if (nodesShouldLoad) {
	      return getChildOnLoad(animate, data, function () {
	        setState({ nodesShouldLoad: false, nodesDoneLoad: true });
	      });
	    }

	    return getChildBeforeLoad(animate, child, data, function () {
	      setState({ nodesDoneLoad: true });
	    });
	  };

	  var onExit = function (nodes, child, data, animate) {
	    // eslint-disable-line max-params
	    return getChildPropsOnExit(animate, child, data, nodes, function () {
	      setState({ nodesWillExit: false });
	    });
	  };

	  var onEnter = function (nodes, child, data, animate) {
	    // eslint-disable-line max-params
	    if (nodesShouldEnter) {
	      return getChildPropsOnEnter(animate, data, nodes, function () {
	        setState({ nodesWillEnter: false });
	      });
	    }

	    return getChildPropsBeforeEnter(animate, child, data, nodes, function () {
	      setState({ nodesShouldEnter: true });
	    });
	  };

	  var getChildTransitionDuration = function (child, type) {
	    var animate = child.props.animate;
	    if (!child.type) {
	      return {};
	    }
	    var defaultTransitions = child.props && child.props.polar ? child.type.defaultPolarTransitions || child.type.defaultTransitions : child.type.defaultTransitions;
	    if (defaultTransitions) {
	      var animationDuration = animate[type] && animate[type].duration;
	      return animationDuration !== undefined ? animationDuration : defaultTransitions[type] && defaultTransitions[type].duration;
	    } else {
	      return {};
	    }
	  };

	  return function getTransitionProps(child, index) {
	    // eslint-disable-line max-statements, complexity, max-len
	    var data = getChildData(child) || [];
	    var animate = (0, _defaults3.default)({}, props.animate, child.props.animate);
	    var defaultTransitions = child.props.polar ? child.type.defaultPolarTransitions || child.type.defaultTransitions : child.type.defaultTransitions;

	    animate.onExit = (0, _defaults3.default)({}, animate.onExit, defaultTransitions && defaultTransitions.onExit);
	    animate.onEnter = (0, _defaults3.default)({}, animate.onEnter, defaultTransitions && defaultTransitions.onEnter);
	    animate.onLoad = (0, _defaults3.default)({}, animate.onLoad, defaultTransitions && defaultTransitions.onLoad);

	    var childTransitions = childrenTransitions[index] || childrenTransitions[0];
	    if (!nodesDoneLoad) {
	      // should do onLoad animation
	      var load = transitionDurations.load !== undefined ? transitionDurations.load : getChildTransitionDuration(child, "onLoad");
	      var animation = { duration: load };
	      return onLoad(child, data, (0, _assign3.default)({}, animate, animation));
	    } else if (nodesWillExit) {
	      var exitingNodes = childTransitions && childTransitions.exiting;
	      var exit = transitionDurations.exit !== undefined ? transitionDurations.exit : getChildTransitionDuration(child, "onExit");
	      // if nodesWillExit, but this child has no exiting nodes, set a delay instead of a duration
	      var _animation = exitingNodes ? { duration: exit } : { delay: exit };
	      return onExit(exitingNodes, child, data, (0, _assign3.default)({}, animate, _animation));
	    } else if (nodesWillEnter) {
	      var enteringNodes = childTransitions && childTransitions.entering;
	      var enter = transitionDurations.enter !== undefined ? transitionDurations.enter : getChildTransitionDuration(child, "onEnter");
	      var move = transitionDurations.move !== undefined ? transitionDurations.move : child.props.animate && child.props.animate.duration;
	      var _animation2 = { duration: nodesShouldEnter && enteringNodes ? enter : move };
	      return onEnter(enteringNodes, child, data, (0, _assign3.default)({}, animate, _animation2));
	    } else if (!state && animate && animate.onExit) {
	      // This is the initial render, and nodes may enter when props change. Because
	      // animation interpolation is determined by old- and next- props, data may need
	      // to be augmented with certain properties.
	      //
	      // For example, it may be desired that exiting nodes go from `opacity: 1` to
	      // `opacity: 0`. Without setting this on a per-datum basis, the interpolation
	      // might go from `opacity: undefined` to `opacity: 0`, which would result in
	      // interpolated `opacity: NaN` values.
	      //
	      return getInitialChildProps(animate, data);
	    }
	    return { animate: animate, data: data };
	  };
	}

	exports.default = {
	  getInitialTransitionState: getInitialTransitionState,
	  getTransitionPropsFactory: getTransitionPropsFactory
	};

/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _fromPairs2 = __webpack_require__(202);

	var _fromPairs3 = _interopRequireDefault(_fromPairs2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _partialRight2 = __webpack_require__(2);

	var _partialRight3 = _interopRequireDefault(_partialRight2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	var _events = __webpack_require__(203);

	var _events2 = _interopRequireDefault(_events);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _timer = __webpack_require__(64);

	var _timer2 = _interopRequireDefault(_timer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VictorySharedEvents = function (_React$Component) {
	  _inherits(VictorySharedEvents, _React$Component);

	  function VictorySharedEvents() {
	    _classCallCheck(this, VictorySharedEvents);

	    var _this = _possibleConstructorReturn(this, (VictorySharedEvents.__proto__ || Object.getPrototypeOf(VictorySharedEvents)).call(this));

	    _this.state = _this.state || {};
	    _this.getScopedEvents = _events2.default.getScopedEvents.bind(_this);
	    _this.getEventState = _events2.default.getEventState.bind(_this);
	    _this.getTimer = _this.getTimer.bind(_this);
	    return _this;
	  }

	  _createClass(VictorySharedEvents, [{
	    key: "getChildContext",
	    value: function getChildContext() {
	      return {
	        getTimer: this.getTimer
	      };
	    }
	  }, {
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      this.setUpChildren(this.props);
	    }
	  }, {
	    key: "componentWillReceiveProps",
	    value: function componentWillReceiveProps(newProps) {
	      this.setUpChildren(newProps);
	    }
	  }, {
	    key: "getTimer",
	    value: function getTimer() {
	      if (this.context.getTimer) {
	        return this.context.getTimer();
	      }
	      if (!this.timer) {
	        this.timer = new _timer2.default();
	      }
	      return this.timer;
	    }
	  }, {
	    key: "getAllEvents",
	    value: function getAllEvents(props) {
	      var components = ["container", "groupComponent"];
	      this.componentEvents = _events2.default.getComponentEvents(props, components);
	      if (Array.isArray(this.componentEvents)) {
	        var _componentEvents;

	        return Array.isArray(props.events) ? (_componentEvents = this.componentEvents).concat.apply(_componentEvents, _toConsumableArray(props.events)) : this.componentEvents;
	      }
	      return props.events;
	    }
	  }, {
	    key: "setUpChildren",
	    value: function setUpChildren(props) {
	      this.events = this.getAllEvents(props);
	      if (this.events) {
	        this.childComponents = _react2.default.Children.toArray(props.children);
	        var childBaseProps = this.getBasePropsFromChildren(this.childComponents);
	        var parentBaseProps = props.container ? props.container.props : {};
	        this.baseProps = (0, _assign3.default)({}, childBaseProps, { parent: parentBaseProps });
	      }
	    }
	  }, {
	    key: "getBasePropsFromChildren",
	    value: function getBasePropsFromChildren(childComponents) {
	      var iteratee = function (child, childName, parent) {
	        if (child.type && (0, _isFunction3.default)(child.type.getBaseProps)) {
	          child = parent ? _react2.default.cloneElement(child, parent.props) : child;
	          var _baseProps = child.props && child.type.getBaseProps(child.props);
	          return _baseProps ? [[childName, _baseProps]] : null;
	        } else {
	          return null;
	        }
	      };

	      var baseProps = _helpers2.default.reduceChildren(childComponents, iteratee);
	      return (0, _fromPairs3.default)(baseProps);
	    }
	  }, {
	    key: "getNewChildren",
	    value: function getNewChildren(props) {
	      var _this2 = this;

	      var events = props.events,
	          eventKey = props.eventKey;

	      var childNames = Object.keys(this.baseProps);
	      var alterChildren = function (children) {
	        return children.reduce(function (memo, child, index) {
	          if (child.props.children) {
	            return memo.concat(_react2.default.cloneElement(child, child.props, alterChildren(_react2.default.Children.toArray(child.props.children))));
	          } else if (child.type && (0, _isFunction3.default)(child.type.getBaseProps)) {
	            var name = child.props.name || childNames.shift() || index;
	            var childEvents = Array.isArray(events) && events.filter(function (event) {
	              if (event.target === "parent") {
	                return false;
	              }
	              return Array.isArray(event.childName) ? event.childName.indexOf(name) > -1 : event.childName === name || event.childName === "all";
	            });
	            var sharedEvents = {
	              events: childEvents,
	              getEvents: (0, _partialRight3.default)(_this2.getScopedEvents, name, _this2.baseProps),
	              getEventState: (0, _partialRight3.default)(_this2.getEventState, name)
	            };
	            return memo.concat(_react2.default.cloneElement(child, (0, _assign3.default)({ key: "events-" + name, sharedEvents: sharedEvents, eventKey: eventKey }, child.props)));
	          } else {
	            return memo.concat(child);
	          }
	        }, []);
	      };

	      return alterChildren(this.childComponents);
	    }
	  }, {
	    key: "getContainer",
	    value: function getContainer(props, children) {
	      var parents = Array.isArray(this.events) && this.events.filter(function (event) {
	        return event.target === "parent";
	      });
	      var sharedEvents = parents.length > 0 ? {
	        events: parents,
	        getEvents: (0, _partialRight3.default)(this.getScopedEvents, null, this.baseProps),
	        getEventState: (0, _partialRight3.default)(this.getEventState, null)
	      } : null;
	      var container = this.props.container || this.props.groupComponent;
	      var containerProps = container.props || {};
	      var boundGetEvents = _events2.default.getEvents.bind(this);
	      var parentEvents = sharedEvents && boundGetEvents({ sharedEvents: sharedEvents }, "parent");
	      var parentProps = (0, _defaults3.default)({}, this.getEventState("parent", "parent"), containerProps, this.baseProps.parent, { children: children });
	      var events = (0, _defaults3.default)({}, _events2.default.getPartialEvents(parentEvents, "parent", parentProps), containerProps.events);
	      return _react2.default.cloneElement(container, (0, _assign3.default)({}, parentProps, { events: events }));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      if (this.events) {
	        var children = this.getNewChildren(this.props);
	        return this.getContainer(this.props, children);
	      }
	      return _react2.default.cloneElement(this.props.container, { children: this.props.children });
	    }
	  }]);

	  return VictorySharedEvents;
	}(_react2.default.Component);

	VictorySharedEvents.displayName = "VictorySharedEvents";
	VictorySharedEvents.role = "shared-event-wrapper";
	VictorySharedEvents.propTypes = {
	  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
	  container: _propTypes2.default.node,
	  eventKey: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.func, _propTypes4.default.allOfType([_propTypes4.default.integer, _propTypes4.default.nonNegative]), _propTypes2.default.string]),
	  events: _propTypes2.default.arrayOf(_propTypes2.default.shape({
	    childName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
	    eventHandlers: _propTypes2.default.object,
	    eventKey: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.func, _propTypes4.default.allOfType([_propTypes4.default.integer, _propTypes4.default.nonNegative]), _propTypes2.default.string]),
	    target: _propTypes2.default.string
	  })),
	  groupComponent: _propTypes2.default.node
	};
	VictorySharedEvents.defaultProps = {
	  groupComponent: _react2.default.createElement("g", null)
	};
	VictorySharedEvents.contextTypes = {
	  getTimer: _propTypes2.default.func
	};
	VictorySharedEvents.childContextTypes = {
	  getTimer: _propTypes2.default.func
	};
	exports.default = VictorySharedEvents;

/***/ }),
/* 202 */
/***/ (function(module, exports) {

	/**
	 * The inverse of `_.toPairs`; this method returns an object composed
	 * from key-value `pairs`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Array
	 * @param {Array} pairs The key-value pairs.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * _.fromPairs([['a', 1], ['b', 2]]);
	 * // => { 'a': 1, 'b': 2 }
	 */
	function fromPairs(pairs) {
	  var index = -1,
	      length = pairs == null ? 0 : pairs.length,
	      result = {};

	  while (++index < length) {
	    var pair = pairs[index];
	    result[pair[0]] = pair[1];
	  }
	  return result;
	}

	module.exports = fromPairs;


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _without2 = __webpack_require__(204);

	var _without3 = _interopRequireDefault(_without2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _isEmpty2 = __webpack_require__(207);

	var _isEmpty3 = _interopRequireDefault(_isEmpty2);

	var _partial2 = __webpack_require__(209);

	var _partial3 = _interopRequireDefault(_partial2);

	var _merge2 = __webpack_require__(126);

	var _merge3 = _interopRequireDefault(_merge2);

	var _extend6 = __webpack_require__(210);

	var _extend7 = _interopRequireDefault(_extend6);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	exports.default = {
	  /* Returns all own and shared events that should be attached to a single target element,
	   * i.e. an individual bar specified by target: "data", eventKey: [index].
	   * Returned events are scoped to the appropriate state. Either that of the component itself
	   * (i.e. VictoryBar) in the case of own events, or that of the parent component
	   * (i.e. VictoryChart) in the case of shared events
	   */
	  getEvents: function (props, target, eventKey, getScopedEvents) {
	    var _this = this;

	    // Returns all events that apply to a particular target element
	    var getEventsByTarget = function (events) {
	      var getSelectedEvents = function () {
	        var targetEvents = events.reduce(function (memo, event) {
	          if (event.target !== undefined) {
	            return "" + event.target === "" + target ? memo.concat(event) : memo;
	          }
	          return memo.concat(event);
	        }, []);

	        if (eventKey !== undefined && target !== "parent") {
	          return targetEvents.filter(function (obj) {
	            var targetKeys = obj.eventKey;
	            var useKey = function (key) {
	              return key ? "" + key === "" + eventKey : true;
	            };
	            return Array.isArray(targetKeys) ? targetKeys.some(function (k) {
	              return useKey(k);
	            }) : useKey(targetKeys);
	          });
	        }
	        return targetEvents;
	      };

	      var selectedEvents = getSelectedEvents();
	      return Array.isArray(selectedEvents) && selectedEvents.reduce(function (memo, event) {
	        return event ? (0, _assign3.default)(memo, event.eventHandlers) : memo;
	      }, {});
	    };

	    /* Returns all events from props and defaultEvents from components. Events handlers
	     * specified in props will override handlers for the same event if they are also
	     * specified in defaultEvents of a sub-component
	     */
	    var getAllEvents = function () {
	      if (Array.isArray(_this.componentEvents)) {
	        var _componentEvents;

	        return Array.isArray(props.events) ? (_componentEvents = _this.componentEvents).concat.apply(_componentEvents, _toConsumableArray(props.events)) : _this.componentEvents;
	      }
	      return props.events;
	    };

	    var allEvents = getAllEvents();
	    var ownEvents = allEvents && (0, _isFunction3.default)(getScopedEvents) ? getScopedEvents(getEventsByTarget(allEvents), target) : undefined;
	    if (!props.sharedEvents) {
	      return ownEvents;
	    }
	    var getSharedEvents = props.sharedEvents.getEvents;
	    var sharedEvents = props.sharedEvents.events && getSharedEvents(getEventsByTarget(props.sharedEvents.events), target);
	    return (0, _assign3.default)({}, sharedEvents, ownEvents);
	  },


	  /* Returns a modified events object where each event handler is replaced by a new
	   * function that calls the original handler and then calls setState with the return
	   * of the original event handler assigned to state property that maps to the target
	   * element.
	   */
	  getScopedEvents: function (events, namespace, childType, baseProps) {
	    var _this2 = this;

	    if ((0, _isEmpty3.default)(events)) {
	      return {};
	    }

	    baseProps = baseProps || this.baseProps;
	    // returns the original base props or base state of a given target element
	    var getTargetProps = function (identifier, type) {
	      var childName = identifier.childName,
	          target = identifier.target,
	          key = identifier.key;

	      var baseType = type === "props" ? baseProps : _this2.state;
	      var base = childName === undefined || childName === null || !baseType[childName] ? baseType : baseType[childName];
	      return key === "parent" ? base.parent : base[key] && base[key][target];
	    };

	    // Returns the state object with the mutation caused by a given eventReturn
	    // applied to the appropriate property on the state object
	    var parseEvent = function (eventReturn, eventKey) {
	      var childNames = namespace === "parent" ? eventReturn.childName : eventReturn.childName || childType;
	      var target = eventReturn.target || namespace;

	      // returns all eventKeys to modify for a targeted childName
	      var getKeys = function (childName) {
	        if (eventReturn.eventKey === "all") {
	          return baseProps[childName] ? (0, _without3.default)(Object.keys(baseProps[childName]), "parent") : (0, _without3.default)(Object.keys(baseProps), "parent");
	        } else if (eventReturn.eventKey === undefined && eventKey === "parent") {
	          return baseProps[childName] ? Object.keys(baseProps[childName]) : Object.keys(baseProps);
	        }
	        return eventReturn.eventKey !== undefined ? eventReturn.eventKey : eventKey;
	      };

	      // returns the state object with mutated props applied for a single key
	      var getMutationObject = function (key, childName) {
	        var nullFunction = function () {
	          return null;
	        };
	        var mutationTargetProps = getTargetProps({ childName: childName, key: key, target: target }, "props");
	        var mutationTargetState = getTargetProps({ childName: childName, key: key, target: target }, "state");
	        var mutation = eventReturn.mutation || nullFunction;
	        var mutatedProps = mutation((0, _assign3.default)({}, mutationTargetProps, mutationTargetState), baseProps);
	        var childState = _this2.state[childName] || {};
	        var extendState = function (state) {
	          return target === "parent" ? (0, _extend7.default)(state[key], mutatedProps) : (0, _extend7.default)(state[key], _defineProperty({}, target, mutatedProps));
	        };
	        return childName !== undefined && childName !== null ? (0, _extend7.default)(_this2.state, _defineProperty({}, childName, (0, _extend7.default)(childState, _defineProperty({}, key, extendState(childState))))) : (0, _extend7.default)(_this2.state, _defineProperty({}, key, extendState(_this2.state)));
	      };

	      // returns entire mutated state for a given childName
	      var getReturnByChild = function (childName) {
	        var mutationKeys = getKeys(childName);
	        return Array.isArray(mutationKeys) ? mutationKeys.reduce(function (memo, key) {
	          return (0, _assign3.default)(memo, getMutationObject(key, childName));
	        }, {}) : getMutationObject(mutationKeys, childName);
	      };

	      // returns an entire mutated state for all children
	      var allChildNames = childNames === "all" ? (0, _without3.default)(Object.keys(baseProps), "parent") : childNames;
	      return Array.isArray(allChildNames) ? allChildNames.reduce(function (memo, childName) {
	        return (0, _assign3.default)(memo, getReturnByChild(childName));
	      }, {}) : getReturnByChild(allChildNames);
	    };

	    // Parses an array of event returns into a single state mutation
	    var parseEventReturn = function (eventReturn, eventKey) {
	      return Array.isArray(eventReturn) ? eventReturn.reduce(function (memo, props) {
	        memo = (0, _merge3.default)({}, memo, parseEvent(props, eventKey));
	        return memo;
	      }, {}) : parseEvent(eventReturn, eventKey);
	    };

	    var compileCallbacks = function (eventReturn) {
	      var getCallback = function (obj) {
	        return (0, _isFunction3.default)(obj.callback) && obj.callback;
	      };
	      var callbacks = Array.isArray(eventReturn) ? eventReturn.map(function (evtObj) {
	        return getCallback(evtObj);
	      }) : [getCallback(eventReturn)];
	      var callbackArray = callbacks.filter(function (callback) {
	        return callback !== false;
	      });
	      return callbackArray.length ? function () {
	        return callbackArray.forEach(function (callback) {
	          return callback();
	        });
	      } : undefined;
	    };

	    // A function that calls a particular event handler, parses its return
	    // into a state mutation, and calls setState
	    var onEvent = function (evt, childProps, eventKey, eventName) {
	      var eventReturn = events[eventName](evt, childProps, eventKey, _this2);
	      if (eventReturn) {
	        var callbacks = compileCallbacks(eventReturn);
	        _this2.setState(parseEventReturn(eventReturn, eventKey), callbacks);
	      }
	    };

	    // returns a new events object with enhanced event handlers
	    return Object.keys(events).reduce(function (memo, event) {
	      memo[event] = onEvent;
	      return memo;
	    }, {});
	  },


	  /* Returns a partially applied event handler for a specific target element
	   * This allows event handlers to have access to props controlling each element
	   */
	  getPartialEvents: function (events, eventKey, childProps) {
	    return events ? Object.keys(events).reduce(function (memo, eventName) {
	      /* eslint max-params: 0 */
	      memo[eventName] = (0, _partial3.default)(events[eventName], _partial3.default.placeholder, // evt will still be the first argument for event handlers
	      childProps, // event handlers will have access to data component props, including data
	      eventKey, // used in setting a unique state property
	      eventName // used in setting a unique state property
	      );
	      return memo;
	    }, {}) : {};
	  },


	  /* Returns the property of the state object corresponding to event changes for
	   * a particular element
	   */
	  getEventState: function (eventKey, namespace, childType) {
	    if (!childType) {
	      return eventKey === "parent" ? this.state[eventKey] && this.state[eventKey][namespace] || this.state[eventKey] : this.state[eventKey] && this.state[eventKey][namespace];
	    }
	    return this.state[childType] && this.state[childType][eventKey] && this.state[childType][eventKey][namespace];
	  },


	  /* Returns an array of defaultEvents from sub-components of a given component.
	   * i.e. any static `defaultEvents` on `labelComponent` will be returned
	  */
	  getComponentEvents: function (props, components) {
	    var events = Array.isArray(components) && components.reduce(function (memo, componentName) {
	      var _memo;

	      var component = props[componentName];
	      var componentEvents = component && component.type && component.type.defaultEvents;
	      memo = Array.isArray(componentEvents) ? (_memo = memo).concat.apply(_memo, _toConsumableArray(componentEvents)) : memo;
	      return memo;
	    }, []);
	    return events && events.length ? events : undefined;
	  }
	};

/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

	var baseDifference = __webpack_require__(205),
	    baseRest = __webpack_require__(3),
	    isArrayLikeObject = __webpack_require__(144);

	/**
	 * Creates an array excluding all given values using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * **Note:** Unlike `_.pull`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {...*} [values] The values to exclude.
	 * @returns {Array} Returns the new array of filtered values.
	 * @see _.difference, _.xor
	 * @example
	 *
	 * _.without([2, 1, 2, 3], 1, 2);
	 * // => [3]
	 */
	var without = baseRest(function(array, values) {
	  return isArrayLikeObject(array)
	    ? baseDifference(array, values)
	    : [];
	});

	module.exports = without;


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(159),
	    arrayIncludes = __webpack_require__(34),
	    arrayIncludesWith = __webpack_require__(206),
	    arrayMap = __webpack_require__(91),
	    baseUnary = __webpack_require__(83),
	    cacheHas = __webpack_require__(164);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * The base implementation of methods like `_.difference` without support
	 * for excluding multiple arrays or iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Array} values The values to exclude.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new array of filtered values.
	 */
	function baseDifference(array, values, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      isCommon = true,
	      length = array.length,
	      result = [],
	      valuesLength = values.length;

	  if (!length) {
	    return result;
	  }
	  if (iteratee) {
	    values = arrayMap(values, baseUnary(iteratee));
	  }
	  if (comparator) {
	    includes = arrayIncludesWith;
	    isCommon = false;
	  }
	  else if (values.length >= LARGE_ARRAY_SIZE) {
	    includes = cacheHas;
	    isCommon = false;
	    values = new SetCache(values);
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee == null ? value : iteratee(value);

	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var valuesIndex = valuesLength;
	      while (valuesIndex--) {
	        if (values[valuesIndex] === computed) {
	          continue outer;
	        }
	      }
	      result.push(value);
	    }
	    else if (!includes(values, computed, comparator)) {
	      result.push(value);
	    }
	  }
	  return result;
	}

	module.exports = baseDifference;


/***/ }),
/* 206 */
/***/ (function(module, exports) {

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arrayIncludesWith;


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

	var baseKeys = __webpack_require__(208),
	    getTag = __webpack_require__(170),
	    isArguments = __webpack_require__(75),
	    isArray = __webpack_require__(76),
	    isArrayLike = __webpack_require__(88),
	    isBuffer = __webpack_require__(77),
	    isPrototype = __webpack_require__(86),
	    isTypedArray = __webpack_require__(80);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    setTag = '[object Set]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Checks if `value` is an empty object, collection, map, or set.
	 *
	 * Objects are considered empty if they have no own enumerable string keyed
	 * properties.
	 *
	 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
	 * jQuery-like collections are considered empty if they have a `length` of `0`.
	 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  if (isArrayLike(value) &&
	      (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
	        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
	    return !value.length;
	  }
	  var tag = getTag(value);
	  if (tag == mapTag || tag == setTag) {
	    return !value.size;
	  }
	  if (isPrototype(value)) {
	    return !baseKeys(value).length;
	  }
	  for (var key in value) {
	    if (hasOwnProperty.call(value, key)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = isEmpty;


/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(86),
	    nativeKeys = __webpack_require__(123);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeys;


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(3),
	    createWrap = __webpack_require__(13),
	    getHolder = __webpack_require__(39),
	    replaceHolders = __webpack_require__(43);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_PARTIAL_FLAG = 32;

	/**
	 * Creates a function that invokes `func` with `partials` prepended to the
	 * arguments it receives. This method is like `_.bind` except it does **not**
	 * alter the `this` binding.
	 *
	 * The `_.partial.placeholder` value, which defaults to `_` in monolithic
	 * builds, may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** This method doesn't set the "length" property of partially
	 * applied functions.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.2.0
	 * @category Function
	 * @param {Function} func The function to partially apply arguments to.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new partially applied function.
	 * @example
	 *
	 * function greet(greeting, name) {
	 *   return greeting + ' ' + name;
	 * }
	 *
	 * var sayHelloTo = _.partial(greet, 'hello');
	 * sayHelloTo('fred');
	 * // => 'hello fred'
	 *
	 * // Partially applied with placeholders.
	 * var greetFred = _.partial(greet, _, 'fred');
	 * greetFred('hi');
	 * // => 'hi fred'
	 */
	var partial = baseRest(function(func, partials) {
	  var holders = replaceHolders(partials, getHolder(partial));
	  return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
	});

	// Assign default placeholders.
	partial.placeholder = {};

	module.exports = partial;


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(211);


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(105),
	    createAssigner = __webpack_require__(121),
	    keysIn = __webpack_require__(72);

	/**
	 * This method is like `_.assign` except that it iterates over own and
	 * inherited source properties.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @alias extend
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.assign
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * function Bar() {
	 *   this.c = 3;
	 * }
	 *
	 * Foo.prototype.b = 2;
	 * Bar.prototype.d = 4;
	 *
	 * _.assignIn({ 'a': 0 }, new Foo, new Bar);
	 * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
	 */
	var assignIn = createAssigner(function(object, source) {
	  copyObject(source, keysIn(source), object);
	});

	module.exports = assignIn;


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _clipPath = __webpack_require__(213);

	var _clipPath2 = _interopRequireDefault(_clipPath);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VictoryClipContainer = function (_React$Component) {
	  _inherits(VictoryClipContainer, _React$Component);

	  function VictoryClipContainer(props) {
	    _classCallCheck(this, VictoryClipContainer);

	    var _this = _possibleConstructorReturn(this, (VictoryClipContainer.__proto__ || Object.getPrototypeOf(VictoryClipContainer)).call(this, props));

	    _this.clipId = props.clipId !== undefined ? props.clipId : Math.round(Math.random() * 10000); // eslint-disable-line no-magic-numbers
	    return _this;
	  }

	  // Overridden in victory-core-native


	  _createClass(VictoryClipContainer, [{
	    key: "renderClippedGroup",
	    value: function renderClippedGroup(props, clipId) {
	      var style = props.style,
	          events = props.events,
	          transform = props.transform,
	          children = props.children,
	          className = props.className;

	      var clipComponent = this.renderClipComponent(props, clipId);
	      return _react2.default.createElement(
	        "g",
	        _extends({
	          className: className,
	          style: style
	        }, events, {
	          transform: transform
	        }),
	        clipComponent,
	        _react2.default.createElement(
	          "g",
	          { clipPath: "url(#" + clipId + ")" },
	          children
	        )
	      );
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderGroup",
	    value: function renderGroup(props) {
	      var style = props.style,
	          events = props.events,
	          transform = props.transform,
	          children = props.children,
	          className = props.className;

	      return _react2.default.createElement(
	        "g",
	        _extends({
	          className: className,
	          style: style
	        }, events, {
	          transform: transform
	        }),
	        children
	      );
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderClipComponent",
	    value: function renderClipComponent(props, clipId) {
	      return _react2.default.cloneElement(props.clipPathComponent, (0, _assign3.default)({}, props, { clipId: clipId }));
	    }
	  }, {
	    key: "getClipValue",
	    value: function getClipValue(props, axis) {
	      var clipValues = { x: props.clipWidth, y: props.clipHeight };
	      if (clipValues[axis] !== undefined) {
	        return clipValues[axis];
	      }
	      var range = this.getRange(props, axis);
	      return range ? Math.abs(range[0] - range[1]) || undefined : undefined;
	    }
	  }, {
	    key: "getTranslateValue",
	    value: function getTranslateValue(props, axis) {
	      var translateValues = { x: props.translateX, y: props.translateY };
	      if (translateValues[axis] !== undefined) {
	        return translateValues[axis];
	      }
	      var range = this.getRange(props, axis);
	      return range ? Math.min.apply(Math, _toConsumableArray(range)) : undefined;
	    }
	  }, {
	    key: "getRange",
	    value: function getRange(props, axis) {
	      var scale = props.scale || {};
	      if (!scale[axis]) {
	        return undefined;
	      }
	      return (0, _isFunction3.default)(scale[axis].range) ? scale[axis].range() : undefined;
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var clipHeight = this.getClipValue(this.props, "y");
	      var clipWidth = this.getClipValue(this.props, "x");
	      if (clipWidth === undefined || clipHeight === undefined) {
	        return this.renderGroup(this.props);
	      }
	      var translateX = this.getTranslateValue(this.props, "x");
	      var translateY = this.getTranslateValue(this.props, "y");
	      var clipProps = (0, _defaults3.default)({}, this.props, { clipHeight: clipHeight, clipWidth: clipWidth, translateX: translateX, translateY: translateY });
	      return this.renderClippedGroup(clipProps, this.clipId);
	    }
	  }]);

	  return VictoryClipContainer;
	}(_react2.default.Component);

	VictoryClipContainer.displayName = "VictoryClipContainer";
	VictoryClipContainer.role = "container";
	VictoryClipContainer.propTypes = {
	  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
	  className: _propTypes2.default.string,
	  clipHeight: _propTypes2.default.number,
	  clipId: _propTypes2.default.number,
	  clipPadding: _propTypes2.default.shape({
	    top: _propTypes2.default.number, bottom: _propTypes2.default.number,
	    left: _propTypes2.default.number, right: _propTypes2.default.number
	  }),
	  clipPathComponent: _propTypes2.default.element,
	  clipWidth: _propTypes2.default.number,
	  events: _propTypes2.default.object,
	  origin: _propTypes2.default.shape({ x: _propTypes2.default.number, y: _propTypes2.default.number }),
	  polar: _propTypes2.default.bool,
	  radius: _propTypes2.default.number,
	  style: _propTypes2.default.object,
	  transform: _propTypes2.default.string,
	  translateX: _propTypes2.default.number,
	  translateY: _propTypes2.default.number
	};
	VictoryClipContainer.defaultProps = {
	  clipPathComponent: _react2.default.createElement(_clipPath2.default, null)
	};
	exports.default = VictoryClipContainer;

/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ClipPath = function (_React$Component) {
	  _inherits(ClipPath, _React$Component);

	  function ClipPath() {
	    _classCallCheck(this, ClipPath);

	    return _possibleConstructorReturn(this, (ClipPath.__proto__ || Object.getPrototypeOf(ClipPath)).apply(this, arguments));
	  }

	  _createClass(ClipPath, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      Object.assign(this, this.calculateAttributes(this.props));
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var calculatedAttributes = this.calculateAttributes(nextProps);
	      var _props = this.props,
	          className = _props.className,
	          clipId = _props.clipId,
	          clipWidth = _props.clipWidth,
	          translateX = _props.translateX,
	          translateY = _props.translateY;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [clipId, nextProps.clipId], [clipWidth, nextProps.clipWidth], [translateX, nextProps.translateX], [translateY, nextProps.translateY], [this.x, calculatedAttributes.x], [this.y, calculatedAttributes.y], [this.height, calculatedAttributes.height], [this.width, calculatedAttributes.width]])) {
	        Object.assign(this, calculatedAttributes);
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var polar = props.polar,
	          origin = props.origin,
	          _props$clipWidth = props.clipWidth,
	          clipWidth = _props$clipWidth === undefined ? 0 : _props$clipWidth,
	          _props$clipHeight = props.clipHeight,
	          clipHeight = _props$clipHeight === undefined ? 0 : _props$clipHeight,
	          _props$translateX = props.translateX,
	          translateX = _props$translateX === undefined ? 0 : _props$translateX,
	          _props$translateY = props.translateY,
	          translateY = _props$translateY === undefined ? 0 : _props$translateY;

	      var clipPadding = _helpers2.default.getPadding({ padding: props.clipPadding });
	      var radius = props.radius || _helpers2.default.getRadius(props);
	      return {
	        x: (polar ? origin.x : translateX) - clipPadding.left,
	        y: (polar ? origin.y : translateY) - clipPadding.top,
	        width: Math.max((polar ? radius : clipWidth) + clipPadding.left + clipPadding.right, 0),
	        height: Math.max((polar ? radius : clipHeight) + clipPadding.top + clipPadding.bottom, 0)
	      };
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderClipPath",
	    value: function renderClipPath(props, id) {
	      return _react2.default.createElement(
	        "defs",
	        null,
	        _react2.default.createElement(
	          "clipPath",
	          { id: id },
	          _react2.default.createElement("rect", props)
	        )
	      );
	    }
	  }, {
	    key: "renderPolarClipPath",
	    value: function renderPolarClipPath(props, id) {
	      return _react2.default.createElement(
	        "defs",
	        null,
	        _react2.default.createElement(
	          "clipPath",
	          { id: id },
	          _react2.default.createElement("circle", props)
	        )
	      );
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _props2 = this.props,
	          clipId = _props2.clipId,
	          className = _props2.className,
	          polar = _props2.polar;

	      var clipProps = polar ? { className: className, cx: this.x, cy: this.y, r: Math.max(this.width, this.height) } : { className: className, x: this.x, y: this.y, width: this.width, height: this.height };
	      return polar ? this.renderPolarClipPath(clipProps, clipId) : this.renderClipPath(clipProps, clipId);
	    }
	  }]);

	  return ClipPath;
	}(_react2.default.Component);

	ClipPath.propTypes = {
	  className: _propTypes2.default.string,
	  clipHeight: _propTypes4.default.nonNegative,
	  clipId: _propTypes2.default.number,
	  clipPadding: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.shape({
	    top: _propTypes2.default.number,
	    bottom: _propTypes2.default.number,
	    left: _propTypes2.default.number,
	    right: _propTypes2.default.number
	  })]),
	  clipWidth: _propTypes4.default.nonNegative,
	  origin: _propTypes2.default.shape({ x: _propTypes2.default.number, y: _propTypes2.default.number }),
	  polar: _propTypes2.default.bool,
	  radius: _propTypes2.default.number,
	  translateX: _propTypes2.default.number,
	  translateY: _propTypes2.default.number
	};
	exports.default = ClipPath;

/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _material = __webpack_require__(215);

	var _material2 = _interopRequireDefault(_material);

	var _grayscale = __webpack_require__(216);

	var _grayscale2 = _interopRequireDefault(_grayscale);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  material: _material2.default,
	  grayscale: _grayscale2.default
	};

/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// *
	// * Colors
	// *
	var yellow200 = "#FFF59D";
	var deepOrange600 = "#F4511E";
	var lime300 = "#DCE775";
	var lightGreen500 = "#8BC34A";
	var teal700 = "#00796B";
	var cyan900 = "#006064";
	var colors = [deepOrange600, yellow200, lime300, lightGreen500, teal700, cyan900];
	var blueGrey50 = "#ECEFF1";
	var blueGrey300 = "#90A4AE";
	var blueGrey700 = "#455A64";
	var grey900 = "#212121";
	// *
	// * Typography
	// *
	var sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
	var letterSpacing = "normal";
	var fontSize = 12;
	// *
	// * Layout
	// *
	var padding = 8;
	var baseProps = {
	  width: 350,
	  height: 350,
	  padding: 50
	};
	// *
	// * Labels
	// *
	var baseLabelStyles = {
	  fontFamily: sansSerif,
	  fontSize: fontSize,
	  letterSpacing: letterSpacing,
	  padding: padding,
	  fill: blueGrey700,
	  stroke: "transparent",
	  strokeWidth: 0
	};

	var centeredLabelStyles = (0, _assign3.default)({ textAnchor: "middle" }, baseLabelStyles);
	// *
	// * Strokes
	// *
	var strokeDasharray = "10, 5";
	var strokeLinecap = "round";
	var strokeLinejoin = "round";

	exports.default = {
	  area: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: grey900
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  axis: (0, _assign3.default)({
	    style: {
	      axis: {
	        fill: "transparent",
	        stroke: blueGrey300,
	        strokeWidth: 2,
	        strokeLinecap: strokeLinecap,
	        strokeLinejoin: strokeLinejoin
	      },
	      axisLabel: (0, _assign3.default)({}, centeredLabelStyles, {
	        padding: padding,
	        stroke: "transparent"
	      }),
	      grid: {
	        fill: "transparent",
	        stroke: blueGrey50,
	        strokeDasharray: strokeDasharray,
	        strokeLinecap: strokeLinecap,
	        strokeLinejoin: strokeLinejoin,
	        pointerEvents: "none"
	      },
	      ticks: {
	        fill: "transparent",
	        size: 5,
	        stroke: blueGrey300,
	        strokeWidth: 1,
	        strokeLinecap: strokeLinecap,
	        strokeLinejoin: strokeLinejoin
	      },
	      tickLabels: (0, _assign3.default)({}, baseLabelStyles, {
	        fill: blueGrey700
	      })
	    }
	  }, baseProps),
	  bar: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: blueGrey700,
	        padding: padding,
	        strokeWidth: 0
	      },
	      labels: baseLabelStyles
	    }
	  }, baseProps),
	  candlestick: (0, _assign3.default)({
	    style: {
	      data: {
	        stroke: blueGrey700
	      },
	      labels: centeredLabelStyles
	    },
	    candleColors: {
	      positive: "#ffffff",
	      negative: blueGrey700
	    }
	  }, baseProps),
	  chart: baseProps,
	  errorbar: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        opacity: 1,
	        stroke: blueGrey700,
	        strokeWidth: 2
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  group: (0, _assign3.default)({
	    colorScale: colors
	  }, baseProps),
	  line: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        opacity: 1,
	        stroke: blueGrey700,
	        strokeWidth: 2
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  pie: (0, _assign3.default)({
	    colorScale: colors,
	    style: {
	      data: {
	        padding: padding,
	        stroke: blueGrey50,
	        strokeWidth: 1
	      },
	      labels: (0, _assign3.default)({}, baseLabelStyles, { padding: 20 })
	    }
	  }, baseProps),
	  scatter: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: blueGrey700,
	        opacity: 1,
	        stroke: "transparent",
	        strokeWidth: 0
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  stack: (0, _assign3.default)({
	    colorScale: colors
	  }, baseProps),
	  tooltip: {
	    style: (0, _assign3.default)({}, centeredLabelStyles, { padding: 5, pointerEvents: "none" }),
	    flyoutStyle: {
	      stroke: grey900,
	      strokeWidth: 1,
	      fill: "#f0f0f0",
	      pointerEvents: "none"
	    },
	    cornerRadius: 5,
	    pointerLength: 10
	  },
	  voronoi: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        stroke: "transparent",
	        strokeWidth: 0
	      },
	      labels: (0, _assign3.default)({}, centeredLabelStyles, { padding: 5, pointerEvents: "none" }),
	      flyout: {
	        stroke: grey900,
	        strokeWidth: 1,
	        fill: "#f0f0f0",
	        pointerEvents: "none"
	      }
	    }
	  }, baseProps),
	  legend: {
	    colorScale: colors,
	    style: {
	      data: {
	        type: "circle"
	      },
	      labels: baseLabelStyles
	    }
	  }
	};

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// *
	// * Colors
	// *
	var colors = ["#252525", "#525252", "#737373", "#969696", "#bdbdbd", "#d9d9d9", "#f0f0f0"];

	var charcoal = "#252525";
	// *
	// * Typography
	// *
	var sansSerif = "'Gill Sans', 'Gill Sans MT', 'Ser­avek', 'Trebuchet MS', sans-serif";
	var letterSpacing = "normal";
	var fontSize = 14;
	// *
	// * Layout
	// *
	var baseProps = {
	  width: 450,
	  height: 300,
	  padding: 50,
	  colorScale: colors
	};
	// *
	// * Labels
	// *
	var baseLabelStyles = {
	  fontFamily: sansSerif,
	  fontSize: fontSize,
	  letterSpacing: letterSpacing,
	  padding: 10,
	  fill: charcoal,
	  stroke: "transparent"
	};

	var centeredLabelStyles = (0, _assign3.default)({ textAnchor: "middle" }, baseLabelStyles);
	// *
	// * Strokes
	// *
	var strokeLinecap = "round";
	var strokeLinejoin = "round";

	exports.default = {
	  area: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: charcoal
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  axis: (0, _assign3.default)({
	    style: {
	      axis: {
	        fill: "transparent",
	        stroke: charcoal,
	        strokeWidth: 1,
	        strokeLinecap: strokeLinecap,
	        strokeLinejoin: strokeLinejoin
	      },
	      axisLabel: (0, _assign3.default)({}, centeredLabelStyles, {
	        padding: 25
	      }),
	      grid: {
	        fill: "transparent",
	        stroke: "transparent",
	        pointerEvents: "none"
	      },
	      ticks: {
	        fill: "transparent",
	        size: 1,
	        stroke: "transparent"
	      },
	      tickLabels: baseLabelStyles
	    }
	  }, baseProps),
	  bar: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: charcoal,
	        padding: 8,
	        strokeWidth: 0
	      },
	      labels: baseLabelStyles
	    }
	  }, baseProps),
	  candlestick: (0, _assign3.default)({
	    style: {
	      data: {
	        stroke: charcoal,
	        strokeWidth: 1
	      },
	      labels: centeredLabelStyles
	    },
	    candleColors: {
	      positive: "#ffffff",
	      negative: charcoal
	    }
	  }, baseProps),
	  chart: baseProps,
	  errorbar: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        stroke: charcoal,
	        strokeWidth: 2
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  group: (0, _assign3.default)({
	    colorScale: colors
	  }, baseProps),
	  line: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        stroke: charcoal,
	        strokeWidth: 2
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  pie: {
	    style: {
	      data: {
	        padding: 10,
	        stroke: "transparent",
	        strokeWidth: 1
	      },
	      labels: (0, _assign3.default)({}, baseLabelStyles, { padding: 20 })
	    },
	    colorScale: colors,
	    width: 400,
	    height: 400,
	    padding: 50
	  },
	  scatter: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: charcoal,
	        stroke: "transparent",
	        strokeWidth: 0
	      },
	      labels: centeredLabelStyles
	    }
	  }, baseProps),
	  stack: (0, _assign3.default)({
	    colorScale: colors
	  }, baseProps),
	  tooltip: {
	    style: (0, _assign3.default)({}, centeredLabelStyles, { padding: 5, pointerEvents: "none" }),
	    flyoutStyle: {
	      stroke: charcoal,
	      strokeWidth: 1,
	      fill: "#f0f0f0",
	      pointerEvents: "none"
	    },
	    cornerRadius: 5,
	    pointerLength: 10
	  },
	  voronoi: (0, _assign3.default)({
	    style: {
	      data: {
	        fill: "transparent",
	        stroke: "transparent",
	        strokeWidth: 0
	      },
	      labels: (0, _assign3.default)({}, centeredLabelStyles, { padding: 5, pointerEvents: "none" }),
	      flyout: {
	        stroke: charcoal,
	        strokeWidth: 1,
	        fill: "#f0f0f0",
	        pointerEvents: "none"
	      }
	    }
	  }, baseProps),
	  legend: {
	    colorScale: colors,
	    style: {
	      data: {
	        type: "circle"
	      },
	      labels: baseLabelStyles
	    }
	  }
	};

/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _maxBy2 = __webpack_require__(218);

	var _maxBy3 = _interopRequireDefault(_maxBy2);

	var _sumBy2 = __webpack_require__(221);

	var _sumBy3 = _interopRequireDefault(_sumBy2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _isEmpty2 = __webpack_require__(207);

	var _isEmpty3 = _interopRequireDefault(_isEmpty2);

	var _merge2 = __webpack_require__(126);

	var _merge3 = _interopRequireDefault(_merge2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	var _style = __webpack_require__(194);

	var _style2 = _interopRequireDefault(_style);

	var _textsize = __webpack_require__(223);

	var _textsize2 = _interopRequireDefault(_textsize);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _victoryLabel = __webpack_require__(125);

	var _victoryLabel2 = _interopRequireDefault(_victoryLabel);

	var _victoryContainer = __webpack_require__(66);

	var _victoryContainer2 = _interopRequireDefault(_victoryContainer);

	var _victoryTheme = __webpack_require__(214);

	var _victoryTheme2 = _interopRequireDefault(_victoryTheme);

	var _point = __webpack_require__(224);

	var _point2 = _interopRequireDefault(_point);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [1, 2, 2.5, 3] }]*/


	var defaultLegendData = [{ name: "Series 1" }, { name: "Series 2" }];

	var VictoryLegend = function (_React$Component) {
	  _inherits(VictoryLegend, _React$Component);

	  function VictoryLegend() {
	    _classCallCheck(this, VictoryLegend);

	    return _possibleConstructorReturn(this, (VictoryLegend.__proto__ || Object.getPrototypeOf(VictoryLegend)).apply(this, arguments));
	  }

	  _createClass(VictoryLegend, [{
	    key: "calculateLegendHeight",
	    value: function calculateLegendHeight(textSizes, padding, isHorizontal) {
	      var _props = this.props,
	          gutter = _props.gutter,
	          itemsPerRow = _props.itemsPerRow;

	      var itemCount = textSizes.length;
	      var rowCount = itemsPerRow ? Math.ceil(itemCount / itemsPerRow) : 1;
	      var contentHeight = isHorizontal ? (0, _maxBy3.default)(textSizes, "height").height * rowCount + gutter * (rowCount - 1) : ((0, _sumBy3.default)(textSizes, "height") + gutter * (itemCount - 1)) / rowCount;

	      return padding.top + contentHeight + padding.bottom;
	    }

	    // eslint-disable-next-line max-params

	  }, {
	    key: "calculateLegendWidth",
	    value: function calculateLegendWidth(itemCount, padding, isHorizontal, maxTextWidth) {
	      var _props2 = this.props,
	          gutter = _props2.gutter,
	          itemsPerRow = _props2.itemsPerRow,
	          symbolSpacer = _props2.symbolSpacer;

	      var rowCount = itemsPerRow ? Math.ceil(itemCount / itemsPerRow) : 1;
	      var rowItemCount = itemsPerRow || itemCount;
	      var contentWidth = void 0;

	      if (isHorizontal) {
	        var gutterWidth = gutter * rowItemCount;
	        var symbolWidth = symbolSpacer * 3 * rowItemCount;
	        var textWidth = maxTextWidth * rowItemCount;
	        contentWidth = symbolWidth + textWidth + gutterWidth;
	      } else {
	        contentWidth = (maxTextWidth + symbolSpacer * 2 + gutter) * rowCount;
	      }

	      return padding.left + contentWidth + padding.right;
	    }
	  }, {
	    key: "getColorScale",
	    value: function getColorScale(theme) {
	      var colorScaleOptions = this.props.colorScale || theme.colorScale;
	      if (typeof colorScaleOptions === "string") {
	        colorScaleOptions = _style2.default.getColorScale(colorScaleOptions);
	      }
	      return !(0, _isEmpty3.default)(theme) ? colorScaleOptions || theme.colorScale : colorScaleOptions || [];
	    }
	  }, {
	    key: "getCalculatedProps",
	    value: function getCalculatedProps() {
	      var _this2 = this;

	      // eslint-disable-line max-statements
	      var role = this.constructor.role;
	      var _props3 = this.props,
	          data = _props3.data,
	          orientation = _props3.orientation,
	          theme = _props3.theme;

	      var legendTheme = theme && theme[role] ? theme[role] : {};
	      var parentStyles = this.getStyles({}, legendTheme, "parent");
	      var colorScale = this.getColorScale(legendTheme);
	      var isHorizontal = orientation === "horizontal";
	      var symbolStyles = [];
	      var labelStyles = [];
	      var _props4 = this.props,
	          height = _props4.height,
	          padding = _props4.padding,
	          width = _props4.width;

	      var maxTextWidth = 0;

	      padding = _helpers2.default.getPadding({ padding: padding || theme.padding });
	      height = _helpers2.default.evaluateProp(height || theme.height, data);
	      width = _helpers2.default.evaluateProp(width || theme.width, data);

	      var textSizes = data.map(function (datum, i) {
	        var labelStyle = _this2.getStyles(datum, legendTheme, "labels");
	        var textSize = _textsize2.default.approximateTextSize(datum.name, labelStyle);
	        maxTextWidth = textSize.width > maxTextWidth ? textSize.width : maxTextWidth;
	        symbolStyles[i] = _this2.getStyles(datum, legendTheme, "symbol", colorScale[i]);
	        labelStyles[i] = labelStyle;
	        return textSize;
	      });

	      if (!height) {
	        height = this.calculateLegendHeight(textSizes, padding, isHorizontal);
	      }
	      if (!width) {
	        width = this.calculateLegendWidth(textSizes.length, padding, isHorizontal, maxTextWidth);
	      }

	      return Object.assign({}, this.props, {
	        isHorizontal: isHorizontal,
	        height: height,
	        labelStyles: labelStyles,
	        maxTextWidth: maxTextWidth,
	        padding: padding,
	        parentStyles: parentStyles,
	        symbolStyles: symbolStyles,
	        width: width
	      });
	    }
	  }, {
	    key: "getStyles",
	    value: function getStyles(datum, theme, key, color) {
	      // eslint-disable-line max-params
	      var style = this.props.style;

	      var styleKey = key === "symbol" ? "data" : key;
	      var colorScaleStyle = color ? { fill: color } : {};
	      var styles = (0, _merge3.default)({}, theme.style[styleKey], colorScaleStyle, style[styleKey], datum[key]);
	      return _helpers2.default.evaluateStyle(styles, datum);
	    }
	  }, {
	    key: "getSymbolSize",
	    value: function getSymbolSize(datum, fontSize) {
	      return datum.symbol && datum.symbol.size ? datum.symbol.size : fontSize / 2.5;
	    }
	  }, {
	    key: "getSymbolProps",
	    value: function getSymbolProps(datum, props, i) {
	      var dataComponent = props.dataComponent,
	          gutter = props.gutter,
	          isHorizontal = props.isHorizontal,
	          itemsPerRow = props.itemsPerRow,
	          labelStyles = props.labelStyles,
	          maxTextWidth = props.maxTextWidth,
	          padding = props.padding,
	          symbolSpacer = props.symbolSpacer,
	          symbolStyles = props.symbolStyles;
	      var fontSize = labelStyles[i].fontSize;

	      var symbolShift = fontSize / 2;
	      var style = symbolStyles[i];
	      var rowHeight = fontSize + gutter;
	      var itemIndex = i;
	      var rowSpacer = 0;
	      var rowIndex = 0;

	      if (itemsPerRow) {
	        rowIndex = Math.floor(i / itemsPerRow);
	        rowSpacer = rowHeight * rowIndex;
	        itemIndex = i % itemsPerRow;
	      }

	      var symbolCoords = isHorizontal ? {
	        x: padding.left + symbolShift + (fontSize + symbolSpacer + maxTextWidth + gutter) * itemIndex,
	        y: padding.top + symbolShift + rowSpacer
	      } : {
	        x: padding.left + symbolShift + (rowHeight + maxTextWidth) * rowIndex,
	        y: padding.top + symbolShift + rowHeight * itemIndex
	      };

	      return (0, _defaults3.default)({}, dataComponent.props, _extends({
	        key: "symbol-" + i,
	        style: style,
	        size: this.getSymbolSize(datum, fontSize),
	        symbol: style.type
	      }, symbolCoords));
	    }
	  }, {
	    key: "getLabelProps",
	    value: function getLabelProps(datum, props, i) {
	      var gutter = props.gutter,
	          isHorizontal = props.isHorizontal,
	          itemsPerRow = props.itemsPerRow,
	          labelComponent = props.labelComponent,
	          labelStyles = props.labelStyles,
	          maxTextWidth = props.maxTextWidth,
	          padding = props.padding,
	          symbolSpacer = props.symbolSpacer;


	      var style = labelStyles[i];
	      var fontSize = style.fontSize;

	      var symbolShift = fontSize / 2;
	      var rowHeight = fontSize + gutter;
	      var symbolWidth = fontSize + symbolSpacer;
	      var itemIndex = i;
	      var rowSpacer = 0;
	      var rowIndex = 0;

	      if (itemsPerRow) {
	        rowIndex = Math.floor(i / itemsPerRow);
	        rowSpacer = rowHeight * rowIndex;
	        itemIndex = i % itemsPerRow;
	      }

	      var labelCoords = isHorizontal ? {
	        x: padding.left + symbolWidth * (itemIndex + 1) + (maxTextWidth + gutter) * itemIndex,
	        y: padding.top + symbolShift + rowSpacer
	      } : {
	        x: padding.left + symbolWidth + (rowHeight + maxTextWidth) * rowIndex,
	        y: padding.top + symbolShift + rowHeight * itemIndex
	      };

	      return (0, _defaults3.default)({}, labelComponent.props, _extends({
	        key: "label-" + i,
	        style: style,
	        text: datum.name
	      }, labelCoords));
	    }
	  }, {
	    key: "renderLegendItems",
	    value: function renderLegendItems(props) {
	      var _this3 = this;

	      var data = props.data,
	          dataComponent = props.dataComponent,
	          labelComponent = props.labelComponent;

	      var legendData = (0, _isEmpty3.default)(data) ? defaultLegendData : data;

	      var dataComponents = legendData.map(function (datum, i) {
	        return _react2.default.cloneElement(dataComponent, _this3.getSymbolProps(datum, props, i));
	      });
	      var labelComponents = legendData.map(function (datum, i) {
	        return _react2.default.cloneElement(labelComponent, _this3.getLabelProps(datum, props, i));
	      });

	      return [].concat(_toConsumableArray(dataComponents), _toConsumableArray(labelComponents));
	    }
	  }, {
	    key: "renderGroup",
	    value: function renderGroup(props, children) {
	      var groupComponent = props.groupComponent,
	          height = props.height,
	          parentStyles = props.parentStyles,
	          standalone = props.standalone,
	          width = props.width,
	          x = props.x,
	          y = props.y;

	      var groupProps = { role: "presentation" };

	      if (!standalone) {
	        groupProps = _extends({
	          height: height,
	          width: width,
	          transform: "translate(" + x + ", " + y + ")",
	          style: parentStyles
	        }, groupProps);
	      }

	      return _react2.default.cloneElement(groupComponent, groupProps, children);
	    }
	  }, {
	    key: "renderContainer",
	    value: function renderContainer(props, children) {
	      var containerComponent = props.containerComponent,
	          height = props.height,
	          parentStyles = props.parentStyles,
	          width = props.width;

	      return _react2.default.cloneElement(containerComponent, { height: height, width: width, style: parentStyles }, children);
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var props = this.getCalculatedProps();
	      var group = this.renderGroup(props, this.renderLegendItems(props));
	      return props.standalone ? this.renderContainer(props, group) : group;
	    }
	  }]);

	  return VictoryLegend;
	}(_react2.default.Component);

	VictoryLegend.displayName = "VictoryLegend";
	VictoryLegend.role = "legend";
	VictoryLegend.propTypes = {
	  colorScale: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.oneOf(["grayscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"])]),
	  containerComponent: _propTypes2.default.element,
	  data: _propTypes2.default.arrayOf(_propTypes2.default.shape({
	    name: _propTypes2.default.string.isRequired,
	    label: _propTypes2.default.object,
	    symbol: _propTypes2.default.object
	  })),
	  dataComponent: _propTypes2.default.element,
	  groupComponent: _propTypes2.default.element,
	  gutter: _propTypes2.default.number,
	  height: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  itemsPerRow: _propTypes2.default.number,
	  labelComponent: _propTypes2.default.element,
	  orientation: _propTypes2.default.oneOf(["horizontal", "vertical"]),
	  padding: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.shape({
	    top: _propTypes2.default.number,
	    bottom: _propTypes2.default.number,
	    left: _propTypes2.default.number,
	    right: _propTypes2.default.number
	  })]),
	  standalone: _propTypes2.default.bool,
	  style: _propTypes2.default.shape({
	    data: _propTypes2.default.object,
	    labels: _propTypes2.default.object,
	    parent: _propTypes2.default.object
	  }),
	  symbolSpacer: _propTypes2.default.number,
	  theme: _propTypes2.default.object,
	  width: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	};
	VictoryLegend.defaultProps = {
	  data: defaultLegendData,
	  containerComponent: _react2.default.createElement(_victoryContainer2.default, null),
	  dataComponent: _react2.default.createElement(_point2.default, null),
	  groupComponent: _react2.default.createElement("g", null),
	  gutter: 10,
	  labelComponent: _react2.default.createElement(_victoryLabel2.default, null),
	  orientation: "vertical",
	  standalone: true,
	  style: {},
	  symbolSpacer: 8,
	  theme: _victoryTheme2.default.grayscale,
	  x: 0,
	  y: 0
	};
	exports.default = VictoryLegend;

/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

	var baseExtremum = __webpack_require__(219),
	    baseGt = __webpack_require__(220),
	    baseIteratee = __webpack_require__(153);

	/**
	 * This method is like `_.max` except that it accepts `iteratee` which is
	 * invoked for each element in `array` to generate the criterion by which
	 * the value is ranked. The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Math
	 * @param {Array} array The array to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	 * @returns {*} Returns the maximum value.
	 * @example
	 *
	 * var objects = [{ 'n': 1 }, { 'n': 2 }];
	 *
	 * _.maxBy(objects, function(o) { return o.n; });
	 * // => { 'n': 2 }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.maxBy(objects, 'n');
	 * // => { 'n': 2 }
	 */
	function maxBy(array, iteratee) {
	  return (array && array.length)
	    ? baseExtremum(array, baseIteratee(iteratee, 2), baseGt)
	    : undefined;
	}

	module.exports = maxBy;


/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(96);

	/**
	 * The base implementation of methods like `_.max` and `_.min` which accepts a
	 * `comparator` to determine the extremum value.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The iteratee invoked per iteration.
	 * @param {Function} comparator The comparator used to compare values.
	 * @returns {*} Returns the extremum value.
	 */
	function baseExtremum(array, iteratee, comparator) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    var value = array[index],
	        current = iteratee(value);

	    if (current != null && (computed === undefined
	          ? (current === current && !isSymbol(current))
	          : comparator(current, computed)
	        )) {
	      var computed = current,
	          result = value;
	    }
	  }
	  return result;
	}

	module.exports = baseExtremum;


/***/ }),
/* 220 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.gt` which doesn't coerce arguments.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if `value` is greater than `other`,
	 *  else `false`.
	 */
	function baseGt(value, other) {
	  return value > other;
	}

	module.exports = baseGt;


/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIteratee = __webpack_require__(153),
	    baseSum = __webpack_require__(222);

	/**
	 * This method is like `_.sum` except that it accepts `iteratee` which is
	 * invoked for each element in `array` to generate the value to be summed.
	 * The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Math
	 * @param {Array} array The array to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	 * @returns {number} Returns the sum.
	 * @example
	 *
	 * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
	 *
	 * _.sumBy(objects, function(o) { return o.n; });
	 * // => 20
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.sumBy(objects, 'n');
	 * // => 20
	 */
	function sumBy(array, iteratee) {
	  return (array && array.length)
	    ? baseSum(array, baseIteratee(iteratee, 2))
	    : 0;
	}

	module.exports = sumBy;


/***/ }),
/* 222 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.sum` and `_.sumBy` without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {number} Returns the sum.
	 */
	function baseSum(array, iteratee) {
	  var result,
	      index = -1,
	      length = array.length;

	  while (++index < length) {
	    var current = iteratee(array[index]);
	    if (current !== undefined) {
	      result = result === undefined ? current : (result + current);
	    }
	  }
	  return result;
	}

	module.exports = baseSum;


/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _merge2 = __webpack_require__(126);

	var _merge3 = _interopRequireDefault(_merge2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	// http://www.pearsonified.com/2012/01/characters-per-line.php
	/*eslint-disable no-magic-numbers */
	var fontDictionary = {
	  "American Typewriter": 2.09,
	  "Baskerville": 2.51,
	  "Georgia": 2.27,
	  "Hoefler Text": 2.39,
	  "Palatino": 2.26,
	  "Times New Roman": 2.48,
	  "Arial": 2.26,
	  "Gill Sans": 2.47,
	  "Gill Sans 300": 2.58,
	  "Helvetica Neue": 2.24,
	  "Lucida Grande": 2.05,
	  "Tahoma": 2.25,
	  "Trebuchet MS": 2.2,
	  "Verdana": 1.96,
	  "Courier New": 1.67,
	  "cursive": 1.84,
	  "fantasy": 2.09,
	  "monospace": 1.81,
	  "serif": 2.04,
	  "sans-serif": 1.89
	};
	//https://developer.mozilla.org/en/docs/Web/CSS/length
	// Absolute sizes in pixels for obsolete measurement units.
	var absoluteMeasurementUnitsToPixels = {
	  "mm": 3.8,
	  "sm": 38,
	  "pt": 1.33,
	  "pc": 16,
	  "in": 96,
	  "px": 1
	};
	var relativeMeasurementUnitsCoef = {
	  "em": 1,
	  "ex": 0.5
	};

	var coefficients = {
	  averageFontConstant: 2.1675, // Average pixels per glyph in existing font.
	  widthOverlapCoef: 1.25, // Coefficient for width value to prevent overlap.
	  heightOverlapCoef: 1.05, // Coefficient for height value to prevent overlap.
	  lineCapitalCoef: 1.15, // Coefficient for height value. Reserve space for capital chars.
	  lineSpaceHeightCoef: 0.2 // Coefficient for height value. Reserve space between lines.
	};
	var defaultStyle = {
	  lineHeight: 1,
	  letterSpacing: "0px",
	  fontSize: 0,
	  angle: 0,
	  fontFamily: ""
	};

	var _degreeToRadian = function (angle) {
	  return angle * Math.PI / 180;
	};

	var _getFontCharacterConstant = function (fontFamily) {
	  var firstFont = fontFamily.split(",")[0].replace(/'|"/g, "");
	  return fontDictionary[firstFont] || coefficients.averageFontConstant;
	};

	var _splitToLines = function (text) {
	  return Array.isArray(text) ? text : text.toString().split(/\r\n|\r|\n/g);
	};

	var _getSizeWithRotate = function (axisSize, dependentSize, angle) {
	  var angleInRadian = _degreeToRadian(angle);
	  return Math.abs(Math.cos(angleInRadian) * axisSize) + Math.abs(Math.sin(angleInRadian) * dependentSize);
	};

	/**
	 * Convert length-type parameters from specific measurement units to pixels
	 * @param  {string} length Css length string value.
	 * @param  {number} fontSize Current text font-size.
	 * @returns {number} Approximate Css length in pixels.
	*/
	var convertLengthToPixels = function (length, fontSize) {
	  var attribute = length.match(/[a-zA-Z%]+/)[0];
	  var value = length.match(/[0-9.,]+/);
	  var result = void 0;
	  if (absoluteMeasurementUnitsToPixels.hasOwnProperty(attribute)) {
	    result = value * absoluteMeasurementUnitsToPixels[attribute];
	  } else if (relativeMeasurementUnitsCoef.hasOwnProperty(attribute)) {
	    result = (fontSize ? value * fontSize : value * coefficients.defaultFontSize) * relativeMeasurementUnitsCoef[attribute];
	  } else {
	    result = value;
	  }
	  return result;
	};

	var _prepareParams = function (inputStyle, index) {
	  var lineStyle = Array.isArray(inputStyle) ? inputStyle[index] : inputStyle;
	  var style = (0, _defaults3.default)({}, lineStyle, defaultStyle);
	  return (0, _merge3.default)({}, style, {
	    characterConstant: style.characterConstant || _getFontCharacterConstant(style.fontFamily),
	    letterSpacing: convertLengthToPixels(style.letterSpacing, style.fontSize),
	    fontSize: typeof style.fontSize === "number" ? style.fontSize : convertLengthToPixels(String(style.fontSize))
	  });
	};

	var _approximateTextWidthInternal = function (text, style) {
	  var widths = _splitToLines(text).map(function (line, index) {
	    var len = line.toString().length;

	    var _prepareParams2 = _prepareParams(style, index),
	        fontSize = _prepareParams2.fontSize,
	        characterConstant = _prepareParams2.characterConstant,
	        letterSpacing = _prepareParams2.letterSpacing;

	    return len * fontSize / characterConstant + letterSpacing * Math.max(len - 1, 0);
	  });
	  return Math.max.apply(Math, _toConsumableArray(widths));
	};

	var _approximateTextHeightInternal = function (text, style) {
	  return _splitToLines(text).reduce(function (total, line, index) {
	    var lineStyle = _prepareParams(style, index);
	    var height = lineStyle.fontSize * coefficients.lineCapitalCoef;
	    var emptySpace = index === 0 ? 0 : lineStyle.fontSize * coefficients.lineSpaceHeightCoef;
	    return total + lineStyle.lineHeight * (height + emptySpace);
	  }, 0);
	};

	/**
	 * Predict text size by font params.
	 * @param {string} text Content for width calculation.
	 * @param {Object} style Text styles, ,fontFamily, fontSize, etc.
	 * @param {string} style.fontFamily Text fontFamily.
	 * @param {(number|string)} style.fontSize Text fontSize.
	 * @param {number} style.angle Text rotate angle.
	 * @param {string} style.letterSpacing Text letterSpacing(space between letters).
	 * @param {number} style.characterConstant Average pixels per glyph.
	 * @param {number} style.lineHeight Line height coefficient.
	 * @returns {number} Approximate text label height.
	*/
	var approximateTextSize = function (text, style) {
	  var angle = Array.isArray(style) ? style[0] && style[0].angle : style && style.angle;
	  var height = _approximateTextHeightInternal(text, style);
	  var width = _approximateTextWidthInternal(text, style);
	  var widthWithRotate = angle ? _getSizeWithRotate(width, height, angle) : width;
	  var heightWithRotate = angle ? _getSizeWithRotate(height, width, angle) : height;
	  return {
	    width: widthWithRotate * coefficients.widthOverlapCoef,
	    height: heightWithRotate * coefficients.heightOverlapCoef
	  };
	};

	exports.default = {
	  approximateTextSize: approximateTextSize,
	  convertLengthToPixels: convertLengthToPixels
	};

/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _pathHelpers = __webpack_require__(225);

	var _pathHelpers2 = _interopRequireDefault(_pathHelpers);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Point = function (_React$Component) {
	  _inherits(Point, _React$Component);

	  function Point() {
	    _classCallCheck(this, Point);

	    return _possibleConstructorReturn(this, (Point.__proto__ || Object.getPrototypeOf(Point)).apply(this, arguments));
	  }

	  _createClass(Point, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          path = _calculateAttributes.path;

	      this.style = style;
	      this.path = path;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          path = _calculateAttributes2.path;

	      var _props = this.props,
	          className = _props.className,
	          datum = _props.datum,
	          x = _props.x,
	          y = _props.y,
	          size = _props.size,
	          symbol = _props.symbol;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [x, nextProps.x], [y, nextProps.y], [size, nextProps.size], [symbol, nextProps.symbol], [path, this.path], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        this.path = path;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active;

	      return {
	        style: _helpers2.default.evaluateStyle(style, datum, active),
	        path: this.getPath(props)
	      };
	    }
	  }, {
	    key: "getPath",
	    value: function getPath(props) {
	      var datum = props.datum,
	          active = props.active,
	          x = props.x,
	          y = props.y;

	      var pathFunctions = {
	        circle: _pathHelpers2.default.circle,
	        square: _pathHelpers2.default.square,
	        diamond: _pathHelpers2.default.diamond,
	        triangleDown: _pathHelpers2.default.triangleDown,
	        triangleUp: _pathHelpers2.default.triangleUp,
	        plus: _pathHelpers2.default.plus,
	        star: _pathHelpers2.default.star
	      };
	      var symbol = _helpers2.default.evaluateProp(props.symbol, datum, active);
	      var size = _helpers2.default.evaluateProp(props.size, datum, active);
	      return pathFunctions[symbol].call(null, x, y, size);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderPoint",
	    value: function renderPoint(path, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className;

	      return _react2.default.createElement("path", _extends({}, events, {
	        d: path,
	        className: className,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto",
	        style: style
	      }));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.renderPoint(this.path, this.style, this.props.events);
	    }
	  }]);

	  return Point;
	}(_react2.default.Component);

	Point.propTypes = _extends({}, _commonProps2.default, {
	  datum: _propTypes2.default.object,
	  size: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
	  symbol: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(["circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"]), _propTypes2.default.func]),
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	});
	exports.default = Point;

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _range2 = __webpack_require__(226);

	var _range3 = _interopRequireDefault(_range2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 2.5, 3] }]*/
	exports.default = {
	  circle: function (x, y, size) {
	    var s = Math.round(size);
	    return "M " + Math.round(x) + ", " + Math.round(y) + " m " + -s + ", 0\n      a " + s + ", " + s + " 0 1,0 " + s * 2 + ",0\n      a " + s + ", " + s + " 0 1,0 " + -s * 2 + ",0";
	  },
	  square: function (x, y, size) {
	    var baseSize = 0.87 * size; // eslint-disable-line no-magic-numbers
	    var x0 = Math.round(x - baseSize);
	    var x1 = Math.round(x + baseSize);
	    var y0 = Math.round(y - baseSize);
	    var y1 = Math.round(y + baseSize);
	    return "M " + x0 + ", " + y1 + "\n      L " + x1 + ", " + y1 + "\n      L " + x1 + ", " + y0 + "\n      L " + x0 + ", " + y0 + "\n      z";
	  },
	  diamond: function (x, y, size) {
	    var baseSize = 0.87 * size; // eslint-disable-line no-magic-numbers
	    var length = Math.sqrt(2 * (baseSize * baseSize));
	    return "M " + Math.round(x) + ", " + Math.round(y + length) + "\n      L " + Math.round(x + length) + ", " + Math.round(y) + "\n      L " + Math.round(x) + ", " + Math.round(y - length) + "\n      L " + Math.round(x - length) + ", " + Math.round(y) + "\n      z";
	  },
	  triangleDown: function (x, y, size) {
	    var height = size / 2 * Math.sqrt(3);
	    var x0 = Math.round(x - size);
	    var x1 = Math.round(x + size);
	    var y0 = Math.round(y - size);
	    var y1 = Math.round(y + height);
	    return "M " + x0 + ", " + y0 + "\n      L " + x1 + ", " + y0 + "\n      L " + Math.round(x) + ", " + y1 + "\n      z";
	  },
	  triangleUp: function (x, y, size) {
	    var height = size / 2 * Math.sqrt(3);
	    var x0 = Math.round(x - size);
	    var x1 = Math.round(x + size);
	    var y0 = Math.round(y - height);
	    var y1 = Math.round(y + size);
	    return "M " + x0 + ", " + y1 + "\n      L " + x1 + ", " + y1 + "\n      L " + Math.round(x) + ", " + y0 + "\n      z";
	  },
	  plus: function (x, y, size) {
	    var baseSize = 1.1 * size; // eslint-disable-line no-magic-numbers
	    return "M " + Math.round(x - baseSize / 2.5) + ", " + Math.round(y + baseSize) + "\n      L " + Math.round(x + baseSize / 2.5) + ", " + Math.round(y + baseSize) + "\n      L " + Math.round(x + baseSize / 2.5) + ", " + Math.round(y + baseSize / 2.5) + "\n      L " + Math.round(x + baseSize) + ", " + Math.round(y + baseSize / 2.5) + "\n      L " + Math.round(x + baseSize) + ", " + Math.round(y - baseSize / 2.5) + "\n      L " + Math.round(x + baseSize / 2.5) + ", " + Math.round(y - baseSize / 2.5) + "\n      L " + Math.round(x + baseSize / 2.5) + ", " + Math.round(y - baseSize) + "\n      L " + Math.round(x - baseSize / 2.5) + ", " + Math.round(y - baseSize) + "\n      L " + Math.round(x - baseSize / 2.5) + ", " + Math.round(y - baseSize / 2.5) + "\n      L " + Math.round(x - baseSize) + ", " + Math.round(y - baseSize / 2.5) + "\n      L " + Math.round(x - baseSize) + ", " + Math.round(y + baseSize / 2.5) + "\n      L " + Math.round(x - baseSize / 2.5) + ", " + Math.round(y + baseSize / 2.5) + "\n      z";
	  },
	  star: function (x, y, size) {
	    var baseSize = 1.35 * size; // eslint-disable-line no-magic-numbers
	    var angle = Math.PI / 5; // eslint-disable-line no-magic-numbers
	    var starCoords = (0, _range3.default)(10).map(function (index) {
	      // eslint-disable-line no-magic-numbers
	      var length = index % 2 === 0 ? baseSize : baseSize / 2;
	      return length * Math.sin(angle * (index + 1)) + x + ",\n        " + (length * Math.cos(angle * (index + 1)) + y);
	    });
	    return "M " + starCoords.join("L") + " z";
	  }
	};

/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

	var createRange = __webpack_require__(227);

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
	 * `start` is specified without an `end` or `step`. If `end` is not specified,
	 * it's set to `start` with `start` then set to `0`.
	 *
	 * **Note:** JavaScript follows the IEEE-754 standard for resolving
	 * floating-point values which can produce unexpected results.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {number} [start=0] The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} [step=1] The value to increment or decrement by.
	 * @returns {Array} Returns the range of numbers.
	 * @see _.inRange, _.rangeRight
	 * @example
	 *
	 * _.range(4);
	 * // => [0, 1, 2, 3]
	 *
	 * _.range(-4);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 5);
	 * // => [1, 2, 3, 4]
	 *
	 * _.range(0, 20, 5);
	 * // => [0, 5, 10, 15]
	 *
	 * _.range(0, -4, -1);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 4, 0);
	 * // => [1, 1, 1]
	 *
	 * _.range(0);
	 * // => []
	 */
	var range = createRange();

	module.exports = range;


/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRange = __webpack_require__(228),
	    isIterateeCall = __webpack_require__(71),
	    toFinite = __webpack_require__(229);

	/**
	 * Creates a `_.range` or `_.rangeRight` function.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new range function.
	 */
	function createRange(fromRight) {
	  return function(start, end, step) {
	    if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
	      end = step = undefined;
	    }
	    // Ensure the sign of `-0` is preserved.
	    start = toFinite(start);
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    } else {
	      end = toFinite(end);
	    }
	    step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
	    return baseRange(start, end, step, fromRight);
	  };
	}

	module.exports = createRange;


/***/ }),
/* 228 */
/***/ (function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeCeil = Math.ceil,
	    nativeMax = Math.max;

	/**
	 * The base implementation of `_.range` and `_.rangeRight` which doesn't
	 * coerce arguments.
	 *
	 * @private
	 * @param {number} start The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} step The value to increment or decrement by.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Array} Returns the range of numbers.
	 */
	function baseRange(start, end, step, fromRight) {
	  var index = -1,
	      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	      result = Array(length);

	  while (length--) {
	    result[fromRight ? length : ++index] = start;
	    start += step;
	  }
	  return result;
	}

	module.exports = baseRange;


/***/ }),
/* 229 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  active: _propTypes2.default.bool,
	  className: _propTypes2.default.string,
	  data: _propTypes2.default.array,
	  events: _propTypes2.default.object,
	  index: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
	  origin: _propTypes2.default.shape({ x: _propTypes2.default.number, y: _propTypes2.default.number }),
	  polar: _propTypes2.default.bool,
	  role: _propTypes2.default.string,
	  scale: _propTypes2.default.oneOfType([_propTypes4.default.scale, _propTypes2.default.shape({ x: _propTypes4.default.scale, y: _propTypes4.default.scale })]),
	  shapeRendering: _propTypes2.default.string,
	  style: _propTypes2.default.object
	};

/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _propTypes3 = __webpack_require__(150);

	var _propTypes4 = _interopRequireDefault(_propTypes3);

	var _textsize = __webpack_require__(223);

	var _textsize2 = _interopRequireDefault(_textsize);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _labelHelpers = __webpack_require__(193);

	var _labelHelpers2 = _interopRequireDefault(_labelHelpers);

	var _victoryLabel = __webpack_require__(125);

	var _victoryLabel2 = _interopRequireDefault(_victoryLabel);

	var _victoryTheme = __webpack_require__(214);

	var _victoryTheme2 = _interopRequireDefault(_victoryTheme);

	var _flyout = __webpack_require__(232);

	var _flyout2 = _interopRequireDefault(_flyout);

	var _victoryPortal = __webpack_require__(147);

	var _victoryPortal2 = _interopRequireDefault(_victoryPortal);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var fallbackProps = {
	  cornerRadius: 5,
	  pointerLength: 10,
	  pointerWidth: 10
	};

	var VictoryTooltip = function (_React$Component) {
	  _inherits(VictoryTooltip, _React$Component);

	  function VictoryTooltip() {
	    _classCallCheck(this, VictoryTooltip);

	    return _possibleConstructorReturn(this, (VictoryTooltip.__proto__ || Object.getPrototypeOf(VictoryTooltip)).apply(this, arguments));
	  }

	  _createClass(VictoryTooltip, [{
	    key: "getDefaultOrientation",
	    value: function getDefaultOrientation(props) {
	      var datum = props.datum,
	          horizontal = props.horizontal,
	          polar = props.polar;

	      if (!polar) {
	        var positive = horizontal ? "right" : "top";
	        var negative = horizontal ? "left" : "bottom";
	        return datum && datum.y < 0 ? negative : positive;
	      } else {
	        return this.getPolarOrientation(props, datum);
	      }
	    }
	  }, {
	    key: "getPolarOrientation",
	    value: function getPolarOrientation(props, datum) {
	      var degrees = _labelHelpers2.default.getDegrees(props, datum);
	      var placement = props.labelPlacement || "vertical";
	      if (placement === " vertical") {
	        return this.getVerticalOrientations(degrees);
	      } else if (placement === "parallel") {
	        return degrees < 90 || degrees > 270 ? "right" : "left";
	      } else {
	        return degrees > 180 ? "bottom" : "top";
	      }
	    }
	  }, {
	    key: "getVerticalOrientations",
	    value: function getVerticalOrientations(degrees) {
	      if (degrees < 45 || degrees > 315) {
	        // eslint-disable-line no-magic-numbers
	        return "right";
	      } else if (degrees >= 45 && degrees <= 135) {
	        // eslint-disable-line no-magic-numbers
	        return "top";
	      } else if (degrees > 135 && degrees < 225) {
	        // eslint-disable-line no-magic-numbers
	        return "left";
	      } else {
	        return "bottom";
	      }
	    }
	  }, {
	    key: "getEvaluatedProps",
	    value: function getEvaluatedProps(props) {
	      var horizontal = props.horizontal,
	          datum = props.datum,
	          pointerLength = props.pointerLength,
	          pointerWidth = props.pointerWidth,
	          cornerRadius = props.cornerRadius,
	          width = props.width,
	          height = props.height,
	          dx = props.dx,
	          dy = props.dy,
	          text = props.text,
	          active = props.active;


	      var style = Array.isArray(props.style) ? props.style.map(function (s) {
	        return _helpers2.default.evaluateStyle(s, datum, active);
	      }) : _helpers2.default.evaluateStyle(props.style, datum, active);
	      var flyoutStyle = _helpers2.default.evaluateStyle(props.flyoutStyle, datum, active);
	      var padding = flyoutStyle && flyoutStyle.padding || 0;
	      var defaultDx = horizontal ? padding : 0;
	      var defaultDy = horizontal ? 0 : padding;
	      var orientation = _helpers2.default.evaluateProp(props.orientation, datum, active) || this.getDefaultOrientation(props);
	      return (0, _assign3.default)({}, props, {
	        style: style,
	        flyoutStyle: flyoutStyle,
	        orientation: orientation,
	        dx: dx !== undefined ? _helpers2.default.evaluateProp(dx, datum, active) : defaultDx,
	        dy: dy !== undefined ? _helpers2.default.evaluateProp(dy, datum, active) : defaultDy,
	        cornerRadius: _helpers2.default.evaluateProp(cornerRadius, datum, active),
	        pointerLength: _helpers2.default.evaluateProp(pointerLength, datum, active),
	        pointerWidth: _helpers2.default.evaluateProp(pointerWidth, datum, active),
	        width: _helpers2.default.evaluateProp(width, datum, active),
	        height: _helpers2.default.evaluateProp(height, datum, active),
	        active: _helpers2.default.evaluateProp(active, datum, active),
	        text: _helpers2.default.evaluateProp(text, datum, active)
	      });
	    }
	  }, {
	    key: "getCalculatedValues",
	    value: function getCalculatedValues(props) {
	      var style = props.style,
	          text = props.text,
	          datum = props.datum,
	          theme = props.theme,
	          active = props.active;

	      var defaultLabelStyles = theme && theme.tooltip && theme.tooltip.style ? theme.tooltip.style : {};
	      var baseLabelStyle = Array.isArray(style) ? style.map(function (s) {
	        return (0, _defaults3.default)({}, s, defaultLabelStyles);
	      }) : (0, _defaults3.default)({}, style, defaultLabelStyles);
	      var defaultFlyoutStyles = theme && theme.tooltip && theme.tooltip.flyoutStyle ? theme.tooltip.flyoutStyle : {};
	      var flyoutStyle = props.flyoutStyle ? (0, _defaults3.default)({}, props.flyoutStyle, defaultFlyoutStyles) : defaultFlyoutStyles;
	      var labelStyle = Array.isArray(baseLabelStyle) ? baseLabelStyle.map(function (s) {
	        return _helpers2.default.evaluateStyle(s, datum, active);
	      }) : _helpers2.default.evaluateStyle(baseLabelStyle, datum, active);
	      var labelSize = _textsize2.default.approximateTextSize(text, labelStyle);
	      var flyoutDimensions = this.getDimensions(props, labelSize, labelStyle);
	      var flyoutCenter = this.getFlyoutCenter(props, flyoutDimensions);
	      var transform = this.getTransform(props);
	      return { labelStyle: labelStyle, flyoutStyle: flyoutStyle, labelSize: labelSize, flyoutDimensions: flyoutDimensions, flyoutCenter: flyoutCenter, transform: transform };
	    }
	  }, {
	    key: "getTransform",
	    value: function getTransform(props) {
	      var x = props.x,
	          y = props.y,
	          style = props.style;

	      var labelStyle = style || {};
	      var angle = labelStyle.angle || props.angle || this.getDefaultAngle(props);
	      return angle ? "rotate(" + angle + " " + x + " " + y + ")" : undefined;
	    }

	    // eslint-disable-next-line complexity

	  }, {
	    key: "getDefaultAngle",
	    value: function getDefaultAngle(props) {
	      var polar = props.polar,
	          labelPlacement = props.labelPlacement,
	          orientation = props.orientation,
	          datum = props.datum;

	      if (!polar || !labelPlacement || labelPlacement === "vertical") {
	        return 0;
	      }
	      var degrees = _labelHelpers2.default.getDegrees(props, datum);
	      var sign = degrees > 90 && degrees < 180 || degrees > 270 ? 1 : -1;
	      var labelRotation = labelPlacement === "perpendicular" ? 0 : 90;
	      var angle = void 0;
	      if (degrees === 0 || degrees === 180) {
	        angle = orientation === "top" && degrees === 180 ? 270 : 90;
	      } else if (degrees > 0 && degrees < 180) {
	        angle = 90 - degrees;
	      } else if (degrees > 180 && degrees < 360) {
	        angle = 270 - degrees;
	      }
	      return angle + sign * labelRotation;
	    }
	  }, {
	    key: "getFlyoutCenter",
	    value: function getFlyoutCenter(props, dimensions) {
	      var x = props.x,
	          y = props.y,
	          dx = props.dx,
	          dy = props.dy,
	          pointerLength = props.pointerLength,
	          orientation = props.orientation;
	      var height = dimensions.height,
	          width = dimensions.width;

	      var sign = orientation === "right" || orientation === "top" ? 1 : -1;
	      return {
	        x: orientation === "left" || orientation === "right" ? x + sign * (pointerLength + width / 2 + dx) : x + sign * dx,
	        y: orientation === "top" || orientation === "bottom" ? y - sign * (pointerLength + height / 2 + dy) : y - sign * dy
	      };
	    }
	  }, {
	    key: "getLabelPadding",
	    value: function getLabelPadding(style) {
	      if (!style) {
	        return 0;
	      }
	      var paddings = Array.isArray(style) ? style.map(function (s) {
	        return s.padding;
	      }) : [style.padding];
	      return Math.max.apply(Math, _toConsumableArray(paddings).concat([0]));
	    }
	  }, {
	    key: "getDimensions",
	    value: function getDimensions(props, labelSize, labelStyle) {
	      var orientation = props.orientation,
	          cornerRadius = props.cornerRadius,
	          pointerLength = props.pointerLength,
	          pointerWidth = props.pointerWidth;

	      var padding = this.getLabelPadding(labelStyle);
	      var getHeight = function () {
	        var calculatedHeight = labelSize.height + padding;
	        var minHeight = orientation === "top" || orientation === "bottom" ? 2 * cornerRadius : 2 * cornerRadius + pointerWidth;
	        return Math.max(minHeight, calculatedHeight);
	      };
	      var getWidth = function () {
	        var calculatedWidth = labelSize.width + padding;
	        var minWidth = orientation === "left" || orientation === "right" ? 2 * cornerRadius + pointerLength : 2 * cornerRadius;
	        return Math.max(minWidth, calculatedWidth);
	      };
	      return {
	        height: props.height || getHeight(props, labelSize, orientation) + padding / 2,
	        width: props.width || getWidth(props, labelSize, orientation) + padding
	      };
	    }
	  }, {
	    key: "getLabelProps",
	    value: function getLabelProps(props, calculatedValues) {
	      var flyoutCenter = calculatedValues.flyoutCenter,
	          labelStyle = calculatedValues.labelStyle,
	          labelSize = calculatedValues.labelSize,
	          dy = calculatedValues.dy,
	          dx = calculatedValues.dx;
	      var text = props.text,
	          datum = props.datum,
	          labelComponent = props.labelComponent,
	          index = props.index;

	      var textAnchor = (Array.isArray(labelStyle) && labelStyle.length ? labelStyle[0].textAnchor : labelStyle.textAnchor) || "middle";
	      var getLabelX = function () {
	        var sign = textAnchor === "end" ? -1 : 1;
	        return flyoutCenter.x - sign * (labelSize.width / 2);
	      };
	      return (0, _defaults3.default)({}, labelComponent.props, {
	        key: "label-" + index,
	        text: text, datum: datum, textAnchor: textAnchor, dy: dy, dx: dx,
	        style: labelStyle,
	        x: !textAnchor || textAnchor === "middle" ? flyoutCenter.x : getLabelX(),
	        y: flyoutCenter.y,
	        verticalAnchor: "middle",
	        angle: labelStyle.angle
	      });
	    }
	  }, {
	    key: "getFlyoutProps",
	    value: function getFlyoutProps(props, calculatedValues) {
	      var flyoutDimensions = calculatedValues.flyoutDimensions,
	          flyoutStyle = calculatedValues.flyoutStyle;
	      var x = props.x,
	          y = props.y,
	          dx = props.dx,
	          dy = props.dy,
	          datum = props.datum,
	          index = props.index,
	          orientation = props.orientation,
	          pointerLength = props.pointerLength,
	          pointerWidth = props.pointerWidth,
	          cornerRadius = props.cornerRadius,
	          events = props.events,
	          flyoutComponent = props.flyoutComponent;

	      return (0, _defaults3.default)({}, flyoutComponent.props, {
	        x: x, y: y, dx: dx, dy: dy, datum: datum, index: index, orientation: orientation, pointerLength: pointerLength, pointerWidth: pointerWidth, cornerRadius: cornerRadius, events: events,
	        key: "flyout-" + index,
	        width: flyoutDimensions.width,
	        height: flyoutDimensions.height,
	        style: flyoutStyle
	      });
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderTooltip",
	    value: function renderTooltip(props) {
	      var evaluatedProps = this.getEvaluatedProps(props);
	      var flyoutComponent = evaluatedProps.flyoutComponent,
	          labelComponent = evaluatedProps.labelComponent,
	          groupComponent = evaluatedProps.groupComponent,
	          active = evaluatedProps.active,
	          renderInPortal = evaluatedProps.renderInPortal;

	      if (!active) {
	        return null;
	      }
	      var calculatedValues = this.getCalculatedValues(evaluatedProps);
	      var children = [_react2.default.cloneElement(flyoutComponent, this.getFlyoutProps(evaluatedProps, calculatedValues)), _react2.default.cloneElement(labelComponent, this.getLabelProps(evaluatedProps, calculatedValues))];
	      var tooltip = _react2.default.cloneElement(groupComponent, { role: "presentation", transform: calculatedValues.transform }, children);
	      return renderInPortal ? _react2.default.createElement(
	        _victoryPortal2.default,
	        null,
	        tooltip
	      ) : tooltip;
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var props = _helpers2.default.modifyProps(this.props, fallbackProps, "tooltip");
	      return this.renderTooltip(props);
	    }
	  }]);

	  return VictoryTooltip;
	}(_react2.default.Component);

	VictoryTooltip.displayName = "VictoryTooltip";
	VictoryTooltip.propTypes = {
	  activateData: _propTypes2.default.bool,
	  active: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
	  angle: _propTypes2.default.number,
	  cornerRadius: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  data: _propTypes2.default.array,
	  datum: _propTypes2.default.object,
	  dx: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
	  dy: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
	  events: _propTypes2.default.object,
	  flyoutComponent: _propTypes2.default.element,
	  flyoutStyle: _propTypes2.default.object,
	  groupComponent: _propTypes2.default.element,
	  height: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  horizontal: _propTypes2.default.bool,
	  index: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
	  labelComponent: _propTypes2.default.element,
	  orientation: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(["top", "bottom", "left", "right"]), _propTypes2.default.func]),
	  pointerLength: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  pointerWidth: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  polar: _propTypes2.default.bool,
	  renderInPortal: _propTypes2.default.bool,
	  style: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
	  text: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.func, _propTypes2.default.array]),
	  theme: _propTypes2.default.object,
	  width: _propTypes2.default.oneOfType([_propTypes4.default.nonNegative, _propTypes2.default.func]),
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	};
	VictoryTooltip.defaultProps = {
	  theme: _victoryTheme2.default.grayscale,
	  active: false,
	  renderInPortal: true,
	  labelComponent: _react2.default.createElement(_victoryLabel2.default, null),
	  flyoutComponent: _react2.default.createElement(_flyout2.default, null),
	  groupComponent: _react2.default.createElement("g", null)
	};
	VictoryTooltip.defaultEvents = [{
	  target: "data",
	  eventHandlers: {
	    onMouseOver: function (targetProps) {
	      return [{
	        target: "labels",
	        mutation: function () {
	          return { active: true };
	        }
	      }, {
	        target: "data",
	        mutation: function () {
	          return targetProps.activateData ? { active: true } : { active: undefined };
	        }
	      }];
	    },
	    onMouseOut: function () {
	      return [{
	        target: "labels",
	        mutation: function () {
	          return { active: undefined };
	        }
	      }, {
	        target: "data",
	        mutation: function () {
	          return { active: undefined };
	        }
	      }];
	    }
	  }
	}];
	exports.default = VictoryTooltip;

/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2] }]*/


	var Flyout = function (_React$Component) {
	  _inherits(Flyout, _React$Component);

	  function Flyout() {
	    _classCallCheck(this, Flyout);

	    return _possibleConstructorReturn(this, (Flyout.__proto__ || Object.getPrototypeOf(Flyout)).apply(this, arguments));
	  }

	  _createClass(Flyout, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          path = _calculateAttributes.path;

	      this.style = style;
	      this.path = path;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          path = _calculateAttributes2.path;

	      var _props = this.props,
	          className = _props.className,
	          cornerRadius = _props.cornerRadius,
	          datum = _props.datum,
	          dx = _props.dx,
	          dy = _props.dy,
	          height = _props.height,
	          width = _props.width,
	          orientation = _props.orientation,
	          pointerLength = _props.pointerLength,
	          pointerWidth = _props.pointerWidth,
	          x = _props.x,
	          y = _props.y;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [cornerRadius, nextProps.cornerRadius], [dx, nextProps.dx], [dy, nextProps.dy], [x, nextProps.x], [y, nextProps.y], [height, nextProps.height], [width, nextProps.width], [orientation, nextProps.orientation], [pointerLength, nextProps.pointerLength], [pointerWidth, nextProps.pointerWidth], [path, this.path], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        this.path = path;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var datum = props.datum,
	          active = props.active,
	          style = props.style;

	      return {
	        style: _helpers2.default.evaluateStyle(style, datum, active),
	        path: this.getFlyoutPath(props)
	      };
	    }
	  }, {
	    key: "getVerticalPath",
	    value: function getVerticalPath(props) {
	      var pointerLength = props.pointerLength,
	          pointerWidth = props.pointerWidth,
	          cornerRadius = props.cornerRadius,
	          orientation = props.orientation,
	          width = props.width,
	          height = props.height;

	      var sign = orientation === "top" ? 1 : -1;
	      var x = props.x + (props.dx || 0);
	      var y = props.y - sign * (props.dy || 0);
	      var pointerEdge = y - sign * pointerLength;
	      var oppositeEdge = y - sign * pointerLength - sign * height;
	      var rightEdge = x + width / 2;
	      var leftEdge = x - width / 2;
	      var direction = orientation === "top" ? "0 0 0" : "0 0 1";
	      var arc = Math.round(cornerRadius) + " " + Math.round(cornerRadius) + " " + direction;
	      return "M " + Math.round(x - pointerWidth / 2) + ", " + Math.round(pointerEdge) + "\n      L " + Math.round(x) + ", " + Math.round(y) + "\n      L " + Math.round(x + pointerWidth / 2) + ", " + Math.round(pointerEdge) + "\n      L " + Math.round(rightEdge - cornerRadius) + ", " + Math.round(pointerEdge) + "\n      A " + arc + " " + Math.round(rightEdge) + ", " + Math.round(pointerEdge - sign * cornerRadius) + "\n      L " + Math.round(rightEdge) + ", " + Math.round(oppositeEdge + sign * cornerRadius) + "\n      A " + arc + " " + Math.round(rightEdge - cornerRadius) + ", " + Math.round(oppositeEdge) + "\n      L " + Math.round(leftEdge + cornerRadius) + ", " + Math.round(oppositeEdge) + "\n      A " + arc + " " + Math.round(leftEdge) + ", " + Math.round(oppositeEdge + sign * cornerRadius) + "\n      L " + Math.round(leftEdge) + ", " + Math.round(pointerEdge - sign * cornerRadius) + "\n      A " + arc + " " + Math.round(leftEdge + cornerRadius) + ", " + Math.round(pointerEdge) + "\n      z";
	    }
	  }, {
	    key: "getHorizontalPath",
	    value: function getHorizontalPath(props) {
	      var pointerLength = props.pointerLength,
	          pointerWidth = props.pointerWidth,
	          cornerRadius = props.cornerRadius,
	          orientation = props.orientation,
	          width = props.width,
	          height = props.height;

	      var sign = orientation === "right" ? 1 : -1;
	      var x = props.x + sign * (props.dx || 0);
	      var y = props.y - (props.dy || 0);
	      var pointerEdge = x + sign * pointerLength;
	      var oppositeEdge = x + sign * pointerLength + sign * width;
	      var bottomEdge = y + height / 2;
	      var topEdge = y - height / 2;
	      var direction = orientation === "right" ? "0 0 0" : "0 0 1";
	      var arc = Math.round(cornerRadius) + " " + Math.round(cornerRadius) + " " + direction;
	      return "M " + Math.round(pointerEdge) + ", " + Math.round(y - pointerWidth / 2) + "\n      L " + Math.round(x) + ", " + Math.round(y) + "\n      L " + Math.round(pointerEdge) + ", " + Math.round(y + pointerWidth / 2) + "\n      L " + Math.round(pointerEdge) + ", " + Math.round(bottomEdge - cornerRadius) + "\n      A " + arc + " " + Math.round(pointerEdge + sign * cornerRadius) + ", " + Math.round(bottomEdge) + "\n      L " + (oppositeEdge - sign * cornerRadius) + ", " + bottomEdge + "\n      A " + arc + " " + Math.round(oppositeEdge) + ", " + Math.round(bottomEdge - cornerRadius) + "\n      L " + oppositeEdge + ", " + (topEdge + cornerRadius) + "\n      A " + arc + " " + Math.round(oppositeEdge - sign * cornerRadius) + ", " + Math.round(topEdge) + "\n      L " + Math.round(pointerEdge + sign * cornerRadius) + ", " + Math.round(topEdge) + "\n      A " + arc + " " + Math.round(pointerEdge) + ", " + Math.round(topEdge + cornerRadius) + "\n      z";
	    }
	  }, {
	    key: "getFlyoutPath",
	    value: function getFlyoutPath(props) {
	      var orientation = props.orientation || "top";
	      return orientation === "left" || orientation === "right" ? this.getHorizontalPath(props) : this.getVerticalPath(props);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderFlyout",
	    value: function renderFlyout(path, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className;

	      return _react2.default.createElement("path", _extends({
	        className: className,
	        d: path,
	        style: style,
	        shapeRendering: shapeRendering || "auto",
	        role: role || "presentation"
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.renderFlyout(this.path, this.style, this.props.events);
	    }
	  }]);

	  return Flyout;
	}(_react2.default.Component);

	Flyout.propTypes = _extends({}, _commonProps2.default, {
	  cornerRadius: _propTypes2.default.number,
	  datum: _propTypes2.default.object,
	  dx: _propTypes2.default.number,
	  dy: _propTypes2.default.number,
	  height: _propTypes2.default.number,
	  orientation: _propTypes2.default.oneOf(["top", "bottom", "left", "right"]),
	  pointerLength: _propTypes2.default.number,
	  pointerWidth: _propTypes2.default.number,
	  width: _propTypes2.default.number,
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	});
	exports.default = Flyout;

/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _isEqual2 = __webpack_require__(190);

	var _isEqual3 = _interopRequireDefault(_isEqual2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 180] }]*/


	var Arc = function (_React$Component) {
	  _inherits(Arc, _React$Component);

	  function Arc() {
	    _classCallCheck(this, Arc);

	    return _possibleConstructorReturn(this, (Arc.__proto__ || Object.getPrototypeOf(Arc)).apply(this, arguments));
	  }

	  _createClass(Arc, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      this.style = this.getStyle(this.props);
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _props = this.props,
	          cx = _props.cx,
	          cy = _props.cy,
	          r = _props.r;

	      var style = this.getStyle(nextProps);
	      if (cx !== nextProps.cx || cy !== nextProps.cy || r !== nextProps.r) {
	        this.style = style;
	        return true;
	      }
	      if (!(0, _isEqual3.default)(style, this.style)) {
	        this.style = style;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "getStyle",
	    value: function getStyle(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active;

	      return _helpers2.default.evaluateStyle((0, _assign3.default)({ stroke: "black", fill: "none" }, style), datum, active);
	    }
	  }, {
	    key: "getArcPath",
	    value: function getArcPath(props) {
	      var cx = props.cx,
	          cy = props.cy,
	          r = props.r,
	          startAngle = props.startAngle,
	          endAngle = props.endAngle,
	          closedPath = props.closedPath;
	      // Always draw the path as two arcs so that complete circles may be rendered.

	      var halfAngle = Math.abs(endAngle - startAngle) / 2 + startAngle;
	      var x1 = cx + r * Math.cos(_helpers2.default.degreesToRadians(startAngle));
	      var y1 = cy - r * Math.sin(_helpers2.default.degreesToRadians(startAngle));
	      var x2 = cx + r * Math.cos(_helpers2.default.degreesToRadians(halfAngle));
	      var y2 = cy - r * Math.sin(_helpers2.default.degreesToRadians(halfAngle));
	      var x3 = cx + r * Math.cos(_helpers2.default.degreesToRadians(endAngle));
	      var y3 = cy - r * Math.sin(_helpers2.default.degreesToRadians(endAngle));
	      var largerArcFlag1 = halfAngle - startAngle <= 180 ? 0 : 1;
	      var largerArcFlag2 = endAngle - halfAngle <= 180 ? 0 : 1;
	      var arcStart = closedPath ? " M " + cx + ", " + cy + " L " + x1 + ", " + y1 : "M " + x1 + ", " + y1;
	      var arc1 = "A " + r + ", " + r + ", 0, " + largerArcFlag1 + ", 0, " + x2 + ", " + y2;
	      var arc2 = "A " + r + ", " + r + ", 0, " + largerArcFlag2 + ", 0, " + x3 + ", " + y3;
	      var arcEnd = closedPath ? "Z" : "";
	      return arcStart + " " + arc1 + " " + arc2 + " " + arcEnd;
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderAxisLine",
	    value: function renderAxisLine(props, style, events) {
	      var role = props.role,
	          shapeRendering = props.shapeRendering,
	          className = props.className;

	      var path = this.getArcPath(props);
	      return _react2.default.createElement("path", _extends({ className: className,
	        d: path,
	        style: style,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto"
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.renderAxisLine(this.props, this.style, this.props.events);
	    }
	  }]);

	  return Arc;
	}(_react2.default.Component);

	Arc.propTypes = _extends({}, _commonProps2.default, {
	  closedPath: _propTypes2.default.bool,
	  cx: _propTypes2.default.number,
	  cy: _propTypes2.default.number,
	  datum: _propTypes2.default.any,
	  endAngle: _propTypes2.default.number,
	  r: _propTypes2.default.number,
	  startAngle: _propTypes2.default.number
	});
	exports.default = Arc;

/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _helpers3 = __webpack_require__(235);

	var _d3Shape = __webpack_require__(236);

	var d3Shape = _interopRequireWildcard(_d3Shape);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2] }]*/


	var Area = function (_React$Component) {
	  _inherits(Area, _React$Component);

	  function Area() {
	    _classCallCheck(this, Area);

	    return _possibleConstructorReturn(this, (Area.__proto__ || Object.getPrototypeOf(Area)).apply(this, arguments));
	  }

	  _createClass(Area, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          areaPath = _calculateAttributes.areaPath,
	          linePath = _calculateAttributes.linePath;

	      this.style = style;
	      this.areaPath = areaPath;
	      this.linePath = linePath;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          areaPath = _calculateAttributes2.areaPath,
	          linePath = _calculateAttributes2.linePath;

	      var _props = this.props,
	          className = _props.className,
	          interpolation = _props.interpolation;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [interpolation, nextProps.interpolation], [linePath, this.linePath], [areaPath, this.areaPath], [style, this.style]])) {
	        this.style = style;
	        this.areaPath = areaPath;
	        this.linePath = linePath;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "getLineFunction",
	    value: function getLineFunction(props) {
	      var polar = props.polar,
	          scale = props.scale;

	      var interpolation = this.toNewName(props.interpolation);
	      return polar ? d3Shape.lineRadial().defined(_helpers3.defined).curve(d3Shape[interpolation + "Closed"]).angle((0, _helpers3.getAngleAccessor)(scale)).radius((0, _helpers3.getY0Accessor)(scale)) : d3Shape.line().defined(_helpers3.defined).curve(d3Shape[interpolation]).x((0, _helpers3.getXAccessor)(scale)).y((0, _helpers3.getYAccessor)(scale));
	    }
	  }, {
	    key: "getAreaFunction",
	    value: function getAreaFunction(props) {
	      var polar = props.polar,
	          scale = props.scale;

	      var interpolation = this.toNewName(props.interpolation);
	      return polar ? d3Shape.radialArea().defined(_helpers3.defined).curve(d3Shape[interpolation + "Closed"]).angle((0, _helpers3.getAngleAccessor)(scale)).outerRadius((0, _helpers3.getYAccessor)(scale)).innerRadius((0, _helpers3.getY0Accessor)(scale)) : d3Shape.area().defined(_helpers3.defined).curve(d3Shape[interpolation]).x((0, _helpers3.getXAccessor)(scale)).y1((0, _helpers3.getYAccessor)(scale)).y0((0, _helpers3.getY0Accessor)(scale));
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = props.style,
	          data = props.data,
	          active = props.active;

	      var areaFunction = this.getAreaFunction(props);
	      var lineFunction = this.getLineFunction(props);
	      return {
	        style: _helpers2.default.evaluateStyle((0, _assign3.default)({ fill: "black" }, style), data, active),
	        areaPath: areaFunction(data),
	        linePath: lineFunction(data)
	      };
	    }
	  }, {
	    key: "toNewName",
	    value: function toNewName(interpolation) {
	      // d3 shape changed the naming scheme for interpolators from "basis" -> "curveBasis" etc.
	      var capitalize = function (s) {
	        return s && s[0].toUpperCase() + s.slice(1);
	      };
	      return "curve" + capitalize(interpolation);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderArea",
	    value: function renderArea(path, style, events) {
	      var areaStroke = style.stroke ? "none" : style.fill;
	      var areaStyle = (0, _assign3.default)({}, style, { stroke: areaStroke });
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className,
	          polar = _props2.polar,
	          origin = _props2.origin;

	      var transform = polar && origin ? "translate(" + origin.x + ", " + origin.y + ")" : undefined;
	      return _react2.default.createElement("path", _extends({
	        key: "area",
	        style: areaStyle,
	        shapeRendering: shapeRendering || "auto",
	        role: role || "presentation",
	        d: path,
	        transform: transform,
	        className: className
	      }, events));
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderLine",
	    value: function renderLine(path, style, events) {
	      if (!style.stroke || style.stroke === "none" || style.stroke === "transparent") {
	        return null;
	      }
	      var _props3 = this.props,
	          role = _props3.role,
	          shapeRendering = _props3.shapeRendering,
	          className = _props3.className,
	          polar = _props3.polar,
	          origin = _props3.origin;

	      var transform = polar && origin ? "translate(" + origin.x + ", " + origin.y + ")" : undefined;
	      var lineStyle = (0, _assign3.default)({}, style, { fill: "none" });
	      return _react2.default.createElement("path", _extends({
	        key: "area-stroke",
	        style: lineStyle,
	        shapeRendering: shapeRendering || "auto",
	        role: role || "presentation",
	        d: path,
	        transform: transform,
	        className: className
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _props4 = this.props,
	          events = _props4.events,
	          groupComponent = _props4.groupComponent;

	      var area = this.renderArea(this.areaPath, this.style, events);
	      var line = this.renderLine(this.linePath, this.style, events);

	      if (!line) {
	        return area;
	      }
	      var children = [area, line].map(function (el, i) {
	        return _react2.default.cloneElement(el, { key: i });
	      });
	      return _react2.default.cloneElement(groupComponent, {}, children);
	    }
	  }]);

	  return Area;
	}(_react2.default.Component);

	Area.propTypes = _extends({}, _commonProps2.default, {
	  groupComponent: _propTypes2.default.element,
	  interpolation: _propTypes2.default.string
	});
	Area.defaultProps = {
	  groupComponent: _react2.default.createElement("g", null)
	};
	exports.default = Area;

/***/ }),
/* 235 */
/***/ (function(module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var defined = function (d) {
	  var y = d._y1 !== undefined ? d._y1 : d._y;
	  return y !== null && y !== undefined && d._y0 !== null;
	};

	var getXAccessor = function (scale) {
	  return function (d) {
	    return scale.x(d._x1 !== undefined ? d._x1 : d._x);
	  };
	};

	var getYAccessor = function (scale) {
	  return function (d) {
	    return scale.y(d._y1 !== undefined ? d._y1 : d._y);
	  };
	};

	var getY0Accessor = function (scale) {
	  return function (d) {
	    return scale.y(d._y0);
	  };
	};

	var getAngleAccessor = function (scale) {
	  return function (d) {
	    var x = scale.x(d._x1 !== undefined ? d._x1 : d._x);
	    return -1 * x + Math.PI / 2;
	  };
	};

	exports.defined = defined;
	exports.getXAccessor = getXAccessor;
	exports.getYAccessor = getYAccessor;
	exports.getY0Accessor = getY0Accessor;
	exports.getAngleAccessor = getAngleAccessor;

/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-shape/ v1.3.7 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports, __webpack_require__(237)) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-path'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
	}(this, function (exports, d3Path) { 'use strict';

	function constant(x) {
	  return function constant() {
	    return x;
	  };
	}

	var abs = Math.abs;
	var atan2 = Math.atan2;
	var cos = Math.cos;
	var max = Math.max;
	var min = Math.min;
	var sin = Math.sin;
	var sqrt = Math.sqrt;

	var epsilon = 1e-12;
	var pi = Math.PI;
	var halfPi = pi / 2;
	var tau = 2 * pi;

	function acos(x) {
	  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
	}

	function asin(x) {
	  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
	}

	function arcInnerRadius(d) {
	  return d.innerRadius;
	}

	function arcOuterRadius(d) {
	  return d.outerRadius;
	}

	function arcStartAngle(d) {
	  return d.startAngle;
	}

	function arcEndAngle(d) {
	  return d.endAngle;
	}

	function arcPadAngle(d) {
	  return d && d.padAngle; // Note: optional!
	}

	function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
	  var x10 = x1 - x0, y10 = y1 - y0,
	      x32 = x3 - x2, y32 = y3 - y2,
	      t = y32 * x10 - x32 * y10;
	  if (t * t < epsilon) return;
	  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
	  return [x0 + t * x10, y0 + t * y10];
	}

	// Compute perpendicular offset line of length rc.
	// http://mathworld.wolfram.com/Circle-LineIntersection.html
	function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
	  var x01 = x0 - x1,
	      y01 = y0 - y1,
	      lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
	      ox = lo * y01,
	      oy = -lo * x01,
	      x11 = x0 + ox,
	      y11 = y0 + oy,
	      x10 = x1 + ox,
	      y10 = y1 + oy,
	      x00 = (x11 + x10) / 2,
	      y00 = (y11 + y10) / 2,
	      dx = x10 - x11,
	      dy = y10 - y11,
	      d2 = dx * dx + dy * dy,
	      r = r1 - rc,
	      D = x11 * y10 - x10 * y11,
	      d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
	      cx0 = (D * dy - dx * d) / d2,
	      cy0 = (-D * dx - dy * d) / d2,
	      cx1 = (D * dy + dx * d) / d2,
	      cy1 = (-D * dx + dy * d) / d2,
	      dx0 = cx0 - x00,
	      dy0 = cy0 - y00,
	      dx1 = cx1 - x00,
	      dy1 = cy1 - y00;

	  // Pick the closer of the two intersection points.
	  // TODO Is there a faster way to determine which intersection to use?
	  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

	  return {
	    cx: cx0,
	    cy: cy0,
	    x01: -ox,
	    y01: -oy,
	    x11: cx0 * (r1 / r - 1),
	    y11: cy0 * (r1 / r - 1)
	  };
	}

	function arc() {
	  var innerRadius = arcInnerRadius,
	      outerRadius = arcOuterRadius,
	      cornerRadius = constant(0),
	      padRadius = null,
	      startAngle = arcStartAngle,
	      endAngle = arcEndAngle,
	      padAngle = arcPadAngle,
	      context = null;

	  function arc() {
	    var buffer,
	        r,
	        r0 = +innerRadius.apply(this, arguments),
	        r1 = +outerRadius.apply(this, arguments),
	        a0 = startAngle.apply(this, arguments) - halfPi,
	        a1 = endAngle.apply(this, arguments) - halfPi,
	        da = abs(a1 - a0),
	        cw = a1 > a0;

	    if (!context) context = buffer = d3Path.path();

	    // Ensure that the outer radius is always larger than the inner radius.
	    if (r1 < r0) r = r1, r1 = r0, r0 = r;

	    // Is it a point?
	    if (!(r1 > epsilon)) context.moveTo(0, 0);

	    // Or is it a circle or annulus?
	    else if (da > tau - epsilon) {
	      context.moveTo(r1 * cos(a0), r1 * sin(a0));
	      context.arc(0, 0, r1, a0, a1, !cw);
	      if (r0 > epsilon) {
	        context.moveTo(r0 * cos(a1), r0 * sin(a1));
	        context.arc(0, 0, r0, a1, a0, cw);
	      }
	    }

	    // Or is it a circular or annular sector?
	    else {
	      var a01 = a0,
	          a11 = a1,
	          a00 = a0,
	          a10 = a1,
	          da0 = da,
	          da1 = da,
	          ap = padAngle.apply(this, arguments) / 2,
	          rp = (ap > epsilon) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
	          rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
	          rc0 = rc,
	          rc1 = rc,
	          t0,
	          t1;

	      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
	      if (rp > epsilon) {
	        var p0 = asin(rp / r0 * sin(ap)),
	            p1 = asin(rp / r1 * sin(ap));
	        if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
	        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
	        if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
	        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
	      }

	      var x01 = r1 * cos(a01),
	          y01 = r1 * sin(a01),
	          x10 = r0 * cos(a10),
	          y10 = r0 * sin(a10);

	      // Apply rounded corners?
	      if (rc > epsilon) {
	        var x11 = r1 * cos(a11),
	            y11 = r1 * sin(a11),
	            x00 = r0 * cos(a00),
	            y00 = r0 * sin(a00),
	            oc;

	        // Restrict the corner radius according to the sector angle.
	        if (da < pi && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
	          var ax = x01 - oc[0],
	              ay = y01 - oc[1],
	              bx = x11 - oc[0],
	              by = y11 - oc[1],
	              kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
	              lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
	          rc0 = min(rc, (r0 - lc) / (kc - 1));
	          rc1 = min(rc, (r1 - lc) / (kc + 1));
	        }
	      }

	      // Is the sector collapsed to a line?
	      if (!(da1 > epsilon)) context.moveTo(x01, y01);

	      // Does the sector’s outer ring have rounded corners?
	      else if (rc1 > epsilon) {
	        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
	        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

	        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

	        // Have the corners merged?
	        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

	        // Otherwise, draw the two corners and the ring.
	        else {
	          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
	          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
	          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
	        }
	      }

	      // Or is the outer ring just a circular arc?
	      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

	      // Is there no inner ring, and it’s a circular sector?
	      // Or perhaps it’s an annular sector collapsed due to padding?
	      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);

	      // Does the sector’s inner ring (or point) have rounded corners?
	      else if (rc0 > epsilon) {
	        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
	        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

	        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

	        // Have the corners merged?
	        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

	        // Otherwise, draw the two corners and the ring.
	        else {
	          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
	          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
	          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
	        }
	      }

	      // Or is the inner ring just a circular arc?
	      else context.arc(0, 0, r0, a10, a00, cw);
	    }

	    context.closePath();

	    if (buffer) return context = null, buffer + "" || null;
	  }

	  arc.centroid = function() {
	    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
	        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
	    return [cos(a) * r, sin(a) * r];
	  };

	  arc.innerRadius = function(_) {
	    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
	  };

	  arc.outerRadius = function(_) {
	    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
	  };

	  arc.cornerRadius = function(_) {
	    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
	  };

	  arc.padRadius = function(_) {
	    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
	  };

	  arc.startAngle = function(_) {
	    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
	  };

	  arc.endAngle = function(_) {
	    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
	  };

	  arc.padAngle = function(_) {
	    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
	  };

	  arc.context = function(_) {
	    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
	  };

	  return arc;
	}

	function Linear(context) {
	  this._context = context;
	}

	Linear.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: this._context.lineTo(x, y); break;
	    }
	  }
	};

	function curveLinear(context) {
	  return new Linear(context);
	}

	function x(p) {
	  return p[0];
	}

	function y(p) {
	  return p[1];
	}

	function line() {
	  var x$1 = x,
	      y$1 = y,
	      defined = constant(true),
	      context = null,
	      curve = curveLinear,
	      output = null;

	  function line(data) {
	    var i,
	        n = data.length,
	        d,
	        defined0 = false,
	        buffer;

	    if (context == null) output = curve(buffer = d3Path.path());

	    for (i = 0; i <= n; ++i) {
	      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
	        if (defined0 = !defined0) output.lineStart();
	        else output.lineEnd();
	      }
	      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
	    }

	    if (buffer) return output = null, buffer + "" || null;
	  }

	  line.x = function(_) {
	    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), line) : x$1;
	  };

	  line.y = function(_) {
	    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), line) : y$1;
	  };

	  line.defined = function(_) {
	    return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
	  };

	  line.curve = function(_) {
	    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
	  };

	  line.context = function(_) {
	    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
	  };

	  return line;
	}

	function area() {
	  var x0 = x,
	      x1 = null,
	      y0 = constant(0),
	      y1 = y,
	      defined = constant(true),
	      context = null,
	      curve = curveLinear,
	      output = null;

	  function area(data) {
	    var i,
	        j,
	        k,
	        n = data.length,
	        d,
	        defined0 = false,
	        buffer,
	        x0z = new Array(n),
	        y0z = new Array(n);

	    if (context == null) output = curve(buffer = d3Path.path());

	    for (i = 0; i <= n; ++i) {
	      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
	        if (defined0 = !defined0) {
	          j = i;
	          output.areaStart();
	          output.lineStart();
	        } else {
	          output.lineEnd();
	          output.lineStart();
	          for (k = i - 1; k >= j; --k) {
	            output.point(x0z[k], y0z[k]);
	          }
	          output.lineEnd();
	          output.areaEnd();
	        }
	      }
	      if (defined0) {
	        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
	        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
	      }
	    }

	    if (buffer) return output = null, buffer + "" || null;
	  }

	  function arealine() {
	    return line().defined(defined).curve(curve).context(context);
	  }

	  area.x = function(_) {
	    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), x1 = null, area) : x0;
	  };

	  area.x0 = function(_) {
	    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), area) : x0;
	  };

	  area.x1 = function(_) {
	    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : x1;
	  };

	  area.y = function(_) {
	    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), y1 = null, area) : y0;
	  };

	  area.y0 = function(_) {
	    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), area) : y0;
	  };

	  area.y1 = function(_) {
	    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : y1;
	  };

	  area.lineX0 =
	  area.lineY0 = function() {
	    return arealine().x(x0).y(y0);
	  };

	  area.lineY1 = function() {
	    return arealine().x(x0).y(y1);
	  };

	  area.lineX1 = function() {
	    return arealine().x(x1).y(y0);
	  };

	  area.defined = function(_) {
	    return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), area) : defined;
	  };

	  area.curve = function(_) {
	    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
	  };

	  area.context = function(_) {
	    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
	  };

	  return area;
	}

	function descending(a, b) {
	  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	}

	function identity(d) {
	  return d;
	}

	function pie() {
	  var value = identity,
	      sortValues = descending,
	      sort = null,
	      startAngle = constant(0),
	      endAngle = constant(tau),
	      padAngle = constant(0);

	  function pie(data) {
	    var i,
	        n = data.length,
	        j,
	        k,
	        sum = 0,
	        index = new Array(n),
	        arcs = new Array(n),
	        a0 = +startAngle.apply(this, arguments),
	        da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)),
	        a1,
	        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
	        pa = p * (da < 0 ? -1 : 1),
	        v;

	    for (i = 0; i < n; ++i) {
	      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
	        sum += v;
	      }
	    }

	    // Optionally sort the arcs by previously-computed values or by data.
	    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
	    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

	    // Compute the arcs! They are stored in the original data's order.
	    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
	      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
	        data: data[j],
	        index: i,
	        value: v,
	        startAngle: a0,
	        endAngle: a1,
	        padAngle: p
	      };
	    }

	    return arcs;
	  }

	  pie.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), pie) : value;
	  };

	  pie.sortValues = function(_) {
	    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
	  };

	  pie.sort = function(_) {
	    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
	  };

	  pie.startAngle = function(_) {
	    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), pie) : startAngle;
	  };

	  pie.endAngle = function(_) {
	    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), pie) : endAngle;
	  };

	  pie.padAngle = function(_) {
	    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), pie) : padAngle;
	  };

	  return pie;
	}

	var curveRadialLinear = curveRadial(curveLinear);

	function Radial(curve) {
	  this._curve = curve;
	}

	Radial.prototype = {
	  areaStart: function() {
	    this._curve.areaStart();
	  },
	  areaEnd: function() {
	    this._curve.areaEnd();
	  },
	  lineStart: function() {
	    this._curve.lineStart();
	  },
	  lineEnd: function() {
	    this._curve.lineEnd();
	  },
	  point: function(a, r) {
	    this._curve.point(r * Math.sin(a), r * -Math.cos(a));
	  }
	};

	function curveRadial(curve) {

	  function radial(context) {
	    return new Radial(curve(context));
	  }

	  radial._curve = curve;

	  return radial;
	}

	function lineRadial(l) {
	  var c = l.curve;

	  l.angle = l.x, delete l.x;
	  l.radius = l.y, delete l.y;

	  l.curve = function(_) {
	    return arguments.length ? c(curveRadial(_)) : c()._curve;
	  };

	  return l;
	}

	function lineRadial$1() {
	  return lineRadial(line().curve(curveRadialLinear));
	}

	function areaRadial() {
	  var a = area().curve(curveRadialLinear),
	      c = a.curve,
	      x0 = a.lineX0,
	      x1 = a.lineX1,
	      y0 = a.lineY0,
	      y1 = a.lineY1;

	  a.angle = a.x, delete a.x;
	  a.startAngle = a.x0, delete a.x0;
	  a.endAngle = a.x1, delete a.x1;
	  a.radius = a.y, delete a.y;
	  a.innerRadius = a.y0, delete a.y0;
	  a.outerRadius = a.y1, delete a.y1;
	  a.lineStartAngle = function() { return lineRadial(x0()); }, delete a.lineX0;
	  a.lineEndAngle = function() { return lineRadial(x1()); }, delete a.lineX1;
	  a.lineInnerRadius = function() { return lineRadial(y0()); }, delete a.lineY0;
	  a.lineOuterRadius = function() { return lineRadial(y1()); }, delete a.lineY1;

	  a.curve = function(_) {
	    return arguments.length ? c(curveRadial(_)) : c()._curve;
	  };

	  return a;
	}

	function pointRadial(x, y) {
	  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
	}

	var slice = Array.prototype.slice;

	function linkSource(d) {
	  return d.source;
	}

	function linkTarget(d) {
	  return d.target;
	}

	function link(curve) {
	  var source = linkSource,
	      target = linkTarget,
	      x$1 = x,
	      y$1 = y,
	      context = null;

	  function link() {
	    var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
	    if (!context) context = buffer = d3Path.path();
	    curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
	    if (buffer) return context = null, buffer + "" || null;
	  }

	  link.source = function(_) {
	    return arguments.length ? (source = _, link) : source;
	  };

	  link.target = function(_) {
	    return arguments.length ? (target = _, link) : target;
	  };

	  link.x = function(_) {
	    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), link) : x$1;
	  };

	  link.y = function(_) {
	    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), link) : y$1;
	  };

	  link.context = function(_) {
	    return arguments.length ? ((context = _ == null ? null : _), link) : context;
	  };

	  return link;
	}

	function curveHorizontal(context, x0, y0, x1, y1) {
	  context.moveTo(x0, y0);
	  context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
	}

	function curveVertical(context, x0, y0, x1, y1) {
	  context.moveTo(x0, y0);
	  context.bezierCurveTo(x0, y0 = (y0 + y1) / 2, x1, y0, x1, y1);
	}

	function curveRadial$1(context, x0, y0, x1, y1) {
	  var p0 = pointRadial(x0, y0),
	      p1 = pointRadial(x0, y0 = (y0 + y1) / 2),
	      p2 = pointRadial(x1, y0),
	      p3 = pointRadial(x1, y1);
	  context.moveTo(p0[0], p0[1]);
	  context.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
	}

	function linkHorizontal() {
	  return link(curveHorizontal);
	}

	function linkVertical() {
	  return link(curveVertical);
	}

	function linkRadial() {
	  var l = link(curveRadial$1);
	  l.angle = l.x, delete l.x;
	  l.radius = l.y, delete l.y;
	  return l;
	}

	var circle = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / pi);
	    context.moveTo(r, 0);
	    context.arc(0, 0, r, 0, tau);
	  }
	};

	var cross = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / 5) / 2;
	    context.moveTo(-3 * r, -r);
	    context.lineTo(-r, -r);
	    context.lineTo(-r, -3 * r);
	    context.lineTo(r, -3 * r);
	    context.lineTo(r, -r);
	    context.lineTo(3 * r, -r);
	    context.lineTo(3 * r, r);
	    context.lineTo(r, r);
	    context.lineTo(r, 3 * r);
	    context.lineTo(-r, 3 * r);
	    context.lineTo(-r, r);
	    context.lineTo(-3 * r, r);
	    context.closePath();
	  }
	};

	var tan30 = Math.sqrt(1 / 3),
	    tan30_2 = tan30 * 2;

	var diamond = {
	  draw: function(context, size) {
	    var y = Math.sqrt(size / tan30_2),
	        x = y * tan30;
	    context.moveTo(0, -y);
	    context.lineTo(x, 0);
	    context.lineTo(0, y);
	    context.lineTo(-x, 0);
	    context.closePath();
	  }
	};

	var ka = 0.89081309152928522810,
	    kr = Math.sin(pi / 10) / Math.sin(7 * pi / 10),
	    kx = Math.sin(tau / 10) * kr,
	    ky = -Math.cos(tau / 10) * kr;

	var star = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size * ka),
	        x = kx * r,
	        y = ky * r;
	    context.moveTo(0, -r);
	    context.lineTo(x, y);
	    for (var i = 1; i < 5; ++i) {
	      var a = tau * i / 5,
	          c = Math.cos(a),
	          s = Math.sin(a);
	      context.lineTo(s * r, -c * r);
	      context.lineTo(c * x - s * y, s * x + c * y);
	    }
	    context.closePath();
	  }
	};

	var square = {
	  draw: function(context, size) {
	    var w = Math.sqrt(size),
	        x = -w / 2;
	    context.rect(x, x, w, w);
	  }
	};

	var sqrt3 = Math.sqrt(3);

	var triangle = {
	  draw: function(context, size) {
	    var y = -Math.sqrt(size / (sqrt3 * 3));
	    context.moveTo(0, y * 2);
	    context.lineTo(-sqrt3 * y, -y);
	    context.lineTo(sqrt3 * y, -y);
	    context.closePath();
	  }
	};

	var c = -0.5,
	    s = Math.sqrt(3) / 2,
	    k = 1 / Math.sqrt(12),
	    a = (k / 2 + 1) * 3;

	var wye = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / a),
	        x0 = r / 2,
	        y0 = r * k,
	        x1 = x0,
	        y1 = r * k + r,
	        x2 = -x1,
	        y2 = y1;
	    context.moveTo(x0, y0);
	    context.lineTo(x1, y1);
	    context.lineTo(x2, y2);
	    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
	    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
	    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
	    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
	    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
	    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
	    context.closePath();
	  }
	};

	var symbols = [
	  circle,
	  cross,
	  diamond,
	  square,
	  star,
	  triangle,
	  wye
	];

	function symbol() {
	  var type = constant(circle),
	      size = constant(64),
	      context = null;

	  function symbol() {
	    var buffer;
	    if (!context) context = buffer = d3Path.path();
	    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
	    if (buffer) return context = null, buffer + "" || null;
	  }

	  symbol.type = function(_) {
	    return arguments.length ? (type = typeof _ === "function" ? _ : constant(_), symbol) : type;
	  };

	  symbol.size = function(_) {
	    return arguments.length ? (size = typeof _ === "function" ? _ : constant(+_), symbol) : size;
	  };

	  symbol.context = function(_) {
	    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
	  };

	  return symbol;
	}

	function noop() {}

	function point(that, x, y) {
	  that._context.bezierCurveTo(
	    (2 * that._x0 + that._x1) / 3,
	    (2 * that._y0 + that._y1) / 3,
	    (that._x0 + 2 * that._x1) / 3,
	    (that._y0 + 2 * that._y1) / 3,
	    (that._x0 + 4 * that._x1 + x) / 6,
	    (that._y0 + 4 * that._y1 + y) / 6
	  );
	}

	function Basis(context) {
	  this._context = context;
	}

	Basis.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 3: point(this, this._x1, this._y1); // proceed
	      case 2: this._context.lineTo(this._x1, this._y1); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // proceed
	      default: point(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	function basis(context) {
	  return new Basis(context);
	}

	function BasisClosed(context) {
	  this._context = context;
	}

	BasisClosed.prototype = {
	  areaStart: noop,
	  areaEnd: noop,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x2, this._y2);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
	        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x2, this._y2);
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
	      case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
	      case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
	      default: point(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	function basisClosed(context) {
	  return new BasisClosed(context);
	}

	function BasisOpen(context) {
	  this._context = context;
	}

	BasisOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; var x0 = (this._x0 + 4 * this._x1 + x) / 6, y0 = (this._y0 + 4 * this._y1 + y) / 6; this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0); break;
	      case 3: this._point = 4; // proceed
	      default: point(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	function basisOpen(context) {
	  return new BasisOpen(context);
	}

	function Bundle(context, beta) {
	  this._basis = new Basis(context);
	  this._beta = beta;
	}

	Bundle.prototype = {
	  lineStart: function() {
	    this._x = [];
	    this._y = [];
	    this._basis.lineStart();
	  },
	  lineEnd: function() {
	    var x = this._x,
	        y = this._y,
	        j = x.length - 1;

	    if (j > 0) {
	      var x0 = x[0],
	          y0 = y[0],
	          dx = x[j] - x0,
	          dy = y[j] - y0,
	          i = -1,
	          t;

	      while (++i <= j) {
	        t = i / j;
	        this._basis.point(
	          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
	          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy)
	        );
	      }
	    }

	    this._x = this._y = null;
	    this._basis.lineEnd();
	  },
	  point: function(x, y) {
	    this._x.push(+x);
	    this._y.push(+y);
	  }
	};

	var bundle = (function custom(beta) {

	  function bundle(context) {
	    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
	  }

	  bundle.beta = function(beta) {
	    return custom(+beta);
	  };

	  return bundle;
	})(0.85);

	function point$1(that, x, y) {
	  that._context.bezierCurveTo(
	    that._x1 + that._k * (that._x2 - that._x0),
	    that._y1 + that._k * (that._y2 - that._y0),
	    that._x2 + that._k * (that._x1 - x),
	    that._y2 + that._k * (that._y1 - y),
	    that._x2,
	    that._y2
	  );
	}

	function Cardinal(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	Cardinal.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x2, this._y2); break;
	      case 3: point$1(this, this._x1, this._y1); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
	      case 2: this._point = 3; // proceed
	      default: point$1(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinal = (function custom(tension) {

	  function cardinal(context) {
	    return new Cardinal(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	})(0);

	function CardinalClosed(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	CardinalClosed.prototype = {
	  areaStart: noop,
	  areaEnd: noop,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.lineTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        this.point(this._x5, this._y5);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
	      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
	      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
	      default: point$1(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinalClosed = (function custom(tension) {

	  function cardinal(context) {
	    return new CardinalClosed(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	})(0);

	function CardinalOpen(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	CardinalOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
	      case 3: this._point = 4; // proceed
	      default: point$1(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinalOpen = (function custom(tension) {

	  function cardinal(context) {
	    return new CardinalOpen(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	})(0);

	function point$2(that, x, y) {
	  var x1 = that._x1,
	      y1 = that._y1,
	      x2 = that._x2,
	      y2 = that._y2;

	  if (that._l01_a > epsilon) {
	    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
	        n = 3 * that._l01_a * (that._l01_a + that._l12_a);
	    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
	    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
	  }

	  if (that._l23_a > epsilon) {
	    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
	        m = 3 * that._l23_a * (that._l23_a + that._l12_a);
	    x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
	    y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
	  }

	  that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
	}

	function CatmullRom(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRom.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x2, this._y2); break;
	      case 3: this.point(this._x2, this._y2); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; // proceed
	      default: point$2(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRom = (function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	})(0.5);

	function CatmullRomClosed(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRomClosed.prototype = {
	  areaStart: noop,
	  areaEnd: noop,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.lineTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        this.point(this._x5, this._y5);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
	      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
	      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
	      default: point$2(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRomClosed = (function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	})(0.5);

	function CatmullRomOpen(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRomOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
	      case 3: this._point = 4; // proceed
	      default: point$2(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRomOpen = (function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	})(0.5);

	function LinearClosed(context) {
	  this._context = context;
	}

	LinearClosed.prototype = {
	  areaStart: noop,
	  areaEnd: noop,
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._point) this._context.closePath();
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    if (this._point) this._context.lineTo(x, y);
	    else this._point = 1, this._context.moveTo(x, y);
	  }
	};

	function linearClosed(context) {
	  return new LinearClosed(context);
	}

	function sign(x) {
	  return x < 0 ? -1 : 1;
	}

	// Calculate the slopes of the tangents (Hermite-type interpolation) based on
	// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
	// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
	// NOV(II), P. 443, 1990.
	function slope3(that, x2, y2) {
	  var h0 = that._x1 - that._x0,
	      h1 = x2 - that._x1,
	      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
	      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
	      p = (s0 * h1 + s1 * h0) / (h0 + h1);
	  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
	}

	// Calculate a one-sided slope.
	function slope2(that, t) {
	  var h = that._x1 - that._x0;
	  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
	}

	// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
	// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
	// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
	function point$3(that, t0, t1) {
	  var x0 = that._x0,
	      y0 = that._y0,
	      x1 = that._x1,
	      y1 = that._y1,
	      dx = (x1 - x0) / 3;
	  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
	}

	function MonotoneX(context) {
	  this._context = context;
	}

	MonotoneX.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 =
	    this._t0 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x1, this._y1); break;
	      case 3: point$3(this, this._t0, slope2(this, this._t0)); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    var t1 = NaN;

	    x = +x, y = +y;
	    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; point$3(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
	      default: point$3(this, this._t0, t1 = slope3(this, x, y)); break;
	    }

	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	    this._t0 = t1;
	  }
	};

	function MonotoneY(context) {
	  this._context = new ReflectContext(context);
	}

	(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
	  MonotoneX.prototype.point.call(this, y, x);
	};

	function ReflectContext(context) {
	  this._context = context;
	}

	ReflectContext.prototype = {
	  moveTo: function(x, y) { this._context.moveTo(y, x); },
	  closePath: function() { this._context.closePath(); },
	  lineTo: function(x, y) { this._context.lineTo(y, x); },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
	};

	function monotoneX(context) {
	  return new MonotoneX(context);
	}

	function monotoneY(context) {
	  return new MonotoneY(context);
	}

	function Natural(context) {
	  this._context = context;
	}

	Natural.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = [];
	    this._y = [];
	  },
	  lineEnd: function() {
	    var x = this._x,
	        y = this._y,
	        n = x.length;

	    if (n) {
	      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
	      if (n === 2) {
	        this._context.lineTo(x[1], y[1]);
	      } else {
	        var px = controlPoints(x),
	            py = controlPoints(y);
	        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
	          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
	        }
	      }
	    }

	    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	    this._x = this._y = null;
	  },
	  point: function(x, y) {
	    this._x.push(+x);
	    this._y.push(+y);
	  }
	};

	// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
	function controlPoints(x) {
	  var i,
	      n = x.length - 1,
	      m,
	      a = new Array(n),
	      b = new Array(n),
	      r = new Array(n);
	  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
	  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
	  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
	  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
	  a[n - 1] = r[n - 1] / b[n - 1];
	  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	  b[n - 1] = (x[n] + a[n - 1]) / 2;
	  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	  return [a, b];
	}

	function natural(context) {
	  return new Natural(context);
	}

	function Step(context, t) {
	  this._context = context;
	  this._t = t;
	}

	Step.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = this._y = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: {
	        if (this._t <= 0) {
	          this._context.lineTo(this._x, y);
	          this._context.lineTo(x, y);
	        } else {
	          var x1 = this._x * (1 - this._t) + x * this._t;
	          this._context.lineTo(x1, this._y);
	          this._context.lineTo(x1, y);
	        }
	        break;
	      }
	    }
	    this._x = x, this._y = y;
	  }
	};

	function step(context) {
	  return new Step(context, 0.5);
	}

	function stepBefore(context) {
	  return new Step(context, 0);
	}

	function stepAfter(context) {
	  return new Step(context, 1);
	}

	function none(series, order) {
	  if (!((n = series.length) > 1)) return;
	  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
	    s0 = s1, s1 = series[order[i]];
	    for (j = 0; j < m; ++j) {
	      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
	    }
	  }
	}

	function none$1(series) {
	  var n = series.length, o = new Array(n);
	  while (--n >= 0) o[n] = n;
	  return o;
	}

	function stackValue(d, key) {
	  return d[key];
	}

	function stack() {
	  var keys = constant([]),
	      order = none$1,
	      offset = none,
	      value = stackValue;

	  function stack(data) {
	    var kz = keys.apply(this, arguments),
	        i,
	        m = data.length,
	        n = kz.length,
	        sz = new Array(n),
	        oz;

	    for (i = 0; i < n; ++i) {
	      for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
	        si[j] = sij = [0, +value(data[j], ki, j, data)];
	        sij.data = data[j];
	      }
	      si.key = ki;
	    }

	    for (i = 0, oz = order(sz); i < n; ++i) {
	      sz[oz[i]].index = i;
	    }

	    offset(sz, oz);
	    return sz;
	  }

	  stack.keys = function(_) {
	    return arguments.length ? (keys = typeof _ === "function" ? _ : constant(slice.call(_)), stack) : keys;
	  };

	  stack.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), stack) : value;
	  };

	  stack.order = function(_) {
	    return arguments.length ? (order = _ == null ? none$1 : typeof _ === "function" ? _ : constant(slice.call(_)), stack) : order;
	  };

	  stack.offset = function(_) {
	    return arguments.length ? (offset = _ == null ? none : _, stack) : offset;
	  };

	  return stack;
	}

	function expand(series, order) {
	  if (!((n = series.length) > 0)) return;
	  for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
	    for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
	    if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
	  }
	  none(series, order);
	}

	function diverging(series, order) {
	  if (!((n = series.length) > 0)) return;
	  for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
	    for (yp = yn = 0, i = 0; i < n; ++i) {
	      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
	        d[0] = yp, d[1] = yp += dy;
	      } else if (dy < 0) {
	        d[1] = yn, d[0] = yn += dy;
	      } else {
	        d[0] = 0, d[1] = dy;
	      }
	    }
	  }
	}

	function silhouette(series, order) {
	  if (!((n = series.length) > 0)) return;
	  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
	    for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
	    s0[j][1] += s0[j][0] = -y / 2;
	  }
	  none(series, order);
	}

	function wiggle(series, order) {
	  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
	  for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
	    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
	      var si = series[order[i]],
	          sij0 = si[j][1] || 0,
	          sij1 = si[j - 1][1] || 0,
	          s3 = (sij0 - sij1) / 2;
	      for (var k = 0; k < i; ++k) {
	        var sk = series[order[k]],
	            skj0 = sk[j][1] || 0,
	            skj1 = sk[j - 1][1] || 0;
	        s3 += skj0 - skj1;
	      }
	      s1 += sij0, s2 += s3 * sij0;
	    }
	    s0[j - 1][1] += s0[j - 1][0] = y;
	    if (s1) y -= s2 / s1;
	  }
	  s0[j - 1][1] += s0[j - 1][0] = y;
	  none(series, order);
	}

	function appearance(series) {
	  var peaks = series.map(peak);
	  return none$1(series).sort(function(a, b) { return peaks[a] - peaks[b]; });
	}

	function peak(series) {
	  var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
	  while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
	  return j;
	}

	function ascending(series) {
	  var sums = series.map(sum);
	  return none$1(series).sort(function(a, b) { return sums[a] - sums[b]; });
	}

	function sum(series) {
	  var s = 0, i = -1, n = series.length, v;
	  while (++i < n) if (v = +series[i][1]) s += v;
	  return s;
	}

	function descending$1(series) {
	  return ascending(series).reverse();
	}

	function insideOut(series) {
	  var n = series.length,
	      i,
	      j,
	      sums = series.map(sum),
	      order = appearance(series),
	      top = 0,
	      bottom = 0,
	      tops = [],
	      bottoms = [];

	  for (i = 0; i < n; ++i) {
	    j = order[i];
	    if (top < bottom) {
	      top += sums[j];
	      tops.push(j);
	    } else {
	      bottom += sums[j];
	      bottoms.push(j);
	    }
	  }

	  return bottoms.reverse().concat(tops);
	}

	function reverse(series) {
	  return none$1(series).reverse();
	}

	exports.arc = arc;
	exports.area = area;
	exports.areaRadial = areaRadial;
	exports.curveBasis = basis;
	exports.curveBasisClosed = basisClosed;
	exports.curveBasisOpen = basisOpen;
	exports.curveBundle = bundle;
	exports.curveCardinal = cardinal;
	exports.curveCardinalClosed = cardinalClosed;
	exports.curveCardinalOpen = cardinalOpen;
	exports.curveCatmullRom = catmullRom;
	exports.curveCatmullRomClosed = catmullRomClosed;
	exports.curveCatmullRomOpen = catmullRomOpen;
	exports.curveLinear = curveLinear;
	exports.curveLinearClosed = linearClosed;
	exports.curveMonotoneX = monotoneX;
	exports.curveMonotoneY = monotoneY;
	exports.curveNatural = natural;
	exports.curveStep = step;
	exports.curveStepAfter = stepAfter;
	exports.curveStepBefore = stepBefore;
	exports.line = line;
	exports.lineRadial = lineRadial$1;
	exports.linkHorizontal = linkHorizontal;
	exports.linkRadial = linkRadial;
	exports.linkVertical = linkVertical;
	exports.pie = pie;
	exports.pointRadial = pointRadial;
	exports.radialArea = areaRadial;
	exports.radialLine = lineRadial$1;
	exports.stack = stack;
	exports.stackOffsetDiverging = diverging;
	exports.stackOffsetExpand = expand;
	exports.stackOffsetNone = none;
	exports.stackOffsetSilhouette = silhouette;
	exports.stackOffsetWiggle = wiggle;
	exports.stackOrderAppearance = appearance;
	exports.stackOrderAscending = ascending;
	exports.stackOrderDescending = descending$1;
	exports.stackOrderInsideOut = insideOut;
	exports.stackOrderNone = none$1;
	exports.stackOrderReverse = reverse;
	exports.symbol = symbol;
	exports.symbolCircle = circle;
	exports.symbolCross = cross;
	exports.symbolDiamond = diamond;
	exports.symbolSquare = square;
	exports.symbolStar = star;
	exports.symbolTriangle = triangle;
	exports.symbolWye = wye;
	exports.symbols = symbols;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-path/ v1.0.9 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	var pi = Math.PI,
	    tau = 2 * pi,
	    epsilon = 1e-6,
	    tauEpsilon = tau - epsilon;

	function Path() {
	  this._x0 = this._y0 = // start of current subpath
	  this._x1 = this._y1 = null; // end of current subpath
	  this._ = "";
	}

	function path() {
	  return new Path;
	}

	Path.prototype = path.prototype = {
	  constructor: Path,
	  moveTo: function(x, y) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
	  },
	  closePath: function() {
	    if (this._x1 !== null) {
	      this._x1 = this._x0, this._y1 = this._y0;
	      this._ += "Z";
	    }
	  },
	  lineTo: function(x, y) {
	    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  quadraticCurveTo: function(x1, y1, x, y) {
	    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
	    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  arcTo: function(x1, y1, x2, y2, r) {
	    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
	    var x0 = this._x1,
	        y0 = this._y1,
	        x21 = x2 - x1,
	        y21 = y2 - y1,
	        x01 = x0 - x1,
	        y01 = y0 - y1,
	        l01_2 = x01 * x01 + y01 * y01;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x1,y1).
	    if (this._x1 === null) {
	      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
	    else if (!(l01_2 > epsilon));

	    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
	    // Equivalently, is (x1,y1) coincident with (x2,y2)?
	    // Or, is the radius zero? Line to (x1,y1).
	    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
	      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Otherwise, draw an arc!
	    else {
	      var x20 = x2 - x0,
	          y20 = y2 - y0,
	          l21_2 = x21 * x21 + y21 * y21,
	          l20_2 = x20 * x20 + y20 * y20,
	          l21 = Math.sqrt(l21_2),
	          l01 = Math.sqrt(l01_2),
	          l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
	          t01 = l / l01,
	          t21 = l / l21;

	      // If the start tangent is not coincident with (x0,y0), line to.
	      if (Math.abs(t01 - 1) > epsilon) {
	        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
	      }

	      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
	    }
	  },
	  arc: function(x, y, r, a0, a1, ccw) {
	    x = +x, y = +y, r = +r, ccw = !!ccw;
	    var dx = r * Math.cos(a0),
	        dy = r * Math.sin(a0),
	        x0 = x + dx,
	        y0 = y + dy,
	        cw = 1 ^ ccw,
	        da = ccw ? a0 - a1 : a1 - a0;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x0,y0).
	    if (this._x1 === null) {
	      this._ += "M" + x0 + "," + y0;
	    }

	    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
	    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
	      this._ += "L" + x0 + "," + y0;
	    }

	    // Is this arc empty? We’re done.
	    if (!r) return;

	    // Does the angle go the wrong way? Flip the direction.
	    if (da < 0) da = da % tau + tau;

	    // Is this a complete circle? Draw two arcs to complete the circle.
	    if (da > tauEpsilon) {
	      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
	    }

	    // Is this arc non-empty? Draw an arc!
	    else if (da > epsilon) {
	      this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
	    }
	  },
	  rect: function(x, y, w, h) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
	  },
	  toString: function() {
	    return this._;
	  }
	};

	exports.path = path;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	var _d3Shape = __webpack_require__(236);

	var d3Shape = _interopRequireWildcard(_d3Shape);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Bar = function (_React$Component) {
	  _inherits(Bar, _React$Component);

	  function Bar() {
	    _classCallCheck(this, Bar);

	    return _possibleConstructorReturn(this, (Bar.__proto__ || Object.getPrototypeOf(Bar)).apply(this, arguments));
	  }

	  _createClass(Bar, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          path = _calculateAttributes.path;

	      this.style = style;
	      this.path = path;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          path = _calculateAttributes2.path;

	      var _props = this.props,
	          className = _props.className,
	          datum = _props.datum,
	          horizontal = _props.horizontal,
	          x = _props.x,
	          y = _props.y,
	          y0 = _props.y0;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [x, nextProps.x], [y, nextProps.y], [y0, nextProps.y0], [horizontal, nextProps.horizontal], [path, this.path], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        this.path = path;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var datum = props.datum,
	          active = props.active,
	          polar = props.polar;

	      var stroke = props.style && props.style.fill || "black";
	      var baseStyle = { fill: "black", stroke: stroke };
	      var style = _helpers2.default.evaluateStyle((0, _assign3.default)(baseStyle, props.style), datum, active);
	      var width = this.getBarWidth(props, style);
	      var path = polar ? this.getPolarBarPath(props, width) : this.getBarPath(props, width);
	      return { style: style, path: path };
	    }
	  }, {
	    key: "getPosition",
	    value: function getPosition(props, width) {
	      var size = width / 2;
	      var x = props.x,
	          y = props.y,
	          y0 = props.y0;

	      return {
	        y0: Math.round(y0),
	        y1: Math.round(y),
	        x0: Math.round(x - size),
	        x1: Math.round(x + size)
	      };
	    }
	  }, {
	    key: "getVerticalBarPath",
	    value: function getVerticalBarPath(props, width) {
	      var _getPosition = this.getPosition(props, width),
	          x0 = _getPosition.x0,
	          x1 = _getPosition.x1,
	          y0 = _getPosition.y0,
	          y1 = _getPosition.y1;

	      return "M " + x0 + ", " + y0 + "\n      L " + x0 + ", " + y1 + "\n      L " + x1 + ", " + y1 + "\n      L " + x1 + ", " + y0 + "\n      L " + x0 + ", " + y0 + "\n      z";
	    }
	  }, {
	    key: "getHorizontalBarPath",
	    value: function getHorizontalBarPath(props, width) {
	      var _getPosition2 = this.getPosition(props, width),
	          x0 = _getPosition2.x0,
	          x1 = _getPosition2.x1,
	          y0 = _getPosition2.y0,
	          y1 = _getPosition2.y1;

	      return "M " + y0 + ", " + x0 + "\n      L " + y0 + ", " + x1 + "\n      L " + y1 + ", " + x1 + "\n      L " + y1 + ", " + x0 + "\n      L " + y0 + ", " + x0 + "\n      z";
	    }
	  }, {
	    key: "transformAngle",
	    value: function transformAngle(angle) {
	      return -1 * angle + Math.PI / 2;
	    }
	  }, {
	    key: "getAngularWidth",
	    value: function getAngularWidth(props, width) {
	      var scale = props.scale;

	      var range = scale.y.range();
	      var r = Math.max.apply(Math, _toConsumableArray(range));
	      var angularRange = Math.abs(scale.x.range()[1] - scale.x.range()[0]);
	      return width / (2 * Math.PI * r) * angularRange;
	    }
	  }, {
	    key: "getAngle",
	    value: function getAngle(props, index) {
	      var data = props.data,
	          scale = props.scale;

	      var x = data[index]._x1 === undefined ? "_x" : "_x1";
	      return scale.x(data[index][x]);
	    }
	  }, {
	    key: "getStartAngle",
	    value: function getStartAngle(props, index) {
	      var data = props.data,
	          scale = props.scale;

	      var currentAngle = this.getAngle(props, index);
	      var angularRange = Math.abs(scale.x.range()[1] - scale.x.range()[0]);
	      var previousAngle = index === 0 ? this.getAngle(props, data.length - 1) - Math.PI * 2 : this.getAngle(props, index - 1);
	      return index === 0 && angularRange < 2 * Math.PI ? scale.x.range()[0] : (currentAngle + previousAngle) / 2;
	    }
	  }, {
	    key: "getEndAngle",
	    value: function getEndAngle(props, index) {
	      var data = props.data,
	          scale = props.scale;

	      var currentAngle = this.getAngle(props, index);
	      var angularRange = Math.abs(scale.x.range()[1] - scale.x.range()[0]);
	      var lastAngle = scale.x.range()[1] === 2 * Math.PI ? this.getAngle(props, 0) + Math.PI * 2 : scale.x.range()[1];
	      var nextAngle = index === data.length - 1 ? this.getAngle(props, 0) + Math.PI * 2 : this.getAngle(props, index + 1);
	      return index === data.length - 1 && angularRange < 2 * Math.PI ? lastAngle : (currentAngle + nextAngle) / 2;
	    }
	  }, {
	    key: "getVerticalPolarBarPath",
	    value: function getVerticalPolarBarPath(props) {
	      var datum = props.datum,
	          scale = props.scale,
	          style = props.style,
	          index = props.index;

	      var r1 = scale.y(datum._y0 || 0);
	      var r2 = scale.y(datum._y1 !== undefined ? datum._y1 : datum._y);
	      var currentAngle = scale.x(datum._x1 !== undefined ? datum._x1 : datum._x);
	      var start = void 0;
	      var end = void 0;
	      if (style.width) {
	        var width = this.getAngularWidth(props, style.width);
	        start = currentAngle - width / 2;
	        end = currentAngle + width / 2;
	      } else {
	        start = this.getStartAngle(props, index);
	        end = this.getEndAngle(props, index);
	      }
	      var path = d3Shape.arc().innerRadius(r1).outerRadius(r2).startAngle(this.transformAngle(start)).endAngle(this.transformAngle(end));
	      return path();
	    }
	  }, {
	    key: "getBarPath",
	    value: function getBarPath(props, width) {
	      return this.props.horizontal ? this.getHorizontalBarPath(props, width) : this.getVerticalBarPath(props, width);
	    }
	  }, {
	    key: "getPolarBarPath",
	    value: function getPolarBarPath(props) {
	      // TODO Radial bars
	      return this.getVerticalPolarBarPath(props);
	    }
	  }, {
	    key: "getBarWidth",
	    value: function getBarWidth(props, style) {
	      if (style.width) {
	        return style.width;
	      }
	      var scale = props.scale,
	          data = props.data,
	          horizontal = props.horizontal;

	      var range = horizontal ? scale.y.range() : scale.x.range();
	      var extent = Math.abs(range[1] - range[0]);
	      var bars = data.length + 2;
	      var barRatio = 0.5;
	      // eslint-disable-next-line no-magic-numbers
	      var defaultWidth = data.length < 2 ? 8 : barRatio * extent / bars;
	      return Math.max(1, Math.round(defaultWidth));
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderBar",
	    value: function renderBar(path, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className,
	          origin = _props2.origin,
	          polar = _props2.polar;

	      var transform = polar && origin ? "translate(" + origin.x + ", " + origin.y + ")" : undefined;
	      return _react2.default.createElement("path", _extends({
	        d: path,
	        transform: transform,
	        className: className,
	        style: style,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto"
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.renderBar(this.path, this.style, this.props.events);
	    }
	  }]);

	  return Bar;
	}(_react2.default.Component);

	Bar.propTypes = _extends({}, _commonProps2.default, {
	  datum: _propTypes2.default.object,
	  horizontal: _propTypes2.default.bool,
	  padding: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.object]),
	  width: _propTypes2.default.number,
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number,
	  y0: _propTypes2.default.number
	});
	exports.default = Bar;

/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [0.5, 2] }]*/


	var Candle = function (_React$Component) {
	  _inherits(Candle, _React$Component);

	  function Candle() {
	    _classCallCheck(this, Candle);

	    return _possibleConstructorReturn(this, (Candle.__proto__ || Object.getPrototypeOf(Candle)).apply(this, arguments));
	  }

	  _createClass(Candle, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          candleWidth = _calculateAttributes.candleWidth;

	      this.style = style;
	      this.candleWidth = candleWidth;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _props = this.props,
	          className = _props.className,
	          candleHeight = _props.candleHeight,
	          datum = _props.datum,
	          x = _props.x,
	          y = _props.y,
	          y1 = _props.y1,
	          y2 = _props.y2;

	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          candleWidth = _calculateAttributes2.candleWidth;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [candleHeight, nextProps.candleHeight], [x, nextProps.x], [y, nextProps.y], [y1, nextProps.y1], [y2, nextProps.y2], [candleWidth, this.candleWidth], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        this.candleWidth = candleWidth;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var data = props.data,
	          datum = props.datum,
	          active = props.active,
	          width = props.width;

	      var style = _helpers2.default.evaluateStyle((0, _assign3.default)({ stroke: "black" }, props.style), datum, active);
	      var padding = props.padding.left || props.padding;
	      var candleWidth = style.width || 0.5 * (width - 2 * padding) / data.length;
	      return { style: style, candleWidth: candleWidth };
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderWick",
	    value: function renderWick(wickProps) {
	      return _react2.default.createElement("line", wickProps);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderCandle",
	    value: function renderCandle(candleProps) {
	      return _react2.default.createElement("rect", candleProps);
	    }
	  }, {
	    key: "getCandleProps",
	    value: function getCandleProps(props) {
	      var candleHeight = props.candleHeight,
	          x = props.x,
	          y = props.y,
	          events = props.events,
	          role = props.role,
	          className = props.className;

	      var shapeRendering = props.shapeRendering || "auto";
	      var candleX = x - this.candleWidth / 2;
	      return (0, _assign3.default)({
	        x: candleX, y: y, style: this.style, role: role, width: this.candleWidth, height: candleHeight,
	        shapeRendering: shapeRendering, className: className
	      }, events);
	    }
	  }, {
	    key: "getWickProps",
	    value: function getWickProps(props) {
	      var x = props.x,
	          y1 = props.y1,
	          y2 = props.y2,
	          events = props.events,
	          className = props.className;

	      var shapeRendering = props.shapeRendering || "auto";
	      var role = props.role || "presentation";
	      return (0, _assign3.default)({ x1: x, x2: x, y1: y1, y2: y2, style: this.style, role: role, shapeRendering: shapeRendering, className: className }, events);
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var candleProps = this.getCandleProps(this.props);
	      var wickProps = this.getWickProps(this.props);
	      return _react2.default.cloneElement(this.props.groupComponent, {}, this.renderWick(wickProps), this.renderCandle(candleProps));
	    }
	  }]);

	  return Candle;
	}(_react2.default.Component);

	Candle.propTypes = _extends({}, _commonProps2.default, {
	  candleHeight: _propTypes2.default.number,
	  datum: _propTypes2.default.object,
	  groupComponent: _propTypes2.default.element,
	  padding: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.object]),
	  width: _propTypes2.default.number,
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number,
	  y1: _propTypes2.default.number,
	  y2: _propTypes2.default.number
	});
	Candle.defaultProps = {
	  groupComponent: _react2.default.createElement("g", null)
	};
	exports.default = Candle;

/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _helpers3 = __webpack_require__(235);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _d3Shape = __webpack_require__(236);

	var d3Shape = _interopRequireWildcard(_d3Shape);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2] }]*/


	var Curve = function (_React$Component) {
	  _inherits(Curve, _React$Component);

	  function Curve() {
	    _classCallCheck(this, Curve);

	    return _possibleConstructorReturn(this, (Curve.__proto__ || Object.getPrototypeOf(Curve)).apply(this, arguments));
	  }

	  _createClass(Curve, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          path = _calculateAttributes.path;

	      this.style = style;
	      this.path = path;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          path = _calculateAttributes2.path;

	      var _props = this.props,
	          className = _props.className,
	          interpolation = _props.interpolation;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [interpolation, nextProps.interpolation], [path, this.path], [style, this.style]])) {
	        this.style = style;
	        this.path = path;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "getLineFunction",
	    value: function getLineFunction(props) {
	      var polar = props.polar,
	          scale = props.scale,
	          openCurve = props.openCurve;

	      var interpolation = polar && !openCurve ? this.toNewName(props.interpolation) + "Closed" : this.toNewName(props.interpolation);
	      return polar ? d3Shape.lineRadial().defined(_helpers3.defined).curve(d3Shape[interpolation]).angle((0, _helpers3.getAngleAccessor)(scale)).radius((0, _helpers3.getYAccessor)(scale)) : d3Shape.line().defined(_helpers3.defined).curve(d3Shape[interpolation]).x((0, _helpers3.getXAccessor)(scale)).y((0, _helpers3.getYAccessor)(scale));
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = props.style,
	          data = props.data,
	          active = props.active;

	      var lineFunction = this.getLineFunction(props);
	      return {
	        style: _helpers2.default.evaluateStyle((0, _assign3.default)({ fill: "none", stroke: "black" }, style), data, active),
	        path: lineFunction(data)
	      };
	    }
	  }, {
	    key: "toNewName",
	    value: function toNewName(interpolation) {
	      // d3 shape changed the naming scheme for interpolators from "basis" -> "curveBasis" etc.
	      var capitalize = function (s) {
	        return s && s[0].toUpperCase() + s.slice(1);
	      };
	      return "curve" + capitalize(interpolation);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderLine",
	    value: function renderLine(path, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className,
	          polar = _props2.polar,
	          origin = _props2.origin;

	      var transform = polar && origin ? "translate(" + origin.x + ", " + origin.y + ")" : undefined;
	      return _react2.default.createElement("path", _extends({
	        style: style,
	        shapeRendering: shapeRendering || "auto",
	        role: role || "presentation",
	        d: path,
	        transform: transform,
	        className: className
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var events = this.props.events;

	      return this.renderLine(this.path, this.style, events);
	    }
	  }]);

	  return Curve;
	}(_react2.default.Component);

	Curve.propTypes = _extends({}, _commonProps2.default, {
	  interpolation: _propTypes2.default.string,
	  openCurve: _propTypes2.default.bool,
	  origin: _propTypes2.default.object,
	  polar: _propTypes2.default.bool
	});
	exports.default = Curve;

/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable max-statements */


	var ErrorBar = function (_React$Component) {
	  _inherits(ErrorBar, _React$Component);

	  function ErrorBar(props) {
	    _classCallCheck(this, ErrorBar);

	    return _possibleConstructorReturn(this, (ErrorBar.__proto__ || Object.getPrototypeOf(ErrorBar)).call(this, props));
	  }

	  _createClass(ErrorBar, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      this.style = this.getStyle(this.props);
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _props = this.props,
	          borderWidth = _props.borderWidth,
	          className = _props.className,
	          datum = _props.datum,
	          x = _props.x,
	          y = _props.y,
	          errorX = _props.errorX,
	          errorY = _props.errorY;

	      var nextStyle = this.getStyle(nextProps);

	      if (!_collection2.default.allSetsEqual([[borderWidth, nextProps.borderWidth], [className, nextProps.className], [x, nextProps.x], [y, nextProps.y], [errorX, nextProps.errorX], [errorY, nextProps.errorY], [this.style, nextStyle], [datum, nextProps.datum]])) {
	        this.style = nextStyle;
	        return true;
	      }

	      return false;
	    }
	  }, {
	    key: "getStyle",
	    value: function getStyle(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active;

	      return _helpers2.default.evaluateStyle((0, _assign3.default)({ stroke: "black" }, style), datum, active);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderLine",
	    value: function renderLine(props, style, events) {
	      return _react2.default.createElement("line", _extends({}, props, { style: style }, events));
	    }
	  }, {
	    key: "renderBorder",
	    value: function renderBorder(props, error, type) {
	      var x = props.x,
	          y = props.y,
	          borderWidth = props.borderWidth,
	          events = props.events,
	          style = props.style,
	          role = props.role,
	          shapeRendering = props.shapeRendering,
	          className = props.className;

	      var vertical = type === "Right" || type === "Left";
	      var errorPortion = error["error" + type];
	      var borderProps = {
	        role: role, shapeRendering: shapeRendering, className: className,
	        key: "border" + type,
	        x1: vertical ? errorPortion : x - borderWidth,
	        x2: vertical ? errorPortion : x + borderWidth,
	        y1: vertical ? y - borderWidth : errorPortion,
	        y2: vertical ? y + borderWidth : errorPortion
	      };
	      return this.renderLine(borderProps, style, events);
	    }
	  }, {
	    key: "renderCross",
	    value: function renderCross(props, error, type) {
	      var x = props.x,
	          y = props.y,
	          events = props.events,
	          style = props.style,
	          role = props.role,
	          shapeRendering = props.shapeRendering,
	          className = props.className;

	      var vertical = type === "Top" || type === "Bottom";
	      var errorPortion = error["error" + type];
	      var borderProps = {
	        role: role, shapeRendering: shapeRendering, className: className,
	        key: "cross" + type,
	        x1: x,
	        x2: vertical ? x : errorPortion,
	        y1: y,
	        y2: vertical ? errorPortion : y
	      };
	      return this.renderLine(borderProps, style, events);
	    }
	  }, {
	    key: "renderErrorBar",
	    value: function renderErrorBar(error, props) {
	      var groupComponent = props.groupComponent;

	      return _react2.default.cloneElement(groupComponent, {}, error.errorRight ? this.renderBorder(props, error, "Right") : null, error.errorLeft ? this.renderBorder(props, error, "Left") : null, error.errorBottom ? this.renderBorder(props, error, "Bottom") : null, error.errorTop ? this.renderBorder(props, error, "Top") : null, error.errorRight ? this.renderCross(props, error, "Right") : null, error.errorLeft ? this.renderCross(props, error, "Left") : null, error.errorBottom ? this.renderCross(props, error, "Bottom") : null, error.errorTop ? this.renderCross(props, error, "Top") : null);
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _props2 = this.props,
	          x = _props2.x,
	          y = _props2.y,
	          borderWidth = _props2.borderWidth,
	          groupComponent = _props2.groupComponent,
	          events = _props2.events,
	          errorX = _props2.errorX,
	          errorY = _props2.errorY,
	          scale = _props2.scale,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className;

	      var rangeX = void 0;
	      var rangeY = void 0;
	      var positiveErrorX = void 0;
	      var negativeErrorX = void 0;
	      var positiveErrorY = void 0;
	      var negativeErrorY = void 0;
	      var errorTop = void 0;
	      var errorBottom = void 0;
	      var errorRight = void 0;
	      var errorLeft = void 0;

	      if (errorX) {
	        rangeX = scale.x.range();
	        positiveErrorX = errorX[0];
	        negativeErrorX = errorX[1];
	        errorRight = positiveErrorX >= rangeX[1] ? rangeX[1] : positiveErrorX;
	        errorLeft = negativeErrorX <= rangeX[0] ? rangeX[0] : negativeErrorX;
	      }

	      if (errorY) {
	        rangeY = scale.y.range();
	        positiveErrorY = errorY[1];
	        negativeErrorY = errorY[0];
	        errorTop = positiveErrorY >= rangeY[0] ? rangeY[0] : positiveErrorY;
	        errorBottom = negativeErrorY <= rangeY[1] ? rangeY[1] : negativeErrorY;
	      }
	      var props = {
	        x: x, y: y, borderWidth: borderWidth, groupComponent: groupComponent, events: events, className: className,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto",
	        style: this.style
	      };
	      return _react2.default.cloneElement(this.props.groupComponent, {}, this.renderErrorBar({ errorTop: errorTop, errorBottom: errorBottom, errorRight: errorRight, errorLeft: errorLeft }, props));
	    }
	  }]);

	  return ErrorBar;
	}(_react2.default.Component);

	ErrorBar.propTypes = _extends({}, _commonProps2.default, {
	  borderWidth: _propTypes2.default.number,
	  datum: _propTypes2.default.object,
	  errorX: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.array, _propTypes2.default.bool]),
	  errorY: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.array, _propTypes2.default.bool]),
	  groupComponent: _propTypes2.default.element,
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	});
	ErrorBar.defaultProps = {
	  borderWidth: 10,
	  groupComponent: _react2.default.createElement("g", null)
	};
	exports.default = ErrorBar;

/***/ }),
/* 242 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Line = function (_React$Component) {
	  _inherits(Line, _React$Component);

	  function Line() {
	    _classCallCheck(this, Line);

	    return _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).apply(this, arguments));
	  }

	  _createClass(Line, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      this.style = this.getStyle(this.props);
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _props = this.props,
	          className = _props.className,
	          datum = _props.datum,
	          x1 = _props.x1,
	          x2 = _props.x2,
	          y1 = _props.y1,
	          y2 = _props.y2;

	      var style = this.getStyle(nextProps);
	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [x1, nextProps.x1], [x2, nextProps.x2], [y1, nextProps.y1], [y2, nextProps.y2], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "getStyle",
	    value: function getStyle(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active;

	      return _helpers2.default.evaluateStyle((0, _assign3.default)({ stroke: "black" }, style), datum, active);
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderAxisLine",
	    value: function renderAxisLine(props, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className;

	      return _react2.default.createElement("line", _extends({}, props, {
	        className: className,
	        style: style,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto",
	        vectorEffect: "non-scaling-stroke"
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _props3 = this.props,
	          x1 = _props3.x1,
	          x2 = _props3.x2,
	          y1 = _props3.y1,
	          y2 = _props3.y2,
	          events = _props3.events;

	      return this.renderAxisLine({ x1: x1, x2: x2, y1: y1, y2: y2 }, this.style, events);
	    }
	  }]);

	  return Line;
	}(_react2.default.Component);

	Line.propTypes = _extends({}, _commonProps2.default, {
	  datum: _propTypes2.default.any,
	  x1: _propTypes2.default.number,
	  x2: _propTypes2.default.number,
	  y1: _propTypes2.default.number,
	  y2: _propTypes2.default.number
	});
	exports.default = Line;

/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Slice = function (_React$Component) {
	  _inherits(Slice, _React$Component);

	  function Slice() {
	    _classCallCheck(this, Slice);

	    return _possibleConstructorReturn(this, (Slice.__proto__ || Object.getPrototypeOf(Slice)).apply(this, arguments));
	  }

	  _createClass(Slice, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          path = _calculateAttributes.path;

	      this.style = style;
	      this.path = path;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          path = _calculateAttributes2.path;

	      var _props = this.props,
	          className = _props.className,
	          datum = _props.datum,
	          slice = _props.slice;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [path, this.path], [style, this.style], [datum, nextProps.datum], [slice, nextProps.slice]])) {
	        this.style = style;
	        this.path = path;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active,
	          pathFunction = props.pathFunction,
	          slice = props.slice;

	      return {
	        style: _helpers2.default.evaluateStyle(style, datum, active),
	        path: pathFunction(slice)
	      };
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderSlice",
	    value: function renderSlice(path, style, events) {
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className,
	          origin = _props2.origin;

	      var transform = origin ? "translate(" + origin.x + ", " + origin.y + ")" : undefined;
	      return _react2.default.createElement("path", _extends({
	        d: path,
	        className: className,
	        role: role || "presentation",
	        style: style,
	        transform: transform,
	        shapeRendering: shapeRendering || "auto"
	      }, events));
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return this.renderSlice(this.path, this.style, this.props.events);
	    }
	  }]);

	  return Slice;
	}(_react2.default.Component);

	Slice.propTypes = _extends({}, _commonProps2.default, {
	  datum: _propTypes2.default.object,
	  pathFunction: _propTypes2.default.func,
	  slice: _propTypes2.default.object
	});
	exports.default = Slice;

/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(49);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _commonProps = __webpack_require__(230);

	var _commonProps2 = _interopRequireDefault(_commonProps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*eslint no-magic-numbers: ["error", { "ignore": [2] }]*/


	var Voronoi = function (_React$Component) {
	  _inherits(Voronoi, _React$Component);

	  function Voronoi() {
	    _classCallCheck(this, Voronoi);

	    return _possibleConstructorReturn(this, (Voronoi.__proto__ || Object.getPrototypeOf(Voronoi)).apply(this, arguments));
	  }

	  _createClass(Voronoi, [{
	    key: "componentWillMount",
	    value: function componentWillMount() {
	      var _calculateAttributes = this.calculateAttributes(this.props),
	          style = _calculateAttributes.style,
	          circle = _calculateAttributes.circle,
	          voronoi = _calculateAttributes.voronoi;

	      this.style = style;
	      this.circle = circle;
	      this.voronoi = voronoi;
	    }
	  }, {
	    key: "shouldComponentUpdate",
	    value: function shouldComponentUpdate(nextProps) {
	      var _calculateAttributes2 = this.calculateAttributes(nextProps),
	          style = _calculateAttributes2.style,
	          circle = _calculateAttributes2.circle,
	          voronoi = _calculateAttributes2.voronoi;

	      var _props = this.props,
	          className = _props.className,
	          x = _props.x,
	          y = _props.y,
	          datum = _props.datum;

	      if (!_collection2.default.allSetsEqual([[className, nextProps.className], [x, nextProps.x], [y, nextProps.y], [circle, this.circle], [voronoi, this.voronoi], [style, this.style], [datum, nextProps.datum]])) {
	        this.style = style;
	        this.circle = circle;
	        this.voronoi = voronoi;
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "calculateAttributes",
	    value: function calculateAttributes(props) {
	      var style = props.style,
	          datum = props.datum,
	          active = props.active;

	      return {
	        style: _helpers2.default.evaluateStyle(style, datum, active),
	        circle: this.getCirclePath(props),
	        voronoi: this.getVoronoiPath(props)
	      };
	    }
	  }, {
	    key: "getVoronoiPath",
	    value: function getVoronoiPath(props) {
	      var polygon = props.polygon;

	      return Array.isArray(polygon) && polygon.length ? "M " + props.polygon.join("L") + " Z" : "";
	    }
	  }, {
	    key: "getCirclePath",
	    value: function getCirclePath(props) {
	      if (!props.size) {
	        return null;
	      }
	      var x = props.x,
	          y = props.y,
	          datum = props.datum,
	          active = props.active;

	      var size = _helpers2.default.evaluateProp(props.size, datum, active);
	      return "M " + x + ", " + y + " m " + -size + ", 0\n      a " + size + ", " + size + " 0 1,0 " + size * 2 + ",0\n      a " + size + ", " + size + " 0 1,0 " + -size * 2 + ",0";
	    }

	    // Overridden in victory-core-native

	  }, {
	    key: "renderPoint",
	    value: function renderPoint(paths, style, events) {
	      var clipId = paths.circle && "clipPath-" + Math.random();
	      var clipPath = paths.circle ? "url(#" + clipId + ")" : undefined;
	      var _props2 = this.props,
	          role = _props2.role,
	          shapeRendering = _props2.shapeRendering,
	          className = _props2.className;

	      var voronoiPath = _react2.default.createElement("path", _extends({
	        d: paths.circle || paths.voronoi,
	        className: className,
	        clipPath: clipPath,
	        style: style,
	        role: role || "presentation",
	        shapeRendering: shapeRendering || "auto"
	      }, events));
	      return paths.circle ? _react2.default.createElement(
	        "g",
	        null,
	        _react2.default.createElement(
	          "defs",
	          null,
	          _react2.default.createElement(
	            "clipPath",
	            { id: clipId },
	            _react2.default.createElement("path", { d: paths.voronoi, className: className })
	          )
	        ),
	        voronoiPath
	      ) : voronoiPath;
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var paths = {
	        circle: this.circle,
	        voronoi: this.voronoi
	      };
	      return this.renderPoint(paths, this.style, this.props.events);
	    }
	  }]);

	  return Voronoi;
	}(_react2.default.Component);

	Voronoi.propTypes = _extends({}, _commonProps2.default, {
	  datum: _propTypes2.default.object,
	  polygon: _propTypes2.default.array,
	  size: _propTypes2.default.number,
	  x: _propTypes2.default.number,
	  y: _propTypes2.default.number
	});
	exports.default = Voronoi;

/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _without2 = __webpack_require__(204);

	var _without3 = _interopRequireDefault(_without2);

	var _pick2 = __webpack_require__(196);

	var _pick3 = _interopRequireDefault(_pick2);

	var _partialRight2 = __webpack_require__(2);

	var _partialRight3 = _interopRequireDefault(_partialRight2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _defaults2 = __webpack_require__(69);

	var _defaults3 = _interopRequireDefault(_defaults2);

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _events = __webpack_require__(203);

	var _events2 = _interopRequireDefault(_events);

	var _victoryTransition = __webpack_require__(195);

	var _victoryTransition2 = _interopRequireDefault(_victoryTransition);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	exports.default = function (WrappedComponent) {
	  return function (_WrappedComponent) {
	    _inherits(addEvents, _WrappedComponent);

	    function addEvents() {
	      _classCallCheck(this, addEvents);

	      return _possibleConstructorReturn(this, (addEvents.__proto__ || Object.getPrototypeOf(addEvents)).apply(this, arguments));
	    }

	    _createClass(addEvents, [{
	      key: "componentWillMount",
	      value: function componentWillMount() {
	        if ((0, _isFunction3.default)(_get(addEvents.prototype.__proto__ || Object.getPrototypeOf(addEvents.prototype), "componentWillMount", this))) {
	          _get(addEvents.prototype.__proto__ || Object.getPrototypeOf(addEvents.prototype), "componentWillMount", this).call(this);
	        }
	        this.state = this.state || {};
	        var getScopedEvents = _events2.default.getScopedEvents.bind(this);
	        this.getEvents = (0, _partialRight3.default)(_events2.default.getEvents.bind(this), getScopedEvents);
	        this.getEventState = _events2.default.getEventState.bind(this);
	        this.setupEvents(this.props);
	      }
	    }, {
	      key: "componentWillUpdate",
	      value: function componentWillUpdate(newProps) {
	        if ((0, _isFunction3.default)(_get(addEvents.prototype.__proto__ || Object.getPrototypeOf(addEvents.prototype), "componentWillReceiveProps", this))) {
	          _get(addEvents.prototype.__proto__ || Object.getPrototypeOf(addEvents.prototype), "componentWillReceiveProps", this).call(this);
	        }
	        this.setupEvents(newProps);
	      }
	    }, {
	      key: "setupEvents",
	      value: function setupEvents(props) {
	        var sharedEvents = props.sharedEvents;

	        var components = WrappedComponent.expectedComponents;
	        this.componentEvents = _events2.default.getComponentEvents(props, components);
	        this.getSharedEventState = sharedEvents && (0, _isFunction3.default)(sharedEvents.getEventState) ? sharedEvents.getEventState : function () {
	          return undefined;
	        };
	        this.baseProps = this.getBaseProps(props);
	        this.dataKeys = Object.keys(this.baseProps).filter(function (key) {
	          return key !== "parent";
	        });
	        this.hasEvents = props.events || props.sharedEvents || this.componentEvents;
	        this.events = this.getAllEvents(props);
	      }
	    }, {
	      key: "getBaseProps",
	      value: function getBaseProps(props) {
	        var sharedParentState = this.getSharedEventState("parent", "parent");
	        var parentState = this.getEventState("parent", "parent");
	        var baseParentProps = (0, _defaults3.default)({}, parentState, sharedParentState);
	        var parentPropsList = baseParentProps.parentControlledProps;
	        var parentProps = parentPropsList ? (0, _pick3.default)(baseParentProps, parentPropsList) : {};
	        var modifiedProps = (0, _defaults3.default)({}, parentProps, props);
	        return (0, _isFunction3.default)(WrappedComponent.getBaseProps) ? WrappedComponent.getBaseProps(modifiedProps) : {};
	      }
	    }, {
	      key: "getAllEvents",
	      value: function getAllEvents(props) {
	        if (Array.isArray(this.componentEvents)) {
	          var _componentEvents;

	          return Array.isArray(props.events) ? (_componentEvents = this.componentEvents).concat.apply(_componentEvents, _toConsumableArray(props.events)) : this.componentEvents;
	        }
	        return props.events;
	      }
	    }, {
	      key: "getComponentProps",
	      value: function getComponentProps(component, type, index) {
	        var role = WrappedComponent.role;

	        var key = this.dataKeys && this.dataKeys[index] || index;
	        var baseProps = this.baseProps[key][type] || this.baseProps[key];
	        if (!baseProps && !this.hasEvents) {
	          return undefined;
	        }
	        if (this.hasEvents) {
	          var baseEvents = this.getEvents(this.props, type, key);
	          var componentProps = (0, _defaults3.default)({ index: index, key: role + "-" + type + "-" + key }, this.getEventState(key, type), this.getSharedEventState(key, type), component.props, baseProps);
	          var events = (0, _defaults3.default)({}, _events2.default.getPartialEvents(baseEvents, key, componentProps), componentProps.events);
	          return (0, _assign3.default)({}, componentProps, { events: events });
	        }
	        return (0, _defaults3.default)({ index: index, key: role + "-" + type + "-" + key }, component.props, baseProps);
	      }
	    }, {
	      key: "renderContainer",
	      value: function renderContainer(component, children) {
	        var isContainer = component.type && component.type.role === "container";
	        var parentProps = isContainer ? this.getComponentProps(component, "parent", "parent") : {};
	        return _react2.default.cloneElement(component, parentProps, children);
	      }
	    }, {
	      key: "animateComponent",
	      value: function animateComponent(props, animationWhitelist) {
	        return _react2.default.createElement(
	          _victoryTransition2.default,
	          { animate: props.animate, animationWhitelist: animationWhitelist },
	          _react2.default.createElement(this.constructor, props)
	        );
	      }

	      // Used by `VictoryLine` and `VictoryArea`

	    }, {
	      key: "renderContinuousData",
	      value: function renderContinuousData(props) {
	        var _this2 = this;

	        var dataComponent = props.dataComponent,
	            labelComponent = props.labelComponent,
	            groupComponent = props.groupComponent;

	        var dataKeys = (0, _without3.default)(this.dataKeys, "all");
	        var labelComponents = dataKeys.reduce(function (memo, key) {
	          var labelProps = _this2.getComponentProps(labelComponent, "labels", key);
	          if (labelProps && labelProps.text !== undefined && labelProps.text !== null) {
	            memo = memo.concat(_react2.default.cloneElement(labelComponent, labelProps));
	          }
	          return memo;
	        }, []);
	        var dataProps = this.getComponentProps(dataComponent, "data", "all");
	        var children = [_react2.default.cloneElement(dataComponent, dataProps)].concat(_toConsumableArray(labelComponents));
	        return this.renderContainer(groupComponent, children);
	      }
	    }, {
	      key: "renderData",
	      value: function renderData(props) {
	        var _this3 = this;

	        var dataComponent = props.dataComponent,
	            labelComponent = props.labelComponent,
	            groupComponent = props.groupComponent;

	        var dataComponents = this.dataKeys.map(function (_dataKey, index) {
	          var dataProps = _this3.getComponentProps(dataComponent, "data", index);
	          return _react2.default.cloneElement(dataComponent, dataProps);
	        });

	        var labelComponents = this.dataKeys.map(function (_dataKey, index) {
	          var labelProps = _this3.getComponentProps(labelComponent, "labels", index);
	          if (labelProps.text !== undefined && labelProps.text !== null) {
	            return _react2.default.cloneElement(labelComponent, labelProps);
	          }
	          return undefined;
	        }).filter(Boolean);

	        var children = [].concat(_toConsumableArray(dataComponents), _toConsumableArray(labelComponents));
	        return this.renderContainer(groupComponent, children);
	      }
	    }]);

	    return addEvents;
	  }(WrappedComponent);
	};

/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _sortBy2 = __webpack_require__(247);

	var _sortBy3 = _interopRequireDefault(_sortBy2);

	var _property2 = __webpack_require__(185);

	var _property3 = _interopRequireDefault(_property2);

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _last2 = __webpack_require__(100);

	var _last3 = _interopRequireDefault(_last2);

	var _range2 = __webpack_require__(226);

	var _range3 = _interopRequireDefault(_range2);

	var _uniq2 = __webpack_require__(253);

	var _uniq3 = _interopRequireDefault(_uniq2);

	var _assign2 = __webpack_require__(120);

	var _assign3 = _interopRequireDefault(_assign2);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _scale = __webpack_require__(256);

	var _scale2 = _interopRequireDefault(_scale);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	exports.default = {
	  /**
	   * Returns an array of formatted data
	   * @param {Object} props: the props object
	   * @returns {Array} an array of data
	   */
	  getData: function (props) {
	    var data = void 0;
	    if (props.data) {
	      if (props.data.length < 1) {
	        return [];
	      } else {
	        data = this.formatData(props.data, props);
	      }
	    } else {
	      data = this.formatData(this.generateData(props), props);
	    }
	    return this.addEventKeys(props, data);
	  },


	  /**
	   * Returns generated data for a given axis based on domain and sample from props
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} an array of data
	   */
	  generateDataArray: function (props, axis) {
	    var propsDomain = props.domain && Array.isArray(props.domain) ? props.domain : props.domain && props.domain[axis];
	    var domain = propsDomain || _scale2.default.getBaseScale(props, axis).domain();
	    var samples = props.samples || 1;
	    var domainMax = Math.max.apply(Math, _toConsumableArray(domain));
	    var domainMin = Math.min.apply(Math, _toConsumableArray(domain));
	    var step = (domainMax - domainMin) / samples;
	    var values = (0, _range3.default)(domainMin, domainMax, step);
	    return (0, _last3.default)(values) === domainMax ? values : values.concat(domainMax);
	  },


	  /**
	   * Returns generated x and y data based on domain and sample from props
	   * @param {Object} props: the props object
	   * @returns {Array} an array of data
	   */
	  generateData: function (props) {
	    var xValues = this.generateDataArray(props, "x");
	    var yValues = this.generateDataArray(props, "y");
	    var values = xValues.map(function (x, i) {
	      return { x: x, y: yValues[i] };
	    });
	    return values;
	  },


	  /**
	   * Returns formatted data. Data accessors are applied, and string values are replaced.
	   * @param {Array} dataset: the original domain
	   * @param {Object} props: the props object
	   * @param {Object} stringMap: a mapping of string values to numeric values
	   * @returns {Array} the formatted data
	   */
	  formatData: function (dataset, props, stringMap) {
	    if (!Array.isArray(dataset)) {
	      return [];
	    }
	    stringMap = stringMap || {
	      x: this.createStringMap(props, "x"),
	      y: this.createStringMap(props, "y")
	    };
	    var accessor = {
	      x: _helpers2.default.createAccessor(props.x !== undefined ? props.x : "x"),
	      y: _helpers2.default.createAccessor(props.y !== undefined ? props.y : "y"),
	      y0: _helpers2.default.createAccessor(props.y0 !== undefined ? props.y0 : "y0")
	    };
	    var data = dataset.map(function (datum, index) {
	      var evaluatedX = datum._x !== undefined ? datum._x : accessor.x(datum);
	      var evaluatedY = datum._y !== undefined ? datum._y : accessor.y(datum);
	      var y0 = datum._y0 !== undefined ? datum._y0 : accessor.y0(datum);
	      var x = evaluatedX !== undefined ? evaluatedX : index;
	      var y = evaluatedY !== undefined ? evaluatedY : datum;
	      var originalValues = y0 === undefined ? { x: x, y: y } : { x: x, y: y, y0: y0 };
	      var privateValues = y0 === undefined ? { _x: x, _y: y } : { _x: x, _y: y, _y0: y0 };
	      return (0, _assign3.default)(originalValues, datum, privateValues,
	      // map string data to numeric values, and add names
	      typeof x === "string" ? { _x: stringMap.x[x], xName: x } : {}, typeof y === "string" ? { _y: stringMap.y[y], yName: y } : {}, typeof y0 === "string" ? { _y0: stringMap.y[y0], yName: y0 } : {});
	    });

	    var sortedData = this.sortData(data, props.sortKey);

	    return this.cleanData(sortedData, props);
	  },


	  /**
	   * Returns sorted data. If no sort keys are provided, data is returned unaltered.
	   * Sort key should correspond to the `iteratees` argument in lodash `sortBy` function.
	   * @param {Array} dataset: the original dataset
	   * @param {mixed} sortKey: the sort key. Type is whatever lodash permits for `sortBy`
	   * @returns {Array} the sorted data
	   */
	  sortData: function (dataset, sortKey) {
	    if (!sortKey) {
	      return dataset;
	    }

	    // Ensures previous VictoryLine api for sortKey prop stays consistent
	    if (sortKey === "x" || sortKey === "y") {
	      sortKey = "_" + sortKey;
	    }

	    return (0, _sortBy3.default)(dataset, sortKey);
	  },


	  /**
	   * Returns the cleaned data. Some scale types break when certain data is supplied.
	   * This method will remove data points that break certain scales. So far this method
	   * only removes zeroes for log scales
	   * @param {Array} dataset: the original domain
	   * @param {Object} props: the props object
	   * @returns {Array} the cleaned data
	   */
	  cleanData: function (dataset, props) {
	    var scaleType = {
	      x: _scale2.default.getScaleType(props, "x"),
	      y: _scale2.default.getScaleType(props, "y")
	    };
	    if (scaleType.x !== "log" && scaleType.y !== "log") {
	      return dataset;
	    }
	    var rules = function (datum, axis) {
	      return scaleType[axis] === "log" ? datum["_" + axis] !== 0 : true;
	    };
	    return dataset.filter(function (datum) {
	      return rules(datum, "x") && rules(datum, "y") && rules(datum, "y0");
	    });
	  },


	  // Returns a data accessor given an eventKey prop
	  getEventKey: function (key) {
	    // creates a data accessor function
	    // given a property key, path, array index, or null for identity.
	    if ((0, _isFunction3.default)(key)) {
	      return key;
	    } else if (key === null || typeof key === "undefined") {
	      return function () {
	        return undefined;
	      };
	    }
	    // otherwise, assume it is an array index, property key or path (_.property handles all three)
	    return (0, _property3.default)(key);
	  },


	  // Returns data with an eventKey prop added to each datum
	  addEventKeys: function (props, data) {
	    var eventKeyAccessor = this.getEventKey(props.eventKey);
	    return data.map(function (datum, index) {
	      var eventKey = datum.eventKey || eventKeyAccessor(datum) || index;
	      return (0, _assign3.default)({ eventKey: eventKey }, datum);
	    });
	  },


	  /**
	   * Returns an object mapping string data to numeric data
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Object} an object mapping string data to numeric data
	   */
	  createStringMap: function (props, axis) {
	    var stringsFromAxes = this.getStringsFromAxes(props, axis);
	    var stringsFromCategories = this.getStringsFromCategories(props, axis);
	    var stringsFromData = this.getStringsFromData(props, axis);

	    var allStrings = (0, _uniq3.default)([].concat(_toConsumableArray(stringsFromAxes), _toConsumableArray(stringsFromCategories), _toConsumableArray(stringsFromData)));
	    return allStrings.length === 0 ? null : allStrings.reduce(function (memo, string, index) {
	      memo[string] = index + 1;
	      return memo;
	    }, {});
	  },


	  /**
	   * Returns an array of strings from data
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} an array of strings
	   */
	  getStringsFromData: function (props, axis) {
	    if (!Array.isArray(props.data)) {
	      return [];
	    }
	    var key = typeof props[axis] === "undefined" ? axis : props[axis];
	    var accessor = _helpers2.default.createAccessor(key);
	    var dataStrings = props.data.map(function (datum) {
	      return accessor(datum);
	    }).filter(function (datum) {
	      return typeof datum === "string";
	    });
	    // return a unique set of strings
	    return dataStrings.reduce(function (prev, curr) {
	      if (typeof curr !== "undefined" && curr !== null && prev.indexOf(curr) === -1) {
	        prev.push(curr);
	      }
	      return prev;
	    }, []);
	  },


	  /**
	   * Returns an array of strings from axis tickValues for a given axis
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} an array of strings
	   */
	  getStringsFromAxes: function (props, axis) {
	    if (!props.tickValues || !Array.isArray(props.tickValues) && !props.tickValues[axis]) {
	      return [];
	    }
	    var tickValueArray = props.tickValues[axis] || props.tickValues;
	    return tickValueArray.filter(function (val) {
	      return typeof val === "string";
	    });
	  },


	  /**
	   * Returns an array of strings from categories for a given axis
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} an array of strings
	   */
	  getStringsFromCategories: function (props, axis) {
	    if (!props.categories) {
	      return [];
	    }
	    var categories = this.getCategories(props, axis);
	    var categoryStrings = categories && categories.filter(function (val) {
	      return typeof val === "string";
	    });
	    return categoryStrings ? _collection2.default.removeUndefined(categoryStrings) : [];
	  },


	  /**
	   * Returns an array of categories for a given axis
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} an array of categories
	   */
	  getCategories: function (props, axis) {
	    return props.categories && !Array.isArray(props.categories) ? props.categories[axis] : props.categories;
	  }
	};

/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(111),
	    baseOrderBy = __webpack_require__(248),
	    baseRest = __webpack_require__(3),
	    isIterateeCall = __webpack_require__(71);

	/**
	 * Creates an array of elements, sorted in ascending order by the results of
	 * running each element in a collection thru each iteratee. This method
	 * performs a stable sort, that is, it preserves the original sort order of
	 * equal elements. The iteratees are invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {...(Function|Function[])} [iteratees=[_.identity]]
	 *  The iteratees to sort by.
	 * @returns {Array} Returns the new sorted array.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'fred',   'age': 48 },
	 *   { 'user': 'barney', 'age': 36 },
	 *   { 'user': 'fred',   'age': 40 },
	 *   { 'user': 'barney', 'age': 34 }
	 * ];
	 *
	 * _.sortBy(users, [function(o) { return o.user; }]);
	 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	 *
	 * _.sortBy(users, ['user', 'age']);
	 * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
	 */
	var sortBy = baseRest(function(collection, iteratees) {
	  if (collection == null) {
	    return [];
	  }
	  var length = iteratees.length;
	  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
	    iteratees = [];
	  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
	    iteratees = [iteratees[0]];
	  }
	  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
	});

	module.exports = sortBy;


/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(91),
	    baseIteratee = __webpack_require__(153),
	    baseMap = __webpack_require__(249),
	    baseSortBy = __webpack_require__(250),
	    baseUnary = __webpack_require__(83),
	    compareMultiple = __webpack_require__(251),
	    identity = __webpack_require__(4);

	/**
	 * The base implementation of `_.orderBy` without param guards.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	 * @param {string[]} orders The sort orders of `iteratees`.
	 * @returns {Array} Returns the new sorted array.
	 */
	function baseOrderBy(collection, iteratees, orders) {
	  var index = -1;
	  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

	  var result = baseMap(collection, function(value, key, collection) {
	    var criteria = arrayMap(iteratees, function(iteratee) {
	      return iteratee(value);
	    });
	    return { 'criteria': criteria, 'index': ++index, 'value': value };
	  });

	  return baseSortBy(result, function(object, other) {
	    return compareMultiple(object, other, orders);
	  });
	}

	module.exports = baseOrderBy;


/***/ }),
/* 249 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;


/***/ }),
/* 250 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.sortBy` which uses `comparer` to define the
	 * sort order of `array` and replaces criteria objects with their corresponding
	 * values.
	 *
	 * @private
	 * @param {Array} array The array to sort.
	 * @param {Function} comparer The function to define sort order.
	 * @returns {Array} Returns `array`.
	 */
	function baseSortBy(array, comparer) {
	  var length = array.length;

	  array.sort(comparer);
	  while (length--) {
	    array[length] = array[length].value;
	  }
	  return array;
	}

	module.exports = baseSortBy;


/***/ }),
/* 251 */
/***/ (function(module, exports, __webpack_require__) {

	var compareAscending = __webpack_require__(252);

	/**
	 * Used by `_.orderBy` to compare multiple properties of a value to another
	 * and stable sort them.
	 *
	 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	 * specify an order of "desc" for descending or "asc" for ascending sort order
	 * of corresponding values.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {boolean[]|string[]} orders The order to sort by for each property.
	 * @returns {number} Returns the sort order indicator for `object`.
	 */
	function compareMultiple(object, other, orders) {
	  var index = -1,
	      objCriteria = object.criteria,
	      othCriteria = other.criteria,
	      length = objCriteria.length,
	      ordersLength = orders.length;

	  while (++index < length) {
	    var result = compareAscending(objCriteria[index], othCriteria[index]);
	    if (result) {
	      if (index >= ordersLength) {
	        return result;
	      }
	      var order = orders[index];
	      return result * (order == 'desc' ? -1 : 1);
	    }
	  }
	  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	  // that causes it, under certain circumstances, to provide the same value for
	  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	  // for more details.
	  //
	  // This also ensures a stable sort in V8 and other engines.
	  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
	  return object.index - other.index;
	}

	module.exports = compareMultiple;


/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(96);

	/**
	 * Compares values to sort them in ascending order.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {number} Returns the sort order indicator for `value`.
	 */
	function compareAscending(value, other) {
	  if (value !== other) {
	    var valIsDefined = value !== undefined,
	        valIsNull = value === null,
	        valIsReflexive = value === value,
	        valIsSymbol = isSymbol(value);

	    var othIsDefined = other !== undefined,
	        othIsNull = other === null,
	        othIsReflexive = other === other,
	        othIsSymbol = isSymbol(other);

	    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
	        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
	        (valIsNull && othIsDefined && othIsReflexive) ||
	        (!valIsDefined && othIsReflexive) ||
	        !valIsReflexive) {
	      return 1;
	    }
	    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
	        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
	        (othIsNull && valIsDefined && valIsReflexive) ||
	        (!othIsDefined && valIsReflexive) ||
	        !othIsReflexive) {
	      return -1;
	    }
	  }
	  return 0;
	}

	module.exports = compareAscending;


/***/ }),
/* 253 */
/***/ (function(module, exports, __webpack_require__) {

	var baseUniq = __webpack_require__(254);

	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each element
	 * is kept. The order of result values is determined by the order they occur
	 * in the array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return (array && array.length) ? baseUniq(array) : [];
	}

	module.exports = uniq;


/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(159),
	    arrayIncludes = __webpack_require__(34),
	    arrayIncludesWith = __webpack_require__(206),
	    cacheHas = __webpack_require__(164),
	    createSet = __webpack_require__(255),
	    setToArray = __webpack_require__(167);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;

	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}

	module.exports = baseUniq;


/***/ }),
/* 255 */
/***/ (function(module, exports) {

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}

	module.exports = noop;


/***/ }),
/* 256 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _includes2 = __webpack_require__(257);

	var _includes3 = _interopRequireDefault(_includes2);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	var _d3Scale = __webpack_require__(258);

	var d3Scale = _interopRequireWildcard(_d3Scale);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var supportedScaleStrings = ["linear", "time", "log", "sqrt"];

	exports.default = {
	  getDefaultScale: function () {
	    return d3Scale.scaleLinear();
	  },
	  toNewName: function (scale) {
	    // d3 scale changed the naming scheme for scale from "linear" -> "scaleLinear" etc.
	    var capitalize = function (s) {
	      return s && s[0].toUpperCase() + s.slice(1);
	    };
	    return "scale" + capitalize(scale);
	  },
	  validScale: function (scale) {
	    if (typeof scale === "function") {
	      return (0, _isFunction3.default)(scale.copy) && (0, _isFunction3.default)(scale.domain) && (0, _isFunction3.default)(scale.range);
	    } else if (typeof scale === "string") {
	      return (0, _includes3.default)(supportedScaleStrings, scale);
	    }
	    return false;
	  },
	  isScaleDefined: function (props, axis) {
	    if (!props.scale) {
	      return false;
	    } else if (props.scale.x || props.scale.y) {
	      return props.scale[axis] ? true : false;
	    }
	    return true;
	  },
	  getScaleTypeFromProps: function (props, axis) {
	    if (!this.isScaleDefined(props, axis)) {
	      return undefined;
	    }
	    var scale = props.scale[axis] || props.scale;
	    return typeof scale === "string" ? scale : this.getType(scale);
	  },
	  getScaleFromProps: function (props, axis) {
	    if (!this.isScaleDefined(props, axis)) {
	      return undefined;
	    }
	    var scale = props.scale[axis] || props.scale;

	    if (this.validScale(scale)) {
	      return (0, _isFunction3.default)(scale) ? scale : d3Scale[this.toNewName(scale)]();
	    }
	    return undefined;
	  },
	  getScaleTypeFromData: function (props, axis) {
	    if (!props.data) {
	      return "linear";
	    }
	    var accessor = _helpers2.default.createAccessor(props[axis]);
	    var axisData = props.data.map(accessor);
	    return _collection2.default.containsDates(axisData) ? "time" : "linear";
	  },
	  getBaseScale: function (props, axis) {
	    var scale = this.getScaleFromProps(props, axis);
	    if (scale) {
	      return scale;
	    }
	    var dataScale = this.getScaleTypeFromData(props, axis);
	    return d3Scale[this.toNewName(dataScale)]();
	  },
	  getType: function (scale) {
	    var duckTypes = [{ name: "log", method: "base" }, { name: "ordinal", method: "unknown" }, { name: "pow-sqrt", method: "exponent" }, { name: "quantile", method: "quantiles" }, { name: "quantize-threshold", method: "invertExtent" }];
	    var scaleType = duckTypes.filter(function (type) {
	      return scale[type.method] !== undefined;
	    })[0];
	    return scaleType ? scaleType.name : undefined;
	  },
	  getScaleType: function (props, axis) {
	    // if the scale was not given in props, it will be set to linear or time depending on data
	    return this.getScaleTypeFromProps(props, axis) || this.getScaleTypeFromData(props, axis);
	  }
	};

/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(35);

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	module.exports = arrayIncludes;


/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-scale/ Version 1.0.7. Copyright 2017 Mike Bostock.
	(function (global, factory) {
		 true ? factory(exports, __webpack_require__(259), __webpack_require__(260), __webpack_require__(62), __webpack_require__(261), __webpack_require__(262), __webpack_require__(263), __webpack_require__(63)) :
		typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-collection', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format', 'd3-color'], factory) :
		(factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
	}(this, (function (exports,d3Array,d3Collection,d3Interpolate,d3Format,d3Time,d3TimeFormat,d3Color) { 'use strict';

	var array = Array.prototype;

	var map$1 = array.map;
	var slice = array.slice;

	var implicit = {name: "implicit"};

	function ordinal(range$$1) {
	  var index = d3Collection.map(),
	      domain = [],
	      unknown = implicit;

	  range$$1 = range$$1 == null ? [] : slice.call(range$$1);

	  function scale(d) {
	    var key = d + "", i = index.get(key);
	    if (!i) {
	      if (unknown !== implicit) return unknown;
	      index.set(key, i = domain.push(d));
	    }
	    return range$$1[(i - 1) % range$$1.length];
	  }

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [], index = d3Collection.map();
	    var i = -1, n = _.length, d, key;
	    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
	    return scale;
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice.call(_), scale) : range$$1.slice();
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  scale.copy = function() {
	    return ordinal()
	        .domain(domain)
	        .range(range$$1)
	        .unknown(unknown);
	  };

	  return scale;
	}

	function band() {
	  var scale = ordinal().unknown(undefined),
	      domain = scale.domain,
	      ordinalRange = scale.range,
	      range$$1 = [0, 1],
	      step,
	      bandwidth,
	      round = false,
	      paddingInner = 0,
	      paddingOuter = 0,
	      align = 0.5;

	  delete scale.unknown;

	  function rescale() {
	    var n = domain().length,
	        reverse = range$$1[1] < range$$1[0],
	        start = range$$1[reverse - 0],
	        stop = range$$1[1 - reverse];
	    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
	    if (round) step = Math.floor(step);
	    start += (stop - start - step * (n - paddingInner)) * align;
	    bandwidth = step * (1 - paddingInner);
	    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
	    var values = d3Array.range(n).map(function(i) { return start + step * i; });
	    return ordinalRange(reverse ? values.reverse() : values);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range$$1 = [+_[0], +_[1]], round = true, rescale();
	  };

	  scale.bandwidth = function() {
	    return bandwidth;
	  };

	  scale.step = function() {
	    return step;
	  };

	  scale.round = function(_) {
	    return arguments.length ? (round = !!_, rescale()) : round;
	  };

	  scale.padding = function(_) {
	    return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingInner = function(_) {
	    return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingOuter = function(_) {
	    return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
	  };

	  scale.align = function(_) {
	    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	  };

	  scale.copy = function() {
	    return band()
	        .domain(domain())
	        .range(range$$1)
	        .round(round)
	        .paddingInner(paddingInner)
	        .paddingOuter(paddingOuter)
	        .align(align);
	  };

	  return rescale();
	}

	function pointish(scale) {
	  var copy = scale.copy;

	  scale.padding = scale.paddingOuter;
	  delete scale.paddingInner;
	  delete scale.paddingOuter;

	  scale.copy = function() {
	    return pointish(copy());
	  };

	  return scale;
	}

	function point() {
	  return pointish(band().paddingInner(1));
	}

	var constant = function(x) {
	  return function() {
	    return x;
	  };
	};

	var number = function(x) {
	  return +x;
	};

	var unit = [0, 1];

	function deinterpolateLinear(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constant(b);
	}

	function deinterpolateClamp(deinterpolate) {
	  return function(a, b) {
	    var d = deinterpolate(a = +a, b = +b);
	    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
	  };
	}

	function reinterpolateClamp(reinterpolate) {
	  return function(a, b) {
	    var r = reinterpolate(a = +a, b = +b);
	    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
	  };
	}

	function bimap(domain, range$$1, deinterpolate, reinterpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range$$1[0], r1 = range$$1[1];
	  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
	  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range$$1, deinterpolate, reinterpolate) {
	  var j = Math.min(domain.length, range$$1.length) - 1,
	      d = new Array(j),
	      r = new Array(j),
	      i = -1;

	  // Reverse descending domains.
	  if (domain[j] < domain[0]) {
	    domain = domain.slice().reverse();
	    range$$1 = range$$1.slice().reverse();
	  }

	  while (++i < j) {
	    d[i] = deinterpolate(domain[i], domain[i + 1]);
	    r[i] = reinterpolate(range$$1[i], range$$1[i + 1]);
	  }

	  return function(x) {
	    var i = d3Array.bisect(domain, x, 1, j) - 1;
	    return r[i](d[i](x));
	  };
	}

	function copy(source, target) {
	  return target
	      .domain(source.domain())
	      .range(source.range())
	      .interpolate(source.interpolate())
	      .clamp(source.clamp());
	}

	// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
	function continuous(deinterpolate, reinterpolate) {
	  var domain = unit,
	      range$$1 = unit,
	      interpolate$$1 = d3Interpolate.interpolate,
	      clamp = false,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    piecewise = Math.min(domain.length, range$$1.length) > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return (output || (output = piecewise(domain, range$$1, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
	  }

	  scale.invert = function(y) {
	    return (input || (input = piecewise(range$$1, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = map$1.call(_, number), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice.call(_), rescale()) : range$$1.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range$$1 = slice.call(_), interpolate$$1 = d3Interpolate.interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = !!_, rescale()) : clamp;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
	  };

	  return rescale();
	}

	var tickFormat = function(domain, count, specifier) {
	  var start = domain[0],
	      stop = domain[domain.length - 1],
	      step = d3Array.tickStep(start, stop, count == null ? 10 : count),
	      precision;
	  specifier = d3Format.formatSpecifier(specifier == null ? ",f" : specifier);
	  switch (specifier.type) {
	    case "s": {
	      var value = Math.max(Math.abs(start), Math.abs(stop));
	      if (specifier.precision == null && !isNaN(precision = d3Format.precisionPrefix(step, value))) specifier.precision = precision;
	      return d3Format.formatPrefix(specifier, value);
	    }
	    case "":
	    case "e":
	    case "g":
	    case "p":
	    case "r": {
	      if (specifier.precision == null && !isNaN(precision = d3Format.precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
	      break;
	    }
	    case "f":
	    case "%": {
	      if (specifier.precision == null && !isNaN(precision = d3Format.precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	      break;
	    }
	  }
	  return d3Format.format(specifier);
	};

	function linearish(scale) {
	  var domain = scale.domain;

	  scale.ticks = function(count) {
	    var d = domain();
	    return d3Array.ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	  };

	  scale.tickFormat = function(count, specifier) {
	    return tickFormat(domain(), count, specifier);
	  };

	  scale.nice = function(count) {
	    if (count == null) count = 10;

	    var d = domain(),
	        i0 = 0,
	        i1 = d.length - 1,
	        start = d[i0],
	        stop = d[i1],
	        step;

	    if (stop < start) {
	      step = start, start = stop, stop = step;
	      step = i0, i0 = i1, i1 = step;
	    }

	    step = d3Array.tickIncrement(start, stop, count);

	    if (step > 0) {
	      start = Math.floor(start / step) * step;
	      stop = Math.ceil(stop / step) * step;
	      step = d3Array.tickIncrement(start, stop, count);
	    } else if (step < 0) {
	      start = Math.ceil(start * step) / step;
	      stop = Math.floor(stop * step) / step;
	      step = d3Array.tickIncrement(start, stop, count);
	    }

	    if (step > 0) {
	      d[i0] = Math.floor(start / step) * step;
	      d[i1] = Math.ceil(stop / step) * step;
	      domain(d);
	    } else if (step < 0) {
	      d[i0] = Math.ceil(start * step) / step;
	      d[i1] = Math.floor(stop * step) / step;
	      domain(d);
	    }

	    return scale;
	  };

	  return scale;
	}

	function linear() {
	  var scale = continuous(deinterpolateLinear, d3Interpolate.interpolateNumber);

	  scale.copy = function() {
	    return copy(scale, linear());
	  };

	  return linearish(scale);
	}

	function identity() {
	  var domain = [0, 1];

	  function scale(x) {
	    return +x;
	  }

	  scale.invert = scale;

	  scale.domain = scale.range = function(_) {
	    return arguments.length ? (domain = map$1.call(_, number), scale) : domain.slice();
	  };

	  scale.copy = function() {
	    return identity().domain(domain);
	  };

	  return linearish(scale);
	}

	var nice = function(domain, interval) {
	  domain = domain.slice();

	  var i0 = 0,
	      i1 = domain.length - 1,
	      x0 = domain[i0],
	      x1 = domain[i1],
	      t;

	  if (x1 < x0) {
	    t = i0, i0 = i1, i1 = t;
	    t = x0, x0 = x1, x1 = t;
	  }

	  domain[i0] = interval.floor(x0);
	  domain[i1] = interval.ceil(x1);
	  return domain;
	};

	function deinterpolate(a, b) {
	  return (b = Math.log(b / a))
	      ? function(x) { return Math.log(x / a) / b; }
	      : constant(b);
	}

	function reinterpolate(a, b) {
	  return a < 0
	      ? function(t) { return -Math.pow(-b, t) * Math.pow(-a, 1 - t); }
	      : function(t) { return Math.pow(b, t) * Math.pow(a, 1 - t); };
	}

	function pow10(x) {
	  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
	}

	function powp(base) {
	  return base === 10 ? pow10
	      : base === Math.E ? Math.exp
	      : function(x) { return Math.pow(base, x); };
	}

	function logp(base) {
	  return base === Math.E ? Math.log
	      : base === 10 && Math.log10
	      || base === 2 && Math.log2
	      || (base = Math.log(base), function(x) { return Math.log(x) / base; });
	}

	function reflect(f) {
	  return function(x) {
	    return -f(-x);
	  };
	}

	function log() {
	  var scale = continuous(deinterpolate, reinterpolate).domain([1, 10]),
	      domain = scale.domain,
	      base = 10,
	      logs = logp(10),
	      pows = powp(10);

	  function rescale() {
	    logs = logp(base), pows = powp(base);
	    if (domain()[0] < 0) logs = reflect(logs), pows = reflect(pows);
	    return scale;
	  }

	  scale.base = function(_) {
	    return arguments.length ? (base = +_, rescale()) : base;
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.ticks = function(count) {
	    var d = domain(),
	        u = d[0],
	        v = d[d.length - 1],
	        r;

	    if (r = v < u) i = u, u = v, v = i;

	    var i = logs(u),
	        j = logs(v),
	        p,
	        k,
	        t,
	        n = count == null ? 10 : +count,
	        z = [];

	    if (!(base % 1) && j - i < n) {
	      i = Math.round(i) - 1, j = Math.round(j) + 1;
	      if (u > 0) for (; i < j; ++i) {
	        for (k = 1, p = pows(i); k < base; ++k) {
	          t = p * k;
	          if (t < u) continue;
	          if (t > v) break;
	          z.push(t);
	        }
	      } else for (; i < j; ++i) {
	        for (k = base - 1, p = pows(i); k >= 1; --k) {
	          t = p * k;
	          if (t < u) continue;
	          if (t > v) break;
	          z.push(t);
	        }
	      }
	    } else {
	      z = d3Array.ticks(i, j, Math.min(j - i, n)).map(pows);
	    }

	    return r ? z.reverse() : z;
	  };

	  scale.tickFormat = function(count, specifier) {
	    if (specifier == null) specifier = base === 10 ? ".0e" : ",";
	    if (typeof specifier !== "function") specifier = d3Format.format(specifier);
	    if (count === Infinity) return specifier;
	    if (count == null) count = 10;
	    var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
	    return function(d) {
	      var i = d / pows(Math.round(logs(d)));
	      if (i * base < base - 0.5) i *= base;
	      return i <= k ? specifier(d) : "";
	    };
	  };

	  scale.nice = function() {
	    return domain(nice(domain(), {
	      floor: function(x) { return pows(Math.floor(logs(x))); },
	      ceil: function(x) { return pows(Math.ceil(logs(x))); }
	    }));
	  };

	  scale.copy = function() {
	    return copy(scale, log().base(base));
	  };

	  return scale;
	}

	function raise(x, exponent) {
	  return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
	}

	function pow() {
	  var exponent = 1,
	      scale = continuous(deinterpolate, reinterpolate),
	      domain = scale.domain;

	  function deinterpolate(a, b) {
	    return (b = raise(b, exponent) - (a = raise(a, exponent)))
	        ? function(x) { return (raise(x, exponent) - a) / b; }
	        : constant(b);
	  }

	  function reinterpolate(a, b) {
	    b = raise(b, exponent) - (a = raise(a, exponent));
	    return function(t) { return raise(a + b * t, 1 / exponent); };
	  }

	  scale.exponent = function(_) {
	    return arguments.length ? (exponent = +_, domain(domain())) : exponent;
	  };

	  scale.copy = function() {
	    return copy(scale, pow().exponent(exponent));
	  };

	  return linearish(scale);
	}

	function sqrt() {
	  return pow().exponent(0.5);
	}

	function quantile$1() {
	  var domain = [],
	      range$$1 = [],
	      thresholds = [];

	  function rescale() {
	    var i = 0, n = Math.max(1, range$$1.length);
	    thresholds = new Array(n - 1);
	    while (++i < n) thresholds[i - 1] = d3Array.quantile(domain, i / n);
	    return scale;
	  }

	  function scale(x) {
	    if (!isNaN(x = +x)) return range$$1[d3Array.bisect(thresholds, x)];
	  }

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return i < 0 ? [NaN, NaN] : [
	      i > 0 ? thresholds[i - 1] : domain[0],
	      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
	    ];
	  };

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [];
	    for (var i = 0, n = _.length, d; i < n; ++i) if (d = _[i], d != null && !isNaN(d = +d)) domain.push(d);
	    domain.sort(d3Array.ascending);
	    return rescale();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice.call(_), rescale()) : range$$1.slice();
	  };

	  scale.quantiles = function() {
	    return thresholds.slice();
	  };

	  scale.copy = function() {
	    return quantile$1()
	        .domain(domain)
	        .range(range$$1);
	  };

	  return scale;
	}

	function quantize() {
	  var x0 = 0,
	      x1 = 1,
	      n = 1,
	      domain = [0.5],
	      range$$1 = [0, 1];

	  function scale(x) {
	    if (x <= x) return range$$1[d3Array.bisect(domain, x, 0, n)];
	  }

	  function rescale() {
	    var i = -1;
	    domain = new Array(n);
	    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
	    return scale;
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (x0 = +_[0], x1 = +_[1], rescale()) : [x0, x1];
	  };

	  scale.range = function(_) {
	    return arguments.length ? (n = (range$$1 = slice.call(_)).length - 1, rescale()) : range$$1.slice();
	  };

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return i < 0 ? [NaN, NaN]
	        : i < 1 ? [x0, domain[0]]
	        : i >= n ? [domain[n - 1], x1]
	        : [domain[i - 1], domain[i]];
	  };

	  scale.copy = function() {
	    return quantize()
	        .domain([x0, x1])
	        .range(range$$1);
	  };

	  return linearish(scale);
	}

	function threshold() {
	  var domain = [0.5],
	      range$$1 = [0, 1],
	      n = 1;

	  function scale(x) {
	    if (x <= x) return range$$1[d3Array.bisect(domain, x, 0, n)];
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain = slice.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : range$$1.slice();
	  };

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return [domain[i - 1], domain[i]];
	  };

	  scale.copy = function() {
	    return threshold()
	        .domain(domain)
	        .range(range$$1);
	  };

	  return scale;
	}

	var durationSecond = 1000;
	var durationMinute = durationSecond * 60;
	var durationHour = durationMinute * 60;
	var durationDay = durationHour * 24;
	var durationWeek = durationDay * 7;
	var durationMonth = durationDay * 30;
	var durationYear = durationDay * 365;

	function date(t) {
	  return new Date(t);
	}

	function number$1(t) {
	  return t instanceof Date ? +t : +new Date(+t);
	}

	function calendar(year, month, week, day, hour, minute, second, millisecond, format$$1) {
	  var scale = continuous(deinterpolateLinear, d3Interpolate.interpolateNumber),
	      invert = scale.invert,
	      domain = scale.domain;

	  var formatMillisecond = format$$1(".%L"),
	      formatSecond = format$$1(":%S"),
	      formatMinute = format$$1("%I:%M"),
	      formatHour = format$$1("%I %p"),
	      formatDay = format$$1("%a %d"),
	      formatWeek = format$$1("%b %d"),
	      formatMonth = format$$1("%B"),
	      formatYear = format$$1("%Y");

	  var tickIntervals = [
	    [second,  1,      durationSecond],
	    [second,  5,  5 * durationSecond],
	    [second, 15, 15 * durationSecond],
	    [second, 30, 30 * durationSecond],
	    [minute,  1,      durationMinute],
	    [minute,  5,  5 * durationMinute],
	    [minute, 15, 15 * durationMinute],
	    [minute, 30, 30 * durationMinute],
	    [  hour,  1,      durationHour  ],
	    [  hour,  3,  3 * durationHour  ],
	    [  hour,  6,  6 * durationHour  ],
	    [  hour, 12, 12 * durationHour  ],
	    [   day,  1,      durationDay   ],
	    [   day,  2,  2 * durationDay   ],
	    [  week,  1,      durationWeek  ],
	    [ month,  1,      durationMonth ],
	    [ month,  3,  3 * durationMonth ],
	    [  year,  1,      durationYear  ]
	  ];

	  function tickFormat(date) {
	    return (second(date) < date ? formatMillisecond
	        : minute(date) < date ? formatSecond
	        : hour(date) < date ? formatMinute
	        : day(date) < date ? formatHour
	        : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
	        : year(date) < date ? formatMonth
	        : formatYear)(date);
	  }

	  function tickInterval(interval, start, stop, step) {
	    if (interval == null) interval = 10;

	    // If a desired tick count is specified, pick a reasonable tick interval
	    // based on the extent of the domain and a rough estimate of tick size.
	    // Otherwise, assume interval is already a time interval and use it.
	    if (typeof interval === "number") {
	      var target = Math.abs(stop - start) / interval,
	          i = d3Array.bisector(function(i) { return i[2]; }).right(tickIntervals, target);
	      if (i === tickIntervals.length) {
	        step = d3Array.tickStep(start / durationYear, stop / durationYear, interval);
	        interval = year;
	      } else if (i) {
	        i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
	        step = i[1];
	        interval = i[0];
	      } else {
	        step = Math.max(d3Array.tickStep(start, stop, interval), 1);
	        interval = millisecond;
	      }
	    }

	    return step == null ? interval : interval.every(step);
	  }

	  scale.invert = function(y) {
	    return new Date(invert(y));
	  };

	  scale.domain = function(_) {
	    return arguments.length ? domain(map$1.call(_, number$1)) : domain().map(date);
	  };

	  scale.ticks = function(interval, step) {
	    var d = domain(),
	        t0 = d[0],
	        t1 = d[d.length - 1],
	        r = t1 < t0,
	        t;
	    if (r) t = t0, t0 = t1, t1 = t;
	    t = tickInterval(interval, t0, t1, step);
	    t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
	    return r ? t.reverse() : t;
	  };

	  scale.tickFormat = function(count, specifier) {
	    return specifier == null ? tickFormat : format$$1(specifier);
	  };

	  scale.nice = function(interval, step) {
	    var d = domain();
	    return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
	        ? domain(nice(d, interval))
	        : scale;
	  };

	  scale.copy = function() {
	    return copy(scale, calendar(year, month, week, day, hour, minute, second, millisecond, format$$1));
	  };

	  return scale;
	}

	var time = function() {
	  return calendar(d3Time.timeYear, d3Time.timeMonth, d3Time.timeWeek, d3Time.timeDay, d3Time.timeHour, d3Time.timeMinute, d3Time.timeSecond, d3Time.timeMillisecond, d3TimeFormat.timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]);
	};

	var utcTime = function() {
	  return calendar(d3Time.utcYear, d3Time.utcMonth, d3Time.utcWeek, d3Time.utcDay, d3Time.utcHour, d3Time.utcMinute, d3Time.utcSecond, d3Time.utcMillisecond, d3TimeFormat.utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]);
	};

	var colors = function(s) {
	  return s.match(/.{6}/g).map(function(x) {
	    return "#" + x;
	  });
	};

	var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

	var category20b = colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

	var category20c = colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

	var category20 = colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

	var cubehelix$1 = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(300, 0.5, 0.0), d3Color.cubehelix(-240, 0.5, 1.0));

	var warm = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(-100, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

	var cool = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(260, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

	var rainbow = d3Color.cubehelix();

	var rainbow$1 = function(t) {
	  if (t < 0 || t > 1) t -= Math.floor(t);
	  var ts = Math.abs(t - 0.5);
	  rainbow.h = 360 * t - 100;
	  rainbow.s = 1.5 - 1.5 * ts;
	  rainbow.l = 0.8 - 0.9 * ts;
	  return rainbow + "";
	};

	function ramp(range$$1) {
	  var n = range$$1.length;
	  return function(t) {
	    return range$$1[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
	  };
	}

	var viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

	var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

	var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

	var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

	function sequential(interpolator) {
	  var x0 = 0,
	      x1 = 1,
	      clamp = false;

	  function scale(x) {
	    var t = (x - x0) / (x1 - x0);
	    return interpolator(clamp ? Math.max(0, Math.min(1, t)) : t);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (x0 = +_[0], x1 = +_[1], scale) : [x0, x1];
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = !!_, scale) : clamp;
	  };

	  scale.interpolator = function(_) {
	    return arguments.length ? (interpolator = _, scale) : interpolator;
	  };

	  scale.copy = function() {
	    return sequential(interpolator).domain([x0, x1]).clamp(clamp);
	  };

	  return linearish(scale);
	}

	exports.scaleBand = band;
	exports.scalePoint = point;
	exports.scaleIdentity = identity;
	exports.scaleLinear = linear;
	exports.scaleLog = log;
	exports.scaleOrdinal = ordinal;
	exports.scaleImplicit = implicit;
	exports.scalePow = pow;
	exports.scaleSqrt = sqrt;
	exports.scaleQuantile = quantile$1;
	exports.scaleQuantize = quantize;
	exports.scaleThreshold = threshold;
	exports.scaleTime = time;
	exports.scaleUtc = utcTime;
	exports.schemeCategory10 = category10;
	exports.schemeCategory20b = category20b;
	exports.schemeCategory20c = category20c;
	exports.schemeCategory20 = category20;
	exports.interpolateCubehelixDefault = cubehelix$1;
	exports.interpolateRainbow = rainbow$1;
	exports.interpolateWarm = warm;
	exports.interpolateCool = cool;
	exports.interpolateViridis = viridis;
	exports.interpolateMagma = magma;
	exports.interpolateInferno = inferno;
	exports.interpolatePlasma = plasma;
	exports.scaleSequential = sequential;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));


/***/ }),
/* 259 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-array/ v1.2.4 Copyright 2018 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
	}(this, (function (exports) { 'use strict';

	function ascending(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector(compare) {
	  if (compare.length === 1) compare = ascendingComparator(compare);
	  return {
	    left: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) < 0) lo = mid + 1;
	        else hi = mid;
	      }
	      return lo;
	    },
	    right: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) > 0) hi = mid;
	        else lo = mid + 1;
	      }
	      return lo;
	    }
	  };
	}

	function ascendingComparator(f) {
	  return function(d, x) {
	    return ascending(f(d), x);
	  };
	}

	var ascendingBisect = bisector(ascending);
	var bisectRight = ascendingBisect.right;
	var bisectLeft = ascendingBisect.left;

	function pairs(array, f) {
	  if (f == null) f = pair;
	  var i = 0, n = array.length - 1, p = array[0], pairs = new Array(n < 0 ? 0 : n);
	  while (i < n) pairs[i] = f(p, p = array[++i]);
	  return pairs;
	}

	function pair(a, b) {
	  return [a, b];
	}

	function cross(values0, values1, reduce) {
	  var n0 = values0.length,
	      n1 = values1.length,
	      values = new Array(n0 * n1),
	      i0,
	      i1,
	      i,
	      value0;

	  if (reduce == null) reduce = pair;

	  for (i0 = i = 0; i0 < n0; ++i0) {
	    for (value0 = values0[i0], i1 = 0; i1 < n1; ++i1, ++i) {
	      values[i] = reduce(value0, values1[i1]);
	    }
	  }

	  return values;
	}

	function descending(a, b) {
	  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	}

	function number(x) {
	  return x === null ? NaN : +x;
	}

	function variance(values, valueof) {
	  var n = values.length,
	      m = 0,
	      i = -1,
	      mean = 0,
	      value,
	      delta,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) {
	        delta = value - mean;
	        mean += delta / ++m;
	        sum += delta * (value - mean);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) {
	        delta = value - mean;
	        mean += delta / ++m;
	        sum += delta * (value - mean);
	      }
	    }
	  }

	  if (m > 1) return sum / (m - 1);
	}

	function deviation(array, f) {
	  var v = variance(array, f);
	  return v ? Math.sqrt(v) : v;
	}

	function extent(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  return [min, max];
	}

	var array = Array.prototype;

	var slice = array.slice;
	var map = array.map;

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	function identity(x) {
	  return x;
	}

	function range(start, stop, step) {
	  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	  var i = -1,
	      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	      range = new Array(n);

	  while (++i < n) {
	    range[i] = start + i * step;
	  }

	  return range;
	}

	var e10 = Math.sqrt(50),
	    e5 = Math.sqrt(10),
	    e2 = Math.sqrt(2);

	function ticks(start, stop, count) {
	  var reverse,
	      i = -1,
	      n,
	      ticks,
	      step;

	  stop = +stop, start = +start, count = +count;
	  if (start === stop && count > 0) return [start];
	  if (reverse = stop < start) n = start, start = stop, stop = n;
	  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

	  if (step > 0) {
	    start = Math.ceil(start / step);
	    stop = Math.floor(stop / step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) * step;
	  } else {
	    start = Math.floor(start * step);
	    stop = Math.ceil(stop * step);
	    ticks = new Array(n = Math.ceil(start - stop + 1));
	    while (++i < n) ticks[i] = (start - i) / step;
	  }

	  if (reverse) ticks.reverse();

	  return ticks;
	}

	function tickIncrement(start, stop, count) {
	  var step = (stop - start) / Math.max(0, count),
	      power = Math.floor(Math.log(step) / Math.LN10),
	      error = step / Math.pow(10, power);
	  return power >= 0
	      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
	      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
	}

	function tickStep(start, stop, count) {
	  var step0 = Math.abs(stop - start) / Math.max(0, count),
	      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	      error = step0 / step1;
	  if (error >= e10) step1 *= 10;
	  else if (error >= e5) step1 *= 5;
	  else if (error >= e2) step1 *= 2;
	  return stop < start ? -step1 : step1;
	}

	function sturges(values) {
	  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
	}

	function histogram() {
	  var value = identity,
	      domain = extent,
	      threshold = sturges;

	  function histogram(data) {
	    var i,
	        n = data.length,
	        x,
	        values = new Array(n);

	    for (i = 0; i < n; ++i) {
	      values[i] = value(data[i], i, data);
	    }

	    var xz = domain(values),
	        x0 = xz[0],
	        x1 = xz[1],
	        tz = threshold(values, x0, x1);

	    // Convert number of thresholds into uniform thresholds.
	    if (!Array.isArray(tz)) {
	      tz = tickStep(x0, x1, tz);
	      tz = range(Math.ceil(x0 / tz) * tz, x1, tz); // exclusive
	    }

	    // Remove any thresholds outside the domain.
	    var m = tz.length;
	    while (tz[0] <= x0) tz.shift(), --m;
	    while (tz[m - 1] > x1) tz.pop(), --m;

	    var bins = new Array(m + 1),
	        bin;

	    // Initialize bins.
	    for (i = 0; i <= m; ++i) {
	      bin = bins[i] = [];
	      bin.x0 = i > 0 ? tz[i - 1] : x0;
	      bin.x1 = i < m ? tz[i] : x1;
	    }

	    // Assign data to bins by value, ignoring any outside the domain.
	    for (i = 0; i < n; ++i) {
	      x = values[i];
	      if (x0 <= x && x <= x1) {
	        bins[bisectRight(tz, x, 0, m)].push(data[i]);
	      }
	    }

	    return bins;
	  }

	  histogram.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
	  };

	  histogram.domain = function(_) {
	    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
	  };

	  histogram.thresholds = function(_) {
	    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
	  };

	  return histogram;
	}

	function quantile(values, p, valueof) {
	  if (valueof == null) valueof = number;
	  if (!(n = values.length)) return;
	  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
	  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = +valueof(values[i0], i0, values),
	      value1 = +valueof(values[i0 + 1], i0 + 1, values);
	  return value0 + (value1 - value0) * (i - i0);
	}

	function freedmanDiaconis(values, min, max) {
	  values = map.call(values, number).sort(ascending);
	  return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
	}

	function scott(values, min, max) {
	  return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
	}

	function max(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  return max;
	}

	function mean(values, valueof) {
	  var n = values.length,
	      m = n,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) sum += value;
	      else --m;
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
	      else --m;
	    }
	  }

	  if (m) return sum / m;
	}

	function median(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      numbers = [];

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) {
	        numbers.push(value);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) {
	        numbers.push(value);
	      }
	    }
	  }

	  return quantile(numbers.sort(ascending), 0.5);
	}

	function merge(arrays) {
	  var n = arrays.length,
	      m,
	      i = -1,
	      j = 0,
	      merged,
	      array;

	  while (++i < n) j += arrays[i].length;
	  merged = new Array(j);

	  while (--n >= 0) {
	    array = arrays[n];
	    m = array.length;
	    while (--m >= 0) {
	      merged[--j] = array[m];
	    }
	  }

	  return merged;
	}

	function min(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  return min;
	}

	function permute(array, indexes) {
	  var i = indexes.length, permutes = new Array(i);
	  while (i--) permutes[i] = array[indexes[i]];
	  return permutes;
	}

	function scan(values, compare) {
	  if (!(n = values.length)) return;
	  var n,
	      i = 0,
	      j = 0,
	      xi,
	      xj = values[j];

	  if (compare == null) compare = ascending;

	  while (++i < n) {
	    if (compare(xi = values[i], xj) < 0 || compare(xj, xj) !== 0) {
	      xj = xi, j = i;
	    }
	  }

	  if (compare(xj, xj) === 0) return j;
	}

	function shuffle(array, i0, i1) {
	  var m = (i1 == null ? array.length : i1) - (i0 = i0 == null ? 0 : +i0),
	      t,
	      i;

	  while (m) {
	    i = Math.random() * m-- | 0;
	    t = array[m + i0];
	    array[m + i0] = array[i + i0];
	    array[i + i0] = t;
	  }

	  return array;
	}

	function sum(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (value = +values[i]) sum += value; // Note: zero and null are equivalent.
	    }
	  }

	  else {
	    while (++i < n) {
	      if (value = +valueof(values[i], i, values)) sum += value;
	    }
	  }

	  return sum;
	}

	function transpose(matrix) {
	  if (!(n = matrix.length)) return [];
	  for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
	    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
	      row[j] = matrix[j][i];
	    }
	  }
	  return transpose;
	}

	function length(d) {
	  return d.length;
	}

	function zip() {
	  return transpose(arguments);
	}

	exports.bisect = bisectRight;
	exports.bisectRight = bisectRight;
	exports.bisectLeft = bisectLeft;
	exports.ascending = ascending;
	exports.bisector = bisector;
	exports.cross = cross;
	exports.descending = descending;
	exports.deviation = deviation;
	exports.extent = extent;
	exports.histogram = histogram;
	exports.thresholdFreedmanDiaconis = freedmanDiaconis;
	exports.thresholdScott = scott;
	exports.thresholdSturges = sturges;
	exports.max = max;
	exports.mean = mean;
	exports.median = median;
	exports.merge = merge;
	exports.min = min;
	exports.pairs = pairs;
	exports.permute = permute;
	exports.quantile = quantile;
	exports.range = range;
	exports.scan = scan;
	exports.shuffle = shuffle;
	exports.sum = sum;
	exports.ticks = ticks;
	exports.tickIncrement = tickIncrement;
	exports.tickStep = tickStep;
	exports.transpose = transpose;
	exports.variance = variance;
	exports.zip = zip;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));


/***/ }),
/* 260 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-collection/ v1.0.7 Copyright 2018 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
	}(this, (function (exports) { 'use strict';

	var prefix = "$";

	function Map() {}

	Map.prototype = map.prototype = {
	  constructor: Map,
	  has: function(key) {
	    return (prefix + key) in this;
	  },
	  get: function(key) {
	    return this[prefix + key];
	  },
	  set: function(key, value) {
	    this[prefix + key] = value;
	    return this;
	  },
	  remove: function(key) {
	    var property = prefix + key;
	    return property in this && delete this[property];
	  },
	  clear: function() {
	    for (var property in this) if (property[0] === prefix) delete this[property];
	  },
	  keys: function() {
	    var keys = [];
	    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
	    return keys;
	  },
	  values: function() {
	    var values = [];
	    for (var property in this) if (property[0] === prefix) values.push(this[property]);
	    return values;
	  },
	  entries: function() {
	    var entries = [];
	    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
	    return entries;
	  },
	  size: function() {
	    var size = 0;
	    for (var property in this) if (property[0] === prefix) ++size;
	    return size;
	  },
	  empty: function() {
	    for (var property in this) if (property[0] === prefix) return false;
	    return true;
	  },
	  each: function(f) {
	    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
	  }
	};

	function map(object, f) {
	  var map = new Map;

	  // Copy constructor.
	  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

	  // Index array by numeric index or specified key function.
	  else if (Array.isArray(object)) {
	    var i = -1,
	        n = object.length,
	        o;

	    if (f == null) while (++i < n) map.set(i, object[i]);
	    else while (++i < n) map.set(f(o = object[i], i, object), o);
	  }

	  // Convert object to map.
	  else if (object) for (var key in object) map.set(key, object[key]);

	  return map;
	}

	function nest() {
	  var keys = [],
	      sortKeys = [],
	      sortValues,
	      rollup,
	      nest;

	  function apply(array, depth, createResult, setResult) {
	    if (depth >= keys.length) {
	      if (sortValues != null) array.sort(sortValues);
	      return rollup != null ? rollup(array) : array;
	    }

	    var i = -1,
	        n = array.length,
	        key = keys[depth++],
	        keyValue,
	        value,
	        valuesByKey = map(),
	        values,
	        result = createResult();

	    while (++i < n) {
	      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
	        values.push(value);
	      } else {
	        valuesByKey.set(keyValue, [value]);
	      }
	    }

	    valuesByKey.each(function(values, key) {
	      setResult(result, key, apply(values, depth, createResult, setResult));
	    });

	    return result;
	  }

	  function entries(map$$1, depth) {
	    if (++depth > keys.length) return map$$1;
	    var array, sortKey = sortKeys[depth - 1];
	    if (rollup != null && depth >= keys.length) array = map$$1.entries();
	    else array = [], map$$1.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
	    return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
	  }

	  return nest = {
	    object: function(array) { return apply(array, 0, createObject, setObject); },
	    map: function(array) { return apply(array, 0, createMap, setMap); },
	    entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
	    key: function(d) { keys.push(d); return nest; },
	    sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
	    sortValues: function(order) { sortValues = order; return nest; },
	    rollup: function(f) { rollup = f; return nest; }
	  };
	}

	function createObject() {
	  return {};
	}

	function setObject(object, key, value) {
	  object[key] = value;
	}

	function createMap() {
	  return map();
	}

	function setMap(map$$1, key, value) {
	  map$$1.set(key, value);
	}

	function Set() {}

	var proto = map.prototype;

	Set.prototype = set.prototype = {
	  constructor: Set,
	  has: proto.has,
	  add: function(value) {
	    value += "";
	    this[prefix + value] = value;
	    return this;
	  },
	  remove: proto.remove,
	  clear: proto.clear,
	  values: proto.keys,
	  size: proto.size,
	  empty: proto.empty,
	  each: proto.each
	};

	function set(object, f) {
	  var set = new Set;

	  // Copy constructor.
	  if (object instanceof Set) object.each(function(value) { set.add(value); });

	  // Otherwise, assume it’s an array.
	  else if (object) {
	    var i = -1, n = object.length;
	    if (f == null) while (++i < n) set.add(object[i]);
	    else while (++i < n) set.add(f(object[i], i, object));
	  }

	  return set;
	}

	function keys(map) {
	  var keys = [];
	  for (var key in map) keys.push(key);
	  return keys;
	}

	function values(map) {
	  var values = [];
	  for (var key in map) values.push(map[key]);
	  return values;
	}

	function entries(map) {
	  var entries = [];
	  for (var key in map) entries.push({key: key, value: map[key]});
	  return entries;
	}

	exports.nest = nest;
	exports.set = set;
	exports.map = map;
	exports.keys = keys;
	exports.values = values;
	exports.entries = entries;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));


/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-format/ v1.4.2 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimal(1.23) returns ["123", 0].
	function formatDecimal(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	}

	function exponent(x) {
	  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
	}

	function formatGroup(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	}

	function formatNumerals(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	}

	// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
	var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	  var match;
	  return new FormatSpecifier({
	    fill: match[1],
	    align: match[2],
	    sign: match[3],
	    symbol: match[4],
	    zero: match[5],
	    width: match[6],
	    comma: match[7],
	    precision: match[8] && match[8].slice(1),
	    trim: match[9],
	    type: match[10]
	  });
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
	  this.align = specifier.align === undefined ? ">" : specifier.align + "";
	  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
	  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
	  this.zero = !!specifier.zero;
	  this.width = specifier.width === undefined ? undefined : +specifier.width;
	  this.comma = !!specifier.comma;
	  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
	  this.trim = !!specifier.trim;
	  this.type = specifier.type === undefined ? "" : specifier.type + "";
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
	      + (this.trim ? "~" : "")
	      + this.type;
	};

	// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
	function formatTrim(s) {
	  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (s[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
	    }
	  }
	  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
	}

	var prefixExponent;

	function formatPrefixAuto(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	}

	function formatRounded(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	}

	var formatTypes = {
	  "%": function(x, p) { return (x * 100).toFixed(p); },
	  "b": function(x) { return Math.round(x).toString(2); },
	  "c": function(x) { return x + ""; },
	  "d": function(x) { return Math.round(x).toString(10); },
	  "e": function(x, p) { return x.toExponential(p); },
	  "f": function(x, p) { return x.toFixed(p); },
	  "g": function(x, p) { return x.toPrecision(p); },
	  "o": function(x) { return Math.round(x).toString(8); },
	  "p": function(x, p) { return formatRounded(x * 100, p); },
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
	  "x": function(x) { return Math.round(x).toString(16); }
	};

	function identity(x) {
	  return x;
	}

	var map = Array.prototype.map,
	    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
	      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
	      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
	      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
	      numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
	      percent = locale.percent === undefined ? "%" : locale.percent + "",
	      minus = locale.minus === undefined ? "-" : locale.minus + "",
	      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        trim = specifier.trim,
	        type = specifier.type;

	    // The "n" type is an alias for ",g".
	    if (type === "n") comma = true, type = "g";

	    // The "" type, and any invalid type, is an alias for ".12~g".
	    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

	    // If zero fill is specified, padding goes after sign and before digits.
	    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision === undefined ? 6
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Perform the initial formatting.
	        var valueNegative = value < 0;
	        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

	        // Trim insignificant zeros.
	        if (trim) value = formatTrim(value);

	        // If a negative value rounds to zero during formatting, treat as positive.
	        if (valueNegative && +value === 0) valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;

	        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	}

	var locale;

	defaultLocale({
	  decimal: ".",
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""],
	  minus: "-"
	});

	function defaultLocale(definition) {
	  locale = formatLocale(definition);
	  exports.format = locale.format;
	  exports.formatPrefix = locale.formatPrefix;
	  return locale;
	}

	function precisionFixed(step) {
	  return Math.max(0, -exponent(Math.abs(step)));
	}

	function precisionPrefix(step, value) {
	  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
	}

	function precisionRound(step, max) {
	  step = Math.abs(step), max = Math.abs(max) - step;
	  return Math.max(0, exponent(max) - exponent(step)) + 1;
	}

	exports.FormatSpecifier = FormatSpecifier;
	exports.formatDefaultLocale = defaultLocale;
	exports.formatLocale = formatLocale;
	exports.formatSpecifier = formatSpecifier;
	exports.precisionFixed = precisionFixed;
	exports.precisionPrefix = precisionPrefix;
	exports.precisionRound = precisionRound;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-time/ v1.1.0 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	var t0 = new Date,
	    t1 = new Date;

	function newInterval(floori, offseti, count, field) {

	  function interval(date) {
	    return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
	  }

	  interval.floor = function(date) {
	    return floori(date = new Date(+date)), date;
	  };

	  interval.ceil = function(date) {
	    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
	  };

	  interval.round = function(date) {
	    var d0 = interval(date),
	        d1 = interval.ceil(date);
	    return date - d0 < d1 - date ? d0 : d1;
	  };

	  interval.offset = function(date, step) {
	    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
	  };

	  interval.range = function(start, stop, step) {
	    var range = [], previous;
	    start = interval.ceil(start);
	    step = step == null ? 1 : Math.floor(step);
	    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
	    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
	    while (previous < start && start < stop);
	    return range;
	  };

	  interval.filter = function(test) {
	    return newInterval(function(date) {
	      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
	    }, function(date, step) {
	      if (date >= date) {
	        if (step < 0) while (++step <= 0) {
	          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
	        } else while (--step >= 0) {
	          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
	        }
	      }
	    });
	  };

	  if (count) {
	    interval.count = function(start, end) {
	      t0.setTime(+start), t1.setTime(+end);
	      floori(t0), floori(t1);
	      return Math.floor(count(t0, t1));
	    };

	    interval.every = function(step) {
	      step = Math.floor(step);
	      return !isFinite(step) || !(step > 0) ? null
	          : !(step > 1) ? interval
	          : interval.filter(field
	              ? function(d) { return field(d) % step === 0; }
	              : function(d) { return interval.count(0, d) % step === 0; });
	    };
	  }

	  return interval;
	}

	var millisecond = newInterval(function() {
	  // noop
	}, function(date, step) {
	  date.setTime(+date + step);
	}, function(start, end) {
	  return end - start;
	});

	// An optimized implementation for this simple case.
	millisecond.every = function(k) {
	  k = Math.floor(k);
	  if (!isFinite(k) || !(k > 0)) return null;
	  if (!(k > 1)) return millisecond;
	  return newInterval(function(date) {
	    date.setTime(Math.floor(date / k) * k);
	  }, function(date, step) {
	    date.setTime(+date + step * k);
	  }, function(start, end) {
	    return (end - start) / k;
	  });
	};
	var milliseconds = millisecond.range;

	var durationSecond = 1e3;
	var durationMinute = 6e4;
	var durationHour = 36e5;
	var durationDay = 864e5;
	var durationWeek = 6048e5;

	var second = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds());
	}, function(date, step) {
	  date.setTime(+date + step * durationSecond);
	}, function(start, end) {
	  return (end - start) / durationSecond;
	}, function(date) {
	  return date.getUTCSeconds();
	});
	var seconds = second.range;

	var minute = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getMinutes();
	});
	var minutes = minute.range;

	var hour = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getHours();
	});
	var hours = hour.range;

	var day = newInterval(function(date) {
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setDate(date.getDate() + step);
	}, function(start, end) {
	  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
	}, function(date) {
	  return date.getDate() - 1;
	});
	var days = day.range;

	function weekday(i) {
	  return newInterval(function(date) {
	    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setDate(date.getDate() + step * 7);
	  }, function(start, end) {
	    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
	  });
	}

	var sunday = weekday(0);
	var monday = weekday(1);
	var tuesday = weekday(2);
	var wednesday = weekday(3);
	var thursday = weekday(4);
	var friday = weekday(5);
	var saturday = weekday(6);

	var sundays = sunday.range;
	var mondays = monday.range;
	var tuesdays = tuesday.range;
	var wednesdays = wednesday.range;
	var thursdays = thursday.range;
	var fridays = friday.range;
	var saturdays = saturday.range;

	var month = newInterval(function(date) {
	  date.setDate(1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setMonth(date.getMonth() + step);
	}, function(start, end) {
	  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
	}, function(date) {
	  return date.getMonth();
	});
	var months = month.range;

	var year = newInterval(function(date) {
	  date.setMonth(0, 1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setFullYear(date.getFullYear() + step);
	}, function(start, end) {
	  return end.getFullYear() - start.getFullYear();
	}, function(date) {
	  return date.getFullYear();
	});

	// An optimized implementation for this simple case.
	year.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
	    date.setMonth(0, 1);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setFullYear(date.getFullYear() + step * k);
	  });
	};
	var years = year.range;

	var utcMinute = newInterval(function(date) {
	  date.setUTCSeconds(0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getUTCMinutes();
	});
	var utcMinutes = utcMinute.range;

	var utcHour = newInterval(function(date) {
	  date.setUTCMinutes(0, 0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getUTCHours();
	});
	var utcHours = utcHour.range;

	var utcDay = newInterval(function(date) {
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCDate(date.getUTCDate() + step);
	}, function(start, end) {
	  return (end - start) / durationDay;
	}, function(date) {
	  return date.getUTCDate() - 1;
	});
	var utcDays = utcDay.range;

	function utcWeekday(i) {
	  return newInterval(function(date) {
	    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCDate(date.getUTCDate() + step * 7);
	  }, function(start, end) {
	    return (end - start) / durationWeek;
	  });
	}

	var utcSunday = utcWeekday(0);
	var utcMonday = utcWeekday(1);
	var utcTuesday = utcWeekday(2);
	var utcWednesday = utcWeekday(3);
	var utcThursday = utcWeekday(4);
	var utcFriday = utcWeekday(5);
	var utcSaturday = utcWeekday(6);

	var utcSundays = utcSunday.range;
	var utcMondays = utcMonday.range;
	var utcTuesdays = utcTuesday.range;
	var utcWednesdays = utcWednesday.range;
	var utcThursdays = utcThursday.range;
	var utcFridays = utcFriday.range;
	var utcSaturdays = utcSaturday.range;

	var utcMonth = newInterval(function(date) {
	  date.setUTCDate(1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCMonth(date.getUTCMonth() + step);
	}, function(start, end) {
	  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
	}, function(date) {
	  return date.getUTCMonth();
	});
	var utcMonths = utcMonth.range;

	var utcYear = newInterval(function(date) {
	  date.setUTCMonth(0, 1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCFullYear(date.getUTCFullYear() + step);
	}, function(start, end) {
	  return end.getUTCFullYear() - start.getUTCFullYear();
	}, function(date) {
	  return date.getUTCFullYear();
	});

	// An optimized implementation for this simple case.
	utcYear.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
	    date.setUTCMonth(0, 1);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCFullYear(date.getUTCFullYear() + step * k);
	  });
	};
	var utcYears = utcYear.range;

	exports.timeDay = day;
	exports.timeDays = days;
	exports.timeFriday = friday;
	exports.timeFridays = fridays;
	exports.timeHour = hour;
	exports.timeHours = hours;
	exports.timeInterval = newInterval;
	exports.timeMillisecond = millisecond;
	exports.timeMilliseconds = milliseconds;
	exports.timeMinute = minute;
	exports.timeMinutes = minutes;
	exports.timeMonday = monday;
	exports.timeMondays = mondays;
	exports.timeMonth = month;
	exports.timeMonths = months;
	exports.timeSaturday = saturday;
	exports.timeSaturdays = saturdays;
	exports.timeSecond = second;
	exports.timeSeconds = seconds;
	exports.timeSunday = sunday;
	exports.timeSundays = sundays;
	exports.timeThursday = thursday;
	exports.timeThursdays = thursdays;
	exports.timeTuesday = tuesday;
	exports.timeTuesdays = tuesdays;
	exports.timeWednesday = wednesday;
	exports.timeWednesdays = wednesdays;
	exports.timeWeek = sunday;
	exports.timeWeeks = sundays;
	exports.timeYear = year;
	exports.timeYears = years;
	exports.utcDay = utcDay;
	exports.utcDays = utcDays;
	exports.utcFriday = utcFriday;
	exports.utcFridays = utcFridays;
	exports.utcHour = utcHour;
	exports.utcHours = utcHours;
	exports.utcMillisecond = millisecond;
	exports.utcMilliseconds = milliseconds;
	exports.utcMinute = utcMinute;
	exports.utcMinutes = utcMinutes;
	exports.utcMonday = utcMonday;
	exports.utcMondays = utcMondays;
	exports.utcMonth = utcMonth;
	exports.utcMonths = utcMonths;
	exports.utcSaturday = utcSaturday;
	exports.utcSaturdays = utcSaturdays;
	exports.utcSecond = second;
	exports.utcSeconds = seconds;
	exports.utcSunday = utcSunday;
	exports.utcSundays = utcSundays;
	exports.utcThursday = utcThursday;
	exports.utcThursdays = utcThursdays;
	exports.utcTuesday = utcTuesday;
	exports.utcTuesdays = utcTuesdays;
	exports.utcWednesday = utcWednesday;
	exports.utcWednesdays = utcWednesdays;
	exports.utcWeek = utcSunday;
	exports.utcWeeks = utcSundays;
	exports.utcYear = utcYear;
	exports.utcYears = utcYears;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 263 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-time-format/ v2.2.2 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports, __webpack_require__(262)) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-time'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
	}(this, function (exports, d3Time) { 'use strict';

	function localDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
	    date.setFullYear(d.y);
	    return date;
	  }
	  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
	}

	function utcDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
	    date.setUTCFullYear(d.y);
	    return date;
	  }
	  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
	}

	function newDate(y, m, d) {
	  return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
	}

	function formatLocale(locale) {
	  var locale_dateTime = locale.dateTime,
	      locale_date = locale.date,
	      locale_time = locale.time,
	      locale_periods = locale.periods,
	      locale_weekdays = locale.days,
	      locale_shortWeekdays = locale.shortDays,
	      locale_months = locale.months,
	      locale_shortMonths = locale.shortMonths;

	  var periodRe = formatRe(locale_periods),
	      periodLookup = formatLookup(locale_periods),
	      weekdayRe = formatRe(locale_weekdays),
	      weekdayLookup = formatLookup(locale_weekdays),
	      shortWeekdayRe = formatRe(locale_shortWeekdays),
	      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
	      monthRe = formatRe(locale_months),
	      monthLookup = formatLookup(locale_months),
	      shortMonthRe = formatRe(locale_shortMonths),
	      shortMonthLookup = formatLookup(locale_shortMonths);

	  var formats = {
	    "a": formatShortWeekday,
	    "A": formatWeekday,
	    "b": formatShortMonth,
	    "B": formatMonth,
	    "c": null,
	    "d": formatDayOfMonth,
	    "e": formatDayOfMonth,
	    "f": formatMicroseconds,
	    "H": formatHour24,
	    "I": formatHour12,
	    "j": formatDayOfYear,
	    "L": formatMilliseconds,
	    "m": formatMonthNumber,
	    "M": formatMinutes,
	    "p": formatPeriod,
	    "q": formatQuarter,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatSeconds,
	    "u": formatWeekdayNumberMonday,
	    "U": formatWeekNumberSunday,
	    "V": formatWeekNumberISO,
	    "w": formatWeekdayNumberSunday,
	    "W": formatWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatYear,
	    "Y": formatFullYear,
	    "Z": formatZone,
	    "%": formatLiteralPercent
	  };

	  var utcFormats = {
	    "a": formatUTCShortWeekday,
	    "A": formatUTCWeekday,
	    "b": formatUTCShortMonth,
	    "B": formatUTCMonth,
	    "c": null,
	    "d": formatUTCDayOfMonth,
	    "e": formatUTCDayOfMonth,
	    "f": formatUTCMicroseconds,
	    "H": formatUTCHour24,
	    "I": formatUTCHour12,
	    "j": formatUTCDayOfYear,
	    "L": formatUTCMilliseconds,
	    "m": formatUTCMonthNumber,
	    "M": formatUTCMinutes,
	    "p": formatUTCPeriod,
	    "q": formatUTCQuarter,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatUTCSeconds,
	    "u": formatUTCWeekdayNumberMonday,
	    "U": formatUTCWeekNumberSunday,
	    "V": formatUTCWeekNumberISO,
	    "w": formatUTCWeekdayNumberSunday,
	    "W": formatUTCWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatUTCYear,
	    "Y": formatUTCFullYear,
	    "Z": formatUTCZone,
	    "%": formatLiteralPercent
	  };

	  var parses = {
	    "a": parseShortWeekday,
	    "A": parseWeekday,
	    "b": parseShortMonth,
	    "B": parseMonth,
	    "c": parseLocaleDateTime,
	    "d": parseDayOfMonth,
	    "e": parseDayOfMonth,
	    "f": parseMicroseconds,
	    "H": parseHour24,
	    "I": parseHour24,
	    "j": parseDayOfYear,
	    "L": parseMilliseconds,
	    "m": parseMonthNumber,
	    "M": parseMinutes,
	    "p": parsePeriod,
	    "q": parseQuarter,
	    "Q": parseUnixTimestamp,
	    "s": parseUnixTimestampSeconds,
	    "S": parseSeconds,
	    "u": parseWeekdayNumberMonday,
	    "U": parseWeekNumberSunday,
	    "V": parseWeekNumberISO,
	    "w": parseWeekdayNumberSunday,
	    "W": parseWeekNumberMonday,
	    "x": parseLocaleDate,
	    "X": parseLocaleTime,
	    "y": parseYear,
	    "Y": parseFullYear,
	    "Z": parseZone,
	    "%": parseLiteralPercent
	  };

	  // These recursive directive definitions must be deferred.
	  formats.x = newFormat(locale_date, formats);
	  formats.X = newFormat(locale_time, formats);
	  formats.c = newFormat(locale_dateTime, formats);
	  utcFormats.x = newFormat(locale_date, utcFormats);
	  utcFormats.X = newFormat(locale_time, utcFormats);
	  utcFormats.c = newFormat(locale_dateTime, utcFormats);

	  function newFormat(specifier, formats) {
	    return function(date) {
	      var string = [],
	          i = -1,
	          j = 0,
	          n = specifier.length,
	          c,
	          pad,
	          format;

	      if (!(date instanceof Date)) date = new Date(+date);

	      while (++i < n) {
	        if (specifier.charCodeAt(i) === 37) {
	          string.push(specifier.slice(j, i));
	          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
	          else pad = c === "e" ? " " : "0";
	          if (format = formats[c]) c = format(date, pad);
	          string.push(c);
	          j = i + 1;
	        }
	      }

	      string.push(specifier.slice(j, i));
	      return string.join("");
	    };
	  }

	  function newParse(specifier, Z) {
	    return function(string) {
	      var d = newDate(1900, undefined, 1),
	          i = parseSpecifier(d, specifier, string += "", 0),
	          week, day;
	      if (i != string.length) return null;

	      // If a UNIX timestamp is specified, return it.
	      if ("Q" in d) return new Date(d.Q);
	      if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

	      // If this is utcParse, never use the local timezone.
	      if (Z && !("Z" in d)) d.Z = 0;

	      // The am-pm flag is 0 for AM, and 1 for PM.
	      if ("p" in d) d.H = d.H % 12 + d.p * 12;

	      // If the month was not specified, inherit from the quarter.
	      if (d.m === undefined) d.m = "q" in d ? d.q : 0;

	      // Convert day-of-week and week-of-year to day-of-year.
	      if ("V" in d) {
	        if (d.V < 1 || d.V > 53) return null;
	        if (!("w" in d)) d.w = 1;
	        if ("Z" in d) {
	          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
	          week = day > 4 || day === 0 ? d3Time.utcMonday.ceil(week) : d3Time.utcMonday(week);
	          week = d3Time.utcDay.offset(week, (d.V - 1) * 7);
	          d.y = week.getUTCFullYear();
	          d.m = week.getUTCMonth();
	          d.d = week.getUTCDate() + (d.w + 6) % 7;
	        } else {
	          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
	          week = day > 4 || day === 0 ? d3Time.timeMonday.ceil(week) : d3Time.timeMonday(week);
	          week = d3Time.timeDay.offset(week, (d.V - 1) * 7);
	          d.y = week.getFullYear();
	          d.m = week.getMonth();
	          d.d = week.getDate() + (d.w + 6) % 7;
	        }
	      } else if ("W" in d || "U" in d) {
	        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
	        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
	        d.m = 0;
	        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
	      }

	      // If a time zone is specified, all fields are interpreted as UTC and then
	      // offset according to the specified time zone.
	      if ("Z" in d) {
	        d.H += d.Z / 100 | 0;
	        d.M += d.Z % 100;
	        return utcDate(d);
	      }

	      // Otherwise, all fields are in local time.
	      return localDate(d);
	    };
	  }

	  function parseSpecifier(d, specifier, string, j) {
	    var i = 0,
	        n = specifier.length,
	        m = string.length,
	        c,
	        parse;

	    while (i < n) {
	      if (j >= m) return -1;
	      c = specifier.charCodeAt(i++);
	      if (c === 37) {
	        c = specifier.charAt(i++);
	        parse = parses[c in pads ? specifier.charAt(i++) : c];
	        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
	      } else if (c != string.charCodeAt(j++)) {
	        return -1;
	      }
	    }

	    return j;
	  }

	  function parsePeriod(d, string, i) {
	    var n = periodRe.exec(string.slice(i));
	    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortWeekday(d, string, i) {
	    var n = shortWeekdayRe.exec(string.slice(i));
	    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseWeekday(d, string, i) {
	    var n = weekdayRe.exec(string.slice(i));
	    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortMonth(d, string, i) {
	    var n = shortMonthRe.exec(string.slice(i));
	    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseMonth(d, string, i) {
	    var n = monthRe.exec(string.slice(i));
	    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseLocaleDateTime(d, string, i) {
	    return parseSpecifier(d, locale_dateTime, string, i);
	  }

	  function parseLocaleDate(d, string, i) {
	    return parseSpecifier(d, locale_date, string, i);
	  }

	  function parseLocaleTime(d, string, i) {
	    return parseSpecifier(d, locale_time, string, i);
	  }

	  function formatShortWeekday(d) {
	    return locale_shortWeekdays[d.getDay()];
	  }

	  function formatWeekday(d) {
	    return locale_weekdays[d.getDay()];
	  }

	  function formatShortMonth(d) {
	    return locale_shortMonths[d.getMonth()];
	  }

	  function formatMonth(d) {
	    return locale_months[d.getMonth()];
	  }

	  function formatPeriod(d) {
	    return locale_periods[+(d.getHours() >= 12)];
	  }

	  function formatQuarter(d) {
	    return 1 + ~~(d.getMonth() / 3);
	  }

	  function formatUTCShortWeekday(d) {
	    return locale_shortWeekdays[d.getUTCDay()];
	  }

	  function formatUTCWeekday(d) {
	    return locale_weekdays[d.getUTCDay()];
	  }

	  function formatUTCShortMonth(d) {
	    return locale_shortMonths[d.getUTCMonth()];
	  }

	  function formatUTCMonth(d) {
	    return locale_months[d.getUTCMonth()];
	  }

	  function formatUTCPeriod(d) {
	    return locale_periods[+(d.getUTCHours() >= 12)];
	  }

	  function formatUTCQuarter(d) {
	    return 1 + ~~(d.getUTCMonth() / 3);
	  }

	  return {
	    format: function(specifier) {
	      var f = newFormat(specifier += "", formats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    parse: function(specifier) {
	      var p = newParse(specifier += "", false);
	      p.toString = function() { return specifier; };
	      return p;
	    },
	    utcFormat: function(specifier) {
	      var f = newFormat(specifier += "", utcFormats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    utcParse: function(specifier) {
	      var p = newParse(specifier += "", true);
	      p.toString = function() { return specifier; };
	      return p;
	    }
	  };
	}

	var pads = {"-": "", "_": " ", "0": "0"},
	    numberRe = /^\s*\d+/, // note: ignores next directive
	    percentRe = /^%/,
	    requoteRe = /[\\^$*+?|[\]().{}]/g;

	function pad(value, fill, width) {
	  var sign = value < 0 ? "-" : "",
	      string = (sign ? -value : value) + "",
	      length = string.length;
	  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	}

	function requote(s) {
	  return s.replace(requoteRe, "\\$&");
	}

	function formatRe(names) {
	  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
	}

	function formatLookup(names) {
	  var map = {}, i = -1, n = names.length;
	  while (++i < n) map[names[i].toLowerCase()] = i;
	  return map;
	}

	function parseWeekdayNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.w = +n[0], i + n[0].length) : -1;
	}

	function parseWeekdayNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.u = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.U = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberISO(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.V = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.W = +n[0], i + n[0].length) : -1;
	}

	function parseFullYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 4));
	  return n ? (d.y = +n[0], i + n[0].length) : -1;
	}

	function parseYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
	}

	function parseZone(d, string, i) {
	  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
	  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
	}

	function parseQuarter(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
	}

	function parseMonthNumber(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
	}

	function parseDayOfMonth(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.d = +n[0], i + n[0].length) : -1;
	}

	function parseDayOfYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
	}

	function parseHour24(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.H = +n[0], i + n[0].length) : -1;
	}

	function parseMinutes(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.M = +n[0], i + n[0].length) : -1;
	}

	function parseSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.S = +n[0], i + n[0].length) : -1;
	}

	function parseMilliseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.L = +n[0], i + n[0].length) : -1;
	}

	function parseMicroseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 6));
	  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
	}

	function parseLiteralPercent(d, string, i) {
	  var n = percentRe.exec(string.slice(i, i + 1));
	  return n ? i + n[0].length : -1;
	}

	function parseUnixTimestamp(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.Q = +n[0], i + n[0].length) : -1;
	}

	function parseUnixTimestampSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.s = +n[0], i + n[0].length) : -1;
	}

	function formatDayOfMonth(d, p) {
	  return pad(d.getDate(), p, 2);
	}

	function formatHour24(d, p) {
	  return pad(d.getHours(), p, 2);
	}

	function formatHour12(d, p) {
	  return pad(d.getHours() % 12 || 12, p, 2);
	}

	function formatDayOfYear(d, p) {
	  return pad(1 + d3Time.timeDay.count(d3Time.timeYear(d), d), p, 3);
	}

	function formatMilliseconds(d, p) {
	  return pad(d.getMilliseconds(), p, 3);
	}

	function formatMicroseconds(d, p) {
	  return formatMilliseconds(d, p) + "000";
	}

	function formatMonthNumber(d, p) {
	  return pad(d.getMonth() + 1, p, 2);
	}

	function formatMinutes(d, p) {
	  return pad(d.getMinutes(), p, 2);
	}

	function formatSeconds(d, p) {
	  return pad(d.getSeconds(), p, 2);
	}

	function formatWeekdayNumberMonday(d) {
	  var day = d.getDay();
	  return day === 0 ? 7 : day;
	}

	function formatWeekNumberSunday(d, p) {
	  return pad(d3Time.timeSunday.count(d3Time.timeYear(d) - 1, d), p, 2);
	}

	function formatWeekNumberISO(d, p) {
	  var day = d.getDay();
	  d = (day >= 4 || day === 0) ? d3Time.timeThursday(d) : d3Time.timeThursday.ceil(d);
	  return pad(d3Time.timeThursday.count(d3Time.timeYear(d), d) + (d3Time.timeYear(d).getDay() === 4), p, 2);
	}

	function formatWeekdayNumberSunday(d) {
	  return d.getDay();
	}

	function formatWeekNumberMonday(d, p) {
	  return pad(d3Time.timeMonday.count(d3Time.timeYear(d) - 1, d), p, 2);
	}

	function formatYear(d, p) {
	  return pad(d.getFullYear() % 100, p, 2);
	}

	function formatFullYear(d, p) {
	  return pad(d.getFullYear() % 10000, p, 4);
	}

	function formatZone(d) {
	  var z = d.getTimezoneOffset();
	  return (z > 0 ? "-" : (z *= -1, "+"))
	      + pad(z / 60 | 0, "0", 2)
	      + pad(z % 60, "0", 2);
	}

	function formatUTCDayOfMonth(d, p) {
	  return pad(d.getUTCDate(), p, 2);
	}

	function formatUTCHour24(d, p) {
	  return pad(d.getUTCHours(), p, 2);
	}

	function formatUTCHour12(d, p) {
	  return pad(d.getUTCHours() % 12 || 12, p, 2);
	}

	function formatUTCDayOfYear(d, p) {
	  return pad(1 + d3Time.utcDay.count(d3Time.utcYear(d), d), p, 3);
	}

	function formatUTCMilliseconds(d, p) {
	  return pad(d.getUTCMilliseconds(), p, 3);
	}

	function formatUTCMicroseconds(d, p) {
	  return formatUTCMilliseconds(d, p) + "000";
	}

	function formatUTCMonthNumber(d, p) {
	  return pad(d.getUTCMonth() + 1, p, 2);
	}

	function formatUTCMinutes(d, p) {
	  return pad(d.getUTCMinutes(), p, 2);
	}

	function formatUTCSeconds(d, p) {
	  return pad(d.getUTCSeconds(), p, 2);
	}

	function formatUTCWeekdayNumberMonday(d) {
	  var dow = d.getUTCDay();
	  return dow === 0 ? 7 : dow;
	}

	function formatUTCWeekNumberSunday(d, p) {
	  return pad(d3Time.utcSunday.count(d3Time.utcYear(d) - 1, d), p, 2);
	}

	function formatUTCWeekNumberISO(d, p) {
	  var day = d.getUTCDay();
	  d = (day >= 4 || day === 0) ? d3Time.utcThursday(d) : d3Time.utcThursday.ceil(d);
	  return pad(d3Time.utcThursday.count(d3Time.utcYear(d), d) + (d3Time.utcYear(d).getUTCDay() === 4), p, 2);
	}

	function formatUTCWeekdayNumberSunday(d) {
	  return d.getUTCDay();
	}

	function formatUTCWeekNumberMonday(d, p) {
	  return pad(d3Time.utcMonday.count(d3Time.utcYear(d) - 1, d), p, 2);
	}

	function formatUTCYear(d, p) {
	  return pad(d.getUTCFullYear() % 100, p, 2);
	}

	function formatUTCFullYear(d, p) {
	  return pad(d.getUTCFullYear() % 10000, p, 4);
	}

	function formatUTCZone() {
	  return "+0000";
	}

	function formatLiteralPercent() {
	  return "%";
	}

	function formatUnixTimestamp(d) {
	  return +d;
	}

	function formatUnixTimestampSeconds(d) {
	  return Math.floor(+d / 1000);
	}

	var locale;

	defaultLocale({
	  dateTime: "%x, %X",
	  date: "%-m/%-d/%Y",
	  time: "%-I:%M:%S %p",
	  periods: ["AM", "PM"],
	  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	});

	function defaultLocale(definition) {
	  locale = formatLocale(definition);
	  exports.timeFormat = locale.format;
	  exports.timeParse = locale.parse;
	  exports.utcFormat = locale.utcFormat;
	  exports.utcParse = locale.utcParse;
	  return locale;
	}

	var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

	function formatIsoNative(date) {
	  return date.toISOString();
	}

	var formatIso = Date.prototype.toISOString
	    ? formatIsoNative
	    : exports.utcFormat(isoSpecifier);

	function parseIsoNative(string) {
	  var date = new Date(string);
	  return isNaN(date) ? null : date;
	}

	var parseIso = +new Date("2000-01-01T00:00:00.000Z")
	    ? parseIsoNative
	    : exports.utcParse(isoSpecifier);

	exports.isoFormat = formatIso;
	exports.isoParse = parseIso;
	exports.timeFormatDefaultLocale = defaultLocale;
	exports.timeFormatLocale = formatLocale;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ }),
/* 264 */
/***/ (function(module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/* eslint-disable func-style */
	exports.default = {
	  continuousTransitions: function () {
	    return {
	      onLoad: {
	        duration: 2000
	      },
	      onExit: {
	        duration: 500
	      },
	      onEnter: {
	        duration: 500
	      }
	    };
	  },
	  continuousPolarTransitions: function () {
	    return {
	      onLoad: {
	        duration: 2000,
	        before: function () {
	          return { _y: 0, _y1: 0, _y0: 0 };
	        },
	        after: function (datum) {
	          return { _y: datum._y, _y1: datum._y1, _y0: datum._y0 };
	        }
	      },
	      onExit: {
	        duration: 500,
	        before: function (datum, index, data) {
	          var adjacent = function (attr) {
	            var adj = index === 0 ? data[index + 1] : data[index - 1];
	            return adj[attr];
	          };
	          return { _x: adjacent("_x"), _y: adjacent("_y"), _y0: adjacent("_y0") };
	        }
	      },
	      onEnter: {
	        duration: 500,
	        before: function (datum, index, data) {
	          var adjacent = function (attr) {
	            var adj = index === 0 ? data[index + 1] : data[index - 1];
	            return adj[attr];
	          };
	          return { _x: adjacent("_x"), _y: adjacent("_y"), _y0: adjacent("_y0") };
	        },
	        after: function (datum) {
	          return { _x: datum._x, _y: datum._y, _y1: datum._y1, _y0: datum._y0 };
	        }
	      }
	    };
	  },
	  discreteTransitions: function () {
	    return {
	      onLoad: {
	        duration: 2000,
	        before: function () {
	          return { opacity: 0 };
	        },
	        after: function (datum) {
	          return datum;
	        }
	      },
	      onExit: {
	        duration: 600,
	        before: function () {
	          return { opacity: 0 };
	        }
	      },
	      onEnter: {
	        duration: 600,
	        before: function () {
	          return { opacity: 0 };
	        },
	        after: function (datum) {
	          return datum;
	        }
	      }
	    };
	  }
	};

/***/ }),
/* 265 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _sortedUniq2 = __webpack_require__(266);

	var _sortedUniq3 = _interopRequireDefault(_sortedUniq2);

	var _isPlainObject2 = __webpack_require__(54);

	var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

	var _includes2 = __webpack_require__(257);

	var _includes3 = _interopRequireDefault(_includes2);

	var _flatten2 = __webpack_require__(110);

	var _flatten3 = _interopRequireDefault(_flatten2);

	var _data = __webpack_require__(246);

	var _data2 = _interopRequireDefault(_data);

	var _scale = __webpack_require__(256);

	var _scale2 = _interopRequireDefault(_scale);

	var _helpers = __webpack_require__(191);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	exports.default = {

	  /**
	   * Returns a domain for a given axis based on props, catefory, or data
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} the domain for the given axis
	   */
	  getDomain: function (props, axis) {
	    var propsDomain = this.getDomainFromProps(props, axis);
	    if (propsDomain) {
	      return this.padDomain(propsDomain, props, axis);
	    }
	    var categoryDomain = this.getDomainFromCategories(props, axis);
	    if (categoryDomain) {
	      return this.padDomain(categoryDomain, props, axis);
	    }
	    var dataset = _data2.default.getData(props);
	    var domain = this.getDomainFromData(props, axis, dataset);
	    return this.cleanDomain(this.padDomain(domain, props, axis), props, axis);
	  },


	  /**
	   * Returns the cleaned domain. Some scale types break when certain data is supplied.
	   * This method will replace elements in the domain that break certain scales.
	   * So far this method only removes zeroes for log scales
	   * @param {Array} domain: the original domain
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} the cleaned domain
	   */
	  cleanDomain: function (domain, props, axis) {
	    var scaleType = _scale2.default.getScaleType(props, axis);

	    if (scaleType !== "log") {
	      return domain;
	    }

	    var rules = function (dom) {
	      var almostZero = dom[0] < 0 || dom[1] < 0 ? -1 / Number.MAX_SAFE_INTEGER : 1 / Number.MAX_SAFE_INTEGER;
	      var domainOne = dom[0] === 0 ? almostZero : dom[0];
	      var domainTwo = dom[1] === 0 ? almostZero : dom[1];
	      return [domainOne, domainTwo];
	    };

	    return rules(domain);
	  },


	  /**
	   * Returns a domain for a given axis. This method forces the domain to include
	   * zero unless the deomain is explicitly specified in props.
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} the domain for the given axis
	   */
	  getDomainWithZero: function (props, axis) {
	    var _this = this;

	    var propsDomain = this.getDomainFromProps(props, axis);
	    if (propsDomain) {
	      return this.cleanDomain(this.padDomain(propsDomain, props, axis), props, axis);
	    }
	    var horizontal = props.horizontal;

	    var ensureZero = function (domain) {
	      var isDependent = axis === "y" && !horizontal || axis === "x" && horizontal;
	      var min = _collection2.default.getMinValue(domain, 0);
	      var max = _collection2.default.getMaxValue(domain, 0);
	      var zeroDomain = isDependent ? [min, max] : domain;
	      return _this.padDomain(zeroDomain, props, axis);
	    };
	    var categoryDomain = this.getDomainFromCategories(props, axis);
	    if (categoryDomain) {
	      return this.cleanDomain(this.padDomain(ensureZero(categoryDomain), props, axis), props, axis);
	    }
	    var dataset = _data2.default.getData(props);
	    var domain = ensureZero(this.getDomainFromData(props, axis, dataset));
	    return this.cleanDomain(this.padDomain(domain, props, axis), props, axis);
	  },


	  /**
	   * Returns a the domain for a given axis if domain is given in props
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array|undefined} the domain based on props
	   */
	  getDomainFromProps: function (props, axis) {
	    if (props.domain && props.domain[axis]) {
	      return props.domain[axis];
	    } else if (props.domain && Array.isArray(props.domain)) {
	      return props.domain;
	    }
	    return undefined;
	  },


	  /**
	   * Returns a domain from a dataset for a given axis
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @param {Array} dataset: an array of data
	   * @returns {Array} the domain based on data
	   */
	  getDomainFromData: function (props, axis, dataset) {
	    var currentAxis = _helpers2.default.getCurrentAxis(axis, props.horizontal);
	    var allData = (0, _flatten3.default)(dataset).map(function (datum) {
	      return datum["_" + currentAxis];
	    });

	    if (allData.length < 1) {
	      return _scale2.default.getBaseScale(props, axis).domain();
	    }

	    var min = _collection2.default.getMinValue(allData);
	    var max = _collection2.default.getMaxValue(allData);
	    var domain = void 0;
	    if (min === max) {
	      domain = this.getSinglePointDomain(max);
	    }
	    domain = [min, max];
	    var angularRange = Math.abs((props.startAngle || 0) - (props.endAngle || 360));
	    return props.polar && axis === "x" && angularRange === 360 ? this.getSymmetricDomain(domain, allData) : domain;
	  },
	  getSinglePointDomain: function (val) {
	    // d3-scale does not properly resolve very small differences.
	    // eslint-disable-next-line no-magic-numbers
	    var verySmallNumber = Math.pow(10, -15);
	    var adjustedMin = val instanceof Date ? new Date(val - 1) : val - verySmallNumber;
	    var adjustedMax = val instanceof Date ? new Date(val + 1) : val + verySmallNumber;
	    return [adjustedMin, adjustedMax];
	  },
	  getSymmetricDomain: function (domain, data) {
	    var processedData = (0, _sortedUniq3.default)(data.sort(function (a, b) {
	      return a - b;
	    }));
	    var step = processedData[1] - processedData[0];
	    return [domain[0], domain[1] + step];
	  },


	  /**
	   * Returns a domain based tickValues
	   * @param {Object} props: the props object
	   * @param {String} axis: either x or y
	   * @returns {Array} returns a domain from tickValues
	   */
	  getDomainFromTickValues: function (props, axis) {
	    var domain = void 0;
	    if (_helpers2.default.stringTicks(props)) {
	      domain = [1, props.tickValues.length];
	    } else {
	      // coerce ticks to numbers
	      var ticks = props.tickValues.map(function (value) {
	        return +value;
	      });
	      var initialDomain = [_collection2.default.getMinValue(ticks), _collection2.default.getMaxValue(ticks)];
	      domain = props.polar && axis === "x" ? this.getSymmetricDomain(initialDomain, ticks) : initialDomain;
	    }
	    if (_helpers2.default.isVertical(props)) {
	      domain.reverse();
	    }
	    return domain;
	  },


	  /**
	   * Returns a domain based on categories if they exist
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array|undefined} returns a domain from categories or undefined
	   */
	  getDomainFromCategories: function (props, axis) {
	    var categories = _data2.default.getCategories(props, axis);
	    if (!categories) {
	      return undefined;
	    }
	    var stringArray = _collection2.default.containsStrings(categories) ? _data2.default.getStringsFromCategories(props, axis) : [];
	    var stringMap = stringArray.length === 0 ? null : stringArray.reduce(function (memo, string, index) {
	      memo[string] = index + 1;
	      return memo;
	    }, {});
	    var categoryValues = stringMap ? categories.map(function (value) {
	      return stringMap[value];
	    }) : categories;
	    return [_collection2.default.getMinValue(categoryValues), _collection2.default.getMaxValue(categoryValues)];
	  },


	  /**
	   * Returns a cumulative domain for a set of grouped datasets (i.e. stacked charts)
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @param {Array} datasets: an array of data arrays
	   * @returns {Array} the cumulative domain
	   */
	  getDomainFromGroupedData: function (props, axis, datasets) {
	    var horizontal = props.horizontal;

	    var dependent = axis === "x" && !horizontal || axis === "y" && horizontal;
	    if (dependent && props.categories) {
	      return this.getDomainFromCategories(props, axis);
	    }
	    var globalDomain = this.getDomainFromData(props, axis, datasets);

	    // find the cumulative max for stacked chart types
	    var cumulativeData = !dependent ? this.getCumulativeData(props, axis, datasets) : [];

	    var cumulativeMaxArray = cumulativeData.map(function (dataset) {
	      return dataset.reduce(function (memo, val) {
	        return val > 0 ? +val + +memo : memo;
	      }, 0);
	    });
	    var cumulativeMinArray = cumulativeData.map(function (dataset) {
	      return dataset.reduce(function (memo, val) {
	        return val < 0 ? +val + +memo : memo;
	      }, 0);
	    });

	    var cumulativeMin = Math.min.apply(Math, _toConsumableArray(cumulativeMinArray));
	    // use greatest min / max
	    var domainMin = cumulativeMin < 0 ? cumulativeMin : _collection2.default.getMinValue(globalDomain);
	    var domainMax = _collection2.default.getMaxValue.apply(_collection2.default, [globalDomain].concat(_toConsumableArray(cumulativeMaxArray)));
	    if (domainMin === domainMax) {
	      return this.getSinglePointDomain(domainMax);
	    }
	    return [domainMin, domainMax];
	  },


	  /**
	   * Returns cumulative datasets either by index or category
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @param {Array} datasets: an array of data arrays
	   * @returns {Array} an array of data arrays grouped by index or category
	   */
	  getCumulativeData: function (props, axis, datasets) {
	    var currentAxis = _helpers2.default.getCurrentAxis(axis, props.horizontal);
	    var categories = [];
	    var axisValues = [];
	    datasets.forEach(function (dataset) {
	      dataset.forEach(function (data) {
	        if (data.category !== undefined && !(0, _includes3.default)(categories, data.category)) {
	          categories.push(data.category);
	        } else if (!(0, _includes3.default)(axisValues, data[currentAxis])) {
	          axisValues.push(data[currentAxis]);
	        }
	      });
	    });

	    var _dataByCategory = function () {
	      return categories.map(function (value) {
	        return datasets.reduce(function (prev, data) {
	          return data.category === value ? prev.concat(data[axis]) : prev;
	        }, []);
	      });
	    };

	    var _dataByIndex = function () {
	      return axisValues.map(function (value, index) {
	        return datasets.map(function (data) {
	          return data[index] && data[index]["_" + currentAxis];
	        });
	      });
	    };

	    return categories.length === 0 ? _dataByIndex() : _dataByCategory();
	  },


	  /**
	   * Returns the domain padding appropriate for a given axis
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Object} an object with padding specified for "left" and "right"
	   */
	  getDomainPadding: function (props, axis) {
	    var formatPadding = function (padding) {
	      return Array.isArray(padding) ? { left: padding[0], right: padding[1] } : { left: padding, right: padding };
	    };

	    return (0, _isPlainObject3.default)(props.domainPadding) ? formatPadding(props.domainPadding[axis]) : formatPadding(props.domainPadding);
	  },


	  /**
	   * Returns the domain with padding from the `domainPadding` prop applied
	   * @param {Array} domain: the original domain
	   * @param {Object} props: the props object
	   * @param {String} axis: the current axis
	   * @returns {Array} the domain with padding applied
	   */
	  padDomain: function (domain, props, axis) {
	    if (!props.domainPadding) {
	      return domain;
	    }

	    var padding = this.getDomainPadding(props, axis);
	    if (!padding.left && !padding.right) {
	      return domain;
	    }

	    var domainMin = _collection2.default.getMinValue(domain);
	    var domainMax = _collection2.default.getMaxValue(domain);
	    var range = _helpers2.default.getRange(props, axis);
	    var rangeExtent = Math.abs(Math.max.apply(Math, _toConsumableArray(range)) - Math.min.apply(Math, _toConsumableArray(range)));

	    // Naive initial padding calculation
	    var initialPadding = {
	      left: Math.abs(domainMax - domainMin) * padding.left / rangeExtent,
	      right: Math.abs(domainMax - domainMin) * padding.right / rangeExtent
	    };

	    // Adjust the domain by the initial padding
	    var adjustedDomain = {
	      min: domainMin >= 0 && domainMin - initialPadding.left <= 0 ? 0 : domainMin.valueOf() - initialPadding.left,
	      max: domainMax <= 0 && domainMax + initialPadding.right >= 0 ? 0 : domainMax.valueOf() + initialPadding.right
	    };

	    // re-calculate padding, taking the adjusted domain into account
	    var finalPadding = {
	      left: Math.abs(adjustedDomain.max - adjustedDomain.min) * padding.left / rangeExtent,
	      right: Math.abs(adjustedDomain.max - adjustedDomain.min) * padding.right / rangeExtent
	    };

	    // Adjust the domain by the final padding
	    var finalDomain = {
	      min: domainMin >= 0 && domainMin - finalPadding.left <= 0 ? 0 : domainMin.valueOf() - finalPadding.left,
	      max: domainMax >= 0 && domainMax + finalPadding.right <= 0 ? 0 : domainMax.valueOf() + finalPadding.right
	    };

	    return domainMin instanceof Date || domainMax instanceof Date ? [new Date(finalDomain.min), new Date(finalDomain.max)] : [finalDomain.min, finalDomain.max];
	  },


	  /**
	   * Returns the domain or the reversed domain depending on orientation
	   * @param {Array} domain: the original domain
	   * @param {Object} orientations: the x and y orientations
	   * @param {String} axis: the current axis
	   * @returns {Array} the domain or the reversed domain
	   */
	  orientDomain: function (domain, orientations, axis) {
	    // If the other axis is in a reversed orientation, the domain of this axis
	    // needs to be reversed
	    var otherAxis = axis === "x" ? "y" : "x";
	    var defaultOrientation = function (ax) {
	      return ax === "x" ? "bottom" : "left";
	    };
	    var flippedAxis = orientations.x === "left" || orientations.x === "right";
	    var standardOrientation = flippedAxis ? orientations[otherAxis] === defaultOrientation(axis) : orientations[otherAxis] === defaultOrientation(otherAxis);
	    if (flippedAxis) {
	      return standardOrientation ? domain.concat().reverse() : domain;
	    } else {
	      return standardOrientation ? domain : domain.concat().reverse();
	    }
	  }
	};

/***/ }),
/* 266 */
/***/ (function(module, exports, __webpack_require__) {

	var baseSortedUniq = __webpack_require__(267);

	/**
	 * This method is like `_.uniq` except that it's designed and optimized
	 * for sorted arrays.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.sortedUniq([1, 1, 2]);
	 * // => [1, 2]
	 */
	function sortedUniq(array) {
	  return (array && array.length)
	    ? baseSortedUniq(array)
	    : [];
	}

	module.exports = sortedUniq;


/***/ }),
/* 267 */
/***/ (function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(70);

	/**
	 * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseSortedUniq(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    if (!index || !eq(computed, seen)) {
	      var seen = computed;
	      result[resIndex++] = value === 0 ? 0 : value;
	    }
	  }
	  return result;
	}

	module.exports = baseSortedUniq;


/***/ }),
/* 268 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _isFunction2 = __webpack_require__(89);

	var _isFunction3 = _interopRequireDefault(_isFunction2);

	var _react = __webpack_require__(48);

	var _react2 = _interopRequireDefault(_react);

	var _data = __webpack_require__(246);

	var _data2 = _interopRequireDefault(_data);

	var _collection = __webpack_require__(189);

	var _collection2 = _interopRequireDefault(_collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  getParentSVG: function (target) {
	    if (target.nodeName === "svg") {
	      return target;
	    } else {
	      return this.getParentSVG(target.parentNode);
	    }
	  },
	  getTransformationMatrix: function (svg) {
	    return svg.getScreenCTM().inverse();
	  },
	  getSVGEventCoordinates: function (evt) {
	    if (typeof document === "undefined") {
	      // react-native override. relies on the RN.View being the _exact_ same size as its child SVG.
	      // this should be fine: the svg is the only child of View and the View shirks to its children
	      return {
	        x: evt.nativeEvent.locationX,
	        y: evt.nativeEvent.locationY
	      };
	    }
	    var svg = this.getParentSVG(evt.target);
	    var matrix = this.getTransformationMatrix(svg);
	    return {
	      x: this.transformTarget(evt.clientX, matrix, "x"),
	      y: this.transformTarget(evt.clientY, matrix, "y")
	    };
	  },
	  transformTarget: function (target, matrix, dimension) {
	    var a = matrix.a,
	        d = matrix.d,
	        e = matrix.e,
	        f = matrix.f;

	    return dimension === "y" ? d * target + f : a * target + e;
	  },
	  getDomainCoordinates: function (props, domain) {
	    var scale = props.scale;

	    domain = domain || { x: scale.x.domain(), y: scale.y.domain() };
	    return {
	      x: [scale.x(domain.x[0]), scale.x(domain.x[1])],
	      y: [scale.y(domain.y[0]), scale.y(domain.y[1])]
	    };
	  },


	  // eslint-disable-next-line max-params
	  getDataCoordinates: function (props, scale, x, y) {
	    var polar = props.polar;

	    if (!polar) {
	      return {
	        x: scale.x.invert(x),
	        y: scale.y.invert(y)
	      };
	    } else {
	      var origin = props.origin || { x: 0, y: 0 };
	      var baseX = x - origin.x;
	      var baseY = y - origin.y;
	      var radius = Math.abs(baseX * Math.sqrt(1 + Math.pow(-baseY / baseX, 2)));
	      var angle = (-Math.atan2(baseY, baseX) + Math.PI * 2) % (Math.PI * 2);
	      return {
	        x: scale.x.invert(angle),
	        y: scale.y.invert(radius)
	      };
	    }
	  },
	  getBounds: function (props) {
	    var x1 = props.x1,
	        x2 = props.x2,
	        y1 = props.y1,
	        y2 = props.y2,
	        scale = props.scale;

	    var point1 = this.getDataCoordinates(props, scale, x1, y1);
	    var point2 = this.getDataCoordinates(props, scale, x2, y2);
	    var makeBound = function (a, b) {
	      return [_collection2.default.getMinValue([a, b]), _collection2.default.getMaxValue([a, b])];
	    };

	    return {
	      x: makeBound(point1.x, point2.x),
	      y: makeBound(point1.y, point2.y)
	    };
	  },
	  getDatasets: function (props) {
	    // eslint-disable-line max-statements
	    if (props.data) {
	      return [{ data: props.data }];
	    }
	    var getData = function (childProps) {
	      var data = _data2.default.getData(childProps);
	      return Array.isArray(data) && data.length > 0 ? data : undefined;
	    };

	    // Reverse the child array to maintain correct order when looping over
	    // children starting from the end of the array.
	    var children = _react2.default.Children.toArray(props.children).reverse();
	    var childrenLength = children.length;
	    var dataArr = [];
	    var dataArrLength = 0;
	    var childIndex = 0;
	    while (childrenLength > 0) {
	      var child = children[--childrenLength];
	      var childName = child.props.name || childIndex;
	      childIndex++;
	      if (child.type && child.type.role === "axis") {
	        childIndex++;
	      } else if (child.type && (0, _isFunction3.default)(child.type.getData)) {
	        dataArr[dataArrLength++] = { childName: childName, data: child.type.getData(child.props) };
	      } else if (child.props && child.props.children) {
	        var newChildren = _react2.default.Children.toArray(child.props.children);
	        var newChildrenLength = newChildren.length;
	        for (var index = 0; index < newChildrenLength; index++) {
	          children[childrenLength++] = newChildren[index];
	        }
	      } else {
	        dataArr[dataArrLength++] = { childName: childName, data: getData(child.props) };
	      }
	    }
	    return dataArr;
	  },
	  filterDatasets: function (datasets, bounds) {
	    var _this = this;

	    var filtered = datasets.reduce(function (memo, dataset) {
	      var selectedData = _this.getSelectedData(dataset.data, bounds);
	      memo = selectedData ? memo.concat({
	        childName: dataset.childName, eventKey: selectedData.eventKey, data: selectedData.data
	      }) : memo;
	      return memo;
	    }, []);
	    return filtered.length ? filtered : null;
	  },
	  getSelectedData: function (dataset, bounds) {
	    var x = bounds.x,
	        y = bounds.y;

	    var withinBounds = function (d) {
	      return d._x >= x[0] && d._x <= x[1] && d._y >= y[0] && d._y <= y[1];
	    };

	    var selectedData = dataset.reduce(function (accum, datum, index) {
	      if (withinBounds(datum)) {
	        accum.data.push(datum);
	        accum.eventKey.push(datum.eventKey === undefined ? index : datum.eventKey);
	      }

	      return accum;
	    }, {
	      data: [],
	      eventKey: []
	    });

	    return selectedData.data.length > 0 ? selectedData : null;
	  }
	};

/***/ }),
/* 269 */
/***/ (function(module, exports, __webpack_require__) {

	Object.defineProperty(exports,"__esModule",{value:true});var _omit2=__webpack_require__(90);var _omit3=_interopRequireDefault(_omit2);var _isFunction2=__webpack_require__(89);var _isFunction3=_interopRequireDefault(_isFunction2);var _defaultsDeep2=__webpack_require__(270);var _defaultsDeep3=_interopRequireDefault(_defaultsDeep2);var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};

	var _d3Hierarchy=__webpack_require__(273);var d3Hierarchy=_interopRequireWildcard(_d3Hierarchy);
	var _d3Shape=__webpack_require__(236);var d3Shape=_interopRequireWildcard(_d3Shape);
	var _d3Scale=__webpack_require__(258);var d3Scale=_interopRequireWildcard(_d3Scale);
	var _victoryCore=__webpack_require__(50);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}exports.default=

	{
	checkForValidText:function checkForValidText(text){
	if(text===undefined||text===null){
	return text;
	}else{
	return""+text;
	}
	},

	getSliceStyle:function getSliceStyle(datum,calculatedValues){var
	colors=calculatedValues.colors,style=calculatedValues.style;
	var fill=this.getSliceColor(datum,colors,style);
	return(0,_defaultsDeep3.default)({},datum.style,{fill:fill},style.data);
	},

	getBaseProps:function getBaseProps(props,fallbackProps){
	props=this.modifyProps(props,fallbackProps,"sunburst");
	var calculatedValues=this.getCalculatedValues(props);var _props=
	props,height=_props.height,standalone=_props.standalone,width=_props.width;var
	data=calculatedValues.data,padding=calculatedValues.padding,pathFunction=calculatedValues.pathFunction,radius=calculatedValues.radius,slices=calculatedValues.slices,style=calculatedValues.style;
	var childProps={
	parent:{
	data:data,height:height,padding:padding,pathFunction:pathFunction,radius:radius,slices:slices,standalone:standalone,style:style.parent,width:width}};



	for(var index=0,len=slices.length;index<len;index++){
	var datum=slices[index];
	var eventKey=datum.eventKey||index;
	var dataProps={
	index:index,pathFunction:pathFunction,datum:datum,slice:datum,
	style:this.getSliceStyle(datum,calculatedValues)};


	childProps[eventKey]={
	data:dataProps,
	labels:this.getLabelProps(props,dataProps,calculatedValues)};

	}

	return childProps;
	},

	getCalculatedValues:function getCalculatedValues(props){var
	colorScale=props.colorScale,data=props.data,theme=props.theme;
	var themeStyles=theme&&theme.sunburst&&theme.sunburst.style?theme.sunburst.style:{};
	var style=(0,_defaultsDeep3.default)({},props.style,themeStyles);
	var padding=_victoryCore.Helpers.getPadding(props);
	var radius=this.getRadius(props,padding);
	var slices=this.getSlices(props,radius);
	var colors=d3Scale.scaleOrdinal(
	Array.isArray(colorScale)?colorScale:_victoryCore.Style.getColorScale(colorScale));


	this.sumNodes(data);

	var pathFunction=d3Shape.arc().
	startAngle(function(d){return d.x0;}).
	endAngle(function(d){return d.x1;}).
	innerRadius(function(d){return d.y0;}).
	outerRadius(function(d){return d.y1;});

	return{colors:colors,data:data,padding:padding,pathFunction:pathFunction,radius:radius,slices:slices,style:style,totalSize:data.size};
	},

	getSliceColor:function getSliceColor(datum,colors,style){
	if(style&&style.data&&style.data.fill){
	return style.data.fill;
	}
	return colors&&colors((datum.children?datum.data:datum.parent.data).name);
	},

	getLabelOrientation:function getLabelOrientation(slice){
	var start=this.radiansToDegrees(slice.x0);
	var end=this.radiansToDegrees(slice.x1);
	var degree=start+(end-start)/2;
	if(degree<45||degree>315){
	return"top";
	}else if(degree>=45&&degree<135){
	return"right";
	}else if(degree>=135&&degree<225){
	return"bottom";
	}else{
	return"left";
	}
	},

	getLabelProps:function getLabelProps(props,dataProps,calculatedValues){var
	index=dataProps.index,datum=dataProps.datum,data=dataProps.data,pathFunction=dataProps.pathFunction,slice=dataProps.slice;var
	style=calculatedValues.style,totalSize=calculatedValues.totalSize;
	var labelStyle=_extends({padding:0},style.labels);
	var position=index===0?[0,0]:pathFunction.centroid(slice);
	var orientation=this.getLabelOrientation(slice);

	return{
	index:index,datum:datum,data:data,slice:slice,orientation:orientation,
	style:labelStyle,
	x:Math.round(position[0]),
	y:Math.round(position[1]),
	text:this.getLabelText(props,datum,totalSize,index),
	textAnchor:labelStyle.textAnchor||this.getTextAnchor(orientation),
	verticalAnchor:labelStyle.verticalAnchor||this.getVerticalAnchor(orientation),
	angle:labelStyle.angle};

	},

	getRadius:function getRadius(_ref,padding){var width=_ref.width,height=_ref.height;
	return Math.min(
	width-padding.left-padding.right,
	height-padding.top-padding.bottom)/
	2;
	},

	getTextAnchor:function getTextAnchor(orientation){
	if(orientation==="top"||orientation==="bottom"){
	return"middle";
	}
	return orientation==="right"?"start":"end";
	},

	getVerticalAnchor:function getVerticalAnchor(orientation){
	if(orientation==="left"||orientation==="right"){
	return"middle";
	}
	return orientation==="bottom"?"start":"end";
	},

	getLabelText:function getLabelText(props,datum,totalSize,index){
	var text=void 0;
	if(datum.label){
	text=datum.label;
	}else if(Array.isArray(props.labels)){
	text=props.labels[index];
	}else{
	text=(0,_isFunction3.default)(props.labels)?props.labels(datum,totalSize):datum.data.name;
	}
	return this.checkForValidText(text);
	},

	getSlices:function getSlices(props,radius){var
	data=props.data,minRadians=props.minRadians,sortData=props.sortData,sumBy=props.sumBy;
	var compareFunction=this.getSort(sortData);
	var root=d3Hierarchy.hierarchy(data,function(d){return d.children;}).
	sum(function(d){
	if(d.children){return 0;}
	return sumBy==="size"?d.size:1;
	});
	if(compareFunction)
	root.sort(compareFunction);

	var partition=d3Hierarchy.partition().
	size([2*Math.PI,radius]);

	var nodes=partition(root).descendants().
	filter(function(d){
	return d.x1-d.x0>minRadians;
	});

	return nodes;
	},

	getSort:function getSort(sortData){
	var compareFunction=null;
	if(sortData){
	compareFunction=sortData===true?
	function(a,b){return b.value-a.value;}:
	sortData;
	}
	return compareFunction;
	},

	radiansToDegrees:function radiansToDegrees(radians){
	return radians*(180/Math.PI);
	},

	modifyProps:function modifyProps(props,fallbackProps,role){
	var theme=props.theme&&props.theme[role]?props.theme[role]:{};
	var themeProps=(0,_omit3.default)(theme,["style"]);
	return(0,_defaultsDeep3.default)({},props,themeProps,fallbackProps);
	},

	sumNodes:function sumNodes(node){
	if(node.children&&node.children.length>0){
	node.size=0;
	for(var i=0;i<node.children.length;i++){
	node.size+=this.sumNodes(node.children[i]);
	}
	}
	return node.size;
	}};

/***/ }),
/* 270 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(6),
	    baseRest = __webpack_require__(3),
	    customDefaultsMerge = __webpack_require__(271),
	    mergeWith = __webpack_require__(272);

	/**
	 * This method is like `_.defaults` except that it recursively assigns
	 * default properties.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaults
	 * @example
	 *
	 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
	 * // => { 'a': { 'b': 2, 'c': 3 } }
	 */
	var defaultsDeep = baseRest(function(args) {
	  args.push(undefined, customDefaultsMerge);
	  return apply(mergeWith, undefined, args);
	});

	module.exports = defaultsDeep;


/***/ }),
/* 271 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMerge = __webpack_require__(127),
	    isObject = __webpack_require__(18);

	/**
	 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
	 * objects into destination objects that are passed thru.
	 *
	 * @private
	 * @param {*} objValue The destination value.
	 * @param {*} srcValue The source value.
	 * @param {string} key The key of the property to merge.
	 * @param {Object} object The parent object of `objValue`.
	 * @param {Object} source The parent object of `srcValue`.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 * @returns {*} Returns the value to assign.
	 */
	function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
	  if (isObject(objValue) && isObject(srcValue)) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, objValue);
	    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
	    stack['delete'](srcValue);
	  }
	  return objValue;
	}

	module.exports = customDefaultsMerge;


/***/ }),
/* 272 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMerge = __webpack_require__(127),
	    createAssigner = __webpack_require__(121);

	/**
	 * This method is like `_.merge` except that it accepts `customizer` which
	 * is invoked to produce the merged values of the destination and source
	 * properties. If `customizer` returns `undefined`, merging is handled by the
	 * method instead. The `customizer` is invoked with six arguments:
	 * (objValue, srcValue, key, object, source, stack).
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} sources The source objects.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function customizer(objValue, srcValue) {
	 *   if (_.isArray(objValue)) {
	 *     return objValue.concat(srcValue);
	 *   }
	 * }
	 *
	 * var object = { 'a': [1], 'b': [2] };
	 * var other = { 'a': [3], 'b': [4] };
	 *
	 * _.mergeWith(object, other, customizer);
	 * // => { 'a': [1, 3], 'b': [2, 4] }
	 */
	var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
	  baseMerge(object, source, srcIndex, customizer);
	});

	module.exports = mergeWith;


/***/ }),
/* 273 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-hierarchy/ v1.1.9 Copyright 2019 Mike Bostock
	(function (global, factory) {
	 true ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.d3 = global.d3 || {}));
	}(this, function (exports) { 'use strict';

	function defaultSeparation(a, b) {
	  return a.parent === b.parent ? 1 : 2;
	}

	function meanX(children) {
	  return children.reduce(meanXReduce, 0) / children.length;
	}

	function meanXReduce(x, c) {
	  return x + c.x;
	}

	function maxY(children) {
	  return 1 + children.reduce(maxYReduce, 0);
	}

	function maxYReduce(y, c) {
	  return Math.max(y, c.y);
	}

	function leafLeft(node) {
	  var children;
	  while (children = node.children) node = children[0];
	  return node;
	}

	function leafRight(node) {
	  var children;
	  while (children = node.children) node = children[children.length - 1];
	  return node;
	}

	function cluster() {
	  var separation = defaultSeparation,
	      dx = 1,
	      dy = 1,
	      nodeSize = false;

	  function cluster(root) {
	    var previousNode,
	        x = 0;

	    // First walk, computing the initial x & y values.
	    root.eachAfter(function(node) {
	      var children = node.children;
	      if (children) {
	        node.x = meanX(children);
	        node.y = maxY(children);
	      } else {
	        node.x = previousNode ? x += separation(node, previousNode) : 0;
	        node.y = 0;
	        previousNode = node;
	      }
	    });

	    var left = leafLeft(root),
	        right = leafRight(root),
	        x0 = left.x - separation(left, right) / 2,
	        x1 = right.x + separation(right, left) / 2;

	    // Second walk, normalizing x & y to the desired size.
	    return root.eachAfter(nodeSize ? function(node) {
	      node.x = (node.x - root.x) * dx;
	      node.y = (root.y - node.y) * dy;
	    } : function(node) {
	      node.x = (node.x - x0) / (x1 - x0) * dx;
	      node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
	    });
	  }

	  cluster.separation = function(x) {
	    return arguments.length ? (separation = x, cluster) : separation;
	  };

	  cluster.size = function(x) {
	    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
	  };

	  cluster.nodeSize = function(x) {
	    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
	  };

	  return cluster;
	}

	function count(node) {
	  var sum = 0,
	      children = node.children,
	      i = children && children.length;
	  if (!i) sum = 1;
	  else while (--i >= 0) sum += children[i].value;
	  node.value = sum;
	}

	function node_count() {
	  return this.eachAfter(count);
	}

	function node_each(callback) {
	  var node = this, current, next = [node], children, i, n;
	  do {
	    current = next.reverse(), next = [];
	    while (node = current.pop()) {
	      callback(node), children = node.children;
	      if (children) for (i = 0, n = children.length; i < n; ++i) {
	        next.push(children[i]);
	      }
	    }
	  } while (next.length);
	  return this;
	}

	function node_eachBefore(callback) {
	  var node = this, nodes = [node], children, i;
	  while (node = nodes.pop()) {
	    callback(node), children = node.children;
	    if (children) for (i = children.length - 1; i >= 0; --i) {
	      nodes.push(children[i]);
	    }
	  }
	  return this;
	}

	function node_eachAfter(callback) {
	  var node = this, nodes = [node], next = [], children, i, n;
	  while (node = nodes.pop()) {
	    next.push(node), children = node.children;
	    if (children) for (i = 0, n = children.length; i < n; ++i) {
	      nodes.push(children[i]);
	    }
	  }
	  while (node = next.pop()) {
	    callback(node);
	  }
	  return this;
	}

	function node_sum(value) {
	  return this.eachAfter(function(node) {
	    var sum = +value(node.data) || 0,
	        children = node.children,
	        i = children && children.length;
	    while (--i >= 0) sum += children[i].value;
	    node.value = sum;
	  });
	}

	function node_sort(compare) {
	  return this.eachBefore(function(node) {
	    if (node.children) {
	      node.children.sort(compare);
	    }
	  });
	}

	function node_path(end) {
	  var start = this,
	      ancestor = leastCommonAncestor(start, end),
	      nodes = [start];
	  while (start !== ancestor) {
	    start = start.parent;
	    nodes.push(start);
	  }
	  var k = nodes.length;
	  while (end !== ancestor) {
	    nodes.splice(k, 0, end);
	    end = end.parent;
	  }
	  return nodes;
	}

	function leastCommonAncestor(a, b) {
	  if (a === b) return a;
	  var aNodes = a.ancestors(),
	      bNodes = b.ancestors(),
	      c = null;
	  a = aNodes.pop();
	  b = bNodes.pop();
	  while (a === b) {
	    c = a;
	    a = aNodes.pop();
	    b = bNodes.pop();
	  }
	  return c;
	}

	function node_ancestors() {
	  var node = this, nodes = [node];
	  while (node = node.parent) {
	    nodes.push(node);
	  }
	  return nodes;
	}

	function node_descendants() {
	  var nodes = [];
	  this.each(function(node) {
	    nodes.push(node);
	  });
	  return nodes;
	}

	function node_leaves() {
	  var leaves = [];
	  this.eachBefore(function(node) {
	    if (!node.children) {
	      leaves.push(node);
	    }
	  });
	  return leaves;
	}

	function node_links() {
	  var root = this, links = [];
	  root.each(function(node) {
	    if (node !== root) { // Don’t include the root’s parent, if any.
	      links.push({source: node.parent, target: node});
	    }
	  });
	  return links;
	}

	function hierarchy(data, children) {
	  var root = new Node(data),
	      valued = +data.value && (root.value = data.value),
	      node,
	      nodes = [root],
	      child,
	      childs,
	      i,
	      n;

	  if (children == null) children = defaultChildren;

	  while (node = nodes.pop()) {
	    if (valued) node.value = +node.data.value;
	    if ((childs = children(node.data)) && (n = childs.length)) {
	      node.children = new Array(n);
	      for (i = n - 1; i >= 0; --i) {
	        nodes.push(child = node.children[i] = new Node(childs[i]));
	        child.parent = node;
	        child.depth = node.depth + 1;
	      }
	    }
	  }

	  return root.eachBefore(computeHeight);
	}

	function node_copy() {
	  return hierarchy(this).eachBefore(copyData);
	}

	function defaultChildren(d) {
	  return d.children;
	}

	function copyData(node) {
	  node.data = node.data.data;
	}

	function computeHeight(node) {
	  var height = 0;
	  do node.height = height;
	  while ((node = node.parent) && (node.height < ++height));
	}

	function Node(data) {
	  this.data = data;
	  this.depth =
	  this.height = 0;
	  this.parent = null;
	}

	Node.prototype = hierarchy.prototype = {
	  constructor: Node,
	  count: node_count,
	  each: node_each,
	  eachAfter: node_eachAfter,
	  eachBefore: node_eachBefore,
	  sum: node_sum,
	  sort: node_sort,
	  path: node_path,
	  ancestors: node_ancestors,
	  descendants: node_descendants,
	  leaves: node_leaves,
	  links: node_links,
	  copy: node_copy
	};

	var slice = Array.prototype.slice;

	function shuffle(array) {
	  var m = array.length,
	      t,
	      i;

	  while (m) {
	    i = Math.random() * m-- | 0;
	    t = array[m];
	    array[m] = array[i];
	    array[i] = t;
	  }

	  return array;
	}

	function enclose(circles) {
	  var i = 0, n = (circles = shuffle(slice.call(circles))).length, B = [], p, e;

	  while (i < n) {
	    p = circles[i];
	    if (e && enclosesWeak(e, p)) ++i;
	    else e = encloseBasis(B = extendBasis(B, p)), i = 0;
	  }

	  return e;
	}

	function extendBasis(B, p) {
	  var i, j;

	  if (enclosesWeakAll(p, B)) return [p];

	  // If we get here then B must have at least one element.
	  for (i = 0; i < B.length; ++i) {
	    if (enclosesNot(p, B[i])
	        && enclosesWeakAll(encloseBasis2(B[i], p), B)) {
	      return [B[i], p];
	    }
	  }

	  // If we get here then B must have at least two elements.
	  for (i = 0; i < B.length - 1; ++i) {
	    for (j = i + 1; j < B.length; ++j) {
	      if (enclosesNot(encloseBasis2(B[i], B[j]), p)
	          && enclosesNot(encloseBasis2(B[i], p), B[j])
	          && enclosesNot(encloseBasis2(B[j], p), B[i])
	          && enclosesWeakAll(encloseBasis3(B[i], B[j], p), B)) {
	        return [B[i], B[j], p];
	      }
	    }
	  }

	  // If we get here then something is very wrong.
	  throw new Error;
	}

	function enclosesNot(a, b) {
	  var dr = a.r - b.r, dx = b.x - a.x, dy = b.y - a.y;
	  return dr < 0 || dr * dr < dx * dx + dy * dy;
	}

	function enclosesWeak(a, b) {
	  var dr = a.r - b.r + 1e-6, dx = b.x - a.x, dy = b.y - a.y;
	  return dr > 0 && dr * dr > dx * dx + dy * dy;
	}

	function enclosesWeakAll(a, B) {
	  for (var i = 0; i < B.length; ++i) {
	    if (!enclosesWeak(a, B[i])) {
	      return false;
	    }
	  }
	  return true;
	}

	function encloseBasis(B) {
	  switch (B.length) {
	    case 1: return encloseBasis1(B[0]);
	    case 2: return encloseBasis2(B[0], B[1]);
	    case 3: return encloseBasis3(B[0], B[1], B[2]);
	  }
	}

	function encloseBasis1(a) {
	  return {
	    x: a.x,
	    y: a.y,
	    r: a.r
	  };
	}

	function encloseBasis2(a, b) {
	  var x1 = a.x, y1 = a.y, r1 = a.r,
	      x2 = b.x, y2 = b.y, r2 = b.r,
	      x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1,
	      l = Math.sqrt(x21 * x21 + y21 * y21);
	  return {
	    x: (x1 + x2 + x21 / l * r21) / 2,
	    y: (y1 + y2 + y21 / l * r21) / 2,
	    r: (l + r1 + r2) / 2
	  };
	}

	function encloseBasis3(a, b, c) {
	  var x1 = a.x, y1 = a.y, r1 = a.r,
	      x2 = b.x, y2 = b.y, r2 = b.r,
	      x3 = c.x, y3 = c.y, r3 = c.r,
	      a2 = x1 - x2,
	      a3 = x1 - x3,
	      b2 = y1 - y2,
	      b3 = y1 - y3,
	      c2 = r2 - r1,
	      c3 = r3 - r1,
	      d1 = x1 * x1 + y1 * y1 - r1 * r1,
	      d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2,
	      d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3,
	      ab = a3 * b2 - a2 * b3,
	      xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1,
	      xb = (b3 * c2 - b2 * c3) / ab,
	      ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1,
	      yb = (a2 * c3 - a3 * c2) / ab,
	      A = xb * xb + yb * yb - 1,
	      B = 2 * (r1 + xa * xb + ya * yb),
	      C = xa * xa + ya * ya - r1 * r1,
	      r = -(A ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
	  return {
	    x: x1 + xa + xb * r,
	    y: y1 + ya + yb * r,
	    r: r
	  };
	}

	function place(b, a, c) {
	  var dx = b.x - a.x, x, a2,
	      dy = b.y - a.y, y, b2,
	      d2 = dx * dx + dy * dy;
	  if (d2) {
	    a2 = a.r + c.r, a2 *= a2;
	    b2 = b.r + c.r, b2 *= b2;
	    if (a2 > b2) {
	      x = (d2 + b2 - a2) / (2 * d2);
	      y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
	      c.x = b.x - x * dx - y * dy;
	      c.y = b.y - x * dy + y * dx;
	    } else {
	      x = (d2 + a2 - b2) / (2 * d2);
	      y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
	      c.x = a.x + x * dx - y * dy;
	      c.y = a.y + x * dy + y * dx;
	    }
	  } else {
	    c.x = a.x + c.r;
	    c.y = a.y;
	  }
	}

	function intersects(a, b) {
	  var dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
	  return dr > 0 && dr * dr > dx * dx + dy * dy;
	}

	function score(node) {
	  var a = node._,
	      b = node.next._,
	      ab = a.r + b.r,
	      dx = (a.x * b.r + b.x * a.r) / ab,
	      dy = (a.y * b.r + b.y * a.r) / ab;
	  return dx * dx + dy * dy;
	}

	function Node$1(circle) {
	  this._ = circle;
	  this.next = null;
	  this.previous = null;
	}

	function packEnclose(circles) {
	  if (!(n = circles.length)) return 0;

	  var a, b, c, n, aa, ca, i, j, k, sj, sk;

	  // Place the first circle.
	  a = circles[0], a.x = 0, a.y = 0;
	  if (!(n > 1)) return a.r;

	  // Place the second circle.
	  b = circles[1], a.x = -b.r, b.x = a.r, b.y = 0;
	  if (!(n > 2)) return a.r + b.r;

	  // Place the third circle.
	  place(b, a, c = circles[2]);

	  // Initialize the front-chain using the first three circles a, b and c.
	  a = new Node$1(a), b = new Node$1(b), c = new Node$1(c);
	  a.next = c.previous = b;
	  b.next = a.previous = c;
	  c.next = b.previous = a;

	  // Attempt to place each remaining circle…
	  pack: for (i = 3; i < n; ++i) {
	    place(a._, b._, c = circles[i]), c = new Node$1(c);

	    // Find the closest intersecting circle on the front-chain, if any.
	    // “Closeness” is determined by linear distance along the front-chain.
	    // “Ahead” or “behind” is likewise determined by linear distance.
	    j = b.next, k = a.previous, sj = b._.r, sk = a._.r;
	    do {
	      if (sj <= sk) {
	        if (intersects(j._, c._)) {
	          b = j, a.next = b, b.previous = a, --i;
	          continue pack;
	        }
	        sj += j._.r, j = j.next;
	      } else {
	        if (intersects(k._, c._)) {
	          a = k, a.next = b, b.previous = a, --i;
	          continue pack;
	        }
	        sk += k._.r, k = k.previous;
	      }
	    } while (j !== k.next);

	    // Success! Insert the new circle c between a and b.
	    c.previous = a, c.next = b, a.next = b.previous = b = c;

	    // Compute the new closest circle pair to the centroid.
	    aa = score(a);
	    while ((c = c.next) !== b) {
	      if ((ca = score(c)) < aa) {
	        a = c, aa = ca;
	      }
	    }
	    b = a.next;
	  }

	  // Compute the enclosing circle of the front chain.
	  a = [b._], c = b; while ((c = c.next) !== b) a.push(c._); c = enclose(a);

	  // Translate the circles to put the enclosing circle around the origin.
	  for (i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;

	  return c.r;
	}

	function siblings(circles) {
	  packEnclose(circles);
	  return circles;
	}

	function optional(f) {
	  return f == null ? null : required(f);
	}

	function required(f) {
	  if (typeof f !== "function") throw new Error;
	  return f;
	}

	function constantZero() {
	  return 0;
	}

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	function defaultRadius(d) {
	  return Math.sqrt(d.value);
	}

	function index() {
	  var radius = null,
	      dx = 1,
	      dy = 1,
	      padding = constantZero;

	  function pack(root) {
	    root.x = dx / 2, root.y = dy / 2;
	    if (radius) {
	      root.eachBefore(radiusLeaf(radius))
	          .eachAfter(packChildren(padding, 0.5))
	          .eachBefore(translateChild(1));
	    } else {
	      root.eachBefore(radiusLeaf(defaultRadius))
	          .eachAfter(packChildren(constantZero, 1))
	          .eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
	          .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
	    }
	    return root;
	  }

	  pack.radius = function(x) {
	    return arguments.length ? (radius = optional(x), pack) : radius;
	  };

	  pack.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
	  };

	  pack.padding = function(x) {
	    return arguments.length ? (padding = typeof x === "function" ? x : constant(+x), pack) : padding;
	  };

	  return pack;
	}

	function radiusLeaf(radius) {
	  return function(node) {
	    if (!node.children) {
	      node.r = Math.max(0, +radius(node) || 0);
	    }
	  };
	}

	function packChildren(padding, k) {
	  return function(node) {
	    if (children = node.children) {
	      var children,
	          i,
	          n = children.length,
	          r = padding(node) * k || 0,
	          e;

	      if (r) for (i = 0; i < n; ++i) children[i].r += r;
	      e = packEnclose(children);
	      if (r) for (i = 0; i < n; ++i) children[i].r -= r;
	      node.r = e + r;
	    }
	  };
	}

	function translateChild(k) {
	  return function(node) {
	    var parent = node.parent;
	    node.r *= k;
	    if (parent) {
	      node.x = parent.x + k * node.x;
	      node.y = parent.y + k * node.y;
	    }
	  };
	}

	function roundNode(node) {
	  node.x0 = Math.round(node.x0);
	  node.y0 = Math.round(node.y0);
	  node.x1 = Math.round(node.x1);
	  node.y1 = Math.round(node.y1);
	}

	function treemapDice(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      node,
	      i = -1,
	      n = nodes.length,
	      k = parent.value && (x1 - x0) / parent.value;

	  while (++i < n) {
	    node = nodes[i], node.y0 = y0, node.y1 = y1;
	    node.x0 = x0, node.x1 = x0 += node.value * k;
	  }
	}

	function partition() {
	  var dx = 1,
	      dy = 1,
	      padding = 0,
	      round = false;

	  function partition(root) {
	    var n = root.height + 1;
	    root.x0 =
	    root.y0 = padding;
	    root.x1 = dx;
	    root.y1 = dy / n;
	    root.eachBefore(positionNode(dy, n));
	    if (round) root.eachBefore(roundNode);
	    return root;
	  }

	  function positionNode(dy, n) {
	    return function(node) {
	      if (node.children) {
	        treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
	      }
	      var x0 = node.x0,
	          y0 = node.y0,
	          x1 = node.x1 - padding,
	          y1 = node.y1 - padding;
	      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	      node.x0 = x0;
	      node.y0 = y0;
	      node.x1 = x1;
	      node.y1 = y1;
	    };
	  }

	  partition.round = function(x) {
	    return arguments.length ? (round = !!x, partition) : round;
	  };

	  partition.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
	  };

	  partition.padding = function(x) {
	    return arguments.length ? (padding = +x, partition) : padding;
	  };

	  return partition;
	}

	var keyPrefix = "$", // Protect against keys like “__proto__”.
	    preroot = {depth: -1},
	    ambiguous = {};

	function defaultId(d) {
	  return d.id;
	}

	function defaultParentId(d) {
	  return d.parentId;
	}

	function stratify() {
	  var id = defaultId,
	      parentId = defaultParentId;

	  function stratify(data) {
	    var d,
	        i,
	        n = data.length,
	        root,
	        parent,
	        node,
	        nodes = new Array(n),
	        nodeId,
	        nodeKey,
	        nodeByKey = {};

	    for (i = 0; i < n; ++i) {
	      d = data[i], node = nodes[i] = new Node(d);
	      if ((nodeId = id(d, i, data)) != null && (nodeId += "")) {
	        nodeKey = keyPrefix + (node.id = nodeId);
	        nodeByKey[nodeKey] = nodeKey in nodeByKey ? ambiguous : node;
	      }
	    }

	    for (i = 0; i < n; ++i) {
	      node = nodes[i], nodeId = parentId(data[i], i, data);
	      if (nodeId == null || !(nodeId += "")) {
	        if (root) throw new Error("multiple roots");
	        root = node;
	      } else {
	        parent = nodeByKey[keyPrefix + nodeId];
	        if (!parent) throw new Error("missing: " + nodeId);
	        if (parent === ambiguous) throw new Error("ambiguous: " + nodeId);
	        if (parent.children) parent.children.push(node);
	        else parent.children = [node];
	        node.parent = parent;
	      }
	    }

	    if (!root) throw new Error("no root");
	    root.parent = preroot;
	    root.eachBefore(function(node) { node.depth = node.parent.depth + 1; --n; }).eachBefore(computeHeight);
	    root.parent = null;
	    if (n > 0) throw new Error("cycle");

	    return root;
	  }

	  stratify.id = function(x) {
	    return arguments.length ? (id = required(x), stratify) : id;
	  };

	  stratify.parentId = function(x) {
	    return arguments.length ? (parentId = required(x), stratify) : parentId;
	  };

	  return stratify;
	}

	function defaultSeparation$1(a, b) {
	  return a.parent === b.parent ? 1 : 2;
	}

	// function radialSeparation(a, b) {
	//   return (a.parent === b.parent ? 1 : 2) / a.depth;
	// }

	// This function is used to traverse the left contour of a subtree (or
	// subforest). It returns the successor of v on this contour. This successor is
	// either given by the leftmost child of v or by the thread of v. The function
	// returns null if and only if v is on the highest level of its subtree.
	function nextLeft(v) {
	  var children = v.children;
	  return children ? children[0] : v.t;
	}

	// This function works analogously to nextLeft.
	function nextRight(v) {
	  var children = v.children;
	  return children ? children[children.length - 1] : v.t;
	}

	// Shifts the current subtree rooted at w+. This is done by increasing
	// prelim(w+) and mod(w+) by shift.
	function moveSubtree(wm, wp, shift) {
	  var change = shift / (wp.i - wm.i);
	  wp.c -= change;
	  wp.s += shift;
	  wm.c += change;
	  wp.z += shift;
	  wp.m += shift;
	}

	// All other shifts, applied to the smaller subtrees between w- and w+, are
	// performed by this function. To prepare the shifts, we have to adjust
	// change(w+), shift(w+), and change(w-).
	function executeShifts(v) {
	  var shift = 0,
	      change = 0,
	      children = v.children,
	      i = children.length,
	      w;
	  while (--i >= 0) {
	    w = children[i];
	    w.z += shift;
	    w.m += shift;
	    shift += w.s + (change += w.c);
	  }
	}

	// If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
	// returns the specified (default) ancestor.
	function nextAncestor(vim, v, ancestor) {
	  return vim.a.parent === v.parent ? vim.a : ancestor;
	}

	function TreeNode(node, i) {
	  this._ = node;
	  this.parent = null;
	  this.children = null;
	  this.A = null; // default ancestor
	  this.a = this; // ancestor
	  this.z = 0; // prelim
	  this.m = 0; // mod
	  this.c = 0; // change
	  this.s = 0; // shift
	  this.t = null; // thread
	  this.i = i; // number
	}

	TreeNode.prototype = Object.create(Node.prototype);

	function treeRoot(root) {
	  var tree = new TreeNode(root, 0),
	      node,
	      nodes = [tree],
	      child,
	      children,
	      i,
	      n;

	  while (node = nodes.pop()) {
	    if (children = node._.children) {
	      node.children = new Array(n = children.length);
	      for (i = n - 1; i >= 0; --i) {
	        nodes.push(child = node.children[i] = new TreeNode(children[i], i));
	        child.parent = node;
	      }
	    }
	  }

	  (tree.parent = new TreeNode(null, 0)).children = [tree];
	  return tree;
	}

	// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
	function tree() {
	  var separation = defaultSeparation$1,
	      dx = 1,
	      dy = 1,
	      nodeSize = null;

	  function tree(root) {
	    var t = treeRoot(root);

	    // Compute the layout using Buchheim et al.’s algorithm.
	    t.eachAfter(firstWalk), t.parent.m = -t.z;
	    t.eachBefore(secondWalk);

	    // If a fixed node size is specified, scale x and y.
	    if (nodeSize) root.eachBefore(sizeNode);

	    // If a fixed tree size is specified, scale x and y based on the extent.
	    // Compute the left-most, right-most, and depth-most nodes for extents.
	    else {
	      var left = root,
	          right = root,
	          bottom = root;
	      root.eachBefore(function(node) {
	        if (node.x < left.x) left = node;
	        if (node.x > right.x) right = node;
	        if (node.depth > bottom.depth) bottom = node;
	      });
	      var s = left === right ? 1 : separation(left, right) / 2,
	          tx = s - left.x,
	          kx = dx / (right.x + s + tx),
	          ky = dy / (bottom.depth || 1);
	      root.eachBefore(function(node) {
	        node.x = (node.x + tx) * kx;
	        node.y = node.depth * ky;
	      });
	    }

	    return root;
	  }

	  // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
	  // applied recursively to the children of v, as well as the function
	  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
	  // node v is placed to the midpoint of its outermost children.
	  function firstWalk(v) {
	    var children = v.children,
	        siblings = v.parent.children,
	        w = v.i ? siblings[v.i - 1] : null;
	    if (children) {
	      executeShifts(v);
	      var midpoint = (children[0].z + children[children.length - 1].z) / 2;
	      if (w) {
	        v.z = w.z + separation(v._, w._);
	        v.m = v.z - midpoint;
	      } else {
	        v.z = midpoint;
	      }
	    } else if (w) {
	      v.z = w.z + separation(v._, w._);
	    }
	    v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
	  }

	  // Computes all real x-coordinates by summing up the modifiers recursively.
	  function secondWalk(v) {
	    v._.x = v.z + v.parent.m;
	    v.m += v.parent.m;
	  }

	  // The core of the algorithm. Here, a new subtree is combined with the
	  // previous subtrees. Threads are used to traverse the inside and outside
	  // contours of the left and right subtree up to the highest common level. The
	  // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
	  // superscript o means outside and i means inside, the subscript - means left
	  // subtree and + means right subtree. For summing up the modifiers along the
	  // contour, we use respective variables si+, si-, so-, and so+. Whenever two
	  // nodes of the inside contours conflict, we compute the left one of the
	  // greatest uncommon ancestors using the function ANCESTOR and call MOVE
	  // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
	  // Finally, we add a new thread (if necessary).
	  function apportion(v, w, ancestor) {
	    if (w) {
	      var vip = v,
	          vop = v,
	          vim = w,
	          vom = vip.parent.children[0],
	          sip = vip.m,
	          sop = vop.m,
	          sim = vim.m,
	          som = vom.m,
	          shift;
	      while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
	        vom = nextLeft(vom);
	        vop = nextRight(vop);
	        vop.a = v;
	        shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
	        if (shift > 0) {
	          moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
	          sip += shift;
	          sop += shift;
	        }
	        sim += vim.m;
	        sip += vip.m;
	        som += vom.m;
	        sop += vop.m;
	      }
	      if (vim && !nextRight(vop)) {
	        vop.t = vim;
	        vop.m += sim - sop;
	      }
	      if (vip && !nextLeft(vom)) {
	        vom.t = vip;
	        vom.m += sip - som;
	        ancestor = v;
	      }
	    }
	    return ancestor;
	  }

	  function sizeNode(node) {
	    node.x *= dx;
	    node.y = node.depth * dy;
	  }

	  tree.separation = function(x) {
	    return arguments.length ? (separation = x, tree) : separation;
	  };

	  tree.size = function(x) {
	    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
	  };

	  tree.nodeSize = function(x) {
	    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
	  };

	  return tree;
	}

	function treemapSlice(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      node,
	      i = -1,
	      n = nodes.length,
	      k = parent.value && (y1 - y0) / parent.value;

	  while (++i < n) {
	    node = nodes[i], node.x0 = x0, node.x1 = x1;
	    node.y0 = y0, node.y1 = y0 += node.value * k;
	  }
	}

	var phi = (1 + Math.sqrt(5)) / 2;

	function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
	  var rows = [],
	      nodes = parent.children,
	      row,
	      nodeValue,
	      i0 = 0,
	      i1 = 0,
	      n = nodes.length,
	      dx, dy,
	      value = parent.value,
	      sumValue,
	      minValue,
	      maxValue,
	      newRatio,
	      minRatio,
	      alpha,
	      beta;

	  while (i0 < n) {
	    dx = x1 - x0, dy = y1 - y0;

	    // Find the next non-empty node.
	    do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
	    minValue = maxValue = sumValue;
	    alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
	    beta = sumValue * sumValue * alpha;
	    minRatio = Math.max(maxValue / beta, beta / minValue);

	    // Keep adding nodes while the aspect ratio maintains or improves.
	    for (; i1 < n; ++i1) {
	      sumValue += nodeValue = nodes[i1].value;
	      if (nodeValue < minValue) minValue = nodeValue;
	      if (nodeValue > maxValue) maxValue = nodeValue;
	      beta = sumValue * sumValue * alpha;
	      newRatio = Math.max(maxValue / beta, beta / minValue);
	      if (newRatio > minRatio) { sumValue -= nodeValue; break; }
	      minRatio = newRatio;
	    }

	    // Position and record the row orientation.
	    rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
	    if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
	    else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
	    value -= sumValue, i0 = i1;
	  }

	  return rows;
	}

	var squarify = (function custom(ratio) {

	  function squarify(parent, x0, y0, x1, y1) {
	    squarifyRatio(ratio, parent, x0, y0, x1, y1);
	  }

	  squarify.ratio = function(x) {
	    return custom((x = +x) > 1 ? x : 1);
	  };

	  return squarify;
	})(phi);

	function index$1() {
	  var tile = squarify,
	      round = false,
	      dx = 1,
	      dy = 1,
	      paddingStack = [0],
	      paddingInner = constantZero,
	      paddingTop = constantZero,
	      paddingRight = constantZero,
	      paddingBottom = constantZero,
	      paddingLeft = constantZero;

	  function treemap(root) {
	    root.x0 =
	    root.y0 = 0;
	    root.x1 = dx;
	    root.y1 = dy;
	    root.eachBefore(positionNode);
	    paddingStack = [0];
	    if (round) root.eachBefore(roundNode);
	    return root;
	  }

	  function positionNode(node) {
	    var p = paddingStack[node.depth],
	        x0 = node.x0 + p,
	        y0 = node.y0 + p,
	        x1 = node.x1 - p,
	        y1 = node.y1 - p;
	    if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	    if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	    node.x0 = x0;
	    node.y0 = y0;
	    node.x1 = x1;
	    node.y1 = y1;
	    if (node.children) {
	      p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
	      x0 += paddingLeft(node) - p;
	      y0 += paddingTop(node) - p;
	      x1 -= paddingRight(node) - p;
	      y1 -= paddingBottom(node) - p;
	      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	      tile(node, x0, y0, x1, y1);
	    }
	  }

	  treemap.round = function(x) {
	    return arguments.length ? (round = !!x, treemap) : round;
	  };

	  treemap.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
	  };

	  treemap.tile = function(x) {
	    return arguments.length ? (tile = required(x), treemap) : tile;
	  };

	  treemap.padding = function(x) {
	    return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
	  };

	  treemap.paddingInner = function(x) {
	    return arguments.length ? (paddingInner = typeof x === "function" ? x : constant(+x), treemap) : paddingInner;
	  };

	  treemap.paddingOuter = function(x) {
	    return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
	  };

	  treemap.paddingTop = function(x) {
	    return arguments.length ? (paddingTop = typeof x === "function" ? x : constant(+x), treemap) : paddingTop;
	  };

	  treemap.paddingRight = function(x) {
	    return arguments.length ? (paddingRight = typeof x === "function" ? x : constant(+x), treemap) : paddingRight;
	  };

	  treemap.paddingBottom = function(x) {
	    return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant(+x), treemap) : paddingBottom;
	  };

	  treemap.paddingLeft = function(x) {
	    return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant(+x), treemap) : paddingLeft;
	  };

	  return treemap;
	}

	function binary(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      i, n = nodes.length,
	      sum, sums = new Array(n + 1);

	  for (sums[0] = sum = i = 0; i < n; ++i) {
	    sums[i + 1] = sum += nodes[i].value;
	  }

	  partition(0, n, parent.value, x0, y0, x1, y1);

	  function partition(i, j, value, x0, y0, x1, y1) {
	    if (i >= j - 1) {
	      var node = nodes[i];
	      node.x0 = x0, node.y0 = y0;
	      node.x1 = x1, node.y1 = y1;
	      return;
	    }

	    var valueOffset = sums[i],
	        valueTarget = (value / 2) + valueOffset,
	        k = i + 1,
	        hi = j - 1;

	    while (k < hi) {
	      var mid = k + hi >>> 1;
	      if (sums[mid] < valueTarget) k = mid + 1;
	      else hi = mid;
	    }

	    if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k;

	    var valueLeft = sums[k] - valueOffset,
	        valueRight = value - valueLeft;

	    if ((x1 - x0) > (y1 - y0)) {
	      var xk = (x0 * valueRight + x1 * valueLeft) / value;
	      partition(i, k, valueLeft, x0, y0, xk, y1);
	      partition(k, j, valueRight, xk, y0, x1, y1);
	    } else {
	      var yk = (y0 * valueRight + y1 * valueLeft) / value;
	      partition(i, k, valueLeft, x0, y0, x1, yk);
	      partition(k, j, valueRight, x0, yk, x1, y1);
	    }
	  }
	}

	function sliceDice(parent, x0, y0, x1, y1) {
	  (parent.depth & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1);
	}

	var resquarify = (function custom(ratio) {

	  function resquarify(parent, x0, y0, x1, y1) {
	    if ((rows = parent._squarify) && (rows.ratio === ratio)) {
	      var rows,
	          row,
	          nodes,
	          i,
	          j = -1,
	          n,
	          m = rows.length,
	          value = parent.value;

	      while (++j < m) {
	        row = rows[j], nodes = row.children;
	        for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
	        if (row.dice) treemapDice(row, x0, y0, x1, y0 += (y1 - y0) * row.value / value);
	        else treemapSlice(row, x0, y0, x0 += (x1 - x0) * row.value / value, y1);
	        value -= row.value;
	      }
	    } else {
	      parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
	      rows.ratio = ratio;
	    }
	  }

	  resquarify.ratio = function(x) {
	    return custom((x = +x) > 1 ? x : 1);
	  };

	  return resquarify;
	})(phi);

	exports.cluster = cluster;
	exports.hierarchy = hierarchy;
	exports.pack = index;
	exports.packEnclose = enclose;
	exports.packSiblings = siblings;
	exports.partition = partition;
	exports.stratify = stratify;
	exports.tree = tree;
	exports.treemap = index$1;
	exports.treemapBinary = binary;
	exports.treemapDice = treemapDice;
	exports.treemapResquarify = resquarify;
	exports.treemapSlice = treemapSlice;
	exports.treemapSliceDice = sliceDice;
	exports.treemapSquarify = squarify;

	Object.defineProperty(exports, '__esModule', { value: true });

	}));


/***/ })
/******/ ])
});
;
//# sourceMappingURL=victory-sunburst.js.map