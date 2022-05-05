# Micro Javascript Web App Framework

This engine is 100% javascript with no dependencies and no server side processing/compiling required. This allows the engine to be served by any form of webserver.

It is very lightweight (v1.0.000 is 11KB or 5.4KB minified) and will only render when required. There is no virtual DOM, all interaction with the DOM is via `data-` attribute tags.
Only 1 event listener is registered to the DOM keeping CPU/Memory requirements low.

---
**NOTE**
This engine is not recommended for very large project. It doesn't have components, and apart from for loops (explained bellow) all html objects will exist at all times.

---

By default, the engine will be a javascript object in the global namespace called `mfw`.

All html binding and rendering is based on a `data` object within `mfw`. Any custom javascript code can access this using `mfw.data` and manipulate this data in any way. Any external changes to the data object requires a render to be triggered by calling `mfw.render()`.

The `mfw.data` object can contain any structure, including nested branches, arrays of objects. If a mapping does not exist in the structure the system will not error. Any components of the `mfw.data` that are bound to input or text areas will create all branches when data is added to the input. All mapping/binding is done by using string representations of the path.

## Files
* server.js - Not required for live system, this is a simple node web server to serve files located in www
* www/index.html - Simple example of features
* www/css/style.css - Style sheet for example - not required for framework to operate
* www/js/microFramework.js - The full micro framework engine
* www/js/mfw1.0.000 - Minified version of the engine

## Including the library and initialising

Include the following in the `<head></head>`. **Do not put these in a style sheet** or the app will render the objects incorrectly whilst loading the stylesheet. Having these in the `<head></head>` will ensure correct operation.
```html
<style>
    [data-if], [data-for], [data-each], [data-none], [data-src],
    [data-switch], [data-default], [data-case] { display: none; }
</style>
```

Include the javascript file, this is recommended to be at the bottom of the `<body>` tag, this allows the full html page to load before downloading the engine.
After the include, the engine needs to be initialised using `mfw.init()`. This will set up the document listener for input changes and run the first render.
The data object can be set before the call to `mfw.init()` in the example below this can set a loading flag and activeTab (fields used in the examples)
```html
<script src="/js/microFramework.js"></script>
<script>
    mfw.data = {
        activeTab: 'Tab1',
        loading: true,
    };

    mfw.init();
</script>
```

## Data tags

All interaction between the engine and the DOM is driven by `data-` attribute tags.
Current tags
* data-innerHtml - bind data from `mfw.data` object to the html
* data-unknown - used if `data-innerHtml` is empty or not found
* data-src - bind data from `mfw.data` object to element's src attribute
* data-show - used to change the override the default display property `block` being used to show an element 
* data-if - used to display an element based on a condition met from `mfw.data` object
* data-class - used to bind from `mfw.data` object to an elements class
* data-class-if - used to give an element an additional class name based on a condition met from `mfw.data` object

### data-innerHtml

Available on any html tag that supports innerHtml (ie not inputs, images etc). The value of this attribute will be a path within `mfw.data`.

Upon each render, the entire contents of the elements innerHtml will be replaced with the data matched by the data path on the tag.

```html
<div data-if="test.hello.world"></div>
<div data-if="test2.hello.world"></div>
<script>
    mfw.data = {
        test:{ hello: { world: "test data" } }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div data-if="test.hello.world">test data</div>
<div data-if="test2.hello.world"></div>
```

### data-unknown

Available on any html tag that has got the `data-innerHtml` attribute. The value of this attribute will be treated as a string.

Upon each render, if the looked up data from `data-innerHtml` path following is an empty string, unresolvable path, null or undefined the elements innerHtml will be replace with the string bound to this attribute.

```html
<div data-if="test.hello.world"></div>
<div data-if="test2.hello.world"></div>
<div data-if="test2.hello.world" data-unknown="Data does not exist"></div>
<script>
    mfw.data = {
        test:{ hello: { world: "test data" } }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div data-if="test.hello.world">test data</div>
<div data-if="test2.hello.world"></div>
<div data-if="test2.hello.world" data-unknown="Data does not exist">Data does not exist</div>
```

### data-src

Available on any html tag that supports src attribute (ie images). The value of this attribute will be a path within `mfw.data`.

Upon each render, the entire contents of the elements src attribute will be replaced with the data matched by the data path on the tag.

```html
<img data-src="test.hello.world" />
<script>
    mfw.data = {
        test:{ hello: { world: "/images/test.jpg" } }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<img data-src="/images/test.jpg" />
```

### data-show

Available on any html tag that has got a conditional attribute (`data-if` `data-for` `data-src` `data-default` `data-switch` `data-case`). The value of this attribute will be treated as a string.

This tag allows an override of the display of an element when it has been displays by the render. The renderer will hide elements by setting the css property `display` to `'none'`. By default the renderer will show an element by setting the css property `display` to `'block'`.

```html
<div data-if="loading">This will render as a block when 'mfw.data.loading' it truthy</div>
<div data-if="loading" data-show="inline-block">This will render as an inline-block when 'mfw.data.loading' it truthy</div>
```

### data-if

Available on any html tag. The value of this attribute will be a path within `mfw.data`.

The `data-if` attribute can be used to show elements based on conditions mapped in the `mfw.data` on a render.
```html
<div data-if="loading">Loading, Please Wait...</div>
```
The render will follow the path assigned to the `data-if` attribute through the `mfw.data` object. This path can traverse the branches of the `mfw.data` object. For example `data-if="test.hello.world"` will use the value of `mfw.data.test.hello.world` and if the path is broken this will resolve to `undefined`.

The `data-if` attribute can also support very basic comparisons however the left hand side of the operand will always be mapped to the `mfw.data` object. The right hand side will be evaluated as a string or number. The renderer also supports a ! in front of a mapping. For example `data-if="!loading"`.

Further examples
```html
<div data-if="test.hello.world">Will show if mfw.data.test.hello.world is truethy</div>
<div data-if="!test.hello.world">Will show if mfw.data.test.hello.world is falsey</div>
<div data-if="test.hello.world=2">Will show if mfw.data.test.hello.world is 2 or '2'</div>
<div data-if="test.hello.world=test.hello.again">Will show if mfw.data.test.hello.world is the string 'test.hello.again'</div>
<div data-if="test.hello.world!=2">Will show if mfw.data.test.hello.world is not 2 or '2'</div>
<div data-if="test.hello.world>2">Will show if mfw.data.test.hello.world is greater than 2</div>
<div data-if="test.hello.world>=2">Will show if mfw.data.test.hello.world is greater than or equal to 2</div>
<div data-if="test.hello.world<2">Will show if mfw.data.test.hello.world is less than 2</div>
<div data-if="test.hello.world<=2">Will show if mfw.data.test.hello.world is less than or equal to 2</div>
```

### data-class

Available on any html tag. The value of this attribute will be a path within `mfw.data`.

Upon each render, the entire contents of the elements class will be replaced with the data matched by the data path on the tag.

---
**NOTE**
All classes on the element will be removed prior the looked up class matching. If complex class combinations are required these need processing and adding to the mapped data.

---

```html
<div data-if="test.hello.world"></div>
<div data-if="test.hello.world" class="red"></div>
<div data-if="test2.hello.world"></div>
<div data-if="test2.hello.world" class="red"></div>
<script>
    mfw.data = {
        test:{ hello: { world: "blue class2" } }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div data-if="test.hello.world" class="blue class2"></div>
<div data-if="test.hello.world" class="blue class2"></div>
<div data-if="test2.hello.world"></div>
<div data-if="test2.hello.world"></div>
```

### data-class-if

Available on any html tag. The value of this attribute will be a path within `mfw.data` and the class name to be manipulated.

This tag is split in 2 separated by a semicolon ';'. The first half is the matching condition following the format of `data-if`, the second is a string representing the conditional class name.

---
**NOTE**
Each element can only hav 1 `data-class-if` tag. If complex class combinations are required these need processing and adding to the mapped data.

---

```html
<div class="Tab" data-class-if="activeTab=Tab1;active">Tab 1</div>
<div class="Tab" data-class-if="activeTab=Tab2;active">Tab 2</div>
<div class="Tab" data-class-if="activeTab=Tab3;active">Tab 3</div>
        
<script>
    mfw.data = {
        activeTab: 'Tab2'
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div class="Tab" data-class-if="activeTab=Tab1;active">Tab 1</div>
<div class="Tab active" data-class-if="activeTab=Tab2;active">Tab 2</div>
<div class="Tab" data-class-if="activeTab=Tab3;active">Tab 3</div>
```

---
## To add to readme
* data-for
* data-each
* data-each-index
* data-switch
* data-default
* data-case
* data-value
* data-group
* data-param
* mfw methods
* reading inputs
* onclick and other listeners
