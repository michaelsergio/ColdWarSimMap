/**
 * If your reading this I apologize for the way the code currently looks.
 * I plan on cleaning this up and open sourcing this soon enough.
 * However, since you're intrested, I have left this app unminifed 
 * in its current state for you.
 *
 * If you find any bugs before this goes up on git
 * send them to mikeserg at gmail
 *
 * Until then,
 * Abandon All Hope...
 */
google.load('visualization', '1.0', {'packages':['geochart']});

var BASE = "https://spreadsheets.google.com/spreadsheet/pub";
var SPREADSHEET_QS = "?key=0AhRtQr8CRozEdDhKZ0ZaMTNTaE02NUVDekphSlBJTVE&gid=1";
var SPREADSHEET_URL = BASE + SPREADSHEET_QS;

$(function(){
  var Nation = Backbone.Model.extend({
    totalPopulation: function() {
      var milpop = this.get('milpop'),
          civpop = this.get('civpop'),
          ret;
      if (_.isNumber(milpop)) {
        ret = _.isNumber(civpop) ? milpop + civpop : milpop;
      }
      else {
        ret =  _.isNumber(civpop) ? civpop : 0;
      }
      return ret;
    },

    totalProduction: function() {
      var indupro = this.get('indupro'),
          agripro = this.get('agripro');
      if (_.isNumber(indupro)) {
        ret = _.isNumber(agripro) ? indupro + agripro : indupro;
      }
      else {
        ret = _.isNumber(agripro) ? agripro : 0;
      }
      return ret;
    },

    resourceToUse: function(resources) {
      if (resources === "totalpop") {
        return this.totalPopulation();
      }
      if (resources === "totalpro") {
        return this.totalProduction();
      }
      return this.get(resources);  
    },

    getTerritories: function() {
      var owns = this.get('territory').split(/\s+/);
      owns.push(this.get('id'));
      return owns;
    },
    
    getPlayerUrl: function() {
      return "http://www.reddit.com/user/" + this.get('player');
    }

  });

  var World = Backbone.Collection.extend({
    model: Nation,

    fetch: function(options) {
      var collection = this;
      var query_string = "select *";
      var query = new google.visualization.Query(SPREADSHEET_URL);
      query.setQuery(query_string);
      query.send(function(response) {
        if (response.isError()) {
          alert('Error in query: ' + response.getMessage() + ' '
                 + response.getDetailedMessage());
          return;
        }

        var data = response.getDataTable();
        console.log(data);

        var i;
        var results = [];
        for (i = 0; i < data.D.length; i++) {
          var nameYear = data.getValue(i,2).split(":");
          var nation = {
            id: data.getValue(i, 1),
            name: nameYear[0],
            year: nameYear[1].trim(),
            player: data.getValue(i, 3),
            civpop: data.getValue(i, 4),
            milpop: data.getValue(i, 5),
            nukes: data.getValue(i, 6),
            agripro: data.getValue(i, 7),
            indupro: data.getValue(i, 8),
            alliance: data.getValue(i, 11),
            territory: data.getValue(i, 12),
            capital: data.getValue(i, 13)
          };

          results.push(nation);
        }
        collection.reset(results);

        if (options.success) {
          options.success();
        }
      }); 

    },

    getAlliances: function() {
      var collection = this;
      var alliances = collection.groupBy(function(nation){
        var alliance = nation.get('alliance');
        if (alliance) { 
          return alliance; 
        }
      });
      return alliances;
    },
  });


  var ControlView = Backbone.View.extend({
    el: $('#control'),

    events: {
      "click #type-pretty": "pretty",
      "click #type-alliance": "alliance",
      "click #type-civpop": "civpop",
      "click #type-milpop": "milpop",
      "click #type-totalpop": "totalpop",
      "click #type-indupro": "indupro",
      "click #type-agripro": "agripro",
      "click #type-totalpro": "totalpro",
      "click #type-nukes": "nukes",
    },
    
    initialize: function() {
      this.mapview = this.options.mapview;
    },

    pretty: function() {
      this.mapview.colorAll();
    },
    alliance: function() {
      this.mapview.colorAllKnownAlliances();
    },
    civpop: function() {
      this.mapview.colorResources('civpop', 'blue');
    },
    milpop: function() {
      this.mapview.colorResources('milpop', 'red');
    },
    agripro: function() {
      this.mapview.colorResources('agripro', 'green');
    },
    indupro: function() {
      this.mapview.colorResources('indupro', 'orange');
    },
    totalpop: function() {
      this.mapview.colorResources('totalpop', 'purple');
    },
    totalpro: function() {
      this.mapview.colorResources('totalpro', 'olive');
    },
    nukes: function() {
      this.mapview.colorResources('nukes', 'brown');
    },

  });


  /*

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

  */

  function showValue(newValue)
  {
    $('#year_val').val(newValue);
  }

  function getYear()
  {
    return $("#year").val();
  }

  // SVG Map
  // ============================================

  function opacify(cc, val) {
    countryApply(cc, function(country) {
      country.style['fill-opacity'] = val; 
    });
  }

  function getCountry(cc) {
    return document.getElementById('visualization').contentDocument
                   .getElementById(cc);
  }

  function colorCountry(cc, color) {
    countryApply(cc, function(country) {
      if (country === null) {
        console.log("Country not found: " + cc);
      }
      else {
        country.style.fill = color;
      }
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
    //cc = stupidCountryIds[cc] || cc;
    var country = document.getElementById('visualization').contentDocument
                          .getElementById(cc);
    if (country) {
      fn(country);

      paths = country.getElementsByTagName('path');
      for (i = 0; i < paths.length; i++) {
        fn(paths[i]);
      }
    }
    else {
      console.log("Country not found: " + cc);
    }
  }

  var InfoView = Backbone.View.extend({
    el: $('#info'),

    events: {
      "click #territory": "showTerritory"  
    },

    initialize: function() {
      this.mapview = this.options.mapview;
    },

    showNation: function(cc) {
      this.cc = cc;
      var nation = this.collection.get(cc);
      var nationName = nation.get('name');
      this.$el.find('#name').text(nationName);
      this.$el.find('#year').text(nation.get('year'));
      this.$el.find('#civpop').text(nation.get('civpop'));
      this.$el.find('#milpop').text(nation.get('milpop'));
      this.$el.find('#nukes').text(nation.get('nukes'));
      this.$el.find('#agripro').text(nation.get('agripro'));
      this.$el.find('#indupro').text(nation.get('indupro'));
      this.$el.find('#capital').text(nation.get('capital'));
      this.$el.find('#totalpop').text(nation.totalPopulation());
      this.$el.find('#totalpro').text(nation.totalProduction());

      var playerEl = this.$el.find('#player');
      playerEl.text(nation.get('player'));
      playerEl.attr('href', nation.getPlayerUrl());

      
      // flag
      this.$el.find('#flag').attr('class', 'flag ' + nation.id);

      // alliance
      var alliance = nation.get('alliance');
      this.$el.find('#alliance').text(alliance);
      var allianceFlag = this.getAllianceFlag(alliance);
      var allianceFlagEl = this.$el.find('#alliance-flag');
      if (allianceFlag) {
        allianceFlagEl.attr('class', 'flag ' + allianceFlag);
      }
      else {
        allianceFlagEl.attr('class', '');

      }
      
      // territory
      var territoryEl = this.$el.find('#territory');
      var territoryCC = nation.get('territory').split(/\s+/);
      var terrritoryNames = _.map(territoryCC, function(cc) {
        if (cc) {
          return this.collection.get(cc).get('name');
        }
      }, this);
      territoryEl.text(terrritoryNames.join(', '));
      territoryEl.attr('href', '#territory-' + cc);

    },

    showTerritory: function() {
      this.mapview.colorTerritory(this.cc);
    },

    getAllianceFlag: function(allianceName) {
      switch(allianceName) {
        case "African Union":
        case "AU":
        case "LAN":
          return "_African_Union(OAS)";
        case "Arab League":
            return "_Arab_League";
        case "ASEAN":
            return "_ASEAN";
        case "CARICOM":
          return "_CARICOM";
        case "CIS":
          return "_CIS";
        case "Commonwealth":
          return "_Commonwealth";
        case "EU":
          return "_European_Union";
        case "Islamic Conference":
          return "_Islamic_Conference";
        case "NATO":
          return "_NATO";
        case "Olimpic Movement":
        case "6MMB":
          return "_Olimpic_Movement";
        case "OPEC":
          return "_OPEC";
        case "Red Cross":
          return "_Red_Cross";
        case "UN":
          return "_United_Nations";
        // because I know this will come up
        // hopefully I wont make to many people angry
        case "USSR":
        case "Warsaw Pact":
          return "ma";
        default:
          return null;
      }

    }

  });

  var SearchView = Backbone.View.extend({
    el: $('#search'),

    initialize: function() {
      this.infoview = this.options.infoview;
      
      // all names
      var nations = this.collection.map(function(nation) {
        return nation.get('name');
      });

      // build reverse map
      this.reverseMap = this.collection.reduce(function(map, nation) {
        map[nation.get('name')] = nation.get('id');
        return map;
      }, {}, this);

  
      var searchview = this;
      var ac = this.$el.autocomplete({
        source: nations,
        select: function(event, ui) {
          var selected = ui.item;

          ac.autocomplete('close');
          //this.text(selected);
          var cc = searchview.reverseMap[selected.value];
          var nation = searchview.collection.get(cc);
          searchview.infoview.showNation(nation);
        }  
      });

    },
  });



  var MapView = Backbone.View.extend({  
    el: $('#visualization'),

    initialize: function() {
      this.colorI = -1;
      this.infoview = this.options.infoview;
      this.colorAll();

    },

    resetMap: function() {
      $('#legend').text('');

      this.collection.map(function(nation) {
        var cc = nation.id;
        countryApply(cc, function(country) {
          country.style['fill-opacity'] = 1; 
        });
      }, this);


    }, 

    colorAll: function() {
      this.resetMap();
      
      var nations = _.map(this.collection.models, function(member) {
        return member.id;
      });
      _.each(nations, function(cc) {
        colorCountry(cc, this.randomColor());
        this.setMouseOver(cc, true);
      }, this);
      
      colorCountry('ocean', '#D6FFFF');
      colorCountry('aq', '#E6FFFF');
    },

    colorAllKnownAlliances: function() {
      this.resetMap();

      var map = this;
      var allies = this.collection.getAlliances();
      _.each(allies, function(val, key) {
        map.applyAlliance(key, val);
      });
    },

    colorResources: function(type, color) {
      this.resetMap();

      var max = this.collection.max(function(nation) {
        return nation.resourceToUse(type);
      });

      var maxVal = max.resourceToUse(type);

      var resources = this.collection.reduce(function(obj, nation) {
        var resource = nation.resourceToUse(type);
        obj[nation.get('id')] = resource / maxVal;
        return obj;
      }, {});

      if (!maxVal) {
        color = '';
      }
      _.each(resources, function(val, key) {
        // color nation with alpha set to value
        colorCountry(key, color);
        this.setMouseOver(key, false);
        opacify(key, val);
      }, this); 
    },

    colorTerritory: function(cc) {
      this.resetMap();

      var color = this.randomColor();
      var nation = this.collection.get(cc);
      var land = nation.getTerritories();
      // make a object for quick access
      // split the world into has and hasnot
      // blank color for the hasnot

      var landObject = _.reduce(land, function(obj, item) {
        obj[item] = 1;
        return obj;
      }, {});

      var groups = this.collection.groupBy(function(item) {
        return _.has(landObject, item.id);
      });

      var has = groups[true] || [];
      var hasnot = groups[false] || [];
      
      _.each(has, function(nation) {
        colorCountry(nation.id, color);
      });
      _.each(hasnot, function(nation) {
        colorCountry(nation.id, '');
      });

      $('#legend').text(nation.get('name') + "'s Territory");
    },

    getAllianceColor: function(name) {
      switch(name) {
        case "NATO": return 'blue';
        case "USSR": return 'brown';
        case "undefined": return '';
      }

      this.colorI++;
      var colorList = ['green', 'orange', 'yellow', 'purple', 'cyan', 'magenta',
                       'lightgreen', 'red'];
      if (this.colorI > colorList.length) {
        return 'grey';
      }

      return colorList[this.colorI];
    },

    applyAlliance: function(name, members) {
      var color = this.getAllianceColor(name);

      // set the map element colors
      members = _.map(members, function(member) {
        return member.id;
      });
      this.makeAlliance(color, members);

      // make legend
      if (name !== 'undefined') {
        var colorDiv = $('<p>');
        colorDiv.text("■");
        colorDiv.css('color', color);
        colorDiv.css('display', 'inline');


        var nameDiv = $('<p>');
        nameDiv.text(" " + name + " | ");
        nameDiv.css('display', 'inline');

        $('#legend').append(colorDiv).append(nameDiv);
      }
    },

    makeAlliance: function(color, members) {
      _.each(members, function(cc) {
        this.setMouseOver(cc, true);
        colorCountry(cc, color);
      }, this);
    },

    //TODO this will handle locking
    setDisplayInfo: function(cc) {
      var map = this;
      countryApply(cc, function(country) {
        country.onclick = function() {
          map.infoview.showNation(cc);
        };
      });
    },

    setMouseOver: function(cc, shouldOpacify) {
      var map = this;

      // support legacy functions
      if (shouldOpacify === undefined) {
        shouldOpacify = true;
      }

      countryApply(cc, function(country) {
        country.onmouseover = function() {
          map.infoview.showNation(cc);
          if (shouldOpacify) {
            opacify(cc, 0.4);
          }
        };

        country.onmouseout = function() {
          if (shouldOpacify) {
            opacify(cc, 1);
          }
        };
      });
    },

    randomColor: function() {
      var rc = function() { return Math.floor(Math.random() * 256); };
      return 'rgb(' + rc() + ',' + rc() + ',' + rc() + ')';
    }
  });

  function pullAllData() {
    var world = new World();
    world.fetch({
      success: function(){
        console.log(world);

        var infoview = new InfoView({collection: world});
        var searchview = new SearchView({collection: world, infoview:infoview});
        var mapview = new MapView({collection: world, infoview: infoview});
        infoview.mapview = mapview;
        var controlview = new ControlView({mapview: mapview});
      }
    });
  }

  google.setOnLoadCallback(pullAllData);
});
