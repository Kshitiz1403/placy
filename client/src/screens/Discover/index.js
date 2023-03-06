import { StyleSheet, Text, View, Button } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/reducers/authSlice';
import useAuthService from '../../hooks/api/authService';
import Feed from '../../components/Feed';

import feedData from '../../dummy-data/feedData'

const Discover = ({ navigation }) => {

    const authService = useAuthService();
    const [tokenFromStorage, setTokenFromStorage] = useState('')
    AsyncStorage.getItem('@token').then(token => setTokenFromStorage(token));

    const dispatch = useDispatch();

    return (<View style={{ flex: 1 }}>
        <Feed feedData={feedData} navigation={navigation} />
        <Text>token from store {authService.token}</Text>
        <Text>token from storage {tokenFromStorage}</Text>
        <Button title='Logout' onPress={() => dispatch(logoutUser())} />
    </View>)
}

export default Discover

const styles = StyleSheet.create({})
