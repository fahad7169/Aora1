import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useGlobalContext } from '../../context/GlobalProvider'
import LottieView from 'lottie-react-native'
import { View } from 'react-native'

const AuthLayout = () => {
  const { isLoading, isLoggedIn } = useGlobalContext();

  if(isLoading){
    return   <>
    <View className="w-screen h-screen justify-center items-center bg-[#15141A]">
    <LottieView
   autoPlay
  className='max-w-52 max-h-52 w-4/5 h-4/5'
   // Find more Lottie files at https://lottiefiles.com/featured
   source={require('../../assets/lottie/Loader.json')}
  />

    </View>
    
  </>
  }

  if (isLoggedIn) return <Redirect href="/home" />;
  return (
    <>
    <Stack >
      <Stack.Screen
      name='sign-in'
      options={{ headerShown: false }}
      />
        <Stack.Screen
      name='sign-up'
      options={{ headerShown: false }}
      />
    </Stack>
    <StatusBar 
    backgroundColor="#161622"
    style="light"
    />
    </>
  )
}

export default AuthLayout