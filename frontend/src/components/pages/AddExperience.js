import React, { useState } from "react";
import { baseUrl } from "../../url";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddExperience() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formdata, setFormdata] = useState({
    tripName: "",
    startDateOfJourney: "",
    endDateOfJourney: "",
    nameOfHotels: "",
    placesVisited: "",
    totalCost: 0,
    experience: "",
    image: "",
    tripType: "",
    featured: false,
    shortDescription: ""
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formdata.tripName.trim()) newErrors.tripName = "Trip name is required";
    if (!formdata.startDateOfJourney) newErrors.startDateOfJourney = "Start date is required";
    if (!formdata.endDateOfJourney) newErrors.endDateOfJourney = "End date is required";
    if (formdata.startDateOfJourney && formdata.endDateOfJourney && 
        new Date(formdata.startDateOfJourney) > new Date(formdata.endDateOfJourney)) {
      newErrors.endDateOfJourney = "End date must be after start date";
    }
    if (!formdata.placesVisited.trim()) newErrors.placesVisited = "Places visited is required";
    if (!formdata.tripType) newErrors.tripType = "Trip type is required";
    if (formdata.totalCost <= 0) newErrors.totalCost = "Total cost must be greater than 0";
    if (!formdata.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
    if (!formdata.experience.trim()) newErrors.experience = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/trips`, formdata);
      navigate('/');
    } catch (error) {
      setErrors({ submit: "Failed to submit the form. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Experience</h1>
      
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tripName">
                Trip Name *
              </label>
              <input
               id="tripName"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tripName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Add your Trip Name"
                value={formdata.tripName}
                onChange={(e) => {
                  setFormdata({...formdata, tripName: e.target.value});
                  if (errors.tripName) {
                    setErrors({...errors, tripName: ""});
                  }
                }}
              />
              {errors.tripName && (
                <p className="mt-1 text-sm text-red-600">{errors.tripName}</p>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="startDateOfJourney">
                  Start Date *
                </label>
                <input
                  id="startDateOfJourney"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDateOfJourney ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formdata.startDateOfJourney}
                  onChange={(e) => {
                    setFormdata({...formdata, startDateOfJourney: e.target.value});
                    if (errors.startDateOfJourney) {
                      setErrors({...errors, startDateOfJourney: ""});
                    }
                  }}
                />
                {errors.startDateOfJourney && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDateOfJourney}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="endDateOfJourney">
                  End Date *
                </label>
                <input
                  id="endDateOfJourney"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDateOfJourney ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formdata.endDateOfJourney}
                  onChange={(e) => {
                    setFormdata({...formdata, endDateOfJourney: e.target.value});
                    if (errors.endDateOfJourney) {
                      setErrors({...errors, endDateOfJourney: ""});
                    }
                  }}
                />
                {errors.endDateOfJourney && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDateOfJourney}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nameOfHotels">
                Hotels
              </label>
              <input
                id="nameOfHotels"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your Hotel Names"
                value={formdata.nameOfHotels}
                onChange={(e) => setFormdata({...formdata, nameOfHotels: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tripType">
                Trip Type *
              </label>
              <select
                id="tripType"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tripType ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formdata.tripType}
                onChange={(e) => {
                  setFormdata({...formdata, tripType: e.target.value});
                  if (errors.tripType) {
                    setErrors({...errors, tripType: ""});
                  }
                }}
              >
                <option value="">Select Type</option>
                <option value="backpacking">Backpacking</option>
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
              </select>
              {errors.tripType && (
                <p className="mt-1 text-sm text-red-600">{errors.tripType}</p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="totalCost">
                Total Cost *
              </label>
              <input
                id="totalCost"
                type="number"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.totalCost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="99999"
                value={formdata.totalCost}
                onChange={(e) => {
                  setFormdata({...formdata, totalCost: Number(e.target.value)});
                  if (errors.totalCost) {
                    setErrors({...errors, totalCost: ""});
                  }
                }}
              />
              {errors.totalCost && (
                <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="placesVisited">  
                Places Visited *
              </label>
              <input
                id="placesVisited"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.placesVisited ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Delhi, Paris, London, etc."
                value={formdata.placesVisited}
                onChange={(e) => {
                  setFormdata({...formdata, placesVisited: e.target.value});
                  if (errors.placesVisited) {
                    setErrors({...errors, placesVisited: ""});
                  }
                }}
              />
              {errors.placesVisited && (
                <p className="mt-1 text-sm text-red-600">{errors.placesVisited}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="image">
                Image Link
              </label>
              <input
                id="image"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="http://xyz.com/image.png"
                value={formdata.image}
                onChange={(e) => setFormdata({...formdata, image: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="shortDescription"> 
                Short Description *
              </label>
              <textarea
                id="shortDescription"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="2"
                placeholder="Write a brief description"
                value={formdata.shortDescription}
                onChange={(e) => {
                  setFormdata({...formdata, shortDescription: e.target.value});
                  if (errors.shortDescription) {
                    setErrors({...errors, shortDescription: ""});
                  }
                }}
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="experience">
                Experience *
              </label>
              <textarea
                id="experience"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="5"
                placeholder="Write complete details about your experience in the trip"
                value={formdata.experience}
                onChange={(e) => {
                  setFormdata({...formdata, experience: e.target.value});
                  if (errors.experience) {
                    setErrors({...errors, experience: ""});
                  }
                }}
              />
              {errors.experience && (
                <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={submitForm}
            disabled={loading}
            className={`px-6 py-3 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Experience'}
          </button>
        </div>
      </div>
    </div>
  );
}
