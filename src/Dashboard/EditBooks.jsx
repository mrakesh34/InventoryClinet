import React, { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea, FileInput, Spinner } from 'flowbite-react';
import { useLoaderData, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';
import BOOK_CATEGORIES from '../utils/bookCategories';

const EditBooks = () => {
  const { id } = useParams();
  const { bookTitle, authorName, imageURL, category, bookDescription, bookPDFURL, price, costPrice } = useLoaderData();
  const [isUploading, setIsUploading] = useState(false);

  const bookCategories = BOOK_CATEGORIES;

  const [selectedBookCategory, setSelectedBookCategory] = useState(
    bookCategories[0]
  );

  const handleChangeSelectedValue = (event) => {
    console.log(event.target.value);
    setSelectedBookCategory(event.target.value);
  };


  const handleUpdate = async (event) => {
    event.preventDefault();
    const form = event.target;

    const updatedTitle = form.bookTitle.value;
    const updatedAuthor = form.authorName.value;
    const updatedCategory = form.categoryName.value;
    const updatedPrice = form.price.value;
    const updatedDesc = form.bookDescription.value;
    
    // Fallbacks if user didn't select new files
    let finalImageURL = imageURL;
    let finalPDFURL = bookPDFURL;

    const imageFile = form.imageFile.files[0];
    const pdfFile = form.pdfFile.files[0];

    setIsUploading(true);

    try {
        // 1. Upload new files if they exist
        if (imageFile || pdfFile) {
            const formData = new FormData();
            if (imageFile) formData.append('image', imageFile);
            if (pdfFile) formData.append('pdf', pdfFile);

            const token = localStorage.getItem('bookstore-token');
            const uploadRes = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || "File upload failed");
            }

            const uploadedUrls = await uploadRes.json();
            if (uploadedUrls.imageURL) finalImageURL = uploadedUrls.imageURL;
            if (uploadedUrls.bookPDFURL) finalPDFURL = uploadedUrls.bookPDFURL;
        }

        // 2. Update book in DB
        const bookObj = {
            bookTitle: updatedTitle,
            authorName: updatedAuthor,
            imageURL: finalImageURL,
            category: updatedCategory,
            price: Number(updatedPrice),
            costPrice: Number(form.costPrice.value) || 0,
            bookDescription: updatedDesc,
            bookPDFURL: finalPDFURL,
        };

        const res = await fetch(`${API_BASE}/books/${id}`, {
            method: "PATCH",
            headers: { 
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bookObj),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update book");
        }

        toast.success("Book updated successfully!");
    } catch (error) {
        console.error(error);
        toast.error(error.message || "An error occurred");
    } finally {
        setIsUploading(false);
    }
  };
  
    return (
      <div className='px-4 my-12'>
        <h2 className='mb-8 text-3xl font-bold'>Upload A Book!</h2>
        <form className="flex lg:w-[1180px] flex-col flex-wrap gap-4" onSubmit={handleUpdate}>

          {/* first row */}
          <div className='flex gap-8'>

            {/* book name */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label
                  htmlFor="bookTitle"
                  value="Book Title"
                />
              </div>
              <TextInput
                id="bookTitle"
                placeholder="Book Name"
                required
                type="text"
                name='bookTitle'
                className='w-full'
                defaultValue={bookTitle}
              />
            </div>

            {/* author name */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label
                  htmlFor="authorName"
                  value="Author Name"
                />
              </div>
              <TextInput
                id="authorName"
                placeholder="Author Name"
                required
                type="text"
                name='authorName'
                className='w-full'
                defaultValue={authorName}
              />
            </div>

          </div>

          {/* 2nd Row */}
          <div className='flex gap-8'>
            {/* book image upload (optional) */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label
                  htmlFor="imageFile"
                  value="Update Book Cover (Optional)"
                />
              </div>
              <FileInput
                id="imageFile"
                name='imageFile'
                accept="image/*"
                className='w-full'
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>
            </div>

            {/* book category */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label
                  htmlFor="inputState"
                  value="Book Category"
                />
              </div>
              <Select
                id="inputState"
                name="categoryName"
                className="w-full rounded"
                value={selectedBookCategory}
                onChange={handleChangeSelectedValue}
              >
                {bookCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

          </div>

          {/* full width div for book description */}
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="bookDescription"
                value="Book Description"
              />
            </div>
            <Textarea
              id="bookDescription"
              placeholder="Book Description"
              required
              type="text"
              name='bookDescription'
              className='w-full'
              rows={4}
              defaultValue={bookDescription}
            />
          </div>


          <div className='flex gap-8'>
            {/* selling price */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label htmlFor="price" value="Selling Price (₹)" />
              </div>
              <TextInput
                id="price"
                placeholder="10.00"
                required
                type="number"
                step="0.01"
                min="0"
                name='price'
                className='w-full'
                defaultValue={price}
              />
            </div>

            {/* cost price */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label htmlFor="costPrice" value="Cost Price (₹) — for profit tracking" />
              </div>
              <TextInput
                id="costPrice"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                name='costPrice'
                className='w-full'
                defaultValue={costPrice || 0}
              />
              <p className="text-xs text-gray-400 mt-1">Optional. Used for inventory valuation only.</p>
            </div>
          </div>

            {/* book pdf url (optional upload) */}
            <div className='lg:w-1/2'>
              <div className="mb-2 block">
                <Label
                  htmlFor="pdfFile"
                  value="Update Book PDF (Optional)"
                />
              </div>
              <FileInput
                  id="pdfFile"
                  name="pdfFile"
                  accept="application/pdf"
                  className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current PDF.</p>
            </div>
          </div>


          {/* Submit btn */}
          <Button type="submit" className='mt-5' disabled={isUploading}>
            {isUploading ? (
              <><Spinner size="sm" className="mr-2" /> Updating...</>
            ) : (
              'Update book'
            )}
          </Button>

        </form>
      </div>
    )
  }

export default EditBooks