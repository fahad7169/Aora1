import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  GestureDetector,
  Gesture,
  Directions,
} from 'react-native-gesture-handler';

import Animated, {
  FadeIn,
  FadeOut,
  BounceInRight,
  SlideOutLeft,
  BounceOutLeft,
  SlideInRight,
} from 'react-native-reanimated';

const onboardingSteps = [
  {
    icon: 'snowflake',
    title: 'Welcome',
    description: 'Explore videos from around the world',
  },
  {
    icon: 'people-arrows',
    title: 'Share & Engage',
    description: 'Like, comment, and share videos',
  },
  {
    icon: 'book-reader',
    title: 'Get Started',
    description:
      'This app is built with Expo Router, Reanimated, and Gesture Handler. Check out the source code on GitHub to learn more about how it was built.',
  },
];

function OnBoarding({ onComplete }) {
  const [screenIndex, setScreenIndex] = useState(0);

  const data = onboardingSteps[screenIndex];

  const onContinue = () => {
    const isLastScreen = screenIndex === onboardingSteps.length - 1;
    if (isLastScreen) {
      endOnboarding();
    } else {
      setScreenIndex(screenIndex + 1);
    }
  };

 
  const onBack = () => {
    const isFirstScreen = screenIndex === 0;
    if (isFirstScreen) {
      endOnboarding();
    } else {
      setScreenIndex(screenIndex - 1);
    }
  };

  const endOnboarding = () => {
    setScreenIndex(0);
    onComplete();
  };

  const swipes = Gesture.Simultaneous(
   Gesture.Fling().runOnJS(true).direction(Directions.RIGHT).onStart(onBack),
   
   Gesture.Fling().runOnJS(true).direction(Directions.LEFT).onStart(onContinue),
  );

  return (
    
    <SafeAreaView className="justify-center flex-1 bg-[#15141A]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

     

      <GestureDetector gesture={swipes}>
        <View className="p-5 flex-1" key={screenIndex}>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <FontAwesome5
              style={styles.image}
              name={data.icon}
              size={150}
              color="#CEF202"
            />
          </Animated.View>

          <View style={styles.footer}>
            <Animated.Text
              entering={SlideInRight}
              exiting={SlideOutLeft}
              style={styles.title}
            >
              {data.title}
            </Animated.Text>
            <Animated.Text
              entering={SlideInRight.delay(50)}
              exiting={SlideOutLeft}
              style={styles.description}
            >
              {data.description}
            </Animated.Text>

            <View style={styles.buttonsRow}>
              <Text onPress={endOnboarding} style={styles.buttonText}>
                Skip
              </Text>

              <Pressable onPress={onContinue} style={styles.button}>
                <Text style={styles.buttonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </GestureDetector>
      <View style={styles.stepIndicatorContainer}>
        {onboardingSteps.map((step, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              { backgroundColor: index === screenIndex ? '#CEF202' : 'grey' },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

export default OnBoarding;

const styles = StyleSheet.create({
  page: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#15141A',
  },
  pageContent: {
    padding: 20,
    flex: 1,
  },
  image: {
    alignSelf: 'center',
    margin: 20,
    marginTop: 70,
  },
  title: {
    color: '#FDFDFD',
    fontSize: 50,
    fontFamily: 'Inter-Black',
    letterSpacing: 1.3,
    marginVertical: 10,
  },
  description: {
    color: 'gray',
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    lineHeight: 28,
  },
  footer: {
    marginTop: 'auto',
  },

  buttonsRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#302E38',
    borderRadius: 50,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#FDFDFD',
    fontFamily: 'Inter-Semi',
    fontSize: 16,
    padding: 15,
    paddingHorizontal: 25,
  },

  // steps
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 15,
    marginVertical: 7,

  },
  stepIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
});