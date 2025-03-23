import React from "react";
import { Link } from "react-router-dom";

export default function Card({ title, description, image, id, tripType }) {
    const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link to={`/experiencedetails/${id}`}>
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={image || defaultImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = defaultImage;
                            e.target.onerror = null;
                        }}
                    />
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="mt-2 text-gray-600">{description}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                        {tripType}
                    </span>
                </div>
            </Link>
        </div>
    );
}
