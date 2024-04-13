import { CloseTwoTone } from '@mui/icons-material';
import './styles/SignIn.css'
import { useContext, useEffect, useState } from 'react';
import { signInContext } from './Home';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth"; // Import setPersistence and browserSessionPersistence
import { child, get, getDatabase, ref } from 'firebase/database';

const SignIn = () => {
  const contextValue = useContext(signInContext);
  const { setUser, setSignIn, signIn, setCreateAccount, setRealtimeUser, setMenuVisible, setUid} = contextValue;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalidLogin, setInvalidLogin] = useState(false);
  const auth = getAuth();
  auth.useDeviceLanguage();
  const database = getDatabase();
  
  useEffect(() => {
    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup function to remove event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Set session persistence
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        // Session persistence successfully set
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }, []);

  const handleClickOutside = (event) => {
    if (signIn && !event.target.closest('.sign-in-box-container')) {
      // If sign-in modal is open and the click occurred outside the modal container, close the modal
      setSignIn(false);
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setSignIn(false);
  }

  const handleManualSignIn = async (e) => {
    e.preventDefault();
    await signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
    // Signed in 
    const user = userCredential.user;
    const usersRef = ref(database);
    const specificUser = await get(child(usersRef, "users/" + userCredential.user.uid))
    if (userCredential.user.emailVerified) {
      if (!specificUser.val().minimalProfileBuilt) {
        // If minimal profile is not built, set user and sign in
        setSignIn(false);
        setUser(user);
      } else {
        // If minimal profile is already built, set realtimeUser
        setSignIn(false);
        setRealtimeUser(specificUser.val());
        setUid(user.uid);
      }
    } else {
      alert("You must activate your account before you can sign in! Check your email's inbox or spam folder");
      sendEmailVerification(user);
    }
    }, (errorObject) => {
      if (errorObject.message.includes("invalid-credential")) {
        setInvalidLogin(true);
        setTimeout(() => {
          setInvalidLogin(false);
        }, 5000);
      }
    });
    setMenuVisible(false);
  };

  return (
    <>
    {signIn ? (
    <div className="sign-in-container">
      <div className="sign-in-box-container">
        <CloseTwoTone className="sign-in-container-close-icon" onClick={(e) => handleSignIn(e)}/>
        <h3 className="sign-in-container-header-text">Sign In</h3>
        {invalidLogin ? <h5 style={{color: "red"}}>Login is invalid, try again!</h5> : ""}
        <form className="sign-in-form-container" onSubmit={handleManualSignIn}>
          <input type="text" value={email} placeholder="Email" disabled={invalidLogin} style={invalidLogin ? {borderColor: "red", backgroundColor: "rgba(255, 180, 180, 0.5)"} : {}} onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" value={password} placeholder="Password" disabled={invalidLogin} style={invalidLogin ? {borderColor: "red", backgroundColor: "rgba(255, 180, 180, 0.5)"} : {}} onChange={(e) => setPassword(e.target.value)}/>
          <button disabled={invalidLogin} type="submit">Sign In</button>
        </form>
        <hr className="horizontal-line"/>
          <h3>Don't have an account? <a href='#' className="create-account-link" onClick={() => {
            setCreateAccount(true)
          setSignIn(false)}}>Create One</a></h3>
      </div>
      
    </div> ) : ""}
    </>
  )
}

export default SignIn;
