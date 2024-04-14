import "./styles/BuildProfile.css"
import "./styles/ImageEditor.css"

import { countries } from "countries-list"
import { useContext, useRef } from "react";
import { userContext } from "./Home";
import { ArrowBackTwoTone, CloseTwoTone, Rotate90DegreesCcw } from "@mui/icons-material";
import AvatarEditor from "react-avatar-editor";

import { getDatabase, ref, update } from "firebase/database";
import { getDownloadURL, getStorage, ref as sRef } from "firebase/storage";

import { useState } from "react";
import { IconButton } from "@mui/material";
import { updateProfile } from "firebase/auth";
import { uploadString } from "firebase/storage";

const BuildProfile = () => {
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");
    const database = getDatabase();
    const contextValue = useContext(userContext)
    const { user, setUser, setSignIn, image, setImage, setAvatarEditor, avatarEditor, setMenuVisible } = contextValue;
    const [slideValue, setSlideValue] = useState(0);
    const editorRef = useRef(null);
    const [rotateValue, setRotateValue] = useState(0);
    const [imageURL, setImageURL] = useState("");
    const [loading, setLoading] = useState(false);
    const storage = getStorage();

    const handleGoBack = async(e) => {
        e.preventDefault();
        setUser("");
        setSignIn(true);
    }

    const handleImageSelection = async(e) => {
        const files = e.target.files; // FileList object

        // Check if any files were selected
        if (files.length > 0) {
            const selectedImage = files[0]; // Get the first selected file
            setImage(selectedImage);
            setAvatarEditor(true);
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        const storageRef = sRef(storage, `images/${user.displayName}`);
        await uploadString(storageRef, imageURL, 'data_url');
        const imageDownloadURL = await getDownloadURL(storageRef);
        setLoading(true);

        try {
            if (!imageURL) {
                alert("Please select an image!")
                return;
            }

            await updateProfile(user, {
                photoURL: imageDownloadURL
            })
            
            // Store user in realtime database first to check if username already exists, if it does then throw an error
            await update(ref(database, 'users/' + user.uid), { // Use ref and update from the database object
                bio,
                country,
                photoURL: imageDownloadURL,
                minimalProfileBuilt: true,
                // Add more user data as needed
            });

            setUser("");
            setMenuVisible(false);
            alert("You have successfully built your profile!")

            setLoading(false);

        } catch (err) {
            console.log(err);
        }
    }

    const handleImageSubmit = async() => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const croppedImageUrl = canvas.toDataURL();
            setImageURL(croppedImageUrl);
            setAvatarEditor(false);
        } else {
            setAvatarEditor(false);
        }
    }

    const handleChangeImage = (e) => {
        e.preventDefault();
        setRotateValue(0);
        document.getElementById('fileInput').click();
    }

    return (
        <div className="build-profile-container">
            {!loading ? 
            <div className="build-profile-box-container">
              {avatarEditor ? 
                    <div className="avatar-editor-container">
                        <div className="avatar-editor-box-container">
                            <h1>Edit your avatar!</h1>
                        </div>
                        <hr className="avatar-editor-horizontal-line"/>
                        <h4 className="recommended-image-size-text">Please use a 400px x 400px image!</h4>
                        <form className="avatar-editor-form-container" onSubmit={(e) => handleImageSubmit(e)}>
                            <AvatarEditor
                            ref={editorRef}
                            image={image}
                            width={400}
                            height={400}
                            border={1}
                            color={[255, 255, 255, 0.6]} // RGBA
                            scale={slideValue === 0 ? 1 : slideValue / 10}
                            rotate={rotateValue}
                            />
                            <IconButton onClick={() => setRotateValue(rotateValue - 90)}>
                                <Rotate90DegreesCcw/>
                            </IconButton>
                            <input type="range" min="0" max="50" defaultValue="10" onChange={(e) => setSlideValue(e.target.value)}/>
                            <div className="avatar-editor-buttons-container">
                                <button onClick={() => setAvatarEditor(false)}>Cancel</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                    : 
                        <form className="build-profile-form-container" onSubmit={(e) => handleSubmit(e)}>
                            <div className="build-profile-icons-container">
                                <ArrowBackTwoTone fontSize="large" className="build-profile-container-back-icon" onClick={(e) =>handleGoBack(e)} />
                                <CloseTwoTone fontSize="large" className="build-profile-container-close-icon" onClick={() => setUser(false)}/>
                            </div>
                            <h1>Finish your profile {user.uid.username}</h1>
                            <hr className="horizontal-line"/>
                            {imageURL ? 
                            <>
                                <img src={imageURL}/>
                                <input type="file" id="fileInput" style={{display: "none"}} onChange={(e) => handleImageSelection(e)} />
                                <div className="change-or-edit-image-container">
                                    <button id="fileUploadButton" onClick={(e) => handleChangeImage(e)}>Change image</button>
                                    <button id="editImageButton" onClick={() => setAvatarEditor(true)}>Edit image</button>
                                </div>
                            </> :
                            <div className="upload-image-container">
                                <h2>Upload an image of yourself!</h2>
                                <input type="file" id="image-field" name="image" accept="image/*" onChange={(e) => handleImageSelection(e)}/>
                            </div>}

                            <div className="build-profile-bio-container">
                                <h2>Tell us something about yourself!</h2>
                                <textarea className="bio-box" placeholder="Write a brief bio..." required onChange={(e) => setBio(e.target.value)}
                                rows={10} maxLength={500}></textarea>
                            </div>

                            <div className="build-profile-location-container">
                                <h2>Which country are you from?</h2>
                                <select id="country-list-dropdown" onChange={(e) => setCountry(e.target.value)}>
                                <option value="">Select an option</option>
                                {Object.keys(countries).map((countryCode) => {
                                    const country = countries[countryCode];
                                    return <option key={countryCode} value={country.name}>{country.name}</option>;
                                })}
                                </select>
                            </div>
                            <input type="submit" className="build-profile-button" value="Finish profile!"/>
                        </form>}
            </div> : 
            <div className="build-profile-box-container">
                <h1>Loading your profile, one second please...</h1>
            </div> }
        </div>
    )
}

export default BuildProfile;