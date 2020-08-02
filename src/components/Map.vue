<template>
    <div class="ol-map" ref="olmap"></div>
</template>

<script>

import 'ol/ol.css'
import { Map, View } from 'ol'
import { transform, toLonLat } from 'ol/proj'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import ImageLayer from 'ol/layer/Image'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import chroma from 'chroma-js'

const MERCATOR = 'EPSG:3857'
const WGS84 = 'EPSG:4326'

const temColors = [
          'rgba( 238, 238, 238 ,0.85)', 'rgba( 255, 170, 255 ,0.85)',
          'rgba( 145, 9, 145 ,0.85)', 'rgba( 36, 24, 106 ,0.85)',
          'rgba( 85, 78, 177 ,0.85)', 'rgba( 62, 121, 198 ,0.85)',
          'rgba( 75, 182, 152 ,0.85)', 'rgba( 89, 208, 73 ,0.85)',
          'rgba( 190, 228, 61 ,0.85)', 'rgba( 235, 215, 53 ,0.85)',
          'rgba( 234, 164, 62 ,0.85)', 'rgba( 229, 109, 83 ,0.85)',
          'rgba( 190, 48, 102 ,0.85)', 'rgba( 107, 21, 39 ,0.85)',
          'rgba( 43, 0, 1 ,1)'];
const colors = chroma.scale(temColors).domain([98, 103, 108, 113, 118, 123, 128, 133, 138, 143, 148, 153, 158, 163, 168]);

export default {
  name: 'Map',
  data () {
    return {
      map: {},
      imageArray: [],
      canvasLayer: null,
      image: null
    }
  },
  mounted () {
    this.canvasLayer = new ImageLayer({opacity: 0.7});
    var map = new Map({
      target: this.$refs.olmap,
      layers: this.getBaseLayers().concat([this.canvasLayer]),
      view: new View({
        projection: MERCATOR,
        center: this.transformPoint(116, 40),
        zoom: 4,
        maxZoom: 14,
        minZoom: 4,
        enableRotation: false
      })
    });
    this.map = map;
    this.images2Canvas();
    this.image.src = 'images/icon_teplota_2_m_20200728_03.jpg';
  },
  methods: {
    getBaseLayers () {
      var warmlayer = new TileLayer({
        source: new XYZ({
          url: 'https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
        })
      })

      var graylayer = new TileLayer({
        source: new XYZ({
          url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}'
        })
      })

      var bluelayer = new TileLayer({
        source: new XYZ({
          url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      })
      return [bluelayer, graylayer, warmlayer]
    },
    transformPoint (lon, lat) {
      return transform([lon, lat], WGS84, MERCATOR)
    },
    images2Canvas () {
      var self = this;
      var img = new Image;
      self.image = img;
      img.crossOrigin = "anonymous";
      img.onload = function() {
        var canvasPic = document.createElement('canvas');
        var ctxPic = canvasPic.getContext("2d");
        canvasPic.width = this.width;
        canvasPic.height = this.height;
        ctxPic.drawImage(this, 0, 0);
        var imageData = ctxPic.getImageData(0, 0, this.width, this.height).data;
        canvasPic.style.display = 'none';
        self.imageArray = new Float32Array(imageData.length/4);
        Float32Array.prototype.getValue = function(lon,lat){
              var a = lon;
              var b = lat;
              var na = Math.floor(a)<-360?na+=720:Math.floor(a);
              var nb = Math.floor(b)<-180?nb+=360:Math.floor(b);
              var ma = Math.ceil(a)>360?ma-=720:Math.ceil(a);
              var mb = Math.ceil(b)>180?mb-=360:Math.ceil(b);
              var fa = a - na;
              var fb = b - nb;
              var value= this[((90-nb)*2*720+(na+180)*2)] * (1 - fa) * (1 - fb) +
                  this[((90-nb)*2*720+(ma+180)*2)] * fa * (1 - fb) +
                  this[((90-mb)*2*720+(na+180)*2)] * (1 - fa) * fb +
                  this[((90-mb)*2*720+(ma+180)*2)] * fa * fb;
              return value;
        }
        for (var i = 0; i < imageData.length; i+=4 ) {
          self.imageArray[i/4] = imageData[i]
        }
        self.canvasLayer.setSource(new ImageCanvasSource({
          canvasFunction : self.canvasFunction,
          ratio : 1,
          projection : MERCATOR
        }))

      }
    },
    canvasFunction (extent, resolution, pixelRatio, size, projection) {

          var width = Math.round(size[0])*pixelRatio;
          var height = Math.round(size[1])*pixelRatio;
          var can = document.createElement('canvas');
          can.width = width;
          can.height = height;
          var ctx = can.getContext('2d');
          var dx = Math.floor(3*pixelRatio);
          var halfdx = Math.ceil(dx/2);
          
          for (var j = 0; j <= height; j += dx) {
            for (var i = 0; i <= width; i += dx ) {
              var coord = toLonLat(this.map.getCoordinateFromPixel([i/pixelRatio, j/pixelRatio]), projection);
              var value = this.imageArray.getValue(coord[0],coord[1]);
              ctx.fillStyle = colors(value).css();
              ctx.fillRect(i-halfdx,j-halfdx,dx,dx)
            }
          }
          return can;
    }

  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ol-map {
  height: calc(100vh);
  width: auto;
}
</style>
