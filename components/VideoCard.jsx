import { View, Text, Image, TouchableOpacity  } from 'react-native'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { icons } from '../constants'
import { ResizeMode, Video } from 'expo-av'
import { BallIndicator } from 'react-native-indicators'
import { useIsFocused } from '@react-navigation/native'
import { InstagramLoader } from 'react-native-easy-content-loader'
import { FontAwesome } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Comments from './Comments'
import { countComments, countLikes, saveVideo, updateLikes } from '../lib/appwrite'


const VideoCard = ({video:{ title, thumbnail, video, $id , creator: { username, avatar } },isLoading,user,likedVideos,savedVideos}) => {
   
  
  const [play, setPlay] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const isFocused = useIsFocused();
  const videoRef = useRef(null);
  const [playbackActive, setPlaybackActive] = useState(true);
  const [ isModalVisible, setModalVisible ]  = useState(false);
  const [likesCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [totalComments,setTotalComments]= useState(0)
 



  useEffect(() => {
    
    if(likedVideos.includes($id)){
     
      setLiked(true)
    }
    else{
      setLiked(false)
    }
  },[likedVideos])


  useEffect(() => {
    
    setSaved(savedVideos.some(video => video?.$id === $id));
  }, [savedVideos]);

  useEffect(() => {
    countComments($id).then((res) => setTotalComments(res))
  },[])

  const scale = useSharedValue(1);
  const scale2=useSharedValue(1)
  const [componentReady, setComponentReady] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setComponentReady(true);
    }, 1000);
  }, [isLoading]);

  useEffect(() => { 
    
    countLikes($id).then(res => setLikeCount(res))
   
  }, [])

  const updateLike=async() => {
    if (!liked) {
      setLikeCount(prev => prev + 1);
    }
    else {
     if (likesCount > 0) {
        setLikeCount(prev => prev - 1);
      }
    }

    setTimeout(async () => {
      await updateLikes(user?.$id, $id)
    }, 5000);
    
  }

  const toggleModal = useCallback(() => {
    setModalVisible(prev => !prev);
  },[])

  const toggleSave = async() => {
    setSaved(!saved);
    if(!saved){
      savedVideos.push($id)
    
        scale2.value = withSpring(1.2, { damping: 10, stiffness: 120 }, () => {
          scale2.value = withSpring(1);  // Return to normal size
        });
      
    }
    else{
      savedVideos.splice(savedVideos.indexOf($id), 1)
    }
    setTimeout(async() => {
      await saveVideo({videoId:$id,userId:user?.$id})
    }, 2000);
  }


    const toggleLike =() => {
    setLiked(!liked);
    updateLike()
    // Trigger the pop-out animation when liked
    if (!liked) {
      likedVideos.push($id)
      scale.value = withSpring(1.4, { damping: 10, stiffness: 120 }, () => {
        scale.value = withSpring(1);  // Return to normal size
      });
    }
    else{
      likedVideos.splice(likedVideos.indexOf($id), 1)
    }
  }
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
  }));

  useEffect(() => {
    if (videoRef.current && !isFocused) {
      videoRef.current.pauseAsync(); // Pause when the screen is not focused
    }
  }, [isFocused]);
   
return (
  <>
  { (!componentReady || isLoading) ? (
    
   <View className="flex-col justify-center items-center p-4 space-y-3">
  
    <InstagramLoader 
    active
     primaryColor="#aaaaaa" 
    secondaryColor="#444444"
    animationDuration={1000}
    />

     </View>
      
  ):(
    <>
  <View className="flex-col items-center px-4 relative">

      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
           <View className="w-[46px] h-[46px] justify-center items-center p-0.5">
             <Image
              source={{uri: avatar}}
              className="w-full h-full rounded-lg"
              resizeMode='cover'
             />
           </View>
           <View className="justify-center flex-1 ml-3 gap-y-1">
               <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                  {title || ""}
               </Text>
               <Text className="text-gray-100 font-pregular text-xs" numberOfLines={1}>
                  {username}
               </Text>
           </View>
        </View>
      
      </View>
      {play ? (
      <>
      
           <Video
           ref={videoRef}
           source={{uri: video }}
           className="w-full h-60 rounded-xl mt-3 relative mb-4"
           resizeMode={ResizeMode.COVER}
           useNativeControls
           shouldPlay={playbackActive}
           onLoadStart={()=>setIsVideoLoading(true)}
           onReadyForDisplay={()=>setIsVideoLoading(false)}
           onPlaybackStatusUpdate={(status)=>{
           if(status.didJustFinish){
               setPlay(false)
           }
           }
           }/>
           {isVideoLoading && <BallIndicator className="absolute top-1/2" color="white" size={40} />}
           </>
      ):(
          <TouchableOpacity
          className="w-full h-60 flex-col justify-center mt-3 items-center relative"
          activeOpacity={0.7}
          onPress={()=>{
            setPlay(true)
          }}
          >
              <Image
              source={{uri: thumbnail}}
              className="w-full h-[210px] rounded-2xl"
              resizeMode='cover'
              />
              <Image
              source={icons.play}
              className="w-10 h-10 absolute"
              resizeMode='contain'
              />
          </TouchableOpacity>
      )}
   
  </View>

     <View className="flex-row justify-between mx-8 items-center mb-14">

     {/* Like Button */}
     <View className="flex justify-center items-center">
    <TouchableOpacity onPress={toggleLike}>
      <Animated.View
        style={animatedStyle}
        className={`rounded-full `}
      >
        <FontAwesome name={`${liked ? 'heart' : 'heart-o'}`} color={liked ? 'red' : 'white'} size={23} />
      </Animated.View>
    </TouchableOpacity>
    <Text className="text-white mt-1 text-sm">{likesCount}</Text>
  </View>

   {/* Comment Button */}
   <View>
     <TouchableOpacity 
     onPress={toggleModal}
     className="flex justify-center items-center px-4"
     >
     <FontAwesome name="comment-o" size={23} color="white" />
     <Text className="text-white mt-1 text-sm">{totalComments}</Text>
   </TouchableOpacity>
    {isModalVisible && (
       <Comments
       isModalVisible={isModalVisible}
       toggleModal={toggleModal}
       user={user}
       videoId={$id}
       />
    )}
   </View>

   {/* Save Button */}
    <View className="flex justify-center items-center">
     <TouchableOpacity onPress={toggleSave}>
     <Animated.View
        style={animatedStyle2}
        className={`rounded-full `}
      >
     <FontAwesome name={`${saved ? 'bookmark' : 'bookmark-o'}`} size={23} color="white" />
     </Animated.View>
   </TouchableOpacity>
     <Text className="text-white mt-1 text-sm">Save</Text>
   </View>
   

   </View>
   
  
  </>
  )
}
  </>
)}



export default memo(VideoCard)

