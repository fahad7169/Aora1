import { View, FlatList, TouchableOpacity, ImageBackground, Image, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import * as Animatable from 'react-native-animatable'
import { icons } from '../constants'
import { Video, ResizeMode } from 'expo-av'
import { BallIndicator } from 'react-native-indicators'
import { useIsFocused } from '@react-navigation/native'
import SkeletonPlaceholder from '../lib/suspense'

const zoomIn={
  0:{
      scale:0.9
  },
  1:{
    
      scale:1.05
  }
}
const zoomOut={
  0:{
      scale:1
  },
  1:{
      scale:0.9
  }
}


const TrendingItem = ({ isFocusedItem, post,activeItem }) => {
  const [play, setPlay] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const isFocused = useIsFocused();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && !isFocused) {
      videoRef.current.pauseAsync(); // Pause when the screen is not focused
    }
  }, [isFocused]);

  return (
    <Animatable.View
    animation={activeItem === post?.$id ? zoomIn : zoomOut}
    delay={100}
    className="mr-5"
    >
      {play ? (
        <>
          <Video
            ref={videoRef}
            source={{ uri: post?.video }}
            className="w-52 h-72 rounded-[35px] mt-3 bg-white/10 relative"
            resizeMode={ResizeMode.COVER}
            useNativeControls
            shouldPlay={isFocusedItem}
            onLoadStart={() => setIsVideoLoading(true)}
            onReadyForDisplay={() => setIsVideoLoading(false)}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                setPlay(false);
              }
            }}
          />
          {isVideoLoading && (
            <BallIndicator
              className="absolute top-[40%] left-[40%]"
              color="white"
              size={40}
            />
          )}
        </>
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => {
            setPlay(true);
          }}
        >
          <ImageBackground
            source={{ uri: post?.thumbnail }}
            className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-10 h-10 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = React.memo(({posts, isLoading}) => {

  const [activeItem, setActiveItem] = useState(posts[1])
  const [componentReady, setComponentReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setComponentReady(true);
    }, 1000);
  }, []);

  const dotRefs = useRef(
    Array(4)
      .fill()
      .map(() => ({
        color: new Animated.Value(0),
        width: new Animated.Value(10),
      }))
  );
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef=useRef(null)

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentIndex = posts.findIndex((post) => post?.$id === viewableItems[0].key);
      animateDotChange(currentIndex);
      setActiveItem(viewableItems[0].key);
    }
  };

  // useEffect(()=>{
  //   const interval=setInterval(() => {
      
  //     setActiveIndex((prevIndex)=>{
  //       const nextIndex=(prevIndex+1)%posts.length;
  //       flatListRef.current.scrollToOffset({
  //         offset: nextIndex * 180, // Adjust to match your item width + margin
  //         animated: true,
  //       });
  //       return nextIndex;
  //     })


  //   }, 2000)
  //   return ()=> clearInterval(interval)
  // },[posts.length])

  const animateDotChange = (index) => {
    dotRefs.current.forEach((dot, i) => {
      Animated.timing(dot.color, {
        toValue: i === index % 4 ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(dot.width, {
        toValue: i === index % 4 ? 30 : 10,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };


  useEffect(() => {
    animateDotChange(0); // Initial animation for the first item
  }, []);
  
return (
  <>
 <FlatList
 ref={flatListRef}
 data={posts}
 keyExtractor={(item)=>item?.$id}
 renderItem={({item,index})=>(
  <>
  {
    (!componentReady || isLoading) ? (
      <View className="flex-1 justify-center items-center p-4 space-y-3 rounded-[35px]">
       <SkeletonPlaceholder width={208} height={288} borderRadius={35}/>
       </View>
    ):
    <TrendingItem 
    isFocusedItem={index === activeIndex} 
    activeItem={activeItem}
    post={item} />
  }
  </>
 )}
 onViewableItemsChanged={viewableItemsChanged}
 viewabilityConfig={{
     itemVisiblePercentThreshold:70
 }}
 contentOffset={{x:170}}
 horizontal
 showsHorizontalScrollIndicator={false}
 />
 {
 posts ?(
 <View className="flex-row justify-center">
 {dotRefs.current.map((dot, i) => (
  <Animated.View
    key={i}
    style={{
      width: dot.width, // Animate width
      height: 10,
      borderRadius: 5,
      backgroundColor: dot.color.interpolate({
        inputRange: [0, 1],
        outputRange: ['#555', '#FFA500'],
      }),
      marginHorizontal: 5,
    }}
  />
))}
     </View>
 ):(
  <View>
    
  </View>
 )
}
 </>
)
}
)
export default Trending