// on document load
var defaultAccount = "https://api.mixcloud.com/Stewart_Avenue/"
var defaulturl = "https://api.mixcloud.com/Stewart_Avenue/cloudcasts/?limit=20&offset=0"

var minCount = 0;
var mixCount = 0;
var mixer;
$(document).ready(function () {
  urldata = defaulturl
  fetchmixcloud(urldata)

  fetch(defaultAccount)
    .then(response => response.json())
    .then(data => {
      $(document).find('#totalmix').text(data.cloudcast_count);
    })

})

function fetchmixcloud(urldata) {
  // fetch data
  $('#page-next, #page-back').attr('href', '')
  $('#page-next, #page-back').attr('href', '')
  //document.getElementById('mix-collection').innerHTML = '';

  fetch(urldata)
    .then(response => response.json())
    .then(data => {
      let html = "";
      let htmlfilter = "";
      let pagebutton = "";
      const paging = data.paging
      data = data.data
      //console.log(paging)
      isNext = 'next' in paging
      isPrevious = 'previous' in paging

      if (isNext == true && isPrevious == true) {
        //console.log('has both')
        $('#page-next').attr('href', paging.next)
        $('#page-back').attr('href', paging.previous)
        $('#page-next, #page-back').show(0)
      } else if (isNext == false) {
        //console.log('no next')
        $('#page-back').attr('href', paging.previous)
        $('#page-next').hide(0)
        $('#page-back').show(0)
      } else if (isPrevious == false) {
        //console.log('no previous')
        $('#page-next').attr('href', paging.next)
        $('#page-back').hide(0)
        $('#page-next').show(0)
      }

      //pagebutton += " <a id="pageback" href="#">BACK</a>";

      //document.getElementById('pagination-container').innerHTML = pagebutton;



      // for each data item
      data.forEach(function (val, index) {
        mixCount += 1
        minCount += 1
        var index = index
        const name = val.name
        const key = val.key
        const duration = val.audio_length
        const tags = val.tags
        const picture = val.pictures.large
        // add item html
        html += "<div class='mix-item ";
        tags.forEach(function (tag) {
          const tagname = tag.name
          html += convertToSlug(tagname) + ' ';
        })
        html += "' data-key='" + key + "'>" + name + "<div class='duration'>" + duration + "</div>";
        html += "<img src='" + picture + "'></img></div>";
        // add filter html
        tags.forEach(function (tag, i) {
          const tagname = tag.name
          htmlfilter += "<a class='filter-button' data-filter='." + convertToSlug(tagname) + "'>" + tagname + "</a>";
        })
      });

      // append to html
      document.getElementById('mix-collection').innerHTML = html;
      document.getElementById('tag-collection').innerHTML = htmlfilter;

      //$('#tag-collection').append(htmlfilter);

      //console.log(mixCount)
      $(document).find('#mixnumber').text(mixCount);
      $(document).find('#minnumber').text(minCount - 20);

      convertduration()
      removeDuplicates()

      mixitupInit()

    })
}

$(document).on('click', '#page-next, #page-back', function (e) {
  e.preventDefault()
  $(this).hide(0)
  mixitupDestroy()

  urldata = $(this).attr('href')
  fetchmixcloud(urldata)
  if ($(this).is('#page-back')) {
    //console.log('this is back')
    mixCount = mixCount - 40
    minCount = minCount - 40
    //console.log(mixCount)

  } else {
    //console.log('this is next')
  }
  $(this).show(0)
})

function convertToSlug(Text) {
  return Text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    ;
}

function removeDuplicates() {
  var seen = {};
  $('a[data-filter]').each(function () {
    //console.log($(this))
    var txt = $(this).text();
    if (seen[txt])
      $(this).remove();
    else
      seen[txt] = true;
  });
}


$(document).on('click', '.mix-item', function () {
  var $this = $(this)
  var key = $this.attr('data-key')
  console.log(key)
  var embedUrl = 'https://api.mixcloud.com' + key + 'embed-json/'
  console.log(embedUrl)

  if ($("#mixcloud").attr('src') != '') {
    console.log('something is playing')
    var widget = Mixcloud.PlayerWidget(document.getElementById("mixcloud"));
    widget.ready.then(function () {
      widget.pause()
    })
  } else {
    console.log('nothing is playing')
  }

  $.getJSON(embedUrl, function (data) {
    //console.log(data.html)
    var source = $(data.html).attr('src')
    // console.log(source)
    $('#mixcloud').attr('src', source + "&mini=1&hide_artwork=1&autoplay=1")
  })

  if (!$this.hasClass('selected')) {
    $('.mix-item').removeClass('selected')
    $this.addClass('selected')
  } else {

  }

})


$(document).on('click', '.filter-button', function (e) {
  e.preventDefault()

  var $this = $(this)

  if (!$this.hasClass('selected')) {
    $('.filter-button').removeClass('selected')
    $this.addClass('selected')
  } else {

  }
})

function convertduration() {

  $('.duration').each(function () {
    const secs = $(this).text();
    //console.log(secs)
    const formatted = moment.utc(secs * 1000).format('HH:mm:ss');
    //console.log(formatted)
    $(this).text(formatted)
  })

}

var containerEl = document.querySelector('#mix-collection');
var config = {
  selectors: {
    target: '.mix-item'
  },
  controls: {
    enable: true,
    live: true,
    toggleLogic: 'or'
  },
  animation: {
    duration: 0
  }
}

function mixitupInit() {
  var mixer = mixitup(containerEl, config);
}

function mixitupDestroy() {
  mixer = mixitup(containerEl);
  mixer.destroy()
}


$(document).on('mouseover', '.mix-item', function () {
  //console.log(img)
  var img = $(this).children('img')
  $('.mix-item img').removeClass('hoverimg')
  $(img).addClass('hoverimg')
})

$(document).on('mouseout', '.mix-item', function () {
  $('.mix-item img').removeClass('hoverimg')
})

$(document).on('click', '#mode', function () {
  if ($('body').hasClass('dark')) {
    $('body').removeClass('dark');
  } else {
    $('body').addClass('dark');
  }
})