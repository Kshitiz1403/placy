const config = {
    screens: {
        Auth: {
            path: "auth"
        },
        Forgot: {
            path: "forgot"
        },
        Verification: {
            path: "verify"
        },
        Home: {
            path: ""
        },
        Announcement: {
            path: "announcements"
        },
        Settings: {
            path: "settings"
        },
        Post: {
            path: "post/:id"
        },
        ReactToPost: {
            path: "react",
        }
    }
}

const linking = {
    prefixes: ["demo://app"],
    config
}

export default linking;