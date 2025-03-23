import React from "react";
import { useNavigate } from "react-router-dom"

export default function Card(props) {
    const navigate = useNavigate()
    const visitDetails = () => {
        navigate(`/experiencedetails/${props.id}`)
    }
    
    const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 my-4">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={props.image || defaultImage}
                    alt={props.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = defaultImage;
                        e.target.onerror = null;
                    }}
                />
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{props.title}</h2>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                    {props.tripType}
                </span>
                <p className="text-gray-600 mb-4">
                    {props.description}
                </p>
                <button 
                    onClick={visitDetails}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                >
                    More Details
                </button>
            </div>
        </div>
    );
}
