import React, { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Dimensions } from 'react-native'
import { AntDesign, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons'
import colors from '../../theme/colors'
import Scrollbars from 'react-custom-scrollbars'
import useAuthService from '../../hooks/api/authService'
import { useSelector } from 'react-redux'
import HoverableOpacity from '../../components/HoverableOpacity'

const RenderCommunityItem = ({ item }) => {

  return <HoverableOpacity activeOpacity={0.7} hoverStyle={{ backgroundColor: colors.primary, borderRadius: 10 }} outerStyle={{}} onPress={item.onPress} style={{ flexDirection: 'row', marginLeft: 20, height: 50, alignItems: 'center', }}>
    {(typeof item.icon !== "string") ? (item.icon)() : <Image source={{ uri: item.icon }} style={{ height: '90%', aspectRatio: 1 }} />}
    <Text style={{ textTransform: 'uppercase', marginLeft: 20, fontSize: 16 }}>{item.title}</Text>
  </HoverableOpacity>
}

const LeftSidebar = ({ navigation }) => {
  const initialList = [
    { id: 0, title: "Announcements", onPress: () => { navigation.navigate('Announcement') }, icon: () => <Entypo name="megaphone" size={24} color='black' /> },
    { id: 1, title: "Settings", onPress: () => { navigation.navigate('Settings') }, icon: () => <Ionicons name="settings" size={24} color='black' /> },
  ]

  const [isExpanded, setIsExpanded] = useState(false)
  const [communities, setCommunities] = useState(initialList)

  const authService = useAuthService();
  const user = useSelector(state => state.auth.user)

  const logout = () => {
    authService.logout()
  }

  return (
    <View style={{ height: '100%', flex: 1, flexDirection: 'column' }}>
      <View style={{ marginBottom: 20, flexDirection: 'row' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 24, }}>Auxilium</Text>
      </View>
      <View style={{ flex: 1, }}>
        <Scrollbars>
          <FlatList style={{
            flex: 1
          }} data={communities} renderItem={RenderCommunityItem}
            keyExtractor={item => item.id}
          />
        </Scrollbars>
      </View>
      <View style={{ bottom: 0, justifyContent: 'flex-end', }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AntDesign name="user" size={30} color="black" style={{ marginRight: 20 }} />
            <View>
              <Text style={{ fontWeight: '600', fontSize: 18 }}>{user.name ? user.name : "User"}</Text>
              <Text>{user.graduationYear ?? user.graduationYear}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout}>
            <MaterialIcons name="logout" size={24} color='black' />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default LeftSidebar
