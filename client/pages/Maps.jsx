  import React, { useState } from "react";
  import {
    GoogleMap,
    LoadScript,
    Polyline,
    InfoWindow,
  } from "@react-google-maps/api";

  const containerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "12px",
  };

  // River path for Mithi River
  const mithiRiverPath = [
    { lat: 19.1440051, lng: 72.8997944 },
  { lat: 19.1442645, lng: 72.8995105 },
  { lat: 19.1443978, lng: 72.8990007 },
  { lat: 19.1445289, lng: 72.8983407 },
  { lat: 19.144692, lng: 72.8975593 },
  { lat: 19.1447022, lng: 72.8970262 },
  { lat: 19.1446006, lng: 72.896921 },
  { lat: 19.1440703, lng: 72.8968292 },
  { lat: 19.1432336, lng: 72.8964977 },
  { lat: 19.1431158, lng: 72.8959286 },
  { lat: 19.1430955, lng: 72.8954458 },
  { lat: 19.1429566, lng: 72.8948533 },
  { lat: 19.1424113, lng: 72.8944373 },
  { lat: 19.1421257, lng: 72.8943434 },
  { lat: 19.1417779, lng: 72.894448 },
  { lat: 19.1411743, lng: 72.8947513 },
  { lat: 19.1409265, lng: 72.8949577 },
  { lat: 19.140445, lng: 72.8956121 },
  { lat: 19.1399686, lng: 72.8961647 },
  { lat: 19.1393909, lng: 72.8971517 },
  { lat: 19.1382711, lng: 72.8979963 },
  { lat: 19.1375132, lng: 72.8983748 },
  { lat: 19.1365126, lng: 72.8984199 },
  { lat: 19.1354268, lng: 72.8978701 },
  { lat: 19.1352863, lng: 72.8975005 },
  { lat: 19.1355077, lng: 72.8964774 },
  { lat: 19.1352182, lng: 72.8960898 },
  { lat: 19.1343751, lng: 72.8958014 },
  { lat: 19.1333532, lng: 72.8960222 },
  { lat: 19.1324121, lng: 72.8966847 },
  { lat: 19.1321918, lng: 72.8968352 },
  { lat: 19.1317226, lng: 72.8969697 },
  { lat: 19.131386, lng: 72.8969769 },
  { lat: 19.1310439, lng: 72.8968728 },
  { lat: 19.1307813, lng: 72.8967433 },
  { lat: 19.1305098, lng: 72.8962991 },
  { lat: 19.1304408, lng: 72.8954726 },
  { lat: 19.1302272, lng: 72.8946901 },
  { lat: 19.1306003, lng: 72.8940535 },
  { lat: 19.1318358, lng: 72.8922826 },
  { lat: 19.1326306, lng: 72.8914491 },
  { lat: 19.1329089, lng: 72.8909129 },
  { lat: 19.1329951, lng: 72.8904033 },
  { lat: 19.1327214, lng: 72.8898561 },
  { lat: 19.1322552, lng: 72.8894162 },
  { lat: 19.1318294, lng: 72.8890943 },
  { lat: 19.1313277, lng: 72.8889227 },
  { lat: 19.1310135, lng: 72.8885096 },
  { lat: 19.130907, lng: 72.8878123 },
  { lat: 19.1306739, lng: 72.8867823 },
  { lat: 19.1303597, lng: 72.8865945 },
  { lat: 19.1297667, lng: 72.8860259 },
  { lat: 19.1297971, lng: 72.8847921 },
  { lat: 19.1297329, lng: 72.8845311 },
  { lat: 19.1294716, lng: 72.8844184 },
  { lat: 19.1291965, lng: 72.8842998 },
  { lat: 19.1290318, lng: 72.8842288 },
  { lat: 19.128378, lng: 72.8841698 },
  { lat: 19.127875, lng: 72.8842959 },
  { lat: 19.1276216, lng: 72.8844032 },
  { lat: 19.1272579, lng: 72.8852266 },
  { lat: 19.1271515, lng: 72.8861439 },
  { lat: 19.1268829, lng: 72.8864765 },
  { lat: 19.1265737, lng: 72.8865945 },
  { lat: 19.1259998, lng: 72.8865811 },
  { lat: 19.1246224, lng: 72.8868574 },
  { lat: 19.124013, lng: 72.8870961 },
  { lat: 19.1232324, lng: 72.887418 },
  { lat: 19.1226952, lng: 72.8874931 },
  { lat: 19.1220971, lng: 72.8881368 },
  { lat: 19.1215548, lng: 72.8883929 },
  { lat: 19.1212963, lng: 72.8877505 },
  { lat: 19.1209212, lng: 72.8868279 },
  { lat: 19.1204853, lng: 72.8863236 },
  { lat: 19.1193297, lng: 72.8860017 },
  { lat: 19.118387, lng: 72.8858515 },
  { lat: 19.1170489, lng: 72.8860232 },
  { lat: 19.1157412, lng: 72.8862592 },
  { lat: 19.1145247, lng: 72.8870532 },
  { lat: 19.113957, lng: 72.8871819 },
  { lat: 19.1134806, lng: 72.8868279 },
  { lat: 19.1128622, lng: 72.8860017 },
  { lat: 19.1121487, lng: 72.8853875 },
  { lat: 19.1117078, lng: 72.8852427 },
  { lat: 19.1111907, lng: 72.8852481 },
  { lat: 19.1108663, lng: 72.8853607 },
  { lat: 19.1107122, lng: 72.885583 },
  { lat: 19.110476, lng: 72.8860259 },
  { lat: 19.1099286, lng: 72.8866267 },
  { lat: 19.1097715, lng: 72.8868306 },
  { lat: 19.1095485, lng: 72.88697 },
  { lat: 19.1092494, lng: 72.8869218 },
  { lat: 19.1082154, lng: 72.8866106 },
  { lat: 19.1070449, lng: 72.8860542 },
  { lat: 19.1067519, lng: 72.8856219 },
  { lat: 19.105909, lng: 72.8841752 },
  { lat: 19.1057671, lng: 72.8840679 },
  { lat: 19.10451, lng: 72.8839552 },
  { lat: 19.1043085, lng: 72.8838517 },
  { lat: 19.103977, lng: 72.8834112 },
  { lat: 19.1031312, lng: 72.8820026 },
  { lat: 19.1026345, lng: 72.8804415 },
  { lat: 19.1021123, lng: 72.8800446 },
  { lat: 19.0997991, lng: 72.8792101 },
  { lat: 19.0989666, lng: 72.8790388 },
  { lat: 19.098612, lng: 72.8791448 },
  { lat: 19.0984733, lng: 72.8794222 },
  { lat: 19.0983731, lng: 72.8802216 },
  { lat: 19.0980185, lng: 72.8808416 },
  { lat: 19.097317, lng: 72.880964 },
  { lat: 19.0964151, lng: 72.8810129 },
  { lat: 19.0959791, lng: 72.8806495 },
  { lat: 19.0957984, lng: 72.880499 },
  { lat: 19.0954593, lng: 72.8801564 },
  { lat: 19.0948811, lng: 72.8799606 },
  { lat: 19.0944649, lng: 72.8792835 },
  { lat: 19.0940871, lng: 72.8788267 },
  { lat: 19.0933934, lng: 72.8784759 },
  { lat: 19.0921225, lng: 72.8786079 },
  { lat: 19.0912659, lng: 72.8788436 },
  { lat: 19.0876913, lng: 72.878796 },
  { lat: 19.0854841, lng: 72.8786636 },
  { lat: 19.0837726, lng: 72.8778152 },
  { lat: 19.083233, lng: 72.8775705 },
  { lat: 19.0819995, lng: 72.8776112 },
  { lat: 19.0806042, lng: 72.8784841 },
  { lat: 19.0797335, lng: 72.8786806 },
  { lat: 19.0793244, lng: 72.8785657 },
  { lat: 19.078885, lng: 72.8779946 },
  { lat: 19.0788773, lng: 72.8772278 },
  { lat: 19.0790469, lng: 72.8765997 },
  { lat: 19.0789818, lng: 72.8763395 },
  { lat: 19.0789534, lng: 72.8762262 },
  { lat: 19.0778288, lng: 72.8755393 },
  { lat: 19.0772737, lng: 72.8748867 },
  { lat: 19.076672, lng: 72.8735798 },
  { lat: 19.0757704, lng: 72.8719092 },
  { lat: 19.0754927, lng: 72.8715366 },
  { lat: 19.0753295, lng: 72.8714726 },
  { lat: 19.0743916, lng: 72.8717673 },
  { lat: 19.0731764, lng: 72.8721546 },
  { lat: 19.0720107, lng: 72.8727658 },
  { lat: 19.071424, lng: 72.873202 },
  { lat: 19.0705633, lng: 72.8734019 },
  { lat: 19.067265, lng: 72.8727207 },
  { lat: 19.0597916, lng: 72.8695579 },
  { lat: 19.0566072, lng: 72.8682171 },
  { lat: 19.0555638, lng: 72.8661285 },
  { lat: 19.0555792, lng: 72.8648151 },
  { lat: 19.0560284, lng: 72.8638118 },
  { lat: 19.0563884, lng: 72.8629321 },
  { lat: 19.0565912, lng: 72.8617251 },
  { lat: 19.0568853, lng: 72.8607112 },
  { lat: 19.0572859, lng: 72.8600782 },
  { lat: 19.0576104, lng: 72.8593218 },
  { lat: 19.0577625, lng: 72.8587103 },
  { lat: 19.0573112, lng: 72.857101 },
  { lat: 19.0570472, lng: 72.8566914 },
  { lat: 19.0554699, lng: 72.8552907 },
  { lat: 19.0522152, lng: 72.8518102 },
  { lat: 19.0517322, lng: 72.8503619 },
  { lat: 19.051701, lng: 72.8497886 },
  { lat: 19.051863, lng: 72.8491715 },
  { lat: 19.0519057, lng: 72.8485405 },
  { lat: 19.0518934, lng: 72.8482684 },
  { lat: 19.0517546, lng: 72.8478448 },
  { lat: 19.0516978, lng: 72.8475989 },
  { lat: 19.051603, lng: 72.8466962 },
  { lat: 19.051622, lng: 72.8449262 },
  { lat: 19.0514993, lng: 72.8442436 },
  { lat: 19.0513328, lng: 72.8437592 },
  { lat: 19.0512561, lng: 72.8431831 },
  { lat: 19.0505086, lng: 72.8416212 },
  { lat: 19.05035, lng: 72.8410193 },
  { lat: 19.050016, lng: 72.8404521 },
  { lat: 19.0496808, lng: 72.8401574 },
  { lat: 19.0492937, lng: 72.8400447 },
  { lat: 19.0488438, lng: 72.8400205 },
  { lat: 19.0480714, lng: 72.8400412 },
  { lat: 19.0478994, lng: 72.8393269 },
  { lat: 19.0480425, lng: 72.8388524 },
  { lat: 19.0482703, lng: 72.8380971 },
  { lat: 19.0486436, lng: 72.8371257 },
  { lat: 19.0485487, lng: 72.8363787 },
  ];

  // Dark futuristic style with improved contrast
  const mapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
  ];

  export default function Maps() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [selected, setSelected] = useState(null);

    if (!apiKey) return <div style={{ color: "red", textAlign: "center", padding: "20px" }}>API key missing!</div>;

    return (
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: 19.095, lng: 72.855 }}
          zoom={14}
          options={{ styles: mapStyle }}
        >
          <Polyline
            path={mithiRiverPath}
            options={{
              strokeColor: "#00f5ff",
              strokeOpacity: 1,
              strokeWeight: 3, // Thinner line
              zIndex: 2,
              clickable: true,
              icons: [
                {
                  icon: {
                    path: window.google?.maps?.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 3,
                    strokeColor: "#ffffff",
                    fillColor: "#ffffff",
                    fillOpacity: 1,
                  },
                  offset: "100%",
                },
              ],
            }}
            onClick={(e) =>
              setSelected({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />

          {selected && (
            <InfoWindow
              position={selected}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ color: "#ffffff", backgroundColor: "#242f3e", padding: "10px", borderRadius: "5px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#00f5ff" }}>Mithi River</h4>
                <p style={{ margin: 0 }}>
                  Latitude: {selected.lat.toFixed(4)}
                  <br />
                  Longitude: {selected.lng.toFixed(4)}
                </p>
                <p style={{ margin: "5px 0 0 0", color: "#9ca5b3" }}>Click for more info</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    );
  }