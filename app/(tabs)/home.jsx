import { View, Text, FlatList, Image, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from '../../components/Trending'
import EmptyState from '../../components/EmptyState'
import { getAllPosts, getLatestPosts, getUserLikedVideos, getUserSavedVideos } from '../../lib/appwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY_POSTS = 'cached_posts';
const STORAGE_KEY_LATEST = 'cached_latest_posts';
const STORAGE_KEY_LIKED = 'cached_liked_posts';
const STORAGE_KEY_SAVED = 'cached_saved_posts';


const Home = () => {

  
  const { user, isConnected } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [UserLiked , setUserLiked] = useState([]);
  const [isAppReady,setIsAppReady] = useState(false)
  const [UserSaved, setUserSaved] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setIsAppReady(true)
    }, 1000);
  })
  
  



 
  
  
  // Load posts from AsyncStorage cache
  const loadCachedPosts = async () => {
    try {
      setIsLoading(true)
      const storedPosts = await AsyncStorage.getItem(STORAGE_KEY_POSTS);
      const storedLatestPosts = await AsyncStorage.getItem(STORAGE_KEY_LATEST);
      const storedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);
      const storedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);

      if(storedSavedPosts) setUserSaved(JSON.parse(storedSavedPosts));

      if (storedPosts) setPosts(JSON.parse(storedPosts));
      if (storedLatestPosts) setLatestPosts(JSON.parse(storedLatestPosts));
      if (storedLikedPosts) setUserLiked(JSON.parse(storedLikedPosts));
      return storedPosts;
    } catch (error) {
      console.log("Error loading cached posts:", error);
    }
    finally{
      setIsLoading(false)
    }
    return null
  };

  const UserLikedVideos =(userId) => {
    if (isConnected) {
      getUserLikedVideos(userId).then((res) => setUserLiked(res))
      getUserSavedVideos(userId).then((res) => setUserSaved(res))
    }
   
  }

  useEffect(() => {
    UserLikedVideos(user?.$id)
  },[])

 
  
  

 // Fetch posts from the database and update the cache if online
 const fetchFromDatabase = async () => {
  if (!isConnected) return;

  try {
    setIsLoading(true)
    const fetchedPosts = await getAllPosts();
    const fetchedLatestPosts = await getLatestPosts();
    const fetchedLikedPosts = await getUserLikedVideos(user?.$id);
    const fetchedSavedPosts = await getUserSavedVideos(user?.$id);
    // Update state
    setPosts(fetchedPosts);
    setLatestPosts(fetchedLatestPosts);
    setUserLiked(fetchedLikedPosts);
    setUserSaved(fetchedSavedPosts);

    // Cache the data if it's new
    const cachedPosts = await AsyncStorage.getItem(STORAGE_KEY_POSTS);
    const cachedLatestPosts = await AsyncStorage.getItem(STORAGE_KEY_LATEST);
    const cachedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);
    const cachedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);



    if (cachedPosts !== JSON.stringify(fetchedPosts.slice(0, 10))) {
      await AsyncStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(fetchedPosts.slice(0, 10)));
    }

    if (cachedLikedPosts !== JSON.stringify(fetchedLikedPosts.slice(0, 10))) {
      await AsyncStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(fetchedLikedPosts.slice(0, 10)));
    }

   if (cachedSavedPosts !== JSON.stringify(fetchedSavedPosts.slice(0, 10))) {
      await AsyncStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(fetchedSavedPosts.slice(0, 10)));
    }
    if (cachedLatestPosts !== JSON.stringify(fetchedLatestPosts.slice(0, 10))) {
      await AsyncStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(fetchedLatestPosts.slice(0, 10)));
    }
  } catch (error) {
    console.log("Error fetching posts from database:", error);
  }
  setIsLoading(false)
};

// Fetch data with cache-first strategy
const fetchData = async () => {
  setIsLoading(true);
  const cachedPosts=await loadCachedPosts(); // Load cached data immediately

  if(!cachedPosts){
    fetchFromDatabase()
  }
  setIsLoading(false);
};

// Run fetchData on initial load
useEffect(() => {
  fetchData();
}, []);

// Pull-to-refresh function to update from the database
const onRefresh = async () => {
  if (isConnected) {
    setRefreshing(true);
    await fetchFromDatabase(); // Refreshes with database data if online
    setRefreshing(false);
  } else {
    setRefreshing(false); // Stop refresh if offline
  }
};





 
  return (<>
  
      <SafeAreaView className="bg-[#15141A] h-full">
      <FlatList
     data={posts}
      keyExtractor={(item)=>item?.$id}
      renderItem={({item})=>(
       <VideoCard
       video={item}
       isLoading={isLoading}
       user={user}
       likedVideos={UserLiked ?? []}
       savedVideos={UserSaved ?? []}
       />
      )}
      ListHeaderComponent={()=>(
       <View className="my-6 px-4 space-y-6">
           <View className="justify-between items-start flex-row mb-6">
             <View>
               <Text className="font-pmedium text-sm text-gray-100">
                 Welcome back,
               </Text>
               <Text className="text-2xl font-psemibold text-white">
                 {user?.username}
               </Text>
             </View>
             <View className="mt-1.5">
               <Image 
               source={images.logoSmall}
               className="w-9 h-10"
               resizeMode='contain'
               />
             </View>
           </View>
           <SearchInput
           screenname={"home"}
           />
           <View className="w-full">
                <Text className="text-gray-100 text-lg font-pregular  mb-3">
                 Latest Videos
                </Text>
                <Trending
                posts={latestPosts ?? []}
                isLoading={isLoading}
                />
           </View>
       </View>
   )}
   ListEmptyComponent={()=>{
    return (
      <>
        {(!isLoading && !isAppReady) && (
          <EmptyState title="No Videos Found" subtitle="Try uploading a video" />
        )}
      </>
    );
  }}
   refreshControl={
     <RefreshControl
     refreshing={refreshing}
     onRefresh={onRefresh}
     />}
      />
     </SafeAreaView>
    
   </>
  )
}

export default Home