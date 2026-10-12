import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { DELIVERY_ZONE, Point } from '@/constants/deliveryZone';

export type PinMapHandle = { moveTo: (p: Point) => void };

// Free map: Leaflet + OpenStreetMap tiles in a WebView — no API key, no billing.
// OSM's tile policy wants attribution (bottom-right) and light use.
// ponytail: public OSM tiles; swap the tile URL for a hosted provider's free
// tier (MapTiler / Stadia) if traffic grows.
// zoom null = no saved pin yet: frame the whole delivery zone instead.
const buildHtml = (p: Point, zoom: number | null) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;height:100%;background:#EDE6DD}</style>
</head><body><div id="map"></div><script>
var map = L.map('map', { zoomControl: false }).setView([${p.latitude}, ${p.longitude}], ${zoom ?? 17});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap'
}).addTo(map);
// Delivery zone outline (radius in metres).
var zone = L.circle([${DELIVERY_ZONE.center.latitude}, ${DELIVERY_ZONE.center.longitude}], {
  radius: ${DELIVERY_ZONE.radiusKm * 1000}, color: '#C94A0A', weight: 2, fillColor: '#C94A0A', fillOpacity: 0.07,
  interactive: false
}).addTo(map);
${zoom == null ? "map.fitBounds(zone.getBounds(), { padding: [16, 16] });" : ''}
var programmatic = false;
// Called from the app; setView without animation fires moveend synchronously,
// so the flag only swallows this move, never the user's next drag.
window.moveTo = function (lat, lng) {
  programmatic = true;
  map.setView([lat, lng], 17, { animate: false });
  programmatic = false;
};
map.on('moveend', function () {
  if (programmatic) return;
  var c = map.getCenter();
  window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: c.lat, longitude: c.lng }));
});
</script></body></html>`;

// Reports the map center whenever the user pans/zooms; the app draws the pin
// on top at the center.
export const PinMap = forwardRef<PinMapHandle, { initial: Point; zoom: number | null; onMove: (p: Point) => void }>(
  function PinMap({ initial, zoom, onMove }, ref) {
    const webRef = useRef<WebView>(null);
    // Built once: re-rendering with new HTML would reload the whole map.
    const [html] = useState(() => buildHtml(initial, zoom));

    useImperativeHandle(ref, () => ({
      moveTo: (p) => webRef.current?.injectJavaScript(`moveTo(${p.latitude}, ${p.longitude}); true;`),
    }));

    return (
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        style={StyleSheet.absoluteFill}
        // OSM asks clients to identify themselves.
        applicationNameForUserAgent="El3amer"
        onMessage={(e) => {
          try {
            onMove(JSON.parse(e.nativeEvent.data));
          } catch {
            // ignore malformed messages
          }
        }}
      />
    );
  },
);
