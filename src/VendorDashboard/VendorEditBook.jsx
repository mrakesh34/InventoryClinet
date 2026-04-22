import React, { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea, FileInput, Spinner } from 'flowbite-react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiPhotograph, HiX } from 'react-icons/hi';
import API_BASE from '../utils/api';
import BOOK_CATEGORIES from '../utils/bookCategories';

const VendorEditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = useLoaderData();

  const {
    bookTitle, authorName, imageURL, category,
    bookDescription, bookPDFURL, price, costPrice,
    galleryImages: existingGallery = [],
  } = book;

  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || BOOK_CATEGORIES[0]);

  /* ── Cover image preview ────────────────────────────────── */
  const [coverPreview, setCoverPreview] = useState(null); // local blob preview

  /* ── Gallery: existing (URLs) + new (File objects) ─────── */
  const [existingGalleryUrls, setExistingGalleryUrls] = useState(existingGallery || []);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]); // { file, url }[]

  const totalGallery = existingGalleryUrls.length + newGalleryPreviews.length;

  /* ── Gallery handlers ───────────────────────────────────── */
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (totalGallery + files.length > 5) {
      toast.error('Maximum 5 additional images allowed in total.');
      return;
    }
    const newPreviews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeExistingGallery = (idx) =>
    setExistingGalleryUrls(prev => prev.filter((_, i) => i !== idx));

  const removeNewGallery = (idx) => {
    setNewGalleryPreviews(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  /* ── Form submit ────────────────────────────────────────── */
  const handleUpdate = async (event) => {
    event.preventDefault();
    const form = event.target;

    const updatedTitle  = form.bookTitle.value.trim();
    const updatedAuthor = form.authorName.value.trim();
    const updatedCat    = form.categoryName.value;
    const updatedPrice  = form.price.value;
    const updatedCost   = form.costPrice.value;
    const updatedDesc   = form.bookDescription.value.trim();
    const imageFile     = form.imageFile.files[0];
    const pdfFile       = form.pdfFile.files[0];

    setIsUploading(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      let finalImageURL  = imageURL;
      let finalPDFURL    = bookPDFURL;
      let finalGallery   = [...existingGalleryUrls]; // start from kept existing

      /* 1 – Upload new files if provided */
      if (imageFile || pdfFile || newGalleryPreviews.length > 0) {
        const formData = new FormData();
        if (imageFile) formData.append('image', imageFile);
        if (pdfFile)   formData.append('pdf', pdfFile);
        newGalleryPreviews.forEach(g => formData.append('gallery', g.file));

        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) { const err = await uploadRes.json(); throw new Error(err.error || 'File upload failed'); }
        const urls = await uploadRes.json();
        if (urls.imageURL)    finalImageURL = urls.imageURL;
        if (urls.bookPDFURL)  finalPDFURL   = urls.bookPDFURL;
        if (urls.galleryImages) finalGallery = [...finalGallery, ...urls.galleryImages];
      }

      /* 2 – Patch the book */
      const bookObj = {
        bookTitle:       updatedTitle,
        authorName:      updatedAuthor,
        imageURL:        finalImageURL,
        galleryImages:   finalGallery,
        category:        updatedCat,
        price:           Number(updatedPrice),
        costPrice:       Number(updatedCost) || 0,
        bookDescription: updatedDesc,
        bookPDFURL:      finalPDFURL || null,
      };

      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bookObj),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update book'); }

      toast.success('✅ Book updated successfully!');
      navigate('/vendor/dashboard/my-books');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='px-4 my-12'>
      <h2 className='mb-2 text-3xl font-bold'>✏️ Edit Book</h2>
      <p className="text-gray-500 mb-8 text-sm">Update your book's details. Leave file fields empty to keep the current files.</p>

      <form className="flex lg:w-[1180px] flex-col flex-wrap gap-4" onSubmit={handleUpdate}>

        {/* Row 1 — Title & Author */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="bookTitle" value="Book Title *" /></div>
            <TextInput id="bookTitle" required type="text" name='bookTitle' className='w-full' defaultValue={bookTitle} />
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="authorName" value="Author Name *" /></div>
            <TextInput id="authorName" required type="text" name='authorName' className='w-full' defaultValue={authorName} />
          </div>
        </div>

        {/* Row 2 — Cover Image & Category */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="imageFile" value="Cover Image" />
              <span className="ml-2 text-xs text-gray-400">(Optional — leave empty to keep current)</span>
            </div>
            {/* Current / preview */}
            <div className="flex items-center gap-4 mb-2">
              <img
                src={coverPreview || imageURL}
                alt="Cover"
                className="w-14 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                onError={e => { e.target.src = 'https://via.placeholder.com/56x80?text=📚'; }}
              />
              <div className="flex-1">
                <FileInput
                  id="imageFile"
                  name='imageFile'
                  accept="image/*"
                  className='w-full'
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) setCoverPreview(URL.createObjectURL(f));
                    else setCoverPreview(null);
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">Current cover shown left. Upload to replace.</p>
              </div>
            </div>
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="inputState" value="Book Category *" /></div>
            <Select id="inputState" name="categoryName" className="w-full rounded"
              value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {BOOK_CATEGORIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </div>
        </div>

        {/* Row 3 — Gallery Images */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Label value="Additional Images" />
            <span className="text-xs text-gray-400">(Optional · up to 5 total)</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">

            {/* Existing gallery (from DB) */}
            {existingGalleryUrls.map((url, idx) => (
              <div key={`existing-${idx}`} className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-blue-200 flex-shrink-0 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-blue-500/60 text-white text-[9px] text-center py-0.5 font-semibold">Saved</div>
                <button type="button" onClick={() => removeExistingGallery(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <HiX className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* New gallery previews */}
            {newGalleryPreviews.map((g, idx) => (
              <div key={`new-${idx}`} className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-amber-300 flex-shrink-0 group">
                <img src={g.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-amber-500/70 text-white text-[9px] text-center py-0.5 font-semibold">New</div>
                <button type="button" onClick={() => removeNewGallery(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <HiX className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add more */}
            {totalGallery < 5 && (
              <label className="w-20 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors flex-shrink-0">
                <HiPhotograph className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Add Photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Blue = already saved · Amber = new (will be uploaded) · {totalGallery}/5 used
          </p>
        </div>

        {/* Row 4 — Description */}
        <div>
          <div className="mb-2 block"><Label htmlFor="bookDescription" value="Book Description *" /></div>
          <Textarea id="bookDescription" required name='bookDescription' className='w-full' rows={4} defaultValue={bookDescription} />
        </div>

        {/* Row 5 — Selling Price & Cost Price */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="price" value="Selling Price (₹) *" /></div>
            <TextInput id="price" required type="number" step="0.01" min="0" name='price' className='w-full' defaultValue={price} />
          </div>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="costPrice" value="Cost Price (₹) — for profit tracking" /></div>
            <TextInput id="costPrice" type="number" step="0.01" min="0" name='costPrice' className='w-full' defaultValue={costPrice || ''} />
            <p className="text-xs text-gray-400 mt-1">Optional. Used for inventory valuation only.</p>
          </div>
        </div>

        {/* Row 6 — PDF */}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block"><Label htmlFor="pdfFile" value="Update Book PDF (Optional)" /></div>
            <FileInput id="pdfFile" name='pdfFile' accept="application/pdf" className='w-full' />
            <p className="text-xs text-gray-500 mt-1">
              {bookPDFURL
                ? <>Current PDF: <a href={bookPDFURL} target="_blank" rel="noreferrer" className="text-amber-600 underline">View PDF</a> · Upload a new one to replace it.</>
                : 'No PDF uploaded yet. Leave empty to skip.'}
            </p>
          </div>
        </div>

        <Button type="submit" className='mt-5 bg-amber-500 hover:bg-amber-600' disabled={isUploading}>
          {isUploading ? <><Spinner size="sm" className="mr-2" /> Saving changes...</> : '✏️ Update Book'}
        </Button>
      </form>
    </div>
  );
};

export default VendorEditBook;
