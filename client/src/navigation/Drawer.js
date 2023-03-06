import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Text } from "react-native";

const CustomDrawer = ({ navigation, ...props }) => {
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
    </DrawerContentScrollView>
}
export default CustomDrawer;