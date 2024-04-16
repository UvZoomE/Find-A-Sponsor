import { useContext, useEffect } from "react"
import { viewSettingsPageContext } from "./Home"

import "./styles/ViewSettingsPage.css"

import {
  CloseTwoTone,
} from "@mui/icons-material";

const ViewSettingsPage = () => {
    const contextValue = useContext(viewSettingsPageContext);
    const { setViewSettingsPage, viewSettingsPage } = contextValue;

    useEffect(() => {
      // Add event listener when component mounts
      document.addEventListener("mousedown", handleClickOutside);
      // Cleanup function to remove event listener when component unmounts
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const handleClickOutside = (event) => {
      if (viewSettingsPage && !event.target.closest('.view-settings-box-container')) {
        // If sign-in modal is open and the click occurred outside the modal container, close the modal
        setViewSettingsPage(false);
      }
    };

    return (
        <>
        {viewSettingsPage ? (
        <div className="view-settings-container">
          <div className="view-settings-box-container">
            <CloseTwoTone fontSize="large" className="view-settings-container-close-icon" onClick={() => setViewSettingsPage(false)}/>
              <hr className="horizontal-line"/>
              <h3>Found any bugs, want to request new features or want to help code this project?</h3>
                <h3>Contact our team at admin@findasponsor.app</h3>
              <h4>PS: Dark mode is coming soon!</h4>
          </div>
        </div> ) : ""}
        </>
    )
}

export default ViewSettingsPage;