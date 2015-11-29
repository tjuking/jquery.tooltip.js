# jquery.tooltip.js

jQuery tooltip插件，可轻松自定义并实现hover某元素后展示提示信息的框

### 特点

* 配置简单，使用方便
* 三级配置方案：JavaScript > HTML标签属性 > 默认
* 支持对提示框位置的控制

### 配置说明

```js

    $("xxx").tooltip({
        width: "auto", //提示框内容的宽度（默认为"auto"），可以设置为具体的数值
        height: "auto", //提示框内容的高度（默认为"auto"），可以设置为具体的数值
        position: "right", //提示框在参考元素的位置（默认是在右边），还可以设置为"top"、"bottom"、"left"
        align: "auto", //提示框与参考元素的对齐方式（默认是居中对齐）。如果position设置为"top"或"bottom"时，则还可设其为"left"或"right"；如果position设置位"left"或"right"，则还可设其为"top"或"bottom"
        content: "" //提示框的内容，可以是html字符串
    });

```

### 使用示例

默认配置

```html

    <i class="i-question">?</i>

```

```js

    $(".i-question").tooltip({
        content: "这是提示文字"
    });

```

HTML标签配置（需要以"data-tip-"连接对应的配置项）

```html

    <i class="i-question" data-tip-width="200" data-tip-position="bottom" data-tip-content="这是提示文字">?</i>

```

```js

    $(".i-question").tooltip();

```

JavaScript配置

```html

    <i class="i-question">?</i>
    
```

```js

        $(".i-question").tooltip({
            width: "260",
            position: "left",
            align: "top",
            content: "这是提示文字"
        });

```

当然也可以HTML标签配置和JavaScript配置结合

```html

    <i class="i-question" data-tip-content="这是提示文字">?</i>

```

```js

    $(".i-question").tooltip({
        position: "bottom",
        align: "left"
    });

```

### 其它说明

* 依赖[jQuery](http://jquery.com/)
* src/image文件夹下的图片是提示框用的小三角，目前为进行图片合并