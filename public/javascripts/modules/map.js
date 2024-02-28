import axios from "axios";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { Circle as CircleStyle, Stroke, Fill, Style, Text } from "ol/style.js";
import { Cluster, OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Overlay from "ol/Overlay.js";
import { $ } from "./bling";
import { createEmpty, extend, getHeight, getWidth } from "ol/extent.js";

// Variable to set style on map points
const image = new CircleStyle({
  radius: 10,
  fill: new Fill({
    color: "rgba(247,112,44)",
  }),
  stroke: new Stroke({
    color: "#fff",
  }),
});

const styles = {
  Point: new Style({
    image: image,
  }),
};

const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

const featuresList = new Array();

// Function to load all the fields and assemble into a feature array
async function loadPlaces() {
  try {
    const res = await axios.get(`/api/fields/all`);
    const places = res.data;

    if (!places.length) {
      alert("No places found");
      return;
    }

    places.forEach((place) => {
      const [placeLng, placeLat] = place.location.coordinates;
      const extractedEntry = new Feature({
        geometry: new Point(fromLonLat([placeLng, placeLat])),
        name: place.name,
        slug: place.slug,
        siteType: place.siteType[0],
        gameTypes: place.gameTypes[0],
      });

      featuresList.push(extractedEntry);
    });
  } catch (error) {
    console.error("Error fetching places:", error);
  }
}

// function for making map with all fields
async function makeMap(mapDiv) {
  if (!mapDiv) return;

  await loadPlaces();

  const vectorSource = new VectorSource({
    features: featuresList,
  });

  const clusterSource = new Cluster({
    distance: 20,
    minDistance: 10,
    source: vectorSource,
  });

  const styleCache = {};

  const vectorLayer = new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      const size = feature.get("features").length;
      let style = styleCache[size];

      let clusterStroke;
      let clusterStrokeColor;

      if (size > 1) {
        clusterStroke = 7;
        clusterStrokeColor = "rgba(247, 112, 44, 0.5)";
      } else {
        clusterStroke = 1;
        clusterStrokeColor = "rgba(255, 255, 255, 0.7)";
      }

      if (!style) {
        style = new Style({
          image: new CircleStyle({
            radius: 10,
            stroke: new Stroke({
              color: clusterStrokeColor,
              width: clusterStroke,
            }),
            fill: new Fill({
              color: "rgba(247,112,44)",
            }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: "#fff",
            }),
          }),
        });
        styleCache[size] = style;
      }
      return style;
    },
  });

  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer,
    ],
    target: mapDiv,
    view: new View({
      center: fromLonLat([-3.64231, 54.8044893]),
      zoom: 5.6,
    }),
  });

  const mapPopupContainer = $("#mapPopup");
  const mapPopupContent = $("#mapPopupContent");
  const mapPopupCloser = $("#mapPopupClose");

  const popup = new Overlay({
    element: mapPopupContainer,
    positioning: "bottom-center",
    stopEvent: false,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });
  map.addOverlay(popup);

  mapPopupCloser.onclick = function () {
    disposePopup();
  };

  // open pop up with site info on click, provided there is only one feature/field
  map.on("singleclick", function (evt) {
    const feature = map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature, layer) {
        if (feature) {
          var coord = map.getCoordinateFromPixel(evt.pixel);

          const features = feature.get("features");
          if (features.length == 1) {
            console.log("Theres 1 feature");
            mapPopupContent.innerHTML = `
            <h5>${features[0].get("name")}</h5>
            <p>
            <span>${features[0].get("siteType") || ""}</span> - <span>${
              features[0].get("gameTypes") || ""
            }</span>
            </p>
            <a href="/field/${features[0].get(
              "slug"
            )}" class="button button-small">
              More info
            </a>
            `;
            disposePopup();
            popup.setPosition(coord);
          } else {
            console.log("Theres more than 1 feature");
            let clickFeature, clickResolution;
            const extent = createEmpty();
            features.forEach((feature) =>
              extend(extent, feature.getGeometry().getExtent())
            );
            const view = map.getView();
            const resolution = map.getView().getResolution();
            if (
              view.getZoom() === view.getMaxZoom() ||
              (getWidth(extent) < resolution && getHeight(extent) < resolution)
            ) {
              // Show an expanded view of the cluster members.
              clickFeature = features[0];
              clickResolution = resolution;
              clusterCircles.setStyle(clusterCircleStyle);
            } else {
              // Zoom to the extent of the cluster members.
              view.fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
            }

            disposePopup();
          }
        } else {
          disposePopup();
        }
      }
    );
  });

  // dispose of the popup
  function disposePopup() {
    if (popup) {
      popup.setPosition(undefined);
      mapPopupCloser.blur();
      return false;
    }
  }

  // change mouse cursor when over marker
  map.on("pointermove", function (e) {
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? "pointer" : "";
  });
}

// Function for making single page map
async function makeSingleMap(mapDiv) {
  if (!mapDiv) return;

  const singleLng = mapDiv.dataset.lng;
  const singleLat = mapDiv.dataset.lat;

  const theField = new Feature({
    geometry: new Point(fromLonLat([singleLng, singleLat])),
  });

  const vectorSource = new VectorSource({
    features: [theField],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
  });

  new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer,
    ],
    target: mapDiv,
    view: new View({
      center: fromLonLat([singleLng, singleLat]),
      zoom: 12,
    }),
  });
}

export { makeMap, makeSingleMap };
