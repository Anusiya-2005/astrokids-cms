"use client";
import React, { createContext, useContext, useState } from 'react';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
    const [blogs, setBlogs] = useState([]);
    return (
        <BlogContext.Provider value={{ Blogs: blogs, setBlogs }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        // Return a dummy to avoid crashes if used outside provider
        return { Blogs: [], setBlogs: () => { } };
    }
    return context;
};
