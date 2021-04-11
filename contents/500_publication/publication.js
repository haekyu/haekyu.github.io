import { icon_class } from '../../icon.js'

gen_publication()

function gen_publication() {

  $.getJSON('./contents/500_publication/publication.json', function(data) {

    // Generate title
    let publication = document.getElementById('publications')
    let title = document.createElement('div')
    title.id = 'publication-title'
    title.className = 'title'
    title.innerText = 'Publications'
    publication.appendChild(title)

    // Generate contents
    for (let item of data) {

      // Generate publication item wrapper
      let item_div = document.createElement('div')
      item_div.className = 'publication-item item'
      publication.appendChild(item_div)

      // Title
      let title = document.createElement('div')
      title.className = 'publication-title'
      title.innerText = item['title']
      item_div.appendChild(title)
      
      // Author
      let author = document.createElement('div')
      author.className = 'publication-author'
      author.innerHTML = item['author'].join(', ')
      item_div.appendChild(author)

      // Venue
      let venue = document.createElement('div')
      venue.className = 'publication-venue'
      venue.innerHTML = item['venue']
      item_div.appendChild(venue)

      // Links with icons
      let links = document.createElement('div')
      links.className = 'publication-links'
      for (let key in item['links']) {
        let link = document.createElement('a')
        let name = mk_fst_letter_capital(key)
        link.className = 'publication-href'
        link.href = item['links'][key]
        link.innerHTML = `<i class='${icon_class[key]}'></i>${name}`
        links.appendChild(link)
      }
      item_div.appendChild(links)

      // Detail toggle option with an icon
      if ('detail' in item) {
        let detail_option = document.createElement('a')
        detail_option.href = '#none'
        detail_option.className = 'publication-href'
        detail_option.onclick = function() { 
          toggle_block(`detail-${item['id']}`) 
        }
        detail_option.innerHTML = `<i class='${icon_class['detail']}'></i>Details`
        links.appendChild(detail_option)
      }
      

      // Bibtex toggle option with an icon
      if ('bibtex' in item) {
        let bibtex_option = document.createElement('a')
        bibtex_option.href = '#none'
        bibtex_option.className = 'publication-href'
        bibtex_option.onclick = function() { 
          toggle_block(`bibtex-${item['id']}`) 
        }
        bibtex_option.innerHTML = `<i class='${icon_class['bibtex']}'></i>Bibtex`
        links.appendChild(bibtex_option)
      }

      // Bibtex
      if ('bibtex' in item) {
        let bibtex = document.createElement('pre')
        bibtex.id = `bibtex-${item['id']}`
        bibtex.className = 'publication-bibtex'
        bibtex.innerHTML = item['bibtex'].slice(0, -1).join('\n  ') + '\n' + item['bibtex'].slice(-1)
        bibtex.style.display = 'none'
        item_div.appendChild(bibtex)
      }

      // Detail
      if ('detail' in item) {
        let detail = document.createElement('div')
        detail.id = `detail-${item['id']}`
        detail.className = 'publication-detail'
        detail.innerHTML = item['detail'].join(' ')
        detail.style.display = 'none'
        item_div.appendChild(detail)
      }
    }
  })
}

function mk_fst_letter_capital(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function toggle_block(id) {
  var block = document.getElementById(id)
  var block_display = block.style.display
  if (block_display == 'none') {
    block.style.display = 'block'
  } else {
    block.style.display = 'none'
  }
}