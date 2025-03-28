import React, { useEffect, useState } from 'react';
import ProductCard from "../components/ProductCard";
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from "../components/LoadingSpinner"

const PeopleAlsoBought = () => {
    const [recommendation, setRecommendation] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendation = async() =>{
            try {
                const res = await axios.get("/products/recommendations")
                setRecommendation(res.data)
            } catch (error) {
                toast.error(error.res.data.message || "An error occurred while fetching recommendations");
            } finally {
                setIsLoading(false);
            }
        }
        fetchRecommendation()
    },[]);

    if(isLoading) return <LoadingSpinner />
  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>
        People also bought
      </h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
            {recommendation.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </div>
  )
}

export default PeopleAlsoBought
