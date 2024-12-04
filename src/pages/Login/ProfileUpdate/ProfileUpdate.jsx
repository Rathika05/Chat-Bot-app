import React, { useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileUpdate = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [uid, setUid] = useState("");
    const [prevImage, setPrevImage] = useState("");

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        console.log("Profile update clicked");

        try {
            // Check if name and bio fields are filled out
            if (!name || !bio) {
                toast.error("Please fill in all fields!");
                return;
            }

            const docRef = doc(db, "users", uid);

            // Update profile without changing the avatar image
            await updateDoc(docRef, {
                bio,
                name,
            });

            toast.success("Profile updated successfully!");
            navigate("/chat");
        } catch (error) {
            console.error(error);
            toast.error("Error updating profile");
        }
    };

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || "");
                    setBio(data.bio || "");
                    setPrevImage(data.avatar || ""); // Keep existing image
                }
            } else {
                navigate("/");
            }
        });
    }, [navigate]);

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={handleProfileUpdate}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <img
                            src={prevImage ? prevImage : assets.avatar_icon}
                            alt="Profile"
                            className="profile-image"
                        />
                        {/* No input for image upload */}
                    </label>

                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        placeholder="Your name"
                        required
                    />
                    <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        placeholder="Write profile bio"
                        required
                    ></textarea>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileUpdate;
