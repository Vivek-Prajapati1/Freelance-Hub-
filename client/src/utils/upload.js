import axios from "axios";

const upload = async (file) => {
    // Define cloud configuration
    const cloudConfig = {
        cloudName: 'drfd0trvw',
        uploadPreset: 'FreelanceHub'
    };

    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", cloudConfig.uploadPreset);
        formData.append("cloud_name", cloudConfig.cloudName);

        console.log("Attempting upload with configuration:", {
            cloudName: cloudConfig.cloudName,
            uploadPreset: cloudConfig.uploadPreset,
            fileType: file.type,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        });
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Cloudinary error response:", errorText);
            throw new Error(`Upload failed with status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();

        if (!data || !data.secure_url) {
            console.error("Invalid Cloudinary response:", data);
            throw new Error("Invalid response from Cloudinary");
        }

        console.log("Upload successful:", data.secure_url);
        return data.secure_url;
    } catch (err) {
        console.error("Upload error details:", err);
        
        if (err.message.includes('Failed to fetch')) {
            throw new Error("Network error - Please check your internet connection");
        }

        throw err; // Throw the original error to preserve the error message
    }
};

export default upload;
