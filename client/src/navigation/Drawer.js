import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Button, Text } from "react-native";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/reducers/authSlice";

const CustomDrawer = ({ navigation, ...props }) => {

    const dispatch = useDispatch();

    const logout = () => {
        dispatch(logoutUser())
    }

    const getMockCommunities = () => {
        const length = 20;
        const communities = [];
        for (let i = 0; i < length; i++)
            communities.push({ name: `Community ${i + 1}`, id: i + 1, action: () => { navigation.navigate("Community") } })
        return communities;
    }
    const communities = getMockCommunities();

    return <DrawerContentScrollView {...props}>
        <Text>Your Communities</Text>
        {communities.map(community => <DrawerItem label={community.name} key={community.id} onPress={community.action} />)}
        <Button title="Logout" onPress={logout} />
    </DrawerContentScrollView>
}
export default CustomDrawer;