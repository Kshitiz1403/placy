import { StyleSheet, Text, View, Image, TouchableOpacity, Platform, Modal } from 'react-native'
import React from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import colors from '../../theme/colors'
import ImageViewer from 'react-native-image-zoom-viewer'

const PostItem = ({ id, user, postedAt, post, photoUrl, likes, comments, imageZoomStatus, setImageZoomStatus, isShownInDiscover = true, navigation }) => {

    const openModal = () =>
        setImageZoomStatus({ id: id, isOpen: true })


    const closeModal = () =>
        setImageZoomStatus(prev => ({ ...prev, isOpen: false }))

    const handleCommentPress = () =>
        navigation.navigate("Post")

    const isModalVisible = (imageZoomStatus.id == id && imageZoomStatus.isOpen)

    return <View style={{ ...postStyles.container, backgroundColor: isShownInDiscover ? '#fff' : 'none' }}>
        <View style={postStyles.headerContainer}>
            <Image style={postStyles.profilePhoto} source={{ uri: user.profilePhotoUrl }} />
            <View style={postStyles.infoContainer}>
                <Text style={{ fontSize: 16, margin: 0, padding: 0, color: '#0f0f0f' }}>{user.username}</Text>
                <Text style={{ fontSize: 11, ...margin(4, 0, 0, 0), padding: 0, color: colors.tertiary }}>{postedAt}</Text>
            </View>
            <TouchableOpacity style={postStyles.PostOptions}>
                <Entypo name="dots-three-horizontal" size={16} color={colors.secondary} />
            </TouchableOpacity>
        </View>
        <View style={postStyles.post}>
            <Text>{post}</Text>
            <TouchableOpacity onPress={openModal}>
                <Image style={postStyles.image} source={{ uri: photoUrl }} />
            </TouchableOpacity>
            <Modal visible={isModalVisible} transparent={true} onRequestClose={closeModal}>
                <ImageViewer
                    imageUrls={[{ url: photoUrl }]}
                    onShowModal={openModal}
                    onCancel={closeModal}
                    enableSwipeDown={true}
                    saveToLocalByLongPress={false}
                    renderIndicator={() => <View style={zoomedImageStyles.headerContainer}><Text style={zoomedImageStyles.text}>{user.username}</Text></View>}
                    renderFooter={() => <View><Text style={zoomedImageStyles.text}>{post}</Text></View>}
                    menus={() => null}
                />
            </Modal>
            <View style={postStyles.details}>
                <View style={postStyles.likes}>
                    <TouchableOpacity>
                        <Ionicons name="ios-heart-outline" size={24} color={colors.secondary} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 11, ...margin(0, 0, 0, 8), padding: 0, color: '#0f0f0f' }}>{likes}</Text>
                </View>
                {isShownInDiscover && <View style={postStyles.comments}>
                    <TouchableOpacity onPress={handleCommentPress}>
                        <Ionicons name="ios-chatbox-outline" size={24} color={colors.secondary} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 11, ...margin(0, 0, 0, 8), padding: 0, color: '#0f0f0f' }}>{comments}</Text>
                </View>}
            </View>
        </View>
    </View>

}

export default PostItem

const margin = (a, b, c, d) => ({
    marginTop: a,
    marginRight: b ?? a,
    marginBottom: c ?? a,
    marginLeft: d ?? b ?? a,
})

const postStyles = StyleSheet.create({
    Container: {
        flex: 1,
    },
    container: {
        ...margin(16, 16, 0, 16),
        borderRadius: 6,
        padding: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
    },
    profilePhoto: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    infoContainer: {
        flex: 1,
        ...margin(0, 16),
    },
    post: {
        marginLeft: 64,
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        borderRadius: 6,
    },
    details: {
        flexDirection: 'row',
        marginTop: 8,
    },
    likes: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    comments: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16
    }
})

const zoomedImageStyles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        width: '100%',
        top: 20
    },
    text: {
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'black',
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 10,
    }

})