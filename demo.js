/**
 * @fileoverview 百度地图的轨迹跟随类，�?外开放�?
 * 用户�?��在地图上�?��义轨迹运�?
 * �?���?��义路过某�?��的图片，文字介绍等�?
 * 主入口类�?<a href="symbols/BMapLib.LuShu.html">LuShu</a>�?
 * 基于Baidu Map API 1.2�?.
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */

/**
 * @namespace BMap的所有library类均放在BMapLib命名空间�?
 */
var BMapLib = window.BMapLib = BMapLib || {};

(function() {
    //声明baidu�?
    var T, baidu = T = baidu || {version: '1.5.0'};
    baidu.guid = '$BAIDU$';
    //以下方法为百�?angram框架�?��方法，�?到http://tangram.baidu.com 查看文档
    (function() {
        window[baidu.guid] = window[baidu.guid] || {};
        baidu.dom = baidu.dom || {};
        baidu.dom.g = function(id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };
        baidu.g = baidu.G = baidu.dom.g;
        baidu.lang = baidu.lang || {};
        baidu.lang.isString = function(source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };
        baidu.isString = baidu.lang.isString;
        baidu.dom._g = function(id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };
        baidu._g = baidu.dom._g;
        baidu.dom.getDocument = function(element) {
            element = baidu.dom.g(element);
            return element.nodeType == 9 ? element : element.ownerDocument || element.document;
        };
        baidu.browser = baidu.browser || {};
        baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
        baidu.dom.getComputedStyle = function(element, key) {
            element = baidu.dom._g(element);
            var doc = baidu.dom.getDocument(element),
                styles;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            }
            return '';
        };
        baidu.dom._styleFixer = baidu.dom._styleFixer || {};
        baidu.dom._styleFilter = baidu.dom._styleFilter || [];
        baidu.dom._styleFilter.filter = function(key, value, method) {
            for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
                if (filter = filter[method]) {
                    value = filter(key, value);
                }
            }
            return value;
        };
        baidu.string = baidu.string || {};


        baidu.string.toCamelCase = function(source) {

            if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
                return source;
            }
            return source.replace(/[-_][^-_]/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
        };
        baidu.dom.getStyle = function(element, key) {
            var dom = baidu.dom;
            element = dom.g(element);
            key = baidu.string.toCamelCase(key);

            var value = element.style[key] ||
                        (element.currentStyle ? element.currentStyle[key] : '') ||
                        dom.getComputedStyle(element, key);

            if (!value) {
                var fixer = dom._styleFixer[key];
                if (fixer) {
                    value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
                }
            }

            if (fixer = dom._styleFilter) {
                value = fixer.filter(key, value, 'get');
            }
            return value;
        };
        baidu.getStyle = baidu.dom.getStyle;
        baidu.dom._NAME_ATTRS = (function() {
            var result = {
                'cellpadding': 'cellPadding',
                'cellspacing': 'cellSpacing',
                'colspan': 'colSpan',
                'rowspan': 'rowSpan',
                'valign': 'vAlign',
                'usemap': 'useMap',
                'frameborder': 'frameBorder'
            };

            if (baidu.browser.ie < 8) {
                result['for'] = 'htmlFor';
                result['class'] = 'className';
            } else {
                result['htmlFor'] = 'for';
                result['className'] = 'class';
            }

            return result;
        })();
        baidu.dom.setAttr = function(element, key, value) {
            element = baidu.dom.g(element);
            if ('style' == key) {
                element.style.cssText = value;
            } else {
                key = baidu.dom._NAME_ATTRS[key] || key;
                element.setAttribute(key, value);
            }
            return element;
        };
        baidu.setAttr = baidu.dom.setAttr;
        baidu.dom.setAttrs = function(element, attributes) {
            element = baidu.dom.g(element);
            for (var key in attributes) {
                baidu.dom.setAttr(element, key, attributes[key]);
            }
            return element;
        };
        baidu.setAttrs = baidu.dom.setAttrs;
        baidu.dom.create = function(tagName, opt_attributes) {
            var el = document.createElement(tagName),
                attributes = opt_attributes || {};
            return baidu.dom.setAttrs(el, attributes);
        };
        baidu.object = baidu.object || {};
        baidu.extend =
        baidu.object.extend = function(target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        };
    })();

    /**
     * @exports LuShu as BMapLib.LuShu
     */
    var LuShu =
    /**
     * LuShu类的构造函�?
     * @class LuShu <b>入口</b>�?
     * 实例化�?类后，可调用,start,end,pause等方法控制�?盖物的运动�?

     * @constructor
         * @param {Map} map Baidu map的实例�?�?.
         * @param {Array} path 构成�?��的point的数�?.
         * @param {Json Object} opts �?��的输入参数，非必填项。可输入选项包括�?<br />
         * {<br />"<b>landmarkPois</b>" : {Array} 要在覆盖物移动过程中，显示的特殊点。格式�?�?:landmarkPois:[<br />
         *      {lng:116.314782,lat:39.913508,html:'加油�?',pauseTime:2},<br />
         *      {lng:116.315391,lat:39.964429,html:'高速公�?��费站,pauseTime:3}]<br />
         * <br />"<b>icon</b>" : {Icon} 覆盖物的icon,
         * <br />"<b>speed</b>" : {Number} 覆盖物移动速度，单位米/�?    <br />
         * <br />"<b>defaultContent</b>" : {String} 覆盖物中的内�?    <br />
         * }<br />.
         * @example <b>参考示例：</b><br />
         * var lushu = new BMapLib.LuShu(map,arrPois,{defaultContent:"从北�?��天津",landmarkPois:[]});
     */
     BMapLib.LuShu = function(map, path, opts) {
        if (!path || path.length < 1) {
            return;
        }
        this._map = map;
        //存储一条路�?
        this._path = path;
        //移动到当前点的索�?
        this.i = 0;
        //控制暂停后开始移动的队列的数�?
        this._setTimeoutQuene = [];
        //进�?坐标�?��的类
        this._projection = this._map.getMapType().getProjection();
        this._opts = {
            icon: null,
            //默�?速度 �?/�?
            speed: 4000,
            defaultContent: ''
        };
        this._setOptions(opts);
        this._rotation = 0;//小车�?��的�?�?

        //如果不是默�?实例，则使用默�?的icon
        if (!this._opts.icon instanceof BMap.Icon) {
            this._opts.icon = defaultIcon;
        }
    }
     /**
     * 根据用户输入的opts，修改默认参数_opts
     * @param {Json Object} opts 用户输入的修改参�?.
     * @return 无返回�?.
     */
    LuShu.prototype._setOptions = function(opts) {
        if (!opts) {
            return;
        }
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                this._opts[p] = opts[p];
            }
        }
    }

    /**
     * @description 开始运�?
     * @param none
     * @return 无返回�?.
     *
     * @example <b>参考示例：</b><br />
     * lushu.start();
     */
    LuShu.prototype.start = function() {
        var me = this,
            len = me._path.length;
        //不是�?��次点击开�?,并且小车还没到达终点
        if (me.i && me.i < len - 1) {
            //没按pause再按start不做处理
            if (!me._fromPause) {
                return;
            }else if(!me._fromStop){
	            //按了pause按钮,并且再按start，直接移动到下一�?
	            //并且此过程中，没有按stop按钮
	            //防�?先stop，再pause，然后连�?��停的start的异�?
	            me._moveNext(++me.i);
            }
        }else {
            //�?��次点击开始，或者点了stop之后点开�?
            me._addMarker();
            //等待marker动画完毕再加载infowindow
            me._timeoutFlag = setTimeout(function() {
                    me._addInfoWin();
                    if(me._opts.defaultContent == ""){
                        me.hideInfoWindow();
                    }
                    me._moveNext(me.i);
            },400);
        }
         //重置状�?
        this._fromPause = false;
        this._fromStop = false;
    },
    /**
     * 结束运动
     * @return 无返回�?.
     *
     * @example <b>参考示例：</b><br />
     * lushu.stop();
     */
    LuShu.prototype.stop = function() {
        this.i = 0;
        this._fromStop = true;
        clearInterval(this._intervalFlag);
        this._clearTimeout();
        //重置landmark里边的poi为未显示状�?
        for (var i = 0, t = this._opts.landmarkPois, len = t.length; i < len; i++) {
            t[i].bShow = false;
        }
    };
    /**
     * 暂停运动
     * @return 无返回�?.
     */
    LuShu.prototype.pause = function() {
        clearInterval(this._intervalFlag);

        //标识�?���?��过pause按钮
        this._fromPause = true;
        this._clearTimeout();
    };
    /**
     * 隐藏上方overlay
     * @return 无返回�?.
     *
     * @example <b>参考示例：</b><br />
     * lushu.hideInfoWindow();
     */
    LuShu.prototype.hideInfoWindow = function() {
        this._overlay._div.style.visibility = 'hidden';
    };
    /**
     * 显示上方overlay
     * @return 无返回�?.
     *
     * @example <b>参考示例：</b><br />
     * lushu.showInfoWindow();
     */
    LuShu.prototype.showInfoWindow = function() {
        this._overlay._div.style.visibility = 'visible';
    };
    //Lushu私有方法
    baidu.object.extend(LuShu.prototype, {
        /**
         * 添加marker到地图上
         * @param {Function} 回调函数.
         * @return 无返回�?.
         */
        _addMarker: function(callback) {
            if (this._marker) {
                this.stop();
                this._map.removeOverlay(this._marker);
                clearTimeout(this._timeoutFlag);
            }
            //移除之前的overlay
            this._overlay && this._map.removeOverlay(this._overlay);
            var marker = new BMap.Marker(this._path[0]);
            this._opts.icon && marker.setIcon(this._opts.icon);
            this._map.addOverlay(marker);
            marker.setAnimation(BMAP_ANIMATION_DROP);
            this._marker = marker;
        },
        /**
         * 添加上方overlay
         * @return 无返回�?.
         */
        _addInfoWin: function() {
            var me = this;
            //if(me._opts.defaultContent!== ""){
                var overlay = new CustomOverlay(me._marker.getPosition(), me._opts.defaultContent);

                //将当前类的引用传给overlay�?
                overlay.setRelatedClass(this);
                this._overlay = overlay;
                this._map.addOverlay(overlay);

            //}

        },
        /**
         * 获取墨卡托坐�?
         * @param {Point} poi 经纬度坐�?.
         * @return 无返回�?.
         */
        _getMercator: function(poi) {
            return this._map.getMapType().getProjection().lngLatToPoint(poi);
        },
        /**
         * 计算两点间的距�?
         * @param {Point} poi 经纬度坐标A�?.
         * @param {Point} poi 经纬度坐标B�?.
         * @return 无返回�?.
         */
        _getDistance: function(pxA, pxB) {
            return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
        },
          //�?��点的  当前的�?�?,position,总的步长,动画效果,回调
        /**
         * 移动小车
         * @param {Number} poi 当前的�?�?.
         * @param {Point} initPos 经纬度坐标初始点.
         * @param {Point} targetPos 经纬度坐标目标点.
         * @param {Function} effect 缓动效果.
         * @return 无返回�?.
         */
        _move: function(initPos,targetPos,effect) {
            var me = this,
                //当前的帧�?
                currentCount = 0,
                //步长，米/�?
                timer = 10,
                step = this._opts.speed / (1000 / timer),
                //初�?坐标
                init_pos = this._projection.lngLatToPoint(initPos),
                //获取结束点的(x,y)坐标
                target_pos = this._projection.lngLatToPoint(targetPos),
                //总的步长
                count = Math.round(me._getDistance(init_pos, target_pos) / step);

            //如果小于1直接移动到下一�?
            if (count < 1) {
                me._moveNext(++me.i);
                return;
            }
            //两点之间匀速移�?
            me._intervalFlag = setInterval(function() {
            //两点之间当前帧数大于总帧数的时候，则�?明已经完成移�?
	            if (currentCount >= count) {
	                clearInterval(me._intervalFlag);
	                //移动的点已经超过总的长度
		        	if(me.i > me._path.length){
						return;
		        	}
		        	//运�?下一�?��
	                me._moveNext(++me.i);
	            }else {
                        currentCount++;
                        var x = effect(init_pos.x, target_pos.x, currentCount, count),
                            y = effect(init_pos.y, target_pos.y, currentCount, count),
                            pos = me._projection.pointToLngLat(new BMap.Pixel(x, y));
                        //设置marker
                        if(currentCount == 1){
                            var proPos = null;
                            if(me.i - 1 >= 0){
                                proPos = me._path[me.i - 1];
                            }
                            if(me._opts.enableRotation == true){
                                 me.setRotation(proPos,initPos,targetPos);
                            }
                            if(me._opts.autoView){
                                if(!me._map.getBounds().containsPoint(pos)){
                                    me._map.setCenter(pos);
                                }   
                            }
                        }
                        //正在移动

                        me._marker.setPosition(pos);
                        //设置�?��义overlay的位�?
                        me._setInfoWin(pos);

                        

                        
	                }
	        },timer);
        },
        /**
        *在每�?��的真实�?骤中设置小车�?��的�?�?
        */
        setRotation : function(prePos,curPos,targetPos){
            var me = this;
            var deg = 0;
            //start!
            curPos =  me._map.pointToPixel(curPos);
            targetPos =  me._map.pointToPixel(targetPos);   

            if(targetPos.x != curPos.x){
                    var tan = (targetPos.y - curPos.y)/(targetPos.x - curPos.x),
                    atan  = Math.atan(tan);
                    deg = atan*360/(2*Math.PI);
                    //degree  correction;
                    if(targetPos.x < curPos.x){
                        deg = -deg + 90 + 90;

                    } else {
                        deg = -deg;
                    }

                    me._marker.setRotation(-deg);   

            }else {
                    var disy = targetPos.y- curPos.y ;
                    var bias = 0;
                    if(disy > 0)
                        bias=-1
                    else
                        bias = 1
                    me._marker.setRotation(-bias * 90);  
            }
            return;

        },

        linePixellength : function(from,to){ 
            return Math.sqrt(Math.abs(from.x- to.x) * Math.abs(from.x- to.x) + Math.abs(from.y- to.y) * Math.abs(from.y- to.y) );

        },
        pointToPoint : function(from,to ){
            return Math.abs(from.x- to.x) * Math.abs(from.x- to.x) + Math.abs(from.y- to.y) * Math.abs(from.y- to.y)

        },
        /**
         * 移动到下一�?��
         * @param {Number} index 当前点的索引.
         * @return 无返回�?.
         */
        _moveNext: function(index) {
            var me = this;
            if (index < this._path.length - 1) {
                me._move(me._path[index], me._path[index + 1], me._tween.linear);
            }
        },
        /**
         * 设置小车上方infowindow的内容，位置�?
         * @param {Point} pos 经纬度坐标点.
         * @return 无返回�?.
         */
        _setInfoWin: function(pos) {
            //设置上方overlay的position
            var me = this;
            if(!me._overlay){
                return;
            }
            me._overlay.setPosition(pos, me._marker.getIcon().size);
            var index = me._troughPointIndex(pos);
            if (index != -1) {
                clearInterval(me._intervalFlag);
                me._overlay.setHtml(me._opts.landmarkPois[index].html);
                me._overlay.setPosition(pos, me._marker.getIcon().size);
                me._pauseForView(index);
            }else {
                me._overlay.setHtml(me._opts.defaultContent);
            }
        },
        /**
         * 在某�?��暂停的时�?
         * @param {Number} index 点的索引.
         * @return 无返回�?.
         */
        _pauseForView: function(index) {
            var me = this;
            var t = setTimeout(function() {
                //运�?下一�?��
                me._moveNext(++me.i);
            },me._opts.landmarkPois[index].pauseTime * 1000);
            me._setTimeoutQuene.push(t);
        },
         //清除暂停后再开始运行的timeout
        _clearTimeout: function() {
            for (var i in this._setTimeoutQuene) {
                clearTimeout(this._setTimeoutQuene[i]);
            }
            this._setTimeoutQuene.length = 0;
        },
         //缓动效果
        _tween: {
            //初�?坐标，目标坐标，当前的�?长，总的步长
            linear: function(initPos, targetPos, currentCount, count) {
                var b = initPos, c = targetPos - initPos, t = currentCount,
                d = count;
                return c * t / d + b;
            }
        },

        /**
         * 否经过某�?��的index
         * @param {Point} markerPoi 当前小车的坐标点.
         * @return 无返回�?.
         */
        _troughPointIndex: function(markerPoi) {
            var t = this._opts.landmarkPois, distance;
            for (var i = 0, len = t.length; i < len; i++) {
                //landmarkPois�?��点没有出现过的话
                if (!t[i].bShow) {
                    distance = this._map.getDistance(new BMap.Point(t[i].lng, t[i].lat), markerPoi);
                    //两点距�?小于10米，认为�?��一�?��
                    if (distance < 10) {
                        t[i].bShow = true;
                        return i;
                    }
                }
            }
           return -1;
        }
    });
    /**
     * �?��义的overlay，显示在小车的上�?
     * @param {Point} Point 要定位的�?.
     * @param {String} html overlay�??显示的东�?.
     * @return 无返回�?.
     */
    function CustomOverlay(point,html) {
        this._point = point;
        this._html = html;
    }
    CustomOverlay.prototype = new BMap.Overlay();
    CustomOverlay.prototype.initialize = function(map) {
        var div = this._div = baidu.dom.create('div', {style: 'border:solid 1px #ccc;width:auto;min-width:50px;text-align:center;position:absolute;background:#fff;color:#000;font-size:12px;border-radius: 10px;padding:5px;white-space: nowrap;'});
        div.innerHTML = this._html;
        map.getPanes().floatPane.appendChild(div);
        this._map = map;
        return div;
    }
   CustomOverlay.prototype.draw = function() {
        this.setPosition(this.lushuMain._marker.getPosition(), this.lushuMain._marker.getIcon().size);
    }
    baidu.object.extend(CustomOverlay.prototype, {
        //设置overlay的position
        setPosition: function(poi,markerSize) {
            // 此�?的bug已修复，感谢 苗冬(diligentcat@gmail.com) 的细心查看和认真指出
            var px = this._map.pointToOverlayPixel(poi),
                styleW = baidu.dom.getStyle(this._div, 'width'),
                styleH = baidu.dom.getStyle(this._div, 'height');
                overlayW = parseInt(this._div.clientWidth || styleW, 10),
                overlayH = parseInt(this._div.clientHeight || styleH, 10);
            this._div.style.left = px.x - overlayW / 2 + 'px';
            this._div.style.bottom = -(px.y - markerSize.height) + 'px';
        },
        //设置overlay的内�?
        setHtml: function(html) {
            this._div.innerHTML = html;
        },
        //跟customoverlay相关的实例的引用
        setRelatedClass: function(lushuMain) {
            this.lushuMain = lushuMain;
        }
    });
})();
