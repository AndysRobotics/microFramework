![Icon](./www/logo.svg)

# Micro Javascript Web App Framework

> **TLDR;** This is a lightweight engine for DOM manipulation. Supporting 2 way-data binding, loops, switches and other features.<br>
> A global object `mfw` will be created and all data bound to the UI lives in `mfw.data`.<br>
> Every external change to `mfw.data` requires a call to `mfw.render()`. Inputs will automatically execute a render.<br>
> `mfw` has methods to aid in data gathering.<br>
> Examples can be found in www/

## About

This engine is 100% javascript with no dependencies and no server side processing/compiling required. This allows the engine to be served by any form of webserver.

It is very lightweight (v1.0.005 is 12.8KB or 5.9KB minified) and will only render when required. There is no virtual DOM, all interaction with the DOM is via `data-` attribute tags.
Only 1 event listener is registered to the DOM keeping CPU/Memory requirements low.

> **NOTE** This engine is not recommended for very large projects. It doesn't have components, and apart from for loops (explained bellow) all html objects will exist at all times.


By default, the engine will be a javascript object in the global namespace called `mfw`.

All html binding and rendering is based on a `data` object within `mfw`. Any custom javascript code can access this using `mfw.data` and manipulate this data in any way. Any external changes to the data object requires a render to be triggered by calling `mfw.render()`.

The `mfw.data` object can contain any structure, including nested branches, arrays of objects. If a mapping does not exist in the structure the system will not error. Any components of the `mfw.data` that are bound to input or text areas will create all branches when data is added to the input. All mapping/binding is done by using string representations of the path.

## Contents

1) [Files](#1---files)
2) [Including the library and initialising](#2---including-the-library-and-initialising)
3) [Methods](#3---methods)
4) [Reading inputs](#4---reading-inputs)
5) [Onclick and other listeners](#5---onclick-and-other-listeners)
6) [Methods](#6---data-tags)

---

## 1 - Files
* server.js - Not required for live system, this is a simple node web server to serve files located in www
* www/index.html - Simple example of features
* www/css/style.css - Style sheet for example - not required for framework to operate
* www/js/microFramework.js - The full micro framework engine
* www/js/mfw1.0.000 - Minified version of the engine

---

## 2 - Including the library and initialising

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

---

## 3 - Methods

The `mfw` object has several methods specifically designed to be run by consuming code if needed.

* `getDataByPath(<string>path)` - return any data found in `mfw.data` that matches the `path` provided
* `setDataByPath(<string>path, <any>data)` - stored `data` in the `mfw.data` object, following the `path` provided, creating nodes if required
* `getDataFromInputGroup(<string>groupName)` - return an object of data from inputs with the matching `data-group` attribute value (see `data-group` below)
* `getDataFromElement(<html element/node>element)` - returns data related to the element provided (see `getDataFromElement` below)
* `showElement(<html element/node>element)` - sets an elements `display` to `block` or to the value of `data-show` if present (see `data-show` below) 
* `hideElement(<html element/node>element)` - sets an elements `display` to `none`
* `init()` - initialise the framework engine and render for the first time (see "2 - Including the library and initialising" above)
* `render()` - evaluates and renders all elements in the DOM

> **NOTE** Methods on the `mfw` object that have names starting with an underscore - eg `mfw._renderForLoops()` are designed to be run by the engine directly and may produce unexpected results if executed

> **NOTE** `mfw.render()` must be called following any changes to the `mfw.data` object. The **ONLY** exception to this is inputs and textareas

---

### getDataFromElement(<html element/node>element)

This method is useful when sending element events (`onclick` etc) to a generic handler. Used to collate information related to the element that triggered the event.

When used within a `data-for` loop, this can be used to detect the index of the array and `data-param` can be used to reference parent or the loop item information. 

Returns
```javascript
{
    api: "value of data-api", // see below
    groupData: {}, // see data-group
    timeout: "value of data-timeout", // see below
    index: "value of data-each-index", // see data-for below
    param: {} // see data-param below
}
```

---

## 4 - Reading Inputs

Inputs can be read via 2 methods
1) Using `data-value` attributes to bind an input value to an path within the `mfw.data` object (see `data-value` below)
2) Using `data-group` and `name` attributes and calling `getDataFromElement` or `getDataFromInputGroup` to build a object with the values (see above)

---

## 5 - Onclick and other listeners

The engine adds no event listeners to any html elements/nodes. The best approach to handlers is to define then directly on the html elements passing the keyword `this` and using `mfw.getDataFromElement` method to construct data. See `data-group`, `data-param`, `data-api` & `data-timeout`.

---

## 6 - Data tags

All interaction between the engine and the DOM is driven by `data-` attribute tags.

> **NOTE** html elements with the following tags will have their `display` style property set on each render<br>
> `data-if` `data-for` `data-each` `data-none` `data-src` `data-switch` `data-default` `data-case`

| Attribute | Value | Desciption |
| --- | --- | --- |
| [data-innerHtml](#data-innerhtml) | path within `mfw.data` | bind data from `mfw.data` object to the html
| [data-unknown](#data-unknown) | string | used if `data-innerHtml` is empty or not found
| [data-src](#data-src) | path within `mfw.data` | bind data from `mfw.data` object to element's src attribute
| [data-show](#data-show) | string | used to change the override the default display property `block` when an element is shown 
| [data-if](#data-if) | path within `mfw.data` & string condition | used to display an element based on a condition met from `mfw.data` object
| [data-class](#data-class) | path within `mfw.data` | used to bind from `mfw.data` object to an elements class
| [data-class-if](#data-class-if) | path within `mfw.data` & string condition/class | used to give an element an additional class name based on a condition met from `mfw.data` object
| [data-switch](#data-switch-data-default--data-case) | path within `mfw.data` | used to allow a DOM switch statement
| [data-case](#data-switch-data-default--data-case) | string | element to show on a matched switch case
| [data-default](#data-switch-data-default--data-case) | N/A | default element to display on unmatched switch cases
| [data-for](#data-for-data-each--data-each-index) | path within `mfw.data` | used to allow a for loop within the DOM statement
| [data-each](#data-for-data-each--data-each-index) | N/A | template used by `data-for` object
| [data-each-index](#data-for-data-each--data-each-index) | N/A | set by renderer to referance position within `data-for` loop
| [data-value](#data-value) | path within `mfw.data` | bind data from `mfw.data` object to element's value (2-way input binding)
| [data-group](#data-group) | string | used by `mfw.getDataFromElement` and `mfw.getDataFromInputGroup` for event handlers
| [data-param](#data-param-data-api--data-timeout) | string | used by `mfw.getDataFromElement` for event handlers
| [data-api](#data-param-data-api--data-timeout) | string | used by `mfw.getDataFromElement` for event handlers
| [data-timeout](#data-param-data-api--data-timeout) | string | used by `mfw.getDataFromElement` for event handlers


---

### data-innerHtml

Available on any html tag that supports innerHtml (ie not inputs, images etc). The value of this attribute will be a path within `mfw.data`.

Upon each render, the entire contents of the elements innerHtml will be replaced with the data matched by the data path on the tag.

If the looked up data is an object, the renderer will run the data through `JSON.stringify` to prevent `[Object Object]` from being printed. TIP - you can use a value of '.' to bind the entire `mfw.data` object eg `<pre data-innerHtml="."></pre>` for debugging. 

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

---

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

---

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

---

### data-show

Available on any html tag that has got a conditional attribute (`data-if` `data-for` `data-src` `data-default` `data-switch` `data-case`). The value of this attribute will be treated as a string.

This tag allows an override of the display of an element when it has been displays by the render. The renderer will hide elements by setting the css property `display` to `'none'`. By default the renderer will show an element by setting the css property `display` to `'block'`.

```html
<div data-if="loading">This will render as a block when 'mfw.data.loading' it truthy</div>
<div data-if="loading" data-show="inline-block">This will render as an inline-block when 'mfw.data.loading' it truthy</div>
```

---

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

---

### data-class

Available on any html tag. The value of this attribute will be a path within `mfw.data`.

Upon each render, the entire contents of the elements class will be replaced with the data matched by the data path on the tag.

> **NOTE** All classes on the element will be removed prior the looked up class matching. If complex class combinations are required these need processing and adding to the mapped data.

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

---

### data-class-if

Available on any html tag. The value of this attribute will be a path within `mfw.data` and the class name to be manipulated.

This tag is split in 2 separated by a semicolon ';'. The first half is the matching condition following the format of `data-if`, the second is a string representing the conditional class name.

> **NOTE** Each element can only hav 1 `data-class-if` tag. If complex class combinations are required these need processing and adding to the mapped data.

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

### data-switch, data-default & data-case

Available on any html tag. The value of `data-switch` attribute will be a path within `mfw.data`. The value of `data-case` will be treated as a string.

`data-default` is optional, if a no `data-case` child elements match and `data-default` child element doesn't exist, the `data-switch` element will be hidden. 

* `data-switch` - path to the data to be evaluated and matched to a child element.
* `data-case` - string to match to.
* `data-default` - has no value, this will be the matched element if the data switch path doesn't resolve or doesn't match any `data-case`.

> **NOTE** The renderer will only evaluate immediate  children nodes of the switch element looking for `data-case` or `data-default`. This is to allow nested switch usage.

```html
<div data-switch="test.hello.world">
    <div data-default>World not found</div>
    <div data-case="blue">The world is blue</div>
    <div data-case="red">The world is red</div>
</div>
        
<script>
    mfw.data = {
        test:{ hello: { world: "blue" } }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div data-switch="test.hello.world" style="display:block">
    <div data-default style="display: none;">World not found</div>
    <div data-case="blue" style="display:block">The world is blue</div>
    <div data-case="red" style="display: none;">The world is red</div>
</div>
```

---

### data-for, data-each & data-each-index

The `data-for` attribute is available on any html tag. The value of this attribute will be a path within `mfw.data`. If the data obtained from the path is not iterable, this tag will do nothing.

`data-each` does not have a value. The element must be a direct child of the element with the `data-for` attribute. The element with this attribute will become the template for each array item found in the `mfw.data` path being evaluated.

`data-each-index` is added to each generated element indicating the position within the array.

> **NOTE** To reference data within the array, the index needs to be excluded


```html
<div data-for="test.people">
    <div data-each>
        Name : <span data-innerHtml="test.people.name"></span><br>
        Age : <span data-innerHtml="test.people.age"></span>
    </div>
</div>
        
<script>
    mfw.data = {
        test:{ 
            people: [
                { name: "Jeff", age: 35 },
                { name: "Steve", age: 28 },
                { name: "Sarah", age: 29 },
            ]
        }
    }
    mfw.render();
</script>
```

Will become the following after the render

```html
<div data-for="test.people" style="display:block;">
    <div data-each style="display:none;">
        Name : <span data-innerHtml="test.people.name"></span><br>
        Age : <span data-innerHtml="test.people.age"></span>
    </div>
    <div data-each-index="0" style="display:block;">
        Name : <span data-innerHtml="test.people.0.name">Jeff</span><br>
        Age : <span data-innerHtml="test.people.0.age">35</span>
    </div>
    <div data-each-index="1" style="display:block;">
        Name : <span data-innerHtml="test.people.1.name">Steve</span><br>
        Age : <span data-innerHtml="test.people.1.age">28</span>
    </div>
    <div data-each-index="2" style="display:block;">
        Name : <span data-innerHtml="test.people.2.name">Sarah</span><br>
        Age : <span data-innerHtml="test.people.2.age">29</span>
    </div>
</div>
```

---

### data-value

Available on any html tag that supports value or checked (input, textarea, select). The value of this attribute will be a path within `mfw.data`.

The `data-value` tag is used for 2-way binding of data between an `mfw.data` element and a html input/textbox.

If the input is of the type `checkbox` then the data will be converted to a boolean, otherwise it will become a string.

`mfw.init()` will attach an input event listener on the `document` object which fires on any input change when an field is in or out of focus. The event handler will check if the target has `data-value` attribute and copy the input into the `mfw.data` object. If the value has changed, the handler will automatically trigger a fresh render.

```html
<input data-value="test.name"><br>
<div data-innerHtml="test.name">This will be the contents of the input</div>
```

---

### data-group

The value of `data-group` will be treated as a string. This is used to group inputs together for easy data retrieval. This can be used with `data-value` or independently.

This attribute cam work in 2 ways.

1) Available on any html tag that supports value or checked (inputs, textarea etc). Used for data retrieval.
2) Available on any html tag to lookup any inputs that have the same `data-group` attribute value via the `mfw.getDataFromElement(element)` method.


> **NOTE** Input/textarea Elements with the `data-group` must be given a unique `name` tag to structure the lookup data, the `name` tag will be used to map the result

```html
<input name="firstName" data-group="newPerson">
<input name="laststName" data-group="newPerson">
<input name="age" data-group="newPerson">
<button onclick="submitForm(this)" data-group="newPerson">Add</button>

<script>
    function submitForm(element){
        let data = mfw.getDataFromElement(element);
        console.log(data);
    }
</script>
```

When the button is clicked, the console will have

```javascript
    {
        api: null,
        groupData: {
            firstName: "Contents of firstName",
            lastName: "Contents of lastName",
            age: "Contents of age"
        },
        index: null,
        param: null
    }
```

---

### data-param, data-api & data-timeout

Available on any html tag. `data-param` value will be a path within `mfw.data`. `data-api` value will be treated as a string. `data-timeout` value will be converted to a number.

Both these tags are only used by the `mfw.getDataFromElement(element)` method to aid data lookups, especially useful in `data-for` loops for clickable elements.

```html
<input name="firstName" data-group="newPerson">
<input name="laststName" data-group="newPerson">
<input name="age" data-group="newPerson">
<button onclick="submitForm(this)" data-group="newPerson" data-api="/API/addPerson" data-param="test.hello" data-timeout="60">Add</button>

<script>
    mfw.data = {
        test:{ hello: { world: "test data" } }
    }
    
    function submitForm(element){
        let data = mfw.getDataFromElement(element);
        console.log(data);
    }
</script>
```

When the button is clicked, the console will have

```javascript
{
    api: "/API/addPerson",
    timeout: 60,
    groupData: {
        firstName: "Contents of firstName",
        lastName: "Contents of lastName",
        age: "Contents of age"
    },
    index: null,
    param: { world: "test data" }
}
```
