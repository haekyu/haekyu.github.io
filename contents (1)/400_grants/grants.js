gen_grants()

function gen_grants() {

  $.getJSON('./contents/400_grants/grants.json', function(data) {

    // Generate title
    let grants = document.getElementById('grants')
    let title = document.createElement('div')
    title.id = 'grants-title'
    title.className = 'title'
    title.innerText = 'Grants and Funding'
    grants.appendChild(title)

    // Generate contents
    for (let item of data) {

      let item_div = document.createElement('div')
      item_div.className = 'grants-item item'
      grants.appendChild(item_div)

      let item_name = document.createElement('div')
      item_name.className = 'grants-name item-name'
      item_name.innerText = item['name']
      item_div.appendChild(item_name)
      
      let item_date = document.createElement('div')
      item_date.className = 'grants-date item-date'
      item_date.innerText = item['date']
      item_div.appendChild(item_date)

      let item_contents = document.createElement('ul')
      item_contents.className = 'grants-ul item-ul'
      for (let detail of item['contents']) {
        let li = document.createElement('li')
        li.className = 'grants-li item-li'
        li.innerHTML = detail
        item_contents.appendChild(li)
      }
      item_div.appendChild(item_contents)
    }
  })
}