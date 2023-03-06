import { Platform, StyleSheet, TouchableOpacity, Text, TextInput, SafeAreaView, View } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import colors from "../../theme/colors"
import sharedStyles from '../../screens/Auth/sharedStyles'
import * as ImagePicker from 'expo-image-picker'
import DropDownPicker from 'react-native-dropdown-picker'
import useCommunityService from '../../hooks/api/communityService'
import useTagService from '../../hooks/api/tagService'
import usePostService from '../../hooks/api/postService'

const CreatePost = ({ isHome, communityName = "Community_Name" }) => {
    const communityService = useCommunityService()
    const tagService = useTagService()
    const postService = usePostService()

    const [text, setText] = useState('')
    const [media, setMedia] = useState('')
    const [mediaData, setMediaData] = useState({ URI: '', mediaName: '', type: '' })
    const [communityOpen, setCommunityOpen] = useState(false)
    const [communityItems, setCommunityItems] = useState([])
    const [tagItems, setTagItems] = useState([])

    const getCommunities = async () => {
        const community = await communityService.getSubscribedCommunities()
        setCommunityItems(community)
    }
    const getTags = async () => {
        const tag = await tagService.getTags()
        setTagItems(tag)
    }
    useEffect(() => {
        getCommunities()
        getTags()
    }, [])

    const [communityValue, setCommunityValue] = useState(null)
    const [tagOpen, setTagOpen] = useState(false)
    const [tagValue, setTagValue] = useState(null)

    const onCommunityOpen = useCallback(() => {
        setTagOpen(false)
    }, [])

    const onTagOpen = useCallback(() => {
        setCommunityOpen(false)
    }, [])

    const handleMediaUpload = async (res) => {
        if (res.canceled) return;
        setMedia(res.assets[0].uri)
        setMediaData({ URI: res.assets[0].uri, mediaName: res.assets[0].fileName, type: res.assets[0].type })
    }

    const handleCreate = async () => {
        const res = await postService.createPost(media)
        console.log(res)
    }

    const handleCameraUpload = async () => {
        const res = await ImagePicker.launchCameraAsync({ mediaType: "mixed" })
        handleMediaUpload(res)
    }

    const handleGalleryUpload = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({ mediaType: "mixed" })
        handleMediaUpload(res)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={sharedStyles.titleText}>Enter Text</Text>
                <TextInput
                    style={styles.inputArea}
                    placeholder="Start Typing..."
                    multiline
                    value={text}
                    onChangeText={t => setText(t)}
                />
                <Text style={sharedStyles.titleText}>Upload</Text>
                <View style={styles.uploadContainer}>
                    {Platform.OS !== 'web' && <TouchableOpacity style={styles.button} onPress={handleCameraUpload}>
                        <Text style={sharedStyles.buttonText}>From Camera</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity style={styles.button} onPress={handleGalleryUpload}>
                        <Text style={sharedStyles.buttonText}>From Gallery</Text>
                    </TouchableOpacity>
                </View>
                {isHome && <Text style={sharedStyles.titleText}>Select Community</Text>}
                {isHome && <DropDownPicker
                    disabled={!isHome}
                    placeholder={isHome ? 'Select Communities' : communityName}
                    multiple={isHome}
                    mode="BADGE"
                    open={communityOpen}
                    items={communityItems}
                    value={communityValue}
                    onOpen={onCommunityOpen}
                    setOpen={setCommunityOpen}
                    setItems={setCommunityItems}
                    schema={{ label: 'name', value: 'communityId' }}
                    setValue={setCommunityValue}
                    closeOnBackPressed
                    zIndex={3000}
                    zIndexInverse={1000}
                />}
                {/* <TextInput
                    style={sharedStyles.input}
                    placeholder="Select Community"
                    // value={community}
                    // onChangeText={t => setCommunityText(t)}
                /> */}
                <Text style={sharedStyles.titleText}>Select Tags</Text>
                <DropDownPicker
                    placeholder='Select Tags'
                    mode="BADGE"
                    multiple
                    searchable
                    open={tagOpen}
                    items={tagItems}
                    value={tagValue}
                    onOpen={onTagOpen}
                    setOpen={setTagOpen}
                    setItems={setTagItems}
                    schema={{ label: 'tag', value: '_id' }}
                    setValue={setTagValue}
                    closeOnBackPressed
                    zIndex={1000}
                    zIndexInverse={3000}
                />
                <TouchableOpacity style={sharedStyles.button} onPress={handleCreate}>
                    <Text style={sharedStyles.buttonText}>Create</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default CreatePost

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 25,
        alignSelf: 'center',
        width: Platform.OS == "web" ? "30%" : "100%",
        minWidth: Platform.OS == "web" ? 500 : "auto"
    },
    topContainer: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        marginVertical: 40
    },
    uploadContainer: {
        display: 'flex',
        alignItems: 'center',
        // flex: 0.5,
        flexDirection: 'row'
    },
    button: {
        backgroundColor: colors.primary,
        height: 40,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        marginTop: 20
    },
    inputArea: {
        height: Platform.OS == "web" ? '50%' : '30%',
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 12.5,
        width: '100%',
        padding: 10,
        marginBottom: 20,
        borderColor: colors.tertiary
    }
})