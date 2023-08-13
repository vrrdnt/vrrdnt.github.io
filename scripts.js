document.addEventListener('mousemove', function (event) {
    if (window.event) { // IE fix
      event = window.event;
    }

    // Grab the mouse's X-position.
    var mousex = event.clientX;
    var mousey = event.clientY;
    document.title = `${String.fromCharCode(Math.round(mousex/3))}${String.fromCharCode(Math.round(mousey/3))}${String.fromCharCode(Math.round((mousey + mousex)/6))}`;
    document.getElementById('endText').innerHTML = 
    `${String.fromCharCode(Math.round(mousex/3))} \
    ${String.fromCharCode(Math.round(mousey/3))} \
    ${String.fromCharCode(Math.round((mousey + mousex)/6))} \
    ${String.fromCharCode(Math.round(mousex*mousey/mousex))}`
  });