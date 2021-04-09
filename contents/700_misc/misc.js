gen_misc('talks', 'Talks')
gen_misc('tutorial', 'Tutorial')
gen_misc('teaching', 'Teaching')
gen_misc('mentoring', 'Mentoring')
gen_misc('certification', 'Licenses and Certifications')
gen_misc('service', 'Professional Service')
gen_misc('skills', 'Technical Skills')

function gen_misc(category, title_text) {

  $.getJSON(`./contents/700_misc/${category}.json`, function(data) {

    // Generate misc div    
    let category_misc = document.getElementById(`misc-${category}`)

    // Generate title
    let title = document.createElement('div')
    title.id = 'honors-title'
    title.className = 'title'
    title.innerText = title_text
    category_misc.appendChild(title)

    // Generate contents
    for (let item of data) {

      let item_div = document.createElement('div')
      item_div.className = `${category}-misc-item item`
      category_misc.appendChild(item_div)

      let item_name = document.createElement('div')
      item_name.className = `${category}-misc-name item-name`
      item_name.innerText = item['name']
      item_div.appendChild(item_name)

      if ('date' in item) {
        let item_date = document.createElement('div')
        item_date.className = `${category}-misc-date item-date`
        item_date.innerText = item['date']
        item_div.appendChild(item_date)
      }
      
      let item_contents = document.createElement('ul')
      item_contents.className = `${category}-misc-ul item-ul`
      for (let detail of item['contents']) {
        let li = document.createElement('li')
        li.className = `${category}-misc-li item-li`
        li.innerHTML = detail
        item_contents.appendChild(li)
      }
      item_div.appendChild(item_contents)

    }

  })
}
