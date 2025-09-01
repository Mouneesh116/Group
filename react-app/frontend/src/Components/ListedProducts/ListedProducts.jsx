import React from 'react';
import './ListedProducts.css';
import ProductCard from '../ProductCard/ProductCard';
import data from '../Data/Data.js';
const ListedProducts = () => {
  return (
    <div className="listed-products-container">
        {data.map((item,index)=>{
             return (
              <ProductCard
            image = {item.img}
            title = {item.title}
            star = {item.star}
            reviews = {item.reviews}
            company = {item.company}
            prevPrice = {item.prevPrice}
            newPrice = {item.newPrice}
            color = {item.color}
            />
             )
        })}
    </div>
  )
}

export default ListedProducts;
