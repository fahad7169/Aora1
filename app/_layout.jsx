import React, { useEffect, useState } from 'react'
import { SplashScreen ,Stack  } from 'expo-router'
import { useFonts } from 'expo-font'
import { GlobalProvider } from '../context/GlobalProvider'
import Toast from 'react-native-toast-message'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LottieView from 'lottie-react-native'

SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  const [appReady, setAppReady] = useState(false)

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"), // Add Inter font files here
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-Semi": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Black": require("../assets/fonts/Inter-Black.ttf"),
    
  });

  useEffect(() => {

if(error) throw new Error(error)

if(fontsLoaded || error) {
    SplashScreen.hideAsync()
    setAppReady(true)
  }
  }, [fontsLoaded,error])

  if (!appReady) {
    return(
      <>
        <View className="w-screen h-screen justify-center items-center bg-[#15141A]">
        <LottieView
       autoPlay
      className='max-w-52 max-h-52 w-4/5 h-4/5'
       // Find more Lottie files at https://lottiefiles.com/featured
       source={require('../assets/lottie/Loader.json')}
      />

        </View>
        
      </>
    )
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <GlobalProvider>
      
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      <Stack.Screen name="search/[query]" options={{ headerShown: false }}/>
    </Stack>
   <Toast position='bottom' bottomOffset={70} />
    </GlobalProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout

