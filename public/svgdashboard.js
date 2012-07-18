google.load('visualization', '1.0', {'packages':['geochart']});
google.setOnLoadCallback(ready);

function ready() {
  showChart();
  
}


var stupidCountryIds = {
  //soviet union
  "su": "path9794",
  // west germany
  "wd": "path8375",
  // east germany
  "od": "path8364",
  // india without burma (myanmar)
  "in": "path9828",
  // yugoslavia - collapsed 91-03
  "yu": "path8403",
  // saudia arabia
  "sa": "path3380",
  // iran - destroyed by revolution
  "ir": "path4606",
  // indonesia
  "ri": "path2206",
  // west papau - not yet part of indonesia
  "wp": "path2562",
  // Sabah & Sarawak - present east malaysia
  "sw": "path2560",
  // west malaysia
  "my": "path4722",
};

function showChart() {
  var type = getType();
  drawChart(type, year);
}

function drawChart(type) {
  var url;
  var BASE = "https://spreadsheets.google.com/spreadsheet/pub";
  switch (type){
    case "military":
      url = BASE + "?key=0Asm_G8nr4TCSdG1nNjk5RzItcUp6N2dSdHUwOENXa0E&gid=0";
      type_label = "Army Population";
      break;
    case "civilian":
      url = BASE + "?key=phAwcNAVuyj0XOoBL_n5tAQ";
      type_label = "Civilian Population";
      break;
    case "agriculture":
      url = BASE + "?key=0AkBd6lyS3EmpdFhPbDdCTTYxM1dGc21UdE9sSkp1WEE";
      type_label = "Agriculture Output";
      break;
    case "industry":
      url = BASE + "?key=0AkBd6lyS3EmpdHA2UEFOYTlUTWtzV29xbHFuMU00SFE";
      type_label = "Industrial Output";
    break;
    case "alliances":
      url = BASE + "?key=0AhRtQr8CRozEdEMwaHBwWDl4NUhSTUxBZ2FOa25ZLWc";
      type_label = "Alliances";
      break;
  }
  //test();

  if (type === 'alliances'){
    queryAlliances(url);
  }
}
function queryAlliances(url) {

  var query_string = 'select A,B,C,D where B = ' + getYear();

  var query = new google.visualization.Query(url);
  query.setQuery(query_string);
  query.send(showAlliances);  
  console.log(url);
  console.log(query);
}

function showAlliances(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();
  var i;

  console.log(data);

  for (i = 0; i < data.D.length; i++) {
    applyAlliance(data.D[i].c);
  }
  
  console.log(data.D.length);



  var year_string = getYear() + ' A.D.';
  document.getElementById("visualization_year").innerHTML=year_string;

}

function setDisplayInfo(cc) {
  countryApply(cc, function(country) {
    country.onclick = function() {
      document.getElementById("info").innerHTML=cc;
    };
  });

}

function applyAlliance(alliance) {
  var name, color, members;
  name = alliance[0].v;
  color = alliance[2].v;
  members = alliance[3].v.split(/\s+/);

  console.log(members);
  makeAlliance.apply(color, members);


  var colorDiv = document.createElement('p');
  var nameDiv = document.createElement('p');

  var newContent = document.createTextNode(" " + name + " | ");
  var colorContent = document.createTextNode("■");

  colorDiv.style.color = color;
  colorDiv.style.display = 'inline';

  nameDiv.style.display = 'inline';

  nameDiv.appendChild(newContent);
  colorDiv.appendChild(colorContent);

  document.getElementById('alliances').appendChild(colorDiv);
  document.getElementById('alliances').appendChild(nameDiv);

}

function makeAlliance() {
  var i;
  for (i=0; i < arguments.length; i++) {
    cc = arguments[i];
    setMouseOver(cc);
    colorCountry(cc, this);
    console.log(cc);
    setDisplayInfo(cc);
  }
}

function get_year_col(type, year) {
  var delta_year, start_year_col;

  switch (type){
    case "military":
      delta_year = 1985;
      start_year_col = 'B';
      break;
    case "civilian":
      delta_year = 1785;
      start_year_col = 'E';
      break;
    case "agriculture":
      delta_year = 1960;
      start_year_col = 'B';
      break;
    case "industry":
      delta_year = 1960;
      start_year_col = 'B';
      break;
    default:
      return '';
  }

  var delta = year - delta_year;
  var year_col = col_add(start_year_col, delta);
  return year_col;
}

function get_type_color() {
  switch (getType()){
    case "military":
      return 'red';
    case "civilian":
        return 'blue';
    case "industry":
        return 'orange';
    case "agriculture":
        return 'green';
    default:
      return "purple";
  }
}
function showValue(newValue)
{
  document.getElementById("year_val").innerHTML=newValue;
}

function getType()
{
  return document.getElementById("type").value;
}

function getYear()
{
  return document.getElementById("year").value;
}

function setCountryStroke(cc, stroke, color) {
  countryApply(cc, function(country) {
    country.style.stroke = color;
    country.style.strokeWidth = stroke;
  });
}

function opacify(cc, val) {
  countryApply(cc, function(country) {
    country.style['fill-opacity'] = val; 
  });
}

function setMouseOver(cc) {
  countryApply(cc, function(country) {
    //var in_arg = "setCountryStroke('" + country.id + "',  3, 'black')";
    country.onmouseover = function() {
      opacify(cc, 0.4);
      /*
      $(this.parent()).attr('title', 'aus').tooltip({
        track: true, 
        delay: 0, 
        showURL: false, 
        showBody: " - ", 
        fade: 250,
      });
      */
    };

    country.onmouseout = function() {
      opacify(cc, 1);
    };
  });
}

function getCountry(cc) {
  return document.getElementById('visualization').contentDocument
                 .getElementById(cc);
}

function colorCountry(cc, color) {
  countryApply(cc, function(country) {
    country.style.fill = color;
  });
}

/*
 * Because countries are made up of mutiple paths,
 * this is used to apply functions to countries.
 * cc -  ISO_3166 country codes + some missing old countries
 *       as found in stupidCountryIds
 * fn - functions(country) country will be a country element
 */
function countryApply(cc, fn){
  // using ISO_3166 country codes + some missing old countries
  // http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  var i, paths;
  cc = stupidCountryIds[cc] || cc;
  var country = document.getElementById('visualization').contentDocument
                        .getElementById(cc);
  fn(country);

  paths = country.getElementsByTagName('path');
  for (i = 0; i < paths.length; i++) {
    fn(paths[i]);
  }
}

function test() {
  nato();
  others();
  warsaw();
  middleeast();
  southasia();
  southpacific();

  $('#visualization_year').tooltip({
      track: true, 
      delay: 0, 
      showURL: false, 
      showBody: " - ", 
      fade: 250
  });

  /*
  var year_col = get_year_col(type, year);

  query_string = "select A, "
                 + year_col
                 + " label "
                 + year_col 
                 + " '"
                 + type_label
                 + "'";
  console.log(query_string);

  var query = new google.visualization.Query(url);
  query.setQuery(query_string);
  query.send(handleQueryResponse);  

  console.log(query);
  */
}

