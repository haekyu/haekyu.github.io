import { icon_class } from '../icon.js'

gen_intro()
gen_anchor()
gen_footer()

function gen_intro() {

  $.getJSON('./sidebar/intro.json', function(data) {
    
    let intro = document.getElementById('intro')

    // Profile image
    let img = document.createElement('img')
    img.id = 'profile-img'
    img.className = 'intro'
    img.src = './img/haekyu.jpg'
    intro.appendChild(img)

    // Text contents
    for (let item of data) {

      // Generate item div
      let item_key = Object.keys(item)[0]
      let item_div = document.createElement('div')
      item_div.id = `intro-${item_key}`
      item_div.className = 'intro'
      intro.appendChild(item_div)

      // Generate item contents
      let item_contents = item[item_key]
      if (typeof item_contents == 'string') {
        item_div.innerText = item_contents
      } else {

        // Generate icon for href
        if ('icon' in item_contents) {
          let icon = document.createElement('i')
          icon.className = icon_class[item_contents['icon']]
          item_div.appendChild(icon)
        }

        // Generate href
        let href = document.createElement('a')
        href.className = 'href'
        href.innerText = item_contents['text']
        if (item_key == 'email') {
          href.href = `mailto:${item_contents['link']}`
        } else {
          href.href = item_contents['link']
        }
        item_div.appendChild(href)
      }
      
    }

  })
}

function gen_anchor() {

  // Generate anchor ul
  let anchor = document.getElementById('anchor')
  let anchor_ul = document.createElement('ul')
  anchor_ul.id = 'anchor-ul'
  anchor.appendChild(anchor_ul)

  // Add each item's anchor
  let contents_items = document.getElementById('contents').children
  for (let item of contents_items) {

    // Generate menu anchor
    let menu_li = document.createElement('li')
    let menu_href = document.createElement('a')
    menu_li.className = 'anchor-li'
    menu_href.id = `anchor-href-${item.id}`
    menu_href.className = 'anchor-href'
    menu_href.href = `#${item.id}`
    menu_href.innerText = mk_fst_letter_capital(item.id)
    anchor_ul.appendChild(menu_li)
    menu_li.appendChild(menu_href)

  }

  // Highlight navigation
  $('#contents').scroll(highlight_navigation)
  
}

function gen_footer() {
  let footer = document.getElementById('footer')
  let last_updated = '<div class="footer-comp">Last updated on Apr 14 2021</div>'
  let designed_by = '<div class="footer-comp">Designed and created by Haekyu Park</div>'
  footer.innerHTML = last_updated + designed_by
}

function mk_fst_letter_capital(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function get_css_val(x) {
  return getComputedStyle(document.documentElement).getPropertyValue(x)
}

function highlight_navigation() {

  let contents_items = document.getElementById('contents').children
  let scroll_position = $('#contents').scrollTop()
  let offset = 0
  if (window.innerWidth <= 992) {
    offset = getComputedStyle(document.getElementById('contents')).top
    offset = offset.replace('px', '')
    offset = parseFloat(offset)
  }

  for (let item of contents_items) {
    if (item.offsetTop > scroll_position - offset) {
      $(`.anchor-href`).css(
        'color', get_css_val('--gray-text')
      )
      $(`#anchor-href-${item.id}`).css(
        'color', get_css_val('--pink-text')
      )
      break
    }
  }

  
}