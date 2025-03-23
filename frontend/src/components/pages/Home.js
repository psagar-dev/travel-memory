import React, { useEffect, useState } from "react";
import Card from "../UIC/Card";
import FeaturedCard from "../UIC/FeaturedCard";
import axios from "axios";
import { baseUrl } from "../../url";

export default function Home() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${baseUrl}/api/trips/`)
      .then((res) => {
        setData(res.data.data); // Access the data property from the response
        setLoading(false);
      })
      .catch(err => {
        setData([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No trips found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {data.map((e) => {
          if (e.featured) {
            return (
              <FeaturedCard
                key={e._id}
                title={e.tripName}
                tripType={e.tripType}
                description={e.shortDescription}
                image={e.image}
                id={e._id}
              />
            );
          }
          return null;
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {data.map((e) => {
          if (!e.featured) {
            return (
              <Card
                key={e._id}
                title={e.tripName}
                tripType={e.tripType}
                description={e.shortDescription}
                image={e.image}
                id={e._id}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
