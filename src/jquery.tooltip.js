/**
 * jquery.tooltip.js v0.2
 * 主要用于hover某元素后，可在元素附近展示一个包含提示信息的框
 * https://github.com/tjuking/jquery.tooltip.js
 */

(function (root, factory) {
    "use strict";

    if(typeof define === "function" && define.amd){
        define(["jquery"], function($){
           return factory($, root);
        });
    }else if(typeof exports !== "undefined"){
        module.exports = factory(require("jquery"), root);
    }else{
        factory(jQuery, root);
    }
})(window, function ($, window) {
    "use strict";

    //缓存变量
    var $window = $(window);
    var $body = $("body");

    //设置tooltip元素的索引，从1开始
    var index = 1;

    /**
     * 扩展jQuery的tooltip方法
     * @param options {object} 可以设置宽、高、和参考元素的相对位置、内容以及对齐位置
     * @returns {object} 返回jQuery对象自身
     */
    $.fn.tooltip = function (options) {
        //当前如果没有选中元素则提前退出
        if (!this.length) {
            return this;
        }

        //默认的配置信息
        var defaultOptions = {
            width: "auto", //默认是自动宽度，可以是具体的数字
            height: "auto", //默认是自动高度，可以是具体的数字
            position: "right", //默认是在参考元素的右边，还可以是"top"、"left"、"bottom"
            align: "auto", //默认是居中；如果position设置为"top"或"bottom"时，则还可设其为"left"或"right"；如果position设置位"left"或"right"，则还可设其为"top"或"bottom"；
            content: "" //框中展示的内容
        };

        //配置信息的初始化
        options = options || {};

        //逐个元素的处理并最终返回jQuery元素自身
        return this.each(function () {
            var $this = $(this);
            //每处理一个元素，索引值需要加1
            var thisIndex = index++;
            var thisOptions = getElementOptions($this, defaultOptions, options);
            var thisHtml = getTooltipTpl(thisIndex, thisOptions);
            var $thisTooltip = $(thisHtml);
            //是否需要设置提示框的位置的标识位
            var needSetPosition = true;

            //窗口大小调整的时候，需要标记重设位置信息（不能在频繁调用中去设置）
            $window.on("resize", function () {
                needSetPosition = true;
            });

            //鼠标移入、移出的事件响应
            $this.on("mouseenter", function () {
                //如果还没有插入到页面中，则需要插入
                if (!$thisTooltip.parent().length) {
                    $thisTooltip.appendTo($body);
                }
                //如果需要计算位置信息
                if (needSetPosition) {
                    setTooltipPosition($thisTooltip, $this, thisOptions);
                    needSetPosition = false;
                }
                //最初设置的是hidden（便于计算宽高且不影响页面），所以要设置回"visible"
                $thisTooltip.css("visibility", "visible").show();
            }).on("mouseleave", function () {
                $thisTooltip.hide();
            });
        });
    };

    /**
     * 获取某元素的最终配置信息（优先级：options > 元素HTML配置的属性 > defaultOptions）
     * @param defaultOptions {object} 默认的配置信息
     * @param options {object} 调用入口函数时传入的配置信息
     * @param $element {object} 元素（jQuery对象）
     * @returns {object}
     */
    function getElementOptions($element, defaultOptions, options) {
        //最终的元素配置信息
        var elementOptions = {};
        //用data方法读取属性可区分字符串和数字
        var dataWidth = $element.data("tip-width");
        var dataHeight = $element.data("tip-height");
        //用attr方法读取属性（便于得到字符串结果）
        var dataPosition = $element.attr("data-tip-position");
        var dataAlign = $element.attr("data-tip-align");
        var dataContent = $element.attr("data-tip-content");

        //元素的配置初始化为默认的配置信息
        $.extend(elementOptions, defaultOptions);

        //宽度
        if (options.width) {
            elementOptions.width = options.width;
        } else if (dataWidth) {
            elementOptions.width = dataWidth;
        }
        //对于纯数字需要添加单位px
        if(/^\d+$/.test(elementOptions.width)){
            elementOptions.width += "px";
        }
        //高度
        if (options.height) {
            elementOptions.height = options.height;
        } else if (dataHeight) {
            elementOptions.height = dataHeight;
        }
        //对于纯数字需要添加单位px
        if(/^\d+$/.test(elementOptions.height)){
            elementOptions.height += "px";
        }
        //位于参考物的位置
        if (options.position) {
            elementOptions.position = options.position;
        } else if (dataPosition) {
            elementOptions.position = dataPosition;
        }
        //对齐方式
        if (options.align) {
            elementOptions.align = options.align;
        } else if (dataAlign) {
            elementOptions.align = dataAlign;
        }
        //显示提示的内容
        if (options.content) {
            elementOptions.content = options.content;
        } else if (dataContent) {
            elementOptions.content = dataContent;
        }

        return elementOptions;
    }

    /**
     * 获取jQuery元素的宽高以及位置信息
     * @param $element {object} 需要处理元素的jQuery对象
     * @returns {{width: number, height: number, top: number, left: number}}
     */
    function getElementBox($element) {
        //获取元素的相对页面的偏移关系
        var offset = $element.offset();

        return {
            width: $element.outerWidth(), //需要获取元素的实际占据的宽度和高度
            height: $element.outerHeight(),
            top: offset.top,
            left: offset.left
        };
    }

    /**
     * 设置tooltip的位置
     * @param $tooltip {object} tooltip的jQuery对象
     * @param $element {object} 参考元素的jQuery对象
     * @param options {object} 配置信息
     */
    function setTooltipPosition($tooltip, $element, options) {
        var elementBox = getElementBox($element);
        var tooltipBox = getElementBox($tooltip);
        //默认的位置信息（居中）
        var style = {
            top: parseInt(elementBox.top - (tooltipBox.height-elementBox.height)/2, 10),
            left: parseInt(elementBox.left - (tooltipBox.width-elementBox.width)/2, 10)
        };
        //小三角的位置关系
        var trianglePosition;
        //小三角的偏移量
        var triangleOffset;

        //针对tooltip的不同位置进行设置和计算
        if(options.position === "top" || options.position === "bottom"){
            //小三角位置为"left"
            trianglePosition = "left";

            if(options.align == "left"){
                //提示框和参考元素居左对齐（往前偏移10像素，会更美观一些）
                style.left = elementBox.left - 10;
                //小三角靠左边10像素的位置
                triangleOffset = 10;
            }else if(options.align == "right"){
                //提示框和参考元素居右对齐
                style.left = elementBox.left - (tooltipBox.width - elementBox.width) + 10;
                triangleOffset = tooltipBox.width - 17;
            }else{
                triangleOffset = parseInt(tooltipBox.width/2, 10);
            }

            //计算距离顶部的值
            if(options.position === "top"){
                style.top = elementBox.top - tooltipBox.height - 10;
            }else{
                style.top = elementBox.top + elementBox.height + 10;
            }
        }else{
            //小三角的位置为"top"
            trianglePosition = "top";

            if(options.align == "top"){
                //提示框和参考元素顶部对齐
                style.top = elementBox.top - 10;
                triangleOffset = 10;
            }else if(options.align == "bottom"){
                //提示框和参考元素底部对齐
                style.top = elementBox.top - (tooltipBox.height - elementBox.height) + 10;
                triangleOffset = tooltipBox.height - 17;
            }else{
                triangleOffset = parseInt(tooltipBox.height/2, 10);
            }

            //计算距离左边的值
            if(options.position === "left"){
                style.left = elementBox.left - tooltipBox.width - 10;
            }else{
                style.left = elementBox.left + elementBox.width + 10;
            }
        }

        //设置tooltip和小三角的样式
        $tooltip.css(style).find(".ui-tooltip-triangle").css(trianglePosition, triangleOffset);
    }

    /**
     * 获取拼接tooltip的HTML字符串
     * @param tipIndex {number} tooltip的索引值
     * @param options {object} 配置信息
     * @returns {string}
     */
    function getTooltipTpl(tipIndex, options) {
        //tooltip需要设置的样式
        var style = [
            "width:" + options.width,
            "height:" + options.height
        ].join(";");

        //返回拼接后的字符串
        return [
            '<div class="ui-tooltip ui-tooltip-' + options.position + '" id="uiTooltip-' + tipIndex + '" style="' + style + '">',
                '<div class="ui-tooltip-content">',
                    options.content,
                '</div>',
                '<i class="ui-tooltip-triangle"></i>',
            '</div>'
        ].join("");
    }
});