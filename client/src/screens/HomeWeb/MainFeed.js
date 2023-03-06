import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Feed from '../../components/Feed'

import feedData from '../../dummy-data/feedData'

const MainFeed = ({ navigation }) => {
    return (
        <View style={{ flex: 1, }}>
            <Feed feedData={feedData} navigation={navigation} />
        </View>
    )
}

export default MainFeed

const styles = StyleSheet.create({})
