/* -------- GBBGTxT -------- */
/*  gbbgtxt.jamespark.ninja  */
/* --- James Park : 2021 --- */

jQuery(document).ready( function($) {
  
  // Using MaxBGCalc as part of the functionality
  var max_full = 2040,
      min_X_full = 160,
      min_Y_full = 144,
      typingTimer,
      doneTypingInterval = 1000;
  
  // GBBGTxT Defaults
  var bgt_padding_X = 2,
      bgt_padding_Y = 2,
      bgt_linehgt = 0,
      bgt_orientation = 'portrait',
      tileset = 'http://gbbgtxt.jamespark.ninja/images/tileset.png',
      canvas = document.getElementById("gbbgtxt-c-preview"),
      context = canvas.getContext('2d'),
      img = new Image();
  
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      tileset = 'http://localhost/gbbgtxt/images/tileset.png';
  }
  
  img.src = tileset;
  
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  function roundToNearest8(x, direction) {
    if (direction == 'higher') {
      return Math.ceil(x/8)*8;
    } else if (direction == 'lower') {
      return Math.floor(x/8)*8;
    } else {
      return Math.round(x/8)*8;
    }
  }
  
  function tileCount(length) {
    var amount = length / 8;
    return amount;
  }
  
  function arraySearch(arr,val) {
    for (var i=0; i<arr.length; i++) {
      var decode = $('<textarea />').html(arr[i]).text();
      if (decode === val) {
        return i;
      }
    }
    return false;
  }
  
  function asciiLookup(char) {
    var section = false,
        array = [
          " ", "!", "&#x22;", "#", "$", "%", "&#x26;", "&#x27;", "(", ")", "*", "+", ",", "-", ".", "/",
          "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "&#x3C;", "=", "&#x3E;", "?",
          "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
          "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_",
          "&#x60;", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
          "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "NA",
          "&#x20AC;", "NA", "&#x201A;", "&#x17F;", "&#x201E;", "&#x2026;", "&#x2020;", "&#x2021;", "NA", "&#x2030;", "&#x160;", "&#x2039;", "&#x152;", "NA", "&#x17D;", "NA",
          "NA", "&#x2018;", "&#x2019;", "&#x201C;", "&#x201D;", "&#x2022;", "&#x2013;", "&#x2014;", "&#x2DC;", "&#x2122;", "&#x161;", "&#x203A;", "&#x153;", "NA", "&#x17E;", "&#x178;",
          "NA", "&#xA1;", "&#xA2;", "&#xA3;", "NA", "&#xA5;", "&#xA6;", "&#xA7;", "&#xA8;", "&#xA9;", "&#xAB;", "&#xAC;", "NA", "NA", "&#xAE;", "NA",
          "&#x25CB;", "&#xB1;", "&#xB2;", "&#xB3;", "NA", "&#xB5;", "&#xB6;", "NA", "NA", "&#xB9;", "&#x2070;", "&#xBB;", "NA", "NA", "NA", "&#xBF;",
          "&#xC0;", "&#xC1;", "&#xC2;", "&#xC3;", "&#xC4;", "&#x226;", "&#xC6;", "&#xC7;", "&#xC8;", "&#xC9;", "&#x1EBC;", "&#xCB;", "&#xCC;", "&#xCD;", "&#xCE;", "&#xCF;",
          "&#xD0;", "&#xD1;", "&#xD2;", "&#xD3;", "&#xD4;", "&#xD5;", "&#xD6;", "&#xD7;", "&#xD8;", "&#xD9;", "&#xDA;", "&#xDB;", "&#xDC;", "&#xDD;", "&#xDE;", "&#xDF;",
          "&#xE0;", "&#xE1;", "&#xE2;", "&#xE3;", "&#xE4;", "&#x227;", "&#xE6;", "&#xE7;", "&#xE8;", "&#xE9;", "&#xEA;", "&#xEB;", "&#xEC;", "&#xED;", "&#xEE;", "&#xEF;",
          "&#xF0;", "&#xF1;", "&#xF2;", "&#xF3;", "&#xF4;", "&#xF5;", "&#xF6;", "&#xF7;", "&#xF8;", "&#xF9;", "&#xFA;", "&#xFB;", "&#xFC;", "&#xFD;", "&#xFE;", "&#xFF;"
        ];
    
    section = arraySearch(array, char);
    return section;
  }
  
  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };
  
  function printText(row, position, tile) { 
    
    var text = tile,        
        tplx = tileCount(img.width),
        tply = tileCount(img.height),
        offsetx = (text % tplx) * 8,
        offsety = Math.floor(text / tplx) * 8,
        x = position * 8,
        y = row * 8;

    context.drawImage(img, offsetx, offsety, 8, 8, x, y, 8, 8);
  }
  
  function updatePreviewCanvas(input, e) {
    var content = input.val(),
        content = content.replace(/\r\n|\r|\n/g, ' \r\n'),
        arr     = new Array(),
        max_width = 160,
        max_height = 2040,
        words = content.split(' '),
        lineCount = 0,
        line = 0,
        text = {},
        tiles = {},
        canvasY = 0,
        canvasX = 0;
    
    //input.val(content);
        
    if (bgt_orientation == 'landscape') {
      max_height = 160;
      max_width = 2040;
    }   
    
    var max_tiles_x = tileCount(max_width) - (bgt_padding_X * 2),
        max_tiles_y = tileCount(max_height) - (bgt_padding_Y * 2),
        longest = 0;
    
    for (var w=0; w<words.length; w++) {
      lineCount += words[w].length; //lineCount++;
      var nl = match = /\r|\n/.exec(words[w]),
          word = words[w];
        
        if (word.length >= max_tiles_x) {
            
        }
      
      console.log(lineCount + ' - ' + max_tiles_x)
        
      if (nl || (lineCount > max_tiles_x)) {
        if (nl) { 
          var nlc = words[w].split(/\r\n|\r|\n/).length; 
          
          if (bgt_linehgt > 0) {
              for (var nli = 0; nli < (nlc - 1); nli++) {
                line++; text[line] = ' ';
              }
          }
          
          word = words[w].replace(/\r\n|\r|\n/g, ''); 
        }
        
        var tempCount = lineCount -  words[w].length;
        
        if (tempCount > longest) { longest = tempCount; }
        
        for (var lh = 0; lh < bgt_linehgt; lh++) {
          line++; text[line] = ' ';
        }
        line++; lineCount = words[w].length; lineCount ++;
      } else {
        if (lineCount > longest) { longest = lineCount; }
      }
      
      if (text[line] == null) { 
        text[line] = word; 
      } else {
        text[line] += word;
      }
      //if (w != (words.length - 1)) { text[line] += ' '; }
    }
    
    //console.log(longest);
    
    for (var key in text) {
      var line = text[key].trim();
      tiles[key] = {};
      
      for (var x=0; x<line.length; x++) {
        var char = line[x],
            tile = asciiLookup(char);
        
        tiles[key][x] = tile; 
      }
    }
    
    var lines = Object.size(tiles),
        current_tiles_Y = lines + (bgt_padding_Y * 2),
        current_size_Y = current_tiles_Y * 8,
        current_tiles_X = longest + (bgt_padding_X * 2),
        current_size_X = current_tiles_X * 8,
        total_tiles_Y = current_tiles_Y + (bgt_padding_Y * 2),
        total_tiles_X = current_tiles_X + (bgt_padding_X * 2),
        empty_Y = ((lines + (2 * bgt_padding_Y)) > tileCount(min_Y_full) ? tileCount(min_Y_full) - lines - bgt_padding_Y : tileCount(min_Y_full) - lines),
        empty_X = ((longest + (2 * bgt_padding_X)) > tileCount(min_X_full) ? tileCount(min_X_full) - longest - bgt_padding_X : tileCount(min_X_full) - longest),
        diff_Y = tileCount(min_Y_full) - empty_Y,
        diff_X = tileCount(min_X_full) - empty_X;
    
    canvasY = (current_size_Y < min_Y_full ? min_Y_full : current_size_Y);
    canvasX = (current_size_X < min_X_full ? min_X_full : current_size_X);
    
    canvasY = (canvasY > max_height ? max_height : canvasY);
    canvasX = (canvasX > max_width ? max_width : canvasX);
    
    $('.gbbgtxt-c-overlay').css('height', canvasY+'px');
    canvas.height = canvasY;
    canvas.width = canvasX;
    
    var blank_width = (current_tiles_X < (max_tiles_x + (bgt_padding_X * 2)) ? max_tiles_x + (bgt_padding_X * 2) : current_tiles_X);
    
    for (var i = 0; i < bgt_padding_Y; i++) {
      for (var t = 0; t < blank_width; t++) {
        printText(i, t, 0);
      }
    }
    
    for (var key in tiles) {
      var linec = Object.size(tiles[key]) + bgt_padding_X,
          minus = max_tiles_x - linec + (bgt_padding_X * 2),
          keynum = parseInt(key, 10),
          row = keynum + bgt_padding_Y;
        
        console.dir([key, bgt_padding_X, max_tiles_x, linec, minus, keynum, row]);
      
      for (var p = 0; p < bgt_padding_X; p++) {
        printText(row, p, 0);
      }
      
      for (var k in tiles[key]) {
        var knum = parseInt(k, 10);
        printText(row, (knum+bgt_padding_X), tiles[key][k]);
      }
      
      for (var p = 0; p < minus; p++) {
        printText(row, (p+linec), 0);
      }
    }
    
    var padding_bottom = empty_Y - bgt_padding_Y,
        bottom_pos = diff_Y + bgt_padding_Y;
    if (empty_Y <= bgt_padding_Y) {
      padding_bottom = bgt_padding_Y;
      bottom_pos = lines + bgt_padding_Y;
    }
    
    for (var j = 0; j < padding_bottom; j++) {
      var final_pad = j + bottom_pos;
      for (var t = 0; t < blank_width; t++) {
        printText(final_pad, t, 0);
      }
    }
    
  }
  
  function handleImage(e){
    if (e.files && e.files[0]) {
      var reader = new FileReader();
      reader.onload = function(event){
        img.src = event.target.result;
        $('img.switch_tileset').attr('src', event.target.result);
        setTimeout(function(){
          updatePreviewCanvas($('textarea[name="gbbgtxt-a-text-entry"]'), this);
        }, 500);
      }
      reader.readAsDataURL(e.files[0]); 
    }
  }
  
  $(document).on('keyup', 'textarea[name="gbbgtxt-a-text-entry"]', function(e) {
    var input = $(this);
    
    clearTimeout(typingTimer);
    
    typingTimer = setTimeout(function() {
      updatePreviewCanvas(input, e);
    }, doneTypingInterval);    
  });
  
  $(document).on('keydown', 'textarea[name="gbbgtxt-a-text-entry"]', function(e) {
    clearTimeout(typingTimer);  
  });
  
  $(document).on('keyup', 'input[name="gbbgtxt-a-padding-x"]', function(e) {
    var val = $(this).val();
    bgt_padding_X = parseInt(val, 10);
    clearTimeout(typingTimer);
    
    typingTimer = setTimeout(function() {
      updatePreviewCanvas($('textarea[name="gbbgtxt-a-text-entry"]'), this);
    }, doneTypingInterval);    
  });
  
  $(document).on('keyup', 'input[name="gbbgtxt-a-padding-y"]', function(e) {
    var val = $(this).val();
    bgt_padding_Y = parseInt(val, 10);
    clearTimeout(typingTimer);
    
    typingTimer = setTimeout(function() {
      updatePreviewCanvas($('textarea[name="gbbgtxt-a-text-entry"]'), this);
    }, doneTypingInterval);    
  });
  
  $(document).on('keyup', 'input[name="gbbgtxt-a-lineheight"]', function(e) {
    var val = $(this).val();
    bgt_linehgt = parseInt(val, 10);
    clearTimeout(typingTimer);
    
    typingTimer = setTimeout(function() {
      updatePreviewCanvas($('textarea[name="gbbgtxt-a-text-entry"]'), this);
    }, doneTypingInterval);    
  });
  
  $(document).on('keydown', 'input[type="number"]', function(e) {
    clearTimeout(typingTimer);  
  });
  
  $(document).on('click', '.gbbgtxt-a-generate', function(e){
    e.preventDefault();
    var src = canvas.toDataURL();
    
    $('.gbbgtxt-c-output > img').attr('src', src);
    $('.gbbgtxt-c-output').slideDown();
  });
  
  $(document).on('click', '.switch_tileset', function(e){
    e.preventDefault();
    $('input[name="tileset_preview"]').click();
  });
  
  $(document).on('change', '[name="tileset_preview"]', function(e){
    handleImage(this);
  });
  
  $(document).on('change', '[name="gbbgtxt-a-orientation"]', function(e){
    bgt_orientation = $('[name="gbbgtxt-a-orientation"] option:selected').val();
    
    updatePreviewCanvas($('textarea[name="gbbgtxt-a-text-entry"]'), this);
    
    if (bgt_orientation == 'landscape') { 
      $('.gbbgtxt-c-preview-container.md-half').removeClass('md-half');
      $('.gbbgtxt-c-output-container.md-half').removeClass('md-half');
    } else {
      $('.gbbgtxt-c-preview-container:not(.md-half)').addClass('md-half');
      $('.gbbgtxt-c-output-container:not(.md-half)').addClass('md-half');
    }
  }); 
  
});
