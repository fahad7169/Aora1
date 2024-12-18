import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import { getUserLikedVideos, getUserSavedVideos, searchPosts } from '../../lib/appwrite'
import VideoCard from '../../components/VideoCard'
import { useLocalSearchParams } from 'expo-router'
import useAppwrite from '../../lib/useAppwrite'
import { useGlobalContext } from '../../context/GlobalProvider'


const Search = () => {
  const [UserLiked , setUserLiked] = useState([]);
  const { user }= useGlobalContext();
  const [UserSaved, setUserSaved] = useState([]);

  useEffect(() => {
    getUserLikedVideos(user?.$id).then((res) => setUserLiked(res))
    getUserSavedVideos(user?.$id).then((res) => setUserSaved(res))
  },[])
  

  const { query }=useLocalSearchParams()

   const {data:posts,isLoading, refetch}=useAppwrite(()=>searchPosts(query));
  
  useEffect(() => {
    
    refetch()
   
  }, [query])

  
  
 
  return (
    <>
    {
    <SafeAreaView className="bg-primary h-full">
     <FlatList
    //  data={[{id:1},{id:2},{id:3}]}
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
      <View className="my-6 px-4">
         
       
              <Text className="font-pmedium text-sm text-gray-100">
                Search Results
              </Text>
              <Text className="text-2xl font-psemibold text-white">
                {query}
              </Text>
              <View className="mt-6 mb-8">
                   
          <SearchInput
          initialQuery={query}
          />
              </View>
        
           
     
         
      </View>
  )}
  ListEmptyComponent={()=>{
    return (<>
    { !isLoading && 
       <EmptyState title="No Videos Found" subtitle="No videos found for this search query" />
    }
   </>
    )
  }}
 
     />
    </SafeAreaView>
}
   </>

  )
}

export default Search