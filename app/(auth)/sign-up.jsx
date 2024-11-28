import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'

import { images } from '../../constants'
import FormField from '../../components/FormField'
import { Link, router } from 'expo-router'
import { createUser } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { BarIndicator } from 'react-native-indicators'

const SignUp = () => {

  const [form, setForm] = useState({
    username:'',
    email:'',
    password: ''
  })
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const submit=async()=>{
    if(!form.email || !form.password || !form.username){
      Alert.alert("Error","Please fill all the fields")
    }
    setIsSubmitting(true)
    try{
    
      const result=await createUser(form.email,form.password,form.username)
      setUser(result)
      setIsLoggedIn(true)
      router.replace("/home")
    }
    catch(error){
     
  }
  finally{
    setIsSubmitting(false)
  }
}

  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <>
    <SafeAreaView className="bg-[#15141A] h-full">
    <ScrollView>
      <View className="w-full justify-center min-h-[80vh] my-6 px-4">
        <Image
        source={images.logo}
        resizeMode='contain'
        className="w-[115px] h-[35px]"
        />
        <Text className='text-2xl mt-10 text-semibold font-psemibold text-white'>Sign up</Text>
        <FormField
        title="Username"
        value={form.username}
        handleChangeText={(e)=>setForm({...form,username:e})}
        otherStyles="mt-7"
        placeholder={"Enter your username"}
        />
        <FormField
        title="Email"
        value={form.email}
        handleChangeText={(e)=>setForm({...form,email:e})}
        otherStyles="mt-7"
        keyboardType="email-address"
        placeholder={"Enter your email"}
        />
          <FormField
        title="Password"
        value={form.password}
        handleChangeText={(e)=>setForm({...form,password:e})}
        otherStyles="mt-7"
        placeholder={"Enter your password"}
        />
        <CustomButton
        title="Sign Up"
        handlePress={submit}
        containerStyles="w-full mt-10"
        isLoading={isSubmitting}
        />
        <View className='justify-center pt-5 flex-row gap-2'>
          <Text className='text-gray-100 text-lg font-pregular'>Already have an account?</Text>
          <Link href={"sign-in"} className='text-secondary text-lg font-psemibold'>Sign In</Link>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
    {isSubmitting && (
        <View className="absolute inset-0 w-full h-full bg-black/50 justify-center items-center">
          <BarIndicator color="white" />
        </View>
      )}
    </>
  )
}

export default SignUp