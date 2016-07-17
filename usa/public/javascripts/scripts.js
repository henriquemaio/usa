$( document ).ready(function() {
  updateDiverging();

  var tooltips = document.querySelectorAll('.myTooltip .toolTip');

  window.onmousemove = function (e) {
    var x = (e.clientX - 20) + 'px',
        y = (e.clientY + 20) + 'px';
    for (var i = 0; i < tooltips.length; i++) {
      tooltips[i].style.top = y;
      tooltips[i].style.left = x;
    }
  };

});

function updateDiverging() {
  $.get('/api/total', function(json){
    data = json.payload;
    var clinton = data.hillary.count;
    var trump = data.trump.count;
    var neutral = data.void.count;
    total = clinton + trump + neutral;
    parcialClinton = (clinton * 100)/total;
    parcialTrump = (trump * 100)/total;
    parcialNeutral = (neutral * 100)/total;
    $('#divergingClinton').width(parcialClinton+'%');
    $('#divergingNeutral').width(parcialNeutral+'%');
    $('#divergingTrump').width(parcialTrump+'%');
    $('#indexesTrump .number').text(trump);
    $('#indexesNeutral .number').text(neutral);
    $('#indexesClinton .number').text(clinton);
  });
}

$(function () {
	/**
   * Sand-Signika theme for Highcharts JS
   * @author Torstein Honsi
   */

  // Load the fonts
  Highcharts.createElement('link', {
    href: 'https://fonts.googleapis.com/css?family=Signika:400,700',
    rel: 'stylesheet',
    type: 'text/css'
  }, null, document.getElementsByTagName('head')[0]);

  // Add the background image to the container
  Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
    proceed.call(this);
    this.container.style.background = 'url(chartbg.png)';
  });


  Highcharts.theme = {
    colors: ["#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
             "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
    chart: {
      backgroundColor: null,
      style: {
        fontFamily: "Signika, serif"
      }
    },
    title: {
      style: {
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      style: {
        color: 'black'
      }
    },
    tooltip: {
      borderWidth: 0
    },
    legend: {
      itemStyle: {
        fontWeight: 'bold',
        fontSize: '13px'
      }
    },
    xAxis: {
      labels: {
        style: {
          color: '#6e6e70'
        }
      }
    },
    yAxis: {
      labels: {
        style: {
          color: '#6e6e70'
        }
      }
    },
    plotOptions: {
      series: {
        shadow: true
      },
      candlestick: {
        lineColor: '#404048'
      },
      map: {
        shadow: false
      }
    },

    // Highstock specific
    navigator: {
      xAxis: {
        gridLineColor: '#D0D0D8'
      }
    },
    rangeSelector: {
      buttonTheme: {
        fill: 'white',
        stroke: '#C0C0C8',
        'stroke-width': 1,
        states: {
          select: {
            fill: '#D0D0D8'
          }
        }
      }
    },
    scrollbar: {
      trackBorderColor: '#C0C0C8'
    },

    // General
    background2: '#E0E0E8'

  };

  // Apply the theme
  Highcharts.setOptions(Highcharts.theme);

  // Get the CSV and create the chart
  var month = 7;
  var interval = 30 * 24 * 3600 * 1000;
  $.getJSON('/api/bymonth/'+ month , function (json) {

    loadCharts(json.payload.csv, interval, loadDay);


  });

});


function loadDay(e) {
  console.log(this.x,this.y);
  var localDate = new Date(this.x);
  var offset = localDate.getTimezoneOffset() * 60000;
  var date = new Date(localDate.getTime() + offset);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  console.log(date,day,month);
  var interval = 3600 * 1000;
  $.getJSON('/api/byday/'+ month + '/'+ day, function (json) {
    console.log(json);
    loadCharts(json.payload.csv, interval, showData);
  });
}

function showData(e) {
  hs.htmlExpand(null, {
    pageOrigin: {
      x: e.pageX || e.clientX,
      y: e.pageY || e.clientY
    },
    headingText: this.series.name,
    maincontentText: Highcharts.dateFormat('%A, %b %e, %Y', this.x) + ':<br/> ' +
      this.y + ' sentiment',
    width: 200
  });
}

function loadCharts(csv, interval, eventClick) {
  $('#container').highcharts({

    data: {
      csv: csv
    },

    title: {
      text: 'Hillary Clinton x Donald Trump'
    },

    subtitle: {
      text: 'Fonte: Twitter'
    },

    xAxis: {
      tickInterval: interval, // one week
      tickWidth: 0,
      gridLineWidth: 1,
      labels: {
        align: 'left',
        x: 3,
        y: -3
      },
      type: 'datetime'
    },

    yAxis: [{ // left y axis
      title: {
        text: null
      },
      labels: {
        align: 'left',
        x: 3,
        y: 16,
        format: '{value:.,0f}'
      },
      showFirstLabel: false
    }, { // right y axis
      linkedTo: 0,
      gridLineWidth: 0,
      opposite: true,
      title: {
        text: null
      },
      labels: {
        align: 'right',
        x: -3,
        y: 16,
        format: '{value:.,0f}'
      },
      showFirstLabel: false
    }],

    legend: {
      align: 'left',
      verticalAlign: 'top',
      y: 20,
      floating: true,
      borderWidth: 0
    },

    tooltip: {
      shared: true,
      crosshairs: true
    },

    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: eventClick
          }
        },
        marker: {
          lineWidth: 1
        }
      }
    },

    series: [{
      name: 'All visits',
      lineWidth: 4,
      marker: {
        radius: 4
      }
    }, {
      name: 'USA Fight'
    }]
  });
}
