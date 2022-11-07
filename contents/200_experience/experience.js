gen_experience()

function gen_experience() {
  $.getJSON('./contents/200_experience/experience.json', function(data) {
    console.log("?????!!!!...")
    // Generate title
    let experience = document.getElementById('experience')
    let title = document.createElement('div')
    title.id = 'experience-title'
    title.className = 'title'
    title.innerText = 'Work Experience'
    experience.appendChild(title)

    // Generate contents
    for (let item of data) {

      let item_div = document.createElement('div')
      item_div.className = 'experience-item item'
      experience.appendChild(item_div)

      let item_name = document.createElement('div')
      item_name.className = 'experience-name item-name'
      item_name.innerText = item['name']
      item_div.appendChild(item_name)
      
      let item_date = document.createElement('div')
      item_date.className = 'experience-date item-date'
      item_date.innerText = item['date']
      item_div.appendChild(item_date)

      let item_contents = document.createElement('ul')
      item_contents.className = 'experience-ul item-ul'
      for (let detail of item['contents']) {
        let li = document.createElement('li')
        li.className = 'experience-li item-li'
        li.innerHTML = detail
        item_contents.appendChild(li)
      }
      item_div.appendChild(item_contents)
    }
  })
}