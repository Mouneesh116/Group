import React from "react";
import { createContext, useState } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({children}) => {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);

    const addOrder = (order)=>{
        setOrders((prevOrders)=>{
            const newOrders = Array.isArray(order) ? order : [order];
            return [...prevOrders,...newOrders];
        });
        setAllOrders((prevAllOrders)=>{
            const newOrders = Array.isArray(order) ? order : [order];
            return [...prevAllOrders,...newOrders];
        })
    };
    const getUserOrders = (userId)=>{
        return orders.filter((order)=>{
            return order.userId === userId;
        })
    };
    const getAllUserOrders = ()=>{
        return allOrders;
    }
    return (
        <OrderContext.Provider value={{orders, setOrders, addOrder, getUserOrders, allOrders, setAllOrders, getAllUserOrders}}>
            {children}
        </OrderContext.Provider>
    )

}