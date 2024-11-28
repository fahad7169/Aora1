
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react'
import OnBoarding from "../components/OnBoarding";
export default function App() {
  const {isLoggedIn }=useGlobalContext()

  
  if(isLoggedIn) {
    return <Redirect href="/home"/>
  }

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding completion status when component mounts
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      if (!completed) {
        setShowOnboarding(true);
      }
      else{
        router.push('/(auth)/sign-in')
      }
    };
    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    // setShowOnboarding(false);
    router.push('/(auth)/sign-in')
  
  };

    return <>
      { showOnboarding &&
      <OnBoarding onComplete={handleOnboardingComplete}/>
      }
      </>
  
}

