import { useContext, useEffect } from "react";
import { congratsModalContext } from "./Home";
import "./styles/CongratsModal.css";
import Confetti from "react-confetti";

const CongratsModal = () => {
    const accountContextValue = useContext(congratsModalContext);
    const {congrats, setCongrats, setCreateAccount, currentLikedUser, alignment} = accountContextValue;

    useEffect(() => {
        // Add event listener when component mounts
        document.addEventListener("mousedown", handleClickOutside);
        // Cleanup function to remove event listener when component unmounts
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

      const handleClickOutside = (event) => {
        if (congrats && !event.target.closest('.congrats-message-box-container')) {
          // If sign-in modal is open and the click occurred outside the modal container, close the modal
          setCongrats(false);
          setCreateAccount(false);
        }
    };

    const handleCongratsModal = async(e) => {
        e.preventDefault();
        setCongrats(false);
        setCreateAccount(true);
    }


return (
    <>
    {congrats ?
    <div className="congrats-message-container">
        <div className="congrats-message-box-container">
            <h3 className="congrats-direct-message">Congrats you matched with {currentLikedUser.firstname} {currentLikedUser.lastInitial} to become their {alignment === "sponsor" ? "Sponsee" : "Sponsor"}!</h3>
            <img className="currently-liked-user" src={currentLikedUser.photoURL}/>
            <h3>Create an account to connect with them!</h3>
            <button onClick={handleCongratsModal}>Create Account</button>
            <Confetti initialVelocityY={5} gravity={0.075}/>
        </div>
    </div> : ""}
    </>
    );
}

export default CongratsModal;