import { View, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import EmptyState from '../../components/EmptyState'
import { getUserLikedVideos, getUserPosts, getUserSavedVideos, signOut } from '../../lib/appwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import { TouchableOpacity } from 'react-native'
import { Image } from 'react-native'
import { icons } from '../../constants'
import { BarIndicator } from 'react-native-indicators'
import { StatusBar } from 'expo-status-bar'
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY_POSTS = '@userPosts';
const STORAGE_KEY_LIKED = 'cached_liked_posts';
const STORAGE_KEY_SAVED = 'cached_saved_posts';

const Profile = () => {
  const { user, setUser, setIsLoggedIn, isConnected }= useGlobalContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [UserLiked , setUserLiked] = useState([]);
  const [UserSaved, setUserSaved] = useState([]);

  const fetchData=async ()=>{
    if(isConnected){
      try{
        setIsLoading(true);
        const fetchedPosts=await getUserPosts(user?.$id);
        const fetchedLikedPosts = await getUserLikedVideos(user?.$id);
        const fetchedSavedPosts = await getUserSavedVideos(user?.$id);

        
        setPosts(fetchedPosts);
        setUserLiked(fetchedLikedPosts);
        setUserSaved(fetchedSavedPosts);

        const storedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);

        if(storedLikedPosts !== JSON.stringify(fetchedLikedPosts?.slice(0,10))){
          await AsyncStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(fetchedLikedPosts?.slice(0,10)));
        }

        const storedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);

        if(storedSavedPosts !== JSON.stringify(fetchedSavedPosts?.slice(0,10))){
          await AsyncStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(fetchedSavedPosts?.slice(0,10)));
        }
        
        const storedPosts=await AsyncStorage.getItem(STORAGE_KEY_POSTS);
        if(storedPosts !== JSON.stringify(fetchedPosts?.slice(0,10))){
          await AsyncStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(fetchedPosts?.slice(0,10)));
        }
      }
      catch(error){
       
      }
      finally{
        setIsLoading(false);
      }
    }
    else{
        try{
          setIsLoading(true);
          const storedPosts=await AsyncStorage.getItem(STORAGE_KEY_POSTS);
          if(storedPosts) setPosts(JSON.parse(storedPosts));

          const storedLikedPosts = await AsyncStorage.getItem(STORAGE_KEY_LIKED);

          if(storedLikedPosts) setUserLiked(JSON.parse(storedLikedPosts));

          const storedSavedPosts = await AsyncStorage.getItem(STORAGE_KEY_SAVED);

          if(storedSavedPosts) setUserSaved(JSON.parse(storedSavedPosts));
        }
        catch(error){
       
        }
        finally{
          setIsLoading(false);
        }
    }
  }

  useEffect(()=>{
    fetchData();
  },[isConnected])

  

   const logout=async ()=>{
    try{

      setIsLoggingOut(true);
          await signOut();
         
          setIsLoggedIn(false);
          setUser(null);
          router.replace("/sign-in");
          await AsyncStorage.multiRemove(["user","isLoggedIn",STORAGE_KEY_POSTS,"cached_posts","cached_latest_posts",STORAGE_KEY_LIKED,STORAGE_KEY_SAVED]);
          
    }
    catch(error){
      Alert.alert(error);

    }
    finally{
      setIsLoggingOut(false)
    }
   }
   const confrim=()=>{
    Alert.alert("Logout","Are you sure you want to logout?",[
      {
        text:"Cancel",
        onPress:()=>{}
      },
      {
        text:"Confirm",
        onPress:logout
      }
    ])
   }
  

 
  return (<>
  {isLoading ? (
    <BarIndicator className="bg-[#15141A]" color="white" size={40} />
  ):(
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
     <View className="w-full justify-center items-center mt-6 mb-12 px-4">
        <TouchableOpacity
        className="w-full items-end mb-10"
        onPress={confrim}
        disabled={isLoggingOut}
        >
         <Image
         source={icons.logout}
         resizeMode='contain'
         className="w-6 h-6"
         />
        </TouchableOpacity>
        <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
          <Image
          source={{uri: user?.avatar}}
          className="w-[90%] h-[90%] rounded-lg"
          resizeMode='cover'
          />
        </View>
        <InfoBox
         title={user?.username}
         containerStyles="mt-5"
         titleStyles="text-lg"
        />

        <View className="mt-5 flex-row">
        <InfoBox
         title={posts?.length || 0}
         subtitle="Posts"
         containerStyles="mr-10"
         titleStyles="text-xl"
        />
          <InfoBox
         title="0"
         subtitle="Followers"
         titleStyles="text-xl"
        />
        </View>
     </View>
  )}
  ListEmptyComponent={()=>{
    return <EmptyState
    title="No Videos Found"
    subtitle="No videos found for this search query"
    />
  }}
 
     />
    <StatusBar
           backgroundColor="#161622"
           style="light"
      />
    </SafeAreaView>
  )
  
}
{isLoggingOut && (
        <View className="absolute inset-0 w-full h-full bg-black/50 justify-center items-center">
          <BarIndicator color="white" />
        </View>
      )}
  </>
  )
}

export default Profile