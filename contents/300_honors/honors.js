gen_honors()

function gen_honors() {

  $.getJSON('./contents/300_honors/honors.json', function(data) {

    // Generate title
    let honors = document.getElementById('honors')
    let title = document.createElement('div')
    title.id = 'honors-title'
    title.className = 'title'
    title.innerText = 'Honors and Awards'
    honors.appendChild(title)

    // Generate contents
    for (let item of data) {

      let item_div = document.createElement('div')
      item_div.className = 'honors-item item'
      honors.appendChild(item_div)

      let item_name = document.createElement('div')
      item_name.className = 'honors-name item-name'
      item_name.innerText = item['name']
      item_div.appendChild(item_name)
      
      let item_date = document.createElement('div')
      item_date.className = 'honors-date item-date'
      item_date.innerText = item['date']
      item_div.appendChild(item_date)

      let item_contents = document.createElement('ul')
      item_contents.className = 'honors-ul item-ul'
      for (let detail of item['contents']) {
        let li = document.createElement('li')
        li.className = 'honors-li item-li'
        li.innerHTML = detail
        item_contents.appendChild(li)
      }
      item_div.appendChild(item_contents)
    }
  })
}