import { StyleSheet } from 'react-native'
import React from 'react'
import CreatePost from '../../components/CreatePost'

const CreatePostHome = ({ route }) => {
    const isHome = JSON.parse(route.params.isHome)
    const communityName = route.params.communityName
    return (
        <>
            <CreatePost isHome={isHome} communityName={communityName} />
        </>
    )
}

export default CreatePostHome

const styles = StyleSheet.create({})