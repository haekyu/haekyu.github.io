function toggle_block(id) {
  var block = document.getElementById(id)
  var block_display = block.style.display
  if (block_display == 'none') {
    block.style.display = 'block'
  } else {
    block.style.display = 'none'
  }
}


// $(function(){
//   $("#side-bar").load("import/side-bar.html");
// });

$(function(){
  $("#img").load("import/img.html");
});

$(function(){
  $("#small-window").load("import/small-window.html");
});

// $(function(){
//   $("#sideNav").load("import/side-bar.html");
// });

$(function(){
  $("#header").load("import/header.html");
});

$(function(){
  $("#news").load("import/news.html");
});

$(function(){
  $("#education").load("import/education.html");
});

$(function(){
  $("#experience").load("import/experience.html");
});

$(function(){
  $("#publication").load("import/publication.html");
});

$(function(){
  $("#project").load("import/project.html");
});

$(function(){
  $("#honors").load("import/honors.html");
});

$(function(){
  $("#misc").load("import/misc.html");
});
















