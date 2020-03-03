var file_list = ['./data/vis_sample.csv']
var profile_attributes = ['Education', 'NumSkills']
var transition_attributes = ['WorkExperience', 'StartDates', 'EndDates']

var width = 5000
var height = 400
var node_setting = {
  'width': 30,
  'tb_padding': 50,
  'lr_padding': 150,
  'left_margin': 50,
  'min_height': 0,
  'max_height': 100
}

var educations = ['None/Other', 'HighSchool', 'Bachelors', 'Masters', 'Doctorate', 'Associates', 'Certificate']
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
  // Parse the dataset
  trajectory_data = parse_trajectory_data(data[0])
  position_dict = get_position_dict()
  node_passing_data = get_node_passing_data()
  
  // Vis setting
  main_vis_setting()
  education_color_dict = gen_color_dict(educations, education_colors)
  position_color_dict = gen_color_dict(positions, position_colors)

  // Draw nodes of the sankey chart
  node_data = get_node_data()
  node_height_scale = gen_node_height_scale_sankey()
  x_scale_sankey = gen_x_scale_sankey()
  y_scale_sankey = gen_y_scale_sankey()
  draw_nodes() 
  draw_node_legend()

  // Draw edges of the sankey chart
  transition_dict = get_transition_dict()
  transition_data = get_transition_data()
  node_transition_data = get_node_transition_data()
  edge_start_y = get_edge_start_y()
  edge_end_y = get_edge_end_y()
  draw_edges()

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
  d3.select('body')
    .append('svg')
    .attr('id', 'svg-sankey')
    .attr('width', 3000)
    .attr('height', 1000)

  d3.select('#svg-sankey')
    .append('g')
    .attr('id', 'g-sankey-legend')
    .attr('transform', 'translate(20, 200)')

  d3.select('#svg-sankey')
    .append('g')
    .attr('id', 'g-sankey-edge')
    .attr('transform', 'translate(200, 200)')

  d3.select('#svg-sankey')
    .append('g')
    .attr('id', 'g-sankey-node')
    .attr('transform', 'translate(200, 200)')

}

function gen_color_dict(items, colors) {
  var color_dict = {}
  items.forEach((e, i) => {
    color_dict[e] = colors[i]
  })
  return color_dict
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

function get_position_dict() {
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

function get_node_passing_data() {
  var node_passing_data = {}
  for (var jobNumber = 0; jobNumber < num_max_transitions; jobNumber++) {
    positions.forEach(position => {
      var node_id = ['node', jobNumber, position].join('-')
      if (!(node_id in node_passing_data)) {
        node_passing_data[node_id] = {}
      }
      var data_passing_node = filter_data_passing_one_node(jobNumber, position)
      aggregate_transition(data_passing_node, node_id)
      node_passing_data[node_id] = Object.entries(node_passing_data[node_id]).map(function(x) {
        return {'edge': x[0], 'num': x[1]}
      })
    })
  }
  return node_passing_data

  function filter_data_passing_one_node(jobNumber, position) {
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

function get_transition_data() {

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

function get_transition_dict() {
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
// Draw nodes of the sankey chart
////////////////////////////////////////////////////////////////////////////////

function gen_node_height_scale_sankey() {

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

function get_node_data() {
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
    var c1 = ['node', d['jobNumber']].join('-')
    var c2 = ['node', d['position']].join('-')
    return [c1, c2].join(' ')
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
    var node_id = get_node_id(d)
    d3.select('#' + node_id)
      .style('cursor', 'pointer')
    d3.selectAll('.edge')
      .style('stroke', 'lightgray')
      .style('opacity', 0.1)

    // console.log(node_passing_data[node_id])
    d3.select('#g-sankey-edge')
      .selectAll('sankey-edge')
      .data(node_passing_data[node_id])
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

  var text_x = set_text_x()

  d3.select('#g-sankey-legend')
    .append('rect')
    .attr('id', 'legend-all')
    .attr('x', 150)
    .attr('y', 0)
    .attr('width', 30)
    .attr('height', 30)
    .style('fill', 'black')
    .on('click', function() { return click_all()})
  
  d3.select('#g-sankey-legend')
    .selectAll('position-legend')
    .data(positions)
    .enter()
    .append('rect')
    .attr('id', function(d) { return get_legend_id(d) })
    .attr('x', 150)
    .attr('y', function(d, i) { return (i + 1) * 50})
    .attr('width', 30)
    .attr('height', 30)
    .style('fill', function(d) {return position_color_dict[d] })
    .on('mouseover', function () { this.style.cursor = 'pointer' })
    .on('click', function(d) { return click_legend(d) })

  d3.select('#g-sankey-legend')
    .append('text')
    .text('All')
    .style('font-size', 25)
    .attr('x', text_x['all'])
    .attr('y', 20)

  d3.select('#g-sankey-legend')
    .selectAll('position-legend')
    .data(positions)
    .enter()
    .append('text')
    .text(function(d) { return d })
    .style('font-size', 25)
    .attr('x', function(d) { return text_x[d]})
    .attr('y', function(d, i) { return (i + 1) * 50 + 20})

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
