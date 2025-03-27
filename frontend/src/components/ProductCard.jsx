import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import {useUserStore} from "../stores/useUserStore";

const ProductCard = ({ product }) => {

    const {user} = useUserStore();


    const handleAddToCart = (e) => {
      if(!user){
        toast.error("please login to add to cart",{id:"login"});
        return;
      }
      toast.success("Added to cart");
    };
  
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
        <div className="flex h-64 overflow-hidden rounded-xl">
          {/* Adjusted height and added 'object-center' to ensure it stays centered */}
          <img
            className="object-cover w-full h-full object-center"  
            src={product.image}
            alt="product image"
          />
        </div>
  
        <div className="mt-4 px-5 pb-5">
          <h5 className="text-xl font-semibold tracking-tight text-white">{product.name}</h5>
          <div className="mt-2 mb-5 flex items-center justify-between">
            <p>
              <span className="text-3xl font-bold text-emerald-400">${product.price}</span>
            </p>
          </div>
          <button
            className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={22} className="mr-2" />
            Add to cart
          </button>
        </div>
      </div>
    );
  };
  
  export default ProductCard;