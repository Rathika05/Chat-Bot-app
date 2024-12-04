import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword,getAuth,signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc,getFirestore,setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
const firebaseConfig = {
  apiKey: "AIzaSyBmx5O933DqEsU7CkI3Y8CvZpED9DyJe4s",
  authDomain: "chat-app-gs-d30e6.firebaseapp.com",
  projectId: "chat-app-gs-d30e6",
  storageBucket: "chat-app-gs-d30e6.firebasestorage.app",
  messagingSenderId: "1027596489569",
  appId: "1:1027596489569:web:e115069b3ab76699c7ab20"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There i am using chat app",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    } catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}
const login = async(email,password) => {
    try{
        await signInWithEmailAndPassword(auth,email,password);

    } catch (error){ 
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}
const logout = async () => {
    try{
        await signOut(auth)   
    } catch(error)
{
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));

}
};   

const resetPass = async (email) =>{
     if (!email) {
        toast.error("Enter your mail");
        return null;
     }
     try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }
        else{
            toast.error("Email doesn't exists")
        }
     } catch (error) {
        console.error(error);
        toast.error(error.message);
        
     }
}

export {signup,login,logout,auth,db,resetPass}