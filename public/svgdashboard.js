var stupidCountryId = {
  //soviet union
  "su": "path9794"
};

function showChart() {
  var year = getYear();
  var type = getType();
  drawChart(type, year);
}

function drawChart(type, year) {
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
  }

  var year_string = getYear() + ' A.D.';
  document.getElementById("visualization_year").innerHTML=year_string;
  setCountry('au', 'red');

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

function setCountry(cc, color){
  var i, paths;
  cc = stupidCountryId[cc] || cc;
  var country = document.getElementById('visualization').contentDocument
                        .getElementById(cc);
  country.style.fill = color;

  paths = country.getElementsByTagName('path');
  for (i = 0; i < paths.length; i++) {
    paths[i].style.fill = color;
  }
}
