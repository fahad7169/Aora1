import { View, Image } from 'react-native'
import { Tabs } from 'expo-router'
import { icons } from '../../constants'
import { StatusBar } from 'expo-status-bar'


const TabIcon=({icons,color,focused})=>{
  return (
    <View className='items-center justify-center'>
      <Image
      source={icons} 
      resizeMode='contain'
      tintColor={color}
      className='w-6 h-6'
      />
    </View>
  )
}

const TabLayout = () => {
  return (
  <>

  <Tabs 
  screenOptions={
    {
      tabBarShowLabel: false,
      tabBarActiveTintColor: "#FFA001",
      tabBarInactiveTintColor: "#CDCDE0",
      tabBarStyle:{
        backgroundColor: "#15141A",
        borderTopWidth:1,
        borderTopColor: "#232533",
        height:60,
      }
    }
  }
  >
    <Tabs.Screen 
    name="home" 
    options={{
      title: "Home",
      headerShown: false,
      tabBarIcon: ({ color, focused }) => (
        <TabIcon
        icons={icons.home}
        color={color}
        focused={focused}
        />
      )
    }}
    />
     <Tabs.Screen 
    name="bookmark" 
    options={{
      title: "Home",
      headerShown: false,
      tabBarIcon: ({ color, focused }) => (
        <TabIcon
        icons={icons.bookmark}
        color={color}
        focused={focused}
        
        />
      )
    }}
    />
     <Tabs.Screen 
    name="create" 
    options={{
      title: "Create",
      headerShown: false,
      tabBarIcon: ({ color, focused }) => (
        <TabIcon
        icons={icons.plus}
        color={color}
        focused={focused}
        />
      )
    }}
    />
     <Tabs.Screen 
    name="profile" 
    options={{
      title: "Profile",
      headerShown: false,
      tabBarIcon: ({ color, focused }) => (
        <TabIcon
        icons={icons.profile}
        color={color}
        focused={focused}
        />
      )
    }}
    
    />
  </Tabs>
  <StatusBar
           backgroundColor="#161622"
           style="light"
           />

  </>
  )
}

export default TabLayout