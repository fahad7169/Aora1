import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'

import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'

import { TouchableOpacity } from 'react-native'
import { ResizeMode, Video } from 'expo-av'
import { icons } from '../../constants'
import { BarIndicator } from 'react-native-indicators'
import { router } from 'expo-router'
import { createVideo } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const Create = () => {

  const {user}=useGlobalContext();

  const [isUploading, setIsUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: '',
  })

  const openPicker=async(SelectType)=>{

    try{
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: SelectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        aspect: [4, 3],
        quality: 1,
      });

      if(!result.canceled){
          if(SelectType==='image'){
            setForm({...form, thumbnail:result.assets[0]})

          }
          if(SelectType==='video'){
            setForm({...form, video:result.assets[0]})
          }
          
      }
     
    

    }
    catch(error){
    
    }
  }

  const submit=async()=>{
     if(!form.prompt || !form.thumbnail || !form.video || !form.title){
      Alert.alert("Error","Please fill all the fields")
      return;
     }

     setIsUploading(true)

     try{
        await createVideo({
          ...form, userId: user?.$id
        })

        Alert.alert('Success','Video uploaded successfully')
        router.push('/home')
     }
     catch(error){
    
     }
     finally{
      setForm({
        title: '',
        video: null,
        thumbnail: null,
        prompt: '',
      })
      setIsUploading(false)
     }

  }

  return (
    <>
    <SafeAreaView className="bg-[#15141A] h-full ">
     <ScrollView className="px-4 my-6">
          <Text className="text-2xl text-white font-psemibold">Upload Video</Text>
          <FormField
          title="Video Title"
          value={form.title}
          placeholder="Enter Title"
          handleChangeText={(text)=>setForm({...form, title:text})}
          otherStyles="mt-10"
          />
          <View className="mt-5">
            <Text className="text-base text-gray-100 font-pmedium mb-3">
              Upload Video
            </Text>
            <TouchableOpacity onPress={()=>openPicker('video')}>
              {form.video ? (
                <Video
                 source={{uri: form.video.uri}}
                 className="w-full h-64 rounded-2xl"
                 resizeMode={ResizeMode.CONTAIN}
                />
              ):(
                <View className="w-full h-40 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center justify-center">
                 <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                    <Image 
                    source={icons.upload}
                    className="w-6 h-6"
                    resizeMode='contain'
                    />
                 </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        <View className="mt-7 space-y-2">
        <Text className="text-base text-gray-100 font-pmedium mb-3">
              Thumbnail Image
            </Text>

            <TouchableOpacity onPress={()=>openPicker('image')}>
              {form.thumbnail ? (
               <Image
               source={{uri: form.thumbnail.uri}}
               resizeMode='cover'
               className="w-full h-64 rounded-2xl"
               />
              ):(
                <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center justify-center flex-row space-x-2">
                 <Image 
                    source={icons.upload}
                    className="w-6 h-6"
                    resizeMode='contain'
                    />
                    <Text className="text-sm text-gray-100 font-pmedium">
                      Choose a file
                    </Text>
                </View>
              )}
            </TouchableOpacity>
        </View>
        <FormField
          title="AI prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(text)=>setForm({...form, prompt:text})}
          otherStyles="mt-7"
          />
          <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={isUploading}
          />
     </ScrollView>
    </SafeAreaView>
    {isUploading && (
        <View className="absolute inset-0 w-full h-full bg-black/50 justify-center items-center">
          <BarIndicator color="white" />
        </View>
      )}
    </>
  )
}

export default Create