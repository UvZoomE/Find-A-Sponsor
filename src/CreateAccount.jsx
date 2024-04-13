import { CloseTwoTone } from "@mui/icons-material";
import './styles/CreateAccount.css'
import { useEffect, useState } from "react";
import { createAccountContext } from "./Home";
import { useContext } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { child, get, getDatabase, ref, set} from "firebase/database";
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

const CreateAccount = () => {
    const [firstname, setFirstname] = useState("");
    const [lastInitial, setLastInitial] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [programOfChoice, setProgramOfChoice] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneNumberTrigger, setPhoneNumberTrigger] = useState(false);
    const [usernameTrigger, setUsernameTrigger] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const accountContextValue = useContext(createAccountContext);
    const {setCreateAccount, createAccount, setSignIn} = accountContextValue;
    const auth = getAuth();
    const database = getDatabase();

    useEffect(() => {
        // Add event listener when component mounts
        document.addEventListener("mousedown", handleClickOutside);
        // Cleanup function to remove event listener when component unmounts
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);
    
    const handleClickOutside = (event) => {
        if (createAccount && !event.target.closest('.create-account-box-container')) {
          // If sign-in modal is open and the click occurred outside the modal container, close the modal
          setCreateAccount(false);
        }
    };

    const handleCreateAccount = (e) => {
        e.preventDefault();
        setCreateAccount(false);
    }

    const handleAccountCreation = async (e) => {
        e.preventDefault();
        if (programOfChoice === "" || programOfChoice === "default") {
            alert("Please choose a program of choice")
            return;
        } else if (!phoneNumber) {
            alert("You must add a phone number when creating your account, please recreate your account!")
            return;
        }
        const usersRef = ref(database);

        const allUsers = await get(child(usersRef, "users/"));
        try {
            if (allUsers.val() && allUsers.val().length > 0) {
                Object.values(allUsers.val()).forEach(element => {
                    if (username == element.username) {
                        throw new Error("Username is already in use");
                    } else if (phoneNumber == element.phoneNumber) {
                        throw new Error("Phone number is already in use");
                    }
                });
            }

            // Create user account using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password);
            const user = userCredential.user;

            // Once you implement the server side of the application then proceed to determine if usernames are unique...

            // Store user in realtime database first to check if username already exists, if it does then throw an error
            await set(ref(database, 'users/' + user.uid), { // Use ref and set from the database object
                firstname: firstname,
                lastInitial: lastInitial,
                emailAddress: emailAddress,
                username: username,
                programOfChoice: programOfChoice,
                sobrietyDate: selectedDate,
                phoneNumber: phoneNumber,
                // Add more user data as needed
            });

            // Update user profile with additional information
            await updateProfile(user, {
                displayName: username,
                phoneNumber: phoneNumber,
            });

            sendEmailVerification(user);

            setCreateAccount(false);
            
            alert("Please check your email to activate your account!");

        } catch (error) {
            console.error("Error creating user account:", error.message);
            if (error.message.includes("email-already-in-use")) {
                setEmailError(true);

                setTimeout(() => {
                    setEmailError(false);
                }, 5000);
            } else if (error.message.includes("Username")) {
                setUsernameTrigger(true);

                setTimeout(() => {
                    setUsernameTrigger(false);
                }, 5000);
            } else if (error.message.includes("Phone number")) {
                setPhoneNumberTrigger(true);

                setTimeout(() => {
                    setPhoneNumberTrigger(false);
                }, 5000);
            } else if (error.message.includes("invalid-email")) {
                setInvalidEmail(true);

                setTimeout(() => {
                    setInvalidEmail(false);
                }, 5000);
            }
        }
    };

    return (
        <>
        {createAccount ? 
        <div className="create-account-container">
            <div className="create-account-box-container">
                <CloseTwoTone className="create-account-container-close-icon" onClick={(e) => handleCreateAccount(e)}/>
                <h3 className="create-account-container-header-text">Create Account</h3>
                    <form onSubmit={handleAccountCreation} className="create-account-form-container">
                        <input required type="text" value={firstname} placeholder="First Name" onChange={(e) => setFirstname(e.target.value)}/>
                        <input required type="text" value={lastInitial} placeholder="Last Initial" onChange={(e) => setLastInitial(e.target.value)}/>
                        {emailError && <span style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>Email is already in use</span>}
                        {invalidEmail && <span style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>Invalid email, try again</span>}
                        <input required type="text" value={emailAddress} placeholder="Email Address" onChange={(e) => setEmailAddress(e.target.value)}/>
                        {phoneNumber && !isValidPhoneNumber(phoneNumber) && <span style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>Please enter a valid phone number</span>}
                        {phoneNumberTrigger && <span style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>This phone number is already in use</span>}
                        <PhoneInput
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            international
                            countryCallingCodeEditable={false}
                            defaultCountry="US"
                            required
                        />
                        {usernameTrigger && <span style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>Username is already in use</span>}
                        <input required type="text" value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
                        <input required type="text" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                        <input required type="password" value={confirmPassword} placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)}/>
                        <label htmlFor="programs">Program of Choice:</label>
                        <select required name="programs" onChange={(e) => setProgramOfChoice(e.target.value)}>
                            <option value="default">Select an option</option>
                            <option value="SA">(SA) Sexaholics Anonymous</option>
                        </select>
                        <p>More programs will be added soon!</p>
                        <label htmlFor="date">Select first day of sobriety:</label>
                            <input 
                                type="date" 
                                id="date" 
                                name="date" 
                                value={selectedDate} 
                                onChange={(event) => setSelectedDate(event.target.value)} 
                                required
                            />
                        <button disabled={emailError || usernameTrigger || phoneNumberTrigger || (phoneNumber && !isValidPhoneNumber(phoneNumber))} type="submit">Create Account</button>
                    </form>
                <hr className="horizontal-line"/>
                <h3>Have an account? <a href='#' className="sign-in-link" onClick={() => {
                    setSignIn(true)
                    setCreateAccount(false)}}>Sign In</a></h3>
            </div>
        </div> : ""}
        </>
    )
}

export default CreateAccount;