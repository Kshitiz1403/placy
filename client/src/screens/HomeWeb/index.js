import { View } from "react-native";
import LeftSidebar from "./LeftSidebar";
import MainFeed from "./MainFeed";
import RightSidebar from "./RightSidebar";

const Home = ({ navigation }) => {

    return (
        <View style={{ flex: 1, flexDirection: "row", overflow: 'hidden', }}>
            <View style={{ flex: 0.2, padding: 20, paddingTop: 10, }}>
                <LeftSidebar navigation={navigation} />
            </View>
            <View style={{ flex: 0.55, paddingHorizontal: 20, paddingVertical: 10, paddingTop: 10, backgroundColor: '#ebecf3', }}>
                <MainFeed />
            </View>
            <View style={{ flex: 0.25, backgroundColor: "yellow", padding: 20, paddingRight: 50, paddingTop: 10 }}>
                <RightSidebar />
            </View>
        </View>
    )
}

export default Home