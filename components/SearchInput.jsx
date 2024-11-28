import { View, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'

import { icons } from '../constants'
import { router, usePathname } from 'expo-router'

const SearchInput = ({initialQuery,screenname}) => {
   const pathName=usePathname()

   const [query, setQuery] = useState(initialQuery || '')
  return (
    
      <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
        <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder={screenname=='home' ? "Search for a video topic": "Search your saved Videos" }
        placeholderTextColor="#CDCDE0"
        onChangeText={(e)=>setQuery(e)}
        returnKeyType='search'
        onSubmitEditing={()=>{
          if(!query) return Alert.alert('Missing Query',"Please input something to search")

            if(pathName.startsWith('/search')) router.setParams({query})
              else router.push(`/search/${query}`)
        }}
        />
        <TouchableOpacity
        onPress={()=>{
          if(!query) return Alert.alert('Missing Query',"Please input something to search")

            if(pathName.startsWith('/search')) router.setParams({query})
              else router.push(`/search/${query}`)
        }}
        >
            <Image
            source={icons.search}
            className="w-6 h-6"
            resizeMode='contain'
            />
        </TouchableOpacity>
      </View>
  )
}

export default SearchInput