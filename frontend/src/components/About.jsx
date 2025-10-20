import React, { useState, useEffect } from 'react';
import Head from './ui/Head'

export default function Catalog() {
    return (

        <div className='bg-white min-h-screen'>
            <Head />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                <div
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center text-center cursor-pointer transform transition duration-200 hover:scale-105"
                >
                    
                </div>
            </div>
        </div>
    );
}

