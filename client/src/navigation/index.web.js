import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native/"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch, useSelector } from "react-redux";
import { Entypo, Ionicons } from "@expo/vector-icons";
import Auth from "../screens/Auth"
import useAuthService from "../hooks/api/authService";
import linking from "./linking";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import VerifyPassword from "../screens/Auth/VerifyPassword";
import Home from "../screens/HomeWeb";
import Settings from "../screens/Settings";
import Announcements from "../screens/Announcements";
import Post from "../screens/Post";
import ReactToPost from "../screens/ReactToPost";


const Routes = () => {

    const isLoading = useSelector(state => state.auth.isLoading);
    const isSignedIn = useSelector(state => state.auth.isLoggedIn);
    const AuthStack = createNativeStackNavigator();
    const HomeStack = createNativeStackNavigator();

    const authService = useAuthService()

    const dispatch = useDispatch()

    useEffect(() => {
        authService.getUserFromToken()
    }, [])

    const AuthStackScreens = () => (
        <AuthStack.Navigator screenOptions={{ animation: "slide_from_right" }}>
            <AuthStack.Screen name="Auth" component={Auth} />
            <AuthStack.Screen name="Forgot" component={ForgotPassword} />
            <AuthStack.Screen name="Verification" component={VerifyPassword} />
        </AuthStack.Navigator>
    )

    const HomeWebStackScreens = () => (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home" component={Home} />
            <HomeStack.Screen name="Announcement" component={Announcements} />
            <HomeStack.Screen name="Settings" component={Settings} />
            <HomeStack.Screen name="Post" component={Post} />
            <HomeStack.Screen name="ReactToPost" component={ReactToPost} options={({ route }) => ({ title: route.params.title })} />
        </HomeStack.Navigator>
    )

    return (
        <SafeAreaProvider>
            <NavigationContainer linking={linking}>
                <View style={{ flex: 1 }}>
                    {
                        isLoading &&
                        <View style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', }}>Loading....</Text>
                        </View>
                    }
                    {!isLoading && !isSignedIn && <AuthStackScreens />}
                    {!isLoading && isSignedIn && <HomeWebStackScreens />}
                </View>
            </NavigationContainer>
        </SafeAreaProvider>
    )
}

export default Routes