gen_projects('open', 'Open-Source Research Projects')
gen_projects('other', 'Other Projects')

function gen_projects(category, title_text) {

  $.getJSON(`./contents/600_projects/${category}_projects.json`, function(data) {

    // Generate projects div    
    let category_projects = document.getElementById(`${category}-projects`)

    // Generate title
    let title = document.createElement('div')
    title.id = 'honors-title'
    title.className = 'title'
    title.innerText = title_text
    category_projects.appendChild(title)

    // Generate contents
    for (let item of data) {

      let item_div = document.createElement('div')
      item_div.className = `${category}-project-item item`
      category_projects.appendChild(item_div)

      let item_name = document.createElement('div')
      item_name.className = `${category}-project-name item-name`
      item_name.innerText = item['name']
      item_div.appendChild(item_name)

      let item_date = document.createElement('div')
      item_date.className = `${category}-project-date item-date`
      item_date.innerText = item['date']
      item_div.appendChild(item_date)

      let item_contents = document.createElement('ul')
      item_contents.className = `${category}-project-ul item-ul`
      for (let detail of item['contents']) {
        let li = document.createElement('li')
        li.className = `${category}-project-li item-li`
        li.innerHTML = detail
        item_contents.appendChild(li)
      }
      item_div.appendChild(item_contents)

    }

  })
}
