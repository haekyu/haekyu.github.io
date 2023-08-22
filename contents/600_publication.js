gen_publication()

function gen_publication() {

  var icon_class = {
    'email': 'fas fa-envelope',
    'cv': 'fas fa-address-card',
    'linkedin': 'fab fa-linkedin',
    'google-scholar': 'fas fa-graduation-cap',
    'paper': 'far fa-file-alt',
    'demo': 'fas fa-play',
    'bibtex': 'fa-solid fa-book-open',
    'detail': 'fa-solid fa-circle-info',
    'webpage': 'fas fa-globe'
  }

  $.getJSON('./contents/600_publication.json', function(data) {

    // Set publication section
    let publication = document.getElementById('publication')
    let innerPublication = document.createElement('div')
    publication.appendChild(innerPublication)

    // Create container
    let container = document.createElement('div')
    container.className = 'container'
    innerPublication.appendChild(container)

    // Create title
    let title = document.createElement('h2')
    title.className = 'ds-heading'
    title.innerText = 'Publications'
    container.appendChild(title)

    // Generate contents
    for (let item of data) {

      // Generate publication item wrapper
      let item_div = document.createElement('div')
      item_div.className = 'ds-item'
      container.appendChild(item_div)

      // Title
      let title = document.createElement('div')
      title.className = 'ds-title-name'
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
        if (item['links'][key].length > 0) {
          link.className = 'publication-href'
          link.href = item['links'][key]
          link.innerHTML = `<i class='${icon_class[key]}'></i>${name}`
          links.appendChild(link)  
        }
      }
      item_div.appendChild(links)

      // Detail toggle option with an icon
      if ('detail' in item) {
        let detail_option = document.createElement('a')
        detail_option.href = '#none'
        detail_option.className = 'publication-href publication-detail'
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
        bibtex_option.className = 'publication-bibtex-item publication-bibtex publication-href'
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