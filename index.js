'use strict';

var packageInfo = require('./package.json');


/**
 * Creates a new empty Treemap with position (x, y), width and height. 
 * To specify drawing a bit more, you can give drawing options. See method `setOptions()` for more information.
 * Content may be added using `addData()` or `addItem()`.
 * 
 * @class Treemap
 * @constructor
 * @param  {Number} x         – X position
 * @param  {Number} y         – Y position
 * @param  {Number} w         – Width
 * @param  {Number} h         – Height
 * @param  {Object} [options] – Drawing options
 * @return {Treemap}          – The new empty Treemap 
 */

/*
 * @class Treemap
 * @ignore
 * @constructor (mainly for internal use)
 * @param  {Treemap} parent   the parent Treemap
 * @param  {String|Number|Object|Array} data  one data element to store. could be anything. 
 * @param  {Number} value     initial value
 * @return {Treemap}          the new Treemap that represents one item
 */

/*
 * @class Treemap
 * @ignore
 * @constructor (mainly for internal use)
 * @param  {Treemap} parent   the parent Treemap
 * @return {Treemap}          the new empty Treemap 
 */

function Treemap() {
  this.parent;
  this.data;
  this.value = 0;
  this.items = [];

  /**
   * X position of the rectangle.
   * @property x
   * @type {Number}
   */
  this.x = 0;
  /**
   * Y position of the rectangle.
   * @property y
   * @type {Number}
   */
  this.y = 0;
  /**
   * Width of the rectangle.
   * @property w
   * @type {Number}
   */
  this.w = 0;
  /**
   * Height of the rectangle.
   * @property h
   * @type {Number}
   */
  this.h = 0;
  this.options = {};

  if (arguments.length >= 4) {
    this.x = arguments[0];
    this.y = arguments[1];
    this.w = arguments[2];
    this.h = arguments[3];
    this.options = arguments[4] || {};
  } else {
    // call of this constructor for internal use to create sub-treemaps
    this.parent = arguments[0];
    this.data = arguments[1];
    this.value = arguments[2] || 0;

    // make sure only numbers get saved
    if (typeof this.value == 'object') {
      Object.keys(this.value).forEach(function(k) {
        var v = parseFloat(this.value[k]);
        v = isNaN(v) ? 0 : v;
        this.value[k] = v;
      }.bind(this));
    } else {
      var v = parseFloat(this.value);
      v = isNaN(v) ? 0 : v;
      this.value = v;
    }
  }

  this.x = this.x || 0;
  this.y = this.y || 0;
  this.w = this.w || 0;
  this.h = this.h || 0;


  /**
   * The minimum value of the items in the items array
   * @property minValue
   * @type {Number}
   */
  this.minValue = 0;
  /**
   * The maximum value of the items in the items array
   * @property maxValue
   * @type {Number}
   */
  this.maxValue = 0;

  /**
   * Level of the item; the root node has level 0
   * @property level
   * @type {Number}
   */
  this.level = 0;
  if (this.parent) this.level = this.parent.level + 1;

  /**
   * The depth of the branch; end nodes have depth 0
   * @property depth
   * @type {Number}
   */
  this.depth = 0;

  /**
   * The number of items in the complete branch
   * @property itemCount
   * @type {Number}
   */
  this.itemCount = 1;

  /**
   * Index of the item in the sorted items array.
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
   * `{children:"items", value:"size", data:"name"}`. 
   * The key `children` defines, where to find the nested arrays. If you have a plain nested array, just leave this out. 
   * The key `value` defines, which value to map to the size of the rectangles of the Treemap.
   * The key `data` defines, which data to store. If omitted, the complete object or array branch is stored. 
   * This might be the way to choose in most cases. That way you keep all the information accessible when drawing the treemap.
   *
   * @method addData
   * @param {String|Number|Object|Array} data – The data element (e.g. a String) 
   * @param {Object} [keys]                   – Which keys should be used to build the Treemap: e.g. {children:"items", value:"size", data:"name"}. See the example for different ways how to use that. 
   * @return {Boolean}                         – Returns true, if adding succeeded
   */

  Treemap.prototype.addData = function(data, opts) {
    opts = opts || {};

    // store data. If a key is given, just store that part of the object, otherwise the whole branch.
    if (opts.data) this.data = data[opts.data];
    else this.data = data;

    // store counter. if data is a number, just use that as a counter. if data is an object, store what's given at the key 'value'. 
    if (typeof data === "number") {
      this.value = data;
    } else {
      // data is an object
      if (Array.isArray(opts.value)) {
        if (typeof this.value != 'object') {
          this.value = {};
        }
        opts.value.forEach(function(k) {
          // console.log(data[k])
          this.value[k] = data[k] || 0;
        }.bind(this));
      } else {
        this.value = data[opts.value] || 0;
      }
    }

    // get children. if the key 'children' is defined use that. otherwise data might be just an array, so use it directly.
    var children = data;
    if (opts.children) children = data[opts.children];

    if (Array.isArray(children)) {
      children.forEach(function(child) {
        var t = new Treemap(this);
        this.items.push(t);
        t.addData(child, opts);
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
   * @param {String|Number|Object|Array} data – The data element (e.g. a String) 
   * @param {Array} [keys]                    – If `keys` is given, data has to be an object. It searches for the first key on the first level, for the second key on the second level, ...
   * @param {Number} [value]                  – How much should this item add to the size. If not given, 1 is added.
   * @return {Treemap}                        – Returns the treemap where the data was added
   */

  Treemap.prototype.addItem = function(data, keys, value) {
    value = value || 1;

    if (keys) {
      // Find element in hierarchy
      var currItem = this;

      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var i = currItem.items.findIndex(function(el) { return el.data == data[k]; });

        if (i >= 0) {
          // the element is already in this Treemap, so just increase value
          if (j == keys.length - 1) currItem.items[i].add(value);
          currItem = currItem.items[i];
        } else {
          // the element is not found, so create a new Treemap for it
          var newItem = new Treemap(currItem, data[k], value);
          currItem.items.push(newItem);
          currItem = newItem;
        }

      }
      return currItem;

    } else {
      // data is a "simple" value (String, Number, small Object or Array) which should be counted. 
      var i = this.items.findIndex(function(el) { return el.data == data; });
      if (i >= 0) {
        // the element is already in this Treemap, so just increase value
        this.items[i].add(value);
        return false;
      } else {
        // the element is not found, so create a new Treemap for it
        var newItem = new Treemap(this, data, value);
        this.items.push(newItem);
      }
      return newItem;
    }
  }


  /**
   * Set options for next calculation of the treemap. Currently there are the following options you might set:
   * - order: 'sort', 'shuffle' or 'keep'. Default is 'sort'. Attention: don't use 'keep' for the first calculation of the treemap.
   * - direction: 'both, 'horizontal' or 'vertical'. Default is 'both'.
   * - padding: 0 (default) or any positive number.
   *
   * @method setOptions
   * @param {Object} options – Object in the form `{order: 'keep', padding: 4}`
   */

  Treemap.prototype.setOptions = function(opts) {
    Object.keys(opts).forEach(function(k) {
      this.options[k] = opts[k];
    }.bind(this));

    this.items.forEach(function(el) {
      el.setOptions(opts);
    });
  }


  // Probably not really useful. Same could be done with addData
  Treemap.prototype.addTreemap = function(data, value) {
    var t = new Treemap(this, data, value);
    this.items.push(t);
    return t;
  }

  // Helper function to add up values. if val is an object, add up all the values
  Treemap.prototype.add = function(val) {
    if (typeof val === 'object') {
      if (typeof this.value != 'object') {
        this.value = {};
      }
      Object.keys(val).forEach(function(k) {
        var v = parseFloat(val[k]);
        v = isNaN(v) ? 0 : v;

        if (this.value[k]) {
          this.value[k] += v;
        } else {
          this.value[k] = v;
        }
      }.bind(this));

    } else {
      var v = parseFloat(val);
      this.value += isNaN(v) ? 0 : v;
    }
  }


  // The size of a rectangle depends on the counter. So it's important to sum
  // up all the counters recursively. Only called internally.
  Treemap.prototype.sumUpValues = function(valueKey) {
    // Adjust parameter this.ignore: if ignore option is defined and this.data is listed in that ignored=true
    if (Array.isArray(this.options.ignore)) {
      if (this.options.ignore.indexOf(this.data) >= 0) {
        this.ignored = true;
      } else {
        this.ignored = false;
      }
    }

    // return value or 0 depending on this.ignored
    if (this.items.length == 0) {
      if (this.ignored) return (valueKey ? {} : 0);

    } else {
      this.minValue = Number.MAX_VALUE;
      this.maxValue = 0;
      this.depth = 0;
      this.itemCount = 1;
      this.value = (valueKey ? {} : 0);

      if (this.ignored) return (valueKey ? {} : 0);

      for (var i = 0; i < this.items.length; i++) {
        var sum = this.items[i].sumUpValues(valueKey);

        this.add(sum);
        var val = valueKey ? sum[valueKey] : sum;
        this.minValue = Math.min(this.minValue, val);
        this.maxValue = Math.max(this.maxValue, val);
        this.depth = Math.max(this.depth, this.items[i].depth + 1);
        this.itemCount += this.items[i].itemCount;
      }
    }
    return this.value;
  }

  /**
   * Calculates the rectangles of each item. While doing this, all counters 
   * and ignore flags are updated. If you have multiple values stored in your treemap you must give a key to define which value to use for calculation.
   *
   * @method calculate
   * @param {String} [key]
   */
  Treemap.prototype.calculate = function(valueKey) {
    // Stop immediately, if it's an empty array
    if (this.items.length == 0) return;

    // if it's the root node, sum up all counters recursively
    if (this == this.root) {
      this.sumUpValues(valueKey);
    }

    // If to ignore this element, adjust parameters and stop
    if (this.ignored) {
      this.x = -100000; // just a value far outside the screen, so it won't show up if it's drawn accidentally
      this.y = 0;
      this.w = 0;
      this.h = 0;
      return;
    }

    // sort or shuffle according to the given option
    if (this.root.options.order == 'sort' || this.root.options.order == undefined) {
      // sort items
      this.items.sort(function(a, b) {
        if (valueKey) {
          if (a.value[valueKey] < b.value[valueKey]) return 1;
          if (a.value[valueKey] > b.value[valueKey]) return -1;
        } else {
          if (a.value < b.value) return 1;
          if (a.value > b.value) return -1;
        }
        return 0;
      });
    } else if (this.root.options.order == 'shuffle') {
      // shuffle explicitly
      shuffleArray(this.items);
    }

    // give every child an index. could be handy for drawing
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].index = i;
    }

    // Starting point is a rectangle and a number of counters to fit in.
    // So, as nothing has fit in the rect, restSum, restW, ... are the starting rect and the sum of all counters
    var restSum = valueKey ? this.value[valueKey] : this.value;
    var pad = this.root.options.padding || 0;
    var restX = this.x + pad;
    var restY = this.y + pad;
    var restW = this.w - pad * 2;
    var restH = this.h - pad * 2;

    if (this.root.options.order == 'keep') {
      // use information in fields 'isHorizontal' and 'wrap' to build the rects

      for (var i = 0; i < this.items.length; i++) {
        // console.log(`Calculating item ${this.items[i].data.Country}`);
        // var this.items[i].isHorizontal = this.items[i].this.items[i].isHorizontal;

        var a = restW;
        var b = restH;
        if (!this.items[i].isHorizontal) {
          a = restH;
          b = restW;
        }

        // sum up all actual values in this row (until the is a wrap)
        var rowSum = 0;
        for (var j = i; j < this.items.length; j++) {
          rowSum += valueKey ? this.items[j].value[valueKey] : this.items[j].value;
          if (this.items[j].wrap) break;
        }
        var startI = i;
        var endI = j;


        var percentage = rowSum / restSum;
        var bLen = b * percentage;


        // get the position and length of the row according to isHorizontal (horizontal or not).
        var aPos = restX;
        var bPos = restY;
        var aLen = restW;
        if (!this.items[i].isHorizontal) {
          aPos = restY;
          bPos = restX;
          aLen = restH;
        }

        // now we can transform the values between index startI and endI to rects (in fact to treemaps)
        for (var j = startI; j <= endI; j++) {
          // console.log(`Moving ${j}: ${this.items[j]}`);

          // map aLen according to the value of the counter
          var val = valueKey ? this.items[j].value[valueKey] : this.items[j].value;
          var aPart = aLen * val / rowSum;
          if (this.items[i].isHorizontal) {
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
          this.items[j].calculate(valueKey);
          aPos += aPart;
        }

        // adjust dimensions for the next row
        if (this.items[i].isHorizontal) {
          restY += bLen;
          restH -= bLen;
        } else {
          restX += bLen;
          restW -= bLen;
        }
        restSum -= rowSum;

        i = endI;

      }

    } else {
      // Fit in rows. One row consits of one or more rects that should be as square as possible in average.
      // actIndex always points on the first counter, that has not fitted in.
      var actIndex = 0;
      while (actIndex < this.items.length) {
        // A row is always along the shorter edge (a).
        var isHorizontal = true; // horizontal row
        var a = restW;
        var b = restH;
        if (this.root.options.direction != 'horizontal') {
          if (restW > restH || this.root.options.direction == 'vertical') {
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
          rowSum += valueKey ? this.items[i].value[valueKey] : this.items[i].value;
          rowCount++;

          // a * bLen is the rect of the row
          var percentage = rowSum / restSum;
          var bLen = b * percentage;
          var avRel = (a / rowCount) / bLen;

          // store the information if the actual item is in a horizontal row or not
          this.items[i].isHorizontal = isHorizontal;

          // Let's assume it's a horizontal row. The rects are as square as possible,
          // as soon as the average width (a / rowCount) gets smaller than the row height (bLen).
          if (avRel < 1 || i == this.items.length - 1) {
            // Which is better, the actual or the previous fitting?
            if (avRelPrev < 1 / avRel) {
              // previous fitting is better, so revert to that
              rowSum -= valueKey ? this.items[i].value[valueKey] : this.items[i].value;
              rowCount--;
              bLen = b * rowSum / restSum;
              i--;
            }

            // store the information, at which item wrapping was done
            this.items[i].wrap = true;

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
              var val = valueKey ? this.items[j].value[valueKey] : this.items[j].value;
              var aPart = aLen * val / rowSum;
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
              this.items[j].calculate(valueKey);
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

    }


  };

  /**
   * A simple recursive drawing routine. You have to supply a function for drawing one item. This function gets the actual item 
   * as a parameter and has access to all the fields of that item, most important `x`, `y`, `w`, and `h`.
   * `level` and `depth` tells you, how deep this item is nested in the tree. The root node has level 0, an end node has depth 0. `itemCount` gives you the number of items inside this item, counted recursively and the `index` of item inside the parents sorted items array.
   * Example:         
   * ```javascript 
   * myTreemap.draw(function(item) { 
   *   let div = document.createElement('div');
   *   div.style.left = item.x;
   *   div.style.top = item.y;
   *   div.style.width = item.w;
   *   div.style.height = item.h;
   *   document.body.appendChild(div);
   * }); 
   * ```
   *
   * @method draw
   * @param {Function} drawItemFunction – A function that draws one item 
   */
  Treemap.prototype.draw = function(drawItemFunction) {
    if (!drawItemFunction) {
      console.warn('You have to supply a drawing function to see something.');
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


// Polyfills

if (!Array.isArray) {
  Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  }
}

module.exports = Treemap;