import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point, LineString, Polygon } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { getArea, getLength } from 'ol/sphere';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [drawType, setDrawType] = useState('Point');
    const [areas, setAreas] = useState({});
    const [pointsSource, setPointsSource] = useState(new VectorSource({}));

    useEffect(() => {
        if (!mapRef.current) return;
        // Initialize the map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: pointsSource,
                    style: new Style({
                        image: new Circle({
                            radius: 5,
                            fill: new Fill({ color: 'red' }),
                            stroke: new Stroke({ color: 'white', width: 2 }),
                        }),
                    }),
                }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        });

        const vectorSource = new VectorSource({});

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        map.addLayer(vectorLayer);

        let draw;
        // Function to create draw interaction based on the draw type
        const createDrawInteraction = (type) => {
            if (draw) {
                map.removeInteraction(draw);
            }
            draw = new Draw({
                source: vectorSource,
                type: type,
            });

            // Event listener for when a draw operation is completed
            draw.on('drawend', (event) => {
                const feature = event.feature;
                if (feature.getGeometry()) {
                    const geometry = feature.getGeometry();
                    if (geometry.getType() === 'Polygon') {
                        const areaValue = getArea(geometry).toFixed(2);
                        const id = new Date().getTime();
                        setAreas((prevAreas) => ({ ...prevAreas, [id]: areaValue }));
                        console.log('Area: ', areaValue);
                    } else if (geometry.getType() === 'LineString') {
                        const length = getLength(geometry).toFixed(2);
                        console.log('Length: ', length);
                    }
                }
            });

            map.addInteraction(draw);
            map.addInteraction(new Modify({ source: vectorSource }));
            map.addInteraction(new Snap({ source: vectorSource }));
        };

        createDrawInteraction(drawType);

        return () => {
            map.dispose();
        };
    }, [drawType]);

    // Function to handle change in draw type
    const handleDrawTypeChange = (type) => {
        setDrawType(type);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '600px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'white', padding: '5px' }}>
                <button onClick={() => handleDrawTypeChange('Point')}>Point</button>
                <button onClick={() => handleDrawTypeChange('LineString')}>Line</button>
                <button onClick={() => handleDrawTypeChange('Polygon')}>Polygon</button>
            </div>
            <div style={{ position: 'absolute', top: '50px', left: '10px', backgroundColor: 'white', padding: '5px' }}>
                {Object.entries(areas).map(([id, area]) => (
                    <div key={id}> Area {area} square meters</div>
                ))}
            </div>
        </div>
    );
};

export default MapComponent;