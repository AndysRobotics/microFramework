# Micro Javascript Web App Framework

This engine is 100% javascript with no dependencies and no server side processing/compiling required. This allows the engine to be served by any form of webserver.

It is very lightweight (v1.0.000 is 11KB or 5.4KB minified) and will only render when required. There is no vertual DOM, all interaction with the DOM is via `data-` attribute tags.
Only 1 event listener is registered to the DOM keeping CPU/Memory requirements low.

---
**NOTE**
This engine is not recommended for very large project. It doesnt have components, and apart from for loops (explained bellow) all html objects will exist at all times.

---

By default, the engine will be a javascript object in the global namespace called `mfw`.

All html binding and rendering is based on a `data` object within `mfw`. Any custom javascript code can access this using `mfw.data` and manipulate this data in any way. Any external changes to the data object requires a render to be triggered by calling `mfw.render()`.

The `mfw.data` object can contain any structure, including nested branches, arrays of objects. If a mapping does not exist in the structure the system wont error. Any components of the `mfw.data` that are bound to input or text areas will create all branches when data is added to the input. All mapping/binding is done by using string representations of the path.

## Files
* server.js - Not required for live system, this is a simple node web server to serve files located in www
* www/index.html - Simple example of features
* www/css/style.css - Style sheet for example - not required for framework to opperate
* www/js/microFramework.js - The full micro framework engine
* www/js/mfw1.0.000 - Minified version of the engine

## How use

### Including the library and initialising

Include the following in the `<head></head>`. **Do not put these in a style sheet** or the app will render the objects incorectly whilst loading the stylesheet. Having these in the `<head></head>` will ensure correct operation.
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
