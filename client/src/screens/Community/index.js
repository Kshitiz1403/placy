import { Image, Text, View, StyleSheet, Button } from "react-native";
import colors from "../../theme/colors";

const Community = ({ navigation }) => {

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.titleContainer}>
                <View>
                    <Image source={{ uri: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80" }} style={styles.image} />
                    <Text style={styles.title}>Community Title</Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <Text style={styles.joinButton}>Join</Text>
                </View>
            </View>
            <Text style={styles.description}>Proident sunt velit eiusmod aute pariatur officia ad amet consectetur. Ea ad aliquip pariatur anim officia adipisicing. Occaecat occaecat tempor eiusmod aliqua ea cupidatat dolore. Nisi sint consectetur consequat sint enim enim. Esse laboris incididunt consectetur tempor amet dolore. Pariatur quis excepteur officia reprehenderit labore ut irure id. Ut ad Lorem dolore id cillum laboris proident.</Text>
            <Text style={styles.membersWrapper}><Text style={styles.members}>{numberWithCommas(1000)}</Text> Members</Text>
            {/* <Button title="Create Post" onPress={navigation.navigate('CreatePost', { isHome: false, communityName: "CommunityTitle" })} /> */}
        </View>
    )
}

export default Community

const styles = StyleSheet.create({
    wrapper: {
        padding: 20, paddingRight: 30, backgroundColor: '#fff', marginBottom: 10
    },
    titleContainer: { flexDirection: 'row', justifyContent: 'space-between', },
    image: { height: 100, width: 100, borderRadius: 100 },
    title: { fontWeight: 'bold', marginTop: 5 },
    buttonWrapper: { flexDirection: 'row', alignItems: 'center' },
    joinButton: { backgroundColor: colors.primary, padding: 5, paddingHorizontal: 20, borderRadius: 20, fontWeight: '600', color: 'white' },
    description: { marginTop: 10 },
    membersWrapper: { marginTop: 10 },
    members: { fontWeight: 'bold' }
})