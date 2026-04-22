import React, { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea, FileInput, Spinner } from 'flowbite-react';
import toast from 'react-hot-toast';
import { HiPhotograph, HiX } from 'react-icons/hi';
import API_BASE from '../utils/api';
import BOOK_CATEGORIES from '../utils/bookCategories';

const VendorUploadBook = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState([]); // { file, url }[]
  const bookCategories = BOOK_CATEGORIES;
  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[0]);

  /* ── Gallery image handling ─────────────────────────────── */
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (galleryPreviews.length + files.length > 5) {
      toast.error('Maximum 5 additional images allowed.');
      return;
    }
    const newPreviews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = ''; // reset so same file can be re-added if needed
  };

  const removeGalleryImage = (idx) => {
    setGalleryPreviews(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  /* ── Form submit ────────────────────────────────────────── */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const bookTitle     = form.bookTitle.value.trim();
    const authorName    = form.authorName.value.trim();
    const category      = form.categoryName.value;
    const price         = form.price.value;
    const costPrice     = form.costPrice.value;
    const initialStock  = parseInt(form.initialStock.value) || 0;
    const bookDescription = form.bookDescription.value.trim();
    const imageFile     = form.imageFile.files[0];
    const pdfFile       = form.pdfFile.files[0];

    if (!imageFile) {
      toast.error("Cover image is required.");
      return;
    }

    setIsUploading(true);
    try {
      /* 1 – Upload files (cover + optional gallery + optional pdf) */
      const formData = new FormData();
      formData.append('image', imageFile);
      if (pdfFile) formData.append('pdf', pdfFile);
      galleryPreviews.forEach(g => formData.append('gallery', g.file));

      const token = localStorage.getItem('bookstore-token');
      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!uploadRes.ok) { const err = await uploadRes.json(); throw new Error(err.error || "File upload failed"); }
      const uploadedUrls = await uploadRes.json();

      /* 2 – Create the book */
      const bookObj = {
        bookTitle,
        authorName,
        imageURL:     uploadedUrls.imageURL,
        galleryImages: uploadedUrls.galleryImages || [],
        category,
        price:     Number(price),
        costPrice: Number(costPrice) || 0,
        stock:     initialStock,           // set initial stock directly
        bookDescription,
        bookPDFURL: uploadedUrls.bookPDFURL || null,
      };

      const bookRes = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(bookObj),
      });
      if (!bookRes.ok) { const err = await bookRes.json(); throw new Error(err.error || "Failed to save book"); }
      const createdBook = await bookRes.json();

      toast.success("Book uploaded successfully to your store!");
      form.reset();
      setSelectedBookCategory(bookCategories[0]);
      setGalleryPreviews([]);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='px-4 my-12'>
      <h2 className='mb-2 text-3xl font-bold'>🏪 Upload a Book</h2>
      <p className="text-gray-500 mb-8 text-sm">Add a new book to your vendor store. It will be tagged to your account automatically.</p>

      <form className="flex lg:w-[1180px] flex-col flex-wrap gap-4" onSubmit={handleSubmit}>

        {/* Row 1 — Title & Author */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="bookTitle" value="Book Title *" /></div>
            <TextInput id="bookTitle" placeholder="Book Name" required type="text" name='bookTitle' className='w-full' />
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="authorName" value="Author Name *" /></div>
            <TextInput id="authorName" placeholder="Author Name" required type="text" name='authorName' className='w-full' />
          </div>
        </div>

        {/* Row 2 — Cover Image (mandatory) & Category */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="imageFile" value="Cover Image *" />
              <span className="ml-2 text-xs text-red-500 font-semibold">Required</span>
            </div>
            <FileInput id="imageFile" name='imageFile' accept="image/*" required className='w-full' />
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="inputState" value="Book Category *" /></div>
            <Select id="inputState" name="categoryName" className="w-full rounded" value={selectedBookCategory} onChange={e => setSelectedBookCategory(e.target.value)}>
              {bookCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </div>
        </div>

        {/* Row 3 — Additional Gallery Images (optional) */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Label htmlFor="galleryFile" value="Additional Images" />
            <span className="text-xs text-gray-400">(Optional · up to 5)</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Uploaded previews */}
            {galleryPreviews.map((g, idx) => (
              <div key={idx} className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0 group">
                <img src={g.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add more button */}
            {galleryPreviews.length < 5 && (
              <label className="w-20 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors flex-shrink-0">
                <HiPhotograph className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Add Photo</span>
                <input
                  type="file"
                  id="galleryFile"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">These will appear in the gallery on the book detail page.</p>
        </div>

        {/* Row 4 — Description */}
        <div>
          <div className="mb-2 block"><Label htmlFor="bookDescription" value="Book Description *" /></div>
          <Textarea id="bookDescription" placeholder="Book Description" required name='bookDescription' className='w-full' rows={4} />
        </div>

        {/* Row 5 — Selling Price & Cost Price */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="price" value="Selling Price (₹) *" /></div>
            <TextInput id="price" placeholder="10.00" required type="number" step="0.01" min="0" name='price' className='w-full' />
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="costPrice" value="Cost Price (₹) — for profit tracking" /></div>
            <TextInput id="costPrice" placeholder="0.00" type="number" step="0.01" min="0" name='costPrice' className='w-full' />
            <p className="text-xs text-gray-400 mt-1">Optional. Used for inventory valuation only.</p>
          </div>
        </div>

        {/* Row 6 — Initial Stock & PDF */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="initialStock" value="Initial Stock Quantity" /></div>
            <TextInput id="initialStock" placeholder="0" type="number" min="0" step="1" name='initialStock' className='w-full' defaultValue={0} />
            <p className="text-xs text-gray-400 mt-1">How many copies are ready to sell? Stock activity will be logged automatically.</p>
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="pdfFile" value="Upload Book PDF (Optional)" /></div>
            <FileInput id="pdfFile" name='pdfFile' accept="application/pdf" className='w-full' />
            <p className="text-xs text-gray-500 mt-1">Leave empty to skip PDF.</p>
          </div>
        </div>

        <Button type="submit" className='mt-5 bg-amber-500 hover:bg-amber-600' disabled={isUploading}>
          {isUploading ? <><Spinner size="sm" className="mr-2" /> Uploading...</> : '🏪 Upload to My Store'}
        </Button>
      </form>
    </div>
  );
};

export default VendorUploadBook;
