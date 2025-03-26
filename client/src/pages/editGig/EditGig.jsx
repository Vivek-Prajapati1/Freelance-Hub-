import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import './EditGig.scss';

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (formData) => {
      return newRequest.put(`/gigs/${id}`, formData);
    },
    onSuccess: () => {
      navigate('/mygigs');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Something went wrong!');
    },
  });

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleGalleryImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newGalleryImages = [...galleryImages];
      newGalleryImages[index] = file;
      setGalleryImages(newGalleryImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    
    // Add non-file fields
    formData.append('title', e.target.title.value);
    formData.append('desc', e.target.desc.value);
    formData.append('cat', e.target.category.value);
    formData.append('price', e.target.price.value);
    formData.append('sortTitle', e.target.shortTitle.value);
    formData.append('sortDesc', e.target.shortDesc.value);
    formData.append('deliveryTime', e.target.deliveryTime.value);
    formData.append('rivisonNumber', e.target.revisionNumber.value);
    formData.append('totalStars', gig.totalStars);
    formData.append('starNumber', gig.starNumber);
    formData.append('sales', gig.sales);

    // Handle features array
    const features = Array.from(e.target.querySelectorAll('input[name="features"]')).map(input => input.value);
    features.forEach((feature, index) => {
      formData.append(`features[${index}]`, feature);
    });

    // Handle file uploads
    if (coverImage) {
      formData.append('cover', coverImage);
    }

    galleryImages.forEach((image, index) => {
      if (image) {
        formData.append('images', image);
      }
    });

    try {
      await mutation.mutateAsync(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  if (!gig) return <div className="error">Gig not found</div>;

  return (
    <div className="editGig">
      <div className="container">
        <h1>Edit Gig</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="sections">
            <div className="info">
              <label htmlFor="">Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. I will do something I'm really good at"
                defaultValue={gig.title}
                required
              />
              <label htmlFor="">Category</label>
              <select name="category" id="category" defaultValue={gig.cat} required>
                <option value="">Select a category</option>
                <option value="design">Design</option>
                <option value="web">Web Development</option>
                <option value="animation">Animation</option>
                <option value="music">Music</option>
                <option value="game">Game Development</option>
                <option value="photography">Photography</option>
                <option value="ai">AI Services</option>
                <option value="seo">App Development</option>
                <option value="video">Video & Motion</option>
                <option value="data">Data & Analytics</option>
                <option value="writing">Writing & Translation</option>
                <option value="business">Business</option>
                <option value="digital">Digital Marketing</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
              <label htmlFor="">Price</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 100"
                defaultValue={gig.price}
                required
              />
              <div className="images">
                <div className="imagesInputs">
                  <label htmlFor="">Cover Image</label>
                  <input 
                    type="file" 
                    name="cover" 
                    accept="image/*" 
                    onChange={handleCoverImageChange}
                  />
                  <label htmlFor="">Images</label>
                  {gig.images.map((image, index) => (
                    <input 
                      key={index} 
                      type="file" 
                      name="images" 
                      accept="image/*"
                      onChange={(e) => handleGalleryImageChange(e, index)}
                    />
                  ))}
                </div>
              </div>
              <label htmlFor="">Description</label>
              <textarea
                name="desc"
                id=""
                placeholder="Brief descriptions to introduce your service to customers"
                cols="0"
                rows="16"
                defaultValue={gig.desc}
                required
              ></textarea>
              <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Gig'}
              </button>
            </div>
            <div className="details">
              <label htmlFor="">Service Title</label>
              <input
                type="text"
                name="shortTitle"
                placeholder="e.g. One-page web design"
                defaultValue={gig.sortTitle}
                required
              />
              <label htmlFor="">Short Description</label>
              <textarea
                name="shortDesc"
                id=""
                placeholder="Short description of your service"
                cols="30"
                rows="10"
                defaultValue={gig.sortDesc}
                required
              ></textarea>
              <label htmlFor="">Delivery Time (e.g. 3 days)</label>
              <input
                type="number"
                name="deliveryTime"
                defaultValue={gig.deliveryTime}
                required
              />
              <label htmlFor="">Revision Number</label>
              <input
                type="number"
                name="revisionNumber"
                defaultValue={gig.rivisonNumber}
                required
              />
              <label htmlFor="">Add Features</label>
              {gig.features.map((feature, index) => (
                <input
                  key={index}
                  type="text"
                  name="features"
                  placeholder="e.g. page design"
                  defaultValue={feature}
                />
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGig; 