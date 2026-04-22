import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthProvider';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';

export const CartContext = createContext();

const MAX_QTY = 5; // max copies of one book a user can order

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
            const res = await fetch(`${API_BASE}/cart`, {
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
            toast.error('Please login to add items to the cart');
            return;
        }

        // Preemptive checks before API call
        if (book.stock !== undefined) {
            const existingItem = cartItems.find(item => item.book && item.book._id === book._id);
            const currentQty = existingItem ? existingItem.quantity : 0;
            const allowedMax = Math.min(MAX_QTY, book.stock);

            if (currentQty >= allowedMax) {
                if (book.stock < MAX_QTY) {
                    toast.error(`Only ${book.stock} in stock — can't add more.`);
                } else {
                    toast.error(`Maximum ${MAX_QTY} copies per book allowed.`);
                }
                return;
            }
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/cart`, {
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
                toast.success('Added to cart!');
            } else {
                const errData = await res.json();
                toast.error(errData.error || 'Failed to add to cart');
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Network error adding to cart");
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const updateQuantity = async (bookId, newQuantity, stock = Infinity) => {
        if (!user || newQuantity < 1) return;

        const allowedMax = Math.min(MAX_QTY, stock);

        if (newQuantity > allowedMax) {
            if (stock < MAX_QTY) {
                toast.error(`Only ${stock} in stock.`);
            } else {
                toast.error(`Maximum ${MAX_QTY} copies per book allowed.`);
            }
            return;
        }
        
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/cart/${bookId}`, {
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
            } else {
                 const errData = await res.json();
                 toast.error(errData.error || 'Failed to update quantity');
            }
        } catch (error) {
            console.error("Error updating cart:", error);
            toast.error("Network error updating cart");
        }
    };

    // Remove from cart
    const removeFromCart = async (bookId) => {
         if (!user) return;
         try {
             const token = localStorage.getItem('bookstore-token');
             const res = await fetch(`${API_BASE}/cart/${bookId}`, {
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
            if (!item.book) return total;
            const price = item.book.price || 10; // Fallback to 10 if price is undefined
            return total + (price * item.quantity);
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
