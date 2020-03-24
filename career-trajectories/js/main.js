import {
  left_option_style
} from './left_style.js'

import {
  outline_setting,
  legend_setting
} from './main_style.js'



// var file_list = ['../data/vis_sample.csv']
var file_list = ['./data/vis_sample.csv']
var profile_attributes = ['Education', 'NumSkills']
var transition_attributes = ['WorkExperience', 'StartDates', 'EndDates']

var selected = {
  'education': 'all-attribute'
}

var width = 5000
var height = 400

var attribute_setting = {
  'attribute-y': 50,
  'attribute-line-y': 35,
  'education-left': 250,
  'education-option-left': 50,
  'option-height': 30,
  'option-box-tb-margin': 10,
  'option-x': 20,
  'option-y': 20,
  'width': 200
}
var node_setting = {
  'width': 30,
  'tb_padding': 50,
  'lr_padding': 150,
  'left_margin': 50,
  'min_height': 0,
  'max_height': 100
}

// Fontawsome icon (https://fontawesome.com/cheatsheet?from=io)
var icons = {
  'angle-up': '\uf106', 
  'angle-down': '\uf107',
  'caret-down': '\uf0d7',
  'caret-up': '\uf0d8',
}

var educations = ['HighSchool', 'Bachelors', 'Masters', 'Doctorate', 'Associates', 'Certificate', 'None/Other']
var education_colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f']
var positions = ['Specialist', 'Senior', 'Junior', 'Worker']
var position_colors = ['#d7191c', '#fdae61', '#abdda4', '#2b83ba']

var trajectory_data = []
var node_data = []
var transition_data = []
var node_transition_data = []
var node_passing_data = {}
var num_max_transitions = 0
var position_dict = {}
var transition_dict = {}

var x_scale_sankey = {}
var y_scale_sankey = []
var education_color_dict = {}
var position_color_dict = {}
var node_height_scale = {}
var edge_start_y = {}
var edge_end_y = {}

Promise.all(file_list.map(file => d3.dsv(',', file))).then(function(data) { 

  console.log(data[0])

  // Vis setting
  main_vis_setting()
  gen_g_left()

  // Color setting
  education_color_dict = gen_color_dict(educations, education_colors)
  position_color_dict = gen_color_dict(positions, position_colors)

  // Parse the dataset
  trajectory_data = parse_trajectory_data(data[0])
  node_passing_data = parse_node_passing_data(trajectory_data)

  // Draw Sankey
  draw_sankey_by_education('All')
  
  window.trajectory_data = trajectory_data
  window.position_dict = position_dict
  window.transition_data = transition_data
  window.transition_dict = transition_dict
  window.node_transition_data = node_transition_data
  window.node_passing_data = node_passing_data

})

////////////////////////////////////////////////////////////////////////////////
// Main setting
////////////////////////////////////////////////////////////////////////////////

function main_vis_setting() {

  gen_main_svg()
  gen_g_left_division()
  gen_sankey_division()

  function gen_main_svg() {
    d3.select('body')
    .append('svg')
    .attr('id', 'svg-main')
  }

  function gen_g_left_division() {
    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-left')
      
    d3.select('#g-left')
      .append('g')
      .attr('id', 'g-settings')

    d3.select('#g-left')
      .append('g')
      .attr('id', 'g-filter-data')
  }

  function gen_sankey_division() {
    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-people-attribute')

    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-sankey-legend')
      .attr('transform', gen_translate(outline_setting['legend-left'], outline_setting['legend-y']))

    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-sankey-edge')
      .attr('transform', gen_translate(outline_setting['sankey-left'], outline_setting['sankey-y']))

    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-sankey-node')
      .attr('transform', gen_translate(outline_setting['sankey-left'], outline_setting['sankey-y']))

    d3.select('#svg-main')
      .append('g')
      .attr('id', 'g-attribute-option')
      .attr('transform', gen_translate(outline_setting['option-left'], outline_setting['option-y']))
  }

}

////////////////////////////////////////////////////////////////////////////////
// General functions
////////////////////////////////////////////////////////////////////////////////

function gen_color_dict(items, colors) {
  var color_dict = {}
  items.forEach((e, i) => {
    color_dict[e] = colors[i]
  })
  return color_dict
}

function gen_translate(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

function does_exist(id) {
  var element = document.getElementById(id)
  if (element) {
    return true
  } else {
    return false
  }
}

function toggle_display(id) {
  var element = d3.select('#' + id)
  var display_setting = element.style('display')
  if (display_setting == 'none') {
    element.style('display', 'block')
  } else {
    element.style('display', 'none')
  }
}

////////////////////////////////////////////////////////////////////////////////
// Parse datasets
////////////////////////////////////////////////////////////////////////////////
function parse_trajectory_data(data) {
  data.forEach((info, i) => {
    data[i] = {
      'Education': info['Education'],
      'NumSkills': parseInt(info['NumSkills']),
      'WorkExperience': str_to_arr(info['WorkExperience']),
      'StartDates': dates_str_to_arr(info['StartDates']),
      'EndDates': dates_str_to_arr(info['EndDates'])
    }
  })
  num_max_transitions = d3.max(data.map(x => x['WorkExperience'].length))
  return data
}

function get_position_dict(trajectory_data) {
  var position_dict = {}

  for (var i = 0; i < num_max_transitions; i++) {
    position_dict[i] = {}
    positions.forEach(position => {
      position_dict[i][position] = 0
    })
  }

  trajectory_data.forEach(info => {
    info['WorkExperience'].forEach((position, i) => {
      position_dict[i][position] += 1
    })
  })

  return position_dict
}

function parse_node_passing_data(trajectory_data) {
  var node_passing_data = {}
  node_passing_data['all-attribute'] = get_node_passing_data(trajectory_data)
  educations.forEach(education => {
    var filtered_trajectory_data = trajectory_data.filter(function(d) {
      return d['Education'] == education
    })
    node_passing_data[education] = get_node_passing_data(filtered_trajectory_data)
  })
  return node_passing_data
}

function get_node_passing_data(trajectory_data) {
  var node_passing_data = {}
  for (var jobNumber = 0; jobNumber < num_max_transitions; jobNumber++) {
    positions.forEach(position => {
      var node_id = ['node', jobNumber, position].join('-')
      if (!(node_id in node_passing_data)) {
        node_passing_data[node_id] = {}
      }
      var data_passing_node = filter_data_passing_one_node(jobNumber, position, trajectory_data)
      aggregate_transition(data_passing_node, node_id)
      node_passing_data[node_id] = Object.entries(node_passing_data[node_id]).map(function(x) {
        return {'edge': x[0], 'num': x[1]}
      })
    })
  }
  return node_passing_data

  function filter_data_passing_one_node(jobNumber, position, trajectory_data) {
    var filtered_data = trajectory_data.filter(function(d) {
      if (d['WorkExperience'].length > jobNumber) {
        if (d['WorkExperience'][jobNumber] == position) {
          return true
        }
      }
      return false
    })

    return filtered_data
  }

  function aggregate_transition(data_passing_node, node_id) {
    data_passing_node.forEach(d => {
      for (var i = 0; i < d['WorkExperience'].length - 1; i++) {
        var from = d['WorkExperience'][i]
        var to = d['WorkExperience'][i + 1]
        var transition_id = [i, from, to].join('-')
        if (!(transition_id in node_passing_data[node_id])) {
          node_passing_data[node_id][transition_id] = 0
        }
        node_passing_data[node_id][transition_id] += 1
      }
    })
  }
}

function get_transition_data(transition_dict) {

  var transition_data = gen_transition_data(transition_dict)
  return transition_data

  function gen_transition_data(transition_dict) {
    var transition_data = []

    for (var jobNumber in transition_dict) {
      for (var from in transition_dict[jobNumber]) {
        for (var to in transition_dict[jobNumber][from]) {
          for (var e in transition_dict[jobNumber][from][to]) {
            for (var s in transition_dict[jobNumber][from][to][e]) {
              transition_data.push({
                'jobNumber': parseInt(jobNumber),
                'from': from,
                'to': to,
                'Education': e,
                'NumSkills': parseInt(s),
                'num': parseInt(transition_dict[jobNumber][from][to][e][s])
              })
            }
          }
        }
      }
    }
    return transition_data
  }
  
}

function get_transition_dict(trajectory_data) {
  var transition_dict = {}
  for (var jobNumber = 0; jobNumber < num_max_transitions; jobNumber++) {
    if (jobNumber > 0) {
      transition_dict[jobNumber - 1] = {}
    }
  }

  trajectory_data.forEach(info => {
    var education = info['Education']
    var numSkills = info['NumSkills']
    info['WorkExperience'].forEach((position, jobNumber) => {
      if (jobNumber > 0) {
        var prev_position = info['WorkExperience'][jobNumber - 1]
        if (!(prev_position in transition_dict[jobNumber - 1])) {
          transition_dict[jobNumber - 1][prev_position] = {}
        }
        if (!(position in transition_dict[jobNumber - 1][prev_position])) {
          transition_dict[jobNumber - 1][prev_position][position] = {}
        }
        if (!(education in transition_dict[jobNumber - 1][prev_position][position])) {
          transition_dict[jobNumber - 1][prev_position][position][education] = {}
        }
        if (!(numSkills in transition_dict[jobNumber - 1][prev_position][position][education])) {
          transition_dict[jobNumber - 1][prev_position][position][education][numSkills] = 0
        }
        transition_dict[jobNumber - 1][prev_position][position][education][numSkills] += 1
      }
    })
  })
  return transition_dict
}

function get_node_transition_data() {
  var node_transition_data = gen_node_transition_data(transition_dict)
  return node_transition_data

  function gen_node_transition_data(transition_dict) {
    var node_transition_data = []
    var idx = 0
    for (var jobNumber in transition_dict) {
      for (var from in transition_dict[jobNumber]) {
        var acc_num = 0
        
        for (var to in transition_dict[jobNumber][from]) {
          node_transition_data.push({
            'jobNumber': parseInt(jobNumber),
            'from': from,
            'to': to,
            'num': 0,
            'acc_num': 0
          })

          for (var e in transition_dict[jobNumber][from][to]) {
            for (var s in transition_dict[jobNumber][from][to][e]) {
              var num = parseInt(transition_dict[jobNumber][from][to][e][s])
              node_transition_data[idx]['num'] += num
              acc_num += num
            }
          }
          node_transition_data[idx]['acc_num'] = acc_num
          idx += 1
        }
      }
    }
    return node_transition_data
  }
}

function str_to_arr(str) {
  var arr = str.split(',')
  var last_idx = arr.length - 1
  arr.forEach((e, i) => {
    if (i == last_idx) {
      arr[i] = e.slice(2, -2)
    } else {
      arr[i] = e.slice(2, -1)
    }
  })
  return arr
}

function dates_str_to_arr(str) {
  var dates = str_to_arr(str)
  dates.forEach((date, i) => {
    var y = date.split('-')[1]
    var m = date.split('-')[0]
    dates[i] = {'year': parseInt(y), 'month': parseInt(m)}
  })
  return dates
}

////////////////////////////////////////////////////////////////////////////////
// g-left
////////////////////////////////////////////////////////////////////////////////

function education_option_functions() {

  var functions = {}
  functions['All'] = draw_sankey_by_education
  educations.forEach(education => {
    functions[education] = draw_sankey_by_education
  })

  return functions

}

function gen_g_left() {

  // SETTINGS
  gen_left_option('settings', 
                  'SETTINGS', 
                  {'Y-axis': ['NumPeople', 'Percent']})

  // FILTER DATA
  gen_left_option('filter-data', 
                  'FILTER DATA', 
                  {'Education': ['All'].concat(educations),
                  'NumSkills': ['0-3', '4-10', '11-15']},
                  {'Education': education_option_functions() })

  function gen_left_option(title, title_text, options, click_functions) {
    d3.select('#g-' + title)
      .append('text')
      .text(title_text)
      .attr('id', 'left-title-' + title)
      .attr('class', 'left-title')
    
    gen_dropdown_option(title, options, click_functions)
  }

  function gen_dropdown_option(title, options, click_functions) {

    gen_option_gs(options)
    gen_option_titles()
    gen_option_lists(title, options, click_functions)
    
    function gen_option_gs(options) {
      var option_titles = Object.keys(options)
      d3.select('#g-' + title)
        .selectAll('option-titles')
        .data(option_titles)
        .enter()
        .append('g')
        .attr('id', function(option_title) { return 'g-option-' + option_title })
        .attr('class', 'g-option')
        .attr('transform', function(option_title, i) {
          var start_x = left_option_style['option-g-start-x']
          var start_y = left_option_style['option-g-start-y']
          var option_h = left_option_style['option-g-height']
          return 'translate(' + start_x + ',' + (start_y + i * option_h) +')'
        })
    }

    function gen_option_titles() {
      d3.selectAll('.g-option')
        .append('text')
        .attr('id', function(option_title) { return 'option-title-' + option_title })
        .attr('class', 'option-title')
        .text(function(option_title) { return option_title })
    }

    function gen_option_lists(title, options, click_functions) {

      gen_g_dropdown()
      gen_dropdown_selection_result()
      gen_dropdown_optionbox(click_functions)

      function gen_g_dropdown() {
        d3.selectAll('.g-option')
          .append('g')
          .attr('id', function(option_title) { return 'option-dropdown-' + option_title })
          .attr('class', 'option-dropdown')
          .attr('transform', function(option_title) {
            var start_y = left_option_style['dropdown-start-y']
            return 'translate(0,' + start_y +')'
          })
          .on('mouseover', function() { d3.select(this).style('cursor', 'pointer') })
          .on('click', function(option_title) { return toggle_display('g-optionbox-' + option_title) })
      }

      function gen_dropdown_optionbox(click_functions) {
        var option_titles = Object.keys(options)
        option_titles.forEach((option_title, i) => {
          // g for option box
          d3.select('#g-' + title)
            .append('g')
            .attr('id', 'g-optionbox-' + option_title)
            .attr('class', 'g-optionbox')
            .attr('transform', function() {
              var start_x = left_option_style['optionbox-x']
              var start_y = left_option_style['option-g-start-y']
              var delta_y = left_option_style['optionbox-y']
              var option_h = left_option_style['option-g-height']
              var y = start_y + delta_y + (i * option_h)
              return 'translate(' + start_x + ',' + y +')'
            })
            .style('display', 'none')

          // Option box border
          d3.select('#g-optionbox-' + option_title)
            .append('rect')
            .attr('id', 'optionbox-rect-' + option_title)
            .attr('class', 'optionbox-rect')
            .attr('width', left_option_style['optionbox-w'])
            .attr('height', function() {
              var t = left_option_style['optionbox-t']
              var b = left_option_style['optionbox-b']
              var n = options[option_title].length
              var h = left_option_style['single-option-h']
              return t + (n * h) + b
            })

          // Append item g
          d3.select('#g-optionbox-' + option_title)
            .selectAll('options')
            .data(options[option_title])
            .enter()
            .append('g')
            .attr('id', function(item) { return ['optionitem', option_title, item].join('-') })
            .attr('class', 'optionitem ' + 'optionitem-' + option_title)
            .attr('transform', function(item, i) {
              var t = left_option_style['optionbox-t']
              var h = left_option_style['single-option-h']
              return 'translate(0,' + (t + i * h) +')'
            })
            .on('mouseover', function(item) { return optionitem_mouseover(option_title, item) })
            .on('mouseout', function(item) { return optionitem_mouseout(option_title, item) })
            .on('click', function(item) { return optionitem_click(option_title, item, click_functions) })

          // Append item background rect
          d3.selectAll('.optionitem-' + option_title)
            .append('rect')
            .attr('id', function(item) { return ['item-bg', option_title, item].join('-') })
            .attr('class', 'item-bg ' + 'item-bg-' + option_title)
            .attr('width', left_option_style['optionbox-w'])
            .attr('height', left_option_style['single-option-h'])

          // Append item text
          d3.selectAll('.optionitem-' + option_title)
            .append('text')
            .text(function(item) { return item})
            .attr('id', function(item) { return ['item-text', option_title, item].join('-') })
            .attr('class', 'item-text ' + 'item-text-' + option_title)
            .attr('x', left_option_style['single-option-x'])
            .attr('y', left_option_style['single-option-y'])

        })
      }

      function gen_dropdown_selection_result() {
        var option_titles = Object.keys(options)
        option_titles.forEach(option_title => {
          // Background white rect
          d3.select('#option-dropdown-' + option_title)
            .append('rect')
            .attr('id', 'option-dropdown-rect-' + option_title)
            .attr('class', 'option-dropdown-rect')
            .attr('width', left_option_style['dropdown-width'])
            .attr('height', left_option_style['dropdown-height'])

          // Selection result
          d3.select('#option-dropdown-' + option_title)
            .append('text')
            .attr('id', 'option-dropdown-text-' + option_title)
            .attr('class', 'option-dropdown-text')
            .text(options[option_title][0])
            .attr('transform', 'translate(0,' + left_option_style['dropdown-text-y'] +')')

          // Line
          d3.select('#option-dropdown-' + option_title)
            .append('line')
            .attr('id', 'option-dropdown-line-' + option_title)
            .attr('class', 'option-dropdown-line')
            .attr('x1', 0)
            .attr('x2', left_option_style['dropdown-width'])
            .attr('y1', left_option_style['dropdown-line-y'])
            .attr('y2', left_option_style['dropdown-line-y'])

          // Icon
          d3.select('#option-dropdown-' + option_title)
            .append('text')
            .attr('id', 'option-dropdown-icon-' + option_title)
            .attr('class', 'option-dropdown-icon')
            .attr('font-family', 'FontAwesome')
            .text(icons['caret-down'])
            .attr('x', left_option_style['dropdown-icon-x'])
            .attr('y', left_option_style['dropdown-icon-y'])
        })
      }
      
    }

    function optionitem_mouseover(option_title, item) {
      // Mouse cursor
      var this_id = ['optionitem', option_title, item].join('-')
      document.getElementById(this_id).style.cursor = 'pointer'
      
      // Highlight item background
      var bg_id = ['item-bg', option_title, item].join('-')
      document.getElementById(bg_id).style.fill = 'lightgray'
    }

    function optionitem_mouseout(option_title, item) {
      // Highlight item background
      var bg_id = ['item-bg', option_title, item].join('-')
      document.getElementById(bg_id).style.fill = 'white'
    }

    function optionitem_click(option_title, item, click_functions) {
      // Change the option
      var option_text_id = ['option', 'dropdown', 'text', option_title].join('-')
      document.getElementById(option_text_id).innerHTML =  item

      // Display off the optionbox
      toggle_display('g-optionbox-' + option_title)

      // Run the function for clicking the item
      click_functions[option_title][item](item)
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Add filter
////////////////////////////////////////////////////////////////////////////////
function add_people_attribute_option() {

  add_option('education', educations)

  function add_option(attribute, option_data) {

    gen_attribute_g()
    add_attribute_title()
    gen_attribute_bg_rect()
    gen_attribute_selected_option()
    gen_attribute_option_line()
    gen_attribute_icon()

    function gen_attribute_g() {
      var x = attribute_setting[attribute + '-left']
      var y = attribute_setting['attribute-y']
      d3.select('#g-people-attribute')
        .append('g')
        .attr('id', 'g-people-attribute-' + attribute)
        .attr('transform', gen_translate(x, y))
    }

    function add_attribute_title() {
      d3.select('#g-people-attribute-' + attribute)
        .append('text')
        .text(attribute.toUpperCase())
        .style('fill', 'gray')
    }

    function gen_attribute_bg_rect() {
      d3.select('#g-people-attribute-' + attribute)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', attribute_setting['width'])
        .attr('height', attribute_setting['attribute-y'])
        .style('fill', 'white')
        .on('mouseover', function() {this.style.cursor = 'pointer'})
        .on('click', function() { return option_box_click() })
    }

    function gen_attribute_selected_option() {
      d3.select('#g-people-attribute-' + attribute)
        .append('text')
        .attr('id', 'selected-' + attribute)
        .text('- - - Select ' + attribute)
        .attr('y', 25)
        .style('fill', 'black')
        .on('mouseover', function() {this.style.cursor = 'pointer'})
        .on('click', function() { return option_box_click() })
    }

    function gen_attribute_option_line() {
      d3.select('#g-people-attribute-' + attribute)
        .append('line')
        .attr('x1', 0)
        .attr('x2', attribute_setting['width'])
        .attr('y1', attribute_setting['attribute-line-y'])
        .attr('y2', attribute_setting['attribute-line-y'])
        .style('stroke', 'gray')

    }

    function gen_attribute_icon() {
      d3.select('#g-people-attribute-' + attribute)
        .append('text')
        .attr('font-family', 'FontAwesome')
        .text(icons['caret-down'])
        .attr('x', attribute_setting['width'] - 10)
        .attr('y', attribute_setting['attribute-line-y'] - 10)
        .style('font-size', 20)
        .style('fill', 'gray')
    }

    function option_box_click() {

      var g_id = 'g-option-box-' + attribute
      if (!(does_exist(g_id))) {
        gen_option_box()
        add_options(option_data)
      } else {
        toggle_display(g_id)
      }

      function gen_option_box() {
        d3.select('#g-attribute-option')
          .append('g')
          .attr('id', 'g-option-box-' + attribute)
          .attr('transform',  option_box_translate())
          .append('rect')
          .attr('width', attribute_setting['width'])
          .attr('height', option_box_height())
          .style('fill', 'white')
          .style('stroke', 'lightgray')
      }

      function option_box_translate() {
        var x = attribute_setting[attribute + '-option-left']
        return 'translate(' + x + ',0)'
      }
      
      function option_box_height() {
        var margins = 2 * attribute_setting['option-box-tb-margin']
        var h = educations.length * attribute_setting['option-height']
        return margins + h
      }

      function add_options(option_data) {
        add_option_rect()
        add_option_text()

        function add_option_rect() {
          d3.select('#g-option-box-' + attribute)
            .selectAll('options')
            .data(option_data)
            .enter()
            .append('rect')
            .attr('id', function(d) { return get_option_id(d, 'rect') })
            .attr('width', attribute_setting['width'])
            .attr('height', attribute_setting['option-height'])
            .attr('y', function(d, i) { return option_y(i)})
            .style('fill', 'white')
            .on('mouseover', function(d) { return option_mouseover(d) })
            .on('mouseout', function(d) { return option_mouseout(d) })
            .on('click', function(d) { return option_click(d) })
        }

        function add_option_text() {
          d3.select('#g-option-box-' + attribute)
            .selectAll('options')
            .data(option_data)
            .enter()
            .append('text')
            .attr('id', function(d) { return get_option_id(d, 'text') })
            .text(function(d) { return option_text(d) })
            .attr('x', attribute_setting['option-x'])
            .attr('y', function(d, i) { return option_y(i) + attribute_setting['option-y']})
            .on('mouseover', function(d) { return option_mouseover(d) })
            .on('mouseout', function(d) { return option_mouseout(d) })
            .on('click', function(d) { return option_click(d) })
        }

        function get_option_id(d, element_type) {
          d = d.replace('/', '-')
          return ['option', attribute, d, element_type].join('-')
        }

        function option_text(d) {
          if (d == 'HighSchool') {
            return 'High school'
          } else {
            return d
          }
        }

        function option_mouseover(d) {
          var rect = get_option_id(d, 'rect')
          var text = get_option_id(d, 'text')
          d3.select('#' + rect)
            .style('cursor', 'pointer')
            .style('fill', 'lightgray')
          d3.select('#' + text).style('cursor', 'pointer')
        }

        function option_mouseout(d) {
          var rect = get_option_id(d, 'rect')
          d3.select('#' + rect)
            .style('fill', 'white')
        }

        function option_click(d) {
          d3.select('#selected-' + attribute)
            .text(option_text(d))
          toggle_display('g-option-box-' + attribute)
          selected[attribute] = d
          console.log(selected)

        }
      }

      function option_y(i) {
        var top_mg = attribute_setting['option-box-tb-margin']
        var h = attribute_setting['option-height']
        return top_mg + i * h
      }
    }
    
  }
  
}


////////////////////////////////////////////////////////////////////////////////
// Draw nodes of the sankey chart
////////////////////////////////////////////////////////////////////////////////

function draw_sankey_by_education(education) {

  d3.selectAll('.node').remove()
  d3.selectAll('.edge').remove()

  // Prepare the data
  var filtered_trajectory_data = trajectory_data.filter(function(d) {
    if (education == 'All') {
      return true
    } else {
      return d['Education'] == education
    }
  })

  position_dict = get_position_dict(filtered_trajectory_data)

  // Draw nodes of the sankey chart
  node_data = get_node_data(position_dict)
  node_height_scale = gen_node_height_scale_sankey(position_dict)
  x_scale_sankey = gen_x_scale_sankey()
  y_scale_sankey = gen_y_scale_sankey()
  draw_nodes() 
  draw_node_legend()

  // Draw edges of the sankey chart
  transition_dict = get_transition_dict(filtered_trajectory_data)
  transition_data = get_transition_data(transition_dict)
  node_transition_data = get_node_transition_data()
  edge_start_y = get_edge_start_y()
  edge_end_y = get_edge_end_y()
  draw_edges()
}

function gen_node_height_scale_sankey(position_dict) {

  var domain_range = [1000, -1000]
  for(var jobNumber = 0; jobNumber < num_max_transitions; jobNumber++) {
    positions.forEach(position => {
      var num_transitions = position_dict[jobNumber][position]
      domain_range[0] = d3.min([num_transitions, domain_range[0]])
      domain_range[1] = d3.max([num_transitions, domain_range[1]])
    })
  }

  var block_scale = d3
    .scaleLinear()
    .domain(domain_range)
    .range([node_setting['min_height'], node_setting['max_height']])

  return block_scale
}

function gen_x_scale_sankey() {
  var x_scale = {}
  for (var jobNumber = 0; jobNumber < num_max_transitions; jobNumber++) {
    x_scale[jobNumber] = node_setting['left_margin'] + jobNumber * (node_setting['width'] + node_setting['lr_padding'])
  }
  return x_scale
}

function gen_y_scale_sankey() {
  
  var y_scale = {}
  for(var i = 0; i < num_max_transitions; i++) {
    y_scale[i] = {}
    positions.forEach((position, j) => {
      if (j == 0) {
        y_scale[i][position] = 0
      } else {
        var prev_position = positions[j - 1]
        var prev_end = y_scale[i][prev_position] + node_height_scale(position_dict[i][prev_position])
        y_scale[i][position] = prev_end + node_setting['tb_padding']
      }
    })    
  }
  
  return y_scale
}

function get_node_data(position_dict) {
  var node_data = []
  for(var i = 0; i < num_max_transitions; i++) {
    positions.forEach((position, j) => {
      var block = {'jobNumber': i, 'position': position, 'num': position_dict[i][position]}
      node_data.push(block)
    })    
  }
  return node_data
}

function draw_nodes() {
  d3.select('#g-sankey-node')
    .selectAll('sankey-node')
    .data(node_data)
    .enter()
    .append('rect')
    .attr('id', function(d) { return get_node_id(d)})
    .attr('class', function (d) { return get_node_class(d) })
    .attr('width', node_setting['width'])
    .attr('height', function(d) { return node_height_scale(d['num']) })
    .attr('x', function(d) { return x_scale_sankey[d['jobNumber']] })
    .attr('y', function(d) { return y_scale_sankey[d['jobNumber']][d['position']] })
    .style('fill', function(d) { return position_color_dict[d['position']] })
    .on('mouseover', function(d) { return node_mouseover_all_history_passing_the_node(d) })
    .on('mouseout', function(d) { return node_mouseout(d) })

  function get_node_id(d) {
    return ['node', d['jobNumber'], d['position']].join('-')
  }

  function get_node_class(d) {
    var c0 = 'node'
    var c1 = ['node', d['jobNumber']].join('-')
    var c2 = ['node', d['position']].join('-')
    return [c0, c1, c2].join(' ')
  }

  function node_mouseover_right_before_after(d) {
    var node_id = get_node_id(d)
    d3.select('#' + node_id)
      .style('cursor', 'pointer')
    d3.selectAll('.edge')
      .style('stroke', 'lightgray')
      .style('opacity', 0.1)
    d3.selectAll('.' + ['edge-to', d['position'], d['jobNumber']].join('-'))
      .style('stroke', position_color_dict[d['position']])
      .style('opacity', 0.3)
    d3.selectAll('.' + ['edge-from', d['position'], d['jobNumber']].join('-'))
      .style('stroke', function(dd) { return position_color_dict[dd['to']] })
      .style('opacity', 0.3)
  }

  function node_mouseover_all_history_passing_the_node(d) {
    // Mouse pointer
    var node_id = get_node_id(d)
    d3.select('#' + node_id)
      .style('cursor', 'pointer')

    // Gray out all edges
    d3.selectAll('.edge')
      .style('stroke', 'lightgray')
      .style('opacity', 0.1)

    // XXXXX
    var attribute = selected['education']
    var edges_passing_the_node = node_passing_data[attribute][node_id]
    
    d3.select('#g-sankey-edge')
      .selectAll('sankey-edge')
      .data(edges_passing_the_node)
      .enter()
      .append('path')
      .attr('class', 'all-history-edges')
      .attr('d', function (dd) {
        var jobNumber = parseInt(dd['edge'].split('-')[0])
        var from = dd['edge'].split('-')[1]
        var to = dd['edge'].split('-')[2]
        return gen_path(jobNumber, from, to)
      })
      .style('fill', 'none')
      .style('stroke', function(dd) { 
        var to = dd['edge'].split('-')[2]
        return position_color_dict[to] 
      })
      .style('stroke-width', function(dd) { 
        var num = dd['num']
        return node_height_scale(num) 
      })
      .style('opacity', 0.3)

  }

  function node_mouseout(d) {
    d3.selectAll('.all-history-edges')
      .remove()
    d3.selectAll('.edge')
      .style('stroke', function(dd) { return node_mouseout_edge_stroke(dd) })
      .style('opacity', function (dd) { return node_mouseout_opacity(dd) })
  }

  function node_mouseout_edge_stroke(dd) {
    if (is_on(dd['to'])) {
      return position_color_dict[dd['to']] 
    } else {
      return 'lightgray'
    }
  }

  function node_mouseout_opacity(dd) {
    if (is_on(dd['to'])) {
      return 0.25
    } else {
      return 0.1
    }
  }
}

function draw_node_legend() {

  draw_legend_title()
  draw_legend_rect()
  draw_legend_text()

  function draw_legend_title() {
    d3.select('#g-sankey-legend')
      .append('text')
      .attr('id', 'legend-title')
      .text('Position')
  }

  function draw_legend_rect() {
    d3.select('#g-sankey-legend')
      .selectAll('position-legend')
      .data(positions)
      .enter()
      .append('rect')
      .attr('id', function(d) { return get_legend_id(d) })
      .attr('class', 'legend-rect')
      .attr('width', legend_setting['rect-width'])
      .attr('height', legend_setting['rect-height'])
      .style('fill', function(d) {return position_color_dict[d] })
      .attr('y', function(d, i) { 
        var y = legend_setting['start_y']
        var delta_y = i * (legend_setting['rect_tb'] + legend_setting['rect-height'])
        return y + delta_y
      })
      .on('mouseover', function () { this.style.cursor = 'pointer' })
      .on('click', function(d) { return click_legend(d) })
  }

  function draw_legend_text() {
    d3.select('#g-sankey-legend')
      .selectAll('position-legend')
      .data(positions)
      .enter()
      .append('text')
      .text(function(d) { return d })
      .attr('x', legend_setting['text-x'])
      .attr('y', function(d, i) { 
        var y = legend_setting['start_y']
        var delta_y = i * (legend_setting['rect_tb'] + legend_setting['rect-height'])
        var text_y = legend_setting['text-y']
        return y + delta_y + text_y
        
      })
  }

  

  function set_text_x() {
    var x = {}
    x['all'] = 103
    x['Specialist'] = 25
    x['Senior'] = 60
    x['Junior'] = 68
    x['Worker'] = 50
    return x
  }

  function click_legend(d) {
    // On -> Off
    if (is_on(d)) {
      turn_off(d)
    } 
    // Off -> On
    else { 
      turn_on(d)
    }
  }

  function click_all() {

    d3.select('#legend-all').style('cursor', 'pointer')

    // On -> Off
    if (is_on('all')) {
      positions.forEach(position => {
        turn_off(position)
      }) 
    }
    // Off -> On
    else {
      positions.forEach(position => {
        turn_on(position)
      }) 
    }
  }

  function turn_off(d) {
    var id = get_legend_id(d)

    // Off the current position legend
    d3.select('#' + id)
    .style('fill', 'white')
    .style('stroke', position_color_dict[d])
    .style('stroke-width', 3)
  
    // Off all-position legend
    d3.select('#legend-all')
      .style('fill', 'white')
      .style('stroke', 'black')
      .style('stroke-width', 3)
    
    // Off nodes
    d3.selectAll('.node-' + d)
      .style('fill', 'white')
      .style('stroke', position_color_dict[d])
      .style('stroke-width', 3)

    // Off to-edges
    d3.selectAll('.edge-to-' + d)
      .style('stroke', 'lightgray')
      .style('opacity', 0.1)
  }

  function turn_on(d) {
    var id = get_legend_id(d)

    // On the current position legend
    d3.select('#' + id)
    .style('fill', position_color_dict[d])
    .style('stroke-width', 0)

    // On/Off all-position legend
    var is_all_on = true
    positions.forEach(p => {
      if (!is_on(p)) {
        is_all_on = false
      }
    })
    if (is_all_on) {
      d3.select('#legend-all')
        .style('fill', 'black')
        .style('stroke-width', 0)
    }

    // On nodes
    d3.selectAll('.node-' + d)
      .style('fill', position_color_dict[d])
      .style('stroke-width', 0)

    // Om to-edges
    d3.selectAll('.edge-to-' + d)
      .style('stroke', position_color_dict[d])
      .style('opacity', 0.25)
    }
}

function get_legend_id(position) {
  return ['legend', position].join('-')
}

function is_on(position) {
  var id = get_legend_id(position)
  var fill_color = d3.select('#' + id).style('fill')
  if (fill_color == 'white') {
    return false
  } else {
    return true
  }
}

////////////////////////////////////////////////////////////////////////////////
// Draw edges of the sankey chart
////////////////////////////////////////////////////////////////////////////////
function get_edge_start_y() {
  var edge_start_y = {}

  node_transition_data.forEach(transition => {
    var jobNumber = transition['jobNumber']
    var from = transition['from']
    var to = transition['to']
    var acc_num = transition['acc_num']
    var num = transition['num']
    var y_start = y_scale_sankey[jobNumber][from] 
    if (!(jobNumber in edge_start_y)) {
      edge_start_y[jobNumber] = {}
    }
    if (!(from in edge_start_y[jobNumber])) {
      edge_start_y[jobNumber][from] = {}
    }
    edge_start_y[jobNumber][from][to] = y_start + node_height_scale(acc_num - num / 2)
  })
  
  return edge_start_y

  
}

function get_edge_end_y() {

  var edge_end_y = {}
  for (var jobNumber = 0; jobNumber < num_max_transitions - 1; jobNumber++) {
    if (!(jobNumber in edge_end_y)) {
      edge_end_y[jobNumber] = {}
    }
    positions.forEach(to => {
      var filtered_node_transition = node_transition_data.filter(function(d) {
        return (d['jobNumber'] == jobNumber) && (d['to'] == to)
      })
      var start_y = y_scale_sankey[jobNumber + 1][to]
      var acc_num = 0
      filtered_node_transition.forEach(transition => {
        var from = transition['from']
        var num = transition['num']

        if (!(from in edge_end_y[jobNumber])) {
          edge_end_y[jobNumber][from] = {}
        }

        acc_num += num
        edge_end_y[jobNumber][from][to] = start_y + node_height_scale(acc_num - num / 2)
      })
      
    })
    
  }
  return edge_end_y
}

function draw_edges() {

  d3.select('#g-sankey-edge')
    .selectAll('sankey-edge')
    .data(node_transition_data)
    .enter()
    .append('path')
    .attr('id', function(d) { return gen_edge_id(d) })
    .attr('class', function(d) { return gen_class(d)})
    .attr('d', function(d) { return gen_path(d['jobNumber'], d['from'], d['to']) })  
    .style('stroke', function(d) { return position_color_dict[d['to']] })
    .style('fill', 'none')
    .style('stroke-width', function(d) { return node_height_scale(d['num']) })
    .style('opacity', 0.25)
    
  function gen_edge_id(d) {
    return ['edge', d['jobNumber'], d['from'], d['to']].join('-')
  }

  function gen_class(d) {
    var c0 = 'edge'
    var c1 = 'edge-from-' + d['from']
    var c2 = 'edge-to-' + d['to']
    var c3 = ['edge-from', d['from'], d['jobNumber']].join('-') 
    var c4 = ['edge-to', d['to'], d['jobNumber'] + 1].join('-') 
    return [c0, c1, c2, c3, c4].join(' ')
  }

}

function gen_path(jobNumber, from, to) {

  var start_x = x_scale_sankey[jobNumber] + node_setting['width'] - 3
  var start_y = edge_start_y[jobNumber][from][to]
  var end_x = x_scale_sankey[jobNumber + 1] + 3
  var end_y = edge_end_y[jobNumber][from][to]
  var x1 = internal_division(start_x, end_x, 5, 1)
  var y1 = internal_division(start_y, end_y, 1, 9)
  var x2 = internal_division(start_x, end_x, 1, 9)
  var y2 = internal_division(start_y, end_y, 9, 1)
  var moveto = 'M ' + [start_x, start_y].join(',')
  var curveto = 'C ' + [x1, y1, x2, y2, end_x, end_y].join(',')

  return [moveto, curveto].join(' ')
}

function internal_division(a, b, m, n) {
  return (n * a + m * b) / (m + n)
}
