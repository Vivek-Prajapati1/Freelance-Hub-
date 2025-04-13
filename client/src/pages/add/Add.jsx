import React, { useReducer, useState } from "react";
import './add.scss';
import { INITIAL_STATE, gigReducer } from "../../reducers/gigReducers";
import upload from '../../utils/upload.js';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const Add = () => {
    const [singleFile, setSingleFile] = useState(undefined);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleChange = (e) => {
        dispatch({
            type: "CHANGE_INPUT",
            payload: { name: e.target.name, value: e.target.value }
        });
    };

    const handleFeature = (e) => {
        e.preventDefault();
        dispatch({
            type: "ADD_FEATURE",
            payload: e.target[0].value,
        });
        e.target[0].value = '';
    };

    const handleUpload = async () => {
        if (!singleFile) {
            setUploadError("Please select a cover image");
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            // Validate file type
            if (!singleFile.type.startsWith('image/')) {
                throw new Error("Please select a valid image file");
            }

            // Validate file size (max 10MB)
            if (singleFile.size > 10 * 1024 * 1024) {
                throw new Error("Image size should be less than 10MB");
            }

            console.log("Starting cover image upload...");
            // Upload cover image
            const cover = await upload(singleFile);
            console.log("Cover image uploaded successfully:", cover);
            
            // Upload additional images
            const images = [];
            if (files.length > 0) {
                console.log(`Starting upload of ${files.length} additional images...`);
                for (const file of files) {
                    if (!file.type.startsWith('image/')) {
                        throw new Error("Please select valid image files for the gallery");
                    }
                    if (file.size > 10 * 1024 * 1024) {
                        throw new Error("Each gallery image should be less than 10MB");
                    }
                    const url = await upload(file);
                    console.log("Gallery image uploaded successfully:", url);
                    images.push(url);
                }
            }

            dispatch({
                type: "ADD_IMAGES",
                payload: { cover, images }
            });

            setUploadError(null);
            
            // Show success message
            console.log("All images uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError(error.message || "Failed to upload images. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const mutation = useMutation({
        mutationFn: (gig) => {
            return newRequest.post("/gigs", gig);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["myGigs"]);
            navigate('/mygigs');
        },
        onError: (error) => {
            console.error("Error creating gig:", error);
            // Handle error appropriately
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!state.cover) {
            setUploadError("Please upload a cover image first");
            return;
        }

        mutation.mutate(state);
    };

    return (
        <div className="add">
            <div className="container">
                <h1>Add New Gig</h1>
                <div className="sections">
                    <div className="left">
                        <label htmlFor="">Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. I will do something I'm really good at"
                            onChange={handleChange}
                        />
                        <select name="cat" id="cat" onChange={handleChange}>
                            <option value="Design">Design</option>
                            <option value="Web developer">Web Developer</option>
                            <option value="Web developer">Web Design</option>
                            <option value="Animation">Animation</option>
                            <option value="WordPress">WordPress</option>
                            <option value="Logo Design">Logo Design</option>
                            <option value="AI Services">AI Services</option>
                            <option value="App Developer">App Developer</option>
                            <option value="Software Developer">Software Developer</option>
                            <option value="Video Editor">Video Editor</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Music">Music</option>
                        </select>
                        <div className="images">
                            <div className="imagesInputs">
                                <label htmlFor="cover">Cover Image</label>
                                <input
                                    type="file"
                                    id="cover"
                                    accept="image/*"
                                    onChange={(e) => setSingleFile(e.target.files[0])}
                                />
                                <label htmlFor="gallery">Upload Images</label>
                                <input
                                    type="file"
                                    id="gallery"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                            </div>
                            {uploadError && <div className="error">{uploadError}</div>}
                            {state.cover && (
                                <div className="preview">
                                    <img src={state.cover} alt="Cover preview" />
                                </div>
                            )}
                        </div>
                        <button onClick={handleUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                        <label htmlFor="desc">Description</label>
                        <textarea
                            name="desc"
                            id="desc"
                            cols="30"
                            rows="16"
                            placeholder="A brief description to introduce your service to customers"
                            onChange={handleChange}
                        ></textarea>
                        <button onClick={handleSubmit} disabled={uploading || mutation.isLoading}>
                            {mutation.isLoading ? "Creating..." : "Create"}
                        </button>
                    </div>
                    <div className="right">
                        <label htmlFor="serviceTitle">Service Title</label>
                        <input
                            type="text"
                            id="serviceTitle"
                            name="shortTitle"
                            placeholder="e.g. One-page web design"
                            onChange={handleChange}
                        />
                        <label htmlFor="shortDesc">Short Description</label>
                        <textarea
                            name="shortDesc"
                            id="shortDesc"
                            placeholder="Short description of your service"
                            cols="30"
                            rows="10"
                            onChange={handleChange}
                        ></textarea>
                        <label htmlFor="deliveryTime">Delivery Time (e.g. 3 days)</label>
                        <input
                            type="number"
                            id="deliveryTime"
                            name="deliveryTime"
                            min={1}
                            onChange={handleChange}
                        />
                        <label htmlFor="revisionNumber">Revision Number</label>
                        <input
                            type="number"
                            id="revisionNumber"
                            name="revisionNumber"
                            min={1}
                            onChange={handleChange}
                        />
                        <label htmlFor="">Add Features</label>
                        <form className="add" onSubmit={handleFeature}>
                            <input type="text" placeholder="e.g. page design" />
                            <button type="submit">Add</button>
                        </form>
                        <div className="addedFeatures">
                            {state?.features?.map(f => (
                                <div className="item" key={f}>
                                    <button
                                        onClick={() => dispatch({
                                            type: "REMOVE_FEATURE",
                                            payload: f
                                        })}
                                    >
                                        {f}
                                        <span>X</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            min={1}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Add;