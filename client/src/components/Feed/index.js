import { FlatList, View, Platform, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import PostItem from './PostItem'
import Community from '../../screens/Community'
import feedData from '../../dummy-data/feedData'

const Feed = ({ navigation, isCommunityFeed }) => {

    const [imageZoomStatus, setImageZoomStatus] = useState({ id: '', isOpen: false })

    const Posts = () =>
        <FlatList
            data={feedData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
                const { id, user, postedAt, post, photoUrl, likes, comments } = item;
                return <TouchableOpacity onPress={() => navigation.navigate("Post", { id })} activeOpacity={0.7}>
                    <PostItem id={id} user={user} postedAt={postedAt} post={post} photoUrl={photoUrl} likes={likes} comments={comments} imageZoomStatus={imageZoomStatus} setImageZoomStatus={setImageZoomStatus} navigation={navigation} />
                </TouchableOpacity>
            }}
        />

    return (
        <View style={{ flex: 1 }}>
            {Platform.OS == 'web' ?
                <Scrollbars>
                    {isCommunityFeed && <Community />}
                    <Posts />
                </Scrollbars> :
                <Posts />
            }
        </View>
    )
}

export default Feed;
