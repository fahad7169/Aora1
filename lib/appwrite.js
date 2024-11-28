import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';


export const config = {
  endpoint: process.env.APPWRITE_ENDPOINT,
  platform: process.env.APPWRITE_PLATEFORM,
  projectId: process.env.APPWRITE_PROJECT_ID,
  databaseId: process.env.APPWRITE_DATABASE_ID,
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.APPWRITE_VIDEO_COLLECTION_ID,
  storageId: process.env.APPWRITE_STORAGE_ID,
  likesCollectionId: process.env.APPWRITE_LIKES_COLLECTION_ID,
  commentsCollectionId: process.env.APPWRITE_COMMENTS_COLLECTION_ID,
  savedVideosCollectionId:process.env.APPWRITE_SAVEDVIDEOS_COLLECTION_ID
};

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    likesCollectionId,
    commentsCollectionId,
    storageId,
    savedVideosCollectionId
}=config

// Init your React Native SDK
const client = new Client();
const avatars=new Avatars(client)

client
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform) // Your application ID or bundle ID.
;
const account = new Account(client);
const databases=new Databases(client)
const storage=new Storage(client)

export const createUser = async(email, password, username) =>{


  try {
      const newAccount=await account.create(
        ID.unique(),
        email,
        password,
        username
      )

      if(!newAccount) return

      const avatarUrl=avatars.getInitials(username)

      await signIn(email,password)

      const newUser=await databases.createDocument(
        databaseId,
        userCollectionId,
        ID.unique(),
        {
          accountId:newAccount?.$id,
          email,
          username,
          avatar:avatarUrl
        }
      )
      return newUser
  }
  catch(error){
    console.log(error)
   
  }
}

export const signIn=async(email, password)=> {
    try{
        const newSession=await account.createEmailPasswordSession(email,password)
        return newSession
    }
    catch(error){
       throw new Error
    }
}
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
   
  }
}

export const getCurrentUser=async()=>{
  try{
    const user=await getAccount()
    if(!user)  return
    const currentUser=await databases.listDocuments(
        config.databaseId, 
        config.userCollectionId, 
          [Query.equal("accountId", user?.$id)]
        )
    
    if(!currentUser) return
    return currentUser.documents[0]
  }
  catch(error){
   
  }
}

export const getAllPosts=async()=>{
  try{
    const posts=await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt')]
    )
    if(!posts)  return
    return posts.documents
  }
  catch(error){
   throw new Error
  }
}

export const getLatestPosts=async()=>{
  try{
    const posts=await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt'),Query.limit(4)]
    )
    if(!posts) return
    return posts.documents
  }
  catch(error){
    throw new Error
  }
}
export const searchPosts=async(query)=>{
  try{
    const posts=await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.search('title',query)]
    )
    if(!posts)  return
    return posts.documents
  }
  catch(error){
   throw new Error
  }
}

export const getUserPosts=async(userId)=>{
  try{
    const posts=await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.equal('creator',userId), Query.orderDesc('$createdAt')]
    )
    if(!posts) return
    return posts.documents
  }
  catch(error){
   
  }
}

export const signOut=async ()=>{
  try {
    const session=await account.deleteSession('current');
    return session
  } catch (error) {
    console.log(Error,error.message)
  }
}

export const getFilePreview=async(fileId, type)=>{
  let fileUrl;
 
  try {
    
    if(type==='video'){
    fileUrl=storage.getFileView(storageId,fileId)
    }
    else if(type==='image'){
      fileUrl=storage.getFileView(storageId,fileId)
    }
    else{
      throw new Error('Invalid file type')
    }

    if(!fileUrl) throw Error;
 
    return fileUrl;
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile=async(file,type)=>{
  if(!file) return;
  
  const { mimeType, ...rest }=file;
  const asset={
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  }

 

  try {
    const uploadedFile=await storage.createFile(
      storageId,
      ID.unique(),
      asset
    )
  

    const fileUrl=await getFilePreview(uploadedFile?.$id, type)
    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const createVideo=async(form)=>{
  try{
    const [thumbnailUrl,videoUrl]=await Promise.all([
      uploadFile(form.thumbnail,'image'),
      uploadFile(form.video,'video'),
    ])

    const newPost= await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId
      }
    )
  
    return newPost;
  }
  catch(error){
    throw new Error(error)
  }
}


export const updateLikes = async (userId, videoId) => {
    try {
    
      // Step 1: Check if the user has already liked the video
      const like = await databases.listDocuments( databaseId,
        likesCollectionId, [
        Query.equal('userId', userId),
        Query.equal('videoId', videoId)
      ]);
  
      // Step 2: If like exists, delete it
      if (like.documents.length > 0) {
        const likeDocId = like.documents[0]?.$id;
        await databases.deleteDocument(
          config.databaseId,
          config.likesCollectionId,
          likeDocId,
        );
       
      } else {
        // Step 3: If like doesn't exist, create a new one
        const newLike = await databases.createDocument(
        databaseId,
        likesCollectionId,
        ID.unique(),
          {
            userId: userId,
            videoId: videoId,
           
          }
        );
       
      }
    } catch (error) {
      console.error('Error updating/creating like:', error);
    }
  };

export const countLikes = async (videoId) => {
    try {
      const like = await databases.listDocuments( databaseId,
        likesCollectionId, [
        Query.equal('videoId', videoId)
      ]);
     
     
      return like.documents.length;

    } catch (error) {
      console.error('Error counting likes:', error);
      return 0;
    }
  };

export const getUserLikedVideos = async (userId) => {
 
    try {
      const like = await databases.listDocuments( databaseId,
        likesCollectionId, [
        Query.equal('userId', userId)
      ]);
      if(!like) null;
    const videoIds=like.documents.map(doc=>doc?.videoId)
 
    return videoIds

    } catch (error) {
      console.error('Error getting user liked videos:', error);
      return [];
    }
  };

export const addCommentToDatabase=async({title,userId,videoId})=>{
  try {
    const newComment=await databases.createDocument(
      databaseId,
      commentsCollectionId,
      ID.unique(),
      {
        title:title,
        userId:userId,
        videoId:videoId
      }
    )
    return newComment
  } catch (error) {
    console.log(Error, error.message)
  }
}

export const getCommentsFromDatabase = async (videoId ) => {
  try {
    const comments = await databases.listDocuments(
      databaseId,
      commentsCollectionId,
      [Query.equal("videoId", videoId)]
    );

    if (!comments || !comments.documents.length) return [];

   

    // Extract userIds and create mapping for comments
    const userIds = comments.documents.map((doc) => doc?.userId);

    
    // Combine comment data with user details
    const result = comments.documents.map((comment, index) => {
    
      const user= userIds[index]
      return {
        title: comment.title,
        username: user?.username || "Unknown",
        avatar: user?.avatar || null,
        commentId: comment?.$id,
      };
    });

    return result;
  } catch (error) {
    console.log("Error:", error.message);
    return [];
  }
};

export const countComments = async (videoId) => {
  try {
    const comments = await databases.listDocuments(
      databaseId,
      commentsCollectionId,
      [Query.equal("videoId", videoId)]
    );
    

    return comments.documents.length;
  } catch (error) {
    console.log("Error:", error.message);
    return 0;
  }
};

export const saveVideo=async({videoId,userId})=>{
   try{
   
      const savedPost=await databases.listDocuments(
        databaseId,
        savedVideosCollectionId,
        [
          Query.equal('userId',userId),
          Query.equal('videoId',videoId)
        ]
      )

      if(savedPost.documents.length>0){
        await databases.deleteDocument(
          databaseId,
          savedVideosCollectionId,
          savedPost.documents[0]?.$id
        )
      }
      else{
        await databases.createDocument(
          databaseId,
          savedVideosCollectionId,
          ID.unique(),
          {
            videoId:videoId,
            userId:userId
          }
        )
      }
   }
   catch(error){
        console.log(Error, error.message)
   }
}

export const getUserSavedVideos=async(userId)=>{
  try{
   
    const savedPosts=await databases.listDocuments(
      databaseId,
      savedVideosCollectionId,
      [
        Query.equal('userId',userId)
      ]
    )
    const videoIds=savedPosts.documents.map(doc=>doc?.videoId)
    return videoIds
  }
  catch(error){
    console.log(Error, error.message)
  }
}
