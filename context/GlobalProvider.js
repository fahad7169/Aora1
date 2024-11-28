import { createContext, useState, useContext, useEffect, useRef } from "react";
import { getCurrentUser } from "../lib/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Toast from 'react-native-toast-message';


const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);



    const isFirstLoad=useRef(true);

    // Load user data from AsyncStorage if offline
    const loadCachedUser = async () => {
        try {
            const cachedUser = await AsyncStorage.getItem("user");
            const cachedLoginStatus = await AsyncStorage.getItem("isLoggedIn");
            if (cachedUser && cachedLoginStatus) {
                setUser(JSON.parse(cachedUser));
                setIsLoggedIn(JSON.parse(cachedLoginStatus));
                return JSON.parse(cachedUser);
            }
        } catch (error) {
            console.log("Failed to load cached user data:", error);
        }
        return null;
    };

    const [isConnected, setIsConnected] = useState(true); // Track connection status

    useEffect(() => {
        // Subscribe to connection status updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            const currentlyConnected = state.isConnected;

          


        
            // Show a toast if connection is lost
            if (!currentlyConnected ) {
                Toast.show({
                    type: "error",
                    text1: "No Internet Connection",
                    text2: "Please connect to Internet and try again",
                    visibilityTime: 5000,
                    autoHide:true,
                    text1Style: { fontSize: 14, fontWeight: "bold" }, // Increase text size for text1
                    text2Style: { fontSize: 12 },

                });
                isFirstLoad.current=false
            }
            if(!isFirstLoad.current && currentlyConnected){
               
               Toast.show({
                   type: "success",
                   text1: "Internet Connection Restored",
                   text2: "You are back online",
                   visibilityTime: 5000,
                   autoHide:true,
                   text1Style: { fontSize: 14, fontWeight: "bold" }, // Increase text size for text1
                   text2Style: { fontSize: 12 },
               })
               
            }
            

            setIsConnected(currentlyConnected);
          
            
            
            // Update the connection status
          });
          
          return () => unsubscribe();
       
    }, []); // Rerun if the connection status changes


    // Save user data to AsyncStorage for offline access
    const saveUserToCache = async (user, isLoggedIn) => {
        try {
            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
        } catch (error) {
            console.log("Failed to save user data to cache:", error);
        }
    };

    // Check user session with network condition
    useEffect(() => {
        const checkSession = async () => {

            const cachedUser = await loadCachedUser(); // Load cached user data first

            // If user data exists in cache, set loading to false
            if (cachedUser) {
                setIsLoading(false);
                return; // Exit early if we found a cached user
            }
    
        
            const netInfo = await NetInfo.fetch();
            if (netInfo.isConnected) {
                // If online, try to get the current user
                getCurrentUser()
                    .then((res) => {
                        if (res) {
                            setIsLoggedIn(true);
                            setUser(res);
                            saveUserToCache(res, true); // Save user data to cache
                        } else {
                            setIsLoggedIn(false);
                            setUser(null);
                            saveUserToCache(null, false); // Save null data to cache
                        }
                    })
                    .catch((error) => {
                        loadCachedUser()
                        console.log("Error fetching user data:", error);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } else {
                // If offline, load cached data
     
            
                await loadCachedUser();
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);


    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
                setIsLoading,
                isConnected,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};
