import { useContext, useEffect, useState } from "react";
import { modalContext } from "./Home"; // Assuming modalContext is imported from "Home"
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material"

import "./styles/MessageModal.css";

const MessageModal = () => {
  const contextValue = useContext(modalContext);
  const { setMessageModal, messageModal, userToMessage } = contextValue;

  useEffect(() => {
    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup function to remove event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (messageModal && !event.target.closest(".message-modal-box-container")) {
      // If message modal is open and the click occurred outside the modal container, close the modal
      setMessageModal(false);
    }
  };

  return (
    <div className="message-modal-container">
      <div className="message-modal-box-container">
        <h3>
            Conversation between you and {userToMessage.username}
        </h3>
        <IconButton className="message-modal-container-close-icon" onClick={() => setMessageModal(false)}>
            <Close fontSize="large" />
        </IconButton>
      </div>
    </div>
  );
};

export default MessageModal;
