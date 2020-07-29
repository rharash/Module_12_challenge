function buildGauge(wfreq){


  let traceGauge = {
    type: 'pie',
    showlegend: false,
    hole: 0.4,
    rotation: 90,
    values: [180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180],
    text: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
    direction: 'clockwise',
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: ['#F8F3EC','#F4F1E5','#E9E6CA','#E2E4B1','#D5E49D','#B7CC92','#8CBF88','#8ABB8F','#85B48A','white'],
      labels: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9',''],
      hoverinfo: "label"
    },
    hoverinfo: "skip"
  }

  let dot = {
    type: 'scatter',
    x: [0],
    y: [0],
    marker: {
      size: 14,
      color:'#850000'
    },
    showlegend: false,
    hoverinfo: "skip"
  }

  let weight = 0;
  if (wfreq == 2 || wfreq == 3){
    weight = 3;
  } else if (wfreq == 4){
    weight = 1;
  } else if (wfreq == 5){
    weight = -.5;
  } else if (wfreq == 6){
    weight = -2;
  } else if (wfreq == 7){
    weight = -3;
  }

  let degrees = 180-(20 * wfreq + weight); 
  let radius = .5;
  let radians = degrees * Math.PI / 180;
  let aX = 0.025 * Math.cos((radians) * Math.PI / 180);
  let aY = 0.025 * Math.sin((radians) * Math.PI / 180);
  let bX = -0.025 * Math.cos((radians) * Math.PI / 180);
  let bY = -0.025 * Math.sin((radians) * Math.PI / 180);
  let cX = radius * Math.cos(radians);
  let cY = radius * Math.sin(radians);
  let path = 'M ' + aX + ' ' + aY +
            ' L ' + bX + ' ' + bY +
            ' L ' + cX + ' ' + cY +
            ' Z';

  let gaugeLayout = {
    title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '#850000',
        line: {
          color: '#850000'
        }
      }],
    xaxis: {zeroline:false, 
            showticklabels:false,
            showgrid: false, 
            range: [-1, 1],
            fixedrange: true
          },
    yaxis: {zeroline:false, 
            showticklabels:false,
            showgrid: false, 
            range: [-1, 1],
            fixedrange: true
          }
  };

  Plotly.newPlot("gauge", [traceGauge, dot], gaugeLayout);
}


function buildMetadata(sample) {

  d3.json("samples.json").then((data) => {
      
      var metadata = data.metadata;
      var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
      var result = resultArray[0];
      var PANEL = d3.select("#sample-metadata");
      PANEL.html("");   
      for (const [key, value] of Object.entries(result)) {
              PANEL.append("h6").text(key.toUpperCase() + ': ' + value);
      }
      buildGauge(result.wfreq);
  });
}

function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
  
    var samples = data.samples;
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);

    var result = resultArray[0];

    var all_otu_ids = result.otu_ids;
    var all_sample_values = result.sample_values;
    var all_otu_labels = result.otu_labels;
    
  
    var bar_trace = [{
      x: all_sample_values.slice(0, 10).reverse(),
      y: all_otu_ids.slice(0, 10).map(numericIds => {return 'OTU' + numericIds}).reverse(),    
      type: 'bar',
      orientation: 'h',
      hovertext: all_otu_labels.slice(0, 10).reverse()
    }];
    var bar_layout = {
      title: 'Top 10 bacterial species (OTUs)',
      bargap: 0.5
    };
    
    Plotly.newPlot('bar', bar_trace, bar_layout);

  
    var bubble_trace = [{
      type: 'scatter',
      x: all_otu_ids,
      y: all_sample_values,
      mode: 'markers',
      marker: {
        size: all_sample_values,
        color: all_otu_ids
      },
      hovertext: all_otu_labels,
    }];
    
    var bubble_layout = {
      title: 'Mapping all bacterial species',
      xaxis: {title: 'OTU ID'}
    };
    
    Plotly.newPlot('bubble', bubble_trace, bubble_layout);
  });
}

function init() {
  var selector = d3.select("#selDataset");
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    var first_name = sampleNames[0];
    buildMetadata(first_name);
    buildCharts(first_name);
  }); 
}


function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
}


init();