import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import Feed from '../../components/Feed';

const Discover = ({ navigation, isCommunityFeed = true }) => {

    return (
        <>
            <Feed navigation={navigation} isCommunityFeed={isCommunityFeed} />
        </>
    )
}

export default Discover

const styles = StyleSheet.create({})