import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthProvider';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch cart
    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items || []);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    // Load cart initially
    useEffect(() => {
        fetchCart();
    }, [user]);

    // Add to cart
    const addToCart = async (book) => {
        if (!user) {
            alert('Please login to add items to the cart');
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookId: book._id, quantity: 1 })
            });
            
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items);
                setIsCartOpen(true); // Open drawer automatically
            } else {
                alert('Failed to add to cart');
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const updateQuantity = async (bookId, newQuantity) => {
        if (!user || newQuantity < 1) return;
        
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`http://localhost:5000/api/cart/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items);
            }
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    // Remove from cart
    const removeFromCart = async (bookId) => {
         if (!user) return;
         try {
             const token = localStorage.getItem('bookstore-token');
             const res = await fetch(`http://localhost:5000/api/cart/${bookId}`, {
                 method: 'DELETE',
                 headers: {
                     'Authorization': `Bearer ${token}`
                 }
             });
             if (res.ok) {
                 const data = await res.json();
                 setCartItems(data.items);
             }
         } catch (error) {
             console.error("Error removing from cart", error);
         }
    };

    // Total price calculator
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.book.price * item.quantity);
        }, 0);
    };

    const cartContextValue = {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartTotal
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};
