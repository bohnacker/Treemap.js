(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Treemap = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var packageInfo = require('./package.json');


/**
 * Creates a new empty Treemap with position (x, y), width and height. 
 * To specify drawing a bit more, you can give drawing options. 'sort' is true or false. If false, the elements will be shuffeled.
 * 'direction' is either "horizontal", "vertical" or "both". With 'ignore', you can easily switch on and off branches of the Treemap. 
 * Content may be added using addData() or addTreemap().
 * 
 * @class Treemap
 * @constructor
 * @param  {Number} x         x position
 * @param  {Number} y         y position
 * @param  {Number} w         width
 * @param  {Number} h         height
 * @param  {Object} [options] drawing and sorting options {sort:true or false, direction:"horizontal", "vertical" or "both", ignore:["abc", "xyz"]}
 * @return {Treemap}          the new empty Treemap 
 */

/**
 * @class Treemap
 * @ignore
 * @constructor (mainly for internal use)
 * @param  {Treemap} parent   the parent Treemap
 * @param  {String|Number|Object|Array} data  one data element to store. could be anything. 
 * @param  {Number} count     initial count
 * @return {Treemap}          the new Treemap that represents one item
 */

/**
 * @class Treemap
 * @ignore
 * @constructor (mainly for internal use)
 * @param  {Treemap} parent   the parent Treemap
 * @return {Treemap}          the new empty Treemap 
 */

function Treemap() {
  this.parent;
  this.data;
  this.count = 0;
  this.items = [];

  /**
   * x position of the rectangle.
   * @property x
   * @type {Number}
   */
  this.x = 0;
  /**
   * y position of the rectangle.
   * @property y
   * @type {Number}
   */
  this.y = 0;
  /**
   * width of the rectangle.
   * @property w
   * @type {Number}
   */
  this.w = 0;
  /**
   * height of the rectangle.
   * @property h
   * @type {Number}
   */
  this.h = 0;
  this.options;

  if (arguments.length >= 4) {
    this.x = arguments[0];
    this.y = arguments[1];
    this.w = arguments[2];
    this.h = arguments[3];
    this.options = arguments[4];
  } else {
    this.parent = arguments[0];
    this.data = arguments[1];
    this.count = arguments[2] || 0;
  }

  this.x = this.x || 0;
  this.y = this.y || 0;
  this.w = this.w || 0;
  this.h = this.h || 0;

  /**
   * the minimum count value of the items in the items array
   * @property minCount
   * @type {Number}
   */
  this.minCount = 0;
  /**
   * the maximum count value of the items in the items array
   * @property maxCount
   * @type {Number}
   */
  this.maxCount = 0;

  /**
   * level of the item; the root node has level 0
   * @property level
   * @type {Number}
   */
  this.level = 0;
  if (this.parent) this.level = this.parent.level + 1;

  /**
   * the depth of the branch; end nodes have depth 0
   * @property depth
   * @type {Number}
   */
  this.depth = 0;

  /**
   * the number of items in the complete branch
   * @property itemCount
   * @type {Number}
   */
  this.itemCount = 1;

  /**
   * index of the item in the sorted items array.
   * @property index
   * @type {Number}
   */
  this.index = 0;

  this.root = this;
  this.isRoot = true;
  if (this.parent) {
    this.root = this.parent.root;
    this.isRoot = false;
  };
  this.options = this.options || this.root.options;

  this.ignored = false;

  /**
   * Adds a data structure to the Treemap. 
   * You can provide an object or array of nested subitems. The optional second parameter defines what keys should be used to build the Treemap. This second parameter is in the form
   * `{children:"items", count:"size", data:"name"}`. 
   * The key `children` defines, where to find the nested arrays. If you have a plain nested array, just leave this out. 
   * The key `count` defines, which value to map to the size of the rectangles of the Treemap.
   * The key `data` defines, which data to store. If omitted, the complete object or array branch is stored. 
   * This might be the way to choose in most cases. That way you keep all the information accessible when drawing the treemap.
   *
   * @method addData
   * @param {String|Number|Object|Array} data   the data element (e.g. a String) 
   * @param {Object} [keys]                     which keys should be used to build the Treemap: e.g. {children:"items", count:"size", data:"name"}. See the example for different ways how to use that. 
   * @return {Boolean}                          returns true, if adding succeeded
   */

  Treemap.prototype.addData = function(data, keys) {
    keys = keys || {};

    // store data. If a key is given, just store that part of the object, otherwise the whole branch.
    if (keys.data) this.data = data[keys.data];
    else this.data = data;

    // store counter. if data is a number, just use that as a counter. if data is an object, store what's given at the key 'count'. 
    if (typeof data === "number") this.count = data;
    else this.count = data[keys.count] || 0;

    // get children. if the key 'children' is defined use that. otherwise data might be just an array, so use it directly.
    var children = data;
    if (keys.children) children = data[keys.children];

    if (children instanceof Array) {
      children.forEach(function(child) {
        var t = new Treemap(this);
        this.items.push(t);
        t.addData(child, keys);
      }.bind(this));
      return true;
    }
    return false;
  }

  /**
   * Adds one element to the treemap. 
   * If there is already an item which has this value as data, just increase the counter of that item.
   * If not, create a new Treemap with that data and init the counter with 1.
   *
   * @method addItem
   * @param {String|Number|Object|Array} data   the data element (e.g. a String) 
   * @param {Array} [keys]                      if `keys` is given, data has to be an object. It searches for the first key on the first level, for the second key on the second level, ...
   * @return {Treemap}                          returns the treemap where the data was added
   */

  Treemap.prototype.addItem = function(data, keys) {
    if (keys) {
      // Find element in hierarchy
      var currItem = this;

      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var i = currItem.items.findIndex(function(el) { return el.data == data[k]; });
        if (i >= 0) {
          // the element is already in this Treemap, so just increase counter
          currItem.items[i].count++;
          currItem = currItem.items[i];
        } else {
          // the element is not found, so create a new Treemap for it
          var newItem = new Treemap(this, data[k], 1);
          currItem.items.push(newItem);
          currItem = newItem;
        }

      }
      return currItem;

    } else {
      // data is a "simple" value (String, Number, small Object or Array) which should be counted. 
      var i = this.items.findIndex(function(el) { return el.data == data; });
      if (i >= 0) {
        // the element is already in this Treemap, so just increase counter
        this.items[i].count++;
        return false;
      } else {
        // the element is not found, so create a new Treemap for it
        var newItem = new Treemap(this, data, 1);
        this.items.push(newItem);
      }
      return newItem;
    }
  }


  /**
   * Adds an empty treemap to this treemap. If data is given, this could be used 
   * to show and hide a complete sub-treemap from the diagram. There is no check,
   * if there is already another treemap with that data.
   *
   * @method addTreemap
   * @param {String|Number|Object|Array} data the data element (e.g. a String) 
   * @param {Number} [count]                  the initial counter 
   * @return {Treemap}                        returns the new Treemap
   */
  Treemap.prototype.addTreemap = function(data, count) {
    var t = new Treemap(this, data, count);
    this.items.push(t);
    return t;
  }

  // The size of a rectangle depends on the counter. So it's important to sum
  // up all the counters recursively. Only called internally.
  Treemap.prototype.sumUpCounters = function() {
    // Adjust parameter this.ignore: if ignore option is defined and this.data is listed in that ignored=true
    if (this.options.ignore instanceof Array) {
      if (this.options.ignore.indexOf(this.data) >= 0) {
        this.ignored = true;
      } else {
        this.ignored = false;
      }
    }

    // return count or 0 depending on this.ignored
    if (this.items.length == 0) {
      if (this.ignored) return 0;

    } else {
      this.minCount = Number.MAX_VALUE;
      this.maxCount = 0;
      this.depth = 0;
      this.itemCount = 1;
      this.count = 0;

      if (this.ignored) return 0;

      for (var i = 0; i < this.items.length; i++) {
        var sum = this.items[i].sumUpCounters();
        this.count += sum;
        this.minCount = Math.min(this.minCount, sum);
        this.maxCount = Math.max(this.maxCount, sum);
        this.depth = Math.max(this.depth, this.items[i].depth + 1);
        this.itemCount += this.items[i].itemCount;
      }
    }
    return this.count;
  }

  /**
   * Calculates the rectangles of each item. While doing this, all counters 
   * and ignore flags are updated.
   *
   * @method calculate
   */
  Treemap.prototype.calculate = function() {
    // Stop immediately, if it's an empty array
    if (this.items.length == 0) return;

    // if it's the root node, sum up all counters recursively
    if (this == this.root) this.sumUpCounters();

    // If to ignore this element, adjust parameters and stop
    if (this.ignored) {
      this.x = -100000; // just a value far outside the screen, so it won't show up if it's drawn accidentally
      this.y = 0;
      this.w = 0;
      this.h = 0;
      return;
    }

    // sort or shuffle according to the given option
    if (this.options.sort == true || this.options.sort == undefined) {
      // sort items
      this.items.sort(function(a, b) {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        else return 0;
      });
    } else {
      // shuffle explicitly
      shuffleArray(this.items);
    }

    // give every child an index. could be handy for drawing
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].index = i;
    }

    // Starting point is a rectangle and a number of counters to fit in.
    // So, as nothing has fit in the rect, restSum, restW, ... are the starting rect and the sum of all counters
    var restSum = this.count;
    var pad = this.options.padding || 0;
    var restX = this.x + pad;
    var restY = this.y + pad;
    var restW = this.w - pad * 2;
    var restH = this.h - pad * 2;

    // Fit in rows. One row consits of one or more rects that should be as square as possible in average.
    // actIndex always points on the first counter, that has not fitted in.
    var actIndex = 0;
    while (actIndex < this.items.length) {
      // A row is always along the shorter edge (a).
      var isHorizontal = true; // horizontal row
      var a = restW;
      var b = restH;
      if (this.options.direction != 'horizontal') {
        if (restW > restH || this.options.direction == 'vertical') {
          isHorizontal = false; // vertical row
          a = restH;
          b = restW;
        }
      }

      // How many items to fit into the row?
      var rowSum = 0;
      var rowCount = 0;
      var avRelPrev = Number.MAX_VALUE;
      for (var i = actIndex; i < this.items.length; i++) {
        rowSum += this.items[i].count;
        rowCount++;

        // a * bLen is the rect of the row
        var percentage = rowSum / restSum;
        var bLen = b * percentage;
        var avRel = (a / rowCount) / bLen;

        // Let's assume it's a horizontal row. The rects are as square as possible,
        // as soon as the average width (a / rowCount) gets smaller than the row height (bLen).
        if (avRel < 1 || i == this.items.length - 1) {
          // Which is better, the actual or the previous fitting?
          if (avRelPrev < 1 / avRel) {
            // previous fitting is better, so revert to that
            rowSum -= this.items[i].count;
            rowCount--;
            bLen = b * rowSum / restSum;
            i--;
          }

          // get the position and length of the row according to isHorizontal (horizontal or not).
          var aPos = restX;
          var bPos = restY;
          var aLen = restW;
          if (!isHorizontal) {
            aPos = restY;
            bPos = restX;
            aLen = restH;
          }

          // now we can transform the counters between index actIndex and i to rects (in fact to treemaps)
          for (var j = actIndex; j <= i; j++) {
            // map aLen according to the value of the counter
            var aPart = aLen * this.items[j].count / rowSum;
            if (isHorizontal) {
              this.items[j].x = aPos;
              this.items[j].y = bPos;
              this.items[j].w = aPart;
              this.items[j].h = bLen;
            } else {
              this.items[j].x = bPos;
              this.items[j].y = aPos;
              this.items[j].w = bLen;
              this.items[j].h = aPart;
            }
            // negative width or height not allowed
            this.items[j].w = Math.max(this.items[j].w, 0);
            this.items[j].h = Math.max(this.items[j].h, 0);

            // now that the position, width and height is set, it's possible to calculate the nested treemap.
            this.items[j].calculate();
            aPos += aPart;
          }

          // adjust dimensions for the next row
          if (isHorizontal) {
            restY += bLen;
            restH -= bLen;
          } else {
            restX += bLen;
            restW -= bLen;
          }
          restSum -= rowSum;

          break;
        }

        avRelPrev = avRel;
      }

      actIndex = i + 1;
    }
  };

  /**
   * A simple recursive drawing routine. You have to supply a function for drawing one item. This function gets the actual item 
   * as a parameter and has access to all the fields of that item, most important `x`, `y`, `w`, and `h`.
   * `level` and `depth` tells you, how deep this item is nested in the tree. The root node has level 0, an end node has depth 0. `itemCount` gives you the number of items inside this item, counted recursively and the `index` of item inside the parents sorted items array.
   * Example:         
   * ``` 
   * myTreemap.draw(function(item) { 
   *   var r = Math.min(item.w/4, item.h/4, 5);
   *   rect(item.x, item.y, item.w, item.h, r); 
   * }); 
   * ```
   *
   * @method draw
   * @param {Function} drawItemFunction a function that draws one item 
   */
  Treemap.prototype.draw = function(drawItemFunction) {
    if (!drawItemFunction) {
      console.warn('You have to supply a drawing function to see something');
      return;
    }

    if (!this.ignored) {
      // use the drawing function if given, otherwise draw a simple rect using p5js. This will cause an error, if p5.js is not there.
      drawItemFunction(this);

      for (var i = 0; i < this.items.length; i++) {
        this.items[i].draw(drawItemFunction);
      }
    }
  };

}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 *
 * @ignore
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

module.exports = Treemap;
},{"./package.json":2}],2:[function(require,module,exports){
module.exports={
  "name": "Treemap.js",
  "version": "0.2.0",
  "description": "A javascript library for calculating a treemap.",
  "license": "MIT",
  "main": "index.js",
  "scripts": {
    "bundle": "browserify index.js --standalone Treemap -o dist/Treemap.js",
    "dist": "npm run bundle && browserify index.js --standalone Treemap | uglifyjs > dist/Treemap.min.js && copyfiles -u 1 dist/Treemap.js examples/lib/",
    "documentation": "documentation readme index.js --section=Reference"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/bohnacker/Treemap.js"
  },
  "keywords": [
    "dataviz",
    "graph",
    "treemap",
    "recursive"
  ],
  "author": "Hartmut Bohnacker <mail@hartmut-bohnacker.de>",
  "bugs": {
    "url": "https://github.com/bohnacker/Treemap.js/issues"
  },
  "homepage": "https://github.com/bohnacker/Treemap.js",
  "devDependencies": {
    "browserify": "^14.4.0",
    "documentation": "^5.2.2",
    "uglify-js": "^3.0.28"
  }
}

},{}]},{},[1])(1)
});
