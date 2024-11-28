import { View, Modal, TextInput, Image, TouchableWithoutFeedback, ScrollView, Text, } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { InstagramLoader } from 'react-native-easy-content-loader';
import CommentBox from "./CommentBox"
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addCommentToDatabase, getCommentsFromDatabase } from '../lib/appwrite';

const Comments = ({isModalVisible, toggleModal,user,videoId}) => {

  


 
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentReady, setComponentReady] = useState(false);

  useEffect(() => {
      
      setTimeout(() => {
        setComponentReady(true);
      }, 1500);
 
  },[])
  useEffect(()=>{
       setIsLoading(true)
      if(videoId) {
        getCommentsFromDatabase(videoId).then((comments)=>{
          setComments(comments)
         
        }).catch((error)=>console.log(error))
      }
       setIsLoading(false)
  },[])
  const [comments, setComments] = useState([]);

  const [input, setInput] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setComponentReady(true);
    }, 1000);
  }, []);
 

  const onTextChange = (text) => {
    if (typeof text === 'string') setInput(text);
  };

  const addComment = async () => {
    if (input.trim() === '') return; // Don't add empty comments
    
    const newComment = {
      title: input,
      username: user?.username || 'current_user',
      avatar: user?.avatar || 'https://example.com/default-avatar.png',
      commentId: (comments.length + 1).toString(),

    };
    setComments([newComment, ...comments]);
    setInput(''); // Clear input field
  
    await addCommentToDatabase({title:newComment.title,userId:user?.$id,videoId:videoId})
  };
  



  // Shared value for the Y-axis position
  const slideAnim = useSharedValue(1000);

  useEffect(() => {
    // Animate slideAnim with timing based on modal visibility
    slideAnim.value = isModalVisible 
      ? withTiming(0, { duration: 50, easing: Easing.out(Easing.ease) }) // Show with custom timing
      : withTiming(1000, { duration: 150, easing: Easing.in(Easing.ease) }); // Hide with custom timing
  }, [isModalVisible]);

  return isModalVisible ? (
    <Modal
      visible={isModalVisible}
      animationType="none"
      transparent
      onRequestClose={toggleModal}
      
    >
           <TouchableWithoutFeedback onPress={toggleModal}>
        <View className="flex-1 bg-[#00000033]">
       
         </View>
         </TouchableWithoutFeedback>
            <Animated.View style={[{ position: 'absolute', bottom: 0, width: '100%' }, { transform: [{ translateY: slideAnim }] }]}>
           
              <View className="bg-[#32393d] rounded-t-3xl p-4  w-full">
              { (isLoading || !isComponentReady) ? (
                <ScrollView showsVerticalScrollIndicator={false} 
                className="max-h-[65vh]"
                >
             <View className="flex-1 space-y-3">
  
            {Array.from({ length: 10 }).map((_, index) => (
          <InstagramLoader
            key={index}
            active
            imageHeight={0}
            aSize={50}
            primaryColor="#aaaaaa"
            secondaryColor="#444444"
         
            animationDuration={1000}
           />
           ))}
              </View>
              </ScrollView>
          ) :
          comments.length > 0 ? (
            <View>
            <CommentBox 
         
            comments={comments}
            />
          </View>
          ) : (
            <View className="flex-1 items-center justify-center h-[65vh]">
                    <Text className="text-white text-lg">
                      No comments to show
                    </Text>
              </View>
          )
       
  
              
}
         <View className="flex-row items-center pt-2 border-t border-gray-600">
          <Image
            source={{ uri: user?.avatar || 'https://example.com/default-avatar.png' }}
            style={{ width: 40, height: 40 }}
            className="rounded-full"
          />
          <TextInput
            value={input}
            placeholder="Add a comment..."
            placeholderTextColor="#aaa"
            className="flex-1 h-12 rounded-3xl px-4 py-2 text-white text-base "
            multiline
            onChangeText={onTextChange}
          />
          {input?.trim()?.length > 0 && (
            <TouchableOpacity onPress={addComment} className="ml-3">
              <Ionicons name="send" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          )}
        </View>
              </View>
            </Animated.View>
       

      
     
    </Modal>
  )
  : null
};

export default memo(Comments);
