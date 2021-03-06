var draw = false;
var ws;
var products;
var services;
var str = "";
var start = true;
var chartData;
var jsonData; /* = [{"Op":"Tree"},{"Id":1,"Name":"Morris Ground 1"},{"Id":2,"Name":"Austin Basket"},{"Id":3,"Name":"Austin Soccer"},{"Id":4,"Name":"Morris Sea 1000"},{"Id":5,"Name":"Morris Sea 2099"},{"Id":6,"Name":"Morris Wind"},{"Id":7,"Name":"Austin Polo"},{"Id":8,"Name":"Austin Cricket"},{"Id":9,"Name":"Austin XC"},{"Id":10,"Name":"Austin Base"},{"Products":[{"Products":[{"Products":[{"Products":[{"Id":21,"Name":"21"}],"Id":20,"Name":"20"}],"Id":19,"Name":"19"}],"Id":18,"Name":"18"}],"Id":11,"Name":"Sole Machine"},{"Id":12,"Name":"Sewing Machine"},{"Products":[{"Id":14,"Name":"Rubber"},{"Id":15,"Name":"Aluminium"}],"Id":13,"Name":"Cleat Applier"},{"Id":16,"Name":"Glueing Machine"},{"Id":17,"Name":"Neoprene Cutting Machine"}];
*/
var count; // for timespan
var snapshots;


document.addEventListener('DOMContentLoaded', function() {

  $('#overlay-back').hide();
  $('#overlay').hide();

  ws = new WebSocket('ws://' + window.location.hostname + ":"
    + window.location.port + '/Diversity/server');

  //Request products and services tree
  ws.onopen = function () {
    json = {
      "Op" : "gettree",
      "All" : 1
    }

    ws.send(JSON.stringify(json));
  }

  ws.onmessage = function(event) {
    var json = JSON.parse(event.data.replace(/\\/g,''));

    //If the message Op is 'Tree', build the products and services list as an interactive tree
    if (json[0].Op == "Tree") {
      jsonData = JSON.parse(JSON.stringify(json));
      makeTree("prod_list",jsonData);
      $('#prod_list').jstree(true).refresh();
      str = "";
      start = true;
      makeTree("serv_list",jsonData);
      $('#serv_list').jstree(true).refresh();
    }

    //If the message Op is 'Prediction', draw the predicted global sentiment chart
    if (json[0].Op == "Prediction") {
      draw = true;
      //console.log(json);
      chartData = JSON.parse(JSON.stringify(json));

      drawChart();
    }

    //If the message Op is 'Error', it contains a message from the server, which is displayed in an overlay box
    if (json[0].Op == "Error") {
      if (json[0].hasOwnProperty("Message")) {
        $('#overlay-back').show();
        $('#overlay').show();
        $('#error').html(json[0].Message + '<br>' + '<input id="submit" class="btn btn-default" onclick="$(\'#overlay-back\').hide();$(\'#overlay\').hide();" style="margin-top:20px" type="submit" value="OK" />');
      }
    }

    //If the message contains the string 'Snapshots', build a dropdown with all the saved snapshots and display it
    if (json[0] == "Snapshots") {
      snapshots = json[1];
      displaySnapshots();
    }
  }
});

/*
* Uses JSTree to make a tree view from an unordered HTML list
*/
function makeTree(div,test) {
  str = "";
  $("#" + div).jstree("destroy");
  document.getElementById(div).innerHTML = str;
  str += "<ul>";
  //console.log(test);
  for (var i = 1; i < test.length; i++) {
    makeList(test[i]);//makeList(jsonData[1]);
  }
  str += "</ul>"
  document.getElementById(div).innerHTML = str;

  $("#" + div).jstree({
  "plugins" : [ "checkbox" ]
  });

  $("#prod_list").on("changed.jstree", function (e, data) {
    products = "";
    var i, j, r = [];
    for (i = 0, j = data.selected.length; i < j; i++) {
        r.push(data.instance.get_node(data.selected[i]).text);
        products += getObjects(jsonData,'Name', data.instance.get_node(data.selected[i]).text)[0].Id + ";" ;
    }
  });

  $("#serv_list").on("changed.jstree", function (e, data) {
    services = "";
    var i, j, r = [];
    for (i = 0, j = data.selected.length; i < j; i++) {
        r.push(data.instance.get_node(data.selected[i]).text);
        services += getObjects(jsonData,'Name', data.instance.get_node(data.selected[i]).text)[0].Id + ";" ;
    }
  });

  $("#prod_list").on('ready.jstree', function() {
    $('#prod_list').jstree('open_all');
  });

  $("#serv_list").on('ready.jstree', function() {
    $('#serv_list').jstree('open_all');
  });
}

/*
* Finds and returns objects with a specific property inside an array.
* Input: obj - array to be searched;
*        key - name of the property that we're looking for;
*        val - value of the property that we're looking for.
* Output: an array with all objects that meet the requirements.
*/
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

/*
* Makes an HTML unordered list from a json array (uses recursion, requires a var start = true)
*/
function makeList(array) {
  if (typeof array == 'undefined') {
    return;
  }

  if (!array.hasOwnProperty('Products') /*&& !start*/) {
    str += "<li>" + array.Name + "</li>";
    return null;
  }

  if (array.hasOwnProperty('Products')/* && start */) {
    start = false;
    if (array.hasOwnProperty('Name')) {
      str += "<li>"+ array.Name;
      str += "<ul>";
    }

    for (var i = 0; i < array.Products.length; i++) {
      makeList(array.Products[i]);
    }

    if (array.hasOwnProperty('Name')) {
      str += "</ul>";
      str += "</li>";
    }
  }
}

/*
* Sends a JSON message requesting a prediction for the given products and services.
*/
function submit() {
  var json = {
    "Op" : "prediction",
    "Products" : products != "" ? products : undefined,
    "Services" : services != "" ? services : undefined
  }

  ws.send(JSON.stringify(json));
}

/*
* Displays an overlay window to save a new snapshot.
*/
function save() {
  var code = '<center><b>Save snapshot</b></center><br><label for="snap_name">Name: </label><input id="snap_name" type="text" style="margin-left:15px;" placeholder="Snapshot name..."><br><br><button class="btn btn-default" id="save" onclick="send($(\'#snap_name\').val());$(\'#overlay\').hide();$(\'#overlay-back\').hide()">Save</button> <button class="btn btn-default" id="cancel" onclick="$(\'#overlay\').hide();$(\'#overlay-back\').hide()">Cancel</button>';
  $('#error').html(code);
  $('#overlay').show();
  $('#overlay-back').show();
}

/*
* Sends a message requesting a list of snapshots.
*/
function load() {
  var json = {
    "Op" : "load_snapshot",
    "Type" : "Prediction"
  }

  ws.send(JSON.stringify(json));
}

/*
* Sends a message with all the data required to save a snapshot.
*/
function send(val) {
  var json = {
    "Op" : "Snapshot",
    "type" : "Prediction",
    "name" : val,
    "creation_date" : new Date(),
    "timespan" : count,
    "user" : "test",
    "Products" : products != "" ? products : undefined,
    "Services" : services != "" ? services : undefined,
  }
  ws.send(JSON.stringify(json));
}

/*
* Builds a dropdown list of availiable snapshots and displays them in an overlay window to be loaded.
*/
function displaySnapshots() {
  var code = '<center><b>Load snapshot</b></center><br><label for="snap_name">Select a snapshot: </label><select id="select_snap" style="margin-left:15px;"></select><br><br><button class="btn btn-default" id="sel_btn" onclick="requestSnapshot($(\'#select_snap\').find(\':selected\').text());$(\'#overlay\').hide();$(\'#overlay-back\').hide()">Load</button> <button class="btn btn-default" id="cancel" onclick="$(\'#overlay\').hide();$(\'#overlay-back\').hide()">Cancel</button>';
  $('#error').html(code);
  for (var i=0; i < snapshots.length; i++) {
    $('#select_snap').append($('<option>', {
      value: snapshots[i].Name,
      text: snapshots[i].Name
    }));
  }
  $('#overlay').show();
  $('#overlay-back').show();
}

/*
* Sends a message requesting a specific snapshot to be loaded.
*/
function requestSnapshot(val) {
  var json = {
    "Op" : "load_snapshot",
    "Name" : val,
  }

  ws.send(JSON.stringify(json));
}

/*
* Uses Google Charts API to draw the predicted global sentiment chart.
*/
function drawChart() {
  if (draw) {
    $("#wrapper").show();
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Month');
    data.addColumn('number', 'Global Sentiment');
    data.addColumn({id:'min', type:'number', role:'interval'}); // value - variance
    data.addColumn({id:'max', type:'number', role:'interval'}); // value + variance

    var sum = 0;
    count = 0;

    for (i = 0; i < chartData[1].length; i++) {
      var month = "";
      var value = -1;
      var variance = -1;

      if (chartData[1][i].hasOwnProperty('Month')) {
        month = chartData[1][i].Month;
      }

      if (chartData[1][i].hasOwnProperty('Value')) {
        value = chartData[1][i].Value;
      }

      if (chartData[1][i].hasOwnProperty('Variance')) {
        variance = chartData[1][i].Variance;
      }

      if (month != "" && value != -1 && variance != -1) {
        sum += value;
        count += 1;

        data.addRow([month, value, value - variance, value + variance]);
      }
    }

    var options = {
      title : 'Predicted global sentiment over time',
      hAxis: {
        title: 'Time'
      },
      series: {
        0: {
          color: '#604460',
          lineWidth: 3
        }
      },
      intervals: {
        'style':'area',
      },
      vAxis: {
        title: 'Global Sentiment',
        minValue: 0,
        maxValue: 100
      },
      legend: {
        position: 'bottom'
      },
      backgroundColor: {
        fill:'transparent'
      },
      curveType: 'function'
    };

    var chart = new google.visualization.LineChart(document.getElementById('graph'));
    chart.draw(data,options);

    var data = google.visualization.arrayToDataTable([['Indicator', 'Value'], ['Average Global Sentiment', count != 0 ? sum/count : 0]]);

    var options = {
      title: 'Predicted average global sentiment',
      legend: 'none',
      pieSliceText: 'value',
      pieSliceTextStyle: {
        fontSize: 20,
      },
      colors:['#604460'],
      backgroundColor: {
        fill:'transparent'
      },
      tooltip: { trigger: 'none' },
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie'));
    chart.draw(data, options);

  } else {
    return;
  }
}

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawChart);
