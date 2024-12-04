import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

export const AppContext = createContext();

const AppContextProvider = (_props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
      
          if (!userSnap.exists()) {
            throw new Error(`User document not found for UID: ${uid}`);
          }
      
          const userData = userSnap.data();
      
          if ((!userData.avatar.trim() && !userData.name) || !userData.name) {
            console.warn("Incomplete user data:", userData);
            navigate("/profile");
          } else {
            setUserData(userData);
            navigate("/chat");
          }
      
          await updateDoc(userRef, {
            lastSeen: new Date(),
          });
      
          const intervalId = setInterval(async () => {
            if (auth.currentUser) {
              await updateDoc(userRef, {
                lastSeen: new Date(),
              });
            }
          }, 60000);
      
          return () => clearInterval(intervalId);
        } catch (error) {
          console.error("Error loading user data:", error);
          throw error; // Re-throw to handle higher up the call stack
        }
      };
      

    useEffect(() => {
        if (userData?.id) {
            const chatRef = doc(db, "chats", userData.id);

            const unSub = onSnapshot(chatRef, async (res) => {
                try {
                    const chatItems = res.data()?.chatsData || [];
                    const tempData = await Promise.all(
                        chatItems.map(async (item) => {
                            const userRef = doc(db, "users", item.rId);
                            const userSnap = await getDoc(userRef);
                            const userData = userSnap.data();
                            return { ...item, userData };
                        })
                    );
                    setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
                } catch (error) {
                    console.error("Error fetching chat data:", error);
                }
            });

            return () => unSub();
        }
    }, [userData]);

    const value = {
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
        messages,
        setMessages,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser,
        chatVisible,
        setChatVisible,
    };

    return (
        <AppContext.Provider value={value}>
            {_props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
