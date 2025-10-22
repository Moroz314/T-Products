import React, { useState, useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom'; // <-- ADD THIS
import { IoMdArrowRoundBack, IoMdSearch, IoMdSave } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const API_KEY = 'b3efe3fd-9199-423b-9203-d3b1a3c73abb';
const MAP_LOCATION = { center: [30.2, 60], zoom: 10 };

function useYmapsLoader() {
    const [ymaps, setYmaps] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadYmaps = async () => {
            try {
                await new Promise((resolve) => {
                    if (typeof window.ymaps3 !== 'undefined') {
                        resolve();
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=ru_RU`;
                    script.async = true;
                    script.onload = resolve;

                    if (!document.querySelector(`script[src*="${API_KEY}"]`)) {
                        document.head.appendChild(script);
                    }
                });
                await window.ymaps3.ready;
                const ymaps3React = await window.ymaps3.import('@yandex/ymaps3-reactify');
                const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);
                const {
                    YMap, YMapDefaultSchemeLayer,
                    YMapDefaultFeaturesLayer, YMapMarker
                } = reactify.module(window.ymaps3);

                setYmaps({
                    YMap, YMapDefaultSchemeLayer,
                    YMapDefaultFeaturesLayer, YMapMarker,
                    reactify, ymaps3: window.ymaps3,
                    LOCATION: MAP_LOCATION
                });
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }

            
        };
        loadYmaps();
    }, []);

    return { ymaps, isLoading };
}

const PinIcon = () => (
    <div style={{ transform: 'translate(-50%, -100%)' }}>
        <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c01d1d"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5))' }}
        >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="#c01d1d" stroke="white" strokeWidth="2" />
        </svg>
    </div>
);

export default function Map() {
    const { ymaps, isLoading } = useYmapsLoader();
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(MAP_LOCATION.center);
    const [location, setLocation] = useState(MAP_LOCATION);
    const navigate = useNavigate();

    const searchAddress = (addr) => {
        if (ymaps && addr) {
            ymaps.ymaps3.search({ text: addr })
                .then(res => {
                    if (res.length) {
                        const newCoordinates = res[0].geometry.coordinates;
                        setCoordinates(newCoordinates);
                        setLocation({ center: newCoordinates, zoom: 15 });
                    }
                })
                .catch(error => console.error("Forward Geocoding Error:", error));
        }
    };

    useEffect(() => {
        if (ymaps && !isLoading && coordinates) {
            ymaps.ymaps3.search({ text: coordinates.join(",") })
                .then(res => {
                    if (res.length) {
                        setAddress(res[0].properties.name);
                    } else {
                        setAddress('Address not found');
                    }
                })
                .catch(error => console.error("Reverse Geocoding Error:", error));
        }
    }, [ymaps, isLoading, coordinates]);

    if (isLoading || !ymaps) {
        return <div style={{ width: '600px', height: '400px' }}>Loading...</div>;
    }

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, reactify } = ymaps;


    const handleSubmit = () => {
        localStorage.setItem('location_order', address);
        // TODO: Update the location to the server
        navigate("/");
    };

    return (
        <Suspense fallback={<div />}>

            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <YMap location={reactify.useDefault(location)}>
                    <YMapDefaultSchemeLayer />
                    <YMapDefaultFeaturesLayer />
                    <YMapMarker coordinates={coordinates} draggable={true} onDragEnd={setCoordinates}>
                        <PinIcon />
                    </YMapMarker>
                </YMap>


                <div className="absolute top-4 left-4 text-white p-2 z-100 bg-white rounded-full cursor-pointer hover:bg-amber-50 transition-colors flex justify-center items-center shadow-md">
                    <IoMdArrowRoundBack className='text-[#ebcf31] w-6 h-6' onClick={() => navigate("/")} />
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white p-2.5 rounded-md shadow-lg z-[1000] flex gap-2.5 items-center max-w-[90vw]">

                    <input
                        type="text"
                        value={address}
                        placeholder='Введите адрес'
                        onChange={(e) => setAddress(e.target.value)}
                        className="p-1.5 border border-gray-300 rounded-md text-black flex-1 min-w-0 max-w-100"
                    />
                    <button onClick={() => searchAddress(address)} className="px-2.5 py-1.5 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 flex items-center justify-center">
                        <IoMdSearch className='w-6 h-6' />
                    </button>

                    <button onClick={handleSubmit} className="px-2.5 py-1.5 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 flex items-center justify-center">
                        <IoMdSave className='w-6 h-6' />
                    </button>
                    {/* <button onClick={() => { navigate("/") }} className="px-2.5 py-1.5 bg-yellow-400 text-black rounded-md hover:bg-yellow-500">Выйти</button> */}
                    {/* <button onClick={handleSubmit} className="px-2.5 py-1.5 bg-yellow-400 text-black rounded-md hover:bg-yellow-500">Подтвердить</button> */}
                </div>
            </div>
        </Suspense>
    );
}
