import { useContext, useEffect } from "react";
import "./styles/ViewSponsees.css"
import { viewSponseesContext } from "./Home";
import { child, get, getDatabase, ref, remove } from "firebase/database";
import { CancelTwoTone, CloseTwoTone } from "@mui/icons-material";
import { Fade, IconButton, Tooltip } from "@mui/material";
import WhatsAppButton from "./SmallButton.png";

const ViewSponsees = () => {
    const contextValue = useContext(viewSponseesContext);
    const { realtimeUser, setViewSponsees, setRealtimeUser, uid } = contextValue;
    const database = getDatabase();

    useEffect(() => {
        // Add event listener when component mounts
        document.addEventListener("mousedown", handleClickOutside);
        // Cleanup function to remove event listener when component unmounts
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

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

      const handleClickOutside = (event) => {
        if (ViewSponsees && !event.target.closest('.view-sponsees-box-container')) {
          // If sign-in modal is open and the click occurred outside the modal container, close the modal
          setViewSponsees(false);
        }
      };

    return (
        <div className="view-sponsees-container">
            <div className="view-sponsees-box-container">
                <div className="view-sponsees-icons-container">
                    <CloseTwoTone fontSize="large" className="view-sponsees-container-close-icon" onClick={() => setViewSponsees(false)}/>
                </div>
                <div className="view-sponsees-list-container">
                    {realtimeUser.sponsees && Object.values(realtimeUser.sponsees).length > 0 ? (
                        <div className="sponsee-list">
                            {Object.values(realtimeUser.sponsees).map((sponsee) => (
                                <div className="sponsee-info" key={sponsee.id}>
                                    <div className="first-row">
                                        <img src={sponsee.photoURL} alt="User profile" style={{height: "200px", width: "200px"}}/>
                                        <h5>{sponsee.firstname} {sponsee.lastInitial}.</h5>
                                    </div>
                                    <div className="second-row">
                                        <h5>Sober since {sponsee.sobrietyDate}</h5>
                                    </div>
                                    <div className="third-row">
                                        <div className="cancel-sponsee-button">
                                        <Tooltip
                                            title="Hit to remove this sponsee"
                                            placement="top"
                                            TransitionComponent={Fade}
                                        >
                                            <IconButton onClick={(e) => handleCancel(e, sponsee)}>
                                                <CancelTwoTone fontSize="large" color="warning"/>
                                            </IconButton>
                                        </Tooltip>
                                        </div>
                                        <a aria-label="Chat on WhatsApp" href={"https://wa.me/" + sponsee.phoneNumber}>
                                            <img className="whatsapp-icon" alt="Chat on WhatsApp" src={WhatsAppButton} />
                                        </a> 
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="view-sponsees-no-sponsees-message">You have no sponsees</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ViewSponsees;


