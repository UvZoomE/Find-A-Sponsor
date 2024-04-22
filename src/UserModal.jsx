import { useContext, useEffect } from "react"
import { modalContext } from "./Home"

import "./styles/UserModal.css"

import {
  ThumbDownTwoTone,
  ThumbUpTwoTone,
  PlaceTwoTone,
  CloseTwoTone,
  MessageTwoTone
} from "@mui/icons-material";
import {
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import { child, get, getDatabase, ref, update } from "firebase/database";

const UserModal = () => {
  const database = getDatabase();
    const contextValue = useContext(modalContext);
    const { modalOpen, setModalOpen, clickedUser, realtimeUser, users, currentIndex, setUsers, setCurrentLikedUser, setCongrats, setCreateAccount,
    alignment, uid, setRealtimeUser } = contextValue;

    useEffect(() => {
      // Add event listener when component mounts
      document.addEventListener("mousedown", handleClickOutside);
      // Cleanup function to remove event listener when component unmounts
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const handleClickOutside = (event) => {
      if (modalOpen && !event.target.closest('.modal-box-container')) {
        // If sign-in modal is open and the click occurred outside the modal container, close the modal
        setModalOpen(false);
      }
    };

    const handleTempDislike = async(e) => {
      e.preventDefault();
      const currentUser = users[currentIndex];
      const newUsers = users.filter(user => user.username != currentUser.username);
      setUsers(newUsers);
    }
  
    const handleTempLike = async(e) => {
      e.preventDefault();
      const currentUser = users[currentIndex];
      setCurrentLikedUser(currentUser);
      setCongrats(true);
      setCreateAccount(true);
    }

    const handleLike = async(e) => {
      e.preventDefault();
      const usersRef = ref(database);
      const currentUser = users[currentIndex];
      if (alignment == "sponsor") {
        await update(child(usersRef, "users/" + uid), {
          likedSponsors: { ...realtimeUser.likedSponsors, [currentUser.username]: true},
        });
      } else {
        await update(child(usersRef, "users/" + uid), {
          likedSponsees: { ...realtimeUser.likedSponsees, [currentUser.username]: true},
        });
      }
      const specificUser = await get(child(usersRef, "users/" + uid));
      setRealtimeUser(specificUser.val());
    }

    const handleDislike = async(e) => {
      e.preventDefault();
      const usersRef = ref(database);
      const currentUser = users[currentIndex];
      if (alignment == "sponsor") {
        await update(child(usersRef, "users/" + uid), {
          dislikedSponsors: { ...realtimeUser.dislikedSponsors, [currentUser.username]: true},
        });
      } else {
        await update(child(usersRef, "users/" + uid), {
          dislikedSponsees: { ...realtimeUser.dislikedSponsees, [currentUser.username]: true},
        });
      }
      const specificUser = await get(child(usersRef, "users/" + uid));
      setRealtimeUser(specificUser.val());
    }



    return (
        <>
        {modalOpen && clickedUser ? (
        <div className="modal-container">
          <div className="modal-box-container">
            <CloseTwoTone fontSize="large" className="modal-container-close-icon" onClick={() => setModalOpen(false)}/>
            <img src={clickedUser.photoURL}/>
            <div className="profile-information-container">
              <h3>{clickedUser.firstname} {clickedUser.lastInitial}. sober since {clickedUser.sobrietyDate}</h3>
              <h3>{clickedUser.programOfChoice}</h3>
              <h3>{clickedUser.soberDate}</h3>
              <PlaceTwoTone className="place-icon"/> <h4 className="country">{clickedUser.country}</h4>
              <hr className="horizontal-line"/>
              <article>
                <p className="bio-information">
                  {clickedUser.bio}
                </p>
              </article>
              <hr className="horizontal-line" />
              {clickedUser.username === realtimeUser?.username ?
              "" :
              <div className="swipe-icons">
                <Tooltip
                title="Hit dislike to temporarily remove this person from your swiper list"
                placement="top"
                TransitionComponent={Fade}
                >
                  <IconButton onClick={(e) => realtimeUser ? handleDislike(e) : handleTempDislike(e)}>
                    <ThumbDownTwoTone fontSize="large" color={"primary"}/>
                  </IconButton>
                </Tooltip>
                <Tooltip
                title="Hit like to potentially match with this person!"
                placement="top"
                TransitionComponent={Fade}
                >
                  <IconButton onClick={(e) => realtimeUser ? handleLike(e) : handleTempLike(e)}>
                    <ThumbUpTwoTone fontSize="large" color={"primary"}/>
                  </IconButton>
                </Tooltip>
              </div>}
            </div>
          </div>
        </div> ) : ""}
        </>
    )
}

export default UserModal;