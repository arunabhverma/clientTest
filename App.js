import React, {useCallback, useRef, useState} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const script = (color) => `
  polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: am4core.color("${color}"),
      max: am4core.color("${color}"),
  });

  polygonSeries.data = [
    {
      id: "US-TX",
      value: 0
    }
  ];
  `;

var mainScript = false;
const scriptForGreen = script('#74B266');
const scriptForRed = script('red');
  
const MyApp = () => {
  const webref = useRef();
  const [stateName, setStateName] = useState('');

  const changeTexasColor = useCallback(() => {
    mainScript = !mainScript;
    if(mainScript === true){
      webref.current.injectJavaScript(scriptForRed)
    } else {
      webref.current.injectJavaScript(scriptForGreen)
    }
  }, [])

  const MapView = `
  <html lang="en">
    <head>
        <style>
            #chartdiv {
                width: 100%;
                height: 100%;
            }
        </style>
    </head>

    <body>
        <script src="https://www.amcharts.com/lib/4/core.js"></script>
        <script src="https://www.amcharts.com/lib/4/maps.js"></script>
        <script src="https://www.amcharts.com/lib/4/geodata/usaLow.js"></script>

        <div id="chartdiv"></div>

        <script>
          var chart = am4core.create("chartdiv", am4maps.MapChart);
          chart.geodata = am4geodata_usaLow;
          chart.projection = new am4maps.projections.AlbersUsa();
        
          var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
          polygonSeries.useGeodata = true;
        
          var polygonTemplate = polygonSeries.mapPolygons.template;
          polygonTemplate.fill = am4core.color("#74B266");
          polygonTemplate.events.on("hit", function (ev) {
              ev.target.dataItem.fill = am4core.color("red");
              window.ReactNativeWebView.postMessage(ev.target.dataItem.dataContext.name);
          })
        </script>
    </body>
  </html>
  `;

  return (
    <>
      <WebView
        ref={webref}
        source={{html: MapView}}
        style={{flex: 1}}
        startInLoadingState
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {
          if (webref) {
            setStateName(event?.nativeEvent?.data);
          }
        }}
        useWebKit
        scalesPageToFit
        scrollEnabled={false}
      />
      <View style={styles.bottomButton}>
        <View style={{flex: 0.8}}>
          <Text>Logs</Text>
          <View style={[styles.button, {width: '100%'}]}>
            <Text>
              {stateName
                ? `${stateName} is clicked`
                : 'Please Select any state'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={changeTexasColor}
          style={[styles.button, {width: 100}]}>
          <Text>CHANGE</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  bottomButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    justifyContent: 'space-between',
    padding: 10,
    width: '100%',
  },
});

export default MyApp;
