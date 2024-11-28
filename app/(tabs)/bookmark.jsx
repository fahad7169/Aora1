import { View, Text, FlatList, Image, RefreshControl, TextInput } from 'react-native'
import React, { memo, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '../../components/EmptyState'
import {  getUserLikedVideos, getUserSavedVideos } from '../../lib/appwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TouchableOpacity } from 'react-native'
import { icons } from '../../constants'


const STORAGE_KEY_LIKED = 'cached_liked_posts';
const STORAGE_KEY_SAVED = 'cached_saved_posts';

const HeaderComponent = memo(({ filterOut }) => (
  <View className="my-6 px-4 space-y-6">
    <View className="justify-between items-start flex-row mb-6">
      <View>
        <Text className="font-pmedium text-sm text-gray-100"></Text>
        <Text className="text-2xl font-psemibold text-white">Saved Videos</Text>
      </View>
    </View>
    <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <MyTextInput filterOut={filterOut} />
      <TouchableOpacity onPress={() => filterOut(query)}>
        <Image source={icons.search} className="w-6 h-6" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  </View>
));

const MyTextInput = memo(({ filterOut }) => {
  const [localQuery, setLocalQuery] = useState("");

  return (
    <TextInput
      className="text-base mt-0.5 text-white flex-1 font-pregular"
      placeholder={"Search your saved Videos"}
      placeholderTextColor="#CDCDE0"
      value={localQuery}
      onChangeText={(text) => {
        setLocalQuery(text); // Local state for better control
        filterOut(text); // Trigger filtering
      }}
      returnKeyType="search"
    />
  );
})


const bookmark = () => {

  
  const { user, isConnected } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [UserLiked , setUserLiked] = useState([]);
  const [isAppReady,setIsAppReady] = useState(false)
  const [UserSaved, setUserSaved] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  console.log("Rendered")

  useEffect(() => {
    setTimeout(() => {
      setIsAppReady(true)
    }, 1000);
  })

  useEffect(() => {
     setFilteredPosts(UserSaved ?? []); 
  },[UserSaved])

  const filterOut = React.useCallback((query) => {
  
  if (!query) {
    setFilteredPosts(UserSaved);
    return;
  }
  const matchedVideos = UserSaved.filter((video) =>
    video?.title?.toLowerCase()?.includes(query.toLowerCase())
  );
  setFilteredPosts(matchedVideos);
}, [UserSaved]);
  
  



 
  
  
  // Load posts from AsyncStorage cache
  const loadCachedPosts = async () => {
    try {
      setIsLoading(true)
   
      const storedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);
      const storedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);

      if(storedSavedPosts) setUserSaved(JSON.parse(storedSavedPosts));

     
      if (storedLikedPosts) setUserLiked(JSON.parse(storedLikedPosts));
      return storedSavedPosts;
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
  
    const fetchedLikedPosts = await getUserLikedVideos(user?.$id);
    const fetchedSavedPosts = await getUserSavedVideos(user?.$id);
    // Update state
   
    setUserLiked(fetchedLikedPosts);
    setUserSaved(fetchedSavedPosts);

  
    const cachedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);
    const cachedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);

    if (cachedSavedPosts !== JSON.stringify(fetchedSavedPosts.slice(0, 10))) {
        await AsyncStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(fetchedSavedPosts.slice(0, 10)));
      }


    if (cachedLikedPosts !== JSON.stringify(fetchedLikedPosts.slice(0, 10))) {
      await AsyncStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(fetchedLikedPosts.slice(0, 10)));
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
     data={filteredPosts}
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
      ListHeaderComponent={<HeaderComponent filterOut={filterOut} />}
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

export default bookmark