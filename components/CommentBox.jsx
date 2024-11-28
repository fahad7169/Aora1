import { memo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
} from 'react-native';

const CommentBox = ({comments}) => {
 


  const renderItem = ({ item }) => (
    <View className="flex-row items-center space-y-2 mb-4">
      <Image
        source={{ uri: item?.avatar }}
        style={{ width: 40, height: 40 }}
        className="rounded-full"
      />
      <View className="max-w-[90%] ml-2">
        <Text className="text-white text-sm font-psemibold">{item?.username ?? ""}</Text>
        <Text className="text-white font-pregular whitespace-normal break-all mr-4">
          {item?.title ?? ""}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <View className="flex-1 max-h-[65vh] h-[65vh]">
        {/* Comment List Section */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.commentId}
          renderItem={renderItem}
          // contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag" // Dismiss keyboard when scrolling
          keyboardShouldPersistTaps="always" // Prevent keyboard from dismissing when tapping inside the list

        />
      </View>
     
       

   
    </>
  );
};

export default memo(CommentBox);
