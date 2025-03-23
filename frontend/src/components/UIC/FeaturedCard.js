import React from "react";
import { useNavigate } from "react-router-dom"

export default function FeaturedCard({ title, description, image, id, tripType }) {
    const navigate = useNavigate()
    const visitDetails = () => {
        navigate(`/experiencedetails/${id}`)
    }
    
    const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";
    
    return (
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl overflow-hidden my-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-full">
                <img
                    src={image || defaultImage}
                    alt={title}
                    className="w-full h-full object-cover mix-blend-overlay opacity-30"
                    onError={(e) => {
                        e.target.src = defaultImage;
                        e.target.onerror = null;
                    }}
                />
            </div>
            <div className="absolute top-4 left-4">
                <span className="bg-yellow-400 text-gray-900 text-sm font-semibold px-3 py-1 rounded-full">
                    Featured
                </span>
            </div>
            <div className="relative p-8 text-white">
                <h2 className="text-3xl font-bold mb-3">{title}</h2>
                <span className="inline-block bg-white/20 text-white text-sm px-4 py-1 rounded-full mb-4">
                    {tripType}
                </span>
                <p className="text-white/90 mb-6 text-lg">
                    {description}
                </p>
                <button 
                    onClick={visitDetails}
                    className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-md hover:bg-blue-50 transition-colors duration-300"
                >
                    More Details
                </button>
            </div>
        </div>
    );
}
