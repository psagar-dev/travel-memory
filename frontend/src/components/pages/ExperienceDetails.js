import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../../url";

export default function ExperienceDetails() {
  const { id } = useParams();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  
  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";

  useEffect(() => {
    axios.get(`${baseUrl}/api/trips/${id}`)
      .then((res) => {
        setData(res.data.data); // Access the data property from the response
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">{data.tripName}</h1>

      <div className="relative rounded-lg overflow-hidden mb-8 aspect-video">
        <img
          src={data.image || defaultImage}
          alt={data.tripName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = defaultImage;
            e.target.onerror = null;
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hotels</h3>
              <p className="text-lg text-gray-900">{data.nameOfHotels}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Trip Type</h3>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {data.tripType}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
              <p className="text-lg text-gray-900">₹{data.totalCost.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="text-lg text-gray-900">
                {data.startDateOfJourney} - {data.endDateOfJourney}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Places Visited</h3>
              <p className="text-lg text-gray-900">{data.placesVisited}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Experience</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {data.experience}
        </p>
      </div>
    </div>
  );
}
