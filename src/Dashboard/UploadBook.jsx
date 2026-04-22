import React, { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea, FileInput, Spinner } from 'flowbite-react';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';
import BOOK_CATEGORIES from '../utils/bookCategories';

const UploadBook = () => {
  const [isUploading, setIsUploading] = useState(false);
  const bookCategories = BOOK_CATEGORIES;


  const [selectedBookCategory, setSelectedBookCategory] = useState(
    bookCategories[0]
  );

  const handleChangeSelectedValue = (event) => {
    console.log(event.target.value);
    setSelectedBookCategory(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;

    const bookTitle = form.bookTitle.value;
    const authorName = form.authorName.value;
    const category = form.categoryName.value;
    const price = form.price.value;
    const bookDescription = form.bookDescription.value;
    
    const imageFile = form.imageFile.files[0];
    const pdfFile = form.pdfFile.files[0];

    if (!imageFile) {
        toast.error("Please select a cover image.");
        return;
    }

    setIsUploading(true);

    try {
        // 1. Upload files to Cloudinary
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('pdf', pdfFile);

        const token = localStorage.getItem('bookstore-token');
        
        const uploadRes = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err.error || "File upload failed");
        }

        const uploadedUrls = await uploadRes.json();

        // 2. Save book to DB
        const bookObj = {
            bookTitle,
            authorName,
            imageURL: uploadedUrls.imageURL,
            category,
            price: Number(price),
            costPrice: Number(form.costPrice.value) || 0,
            bookDescription,
            bookPDFURL: uploadedUrls.bookPDFURL,
        };

        const bookRes = await fetch(`${API_BASE}/books`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bookObj),
        });

        if (!bookRes.ok) {
            const err = await bookRes.json();
            throw new Error(err.error || "Failed to save book");
        }

        toast.success("Book uploaded successfully!");
        form.reset();
        setSelectedBookCategory(bookCategories[0]);
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
      <form className="flex lg:w-[1180px] flex-col flex-wrap gap-4" onSubmit={handleSubmit}>

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
            />
          </div>

        </div>

        <div className='flex gap-8'>
          {/* book image upload */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label
                htmlFor="imageFile"
                value="Upload Book Cover Image"
              />
            </div>
            <FileInput
              id="imageFile"
              name='imageFile'
              accept="image/*"
              required
              className='w-full'
            />
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
          />
        </div>


        <div className='flex gap-8'>
          {/* book selling price */}
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
            />
            <p className="text-xs text-gray-400 mt-1">Optional. Used for inventory valuation only.</p>
          </div>
        </div>

        <div className='flex gap-8'>
          {/* book pdf upload */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label
                htmlFor="pdfFile"
                value="Upload Book PDF (Optional)"
              />
            </div>
            <FileInput
              id="pdfFile"
              name='pdfFile'
              accept="application/pdf"
              className='w-full'
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to skip PDF.</p>
          </div>
        </div>


        {/* Submit btn */}
        <Button type="submit" className='mt-5' disabled={isUploading}>
          {isUploading ? (
            <><Spinner size="sm" className="mr-2" /> Uploading...</>
          ) : (
            'Upload book'
          )}
        </Button>

      </form>
    </div>
  )
}

export default UploadBook