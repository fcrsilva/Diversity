var json;
var i = 0;


$(document).ready(function() {
  $('input[type=radio][name=top_radio]').change(function() {
      if (this.value == 'default') {
        $('#pss').hide();
      }
      else if (this.value == 'custom') {
        $('#pss').show();
      }
  });

  $('#default_top_radio').click();

  $('select').on('change', function() {

    $('select').find('option').prop('disabled', false);

    $('select').each(function() {
       $('select').not(this).find('option[value="' + this.value + '"]').prop('disabled', true);
    });
  });
});

var datefield=document.createElement("input")
datefield.setAttribute("type", "date")
if (datefield.type!="date"){ //if browser doesn't support input type="date", load files for jQuery UI Date Picker
    document.write('<link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css" />\n')
    document.write('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"><\/script>\n')
    document.write('<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js"><\/script>\n')
}

if (datefield.type!="date"){ //if browser doesn't support input type="date", initialize date picker widget:
    jQuery(function($){ //on document.ready
        $('#start_date').datepicker();
        $('#end_date').datepicker();
    })
}


function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts.pop().split(";").shift();
}

function setCookie() {
  document.cookie = "Product=" + $("#Products :selected").text();
  document.cookie = "PSS=" + document.getElementById("Products").value;
}
ws = new WebSocket('ws://' + window.location.hostname + ":"
    + window.location.port + '/Diversity/server');

ws.onopen = function() {
  var msg = {
    "Op" : "getpss"
  }
  ws.send(JSON.stringify(msg));
}
ws.onmessage = function(event) {
  json = JSON.parse(event.data);
  console.log(json);

  if (json.Op == "Error") {
    var code = json.Message + '<br><br><button class="btn btn-default" id="ok" onclick="window.history.back();">OK</button>';
    $('#alert').html(code);
    $('#overlay').show();
    $('#overlay-back').show();
    if(json.Message.indexOf("updated") !== -1){
      var msg = {
          "Op" : "getconfig",
        }
        ws.send(JSON.stringify(msg));
    }

    return;
  }
  if (json[0].Op == "Configs") {
    json = JSON.parse(event.data);
    setConfig();
  }

  if (json[0].Op =="pss") {
    populatePSS();
    var msg = {
      "Op" : "getconfig",
    }
    ws.send(JSON.stringify(msg));
  }
}

function populatePSS() {
  var pss = JSON.parse(JSON.stringify(json));

  var pss1 = document.getElementById('pss1');
  var pss2 = document.getElementById('pss2');
  var pss3 = document.getElementById('pss3');
  var pss4 = document.getElementById('pss4');
  var pss5 = document.getElementById('pss5');

  var html = "<option selected disabled>Select PSS...</option>";

  for (var i = 0; i < pss.length; i++) {
    if (pss[i].hasOwnProperty('Pss')) {
      html += '<option value="' + pss[i].Pss + '">' + pss[i].Pss + ' </option>';
    }

    $('#pss1').html(html);
    $('#pss2').html(html);
    $('#pss3').html(html);
    $('#pss4').html(html);
    $('#pss5').html(html);
  }
}

function send_config() {
  var gstring="", astring="",lstring="";
  var start_date;
  var end_date;

  for(var i=1;;i++){
    if(document.getElementById("gender"+i) == null)break;
    gstring+=document.getElementById("gender"+i).value+",,";
  }
  for(var i=1;;i++){
    if(document.getElementById("1age"+i) == null)break;
    astring+=document.getElementById("1age"+i).value+"-"+document.getElementById("2age"+i).value+",,";
  }
  for(var i=1;;i++){
    if(document.getElementById("location"+i) == null)break;
    lstring+=document.getElementById("location"+i).value+",,";
  }

  start_date = new Date(document.getElementById("start_date").value);
  end_date = new Date(document.getElementById("end_date").value);
      //console.log("TESTE***********"+date);
  if(start_date.toString() != "Invalid Date" || end_date.toString() != "Invalid Date") {
    localStorage.start_date = start_date;
    localStorage.end_date = end_date;
  } else {
    localStorage.start_date = "";
    localStorage.end_date = "";
  }

  var psslist = "";

  if($('#custom_top_radio').is(':checked')) {
    psslist += $('#pss1').find(":selected").text() != "Select PSS..." ? $('#pss1').find(":selected").text() + ";" : "";
    psslist += $('#pss2').find(":selected").text() != "Select PSS..." ? $('#pss2').find(":selected").text() + ";" : "";
    psslist += $('#pss3').find(":selected").text() != "Select PSS..." ? $('#pss3').find(":selected").text() + ";" : "";
    psslist += $('#pss4').find(":selected").text() != "Select PSS..." ? $('#pss4').find(":selected").text() + ";" : "";
    psslist += $('#pss5').find(":selected").text() != "Select PSS..." ? $('#pss5').find(":selected").text() + ";" : "";

    localStorage.pss = psslist;
  } else {
    localStorage.pss = "";
  }

  var jsonData = {
    "Op" : "setconfig",
    "Gender" : gstring,
    "Age" : astring,
    "Location" : lstring,
  }

  console.log(jsonData);
  ws.send(JSON.stringify(jsonData));

}
function addline(table){
  var jsonData = new Array();
  var ii=0;
  if(table=="age"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Age"){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size+=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          jsonData[ii]=json[i];
        }
        jsonData[ii]={
            "Min":"0","Max":"99"
        }
        ii++;
      }
      jsonData[ii]=json[i];
    }
  }
  if(table=="gender"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Gender"){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size+=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          jsonData[ii]=json[i];
        }
        jsonData[ii]={
            "Gender":"",
        }
        ii++;
      }
      jsonData[ii]=json[i];
    }
  }
  if(table=="location"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Location"){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size+=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          jsonData[ii]=json[i];
        }
        jsonData[ii]={
            "Location":"",
        }
        ii++;
        break;
      }
      jsonData[ii]=json[i];
    }
  }
  json=jsonData;
  setConfig();

}

function delline(table, id){
  var jsonData = new Array();
  var ii=0;
  if(table=="age"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Age" && json[i].Size != 1){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size-=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          if(iii==id){
            ii--;
            continue;
          }
          jsonData[ii]=json[i];
        }
      }
      jsonData[ii]=json[i];
    }
  }
  if(table=="gender"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Gender" && json[i].Size != 1){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size-=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          if(iii==id){
            ii--;
            continue;
          }
          jsonData[ii]=json[i];
        }
      }
      jsonData[ii]=json[i];
    }
  }
  if(table=="location"){
    for(var i=0; i<json.length;i++,ii++){
      if(json[i].hasOwnProperty("Param") && json[i].Param=="Location" && json[i].Size != 1){
        jsonData[ii]=json[i];
        var tsize=json[i].Size;
        json[i].Size-=1;
        for(var iii=0;iii<tsize+1;iii++, ii++, i++){
          if(iii==id){
            ii--;
            continue;
          }
          jsonData[ii]=json[i];
        }
        break;
      }
      jsonData[ii]=json[i];
    }
  }
  console.log(jsonData);
  json=jsonData;
  setConfig();
}
function setConfig() {
  var i=1;
  $('#age tbody').empty();
  $('#gender tbody').empty();
  $('#location tbody').empty();
    var tsize = json[i].Size;
    i++;
    for (var ii = 1; ii < 1+tsize; i++, ii++) {
      tr = $('<tr/>');
      tr
          .append("<tr><td>Range "
              + ii
              + "</td><td><input type=\"number\" id=\""
              + "1age" + ii + "\" value=\""
              + json[i].Min
              + "\" onKeyUp=\"checknumber(this);\">"
              + " - <input type=\"number\"id=\""
              + "2age" + ii + "\" value=\""
              + json[i].Max
              + "\" onKeyUp=\"checknumber(this);\">"
              + " <button class=\"glyphicon glyphicon-remove\" onclick=\"delline('age',"+ii+");\"></button></td></tr>");
      $('#age tbody').append(tr);
    }
    tr = $('<tr/>');
    tr
        .append("<td><button class=\"glyphicon glyphicon-plus\" onclick=\"addline('age');\"></button></td>");
    $('#age tbody').append(tr);
    var tsize = json[i].Size;
    i++;
    for (var ii = 1; ii < 1+tsize; i++, ii++) {
      tr = $('<tr/>');
      tr
          .append("<tr><td>Gender "
              + ii
              + "</td><td><input type=\"text\" id=\""
              + "gender" + ii +"\" value=\""
              + json[i].Gender
              + "\"> <button class=\"glyphicon glyphicon-remove\" onclick=\"delline('gender',"+ii+");\"></button></td></tr>");
      $('#gender tbody').append(tr);
    }
    tr = $('<tr/>');
    tr
        .append("<td><button class=\"glyphicon glyphicon-plus\" onclick=\"addline('gender');\"></button></td>");
    $('#gender	 tbody').append(tr);
    var tsize = json[i].Size;
    i++;
    for (var ii = 1; ii < 1+tsize; i++, ii++) {
      tr = $('<tr/>');
      tr
          .append("<tr><td>Location "
              + ii
              + "</td><td><input type=\"text\" id=\""
              + "location" + ii + "\" value=\""
              + json[i].Location
              + "\"> <button class=\"glyphicon glyphicon-remove\" onclick=\"delline('location',"+ii+");\"></button></td></tr>");
      $('#location tbody').append(tr);
    }
    tr = $('<tr/>');
    tr
        .append("<td><button class=\"glyphicon glyphicon-plus\" onclick=\"addline('location');\"></button></td>");
    $('#location tbody').append(tr);
}
function checknumber(field) {
  field.value = field.value.replace(/[^0-9]/g, '');
  if (field.value > 99) {
    field.value = '99';
  } else if (field.value < 0) {
    field.value = '0';
  }

}
