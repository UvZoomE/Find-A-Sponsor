import "./styles/Home.css";
import SignIn from "./SignIn";
import CreateAccount from "./CreateAccount";
import UserModal from "./UserModal";
import BuildProfile from "./BuildProfile";
import ViewSettingsPage from "./ViewSettingsPage";

import {
  StyleTwoTone,
  ThumbDownTwoTone,
  ThumbUpTwoTone,
  CancelTwoTone,
  PersonTwoTone,
} from "@mui/icons-material";

import {
  IconButton,
  Tooltip,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import {createContext, useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCards, Navigation, Pagination, Scrollbar } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-cards"
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import { getAuth, signOut } from "firebase/auth";
import { child, get, getDatabase, ref, remove, update } from "firebase/database";
import WhatsAppButton from "./SmallButton.png"
import ViewSponsees from "./ViewSponsees";
import CongratsModal from "./CongratsModal";
import MessageModal from "./MessageModal";

const signInContext = createContext();
export {signInContext};

const createAccountContext = createContext();
export {createAccountContext};

const modalContext = createContext();
export {modalContext};

const userContext = createContext();
export {userContext};

const avatarEditorContext = createContext();
export {avatarEditorContext};

const viewSponseesContext = createContext();
export{viewSponseesContext};

const viewSettingsPageContext = createContext();
export{viewSettingsPageContext};

const congratsModalContext = createContext();
export{congratsModalContext};

const messageModalContext = createContext();
export{messageModalContext};

const Home = () => {
  const [alignment, setAlignment] = useState("sponsor");
  const [signIn, setSignIn] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [ modalOpen, setModalOpen ] = useState(false);
  const [user, setUser] = useState("");
  const [realtimeUser, setRealtimeUser] = useState(null);
  const [avatarEditor, setAvatarEditor] = useState(false);
  const [image, setImage] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const auth = getAuth();
  const database = getDatabase();
  const [users, setUsers] = useState([]);
  const [clickedUser, setClickedUser] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uid, setUid] = useState("");
  const [viewSponsees, setViewSponsees] = useState(false);
  const [viewSettingsPage, setViewSettingsPage] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [congrats, setCongrats] = useState(false);
  const [currentLikedUser, setCurrentLikedUser] = useState(null);
  const [messageModal, setMessageModal] = useState(false);
  const [userToMessage, setUserToMessage] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs only once after initial render
  
  useEffect(() => {
    const fetchCurrentUsers = async () => {
      const usersRef = ref(database);
      const usersList = [];
  
      try {
        const snapshot = await get(child(usersRef, "users/"));
        const uids = Object.keys(snapshot.val());
  
        for (const userUID of uids) {
          const snapshot = await get(child(usersRef, "users/" + userUID));
          const user = snapshot.val();
  
          if (realtimeUser.username !== user.username) {
            let excludeUser = false;
  
            // Check if the user has disliked this sponsor or sponsee
            if (
              realtimeUser.dislikedSponsees &&
              Object.keys(realtimeUser.dislikedSponsees).includes(user.username) ||
              realtimeUser.dislikedSponsors &&
              Object.keys(realtimeUser.dislikedSponsors).includes(user.username)
            ) {
              excludeUser = true;
            }
  
            // Check if there's a mutual like between the user and the sponsor
            if (
              realtimeUser.likedSponsees &&
              Object.keys(realtimeUser.likedSponsees).includes(user.username)
            ) {
              excludeUser = true;
              if (
                user.likedSponsors &&
                Object.keys(user.likedSponsors).includes(realtimeUser.username)
              ) {
                // Update sponsor's profile
                await update(child(usersRef, "users/" + userUID), {
                  sponsor: realtimeUser,
                });
                // Update user's profile
                const usersUsername = user.username
                await update(child(usersRef, "users/" + uid), {
                  sponsees: { ...realtimeUser.sponsees, [usersUsername]: user },
                });
                // Remove likedSponsors property from the user's profile
                await update(child(usersRef, "users/" + userUID), {
                  likedSponsors: null,
                });
              }
            } else if (
              realtimeUser.likedSponsors &&
              Object.keys(realtimeUser.likedSponsors).includes(user.username)
            ) {
              excludeUser = true;
              if (
                user.likedSponsees &&
                Object.keys(user.likedSponsees).includes(realtimeUser.username)
              ) {
                // Update user's profile
                await update(child(usersRef, "users/" + uid), {
                  sponsor: user,
                });
                // Update sponsor's profile
                const realtimeUsersUsername = realtimeUser.username
                await update(child(usersRef, "users/" + userUID), {
                  sponsees: { ...user.sponsees, [realtimeUsersUsername]: realtimeUser},
                });
                // Remove likedSponsors property from the user's profile
                await update(child(usersRef, "users/" + uid), {
                  likedSponsors: null,
                });
              }
            }

            if (!user.photoURL) {
              excludeUser = true;
            }

            if (realtimeUser?.sponsor?.username == user.username) {
              excludeUser = true;
            }
  
            if (!excludeUser) {
              usersList.push({
                uid: userUID,
                ...user,
              });
            }
          }
        }
  
        setUsers(usersList);

        // Fetch the updated realtimeUser from the database
        const updatedRealtimeUserSnapshot = await get(child(usersRef, "users/" + uid));
        const updatedRealtimeUser = updatedRealtimeUserSnapshot.val();

        // Update the realtimeUser state only if it's different from the current state
        if (JSON.stringify(updatedRealtimeUser) !== JSON.stringify(realtimeUser)) {
          setRealtimeUser(updatedRealtimeUser);
        }
      } catch (err) {
        console.log(err);
      }
    };
  
    const fetchAllUsers = async () => {
      const usersRef = ref(database);
      const usersList = [];
      get(child(usersRef, "users/"))
        .then((snapshot) => {
          snapshot.forEach((snap) => {
            if (snap.val().photoURL) {
              usersList.push(snap.val());
            }
          });
          setUsers(usersList);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  
    if (realtimeUser) {
      fetchCurrentUsers();
    } else {
      fetchAllUsers();
    }
  }, [realtimeUser]);

  useEffect(() => {
    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup function to remove event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (menuVisible && !event.target.closest('.profile-image')) {
      // If sign-in modal is open and the click occurred outside the modal container, close the modal
      setMenuVisible(false);
    }
  };



  const handleChange = (event, newAlignment) => {
    event.preventDefault();
    setAlignment(newAlignment);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setSignIn(!signIn);
  };

  const handleMenuItem = (e) => {
    e.preventDefault();
    setMenuVisible(!menuVisible);
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    await signOut(auth).then(() => {
      setRealtimeUser(null);
      alert("You have successfully logged out of your account, see you soon!");
    })
    .catch((error) => {
      console.log("Error signing out: " + error);
    })
    setMenuVisible(false);
  }

  const handleSwiperClick = (e) => {
    if (realtimeUser) {
      if (!realtimeUser?.sponsor || alignment == "sponsee"){
        setClickedUser(users[currentIndex]);
        setMenuVisible(false);
        setModalOpen(true);
      } else {
        setClickedUser(realtimeUser?.sponsor);
        setMenuVisible(false);
        setModalOpen(true);
      }
    } else {
      if (alignment == "sponsor" && users.length > 0) {
        setClickedUser(users[currentIndex]);
        setMenuVisible(false);
        setModalOpen(true);
      }
    }
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
  
  const handleCancel = async(e, user = "sponsor") => {
    e.preventDefault();
    const usersRef = ref(database);
    const allUsers = await get(child(usersRef, "users"));
    if (user == "sponsor") {
      const sponsorInfo = Object.entries(allUsers.val()).find(([userID, value]) => value.username === realtimeUser?.sponsor.username);
      const sponsorUID = sponsorInfo[0];
      await remove(ref(database, "users/" + uid + "/sponsor"));
      await remove(ref(database, "users/" + sponsorUID + "/sponsees/" + realtimeUser.username));
      await remove(ref(database, "users/" + sponsorUID + "/likedSponsees/" + realtimeUser.username));
    } else if (user.username) {
      const sponseeInfo = Object.entries(allUsers.val()).find(([userID, value]) => value.username === user.username);
      const sponseeUID = sponseeInfo[0];
      await remove(ref(database, "users/" + uid + "/sponsees/" + user.username));
      await remove(ref(database, "users/" + uid + "/likedSponsees/" + user.username));
      await remove(ref(database, "users/" + sponseeUID + "/sponsor"));
    }
    const specificUser = await get(child(usersRef, "users/" + uid));
    setRealtimeUser(specificUser.val());
  }

  const handleViewProfile = async(e) => {
    e.preventDefault();
    setClickedUser(realtimeUser);
    setModalOpen(true);
    setMenuVisible(false);
  }

  const handleViewingSponsees = async(e) => {
    e.preventDefault();
    setViewSponsees(true);
    setMenuVisible(false);
  }

  const handleSettings = async(e) => {
    e.preventDefault();
    setViewSettingsPage(true);
    setMenuVisible(false);
  }

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

    // Define the width for the image based on the windowWidth state
    const imageWidth = windowWidth > 962 ? 400 : windowWidth <= 962 && windowWidth > 810 ? 300 : windowWidth <= 810 && windowWidth > 400 ? 230 : 200;

  const handleMessageUser = async(e, user) => {
    e.preventDefault();
    setMessageModal(true);
    setUserToMessage(user);
  }

  return (
        <div className="home-container">
          <div className="left-child-container">
            <div className="profile-header">
              {realtimeUser ? 
                <>
                <div className="profile-image-container">
                  <img className="profile-image" src={realtimeUser.photoURL} alt="Profile" onClick={handleMenuItem} />
                </div>
                {menuVisible && 
                  <div className="logout-container">
                    <a href="#" onClick={handleViewProfile}>View Profile</a>
                    <a href="#" onClick={handleSettings}>Settings</a>
                    <a href="#" onClick={handleLogout}>Log out</a>
                  </div>
                }
                <h3>@{realtimeUser.username}</h3>
              </> : 
              <a
                className="sign-in-link"
                href="/sign-in"
                onClick={handleSignIn}
              >
                Sign In
              </a>}
            </div>
            <div className="banner-container">
              <StyleTwoTone sx={{ fontSize: "64px" }} className="style-icon" />
              <div className="banner-text">
                <h3 className="unlock-text">Unlock the 12-steps</h3>
                {realtimeUser ? 
                <h5>Start liking to find a sponsor/sponsee!</h5> :
                <h5 className="unlock-subtext">
                  Sign in to find a sponsor!
                </h5>}
              </div>
            </div>
            <div className="messages-text-container">
              <h6 className="messages-text">Sponsees</h6>
            </div>
            <div className="message-container">
            {realtimeUser?.sponsees && Object.values(realtimeUser?.sponsees).length > 0 ? (
              Object.values(realtimeUser.sponsees).map((user, index) => (
            <div className="sponsee-info" key={user.id}>
              <div className="first-row" onClick={(e) => handleMessageUser(e, user)}>
                <img src={user.photoURL} alt="User profile"/>
                <div className="messages-user-info">
                  <h5>{user.firstname} {user.lastInitial}</h5>
                  <h3 style={{color: "gray"}}>Click here to send a message to {user.firstname} {user.lastInitial}!</h3>
                </div>
              </div>
            </div>
            ))
            ) : (
              <div className="person-message-and-icon">
                <PersonTwoTone fontSize="large"/>
                {!realtimeUser ? <h5 className="sign-in-warning-message">Sign in to chat with sponsees</h5> : <h5 className="sign-in-warning-message">Match with someone to begin chatting!</h5>}
                <h5 className="sign-in-warning-message-mobile">Chat with sponsees!</h5>
              </div>
            )}

            </div>
          </div>
          <div className="right-child-container">
          {realtimeUser ? 
          <>
            <div className="profile-header-mobile">
            <div className="profile-image-container-mobile">
              <img className="profile-image-mobile" src={realtimeUser.photoURL} alt="Profile" onClick={handleMenuItem}/>
            </div>
            {menuVisible && 
                  <div className="logout-container">
                    <a href="#" onClick={handleViewProfile}>View Profile</a>
                    <a href="#" onClick={handleViewingSponsees}>View Sponsees</a>
                    <a href="#" onClick={handleSettings}>Settings</a>
                    <a href="#" onClick={handleLogout}>Log out</a>
                  </div>
            }
            <h3>@{realtimeUser.username}</h3>
            </div>
            <ToggleButtonGroup
              value={alignment}
              color="primary"
              exclusive
              aria-label="group"
              onChange={handleChange}
              className="sponsor-sponsee-buttons-signed-in"
            >
              <ToggleButton value="sponsor">Sponsors</ToggleButton>
              <ToggleButton value="sponsee">Sponsees</ToggleButton>
            </ToggleButtonGroup>
            </>: 
            <div className="toggle-buttons">
              <a
                className="sign-in-link-mobile"
                href="/sign-in"
                onClick={handleSignIn}
              >
                Sign In
              </a>
              <ToggleButtonGroup
                value={alignment}
                color="primary"
                exclusive
                aria-label="group"
                onChange={handleChange}
                className="sponsor-sponsee-buttons"
              >
                <ToggleButton value="sponsor">Sponsors</ToggleButton>
                <ToggleButton value="sponsee">Sponsees</ToggleButton>
              </ToggleButtonGroup>
              <a
                className="settings-link-mobile"
                href="#"
                onClick={handleSettings}
              >
                Settings
              </a>
            </div>}
            <Swiper
            effect={'cards'}
            modules={[EffectCards, Navigation, Pagination, Scrollbar, A11y]}
            navigation={true}
            pagination={true}
            grabCursor={true}
            className="my-swiper"
            style={{width: imageWidth, height: "auto"}}
            onClick={handleSwiperClick}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.activeIndex);
            }}
            >
              {realtimeUser?.sponsor && alignment == "sponsor" ? (
                <SwiperSlide className="swiper-slide">
                  <img style={{width: imageWidth, height: imageWidth}} src={realtimeUser.sponsor.photoURL}/>
                  <h3>{realtimeUser.sponsor.firstname} {realtimeUser.sponsor.lastInitial}. sober since {realtimeUser.sponsor.sobrietyDate}</h3>
                </SwiperSlide>
              ) : !realtimeUser && alignment == "sponsee" ? 
              <SwiperSlide>
                <div className="no-more-users-container">
                <div className="no-more-users-message">
                  <p>Create an account to view sponsees and become a sponsor for those in need today!</p>
                  <button className="no-more-users-create-account-button" onClick={() => setCreateAccount(true)}>Create Account</button>
                </div>
              </div>
              </SwiperSlide> : users.length > 0 ? (
                users.map((user, index) => (
                  <SwiperSlide key={index} className="swiper-slide">
                    <img style={{width: imageWidth, height: imageWidth}} src={user.photoURL} />
                    <h3>{user.firstname} {user.lastInitial}. sober since {user.sobrietyDate}</h3>
                  </SwiperSlide>
                ))
              ) : realtimeUser ? (
                <SwiperSlide>
                <div className="no-more-users-container">
                <div className="no-more-users-message">
                  <p>There are currently no more users to swipe on.</p>
                  <p>Come back in 24 hours to get a new set of users to swipe on.</p>
                </div>
              </div>
              </SwiperSlide>
              ) :
              <SwiperSlide>
                <div className="no-more-users-container">
                  <div className="no-more-users-message">
                    <p>Create an account to view more users</p>
                    <button className="no-more-users-create-account-button" onClick={() => setCreateAccount(true)}>Create Account</button>
                  </div>
                </div>
                </SwiperSlide>}

      </Swiper>
      {users.length > 0 ? <input type="button" value="View Profile" onClick={() => handleSwiperClick(currentIndex)} className="view-profile-button"/> : ""}
            {realtimeUser?.sponsor && alignment == "sponsor" ?
            <div className="swipe-icons">
            <Tooltip
              title="Hit to remove this person as your sponsor"
              placement="top"
              TransitionComponent={Fade}
            >
              <IconButton onClick={(e) => handleCancel(e, "sponsor")}>
                <CancelTwoTone fontSize="large" color="warning"/>
              </IconButton>
            </Tooltip>
            <a aria-label="Chat on WhatsApp" href={"https://wa.me/" + realtimeUser?.sponsor.phoneNumber}>
              <img alt="Chat on WhatsApp" src={WhatsAppButton} height="auto" width="250px"/>
            </a> 
          </div> : users.length > 0 ?
            <div className="swipe-icons">
              <Tooltip
                title="Hit dislike to temporarily take this person off your swipe list"
                placement="top"
                TransitionComponent={Fade}
              >
                <IconButton onClick={(e) => {!realtimeUser ? handleTempDislike(e) : handleDislike(e)}}>
                  <ThumbDownTwoTone fontSize="large" color={"primary"}/>
                </IconButton>
              </Tooltip>
              <Tooltip
                title="Hit like to potentially match with this person!"
                placement="top"
                TransitionComponent={Fade}
              >
                <IconButton onClick={(e) => {!realtimeUser ? handleTempLike(e) : handleLike(e)}}>
                  <ThumbUpTwoTone fontSize="large" color={"primary"}/>
                </IconButton>
              </Tooltip>
            </div> : ""}
            {realtimeUser ? "" : <div className="create-account-footer-link">
                <h4><a href="#" onClick={(e) => setCreateAccount(true)}>Create an account</a> to find a sponsor or sponsees!</h4>
            </div>}
          </div>
        { signIn ?
        <signInContext.Provider value={{setUser, setSignIn, signIn, setCreateAccount, setRealtimeUser, setMenuVisible, setUid}}>
          <SignIn/>
        </signInContext.Provider> : congrats ?
        <congratsModalContext.Provider value={{congrats, setCongrats, setCreateAccount, currentLikedUser, alignment}}>
          <CongratsModal />
        </congratsModalContext.Provider> : createAccount ?
        <createAccountContext.Provider value={{setCreateAccount, createAccount, setSignIn, currentLikedUser, alignment}}>
          <CreateAccount />
        </createAccountContext.Provider> : modalOpen ? 
        <modalContext.Provider value={{modalOpen, setModalOpen, clickedUser, realtimeUser, users, currentIndex, setUsers, setCurrentLikedUser, setCongrats, setCreateAccount,
        alignment, uid, setRealtimeUser}}>
          <UserModal />
        </modalContext.Provider> : user ?
        <userContext.Provider value={{user, setUser, setSignIn, image, setImage, setAvatarEditor, avatarEditor, setMenuVisible}}>
          <BuildProfile />
        </userContext.Provider> : viewSponsees ?
        <viewSponseesContext.Provider value={{realtimeUser, setViewSponsees, setRealtimeUser, uid}}>
          <ViewSponsees />
        </viewSponseesContext.Provider> : viewSettingsPage ?
        <viewSettingsPageContext.Provider value={{setViewSettingsPage, viewSettingsPage}}>
          <ViewSettingsPage />
        </viewSettingsPageContext.Provider> : messageModal ?
        <messageModalContext.Provider value={{setMessageModal, messageModal, userToMessage}}>
          <MessageModal />
        </messageModalContext.Provider> : ""}
        </div>
  );
};

export default Home;
